#!/usr/bin/env node
/* [giro 44 PO-226] GUARDIANO: la scheda del mister che promette «la prossima palla buona arriva a te, prima» (profilo «eroe») mantiene la
   promessa in partita vera. Misura di partenza (misura-226, 20 partite, base 171): dopo una scelta «eroe» il prossimo highlight dell'eroe
   e' arrivato 1 volta su 6 (12'); il motore anticipava l'occasione ma la finestra della partita vissuta restava chiusa.
   Partite vere di carriera (save-194, playMatch), pilota seedato, la scheda sceglie SEMPRE l'opzione 3 (indice 2 = profilo «eroe» in tutte le
   schede non di panchina), timer corto. Si misura, per ogni scelta «eroe» presa con meno di 7 scene giocate, se un highlight dell'eroe si apre
   entro 8 minuti di gioco.
   VERDE: almeno 2 scelte misurate e promessa mantenuta in almeno 3/4 di esse. ROSSO (__CPM_NO_PROM44): mantenuta in meno di meta' (deve vedersi).
   Uso: node promessa-226.mjs (CPM_PARTITE=6 per braccio, CPM_PAR=3) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_PARTITE || 6), PAR = +(process.env.CPM_PAR || 3), TETTO = +(process.env.CPM_TETTO_MS || 480000);
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
/* partite del censimento con almeno una scheda (base 171): stessi nomi e semi di misura-226 */
const SCELTE = (process.env.CPM_IDX_PARTITE || '2,8,11,14,17,0,4,7').split(',').map(Number).slice(0, N);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const NOMI = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Galli', 'Conti', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Costa', 'Fontana', 'Moretti', 'Barbieri', 'Lombardi', 'Rinaldi', 'Caruso', 'Ferrara', 'Serra', 'Fabbri', 'Villa'];
async function partita(i, rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Prova ' + NOMI[i % NOMI.length] + ' ' + i;
  await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_SCMS681 = 1500; window.__CPM_INT226_IDX = 2; if (o.rosso) window.__CPM_NO_PROM44 = 1;
    localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, rosso });
  const out = { i, rosso, finita: false, hl: [] };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
    await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
    await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2590 + i * 37);
    const t1 = Date.now(); let phP = null;
    while (Date.now() - t1 < TETTO) { await sleep(500);
      const d = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), ck: window.__CPM_CLOCK && window.__CPM_CLOCK() }));
      if (d.ph === 'hl_intro' && phP !== 'hl_intro') out.hl.push(d.ck); phP = d.ph;
      if (d.ph === 'ended' || d.ph === 'ceremony') { out.finita = true; break; } }
    Object.assign(out, await page.evaluate(() => ({ scelte: ((window.__CPM_S259 || {}).scelte || []).map(c => ({ fatto: c.fatto, idx: c.idx, min: c.min })), prom: window.__CPM_PROM44 || [] })));
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
const tutte = [];
for (const rosso of [false, true]) { let next = 0; const res = [];
  const lav = async () => { while (next < SCELTE.length) { const k = next++; const o = await partita(SCELTE[k], rosso); res.push(o);
    const mis = (o.scelte || []).filter(c => c.fatto !== 'panca').map(c => { const prima = o.hl.filter(m => m <= c.min).length; const h = o.hl.filter(m => m >= c.min).sort((x, y) => x - y)[0];
      return { min: c.min, fatto: c.fatto, giocate: prima, dopo: h == null ? null : h - c.min, misurabile: prima < 7 && c.min <= 84 }; });
    o.mis = mis; console.log(`${rosso ? 'ROSSO' : 'VERDE'} p${o.i} ${o.finita ? 'finita' : 'NON FINITA'} hl ${JSON.stringify(o.hl)} · scelte «eroe» ${JSON.stringify(mis.map(m => m.min + "'" + m.fatto + ' → ' + (m.dopo == null ? 'nessun highlight' : '+' + m.dopo + "'") + (m.misurabile ? '' : ' (tetto)')))}${o.errori.length ? ' · pageerror ' + o.errori[0] : ''}${o.errore ? ' · ERRORE ' + o.errore : ''}`); } };
  await Promise.all(Array.from({ length: Math.min(PAR, SCELTE.length) }, lav)); tutte.push(...res); }
await b.close(); srv.close();
const quota = (rosso) => { const M = tutte.filter(o => o.rosso === rosso).flatMap(o => (o.mis || []).filter(m => m.misurabile)); const ok = M.filter(m => m.dopo != null && m.dopo <= 8).length; return { n: M.length, ok }; };
const V = quota(false), Ro = quota(true), g = [];
console.log(`verde: promessa mantenuta ${V.ok}/${V.n} · rosso: ${Ro.ok}/${Ro.n}`);
if (tutte.some(o => !o.rosso && (!o.finita || o.errori.length))) g.push('verde: partita non finita o errori di pagina');
if (V.n < 2) g.push('verde: meno di 2 scelte misurabili, guardiano cieco');
else if (V.ok < 0.75 * V.n) g.push('verde: promessa mantenuta solo ' + V.ok + '/' + V.n);
if (!(Ro.n >= 2 && Ro.ok < 0.5 * Ro.n)) g.push('rosso: la promessa non si rompe (' + Ro.ok + '/' + Ro.n + '), il difetto non si vede');
if (g.length) { console.log('❌ promessa-226'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ promessa-226 verde (dopo «la risolvo io» la scena dell\'eroe arriva entro 8 minuti) e il rosso si vede');
