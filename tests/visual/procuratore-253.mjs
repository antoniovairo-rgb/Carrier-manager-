#!/usr/bin/env node
/* [giro 24 PO-253, foto PO 15/10 «Cornice del procuratore non standard»] GUARDIANO: le due finestre del procuratore — «Il confronto»
   (player.agentCheckin.due) e «Il primo incontro» (agentIntro, aperto dall'aggancio di prova apriIntro253) — hanno la cornice
   standard del gioco, ModalPannello (decisione PO-230, 13/10). Salvataggio S12, procuratore creato con agentHirePatch.
   Per ciascuna finestra, in due stati (prima scelta e dopo la scelta), si misura il pannello (.cpm-rise che contiene la finestra):
   titoli (titolo della testa + occhielli maiuscoli), testa con filo sotto, pulsanti nel piede, pulsanti rimasti nel corpo, e le
   misure della cornice (raggio, padding di testa/corpo/piede, corpo e peso del titolo, filo del piede) confrontate con quelle di una
   finestra standard di riferimento: il verdetto del patto col mister in finestra [data-cpm=finestra230] (via cardInFinestra230).
   VERDE: un solo titolo, nessun occhiello, testa presente, pulsanti tutti nel piede, misure uguali al riferimento, niente scroll
   orizzontale, e lo STESSO testo del braccio rosso (la cornice cambia, le parole no).
   ROSSO (__CPM_NO_PROC253, la cornice di prima): occhiello nel corpo, nessuna testa, pulsanti nel corpo.
   Uso: node procuratore-253.mjs   (CPM_FOTO=<prefisso> salva le foto; CPM_LARG=412,360 le larghezze; CPM_SOLO=verde|rosso un braccio) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const LARG = (process.env.CPM_LARG || '412,360').split(',').map(Number);
const ALT = { 412: 915, 360: 800 };
const BRACCI = process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'];
const srv = await startServer(); const b = await launchBrowser();
const misura = sel => {
  const ancora = document.querySelector(sel); if (!ancora) return null;
  const fr = ancora.closest('.cpm-rise') || ancora; const px = v => parseFloat(v) || 0; const cs = getComputedStyle(fr);
  const testa = fr.querySelector('[data-cpm="finestra-testa"]'), titolo = fr.querySelector('[data-cpm="finestra-titolo"]');
  const corpo = fr.querySelector('[data-cpm="finestra-corpo"]'), piede = fr.querySelector('[data-cpm="finestra-piede"]');
  const occhielli = [];
  fr.querySelectorAll('div').forEach(e => { if (getComputedStyle(e).textTransform === 'uppercase' && e.textContent.trim() && !e.querySelector('div,button')) occhielli.push(e.textContent.trim()); });
  const titoli = fr.querySelectorAll('[data-cpm="finestra-titolo"]').length + occhielli.length;
  const pad = e => e ? [px(getComputedStyle(e).paddingTop), px(getComputedStyle(e).paddingRight), px(getComputedStyle(e).paddingBottom), px(getComputedStyle(e).paddingLeft)].join('/') : null;
  const corpoEl = corpo || fr;
  const corpoBottoni = [...corpoEl.querySelectorAll('button')].filter(x => !(piede && piede.contains(x)) && !(testa && testa.contains(x))).length;
  /* il testo si legge dalla SORGENTE (textContent dei nodi foglia), non da innerText: l'occhiello maiuscolo e' solo CSS */
  const righe = [...fr.querySelectorAll('*')].filter(e => !e.children.length).map(e => e.textContent.trim()).filter(x => x && x !== '×');
  return {
    titoli, titolo: titolo ? titolo.textContent.trim() : null, occhielli,
    testa: !!testa && px(getComputedStyle(testa).borderBottomWidth) > 0,
    piedeBottoni: piede ? piede.querySelectorAll('button').length : 0, corpoBottoni,
    scrollX: fr.scrollWidth > fr.clientWidth + 1 || document.documentElement.scrollWidth > window.innerWidth + 1,
    misure: { raggio: px(cs.borderTopLeftRadius), maxW: cs.maxWidth, testaPad: pad(testa), titoloFs: titolo ? getComputedStyle(titolo).fontSize : null,
      titoloFw: titolo ? getComputedStyle(titolo).fontWeight : null, corpoPad: pad(corpo), piedePad: pad(piede), piedeFilo: piede ? getComputedStyle(piede).borderTopWidth : null },
    larghezza: Math.round(fr.getBoundingClientRect().width), righe: righe.sort(),
  };
};
async function apri(W, braccio, caso) {
  const ctx = await b.newContext({ viewport: { width: W, height: ALT[W] || 800 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; if (s.caso === 'riferimento') window.__CPM_POP224 = 1; if (s.r === 'rosso') window.__CPM_NO_PROC253 = 1; try { localStorage.setItem('cpm-v3', JSON.stringify(s.save)); } catch (e) {} }, { r: braccio, caso, save });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const r = await page.evaluate(caso => {
    const C = window.__CPM_CAREER; const p = C.get();
    if (caso === 'riferimento') { C.patch({ coachPact: { season: p.season || 1, fromWeek: 0, target: 0, games: 4, kind: 'gol', status: 'active' } }); C.goTab && C.goTab('dashboard'); return true; }
    const ag = window.agentHirePatch({ ...p, bankBalance: 1e7 }, 0, null);
    const base = { hasAgent: true, agent: ag.agent, agentInit: { open: false }, agentHint: null, coachPact: null, coachPactSeason: p.season || 1 };
    if (caso === 'confronto') { C.patch({ ...base, agentCheckin: { due: true, s: p.season || 1, w: p.week || 1 } }); C.goTab && C.goTab('dashboard'); return true; }
    C.patch({ ...base, hasAgent: false, agent: null, agentCheckin: { due: false }, bankBalance: 1e7 }); return C.apriIntro253();
  }, caso);
  await sleep(1500);
  return { ctx, page, r };
}
const SEL = { confronto: '[data-cpm="confronto23"]', incontro: '[data-cpm="procuratore23"]', riferimento: '[data-cpm="finestra230"]' };
const esito = {}; const g = [];
for (const W of LARG) {
  esito[W] = {};
  { const { ctx, page } = await apri(W, 'verde', 'riferimento'); esito[W].riferimento = await page.evaluate(misura, SEL.riferimento);
    if (process.env.CPM_FOTO) await page.screenshot({ path: `${process.env.CPM_FOTO}-${W}-riferimento.png` }); await ctx.close(); }
  for (const braccio of BRACCI) for (const caso of ['confronto', 'incontro']) {
    const { ctx, page, r } = await apri(W, braccio, caso);
    const m1 = await page.evaluate(misura, SEL[caso]);
    if (process.env.CPM_FOTO) await page.screenshot({ path: `${process.env.CPM_FOTO}-${W}-${caso}-${braccio}-1.png` });
    /* secondo stato: si sceglie la prima risposta (nel confronto) o la prima ambizione (nel primo incontro) */
    await page.evaluate(sel => { const fr = document.querySelector(sel); const k = fr && fr.closest('.cpm-rise'); const bs = k ? [...k.querySelectorAll('button')].filter(x => x.textContent.trim() !== '×') : []; if (bs[0]) bs[0].click(); }, SEL[caso]);
    await sleep(800);
    const m2 = await page.evaluate(misura, SEL[caso]);
    if (process.env.CPM_FOTO) await page.screenshot({ path: `${process.env.CPM_FOTO}-${W}-${caso}-${braccio}-2.png` });
    esito[W][braccio + ':' + caso] = { aperta: r, m1, m2 }; await ctx.close();
  }
}
await b.close(); srv.close();
const corto = m => m ? { titoli: m.titoli, titolo: m.titolo, occhielli: m.occhielli, testa: m.testa, piede: m.piedeBottoni, corpo: m.corpoBottoni, scrollX: m.scrollX, larg: m.larghezza, misure: m.misure } : null;
for (const W of LARG) {
  const rif = esito[W].riferimento; console.log(`[${W}px] riferimento finestra230:`, JSON.stringify(corto(rif)));
  if (!rif) g.push(`${W}px: la finestra di riferimento non si apre`);
  for (const k of Object.keys(esito[W]).filter(k => k !== 'riferimento')) { const e = esito[W][k]; console.log(`[${W}px] ${k}: 1=`, JSON.stringify(corto(e.m1)), ' 2=', JSON.stringify(corto(e.m2))); }
  const TIT = { confronto: 'Il confronto', incontro: 'Il primo incontro' };
  for (const caso of ['confronto', 'incontro']) {
    const v = esito[W]['verde:' + caso], r = esito[W]['rosso:' + caso];
    if (v) for (const [st, m] of [['1', v.m1], ['2', v.m2]]) {
      const t = `${W}px verde ${caso} stato ${st}`;
      if (!m) { g.push(t + ': la finestra non si apre'); continue; }
      if (m.titoli !== 1) g.push(`${t}: ${m.titoli} titoli (atteso 1)`);
      if (m.titolo !== TIT[caso]) g.push(`${t}: titolo della testa «${m.titolo}» (atteso «${TIT[caso]}»)`);
      if (m.occhielli.length) g.push(`${t}: occhiello ripetuto nel corpo ${JSON.stringify(m.occhielli)}`);
      if (!m.testa) g.push(`${t}: nessuna testa col filo`);
      if (!m.piedeBottoni) g.push(`${t}: nessun pulsante nel piede`);
      if (m.corpoBottoni) g.push(`${t}: ${m.corpoBottoni} pulsanti rimasti nel corpo`);
      if (m.scrollX) g.push(`${t}: scroll orizzontale`);
      if (rif) for (const [k, x] of Object.entries(m.misure)) if (x !== rif.misure[k]) g.push(`${t}: misura ${k}=${x} diversa dal riferimento ${rif.misure[k]}`);
    }
    if (v && r) for (const st of ['m1', 'm2']) if (v[st] && r[st] && JSON.stringify(v[st].righe) !== JSON.stringify(r[st].righe))
      g.push(`${W}px ${caso} ${st}: il testo cambia fra cornice nuova e vecchia\n      verde ${JSON.stringify(v[st].righe)}\n      rosso ${JSON.stringify(r[st].righe)}`);
    if (r && BRACCI.includes('rosso')) { const m = r.m1; const vede = m && (!m.testa || m.occhielli.length > 0 || m.corpoBottoni > 0);
      if (!vede) g.push(`${W}px rosso ${caso}: con __CPM_NO_PROC253 la differenza non si vede ${JSON.stringify(corto(m))}`); }
  }
}
if (g.length) { console.log('❌ procuratore-253'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ procuratore-253 verde: «Il confronto» e «Il primo incontro» nella cornice standard (un titolo in testa, pulsanti nel piede, misure del ModalPannello) a ${LARG.join(' e ')} px; il rosso __CPM_NO_PROC253 si vede`);
