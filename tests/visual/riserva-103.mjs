#!/usr/bin/env node
/* [giro 103] GUARDIANO «la riserva dell'esito non scatta mai a conclusione in corsa» (highlight-95 D3 della catena 178, «Tiro a giro»:
   esito rivelato dalla riserva mentre il 3D mostrava ancora la conclusione).
   Il difetto e' una PRECEDENZA DI TEMPI: la riserva parte 2,6 s di PARETE dopo la risoluzione e conta il tetto in secondi DI SCENA. A
   fotogrammi lenti (dt tappato a 0,05) i 2,6 s di parete valgono meno scena, quindi il tetto dalla risoluzione scendeva da 8,6 s (30 fps)
   verso 6,3 s. Nel flusso vero lo si vede di rado (serve una conclusione lunga su una pagina lenta); qui lo si rende deterministico:
     · __CPM_BUSY103 = 8   il renderer dichiara la conclusione occupata per 8 s di scena dall'inizio di hl_result (solo sonde);
     · __CPM_G103SOLORISERVA   l'esito puo' arrivare solo dalla riserva (la scena non lo rivela da se');
     · rallentamento CPU di Chromium (CDP, CPM_CPU=4) per stare sotto i 15 fps, dove il vecchio tetto (scena trascorsa in 2,6 s + 6) e'
       minore di 8 s. Si stampa la scena trascorsa nei primi 2,6 s: se supera 2,0 il braccio rosso e' dichiarato NON giudicabile.
   Verde: l'esito arriva dalla riserva a conclusione FINITA (mai «occupata»). Rosso __CPM_NO_G103A (tetto contato dall'avvio della riserva,
   comportamento 7.999.178): l'esito arriva a conclusione in corsa. Scene: tiri forzati (CPM_G103_SCENE, default 17,4,1).
   Uso: node riserva-103.mjs  [CPM_ARMI=verde,rosso] [CPM_CPU=4] */
import fs from 'node:fs';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('/opt/pw-browsers')) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import('./lib/harness.mjs');
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const SCENE = (process.env.CPM_G103_SCENE || '17,4,1').split(',').map(Number);
const CPU = +(process.env.CPM_CPU || 4), BUSY = +(process.env.CPM_G103_BUSY || 8);
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const fase = p => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
async function braccio(arm) {
  const rosso = arm === 'rosso';
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([r, bz]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000; window.__CPM_BUSY103 = bz; window.__CPM_G103SOLORISERVA = 1; if (r) window.__CPM_NO_G103A = 1;
    window.__R103 = []; let cur = null; const f = () => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const c = window.__CPM_CB95 ? window.__CPM_CB95() : null;
      if (ph === 'hl_result' && c && typeof c.ck === 'number') { if (!cur) { cur = { ck0: c.ck, t0: performance.now(), n: (window.__CPM_REV95 || []).length, occ: null, rev: null }; window.__R103.push(cur); }
        if (c.on && (c.tl || c.arc)) cur.occ = c.ck; if (cur.c26 == null && performance.now() - cur.t0 >= 2600) cur.c26 = c.ck - cur.ck0;
        if (cur.rev == null && (window.__CPM_REV95 || []).length > cur.n) { cur.rev = c.ck - cur.ck0; cur.revMs = performance.now() - cur.t0; cur.rv = window.__CPM_REV95[window.__CPM_REV95.length - 1]; } } else cur = null; } catch (e) {} requestAnimationFrame(f); }; requestAnimationFrame(f); }, [rosso, BUSY]);
  await openMatch(page, port, { name: 'Riserva Centotre' });
  if (CPU > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU }); }
  const cat = await page.evaluate(() => SITUATIONS.map(s => (s.actions || []).map(a => { let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {} return h.type || null; })));
  const out = [];
  /* riscaldamento: la PRIMA scena forzata su pagina nuova non arriva mai all'esito in nessuno dei due bracci (misurato: 4 su 4), quindi
     se ne gioca una a vuoto prima di misurare */
  for (const gi of [-1, ...SCENE]) { const warm = gi < 0; const g0 = warm ? SCENE[0] : gi; const k = Math.max(0, cat[g0].findIndex(t => t === 'shot'));
    await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = 'wide'; });
    if (!await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), g0).catch(() => false)) { out.push({ gi, ko: 'forzatura' }); continue; }
    const t0 = Date.now(); while (Date.now() - t0 < 15000 && (await fase(page)) !== 'hl_choose') await sleep(150);
    const n0 = await page.evaluate(() => window.__R103.length);
    if (!await page.evaluate(kk => window.__CPM_RESOLVE(kk), k).catch(() => false)) { out.push({ gi, ko: 'risoluzione' }); continue; }
    const t1 = Date.now(); let r = null; while (Date.now() - t1 < (warm ? 60000 : 160000)) { r = await page.evaluate(n => window.__R103.slice(n).find(x => x.rev != null) || null, n0).catch(() => null); if (r && r.rev != null) break; await sleep(300); }
    if (warm) continue;
    if (!r || r.rev == null) { out.push({ gi, ko: 'esito mai rivelato in 160 s' }); continue; }
    const busy = !!(r.rv && r.rv.busy); out.push({ gi, via: r.rv && r.rv.via, cap: r.rv && r.rv.cap, busy, rev: +r.rev.toFixed(2), revMs: Math.round(r.revMs), c26: r.c26 != null ? +r.c26.toFixed(2) : null });
    const o = out[out.length - 1]; console.log(`  ${arm} gi${gi}: esito a ${o.rev} s di scena (${o.revMs} ms) via ${o.via}${o.cap ? '+' + o.cap : ''} ${busy ? 'a CONCLUSIONE IN CORSA' : 'a conclusione finita'} · scena nei primi 2,6 s ${o.c26}`);
  }
  out.filter(x => x.ko).forEach(x => console.log(`  ${arm} gi${x.gi}: ✗ ${x.ko}`));
  await ctx.close(); return out;
}
const R = {}; for (const a of ARMI) R[a] = await braccio(a);
await browser.close(); srv.close();
const g = [];
if (R.verde) { const ok = R.verde.filter(x => !x.ko && /^(riserva|chiusura)$/.test(x.via) && x.cap !== 'parete');/* in verde puo' arrivare prima la chiusura della finestra: stesso tetto, stessa regola */ if (ok.length < 2) g.push(`verde cieco: ${ok.length} scene giudicate`);
  const male = ok.filter(x => x.busy); if (male.length) g.push(`verde: ${male.length} esiti rivelati a conclusione in corsa`); console.log(`VERDE scene giudicate ${ok.length}/${R.verde.length} · a conclusione in corsa ${male.length}`); }
if (R.rosso) { const ok = R.rosso.filter(x => !x.ko && x.via === 'riserva' && x.cap !== 'parete' && x.c26 != null && x.c26 <= 2.0); if (ok.length < 2) g.push(`rosso non giudicabile: ${ok.length} scene lente a sufficienza`);
  const visti = ok.filter(x => x.busy); if (ok.length >= 2 && visti.length < ok.length) g.push(`rosso: il difetto si vede solo su ${visti.length}/${ok.length}`); console.log(`ROSSO scene giudicate ${ok.length}/${R.rosso.length} · a conclusione in corsa ${visti.length}`); }
if (g.length) { console.log('✗ riserva-103 ROSSO'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✓ riserva-103 VERDE' + (R.rosso ? ' (e il rosso si vede)' : '')); process.exit(0);
