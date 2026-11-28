#!/usr/bin/env node
/* [giro 445] GUARDIANO capelli-445: STEMPIATI e LUNGHI RACCOLTI giudicati dalla RESA (il 440 era verde sul tipo con due tagli che il PO ha
   bocciato: «calotta liscia color pelle», «nuca a gradini», «da davanti un caschetto, la coda non si vede»). GLB acceso, ingresso in campo,
   salvataggio fixtures/save-190-s12-ovr93.json, notte e giorno. Misure: misura-445.mjs.
   Corpi: stempiati Keith Carr e Noah Marshall (del salvataggio), Rupert Hammond (taglio forzato dal banco), Jackson Burke (taglio e colore
   della figurina 29 del manifest, forzati); lunghi raccolti Declan Russell, Aaron Lane, Oscar Hayes, Samuelito Vairo (eroe, testa fine)
   forzati dal banco, Gary Howard con taglio e colore della figurina 200 del manifest (window.__CPM_TAGLIO440 / __CPM_FIG445, solo ?cpmtest=1).
   SOGLIE DICHIARATE PRIMA DI MISURARE:
     · COPERTURA: 0 pixel di capelli dipinti visibili (render a colori d'identita') in ognuna delle 5 viste: davanti, due lati, tre quarti
       da dietro, dietro.
     · CAPELLI VERI: da dietro i capelli nostri (alfa >= 0,5) sono almeno il 60% della testa (chignon escluso).
     · STEMPIATURA (stempiati): sulle tempie (|az| 28-46, da 2 a 8 gradi sopra l'attaccatura dipinta) pelle (alfa < 0,3) >= 60%; al centro
       (|az| <= 8, da 3 a 10 gradi sopra) capelli (alfa > 0,5) >= 50%.
     · SFUMATURA: larghezza mediana dell'attaccatura davanti (alfa da 0,1 a 0,9 lungo l'elevazione, |az| <= 40) fra 3 e 12 gradi.
     · COLORE: (capelli - pelle) nel render vero di lato contro (capelli - pelle) della figurina (hc e p misurati sul ritratto), CIE76 <= 15
       (la differenza toglie la luce della scena, come il «contributo» della barba nel 440).
     · CODA (lunghi raccolti): chignon >= 4% della testa di lato, in tre quarti e da dietro; >= 1% da davanti (sopra la sommita').
     · COMPENETRAZIONE in movimento: all'ingresso, in 5 pose di sforzo della testa (+-35 gradi avanti/indietro, +-45 di lato, una mista) e
       in 6 scene hl_* forzate (almeno 4 scene e 8 campioni), 0 vertici della testa fuori dal
       guscio (tolleranza 0,5 mm) e 0 vertici di collo/spalle/busto dentro lo chignon.
   Rosso del MOVIMENTO window.__CPM_NO_G445M: lo stesso guscio rigido sull'osso head anche sulla nuca deve compenetrare (> 0 vertici fuori),
   altrimenti la misura e' cieca → rosso. Un corpo non giudicato = rosso. ROSSO window.__CPM_NO_G445 (= resa del 440): deve cadere su almeno meta' dei corpi, altrimenti la misura e'
   cieca → rosso. Uso: node capelli-445.mjs · CPM_SOLO=verde,giorno,rosso,movimento */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriEPronti } from './misura-432.mjs';
import { identita445, VISTE_ID445, attaccatura445, figurina445, penetra445, lab445, hex445 } from './misura-445.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g445', { recursive: true });
const SOLO = (process.env.CPM_SOLO || 'verde,giorno,rosso,movimento').split(',');
export const SOGLIE445 = { nero: 0, capelli: 0.60, tempie: 0.60, centro: 0.50, sfum: [3, 12], dE: 15, coda: 0.04, codaDavanti: 0.01 };
export const FORZA445G = { 'Declan Russell': 'lunghi raccolti', 'Aaron Lane': 'lunghi raccolti', 'Oscar Hayes': 'lunghi raccolti', 'Samuelito Vairo': 'lunghi raccolti', 'Rupert Hammond': 'stempiati e corti' };
export const FIG445G = { 'Gary Howard': 200, 'Jackson Burke': 29 };
export const STEMPIATI = ['Keith Carr', 'Noah Marshall', 'Rupert Hammond', 'Jackson Burke'], LUNGHI = ['Declan Russell', 'Aaron Lane', 'Oscar Hayes', 'Samuelito Vairo', 'Gary Howard'];
const SCENE = [3, 14, 50, 79, 133, 161];
export const conFig = (b, fig) => ({ newContext: async o => { const c = await b.newContext(o); await c.addInitScript(m => { window.__CPM_FIG445 = m; }, fig); return c; } });
const dE = (a, b) => (a && b) ? +Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]).toFixed(1) : null;
export async function misuraCorpi445(b, port, flags, tod) {
  const { ctx, p, ok } = await apriEPronti(conFig(b, FIG445G), port, flags, tod, null, FORZA445G);
  if (!ok) { await ctx.close(); return { giudicato: false, motivo: 'ingresso non raggiunto' }; }
  const righe = [];
  for (const nome of [...STEMPIATI, ...LUNGHI]) {
    const tipo = STEMPIATI.includes(nome) ? 'stempiato' : 'lunghi';
    const f = await figurina445(p, nome).catch(() => null); const id = await identita445(p, nome, VISTE_ID445).catch(() => null); const at = await attaccatura445(p, nome).catch(() => null);
    if (!f || !id || !at || at.senza) { righe.push({ nome, tipo, giudicato: false }); continue; }
    const neri = Object.fromEntries(Object.entries(id).map(([k, v]) => [k, v.nero])); const dt = id.dietro;
    const capelli = +(dt.capelli / Math.max(1, dt.testa - dt.chignon)).toFixed(2);
    const L = id.lato; const d3 = (L.rgbCapelli && L.rgbPelle) ? lab445(L.rgbCapelli).map((x, i) => x - lab445(L.rgbPelle)[i]) : null; const dF = (f.hc && f.p) ? lab445(hex445(f.hc)).map((x, i) => x - lab445(hex445(f.p))[i]) : null;
    const coda = Object.fromEntries(['davanti', 'lato', 'trequarti', 'dietro'].map(k => [k, +(id[k].chignon / Math.max(1, id[k].testa)).toFixed(3)]));
    righe.push({ nome, tipo, giudicato: true, cal: f.cal, fig: f.fig, neri, capelli, tempie: at.tempie, centro: at.centro, sfum: at.sfum, dE: dE(d3, dF), coda, hc: f.hc });
  }
  await ctx.close(); return { giudicato: true, righe };
}
export function giudica445(x) {
  const ko = [], S = SOGLIE445;
  const nv = Object.entries(x.neri).filter(([, v]) => v > S.nero); if (nv.length) ko.push('capelli dipinti visibili ' + nv.map(([k, v]) => k + ' ' + v).join(','));
  if (!(x.capelli >= S.capelli)) ko.push(`capelli da dietro ${x.capelli}`);
  if (x.tipo === 'stempiato') { if (!(x.tempie >= S.tempie)) ko.push(`tempie ${x.tempie}`); if (!(x.centro >= S.centro)) ko.push(`centro ${x.centro}`); }
  if (!(x.sfum != null && x.sfum >= S.sfum[0] && x.sfum <= S.sfum[1])) ko.push(`sfumatura ${x.sfum}`);
  if (!(x.dE != null && x.dE <= S.dE)) ko.push(`colore ${x.dE}`);
  if (x.tipo === 'lunghi') { for (const k of ['lato', 'trequarti', 'dietro']) if (!(x.coda[k] >= S.coda)) ko.push(`coda ${k} ${x.coda[k]}`); if (!(x.coda.davanti >= S.codaDavanti)) ko.push(`coda davanti ${x.coda.davanti}`); }
  return ko;
}
async function movimento(b, port, flags = []) {
  const R = { scene: 0, campioni: 0, sforzo: 0, vert: 0, buchi: 0, mmMax: 0, dentro: 0, vistiCorpo: 0, chi: {} };
  const { ctx, p, ok } = await apriEPronti(conFig(b, FIG445G), port, flags, 'night', null, FORZA445G);
  const somma = m => { if (!m) return; R.vert += m.vert; R.buchi += m.buchi; R.mmMax = Math.max(R.mmMax, m.mmMax); R.dentro += m.dentro; R.vistiCorpo += m.vistiCorpo; for (const [k, v] of Object.entries(m.chi)) R.chi[k] = (R.chi[k] | 0) + v; };
  try {
    if (!ok) { R.errore = 'ingresso non raggiunto'; return R; }
    somma(await penetra445(p));
    /* PROVA DI SFORZO: testa ruotata sull'osso head (colpo di testa, sguardo di lato), stessa misura, poi ripristino */
    for (const sf of [[0.61, 0], [-0.61, 0], [0, 0.79], [0, -0.79], [-0.45, 0.6]]) { const m = await penetra445(p, sf); if (m) { R.sforzo++; somma(m); } }
    const clic = (re) => p.evaluate((s) => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null); const x = bs.find(q => new RegExp(s, 'i').test(q.textContent || '')); if (x) x.click(); return !!x; }, re).catch(() => false);
    for (let k = 0; k < 80; k++) { const f = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (f === 'playing') break; await clic('Salta|Continua|Siamo pronti'); await sleep(700); }
    if (!await p.evaluate(() => typeof window.__CPM_FORCE_SIT === 'function' && typeof window.__CPM_LOAD_ALL === 'function').catch(() => false)) { R.errore = 'forzatura delle scene non disponibile'; return R; }
    await p.evaluate(() => window.__CPM_LOAD_ALL()); await sleep(500);
    for (const gi of SCENE) { await p.evaluate(i => window.__CPM_FORCE_SIT(i, false), gi); await sleep(1200); let visti = 0;
      for (let s = 0; s < 3; s++) { const ph = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
        if (/^hl_/.test(ph || '')) { const m = await penetra445(p).catch(() => null); if (m && (m.corpi > 0 || m.chig > 0)) { visti++; R.campioni++; somma(m); } } await sleep(400); }
      if (visti) R.scene++; }
  } catch (e) { R.errore = String(e && e.message || e).slice(0, 200); } finally { await ctx.close(); }
  return R;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const lav = [];
  if (SOLO.includes('verde')) lav.push(misuraCorpi445(b, port, [], 'night').then(r => ['verde', r]));
  if (SOLO.includes('giorno')) lav.push(misuraCorpi445(b, port, [], 'day').then(r => ['giorno', r]));
  if (SOLO.includes('rosso')) lav.push(misuraCorpi445(b, port, ['__CPM_NO_G445'], 'night').then(r => ['rosso', r]));
  const out = Object.fromEntries(await Promise.all(lav));
  if (SOLO.includes('movimento')) [out.movimento, out.movimentoRosso] = await Promise.all([movimento(b, port), movimento(b, port, ['__CPM_NO_G445M'])]);
  await b.close(); srv.close(); fs.writeFileSync('out/g445/capelli-445.json', JSON.stringify(out, null, 1));
  const g = []; let rosso = false; const KO = m => { g.push('✗ ' + m); rosso = true; }, OK = m => g.push('✓ ' + m);
  for (const br of ['verde', 'giorno']) { const R = out[br]; if (!R) continue; if (!R.giudicato) { KO(`${br}: non giudicato (${R.motivo})`); continue; }
    const ng = R.righe.filter(x => !x.giudicato); const fu = R.righe.filter(x => x.giudicato && giudica445(x).length);
    (!ng.length ? OK : KO)(`${br}: corpi giudicati ${R.righe.length - ng.length}/${R.righe.length}${ng.map(x => ' · ' + x.nome).join('')}`);
    (!fu.length ? OK : KO)(`${br}: resa entro le soglie ${R.righe.length - ng.length - fu.length}/${R.righe.length}${fu.map(x => ' · ' + x.nome + ' (' + giudica445(x).join(', ') + ')').join('')}`);
    for (const x of R.righe.filter(y => y.giudicato)) g.push(`  ${br} ${x.nome} (${x.tipo}${x.fig ? ', figurina ' + x.fig : ''}): neri ${Object.values(x.neri).join('/')} · capelli dietro ${x.capelli} · tempie ${x.tempie} · centro ${x.centro} · sfumatura ${x.sfum != null ? x.sfum.toFixed(1) : null}° · ΔE ${x.dE}${x.tipo === 'lunghi' ? ' · coda ' + Object.values(x.coda).join('/') : ''}`); }
  if (out.rosso) { const R = out.rosso; if (!R.giudicato) KO(`rosso: non giudicato (${R.motivo})`); else { const B = R.righe.filter(x => x.giudicato); const f = B.filter(x => giudica445(x).length);
    (B.length && f.length >= B.length / 2 ? OK : KO)(`rosso (resa del 440): il difetto si vede su ${f.length}/${B.length} corpi (>= meta')${f.slice(0, 9).map(x => ' · ' + x.nome + ' (' + giudica445(x).join(', ') + ')').join('')}`); } }
  if (out.movimento) { const C = out.movimento;
    (!C.errore && C.scene >= 4 && C.campioni >= 8 && C.sforzo === 5 && C.vert > 0 && C.buchi === 0 ? OK : KO)(`movimento: ${C.buchi} vertici della testa fuori dal guscio su ${C.vert} (max ${C.mmMax} mm; ingresso + ${C.sforzo} pose di sforzo della testa + ${C.campioni} campioni in ${C.scene} scene hl_*)${C.errore ? ' · ' + C.errore : ''}${Object.keys(C.chi).length ? ' · ' + JSON.stringify(C.chi).slice(0, 300) : ''}`);
    const M = out.movimentoRosso; (M && !M.errore && M.vert > 0 && M.buchi > 0 ? OK : KO)(`movimento, rosso __CPM_NO_G445M (guscio rigido sull'osso head anche sulla nuca): ${M ? M.buchi : '?'} vertici fuori su ${M ? M.vert : '?'} (max ${M ? M.mmMax : '?'} mm) — la misura vede la compenetrazione`);
    (!C.errore && C.vistiCorpo > 0 && C.dentro === 0 ? OK : KO)(`movimento: ${C.dentro} vertici di collo/spalle/busto dentro lo chignon su ${C.vistiCorpo} controllati`); }
  console.log(g.join('\n')); console.log(rosso ? '\ncapelli-445: ROSSO' : '\ncapelli-445: VERDE'); process.exit(rosso ? 1 : 0);
}
