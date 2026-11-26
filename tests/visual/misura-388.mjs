#!/usr/bin/env node
/* [giro 388 PO-642] STRUMENTO DI MISURA (non guardiano): cosa succede in partita vera dopo la scheda del mister «ti indica di allargarti»
   (`eroe_marcato`, «Seguo le indicazioni»). Percorso di misura-226: save-194, playMatch, pilota seedato, velocita' 4, GLB spento,
   ?cpmtest=1, nomi diversi (= semi diversi), timer della scheda corto (1,5 s), opzione scelta = __CPM_INT226_IDX (CPM_IDX, default i%3).
   Ogni 200 ms: minuto, posizione dell'eroe NEL MOTORE (M._g[M.HERO]: x e |y-50|), schede uscite e scelte (registri 226 e 259),
   tipi d'occasione chiesti dalla partita (chiedi.scenaEroe intercettato) e occasioni dell'eroe.
   Uso: CPM_PARTITE=8 CPM_PAR=4 [CPM_ROSSI=__CPM_NO_SCHEDE259,...] [CPM_IDX=0] node misura-388.mjs
        → out/misura-388/misura-<CPM_ETICHETTA>.json e una sintesi a schermo */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_PARTITE || 8), PAR = +(process.env.CPM_PAR || 4), TETTO = +(process.env.CPM_TETTO_MS || 300000), OFF = +(process.env.CPM_DA || 0);
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'out', 'misura-388'); fs.mkdirSync(OUT, { recursive: true });
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const NOMI = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Galli', 'Conti', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Costa', 'Fontana', 'Moretti', 'Barbieri', 'Lombardi', 'Rinaldi', 'Caruso', 'Ferrara', 'Serra', 'Fabbri', 'Villa', 'Mancini', 'Longo'];
const ROSSO = process.env.CPM_ROSSI || '';
const IDX = process.env.CPM_IDX;
export async function partita388(b, port, i, o = {}) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Prova ' + NOMI[i % NOMI.length] + ' ' + i;
  await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_SCMS681 = 1500; window.__CPM_INT226_IDX = o.idx;
    for (const k of (o.rossi || '').split(',').filter(Boolean)) window[k] = 1;
    if (o.forza) window.__CPM_FORZA388 = o.forza;
    localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, idx: o.idx != null ? o.idx : i % 3, rossi: o.rossi != null ? o.rossi : ROSSO, forza: o.forza || null });
  const out = { i, nome: save.player.name, idx: o.idx != null ? o.idx : i % 3, finita: false, pos: {}, richieste: [], fine: null };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
    await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
    await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(() => { window.__CPM_RICH388 = []; const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ();
      if (M && M.chiedi && !M.chiedi._w388) { const f = M.chiedi.scenaEroe; M.chiedi.scenaEroe = function (on, tipo) { if (on) window.__CPM_RICH388.push({ min: window.__CPM_CLOCK && window.__CPM_CLOCK(), tipo: tipo || null }); return f.apply(this, arguments); }; M.chiedi._w388 = 1; } });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2590 + i * 37);
    const t1 = Date.now();
    while (Date.now() - t1 < TETTO) { await sleep(200);
      const d = await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const H = M && M._g && M._g[M.HERO];
        return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), ck: window.__CPM_CLOCK && window.__CPM_CLOCK(), hx: H ? +H.x : null, hy: H ? +H.y : null,
          ruolo: M && M._S ? (M._S.poss.padrone === M.HERO ? 'P' : M._S.inseguitore === M.HERO ? 'I' : M._S.poss.ricevente === M.HERO ? 'R' : M._S.poss.stato === 'fermo' ? 'F' : M._S.poss.lato === 'home' ? 'n' : 'l') : null }; });
      if (d.ck != null && d.hy != null && d.ph === 'playing') { const a = out.pos[d.ck] || (out.pos[d.ck] = []); a.push(Math.round(Math.abs(d.hy - 50) * 10) / 10); const r = out.ruoli || (out.ruoli = {}); (r[d.ck] = r[d.ck] || []).push(d.ruolo + Math.round(Math.abs(d.hy - 50))); }
      if (d.ph === 'ended' || d.ph === 'ceremony') { out.finita = true; break; }
      if (o.fino && d.ck != null && d.ck >= o.fino) break; }
    await sleep(500);
    Object.assign(out, await page.evaluate(() => ({ score: window.__CPM_SCORE && window.__CPM_SCORE(),
      s259: window.__CPM_S259 || { schede: [], scelte: [] }, i226: window.__CPM_INT226 || { schede: [], scelte: [] },
      richieste: window.__CPM_RICH388 || [], w388: (() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); return (M && M._S && M._S.w388) || null; } catch (e) { return null; } })() })));
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
/* larghezza media dell'eroe (|y-50|) nei minuti [m0, m1] */
export function largo388(p, m0, m1) { let s = 0, n = 0; for (const [k, v] of Object.entries(p.pos || {})) { const m = +k; if (m >= m0 && m <= m1) for (const y of v) { s += y; n++; } } return n ? s / n : null; }
if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const res = new Array(N); let next = 0;
  const lav = async () => { while (next < N) { const k = next++; const p = res[k] = await partita388(b, port, OFF + k, { idx: IDX != null ? +IDX : undefined });
    const sc = [...((p.i226 && p.i226.scelte) || []).map(s => ({ f: s.id, idx: s.idx, min: s.min })), ...((p.s259 && p.s259.scelte) || []).map(s => ({ f: s.fatto, idx: s.idx, min: s.min }))];
    const em = sc.find(s => s.f === 'eroe_marcato');
    const dopo = em ? largo388(p, em.min + 1, em.min + 10) : null, prima = em ? largo388(p, em.min - 10, em.min - 1) : null;
    const rDopo = em ? (p.richieste || []).find(r => r.min != null && r.min > em.min) : null;
    console.log(`p${OFF + k} ${p.finita ? 'finita' : 'NON FINITA'} ${JSON.stringify(p.score)} scelte=[${sc.map(s => s.min + "'" + s.f + '#' + s.idx).join(' ')}] largo tutta=${(largo388(p, 1, 90) || 0).toFixed(1)}` +
      (em ? ` · eroe_marcato#${em.idx} al ${em.min}': largo prima ${prima != null ? prima.toFixed(1) : '-'} dopo ${dopo != null ? dopo.toFixed(1) : '-'} · richiesta dopo: ${rDopo ? rDopo.min + "' " + rDopo.tipo : '-'}` : '') +
      `${p.errori.length ? ' ERR ' + p.errori[0] : ''}${p.errore ? ' ERRORE ' + p.errore : ''}`); } };
  await Promise.all(Array.from({ length: Math.min(PAR, N) }, lav));
  await b.close(); srv.close();
  const f = path.join(OUT, 'misura-' + (process.env.CPM_ETICHETTA || 'base') + '.json'); fs.writeFileSync(f, JSON.stringify(res, null, 1)); console.log('scritto ' + f);
}
