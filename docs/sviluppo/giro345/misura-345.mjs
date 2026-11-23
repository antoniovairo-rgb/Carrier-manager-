#!/usr/bin/env node
/* [giro 345 PO-376] STRUMENTO, non guardiano (la sonda del giro 324, stessa misura: bracci verde e CPM_FLAGS=__CPM_NO_G345). «Negli highlight non vedo da molto azioni che partono dalle fasce»: quante scene
   dell'eroe partono davvero dalla fascia? Flusso vero (salvataggi s1/s5/s12 x semi; il nome cambia col seme, quindi cambia la
   partita), pilota 'mano': a ogni scelta aperta la sonda annota la scena e sceglie l'opzione (seme+indice)%n.
   Per ogni scena dell'eroe:
     - testo e tipo della scheda (__CPM_CURSIT), tipo d'occasione del motore (__CPM_P6, cercato per testo);
     - posizione LOGICA dell'eroe all'apertura della scelta (__CPM_PPOS): corsia = |y-50|.
   «Di fascia» si conta in tre modi, dichiarati a parte:
     F1 tipo del motore 'fascia' (eroe sulla trequarti a 22 o piu' dal centro: la soglia del motore);
     F2 eroe largo all'avvio (|y-50| >= 22), qualunque sia il tipo;
     F3 cross/angolo di un compagno verso l'eroe (l'azione parte dalla fascia, l'eroe e' in area).
   CPM_RUOLO=<testo> scrive player.position nel salvataggio (per provare se il ruolo cambia qualcosa).
   CPM_FLAGS (bracci), CPM_SALVA, CPM_SEMI, CPM_PAR, CPM_OUT, CPM_TMAX, CPM_STALLO. Si attende l'evento (fase), mai un tempo fisso.
   Per eseguirlo: copiarlo in tests/visual/ (non sta li' perche' un file che nessuna riga della mappa copre fa girare il treno completo). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const FLAGS = (process.env.CPM_FLAGS || '').split(',').filter(Boolean);
const SEMI = (process.env.CPM_SEMI || '1,2,3,4,5,6').split(',').map(Number);
const SAVES = (process.env.CPM_SALVA || 's1,s5,s12').split(',');
const RUOLO = process.env.CPM_RUOLO || '';
const PAR = +(process.env.CPM_PAR || 3), OUT = process.env.CPM_OUT || 'out/misura-345.json';
const TMAX = +(process.env.CPM_TMAX || 900000), STALLO = +(process.env.CPM_STALLO || 240000);
const LARGO = 22;
export const classe324 = (r) => {
  const tipo = r.p6 ? r.p6.tipo : null; const dy = r.pp ? Math.abs(+r.pp.y - 50) : null;
  return { f1: tipo === 'fascia', f2: dy != null && dy >= LARGO, f3: tipo === 'cross' || tipo === 'angolo' || (!tipo && /cross|angolo|corner/i.test(r.t || '')) };
};
const srv = await startServer(); const b = await launchBrowser();
async function gioca(sk, sd) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const raw = FX(SALVA[sk]); let ls;
  const ritocca = (sv) => { const p = sv.player || sv; p.name += ' ' + sd; if (RUOLO) p.position = RUOLO; return sv; };
  if (raw['cpm-v3']) { ls = { ...raw }; ls['cpm-v3'] = JSON.stringify(ritocca(JSON.parse(ls['cpm-v3']))); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else ls = { 'cpm-v3': JSON.stringify(ritocca(JSON.parse(JSON.stringify(raw)))) };
  ls['cpm-match-speed'] = '2';
  await page.addInitScript(([s, arm]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000;
    for (const f of arm) window[f] = 1; for (const k in s) { try { localStorage.setItem(k, s[k]); } catch (e) {} } }, [ls, FLAGS]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 90000 });
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'mano', tickMs: 150 }), sd);
  const t0 = Date.now(), fatte = {}, log = []; let prog = '', tProg = t0, chiusa = 'tetto', mMax = 0;
  while (Date.now() - t0 < TMAX) {
    const st = await page.evaluate(() => ({ ph: window.__CPM_PHASE(), c: window.__CPM_CURSIT(), a: window.__CPM_ACTS ? window.__CPM_ACTS() : [], m: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null,
      pp: window.__CPM_PPOS ? window.__CPM_PPOS() : null, p6: (window.__CPM_P6 || []).slice(-3) })).catch(() => null);
    if (!st) { chiusa = 'pagina'; break; } if (st.m > mMax) mMax = st.m; if (st.ph === 'ended' || st.ph === 'ceremony') { chiusa = 'fine'; break; }
    const k = st.ph + '|' + st.m + '|' + (st.c ? st.c.i : ''); if (k !== prog) { prog = k; tProg = Date.now(); } else if (Date.now() - tProg > STALLO) { chiusa = 'stallo'; break; }
    if (st.ph === 'hl_choose' && st.c && !fatte[st.c.i] && st.a.length) {
      const k2 = (sd + st.c.i) % st.a.length;
      const ok = await page.evaluate((k) => { const R = window.__CPM_RESEED; window.__CPM_RESEED = undefined; try { return window.__CPM_RESOLVE(k); } finally { window.__CPM_RESEED = R; } }, k2);
      fatte[st.c.i] = 1; const p6 = [...st.p6].reverse().find(q => String(q.text || '').slice(0, 60) === st.c.t) || null;
      log.push({ i: st.c.i, t: st.c.t, type: st.c.type, def: st.c.def, intent: st.c.intent, gi: st.c.gi, scelta: st.a[k2], ok, min: st.m,
        pp: st.pp ? { x: +(+st.pp.x).toFixed(1), y: +(+st.pp.y).toFixed(1) } : null, p6: p6 ? { tipo: p6.tipo, x: p6.x, y: p6.y, min: p6.min } : null });
    }
    await sleep(100);
  }
  await ctx.close();
  return { sk, sd, chiusa, mMax, s: Math.round((Date.now() - t0) / 1000), righe: log };
}
const lavori = []; for (const sk of SAVES) for (const sd of SEMI) lavori.push({ sk, sd });
const fatti = []; let p = 0;
await Promise.all(Array.from({ length: Math.min(PAR, lavori.length) }, async () => { while (p < lavori.length) { const i = p++;
  try { fatti[i] = await gioca(lavori[i].sk, lavori[i].sd); } catch (e) { fatti[i] = { ...lavori[i], err: String(e).slice(0, 160), righe: [] }; }
  const f = fatti[i]; console.log(`${f.sk} seme ${f.sd} (${f.chiusa || 'err'}, ${f.s || '-'} s, ${f.mMax || '-'}') scene ${f.righe.length}${f.err ? ' ERR ' + f.err : ''}`);
  for (const r of f.righe) { const c = classe324(r); console.log(`  ${String(r.min).padStart(2)}' ${(r.p6 ? r.p6.tipo : (r.def ? 'difesa*' : 'scheda')).padEnd(13)} x ${r.pp ? r.pp.x : '-'} y ${r.pp ? r.pp.y : '-'} ${c.f1 ? 'F1 ' : ''}${c.f2 ? 'F2 ' : ''}${c.f3 ? 'F3 ' : ''}| ${r.t}`); } } }));
await b.close(); srv.close();
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync(OUT, JSON.stringify({ flags: FLAGS, ruolo: RUOLO, fatti }, null, 1));
const riga = (nome, F) => { const R = F.flatMap(f => f.righe); const n = R.length, C = R.map(classe324); const q = (k) => C.filter(c => c[k]).length;
  const tipi = {}; for (const r of R) { const t = r.p6 ? r.p6.tipo : (r.def ? 'difesa*' : 'scheda'); tipi[t] = (tipi[t] || 0) + 1; }
  const fin = F.filter(f => f.chiusa === 'fine').length; const pc = (v) => n ? (100 * v / n).toFixed(1) + '%' : '-';
  const una = F.filter(f => f.righe.some(r => { const c = classe324(r); return c.f1 || c.f2; })).length;
  console.log(`${nome.padEnd(8)} partite ${F.length} (finite ${fin}) · scene ${n} (${(n / Math.max(1, F.length)).toFixed(1)}/partita) · F1 tipo fascia ${q('f1')} (${pc(q('f1'))}) · F2 eroe largo ${q('f2')} (${pc(q('f2'))}) · F3 cross/angolo verso l'eroe ${q('f3')} (${pc(q('f3'))}) · partite con almeno una scena F1/F2: ${una}/${F.length}`);
  console.log(`         tipi: ${Object.entries(tipi).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(' · ')}`); };
console.log(`\nmisura-345 ${FLAGS.join(',') || 'verde'}${RUOLO ? ' · ruolo ' + RUOLO : ''}`);
for (const sk of SAVES) riga(sk, fatti.filter(f => f && f.sk === sk)); riga('TUTTE', fatti.filter(Boolean));
const rotte = fatti.filter(f => !f || f.err || f.chiusa !== 'fine').length; if (rotte) console.log(`ATTENZIONE: ${rotte} partite non finite (non contano come misura piena)`);
