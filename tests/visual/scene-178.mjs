#!/usr/bin/env node
/* [giro 178 · PO-367, D3 + D6 del giro 170] SONDA E GUARDIANO «scene-178».
   Misura, per 4 club (chiaro, scuro, saturo, bianco), il colore RESO A SCHERMO nelle scene 3D (partita, presentazione, parata, galà,
   intro) e, nell'intro, la frazione del corpo dell'eroe dentro l'inquadratura FOTOGRAMMA PER FOTOGRAMMA (375x812, 412x915, 1440x900).
   Strumenti in lib/colore178.mjs (campione piatto = «sviluppo» del colore; maschera = pixel veri di maglie e bandiere).

   Uso (da tests/visual, un browser alla volta):
     CPM_FASE=prima CPM_SCENE=intro,presentazione,parata,gala,partita node scene-178.mjs     → misura e foto (docs/sviluppo/giro178/)
     npm run scene-178                       → GUARDIANO: verde se le soglie (dichiarate PRIMA della correzione) reggono
     CPM_ROSSO=1 npm run scene-178           → prova del rosso: accende __CPM_NO_G178_COLORE e __CPM_NO_G178_INTRO, deve uscire ≠0
   SOGLIE (dichiarate nel rapporto prima di correggere, mai abbassate):
     S1  ΔE2000(campione piatto della scena, campione piatto della partita) ≤ 2,0 per ogni club e ogni scena fuori partita;
     S2  intro: ΔE2000(bandiere a schermo, campione piatto dell'intro dello stesso esadecimale) ≤ 6,0 e almeno 200 pixel di bandiera;
     S3  intro: in OGNI fotogramma disegnato con l'eroe visibile, ≥ 90% delle ossa dell'eroe e la testa dentro il quadro (tel 375 e 412);
         su PC la stessa misura non deve peggiorare rispetto al riferimento del rosso (PC invariato);
     S4  intro: zero oggetti THREE.Points nella folla (il tifo a quadratini) e almeno una folla a sagome presente.
   «Non giudicato» (scena non misurata, nessun fotogramma, nessun pixel) = ROSSO. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import { INIT178, dE, hexRGB, CLUB178 } from './lib/colore178.mjs';

const FASE = process.env.CPM_FASE || '';
const GIUDICA = !FASE;
const ROSSO = process.env.CPM_ROSSO === '1';
const SCENE = (process.env.CPM_SCENE || 'intro,presentazione,parata,gala,partita').split(',');
/* club per cui si apre una pagina (maglie vere): tutti e quattro in misura; nel guardiano uno solo (saturo), perche' i CAMPIONI dei quattro
   esadecimali si leggono tutti nella stessa pagina e sono loro a decidere S1 */
const CLUBS = (process.env.CPM_CLUBS ? process.env.CPM_CLUBS.split(',') : (GIUDICA ? ['saturo'] : CLUB178.map(c => c.k))).map(k => CLUB178.find(c => c.k === k)).filter(Boolean);
const HEXES = CLUB178.map(c => c.c).concat(['#8e1f33']);
const OUT = path.join(ROOT, 'docs/sviluppo/giro178'); fs.mkdirSync(OUT, { recursive: true });
const FOTO = !!FASE;
const FMT = { tel: { width: 375, height: 812 }, tel412: { width: 412, height: 915 }, pc: { width: 1440, height: 900 } };
const INTRO_FMT = (process.env.CPM_INTRO_FMT || 'tel,tel412,pc').split(',');
const ris = { fase: FASE || (ROSSO ? 'guardiano-rosso' : 'guardiano'), quando: new Date().toISOString(), scene: {} };
/* in misura le scene si accumulano nello stesso file della fase (la partita si misura in una corsa a parte: e' lunga) */
if (FASE) { try { const prev = JSON.parse(fs.readFileSync(path.join(OUT, `misure-${FASE}.json`))); for (const [k, v] of Object.entries(prev.scene || {})) if (!SCENE.includes(k)) ris.scene[k] = v; } catch (e) {} }

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const URL0 = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const SAVE_U18 = (club) => ({ phase: 'career', player: { name: 'Giro Centosettantotto', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, age: 16, ovr: 60, tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 1, presidentModalSeason: 1,
  drawSeen: 1, mercatoSeen: 1, coachPactSeason: 1, presentedClub: club.id, presentSeason: 1, seasonPledge: { season: 1, tone: 'equilibrato' }, squadRole: 'titolare', club,
  stats: { 'velocità': 60, tecnica: 60, fisico: 60, 'mentalità': 60, tiro: 60, passaggio: 60, dribbling: 60, posizionamento: 60 }, form: 70, morale: 70, fatigue: 20, coachTrust: 60, teamChemistry: 60, popularity: 10, bankBalance: 1000,
  goals: 0, assists: 0, matches: 0, totalMatches: 0, totalGoals: 0, matchHistory: [], contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } });
const SAVE_PRO = { phase: 'career', player: { name: 'Marco Carrasco', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 11, week: 39, age: 28, ovr: 93, club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#8e1f33', c2: '#f0b33a', nat: '🏴', lg: 'Premier Division' },
  stats: { 'velocità': 92, tecnica: 93, fisico: 88, 'mentalità': 92, tiro: 94, passaggio: 90, dribbling: 92, posizionamento: 93 }, form: 95, morale: 100, fatigue: 37, popularity: 90, value: 120, bankBalance: 2000000, contract: { duration: 3, wage: 120000, expiresAtSeason: 14 } } };
const SAVE_190 = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
/* il club dell'intro: e' quello della maglia dell'eroe (granata, «Giovanni Pisano numero 9»), non il club del giocatore */
const INTRO178 = { k: 'intro', c: '#8e1f33', c2: '#f2f2f2' };
const clubDi = (C) => ({ id: 'g178' + C.k, n: 'FC Prova ' + C.k, a: 'PRV', p: 66, c: C.c, c2: C.c2, nat: '🇮🇹', lg: 'Lega A' });

async function pagina(fmt, save, extra) { const ctx = await b.newContext({ viewport: FMT[fmt], deviceScaleFactor: fmt === 'pc' ? 1 : 2, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  page.on('pageerror', e => console.log('  ⚠ pageerror', String(e.message || e).slice(0, 160)));
  await page.addInitScript(INIT178);
  await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (o.rosso) { window.__CPM_NO_G178_COLORE = true; window.__CPM_NO_G178_INTRO = true; } if (o.extra) Object.assign(window, o.extra); if (o.luce) window.__CPM_G178_LUCE = o.luce;
    try { localStorage.setItem('cpm-intro-seen', '1'); if (o.s) localStorage.setItem('cpm-v3', JSON.stringify(o.s)); } catch (e) {} }, { s: save || null, rosso: ROSSO, extra: extra || null, luce: process.env.CPM_LUCE ? JSON.parse(process.env.CPM_LUCE) : null });
  await page.goto(URL0, { waitUntil: 'load', timeout: 120000 }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200); page._ctx = ctx; return page; }
async function carriera(fmt, save) { const page = await pagina(fmt, save); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1200); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} return page; }
const foto = async (page, nome) => { if (!FOTO) return; await page.screenshot({ path: path.join(OUT, `${FASE}-${nome}.png`) }).catch(() => {}); console.log('  📷', `${FASE}-${nome}.png`); };
const mis = (page, hexes, kind) => page.evaluate(([h, k]) => window.__G178_MIS(h, k), [hexes, kind]).catch(e => ({ errore: String(e.message || e).slice(0, 200) }));
const prova = async (nome, fn) => { if (!SCENE.includes(nome)) return; console.log('\n== ' + nome); const t = Date.now(); try { await fn(); } catch (e) { console.log('  ❌ ' + nome + ': ' + String(e.message || e).slice(0, 240)); (ris.scene[nome] = ris.scene[nome] || {}).errore = String(e.message || e).slice(0, 240); } console.log('  (' + ((Date.now() - t) / 1000 | 0) + ' s)'); };
const breve = (m) => { if (!m || m.errore) return m; const o = { r: m.renderer, lum: m.lum }; for (const [h, R] of Object.entries(m.club)) o[h] = { c: R.campione, cl: R.campioneLuce, m: R.maglia && R.maglia.rgb, mn: R.maglia && R.maglia.n, b: R.bandiere && R.bandiere.rgb, bn: R.bandiere && R.bandiere.n }; return o; };

/* ---------------- partita (riferimento) ---------------- */
await prova('partita', async () => { const S = ris.scene.partita = { club: {} };
  for (const C of CLUBS) { const save = JSON.parse(JSON.stringify(SAVE_190)); save.player.club = { ...save.player.club, c: C.c, c2: C.c2 };
    const page = await carriera('tel', save); const fase = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    for (let k = 0; k < 160 && (await fase()) !== 'playing'; k++) { await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Salta/i.test(b.textContent || '')) || bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua|Calcio d'inizio|Inizia/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(650); }
    await page.waitForFunction(() => window.__CPM_GLB_READY === true && typeof window.__CPM_FORCE_SIT === 'function', null, { timeout: 120000 }).catch(() => console.log('  ⚠ GLB non pronto'));
    await page.evaluate(() => { window.__CPM_TOD = 'day'; window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_FORCE_SIT(18, true); }); await sleep(3500);
    const m = await mis(page, HEXES, 'tex'); S.club[C.k] = m; console.log('  ', C.k, JSON.stringify(breve(m)).slice(0, 700)); await foto(page, `partita-tel-${C.k}`); await page._ctx.close(); } });

/* ---------------- presentazione ---------------- */
await prova('presentazione', async () => { const S = ris.scene.presentazione = { club: {} };
  for (const C of CLUBS) { const page = await carriera('tel', SAVE_U18(clubDi(C)));
    await page.evaluate(() => window.__CPM_CAREER.apriPresentazione(4)); await sleep(6500);
    const m = await mis(page, HEXES, 'hex'); S.club[C.k] = m; console.log('  ', C.k, JSON.stringify(breve(m)).slice(0, 700)); await foto(page, `presentazione-tel-${C.k}`); await page._ctx.close(); } });

/* ---------------- parata ---------------- */
await prova('parata', async () => { const S = ris.scene.parata = { club: {} };
  for (const C of CLUBS) { const page = await pagina('tel', null); await page.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function' || typeof window.__CPM_PARATA_C === 'function', null, { timeout: 60000 });
    await page.evaluate((club) => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>'; ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C || window.__CPM_PARATA_C, { club, euroWin: false, avatarId: 0, heroNum: 9 })); }, clubDi(C));
    await sleep(9000); const m = await mis(page, HEXES, 'hex'); S.club[C.k] = m; console.log('  ', C.k, JSON.stringify(breve(m)).slice(0, 700)); await foto(page, `parata-tel-${C.k}`); await page._ctx.close(); } });

/* ---------------- galà ---------------- */
await prova('gala', async () => { const S = ris.scene.gala = { club: {} }; const page = await carriera('tel', SAVE_PRO);
  await page.evaluate(() => window.__CPM_CAREER.apriGala()); await sleep(4500);
  const m = await mis(page, HEXES, 'hex'); for (const C of CLUBS) S.club[C.k] = m; console.log('  ', JSON.stringify(breve(m)).slice(0, 700)); await foto(page, 'gala-tel'); await page._ctx.close(); });

/* ---------------- intro ---------------- */
await prova('intro', async () => { const S = ris.scene.intro = { club: {}, quadro: {} };
  for (const fmt of INTRO_FMT) { const colore = fmt === 'tel';
    for (const C of (colore ? [INTRO178].concat(CLUBS) : [null])) {
      const page = await pagina(fmt, null, (C && C !== INTRO178) ? { __CPM_G178_CLUB: { c: C.c, c2: C.c2 } } : null);
      await page.evaluate(() => { window.__CPM_INTRO115 = {}; window.__CPM_INTRO118 = {}; window.__G178_INTRO = []; window.__G178_INTRO_ON = true; window.dispatchEvent(new CustomEvent('cpm-replay-intro')); });
      await page.waitForFunction(() => window.__CPM_INTRO118 && window.__CPM_INTRO118.av && window.__CPM_INTRO118.av.hero, null, { timeout: 90000 }).catch(() => console.log('  ⚠ corpi intro non pronti'));
      const el = () => page.evaluate(() => (window.__CPM_INTRO115 || {}).el).catch(() => null);
      const tappe = [[0.5, '1-apertura'], [4.5, '2-corsa'], [7, '3-ralenti'], [9.0, '4-tiro'], [10.2, '5-gol'], [13.5, '6-esulta'], [17, '7-chiusura']];
      for (const [t, n] of tappe) { const t0 = Date.now(); while (Date.now() - t0 < 60000) { const e = await el(); if (e == null || e >= t) break; await sleep(100); }
        if (C && n === '6-esulta') { const m = await mis(page, Array.from(new Set(HEXES.concat([C.c, INTRO178.c, '#a3263a']))), 'hex'); S.club[C.k] = m; console.log('  ', C.k, JSON.stringify(breve(m)).slice(0, 700)); }
        if (!C || C === INTRO178 || n === '6-esulta') await foto(page, `intro-${fmt}${C ? '-' + C.k : ''}-${n}`); }
      const t0 = Date.now(); while (Date.now() - t0 < 30000) { const e = await el(); if (e == null || e >= 19.5) break; await sleep(200); }
      const q = await page.evaluate(() => { const L = (window.__G178_INTRO || []).filter(x => x.vis && x.f != null && x.el != null); const fuori = L.filter(x => x.f < 0.9 || x.testa === false);
        let pts = 0; const sag = []; try { const R = window.__R178.filter(r => r.sc).sort((a, b) => b.tl - a.tl)[0]; R.sc.traverse(o => { if (o.isPoints && o.geometry && o.geometry.attributes.position && o.geometry.attributes.position.count > 300) pts++; /* il tifo a punti (900 e 520); i coriandoli (140) non sono tifo */ if (o.userData && o.userData.folla178) sag.push(o.name || 'sagome'); }); } catch (e) {}
        return { serie: L.map(x => [x.el, x.f]), n: L.length, fuori: fuori.length, minF: L.length ? Math.min(...L.map(x => x.f)) : null, primi: fuori.slice(0, 6), points: pts, sagome: sag.length }; });
      if (!C || C === INTRO178) { S.quadro[fmt] = q; console.log('  quadro', fmt, JSON.stringify({ ...q, serie: undefined })); }
      await page._ctx.close(); if (colore && !GIUDICA && false) break; } } });

await b.close(); srv.close();
fs.writeFileSync(path.join(OUT, `misure-${ris.fase}.json`), JSON.stringify(ris, null, 1));

/* ---------------- tabella ΔE e giudizio ---------------- */
const P = ris.scene.partita && ris.scene.partita.club; const rif = {};
if (P) for (const m of Object.values(P)) if (m && m.club) for (const [h, R] of Object.entries(m.club)) if (R.campione && !rif[h]) rif[h] = R;
let rifFile = null; try { rifFile = JSON.parse(fs.readFileSync(path.join(OUT, 'riferimento-partita.json'))); } catch (e) {}
if (Object.keys(rif).length && FASE) fs.writeFileSync(path.join(OUT, 'riferimento-partita.json'), JSON.stringify(rif, null, 1));
const REF = Object.keys(rif).length ? rif : (rifFile || {});
const f1 = x => x == null ? 'n.d.' : x.toFixed(1); const righe = []; const rossi = [];
for (const [sc, S] of Object.entries(ris.scene)) { if (S.errore) { rossi.push(`${sc}: errore ${S.errore}`); continue; }
  for (const C of (sc === 'intro' ? [INTRO178].concat(CLUBS) : CLUBS)) { const m = S.club && S.club[C.k]; if (sc === 'intro' && !INTRO_FMT.includes('tel')) continue;
    if (!m || m.errore || !m.club) { rossi.push(`${sc}/${C.k}: non giudicato (${m && m.errore || 'nessuna misura'})`); continue; }
    const R = m.club[C.c], Rf = REF[C.c] || (C === INTRO178 ? REF['#8e1f33'] : null); if (!R || !R.campione) { rossi.push(`${sc}/${C.k}: campione non letto`); continue; }
    const dCampRif = Rf ? dE(R.campione, Rf.campione) : null, dCampHex = dE(R.campione, hexRGB(C.c)), dLuceRif = Rf && R.campioneLuce ? dE(R.campioneLuce, Rf.campioneLuce) : null;
    const dMag = R.maglia ? dE(R.maglia.rgb, hexRGB(C.c)) : null, dMagRif = (R.maglia && Rf && Rf.maglia) ? dE(R.maglia.rgb, Rf.maglia.rgb) : null;
    const dBan = R.bandiere ? dE(R.bandiere.rgb, R.campione) : null;
    righe.push(`| ${sc} | ${C.k} ${C.c} | ${R.campione.join(',')} | ${f1(dCampRif)} | ${f1(dCampHex)} | ${f1(dLuceRif)} | ${R.maglia ? R.maglia.rgb.join(',') + ' (' + R.maglia.n + ')' : '—'} | ${f1(dMag)} | ${f1(dMagRif)} | ${R.bandiere ? R.bandiere.rgb.join(',') + ' (' + R.bandiere.n + ')' : '—'} | ${f1(dBan)} | ${m.renderer.tone}/${m.renderer.expo}/${m.renderer.enc} | ${m.lum} |`);
    if (false) { if (dCampRif == null) rossi.push(`${sc}/${C.k}: manca il riferimento della partita (non giudicato)`); else if (dCampRif > 2.0) rossi.push(`${sc}/${C.k}: S1 ΔE campione ${dCampRif.toFixed(2)} > 2,0`); }
    if (sc === 'intro') { if (!R.bandiere || R.bandiere.n < 200) rossi.push(`intro/${C.k}: S2 bandiere non lette (${R.bandiere ? R.bandiere.n : 0} px)`); else if (dBan > 6.0) rossi.push(`intro/${C.k}: S2 ΔE bandiere ${dBan.toFixed(2)} > 6,0`); } } }
/* S1: per OGNI scena fuori partita e per OGNI esadecimale dei quattro club, il campione piatto contro quello della partita */
for (const [sc, S] of Object.entries(ris.scene)) { if (sc === 'partita' || S.errore) continue; const pag = Object.values(S.club || {}).filter(m => m && m.club);
  for (const C of CLUB178) { const R = pag.map(m => m.club[C.c]).find(x => x && x.campione), Rf = REF[C.c];
    if (!R) { rossi.push(`${sc}/${C.k}: S1 campione non letto (non giudicato)`); continue; } if (!Rf) { rossi.push(`${sc}/${C.k}: S1 manca il riferimento della partita (non giudicato)`); continue; }
    const d = dE(R.campione, Rf.campione); ris.s1 = ris.s1 || []; ris.s1.push({ scena: sc, club: C.k, hex: C.c, dE: +d.toFixed(2) }); if (d > 2.0) rossi.push(`${sc}/${C.k}: S1 ΔE campione ${d.toFixed(2)} > 2,0`); } }
if (SCENE.some(x => x !== 'partita') && !Object.keys(REF).length) rossi.push('S1: nessun riferimento della partita (non giudicato)');
const Q = ris.scene.intro && ris.scene.intro.quadro;
if (SCENE.includes('intro')) { for (const fmt of INTRO_FMT) { const q = Q && Q[fmt]; if (!q || !q.n) { rossi.push(`intro ${fmt}: S3 nessun fotogramma (non giudicato)`); continue; }
    if (fmt !== 'pc' && q.fuori > 0) rossi.push(`intro ${fmt}: S3 ${q.fuori}/${q.n} fotogrammi con l'eroe fuori (min ${q.minF})`);
    if (fmt === 'pc') { let base = null; try { base = JSON.parse(fs.readFileSync(path.join(OUT, 'misure-prima.json'))).scene.intro.quadro.pc; } catch (e) {} if (base && q.n && base.n && q.fuori / q.n > base.fuori / base.n + 0.02) rossi.push(`intro pc: S3 peggiorato ${q.fuori}/${q.n} contro ${base.fuori}/${base.n}`); }
    if (q.points > 0 || !(q.sagome > 0)) rossi.push(`intro ${fmt}: S4 Points=${q.points}, folla a sagome=${q.sagome}`); } }
const tab = ['| scena | club | campione piatto (RGB) | ΔE vs partita | ΔE vs hex | ΔE campione illuminato vs partita | maglia a schermo | ΔE maglia vs hex | ΔE maglia vs partita | bandiere/sciarpe | ΔE bandiere vs campione | tone/esp/enc | luminanza media |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|'].concat(righe).join('\n');
fs.writeFileSync(path.join(OUT, `misure-${ris.fase}.json`), JSON.stringify(ris, null, 1));
fs.writeFileSync(path.join(OUT, `tabella-${ris.fase}.md`), tab + '\n\nS1: ' + JSON.stringify(ris.s1 || []) + '\n\nQuadro intro: ' + JSON.stringify(Q || null) + '\n\nRossi: ' + JSON.stringify(rossi, null, 1) + '\n');
console.log('\n' + tab + '\n'); console.log('quadro intro', JSON.stringify(Q || null));
if (rossi.length) { console.log('\n🔴 scene-178 ROSSO (' + rossi.length + '):\n - ' + rossi.join('\n - ')); }
else console.log('\n🟢 scene-178 VERDE: S1 campione ≤ 2,0 su ogni club e scena · S2 bandiere intro ≤ 6,0 · S3 eroe dentro il quadro in ogni fotogramma (tel) · S4 folla a sagome');
if (GIUDICA && ROSSO) { console.log(rossi.length ? '\n✅ prova del rosso riuscita: con __CPM_NO_G178_COLORE + __CPM_NO_G178_INTRO il guardiano e\' ROSSO' : '\n❌ prova del rosso FALLITA: coi rossi accesi il guardiano resta verde'); process.exit(rossi.length ? 0 : 1); }
process.exit(GIUDICA ? (rossi.length ? 1 : 0) : 0);
