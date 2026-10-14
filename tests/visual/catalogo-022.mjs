#!/usr/bin/env node
/* [giro 17 PO-022, Passo 6 strato 8b] GUARDIANO: da dove nascono le scene dell'eroe in partita vera. Partite S12 in autoplay, UNA PAGINA
   NUOVA PER PARTITA. Legge il testimone inerte `fonte022` del registro eventi (src/15): per ogni scena aperta, motore o catalogo scritto
   e perche' (senza-occasione · tipo-senza-generatore · generatore-nullo · piazzato-catalogo · origine-catalogo · catena-scritta).
   Piu' una PROVA DIRETTA sulle cinque catene (CHAIN_SITS) passate a scenaSecondoTempo: il secondo tempo e' raro nel flusso.
   VERDE: le 5 catene generate (stessa geometria/intento/pallone, opzioni disegnabili, nomi del cast, niente assist senza compagno),
   almeno CPM_MIN022 scene (default 8) e quota dal motore >= CPM_SOGLIA022 (default 0.95). Default: semi 41,67, esiti riusciti, politica «pass».
   ROSSO: con l'interruttore (CPM_ROSSO022=1 → window.__CPM_NO_SEG022, il secondo tempo torna alla catena scritta) nessuna catena generata.
   CPM_OK022=1 forza gli esiti riusciti (esercita il secondo tempo), CPM_POL022 la politica dell'autoplay (seeded · pass · cross).
   CPM_SEMI022="7,99" per scegliere i semi (il seme cambia anche il NOME dell'eroe, cioe' la partita); CPM_SOLO022=1 per la sola misura (esce 0). */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const save = JSON.parse(fs.readFileSync(path.join(DIR, 'fixtures/save-190-s12-ovr93.json')));
const semi = (process.env.CPM_SEMI022 || '41,67').split(',').map(Number);
const OK = (process.env.CPM_OK022 || '1') === '1', POL = process.env.CPM_POL022 || 'pass'; const ROSSO = process.env.CPM_ROSSO022 === '1', SW = process.env.CPM_SW022 || '__CPM_NO_SEG022';
const srv = await startServer(); const b = await launchBrowser(); const TUTTE = [], UNIT = [];
async function una(sd) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r) for (const k of s.r.split(',').filter(Boolean)) window[k] = 1; if (window.__CPM_OK022) window.__CPM_FORCE_OUTCOME = 'success'; localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, player: { ...save.player, name: save.player.name + (sd % 2 ? ' ' : '') + ' ' + String.fromCharCode(65 + sd % 26) }, r: (ROSSO ? SW : '') + (OK ? ',__CPM_OK022' : '') });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s.sd, policy: s.pol, tickMs: 150 }), { sd, pol: POL });
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(800); }
  const r = await page.evaluate(() => (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === "fonte022").map(e => ({ min: e.min, tipo: e.tipo, fonte: e.fonte, gen: e.gen, sk: e.sk })));
  const st = await page.evaluate(() => (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'scena' && e.src === 'secondo-tempo').length);
  if (st && !r.some(x => x.tipo === 'seguito')) console.log('  ⚠️ seme ' + sd + ': ' + st + ' secondi tempi senza testimone');
  const u = await page.evaluate(() => { try { const cast = { ricevente: { nome: 'Leo SPENCER' }, difensore: { nome: 'Max BAILEY' }, portiere: { nome: 'Ian CARR' } };
    return Object.keys(CHAIN_SITS).map(k => { const b0 = { ...CHAIN_SITS[k], _chainDepth: 1 }; const g = scenaSecondoTempo(b0, cast, { stats: {} }, 12345);
      if (!g) return { k, gen: false }; const g2 = scenaSecondoTempo(b0, {}, { stats: {} }, 12345);
      return { k, gen: g._p6 === 'seguito', sz: JSON.stringify(g.startZone) === JSON.stringify(b0.startZone), it: g.intent === b0.intent, bs: g.ballState === b0.ballState,
        rq: g.actions.every(a => !(a.richiede || []).length), nAz: g.actions.length, nomi: /BAILEY|CARR|SPENCER/.test(g.text + ' ' + g.intro + ' ' + g.actions.map(a => a.label).join(' ')),
        assistSenzaCompagno: g2 ? g2.actions.some(a => a.rew === 'assist') : false, text: g.text, az: g.actions.map(a => a.label) }; }); } catch (e) { return { err: String(e) }; } });
  await ctx.close(); return { sd, ph, r, u };
}
const par = +(process.env.CPM_PAR022 || 2);
for (let i = 0; i < semi.length; i += par) {
  const out = await Promise.all(semi.slice(i, i + par).map(una));
  for (const o of out) { UNIT.push(o.u); console.log('seme', o.sd, o.ph, 'scene', o.r.length); for (const x of o.r) console.log('  ', x.min + "'", x.tipo, '→', x.fonte, x.gen || '', '·', x.sk); TUTTE.push(...o.r); }
}
await b.close(); srv.close();
const per = {}; for (const x of TUTTE) per[x.fonte] = (per[x.fonte] || 0) + 1;
const mot = per.motore || 0, q = TUTTE.length ? mot / TUTTE.length : 0;
console.log((ROSSO ? 'ROSSO ' : 'VERDE ') + 'scene ' + TUTTE.length + ' · dal motore ' + mot + ' (' + (100 * q).toFixed(1) + '%) · ' + JSON.stringify(per));
const U = UNIT[0] || {}; console.log('secondo tempo (prova diretta sulle catene): ' + JSON.stringify(U));
if (process.env.CPM_SOLO022 === '1') process.exit(0);
const MIN = +(process.env.CPM_MIN022 || 8), SOGLIA = +(process.env.CPM_SOGLIA022 || 0.95), g = [];
const UA = Array.isArray(U) ? U : [];
if (ROSSO) {
  if (UA.some(x => x.gen)) g.push('rosso: con ' + SW + ' il secondo tempo si genera ancora');
  if (TUTTE.some(x => x.tipo === 'seguito' && x.fonte === 'motore')) g.push('rosso: un seguito risulta dal motore');
  if (g.length) { console.log('❌ catalogo-022 rosso non visibile'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
  console.log('✅ catalogo-022 rosso visibile (seguiti dalla catena scritta: ' + TUTTE.filter(x => x.fonte === 'catena-scritta').length + ')'); process.exit(0);
}
if (UA.length < 5) g.push('prova diretta: catene trovate ' + UA.length + ' (attese 5) ' + JSON.stringify(U));
for (const x of UA) { if (!x.gen) g.push(x.k + ': non generato'); else { if (!x.sz || !x.it || !x.bs) g.push(x.k + ': geometria/intento/pallone diversi dalla catena'); if (!x.rq) g.push(x.k + ': opzione con gesto senza clip'); if (x.nAz < 2) g.push(x.k + ': meno di 2 opzioni'); if (!x.nomi) g.push(x.k + ': nessun nome del cast'); if (x.assistSenzaCompagno) g.push(x.k + ': assist senza compagno'); } }
if (TUTTE.length < MIN) g.push('flusso cieco: solo ' + TUTTE.length + ' scene');
if (q < SOGLIA) g.push('flusso: dal motore ' + (100 * q).toFixed(1) + '% < ' + (100 * SOGLIA) + '% ' + JSON.stringify(per));
if (g.length) { console.log('❌ catalogo-022'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ catalogo-022 verde');
