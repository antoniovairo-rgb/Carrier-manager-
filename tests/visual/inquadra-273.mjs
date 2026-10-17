#!/usr/bin/env node
/* [giro 53 — PO-273] SONDA dell'eroe in quadro negli highlight sul FLUSSO VERO (collaudo 7.999.171: «Volée di collo potente»,
   eroe fuori quadro in hl_choose, foto m2-hl_choose-3 e m4-hl_choose-2). Rigioca le partite del collaudo (stesso nome, stesso
   seme di autoplay, GLB acceso, teatro attivo, attesa reale) e registra ogni fotogramma (__CPM_FR73) di ogni scena con la sua
   fase. Per scena e per fase: quota di fotogrammi con l'eroe fuori dal quadro e altezza apparente mediana.
   Uso: CPM_PARTITE=2,4 node inquadra-273.mjs  ·  CPM_ROSSO=__CPM_NO_X per il braccio rosso  ·  --guardiano per giudicare. */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const PART = (process.env.CPM_PARTITE || '2,4').split(',').map(Number);
const ROSSO = process.env.CPM_ROSSO || '', TETTO = +(process.env.CPM_TETTO || 330000), FILTRO = process.env.CPM_FILTRO ? new RegExp(process.env.CPM_FILTRO, 'i') : null;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const scene = [];
for (const i of PART) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; if (r) r.split('+').forEach(k => window[k] = 1); }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Coll' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 1300 + i * 71);
  const t0 = Date.now(); let ph = null, cur = null;
  const chiudi = async () => { if (!cur) return; cur.fr = await page.evaluate(() => (window.__CPM_FR73 || []).slice()).catch(() => []); scene.push(cur); cur = null; };
  while (Date.now() - t0 < TETTO) {
    const p = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    if (p !== ph) {
      if (p === 'hl_intro') { await chiudi(); await page.evaluate(() => { window.__CPM_FR73 = []; }); cur = { p: i, ck: await page.evaluate(() => window.__CPM_CLOCK()), acts: null, sit: null }; }
      if (cur && (p === 'hl_choose' || p === 'hl_result')) { const d = await page.evaluate(() => ({ s: window.__CPM_CURSIT && window.__CPM_CURSIT(), a: (window.__CPM_ACTSO ? window.__CPM_ACTSO() : []).map(x => x.label) })).catch(() => ({}));
        if (d.s) cur.sit = d.s; if (d.a && d.a.length) cur.acts = d.a; }
      if (p === 'playing' || p === 'ended' || p === 'ceremony') await chiudi();
      ph = p; if (p === 'ended' || p === 'ceremony') break;
    }
    await sleep(100);
  }
  await chiudi(); if (errs.length) console.log('pageerror', errs.slice(0, 3)); await ctx.close();
}
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const fuori = f => Math.abs(f.ax) > 1 || Math.abs(f.ay) > 1;
const righe = [];
for (const s of scene) {
  const per = {}; for (const f of s.fr) { const k = f.ph || '?'; (per[k] = per[k] || []).push(f); }
  const vol = /vol[ée]e/i.test(JSON.stringify(s.acts || []) + (s.sit && s.sit.t || ''));
  const r = { p: s.p, ck: s.ck, gi: s.sit && s.sit.gi, t: s.sit && s.sit.t, vol, acts: (s.acts || []).join(' | ').slice(0, 90), fasi: {} };
  for (const [k, a] of Object.entries(per)) r.fasi[k] = { n: a.length, fuori: a.filter(fuori).length, h: med(a.map(x => x.h || 0)), d: med(a.map(x => Math.hypot(x.cx - x.hx, x.cz - x.hz))) };
  righe.push(r);
  console.log(`p${r.p} ${r.ck}' gi${r.gi} «${r.t}» ${vol ? '[VOLEE]' : ''} · ${Object.entries(r.fasi).map(([k, v]) => `${k} fuori ${v.fuori}/${v.n} h ${v.h} d ${v.d && v.d.toFixed(1)}`).join(' · ')}\n     azioni: ${r.acts}`);
}
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync('out/inquadra-273.json', JSON.stringify(scene));
/* Giudizio sulle fasi di PRESENTAZIONE (intro/move/scelta: in scelta il giro 3D registra 1-2 fotogrammi) delle scene AEREE (cross,
   corner: pallone lontano dall'eroe, la famiglia del collaudo). Le partite non sono identiche fra un giro e l'altro (tempo reale):
   si giudica la QUOTA sulla famiglia, mai una scena precisa. */
const AEREA = /cross|angolo|alto in area/i;
const pres = r => Object.entries(r.fasi).filter(([k]) => k !== 'hl_result').reduce((a, [, v]) => ({ n: a.n + v.n, f: a.f + v.fuori }), { n: 0, f: 0 });
const aer = righe.filter(r => AEREA.test(r.t || '') && pres(r).n >= 1);
const An = aer.reduce((a, r) => a + pres(r).n, 0), Af = aer.reduce((a, r) => a + pres(r).f, 0), Aq = An ? Af / An * 100 : null;
const altre = righe.filter(r => !AEREA.test(r.t || '')); const On = altre.reduce((a, r) => a + pres(r).n, 0), Of = altre.reduce((a, r) => a + pres(r).f, 0);
console.log(`PRESENTAZIONE scene aeree ${aer.length}: eroe fuori ${Af}/${An} fotogrammi (${Aq == null ? '-' : Aq.toFixed(1)}%) · altre scene ${Of}/${On} · h mediana aeree ${med(aer.map(r => (r.fasi.hl_intro || {}).h || 0))}`);
if (process.argv.includes('--guardiano')) {
  if (aer.length < 1 || An < 5) { console.log('❌ sonda cieca: nessuna scena aerea con almeno 5 fotogrammi di presentazione'); process.exit(2); }
  const MAXQ = +(process.env.CPM_MAXQ273 || 20), MINR = +(process.env.CPM_MINR273 || 50);
  const ok = ROSSO ? Aq >= MINR : Aq <= MAXQ; console.log(ok ? `✅ ${ROSSO ? 'ROSSO come atteso' : 'PASS inquadra-273'} (${Aq.toFixed(1)}%)` : `❌ ${ROSSO ? 'il rosso non riproduce' : 'FAIL inquadra-273'} (${Aq.toFixed(1)}%)`); process.exit(ok ? 0 : 1);
}
await b.close(); srv.close();
