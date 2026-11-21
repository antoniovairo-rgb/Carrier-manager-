#!/usr/bin/env node
/* SONDA giro 301 — FLUSSO VERO. Partite vere (provino, nomi diversi = partite diverse), highlight armati dalla coda reattiva; a ogni
   scelta si prende un'azione da GOL (di preferenza «Piazzato nell'angolo basso») e la si fa FALLIRE (__CPM_FORCE_OUTCOME='fail': il tipo
   d'esito lo decide il gioco). Si aspetta l'USCITA da hl_result, poi si chiede al RILEVATORE DEL GIOCO (draftBugNote, contesto preso
   da __CPM_BUGCTX dentro la scena) e si analizza il pallone per fotogramma (__CPM_PA457).
     CPM_PAGINE=4 · CPM_SCENE=12 (per pagina) · CPM_GLB=1 · CPM_ROSSO=__CPM_NO_G301 · CPM_OK=1 (azioni riuscite: controprova dei gol) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { analizza, LINEA, PALI, TRAVERSA } from './misura-301.mjs';
const PAG = +(process.env.CPM_PAGINE || 4), NSC = +(process.env.CPM_SCENE || 12), GLB = process.env.CPM_GLB === '1', ROSSO = process.env.CPM_ROSSO || '', OK = !!process.env.CPM_OK;
const NOMI = ['Vairo', 'Brenno', 'Kessler', 'Olmo', 'Dario', 'Ruben', 'Tobia', 'Ilario'];
const srv = await startServer(), port = srv.address().port, b = await launchBrowser();
const fase = p => p.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
async function pagina(pi) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(() => { setInterval(() => { try { if (window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_move') { document.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true })); window.dispatchEvent(new KeyboardEvent('keydown', { key: '0' })); } } catch (e) {} }, 700); });
  await page.addInitScript(([r, g]) => { window.__CPM_GLB = !!g; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REALWAIT = 1; if (r) window[r] = 1; }, [ROSSO, GLB]);
  const out = [];
  try { await openMatch(page, port, { skipLoadAll: true, name: NOMI[pi % NOMI.length] }); await sleep(700);
    let secchi = 0, giri = 0;
    while (out.length < NSC && giri++ < NSC * 12) {
      const f = await fase(page);
      if (f === 'ended' || f == null) break;
      if (f !== 'playing' && !/^hl_/.test(f)) { await sleep(600); if (++secchi > 40) break; continue; }
      if (f === 'playing') await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
      const got = await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 40000 }).then(() => true).catch(() => false);
      if (!got) { if (++secchi > 6) break; continue; } secchi = 0;
      const sc = await page.evaluate(() => { const acts = (window.__CPM_ACTSO && window.__CPM_ACTSO()) || []; const c = window.__CPM_BUGCTX ? window.__CPM_BUGCTX() : {}; return { acts, sit: c.sit, gi: c.gi, intent: c.intent, min: c.min }; });
      const A = sc.acts.filter(a => /goal/.test(String(a.rew || '')));
      const a = A.find(q => /Piazzato/.test(q.label)) || A[0];
      if (!a) { await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {}); await page.waitForFunction(() => window.__CPM_PHASE && !/^hl_(choose|result)/.test(window.__CPM_PHASE()), null, { timeout: 40000 }).catch(() => {}); continue; }
      await page.evaluate(ok => { window.__CPM_PA457 = []; window.__CPM_FORCE_OUTCOME = ok ? 'success' : 'fail'; }, OK);
      await page.evaluate(k => window.__CPM_RESOLVE(k), a.i);
      let o = null; for (let i = 0; i < 50 && !o; i++) { o = await page.evaluate(() => { const q = window.__CPM_OUTCOME; return q ? { key: q.outKey || null, kind: q.outKind || null, ok: !!q.ok } : null; }).catch(() => null); if (!o) await sleep(80); }
      /* dentro la scena: il contesto come lo prende il tasto ⚠️ (rinfrescato finche' la fase e' hl_result) */
      let ctx = null; const t0 = Date.now();
      while (Date.now() - t0 < 90000) { const c = await page.evaluate(() => (window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_result' && window.__CPM_BUGCTX) ? window.__CPM_BUGCTX() : null).catch(() => null); if (c) ctx = c; else break; await sleep(150); }
      await sleep(450);/* i 320 ms di coda che il rilevatore concede */
      const d = await page.evaluate(c => { const snap = (window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP()) || null; let bz = null; try { bz = (snap && c) ? draftBugNote(snap, c) : null; } catch (e) { bz = 'ERR ' + e.message; }
        const WS = ['—', 'scena', 'arco', 'inseguitore', 'portatore', 'addosso', 'palo', 'respinta', 'ricevente-cross', 'ricevente-pass', 'consegna', 'buildup-aereo', 'buildup-fine', 'buildup-volo', 'testa'];
        const S = snap && c ? snap.samples.filter(q => q.sk === c.sceneKey) : []; const den = S.filter(q => q.x >= 48.6 && Math.abs(q.z) <= 3.66 && q.y <= 2.44);
        const ALL = snap ? snap.samples : [], vic = []; if (c) for (let i = 0; i < ALL.length; i++) { const q = ALL[i]; if (q.sk === c.sceneKey && q.x >= 48.6 && Math.abs(q.z) <= 3.66 && q.y <= 2.44) { for (let j = Math.max(0, i - 8); j <= Math.min(ALL.length - 1, i + 8); j++) vic.push([j === i ? '>>' : '  ', Math.round(ALL[j].t), +ALL[j].x.toFixed(2), +ALL[j].y.toFixed(2), +ALL[j].z.toFixed(2), 'f' + ALL[j].f, 'ws' + ALL[j].ws, 'sk' + ALL[j].sk].join(' ')); vic.push('--'); if (vic.length > 120) break; } }
        return { vic, sk: c ? c.sceneKey : null, pa: (window.__CPM_PA457 || []).slice(), bz, nS: S.length, den: den.length, ws: [...new Set(den.map(q => (WS[q.ws | 0] || '?' + q.ws) + '/f' + q.f))], hl: den.filter(q => (q.f & 8) !== 0).length }; }, ctx);
      const r = { pi, sit: sc.sit, act: a.label, min: sc.min, out: o, A: analizza(d.pa), bozzaRete: /finita IN RETE/.test(String(d.bz || '')), bozza: d.bz, den: d.den, denHl: d.hl, ws: d.ws, ht: d.pa[0] && d.pa[0].ht, seq: [...new Set(d.pa.map(q => (q.arc ? 'A' : '') + (q.pt || '-')))].join('>') };
      r.pa = d.pa; out.push(r);
      const c = r.A.cross;
      console.log(`  ${r.A.inRete || r.bozzaRete || r.den ? '🥅' : '· '} p${pi} ${String(sc.min).padStart(2)}' ${String(r.ht).padEnd(8)} ${String(o && o.key).padEnd(9)} ${String(o && o.kind).padEnd(11)} maxX ${r.A.maxX.toFixed(1).padStart(5)} ${c ? `linea z ${c.z} y ${c.y} ${r.A.fraPali ? 'FRA I PALI' : 'fuori'} (${c.arc ? 'arco' : ''}${c.pt || ''})` : 'linea no'} · dentro: esito ${r.A.dentroN} fot., scena ${r.den} camp. (${r.denHl} in fase hl) ${r.ws.join(',')}${r.bozzaRete ? ' · RILEVATORE «IN RETE»' : ''} · ${r.seq} · «${String(sc.sit).slice(0, 34)}» → «${a.label}»`);
      if (d.vic && d.vic.length && !/goal|assist/.test(String(o && o.key))) console.log('     sk ' + d.sk + ' fase ora ' + (await fase(page)) + '\n     ' + d.vic.join('\n     '));
      await page.waitForFunction(() => window.__CPM_PHASE && !/^hl_result/.test(window.__CPM_PHASE()), null, { timeout: 30000 }).catch(() => {});
    }
  } catch (e) { console.log(`  ?? p${pi}: ${String(e.message || e).slice(0, 140)}`); }
  await page.close().catch(() => {}); return out;
}
const SOLO = process.env.CPM_SOLO_PAG;
const tutti = (await Promise.all((SOLO ? SOLO.split(',').map(Number) : Array.from({ length: PAG }, (_, i) => i)).map(i => pagina(i)))).flat();
await b.close(); srv.close();
const ng = tutti.filter(r => r.out && !/goal/.test(String(r.out.key)));
console.log(`\nflusso vero · ${tutti.length} azioni · non-gol ${ng.length} · pallone dentro la porta nella finestra d'esito: ${ng.filter(r => r.A.inRete).length} · dentro la porta in un campione della scena: ${ng.filter(r => r.den).length} · rilevatore «IN RETE»: ${ng.filter(r => r.bozzaRete).length}`);
const g = tutti.filter(r => r.out && /goal/.test(String(r.out.key))); if (g.length) console.log(`gol: ${g.length} · entrati: ${g.filter(r => r.A.inRete || r.den).length}`);
if (process.env.CPM_JSON) fs.writeFileSync(process.env.CPM_JSON, JSON.stringify(tutti));
