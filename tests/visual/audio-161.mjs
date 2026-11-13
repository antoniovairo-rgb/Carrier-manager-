#!/usr/bin/env node
/* [giro 161 · decisioni PO 11/11] GUARDIANO dell'audio del giro 161 — `npm run audio-161`.
   Tre decisioni da tenere in piedi:
     (1) fuori dalla partita la musica suona SOLO nelle cerimonie (premiazioni · presentazione · fine stagione), con brani CC0;
     (2) fischi della curva sul gol SUBITO: l'evento GoalAgainst ora viene emesso, SENZA cambiare la sequenza della partita;
     (3) l'«ohh» dello stadio da una registrazione CC0 (Wikimedia Commons) al posto della sintesi.
   A. STATICO (dal repo)
      1. le tre uscite nuove sono nel registro LICENZE.json, CC0, con pagina, autore, data e sha256 della sorgente;
      2. un SOLO punto di emissione (golSubito161, src/09) e tre chiamate dai due scrittori del gol subito (src/15);
         nel blocco del giro 161 nessun Math.random (la partita non deve consumare un sorteggio in piu');
      3. CareerApp dichiara la cerimonia con un solo effetto (AudioMgr.ceremony).
   B. NEL BROWSER, sul sito servito come su GitHub Pages (dist-web, audio vero, niente ?cpmtest)
      4. dopo il primo gesto i tre file nuovi sono decodificati;
      5. GoalAgainst → fischi DA FILE (crowd.boo) e contatore dell'AudioMgr;
      6. palo / tiro fuori → «ohh» DA FILE (crowd.ohh);
      7. musica: nessuna fuori dalle cerimonie (home, carriera), il brano giusto dentro ciascuna, e si spegne all'uscita.
   C. PARTITA VERA (?cpmtest, autoplay seedato, stessa partita nei due bracci)
      8. ogni gol subito del libro mastro (`cpmEv goal side:away`) ha la sua emissione (testimone __CPM_GA161), e ce n'e' almeno uno
         (zero gol subiti = NON GIUDICATO = rosso);
      9. la SEQUENZA della partita (libro mastro senza i timestamp e senza `npd`, misura di strumentazione non seedata) e il risultato sono IDENTICI fra verde e rosso:
         l'emissione non cambia la partita. Questo controllo vale per entrambi i bracci (e' il confronto fra i due).
   Bracci: VERDE deve passare; ROSSO (`__CPM_NO_G161`) deve CADERE su 4-8. Verde e rosso stampati per ultimi.
   «Non giudicato» (sonda assente, pagina che non monta, nessun gol subito, partita non finita) = rosso. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launchBrowser, startServer, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(QUI, '../..');
const DIST = path.resolve(process.env.CPM_DIST || path.join(ROOT, 'dist-web'));
const REG = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/audio/LICENZE.json'), 'utf8'));
/* [giro 186] dal giro 175 la partita e' riproducibile: con 7300/'Pv' la partita di prova finisce 1-0 senza gol subiti (controllo 8 NON GIUDICATO).
   Scansione 186 (seme 7300): Pv/Fischi/Rossi/Leo/Bianchi/Verdi 0 gol subiti; 'Ga161' 3-1 con un gol subito (via cronaca), identica in ogni corsa. */
const SEME = +(process.env.CPM_A161_SEED || 7300), NOME = process.env.CPM_A161_NOME || 'Ga161';

/* ---------------- A. statico ---------------- */
const st = []; const ok = (nome, cond, info) => st.push({ nome, ok: !!cond, info });
const NUOVI = { 'sfx/crowd/ohh-1': ['crowd.ohh', 'commons-ohh-france-usa'], 'music/awards/trionfo': ['music.premiazioni', 'oga-triumphant'], 'music/ceremony/il-mondo-e-nostro': ['music.cerimonia', 'oga-world-is-ours'] };
const male = Object.entries(NUOVI).filter(([n, [ev, sid]]) => { const v = REG.file[n]; return !v || v.evento !== ev || v.sorgente.id !== sid || !/CC0/.test(v.sorgente.licenza) || !v.sorgente.pagina || !v.sorgente.autore || !v.sorgente.letta || !/^[0-9a-f]{64}$/.test(v.sorgente.sha256); }).map(([n]) => n);
ok('1 tre file nuovi nel registro, CC0 con fonte completa', male.length === 0, `incompleti/assenti ${JSON.stringify(male)}`);
const s09 = fs.readFileSync(path.join(ROOT, 'src/09-audio-scout-anagrafiche.jsx'), 'utf8');
const s15 = fs.readFileSync(path.join(ROOT, 'src/15-live-match.jsx'), 'utf8');
const s18 = fs.readFileSync(path.join(ROOT, 'src/18-career-app.jsx'), 'utf8');
const def = (s09.match(/^function golSubito161\(/gm) || []).length, chiamate = (s15.match(/golSubito161\(/g) || []).length;
const rigaDef = (s09.match(/^function golSubito161\(.*$/m) || [''])[0];
const blocchi161 = [rigaDef, (s09.match(/function _cerStart161[\s\S]*?\n  function ceremony[^\n]*\n[^\n]*\n[^\n]*/) || [''])[0]].join('\n');
ok('2 un solo punto di emissione, tre chiamate, nessun Math.random', def === 1 && chiamate === 3 && blocchi161.length > 200 && !/Math\.random/.test(blocchi161), `definizioni ${def} · chiamate in src/15 ${chiamate} · blocco ${blocchi161.length} car.`);
ok('3 CareerApp dichiara la cerimonia con un solo effetto', (s18.match(/AudioMgr\.ceremony\(_cer161\)/g) || []).length === 1, '');

/* ---------------- B. browser sul sito ---------------- */
if (!process.env.CPM_NO_BUILD) execFileSync('node', [path.join(ROOT, 'tools/build-dist.mjs'), '--web'], { stdio: 'ignore' });
if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error(`manca ${DIST}/index.html`); process.exit(2); }
const BASE = '/Carrier-manager-/';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (!u.startsWith(BASE)) { r.writeHead(404); return r.end(); }
  u = u.slice(BASE.length) || 'index.html'; if (u.endsWith('/')) u += 'index.html';
  const f = path.join(DIST, u); if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Content-Length': fs.statSync(f).size }); fs.createReadStream(f).pipe(r);
}).listen(0);
const URLG = `http://localhost:${srv.address().port}${BASE}`;

async function sito(rosso) {
  const b = await launchBrowser(); const passi = [];
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  if (rosso) await ctx.addInitScript(() => { window.__CPM_NO_G161 = true; });
  const errs = []; const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await p.goto(URLG, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  const monta = await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 30000 }).then(() => true).catch(() => false);
  await p.mouse.click(206, 40).catch(() => {});
  let s = null; const t0 = Date.now();
  while (monta && Date.now() - t0 < 30000) {
    s = await p.evaluate(() => (typeof window.__CPM_AUDIO149 === 'function' ? window.__CPM_AUDIO149() : null)).catch(() => null);
    if (s && ['crowd.ohh', 'music.premiazioni', 'music.cerimonia'].every(k => s.eventi[k] && s.eventi[k].file.every(f => f.caricato))) break;
    await sleep(500);
  }
  const nuovi = s ? ['crowd.ohh', 'music.premiazioni', 'music.cerimonia'].map(k => `${k}:${s.eventi[k] ? s.eventi[k].file.filter(f => f.caricato).length + '/' + s.eventi[k].n : 'assente'}`) : [];
  const car = s ? ['crowd.ohh', 'music.premiazioni', 'music.cerimonia'].every(k => s.eventi[k] && s.eventi[k].file.every(f => f.caricato)) : false;
  passi.push({ nome: '4 tre file nuovi decodificati dopo il primo gesto', ok: monta && car, info: `monta=${monta} · ${nuovi.join(' · ') || 'sonda assente'}` });
  const r = monta ? await p.evaluate(async () => {
    const A = () => window.__CPM_AUDIO161 ? window.__CPM_AUDIO161() : null; const P = k => ((A() || { plays: {} }).plays[k] | 0); const o = { sonda: !!A() };
    if (!o.sonda) return o;
    let a = P('crowd.boo'), g = A().golSubiti; AudioMgr.event({ type: 'GoalAgainst' }); o.fischi = P('crowd.boo') - a; o.golSubiti = A().golSubiti - g;
    a = P('crowd.ohh'); AudioMgr.event({ type: 'CoherenceCheck', outKind: 'post' }); AudioMgr.event({ type: 'CoherenceCheck', outKind: 'wide' }); o.ohh = P('crowd.ohh') - a;
    const mus = []; const passo = async (cosa, fn) => { fn(); await new Promise(z => setTimeout(z, 300)); mus.push([cosa, A().musica]); };
    const pm = P('music.premiazioni'), pc = P('music.cerimonia');
    await passo('home', () => AudioMgr.scene('home')); await passo('carriera', () => AudioMgr.scene('career'));
    await passo('premiazioni', () => AudioMgr.ceremony('premiazioni')); await passo('fine', () => AudioMgr.ceremony(null));
    await passo('finestagione', () => AudioMgr.ceremony('finestagione')); await passo('presentazione', () => AudioMgr.ceremony('presentazione'));
    await passo('fine2', () => AudioMgr.ceremony(null)); await passo('carriera2', () => AudioMgr.scene('career'));
    o.mus = mus; o.brani = { premiazioni: P('music.premiazioni') - pm, cerimonia: P('music.cerimonia') - pc };
    return o;
  }).catch(e => ({ sonda: false, err: String(e).slice(0, 100) })) : { sonda: false };
  passi.push({ nome: '5 gol subito → fischi della curva da file', ok: r.sonda && r.fischi === 1 && r.golSubiti === 1, info: `sonda=${r.sonda} · fischi da file ${r.fischi} · contatore ${r.golSubiti}` });
  passi.push({ nome: '6 palo e tiro fuori → «ohh» registrato da file', ok: r.sonda && r.ohh === 2, info: `ohh da file ${r.ohh}` });
  const M = Object.fromEntries((r.mus || []).map(([k, v]) => [k, v]));
  const musOk = r.sonda && M.home == null && M.carriera == null && M.premiazioni === 'cer:premiazioni' && M.fine == null && M.finestagione === 'cer:finestagione' && M.presentazione === 'cer:presentazione' && M.fine2 == null && M.carriera2 == null && r.brani && r.brani.premiazioni === 1 && r.brani.cerimonia === 2;
  passi.push({ nome: '7 musica SOLO nelle cerimonie, il brano giusto, spenta all\'uscita', ok: musOk, info: `${JSON.stringify(r.mus || [])} · brani avviati ${JSON.stringify(r.brani || {})}` });
  passi.push({ nome: '  errori di pagina (sito)', ok: errs.length === 0, info: JSON.stringify(errs.slice(0, 3)) });
  await b.close(); return passi;
}

/* ---------------- C. partita vera ---------------- */
async function partita(rosso) {
  const s = await startServer(); const port = s.address().port; const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript((rosso) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G161 = true; }, rosso);
  const ev = []; let finita = false, score = null;
  try {
    await openMatch(page, port, { skipLoadAll: true, name: NOME });
    await page.evaluate((s2) => window.__CPM_AUTOPLAY(true, { seed: s2, policy: 'seeded', tickMs: 300 }), SEME);
    for (let k = 0; k < 30 && !finita; k++) {
      finita = await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'ended', null, { timeout: 20000, polling: 500 }).then(() => true).catch(() => false);
      ev.push(...await page.evaluate(() => { const e = (window.__CPM_EV && window.__CPM_EV()) || []; if (window.__CPM_EV_RESET) window.__CPM_EV_RESET(); return e; }));
    }
    score = await page.evaluate(() => { const x = window.__CPM_SCORE && window.__CPM_SCORE(); return x ? { h: x.home | 0, a: x.away | 0 } : null; });
  } catch (e) { errs.push('flusso: ' + String(e.message).slice(0, 100)); }
  const ga = await page.evaluate(() => window.__CPM_GA161 || { n: 0, src: {} }).catch(() => ({ n: -1, src: {} }));
  await b.close(); s.close();
  const seq = ev.map(e => { const o = {}; for (const k of Object.keys(e).sort()) if (k !== 'ts' && k !== 't' && k !== 'npd') o[k] = e[k]; /* npd: distanza letta da matchPlayers, che ha Math.random per costruzione — varia anche verde contro verde (misurato: 8/297 voci, solo questo campo) */ return o; });
  const golSub = ev.filter(e => e.ev === 'goal' && e.side === 'away').length;
  return { finita, score, ga, golSub, seq, errs };
}

const verdeS = await sito(false), rossoS = await sito(true); srv.close();
const verdeP = await partita(false), rossoP = await partita(!process.env.CPM_A161_AA); /* CPM_A161_AA=1: verde contro verde (variabilita' di base) */
if (process.env.CPM_A161_DUMP) fs.writeFileSync(process.env.CPM_A161_DUMP, JSON.stringify({ verde: verdeP.seq, rosso: rossoP.seq }));
const fp = x => JSON.stringify(x.seq);
let div = -1; for (let i = 0; i < Math.max(verdeP.seq.length, rossoP.seq.length); i++) if (JSON.stringify(verdeP.seq[i]) !== JSON.stringify(rossoP.seq[i])) { div = i; break; }
const uguale = verdeP.finita && rossoP.finita && verdeP.seq.length > 20 && fp(verdeP) === fp(rossoP) && JSON.stringify(verdeP.score) === JSON.stringify(rossoP.score);
const seqInfo = `voci ${verdeP.seq.length} vs ${rossoP.seq.length} · risultato ${JSON.stringify(verdeP.score)} vs ${JSON.stringify(rossoP.score)}${div >= 0 ? ' · prima differenza alla voce ' + div + ': ' + JSON.stringify(verdeP.seq[div]).slice(0, 120) + ' ≠ ' + JSON.stringify(rossoP.seq[div]).slice(0, 120) : ''}`;
const passiP = (P, rosso) => [
  { nome: '8 ogni gol subito ha la sua emissione (e almeno uno)', ok: P.finita && P.golSub > 0 && P.ga.n === P.golSub, info: `finita=${P.finita} · gol subiti nel libro mastro ${P.golSub} · emissioni ${P.ga.n} ${JSON.stringify(P.ga.src)}${P.golSub === 0 ? ' · NON GIUDICATO' : ''}` },
  { nome: '9 sequenza della partita identica fra verde e rosso', ok: uguale, info: seqInfo },
  { nome: '  errori di pagina (partita)', ok: P.errs.length === 0, info: JSON.stringify(P.errs.slice(0, 3)) }];
const V = [...verdeS, ...passiP(verdeP, false)], R = [...rossoS, ...passiP(rossoP, true)];
console.log('A. STATICO'); for (const x of st) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
console.log('B+C. braccio VERDE'); for (const x of V) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
console.log('B+C. braccio ROSSO (__CPM_NO_G161 = audio del giro 149)'); for (const x of R) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
const statico = st.every(x => x.ok), verde = statico && V.every(x => x.ok);
/* il rosso deve cadere sui controlli dell'audio (4-8); il 9 e' il confronto fra i bracci e deve restare verde anche li' */
const rossoCade = R.filter(x => /^[4-8] /.test(x.nome)).every(x => !x.ok) && R.find(x => x.nome.startsWith('9 ')).ok;
console.log(`VERDE: ${verde ? 'PASSA' : 'NON PASSA'}`);
console.log(`ROSSO: ${rossoCade ? 'CADE (come deve) su 4-8, sequenza della partita identica' : 'NON CADE come deve — il guardiano e\' cieco'}`);
process.exit(verde && rossoCade ? 0 : 1);
