/* [giro 75, decisione PO 19/10 «togliamolo, rimane praticamente solo il Finalizzatore» · «togli anche enfant»] GUARDIANO DELLO STILE UNICO.
   Nella pagina vera, due bracci:
   - verde: la creazione NON mostra la griglia degli stili (data-cpm="scelta-stile") ne' la casella Enfant (data-cpm="tratto-enfant"); il
     calciatore creato e' Finalizzatore, senza tratto Enfant, con le statistiche base del Finalizzatore (nessun -2); la migrazione porta
     ognuno degli 8 vecchi archetipi e dei 4 stili (anche con l'Enfant acceso, come li scriveva la 7.999.174) a Finalizzatore, con lo stile
     di prima in stilePrima75, il vecchio archetipo in archetipoOrig, enfantPrima75 dove c'era l'Enfant, le statistiche intatte, nessun
     campo perso, crescita x1 e seconda migrazione senza effetto;
   - rosso (__CPM_NO_STILEUNICO75): torna la 174 — la griglia e la casella ci sono, la migrazione lascia gli stili. Il guardiano pretende
     che il rosso violi le regole del verde, altrimenti guarda a vuoto. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const out = {};
const URL0 = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;

async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 800 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript((r) => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} window.__CPM_GLB = false; if (r) window.__CPM_NO_STILEUNICO75 = 1; }, rosso);
  await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!window.__CPM_MIGRATE && !!window.__CPM_STILI && !!document.getElementById('root').children.length, null, { timeout: 120000 });
  await sleep(800);
  /* 1. creazione */
  const premuto = await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /Nuova carriera/.test(x.textContent || '')); if (bt) bt.click(); return !!bt; });
  await sleep(1200);
  const crea = await page.evaluate(() => ({ griglia: !!document.querySelector('[data-cpm="scelta-stile"]'), enfant: !!document.querySelector('[data-cpm="tratto-enfant"]'),
    testoStile: /Stile di gioco/i.test(document.body.innerText || ''), testoEnfant: /Enfant/i.test(document.body.innerText || '') }));
  const inp = page.locator('input[name="cpm-hero-name"]'); await inp.fill('Unico Settantacinque');
  if (rosso) { /* nella 174 si puo' scegliere: si prova la scelta piu' lontana (Regista + Enfant) per vedere che il rosso la rispetta */
    await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /Regista/.test(x.textContent || '')); if (bt) bt.click(); const c = document.querySelector('[data-cpm="tratto-enfant"] input'); if (c && !c.checked) c.click(); });
    await sleep(300);
  }
  await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /Inizia i provini/.test(x.textContent || '')); if (bt) bt.click(); });
  await sleep(1500);
  const creato = await page.evaluate(() => { try { const t = JSON.parse(localStorage.getItem('cpm-trial-prog') || 'null'); const p = t && t.p; if (!p) return null;
    /* baseStats tira a sorte (_cpmRnd): si controlla che ogni statistica stia nella banda del Finalizzatore senza il -2 dell'Enfant
      (stessi estremi di src/05 baseStats) */
    const LO = { velocità: 55, tecnica: 54, fisico: 50, mentalità: 50, tiro: 60, passaggio: 48, dribbling: 55, posizionamento: 55 }, HI = { velocità: 72, tecnica: 70, fisico: 68, mentalità: 68, tiro: 74, passaggio: 65, dribbling: 72, posizionamento: 70 };
    const bo = ARCHETYPES[0].bonus, cl = (v) => Math.max(40, Math.min(90, v)); const base = Object.fromEntries(Object.keys(LO).map(k => [k, [cl(LO[k] + (bo[k] || 0)), cl(HI[k] + (bo[k] || 0))]]));
    return { stile: (p.archetype && p.archetype.id) || p.archetype, enfant: !!(p.tratti && p.tratti.enfant), enfantTratto: window.__CPM_STILI.haTrattoEnfant(p),
      crescita: archGrowthMult(p), statsBase: Object.keys(base).every(k => p.stats[k] >= base[k][0] && p.stats[k] <= base[k][1]) }; } catch (e) { return { err: String(e) }; } });
  /* 2. migrazione: 8 archetipi + 4 stili, ognuno anche con l'Enfant acceso (come lo scriveva la 174) */
  const mig = await page.evaluate((pl) => {
    const S = window.__CPM_STILI; const casi = {};
    const voci = [...S.ARCHETYPES_8.map(a => ({ k: a.id, a, enf: a.id === 'enfant' })), ...S.ARCHETYPES.map(a => ({ k: a.id, a, enf: false })), ...S.ARCHETYPES.map(a => ({ k: a.id + '+enfant', a, enf: true }))];
    for (const v of voci) {
      const p0 = JSON.parse(JSON.stringify(pl)); p0.archetype = v.a; p0.age = 19; p0.tratti = { ...(p0.tratti || {}), enfant: v.enf };
      delete p0.stilePrima75; delete p0.enfantPrima75; delete p0.archetipoOrig;
      const m1 = window.__CPM_MIGRATE(JSON.parse(JSON.stringify(p0))).player; const m2 = window.__CPM_MIGRATE(JSON.parse(JSON.stringify(m1)));
      casi[v.k] = { stile: (m1.archetype && m1.archetype.id) || m1.archetype, prima: m1.stilePrima75 === undefined ? '∅' : m1.stilePrima75, orig: m1.archetipoOrig || null,
        enfant: !!(m1.tratti && m1.tratti.enfant), enfPrima: !!m1.enfantPrima75, enfantTratto: S.haTrattoEnfant(m1), crescita: archGrowthMult(m1),
        statsUguali: JSON.stringify(m1.stats) === JSON.stringify(p0.stats), persi: Object.keys(p0).filter(k => !(k in m1)),
        idem: !m2.changed || JSON.stringify(m2.player) === JSON.stringify(m1) };
    }
    return casi;
  }, save.player || save);
  await ctx.close();
  return { premuto, crea, creato, mig, errori };
}

out.verde = await braccio(false); out.rosso = await braccio(true);
await b.close(); srv.close();

const STILE_DA_ARCH8 = { bomber: 'finalizzatore', centravanti: 'finalizzatore', trequartista: 'regista', fantasista: 'regista', velocista: 'incursore', leader: 'trascinatore', tuttocampista: 'trascinatore' };
const STILI = ['finalizzatore', 'regista', 'incursore', 'trascinatore'];
function giudica(o) {
  const e = [];
  if (!o.premuto) e.push('bottone «Nuova carriera» non trovato');
  if (o.crea.griglia) e.push('la creazione mostra la griglia degli stili');
  if (o.crea.enfant) e.push('la creazione mostra la casella Enfant');
  if (o.crea.testoStile) e.push('la creazione cita «Stile di gioco»');
  if (o.crea.testoEnfant) e.push('la creazione cita l\'Enfant');
  const c = o.creato;
  if (!c || c.err) e.push('calciatore creato non letto: ' + JSON.stringify(c));
  else { if (c.stile !== 'finalizzatore') e.push('creato ' + c.stile); if (c.enfant || c.enfantTratto) e.push('creato con l\'Enfant'); if (c.crescita !== 1) e.push('crescita creato x' + c.crescita); if (!c.statsBase) e.push('statistiche del creato fuori dalla banda del Finalizzatore base'); }
  for (const [k, m] of Object.entries(o.mig)) {
    const base = k.replace('+enfant', ''); const conEnf = k.endsWith('+enfant') || k === 'enfant'; const vecchio = !!STILE_DA_ARCH8[base] || base === 'enfant';
    if (m.stile !== 'finalizzatore') e.push(k + ' → ' + m.stile);
    if (m.enfant || m.enfantTratto) e.push(k + ': Enfant ancora acceso'); if (m.crescita !== 1) e.push(k + ': crescita x' + m.crescita);
    if (conEnf !== m.enfPrima) e.push(k + ': enfantPrima75 ' + m.enfPrima);
    const primaAtteso = vecchio ? (STILE_DA_ARCH8[base] || null) : base;
    if ((base === 'finalizzatore' || primaAtteso === 'finalizzatore') && !conEnf) { /* era gia' Finalizzatore (anche via la migrazione del giro 67): niente da registrare, l'archetipo vecchio resta in archetipoOrig */ if (m.prima !== '∅') e.push(k + ': stilePrima75 scritto senza motivo'); }
    else if (base === 'enfant') { if (!STILI.includes(m.prima)) e.push(k + ': stilePrima75 ' + m.prima); }
    else if (m.prima !== primaAtteso) e.push(k + ': stilePrima75 ' + m.prima + ' (atteso ' + primaAtteso + ')');
    if (vecchio && m.orig !== base) e.push(k + ': archetipoOrig ' + m.orig);
    if (!m.statsUguali) e.push(k + ': statistiche cambiate'); if (m.persi.length) e.push(k + ': campi persi ' + m.persi); if (!m.idem) e.push(k + ': la seconda migrazione cambia ancora');
  }
  if (o.errori.length) e.push('pageerror: ' + o.errori.join(' | '));
  return e;
}
const eV = giudica(out.verde), eR = giudica(out.rosso);
console.log(JSON.stringify({ verde: { crea: out.verde.crea, creato: out.verde.creato }, rosso: { crea: out.rosso.crea, creato: out.rosso.creato, violazioni: eR.length } }, null, 1));
const err = [...eV];
if (out.rosso.errori.length) err.push('rosso: pageerror ' + out.rosso.errori.join(' | '));
if (!out.rosso.crea.griglia || !out.rosso.crea.enfant) err.push('rosso: la creazione della 174 non mostra griglia/casella (interruttore che non spegne)');
if (!out.rosso.creato || out.rosso.creato.stile !== 'regista' || !out.rosso.creato.enfant) err.push('rosso: la scelta Regista+Enfant non e\' rispettata ' + JSON.stringify(out.rosso.creato));
if (!out.rosso.mig.regista || out.rosso.mig.regista.stile !== 'regista') err.push('rosso: la migrazione converte lo stesso');
if (eR.length < 10) err.push('rosso: solo ' + eR.length + ' violazioni (il guardiano guarda a vuoto)');
if (err.length) { console.error('❌ stile-unico-75: ' + err.join(' · ')); process.exit(1); }
console.log(`✅ stile-unico-75 verde (creazione senza scelta, eroe Finalizzatore senza Enfant; ${Object.keys(out.verde.mig).length} casi di migrazione → Finalizzatore, idempotenti, statistiche e campi intatti) · rosso: ${eR.length} violazioni, la 174 torna`);
