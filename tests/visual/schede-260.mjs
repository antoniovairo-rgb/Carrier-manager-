#!/usr/bin/env node
/* [giro 44 PO-260] GUARDIANO: la scheda del mister non sta mai sopra un highlight, la cerimonia o il fischio finale.
   Collaudo 3D 169 (R03): modale «IL MISTER» sopra «Testa di potenza» (60', 73') e sopra «Salta premiazione» con un ordine dell'84'.
   Partita vera di carriera (save-194, playMatch), pilota seedato, la scheda NON viene scelta per molto tempo: __CPM_SCMS681=60000 fa
   durare la scelta automatica del pilota ~36 minuti di gioco (giro 18), cosi' la scheda resta in sospeso attraverso highlight e fischio.
   Ogni 300 ms: fase + scheda a schermo ([data-cpm="pop919"]). Al fischio: la scheda in sospeso si chiude e la scelta arriva al motore.
   VERDE: 0 campioni con la scheda a schermo fuori da `playing`; almeno una scheda vista in `playing` mentre la partita entrava in un highlight
          o finiva in sospeso (sennò il guardiano e' cieco); scelte al motore = schede aperte (__CPM_S259).
   ROSSO (__CPM_NO_POP260 + __CPM_NO_SOSP246): la scheda e' a schermo dentro un highlight o la cerimonia, e una seconda scheda nasce
          mentre la prima aspetta e la sovrascrive (schede aperte > scelte arrivate al motore). Misurato sulla build prima del giro 44:
          «Prova Neri 3» 2 schede, 1 scelta.
   Uso: node schede-260.mjs  (CPM_NOMI="Prova Neri 3,Prova Greco 8" · semi 2590+i*37 come il censimento di schede-259) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const NOMI = (process.env.CPM_NOMI || 'Prova Neri 3,Prova Greco 8').split(','), TETTO = +(process.env.CPM_TETTO_MS || 480000);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function partita(nome, rosso) {
  const i = +(nome.match(/(\d+)$/) || [0, 0])[1];
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = nome;
  await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_SCMS681 = 60000; if (o.rosso) { window.__CPM_NO_POP260 = 1; window.__CPM_NO_SOSP246 = 1; }
    localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, rosso });
  const out = { nome, rosso, finita: false, inGioco: 0, fuori: [], hlConSospesa: 0 };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
    await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
    await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2590 + i * 37);
    const t1 = Date.now(); let prev = null, cer = 0;
    while (Date.now() - t1 < TETTO) { await sleep(300);
      const d = await page.evaluate(() => { const S = window.__CPM_S259 || { schede: [], scelte: [] };
        return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), ck: window.__CPM_CLOCK && window.__CPM_CLOCK(), pop: !!document.querySelector('[data-cpm="pop919"]'), sosp: S.schede.length > S.scelte.length }; });
      if (d.pop && d.ph === 'playing') out.inGioco++;
      if (d.pop && d.ph !== 'playing') out.fuori.push(d.ph + '@' + d.ck);
      if (d.sosp && d.ph && d.ph.startsWith('hl_') && prev !== d.ph && d.ph === 'hl_intro') out.hlConSospesa++;
      if (d.ph === 'ended') { out.finita = true; break; }
      if (d.ph === 'ceremony') { out.finita = true; if (++cer > 12) break; }
      prev = d.ph; }
    await sleep(1500);
    Object.assign(out, await page.evaluate(() => { const S = window.__CPM_S259 || { schede: [], scelte: [] }; const pop = !!document.querySelector('[data-cpm="pop919"]');
      return { schede: S.schede.length, scelte: S.scelte.map(s => s.fatto + '@' + s.min + (s.auto ? 'a' : '')), popFine: pop, chiuseAlFischio: window.__CPM_POP260_FINE | 0, ph: window.__CPM_PHASE && window.__CPM_PHASE() }; }));
    if (out.popFine) out.fuori.push('dopo il fischio (' + out.ph + ')');
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
const R = [];
for (const rosso of [false, true]) for (const n of NOMI) { const o = await partita(n, rosso); R.push(o);
  console.log(`${rosso ? 'ROSSO' : 'VERDE'} ${n} · fine ${o.finita} · scheda a schermo in gioco ${o.inGioco} campioni · FUORI dal gioco ${o.fuori.length} ${JSON.stringify(o.fuori.slice(0, 6))} · highlight partiti con scheda in sospeso ${o.hlConSospesa} · schede ${o.schede} · scelte ${JSON.stringify(o.scelte)} · chiuse al fischio ${o.chiuseAlFischio}${o.errore ? ' · ERRORE ' + o.errore : ''}${o.errori.length ? ' · pageerror ' + o.errori.join(' | ') : ''}`); }
await b.close(); srv.close();
const g = [], V = R.filter(o => !o.rosso), Ro = R.filter(o => o.rosso);
V.forEach(o => { if (!o.finita) g.push('verde ' + o.nome + ': partita non finita'); if (o.fuori.length) g.push('verde ' + o.nome + ': scheda a schermo fuori dal gioco ' + JSON.stringify(o.fuori.slice(0, 4)));
  if ((o.scelte || []).length < (o.schede | 0)) g.push('verde ' + o.nome + ': scheda rimasta senza scelta (' + o.schede + ' aperte, ' + (o.scelte || []).length + ' al motore)'); if (o.errori.length) g.push('verde: errori di pagina'); });
if (!V.some(o => o.hlConSospesa > 0 || o.chiuseAlFischio > 0)) g.push('verde: nessuna scheda in sospeso dentro un highlight o al fischio, guardiano cieco');
if (!Ro.some(o => o.fuori.length > 0)) g.push('rosso: la scheda non compare mai fuori dal gioco, il difetto non si vede');
if (!Ro.some(o => (o.schede | 0) > (o.scelte || []).length)) g.push('rosso: nessuna scheda sovrascritta, il difetto PO-246 non si vede');
if (g.length) { console.log('❌ schede-260'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ schede-260 verde (la scheda del mister non copre mai highlight, cerimonia o fischio; al fischio si chiude e arriva al motore) e il rosso si vede');
