/* [giro 82, PO-287, decisione PO «elimina finalizzatore» · questionario «Tutto: eroe neutro»] GUARDIANO DELL'EROE NEUTRO.
   Nessuno stile di gioco da nessuna parte. Nella pagina vera, due bracci:
   - verde: la creazione non cita stile, Finalizzatore ed Enfant; l'eroe creato non ha archetipo (archetype null), tratto Enfant spento,
     statistiche nelle bande base (nessun bonus/malus di stile: 300 baseStats() di prova stanno tutte nelle bande), stileMotore(eroe) = null
     (anche con un vecchio archetipo in mano); in Carriera (salvataggio vecchio, con archetipo «centravanti», migrato) non compare nessuna
     scheda «Stile di gioco» ne' la parola «Finalizzatore» in nessuna scheda; la migrazione porta ogni vecchio archetipo e stile a neutro con lo
     stile di prima in stilePrima287, le statistiche intatte, nessun campo perso, la seconda passata senza effetto;
   - rosso (__CPM_NO_NEUTRO287): torna la 7.999.176 — eroe Finalizzatore, bonus sulle statistiche, leve nel motore, scheda in Carriera.
   Il guardiano pretende che il rosso violi le regole del verde, altrimenti guarda a vuoto. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const out = {};
const URL0 = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const VIETATO = /Stile di gioco|Finalizzator|Enfant Prodige/i;/* «Regista» in Carriera e' anche un badge degli assist (non uno stile): non si cerca */

async function creazione(rosso) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 800 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript((r) => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} window.__CPM_GLB = false; if (r) window.__CPM_NO_NEUTRO287 = true; }, rosso);
  await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!window.__CPM_MIGRATE && !!window.__CPM_STILI && !!document.getElementById('root').children.length, null, { timeout: 120000 });
  await sleep(800);
  const premuto = await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /Nuova carriera/.test(x.textContent || '')); if (bt) bt.click(); return !!bt; });
  await sleep(1200);
  const crea = await page.evaluate(() => ({ griglia: !!document.querySelector('[data-cpm="scelta-stile"]'), enfant: !!document.querySelector('[data-cpm="tratto-enfant"]'), testo: (document.body.innerText.match(/Stile di gioco|Finalizzator|Enfant|Regista|Incursore|Trascinatore/i) || [null])[0] }));
  await page.locator('input[name="cpm-hero-name"]').fill('Neutro Duecentoottantasette');
  await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /Inizia i provini/.test(x.textContent || '')); if (bt) bt.click(); });
  await sleep(1500);
  const creato = await page.evaluate(() => { try { const t = JSON.parse(localStorage.getItem('cpm-trial-prog') || 'null'); const p = t && t.p; if (!p) return null;
    const LO = { velocità: 55, tecnica: 54, fisico: 50, mentalità: 50, tiro: 60, passaggio: 48, dribbling: 55, posizionamento: 55 }, HI = { velocità: 72, tecnica: 70, fisico: 68, mentalità: 68, tiro: 74, passaggio: 65, dribbling: 72, posizionamento: 70 };
    return { archetype: p.archetype === undefined ? '∅' : p.archetype, enfant: !!(p.tratti && p.tratti.enfant), crescita: archGrowthMult(p), motore: stileMotore(p),
      statsRaw: Object.keys(LO).every(k => p.stats[k] >= LO[k] && p.stats[k] <= HI[k]) }; } catch (e) { return { err: String(e) }; } });
  /* statistiche: 300 baseStats di prova col Finalizzatore in mano; nel neutro stanno tutte nelle bande base, con lo stile no */
  const bande = await page.evaluate(() => { const LO = { velocità: 55, tecnica: 54, fisico: 50, mentalità: 50, tiro: 60, passaggio: 48, dribbling: 55, posizionamento: 55 }, HI = { velocità: 72, tecnica: 70, fisico: 68, mentalità: 68, tiro: 74, passaggio: 65, dribbling: 72, posizionamento: 70 };
    let fuori = 0, sT = 0; for (let i = 0; i < 300; i++) { const s = baseStats(ARCHETYPES[0]); sT += s.tiro; if (Object.keys(LO).some(k => s[k] < LO[k] || s[k] > HI[k])) fuori++; }
    const mot = { fin: stileMotore({ archetype: ARCHETYPES[0], stats: {} }), reg: stileMotore({ archetype: ARCHETYPES[1], stats: {} }), vecchio: stileMotore({ archetype: 'bomber', stats: {} }) };
    return { fuori, tiroMedio: +(sT / 300).toFixed(1), mot }; });
  await ctx.close();
  return { premuto, crea, creato, bande, errori };
}

async function carriera(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 900 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.tutorialDone = true;
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_FIS_APERTE = true; if (r) window.__CPM_NO_NEUTRO287 = true;
    try { if (!sessionStorage.getItem('n287')) { localStorage.setItem('cpm-v3', s); sessionStorage.setItem('n287', '1'); } } catch (e) {} }, [JSON.stringify(sv), rosso]);
  await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 150000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 90000 });
  await sleep(1200);
  const schede = {};
  for (const t of ['dashboard', 'profile', 'calendar', 'standings']) {
    await page.evaluate((t) => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} window.__CPM_CAREER.goTab(t); }, t); await sleep(900);
    schede[t] = await page.evaluate((re) => { const tx = document.body.innerText || ''; const m = tx.match(new RegExp(re, 'i')); return { len: tx.length, vietato: m ? m[0] : null, brano: m ? tx.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\n/g, ' | ') : null }; }, VIETATO.source);
  }
  const eroe = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { archetype: p.archetype === undefined ? '∅' : p.archetype, prima: p.stilePrima287 === undefined ? '∅' : p.stilePrima287, motore: stileMotore(p), orig: p.archetipoOrig || null }; });
  await ctx.close();
  return { schede, eroe, errori };
}

async function migrazione(rosso) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 800 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript((r) => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} window.__CPM_GLB = false; if (r) window.__CPM_NO_NEUTRO287 = true; }, rosso);
  await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!window.__CPM_MIGRATE && !!window.__CPM_STILI, null, { timeout: 120000 });
  const mig = await page.evaluate((pl) => {
    const S = window.__CPM_STILI; const casi = {};
    const voci = [...S.ARCHETYPES_8.map(a => ({ k: a.id, a, enf: a.id === 'enfant' })), ...S.ARCHETYPES.map(a => ({ k: a.id, a, enf: false })), ...S.ARCHETYPES.map(a => ({ k: a.id + '+enfant', a, enf: true })), { k: 'stringa', a: 'regista', enf: false }, { k: 'nullo', a: null, enf: false }];
    for (const v of voci) {
      const p0 = JSON.parse(JSON.stringify(pl)); p0.archetype = v.a; p0.age = 19; p0.tratti = { ...(p0.tratti || {}), enfant: v.enf };
      for (const c of ['stilePrima75', 'enfantPrima75', 'archetipoOrig', 'stilePrima287', 'enfantPrima287']) delete p0[c];
      const m1 = window.__CPM_MIGRATE(JSON.parse(JSON.stringify(p0))).player; const m2 = window.__CPM_MIGRATE(JSON.parse(JSON.stringify(m1)));
      casi[v.k] = { arch: m1.archetype === undefined ? '∅' : m1.archetype, prima: m1.stilePrima287 === undefined ? '∅' : m1.stilePrima287, enfant: !!(m1.tratti && m1.tratti.enfant), enfPrima: !!m1.enfantPrima287,
        motore: S.stileMotore(m1), statsUguali: JSON.stringify(m1.stats) === JSON.stringify(p0.stats), persi: Object.keys(p0).filter(k => !(k in m1)),
        idem: !m2.changed || JSON.stringify(m2.player) === JSON.stringify(m1) };
    }
    return casi;
  }, save.player || save);
  await ctx.close();
  return { mig, errori };
}

for (const rosso of [false, true]) { const k = rosso ? 'rosso' : 'verde'; out[k] = { ...(await creazione(rosso)), ...(await carriera(rosso)), ...(await migrazione(rosso)) }; }
await b.close(); srv.close();

const STILE_DA_ARCH8 = { bomber: 'finalizzatore', centravanti: 'finalizzatore', trequartista: 'regista', fantasista: 'regista', velocista: 'incursore', leader: 'trascinatore', tuttocampista: 'trascinatore' };
const STILI = ['finalizzatore', 'regista', 'incursore', 'trascinatore'];
function giudica(o) {
  const e = [];
  if (!o.premuto) e.push('bottone «Nuova carriera» non trovato');
  if (o.crea.griglia) e.push('la creazione mostra la griglia degli stili');
  if (o.crea.enfant) e.push('la creazione mostra la casella Enfant');
  if (o.crea.testo) e.push('la creazione cita «' + o.crea.testo + '»');
  const c = o.creato;
  if (!c || c.err) e.push('calciatore creato non letto: ' + JSON.stringify(c));
  else { if (c.archetype !== null) e.push('creato con archetipo ' + JSON.stringify(c.archetype && c.archetype.id || c.archetype)); if (c.enfant) e.push('creato con l\'Enfant'); if (c.crescita !== 1) e.push('crescita x' + c.crescita); if (c.motore !== null) e.push('stileMotore(creato) non neutro'); if (!c.statsRaw) e.push('statistiche del creato fuori dalle bande base'); }
  if (o.bande.fuori) e.push('baseStats con bonus di stile: ' + o.bande.fuori + '/300 fuori banda (tiro medio ' + o.bande.tiroMedio + ')');
  for (const [k, v] of Object.entries(o.bande.mot)) if (v !== null) e.push('stileMotore(' + k + ') non neutro');
  for (const [t, s] of Object.entries(o.schede)) { if (s.len < 300) e.push('scheda ' + t + ' non letta (' + s.len + ' caratteri)'); if (s.vietato) e.push('Carriera/' + t + ' cita «' + s.vietato + '» (…' + s.brano + '…)'); }
  if (o.eroe.archetype !== null) e.push('eroe in Carriera con archetipo ' + JSON.stringify(o.eroe.archetype && o.eroe.archetype.id || o.eroe.archetype));
  if (o.eroe.motore !== null) e.push('stileMotore(eroe di Carriera) non neutro');
  if (o.eroe.prima !== 'finalizzatore') e.push('stilePrima287 dell\'eroe di Carriera ' + o.eroe.prima);
  for (const [k, m] of Object.entries(o.mig)) {
    const base = k.replace('+enfant', ''); const conEnf = k.endsWith('+enfant') || k === 'enfant';
    if (m.arch !== null) e.push(k + ' → archetipo ' + JSON.stringify(m.arch && m.arch.id || m.arch));
    if (m.motore !== null) e.push(k + ': stileMotore non neutro');
    if (m.enfant) e.push(k + ': Enfant acceso');
    if (conEnf !== m.enfPrima) e.push(k + ': enfantPrima287 ' + m.enfPrima);
    const atteso = base === 'nullo' ? '∅' : base === 'stringa' ? 'regista' : base === 'enfant' ? null : (STILE_DA_ARCH8[base] || base);
    if (atteso === null) { if (!STILI.includes(m.prima)) e.push(k + ': stilePrima287 ' + m.prima); } else if (m.prima !== atteso) e.push(k + ': stilePrima287 ' + m.prima + ' (atteso ' + atteso + ')');
    if (!m.statsUguali) e.push(k + ': statistiche cambiate'); if (m.persi.length) e.push(k + ': campi persi ' + m.persi); if (!m.idem) e.push(k + ': la seconda migrazione cambia ancora');
  }
  if (o.errori.length) e.push('pageerror: ' + o.errori.join(' | '));
  return e;
}
const eV = giudica(out.verde), eR = giudica(out.rosso);
console.log(JSON.stringify({ verde: { crea: out.verde.crea, creato: out.verde.creato, bande: out.verde.bande, eroe: out.verde.eroe, schede: out.verde.schede, violazioni: eV }, rosso: { creato: out.rosso.creato, bande: out.rosso.bande, eroe: out.rosso.eroe, schede: out.rosso.schede, violazioni: eR.length } }, null, 1));
const err = [...eV];
if (!out.rosso.creato || out.rosso.creato.archetype === null || !out.rosso.creato.archetype) err.push('rosso: l\'eroe creato non e\' Finalizzatore (interruttore che non spegne)');
if (!Object.values(out.rosso.schede).some(s => s.vietato && /Stile di gioco|Finalizzator/i.test(s.vietato))) err.push('rosso: la scheda «Stile di gioco» non compare in Carriera (interruttore che non spegne)');
if (!out.rosso.bande.fuori) err.push('rosso: baseStats senza bonus (interruttore che non spegne)');
if (eR.length < 8) err.push('rosso: solo ' + eR.length + ' violazioni (il guardiano guarda a vuoto)');
if (err.length) { console.error('❌ neutro-287: ' + err.join(' · ')); process.exit(1); }
console.log(`✅ neutro-287 verde (creazione senza stile, eroe senza archetipo, statistiche senza bonus, stileMotore neutro, Carriera senza «Stile di gioco» né «Finalizzatore»; ${Object.keys(out.verde.mig).length} casi di migrazione → neutro con stilePrima287, idempotenti) · rosso: ${eR.length} violazioni, la 7.999.176 torna`);
