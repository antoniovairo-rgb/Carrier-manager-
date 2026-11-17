#!/usr/bin/env node
/* [giro 236 — PO-430 (G189-18) + PO-322] GUARDIANO STORE-236. Due parti, tutte giudicate.

   PARTE G — i sei piccoli difetti del primo impatto (G189-18), sul codice VERO della pagina:
     G1 figurina della scheda di fine Primavera mai vuota: con il volto caricato il volto copre il riquadro; con il volto che non
        arriva (rete chiusa sulle foto) nel riquadro ci sono le iniziali del calciatore (::before), non un rettangolo vuoto;
     G2 momento chiave del piazzato: «⚽ Tuo gol su punizione al 72'» (correzione del giro 224, qui solo verificata);
     G3 rassegna: niente «Il 0-0», «dopo lo 2-1», «Il FC …», «del FC …» (partite 0-0, 1-1, 2-1, 3-0 vinte/pari/perse);
     G4 duello della stagione: nessuna pillola «Sconosciuto» se il rapporto col rivale non e' ancora nato;
     G5 cori: con la squadra nona dopo 7 giornate nessun coro che proclami il titolo, in nessuna lingua e in nessun tipo di coro;
        con la squadra prima i cori del titolo restano (il filtro non e' un bavaglio); e chantFor passa davvero dal filtro;
     G6 scheda di fine Primavera: un nome solo — «Primavera», mai «Under 18»/«U18» (testo, opzioni comprese).
   PARTE S — store (PO-322), sui file del repository:
     S1 identita' unica com.korward.elite (Capacitor, TWA Gradle, twa-manifest) e target API 36 (TWA esplicito; Capacitor >= 8);
     S2 manifest web e manifest TWA: ogni icona esiste, e' PNG e misura quanto dichiara; c'e' una maskable;
     S3 immagini della scheda: icona 512x512 RGBA <= 1 MB; grafica 1024x500 senza alfa; >= 4 screenshot telefono in 9:16 o 16:9 esatti,
        lati fra 1080 e 3840;
     S4 privacy.html: contatto korward.devteam@gmail.com; nessun altro indirizzo email in privacy.html, PRIVACY_POLICY.md, docs/store/;
     S5 testi della scheda (docs/store/SCHEDA-PLAY.md): titolo <= 30, breve <= 80, completa <= 4000 caratteri, in italiano;
     S6 checklist (docs/store/CHECKLIST-PLAY-CONSOLE.md): il primo passo e' il parere legale sui nomi dei club;
     S7 pacchetto costruibile: tools/build-dist.mjs rifatto qui, dist/index.html presente e senza richiami a CDN.
   PROVA DEL ROSSO (CPM_PROVA_ROSSO=1): la parte G gira con window.__CPM_NO_G236 (+ __CPM_NO_G224 per G2, che e' del giro 224);
   la parte S gira su una COPIA guastata dei file (appId diverso, icona sbagliata, screenshot 1:1, email estranea, titolo lungo,
   checklist senza parere legale, dist vuota). Ogni controllo DEVE cadere; uscita 1 se un rosso non si vede.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node store-236.mjs  ·  CPM_PROVA_ROSSO=1 node store-236.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import { execFileSync } from 'node:child_process';

const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const esiti = {}; const metti = (k, ok, det) => { esiti[k] = { ok: !!ok, det }; console.log(`  ${ok ? '✓' : '✗'} ${k} — ${det}`); };
console.log(`store-236 · braccio ${ROSSO ? 'ROSSO' : 'verde'}`);

/* ───────────────────────────── PARTE S (file) ───────────────────────────── */
const EMAIL_OK = 'korward.devteam@gmail.com';
function png(file) { const b = fs.readFileSync(file); if (b.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), tipo: b[25], byte: b.length }; }
const decEnt = s => s.replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCharCode(parseInt(n, 16)));
const emails = s => (decEnt(s).match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []);
function blocco(md, titolo) { const i = md.indexOf(titolo); if (i < 0) return null; const a = md.indexOf('```', i); if (a < 0) return null;
  const a2 = md.indexOf('\n', a); const b = md.indexOf('```', a2); return b < 0 ? null : md.slice(a2 + 1, b).replace(/\n$/, ''); }

function parteS(R, distDir) {
  // S1
  try { const cap = JSON.parse(fs.readFileSync(path.join(R, 'capacitor.config.json'), 'utf8'));
    const gr = fs.readFileSync(path.join(R, 'twa/android/app/build.gradle'), 'utf8');
    const tm = JSON.parse(fs.readFileSync(path.join(R, 'twa/twa-manifest.json'), 'utf8'));
    const pk = JSON.parse(fs.readFileSync(path.join(R, 'package.json'), 'utf8'));
    const appTwa = (gr.match(/applicationId\s+'([^']+)'/) || [])[1]; const tgt = +((gr.match(/targetSdk\s+(\d+)/) || [])[1] || 0);
    const capMaj = +(((pk.dependencies || {})['@capacitor/android'] || '').match(/(\d+)/) || [0, 0])[1];
    const ids = [cap.appId, appTwa, tm.packageId];
    metti('S1', ids.every(x => x === 'com.korward.elite') && tgt >= 36 && capMaj >= 8 && cap.webDir === 'dist',
      `id ${ids.join(' / ')} · targetSdk TWA ${tgt} · @capacitor/android ^${capMaj} · webDir ${cap.webDir}`);
  } catch (e) { metti('S1', false, 'non giudicato: ' + e.message); }
  // S2
  try { const pb = []; let nIc = 0, mask = 0;
    for (const [mf, base] of [['manifest.webmanifest', R], ['twa/manifest-twa.webmanifest', path.join(R, 'twa')]]) {
      const m = JSON.parse(fs.readFileSync(path.join(R, mf), 'utf8'));
      if (!m.name || !m.short_name || !m.start_url) pb.push(mf + ': name/short_name/start_url');
      for (const ic of m.icons || []) { nIc++; if (/maskable/.test(ic.purpose || '')) mask++;
        /* percorsi del SITO (manifest TWA): /Carrier-manager-/x → x; /Carrier-manager-/twa/x → twa/icone/x (copia di deploy-pages.yml) */
        const sito = ic.src.replace(/^\/Carrier-manager-\//, ''); const daSito = /^twa\//.test(sito) ? sito.replace(/^twa\//, 'twa/icone/') : sito;
        const f = [path.join(base, ic.src), path.join(R, ic.src.replace(/^(\.\.\/)+/, '')), path.join(R, daSito)].find(x => fs.existsSync(x));
        if (!f) { pb.push(mf + ': manca ' + ic.src); continue; } const p = png(f);
        if (!p || `${p.w}x${p.h}` !== ic.sizes) pb.push(`${mf}: ${ic.src} dichiara ${ic.sizes}, misura ${p ? p.w + 'x' + p.h : 'non PNG'}`); } }
    metti('S2', !pb.length && nIc >= 4 && mask >= 2, pb.length ? pb.join(' · ') : `${nIc} icone verificate, ${mask} maskable`);
  } catch (e) { metti('S2', false, 'non giudicato: ' + e.message); }
  // S3
  try { const pb = []; const ic = png(path.join(R, 'store-assets/play-icon-512.png')); const fg = png(path.join(R, 'store-assets/feature-graphic.png'));
    if (!ic || ic.w !== 512 || ic.h !== 512 || ic.tipo !== 6 || ic.byte > 1024 * 1024) pb.push('icona ' + JSON.stringify(ic));
    if (!fg || fg.w !== 1024 || fg.h !== 500 || fg.tipo === 6 || fg.tipo === 4) pb.push('grafica ' + JSON.stringify(fg));
    const dir = path.join(R, 'docs/store/screenshots'); const sh = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.png$/.test(f)) : [];
    for (const f of sh) { const p = png(path.join(dir, f)); const a = Math.max(p.w, p.h), b = Math.min(p.w, p.h);
      if (a * 9 !== b * 16 || b < 1080 || a > 3840) pb.push(`${f} ${p.w}x${p.h}`); }
    if (sh.length < 4) pb.push(`screenshot ${sh.length} (< 4)`);
    metti('S3', !pb.length, pb.length ? pb.join(' · ') : `icona 512 RGBA ${ic.byte} B · grafica 1024x500 · ${sh.length} screenshot 9:16`);
  } catch (e) { metti('S3', false, 'non giudicato: ' + e.message); }
  // S4
  try { const ph = fs.readFileSync(path.join(R, 'privacy.html'), 'utf8'); const fonti = ['privacy.html', 'PRIVACY_POLICY.md'];
    const sd = path.join(R, 'docs/store'); for (const f of fs.readdirSync(sd)) if (/\.(md|html|txt)$/.test(f)) fonti.push('docs/store/' + f);
    const estranee = []; for (const f of fonti) for (const e of emails(fs.readFileSync(path.join(R, f), 'utf8'))) if (e.toLowerCase() !== EMAIL_OK) estranee.push(f + ': ' + e.replace(/^(.).*@/, '$1…@'));
    const c = emails(ph).includes(EMAIL_OK);
    metti('S4', c && !estranee.length, `contatto in privacy.html: ${c ? 'si' : 'NO'} · indirizzi estranei: ${estranee.length ? estranee.join(', ') : 'nessuno'} (${fonti.length} file)`);
  } catch (e) { metti('S4', false, 'non giudicato: ' + e.message); }
  // S5
  try { const md = fs.readFileSync(path.join(R, 'docs/store/SCHEDA-PLAY.md'), 'utf8');
    const t = blocco(md, '## Nome dell\'app'), b = blocco(md, '## Descrizione breve'), l = blocco(md, '## Descrizione completa');
    const n = s => s == null ? -1 : [...s].length; const it = l && /\b(il|la|della|carriera|partite)\b/i.test(l);
    metti('S5', n(t) > 0 && n(t) <= 30 && n(b) > 0 && n(b) <= 80 && n(l) > 200 && n(l) <= 4000 && it, `titolo ${n(t)}/30 · breve ${n(b)}/80 · completa ${n(l)}/4000 · italiano ${it ? 'si' : 'no'}`);
  } catch (e) { metti('S5', false, 'non giudicato: ' + e.message); }
  // S6
  try { const md = fs.readFileSync(path.join(R, 'docs/store/CHECKLIST-PLAY-CONSOLE.md'), 'utf8');
    const primo = (md.match(/^\s*1\.\s+(.+)$/m) || [])[1] || ''; const ok = /parere legale/i.test(primo) && /nomi/i.test(primo);
    metti('S6', ok, 'primo passo: «' + primo.slice(0, 90) + '»');
  } catch (e) { metti('S6', false, 'non giudicato: ' + e.message); }
  // S7
  try { const ix = path.join(distDir, 'index.html'); if (!fs.existsSync(ix)) throw new Error('dist/index.html assente');
    const h = fs.readFileSync(ix, 'utf8'); const cdn = (h.match(/<script[^>]+src=["']https?:\/\/[^"']+/g) || []).length;
    const glb = fs.existsSync(path.join(distDir, 'assets')) ? fs.readdirSync(path.join(distDir, 'assets')).length : 0;
    metti('S7', cdn === 0 && h.length > 1e6 && glb > 10, `dist/index.html ${h.length} byte · script da CDN ${cdn} · voci in dist/assets ${glb}`);
  } catch (e) { metti('S7', false, 'non giudicato: ' + e.message); }
}

/* copia guastata per il braccio rosso della parte S */
function copiaGuastata() {
  const T = fs.mkdtempSync(path.join(os.tmpdir(), 'store236-'));
  const cp = (rel) => { const d = path.join(T, rel); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(path.join(ROOT, rel), d); };
  for (const f of ['capacitor.config.json', 'twa/android/app/build.gradle', 'twa/twa-manifest.json', 'package.json', 'manifest.webmanifest', 'twa/manifest-twa.webmanifest',
    'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'twa/icone/icon-maskable-192.png', 'store-assets/play-icon-512.png', 'store-assets/feature-graphic.png',
    'privacy.html', 'PRIVACY_POLICY.md']) cp(f);
  for (const f of fs.readdirSync(path.join(ROOT, 'docs/store'))) if (fs.statSync(path.join(ROOT, 'docs/store', f)).isFile()) cp('docs/store/' + f);
  const ed = (rel, fn) => { const p = path.join(T, rel); fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8'))); };
  ed('capacitor.config.json', s => s.replace('com.korward.elite', 'com.korward.altro'));
  ed('manifest.webmanifest', s => s.replace('"192x192"', '"256x256"'));
  fs.mkdirSync(path.join(T, 'docs/store/screenshots'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'icon-512.png'), path.join(T, 'docs/store/screenshots/01-quadrato.png'));
  ed('privacy.html', s => s + '\n<!-- prova: mario.rossi@example.com -->');
  ed('docs/store/SCHEDA-PLAY.md', s => s.replace(/(## Nome dell'app[\s\S]*?```\n)([^\n]*)/, (m, a, b) => a + b + ' — nome troppo lungo per lo store'));
  ed('docs/store/CHECKLIST-PLAY-CONSOLE.md', s => s.replace(/parere legale/gi, 'controllo'));
  const D = path.join(T, 'dist-vuota'); fs.mkdirSync(D);
  return { T, D };
}

/* ───────────────────────────── PARTE G (pagina) ───────────────────────────── */
const CLUB = { id: 'cre', n: 'FC Cremona', a: 'CRE', p: 60, c: '#c8102e', c2: '#ffffff', nat: '🇮🇹', lg: 'Primavera 2' };
const BASE = { name: 'Dario Ferrante', nation: 'Italia', avatarId: 3, proStatus: 'u18', u18Seasons: 1, season: 1, week: 38, age: 17, ovr: 68, tutorialDone: true,
  club: CLUB, foot: 'L', goals: 8, assists: 5, matches: 34, form: 70, morale: 50, fatigue: 10, popularity: 40, coachTrust: 60,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 } };

async function parteG() {
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });/* le richieste del service worker non passano da page.route (lezione giro 120) */ const page = await ctx.newPage(); await installCdnRoutes(page);
    const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 140)));
    await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) { window.__CPM_NO_G236 = true; window.__CPM_NO_G224 = true; }
      localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: s })); }, { s: BASE, rosso: ROSSO });
    for (let t = 0; t < 3; t++) { try { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); break; } catch (e) { if (t === 2) throw e; } }
    await page.waitForFunction(() => typeof ProTransitionScreen === 'function' && typeof VOLTI23 !== 'undefined' && !!VOLTI23.idx, null, { timeout: 60000 });
    await sleep(800);
    // scheda di fine Primavera montata fuori dall'app (stesso metodo di piccoli-85)
    const monta = (pl, attesaMs) => page.evaluate(async ({ pl, attesaMs }) => {
      const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0d0f14;overflow:auto'; document.body.appendChild(d);
      const r = ReactDOM.createRoot(d); r.render(React.createElement(ProTransitionScreen, { player: pl, onChoose() {} }));
      const t0 = performance.now(); let fig = null;
      while (performance.now() - t0 < attesaMs) { await new Promise(x => setTimeout(x, 100)); fig = d.querySelector('[data-cpm-figurina]'); const im = fig && fig.querySelector('img'); if (im && im.complete && im.naturalWidth > 0) break; }
      fig = d.querySelector('[data-cpm-figurina]'); const im = fig && fig.querySelector('img'); const box = im && im.parentElement;
      const ini = box && box.querySelector('.fig236'); const cont = ini ? getComputedStyle(ini, '::before').content : '';
      let sopra = ''; if (im) { const q = im.getBoundingClientRect(); const el = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); sopra = el ? el.tagName + (el.className && typeof el.className === 'string' ? '.' + el.className : '') : ''; }
      const testo = d.innerText; const vis = im ? getComputedStyle(im).visibility : '';
      const out = { caricato: !!(im && im.complete && im.naturalWidth > 0), vis, iniziali: cont, sopra, testo, src: im ? im.getAttribute('src') : '' };
      r.unmount(); d.remove(); return out; }, { pl, attesaMs });
    // G1a volto disponibile
    const a = await monta(BASE, 6000);
    // G1b volto che non arriva: rete chiusa sulle foto, calciatore con un altro nome (altra foto, nessuna cache)
    /* un nome il cui volto la pagina non ha MAI chiesto: un volto gia' in cache non passa dalla rotta e la misura non varrebbe */
    const nomeB = await page.evaluate(() => { const gia = new Set(performance.getEntriesByType('resource').map(e => e.name.replace(/^https?:\/\/[^/]+\//, '')));
      const N = ['Tullio Quaranta', 'Ugo Zanetti', 'Ivo Barbieri', 'Elio Marchetti', 'Nando Ruggeri', 'Osvaldo Pace', 'Remo Fontana', 'Sergio Valli'];
      return N.find(n => { const u = voltoUrl('giocatore', n, null); return u && !gia.has(u); }) || null; });
    await page.route('**/assets/portraits/**', r => r.abort());
    const b = nomeB ? await monta({ ...BASE, name: nomeB }, 2500) : null;
    await page.unroute('**/assets/portraits/**');
    const ini = nomeB ? nomeB.split(' ').map(x => x[0]).join('') : '';
    const giudicato = !!b && !b.caricato; const vuoto = giudicato && !new RegExp('["\']' + ini + '["\']').test(b.iniziali);
    metti('G1', a.caricato && a.sopra.startsWith('IMG') && giudicato && !vuoto, `volto disponibile: caricato ${a.caricato}, in cima ${a.sopra || '–'} · volto assente (${nomeB || 'nessun nome libero'}): ${!giudicato ? 'NON GIUDICATO (il volto e\' arrivato lo stesso)' : 'iniziali ' + (b.iniziali || '(nessuna)') + ' → riquadro ' + (vuoto ? 'VUOTO' : 'con iniziali')}`);
    // G6 (stesso testo della scheda: opzioni comprese)
    const sb = [...new Set((a.testo.match(/Under 18|\bU18\b|\bU-18\b/g) || []))];
    const ctx6 = sb.length ? (a.testo.split('\n').filter(r => /Under 18|\bU18\b|\bU-18\b/.test(r)).slice(0, 3).join(' | ')) : '';
    metti('G6', !sb.length && /Primavera/.test(a.testo), sb.length ? 'nella scheda: ' + sb.join(', ') + ' — «' + ctx6.slice(0, 160) + '»' : 'solo «Primavera» nella scheda (titolo, avviso, barra, opzione «resta»)');
    // G2
    const g2 = await page.evaluate(() => momentoPiazzato224('punizione', 72));
    metti('G2', g2 === "⚽ Tuo gol su punizione al 72'", '«' + g2 + '»');
    // G3
    const g3 = await page.evaluate(() => { const out = []; const casi = [[0, 0], [1, 1], [2, 1], [1, 2], [3, 0], [0, 3], [8, 0]];
      for (const [h, w] of casi) { const won = h > w, drew = h === w;
        for (const g of [0, 1]) { const pr = generateLocalPressAnalysis({ won, drew, opponent: 'FC Ankara', homeScore: h, awayScore: w }, { goals: g, assists: 0, rating: 6.4, name: 'Dario Ferrante', club: 'FC Cremona', homeRoster: [] }, { season: 1, week: 7, matchHistory: [] });
          const txt = JSON.stringify(pr); const m = txt.match(/\b[Ii]l 0-\d|\b(?:[Ii]l|[Ll]o) (?:1|8|11)-\d|\b[Ll]o [2-79]-\d|\b(?:[Ii]l|[Dd]el|[Aa]l|[Dd]al|[Nn]el|[Ss]ul) FC\b/g); if (m) out.push(...m); } }
      return [...new Set(out)]; });
    metti('G3', !g3.length, g3.length ? 'forme sbagliate: ' + g3.join(' | ') : '14 rassegne (0-0, 1-1, 2-1, 1-2, 3-0, 0-3, 8-0; con e senza gol): nessuna');
    // G4
    const g4 = await page.evaluate((B) => { const st = initStandings([B.club, { id: 'ank', n: 'FC Ankara', p: 60 }]);
      const r = generateSeasonAwards({ ...B, proStatus: 'pro', club: { ...B.club, lg: 'Lega B' }, rival: { name: 'Leo Marra', relationship: 'sconosciuto', totalGoals: 3, club: { n: 'FC Ankara' } } }, st);
      const r2 = generateSeasonAwards({ ...B, proStatus: 'pro', club: { ...B.club, lg: 'Lega B' }, rival: { name: 'Leo Marra', relationship: 'rivale', totalGoals: 3, club: { n: 'FC Ankara' } } }, st);
      return { sc: r.rival && r.rival.relLabel, riv: r2.rival && r2.rival.relLabel }; }, BASE);
    metti('G4', g4.sc == null && /Rivale/.test(g4.riv || ''), `rapporto non nato → pillola ${g4.sc == null ? 'assente' : '«' + g4.sc + '»'} · rapporto «rivale» → «${g4.riv}»`);
    // G5
    const g5 = await page.evaluate((B) => {
      const clubs = Array.from({ length: 12 }, (_, i) => ({ id: 'c' + i, n: 'FC Club' + i })); clubs[8] = { id: B.club.id, n: B.club.n };
      const st = clubs.map((c, i) => ({ ...c, played: 7, pts: 20 - i * 2, gd: 6 - i, gf: 10, ga: 6 }));
      const nono = { ...B, proStatus: 'pro', club: { ...B.club, lg: 'Lega B' }, standings: st };
      const primo = { ...nono, standings: st.map(r => r.id === B.club.id ? { ...r, pts: 99 } : r) };
      const tipi = ['home', 'pressure', 'winning', 'goal', 'derby', 'comeback']; const leghe = ['Lega B', 'Premier Division', 'Championship', 'Deutsche Liga', 'Ligue Nationale', 'Liga Ibérica'];
      let titoliNono = [], titoliPrimo = 0;
      for (const lg of leghe) for (const t of tipi) { const pool = chantPoolFor(t, false, 'Italia', lg); const alt = chantPoolFor('home', false, 'Italia', lg);
        const a1 = filtraCoriTitolo236(pool, { ...nono, club: { ...nono.club, lg } }, 'career', alt); for (const x of a1) if (CORO_TITOLO236.test(x)) titoliNono.push(lg + '/' + t + ': ' + x);
        const a2 = filtraCoriTitolo236(pool, { ...primo, club: { ...primo.club, lg } }, 'career', alt); titoliPrimo += a2.filter(x => CORO_TITOLO236.test(x)).length; }
      const fonte = String(document.documentElement.innerHTML).length > 0; return { titoliNono: [...new Set(titoliNono)], titoliPrimo, fonte }; }, BASE);
    const src = fs.readFileSync(path.join(ROOT, 'src/15-live-match.jsx'), 'utf8'); const viaFiltro = /const pool=filtraCoriTitolo236\(chantPoolFor\(_type/.test(src);
    metti('G5', !g5.titoliNono.length && g5.titoliPrimo > 0 && viaFiltro, `nona dopo 7 giornate: ${g5.titoliNono.length} cori del titolo${g5.titoliNono.length ? ' (' + g5.titoliNono.slice(0, 3).join(' | ') + ')' : ''} · prima: ${g5.titoliPrimo} cori del titolo tenuti · chantFor passa dal filtro: ${viaFiltro ? 'si' : 'no'}`);
    if (err.length) console.log('  · errori di pagina: ' + err.slice(0, 3).join(' | '));
    // foto (solo braccio verde): la scheda col volto assente
    if (!ROSSO) { try { await page.route('**/assets/portraits/**', r => r.abort());
      await page.evaluate((pl) => { const d = document.createElement('div'); d.id = 'f236'; d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0d0f14;overflow:auto'; document.body.appendChild(d);
        ReactDOM.createRoot(d).render(React.createElement(ProTransitionScreen, { player: pl, onChoose() {} })); }, { ...BASE, name: 'Tullio Quaranta' });
      await sleep(1500); fs.mkdirSync(path.join(ROOT, 'tests/visual/out'), { recursive: true });
      await page.screenshot({ path: path.join(ROOT, 'tests/visual/out/store-236-scheda-senza-volto.png') }); } catch (e) {} }
  } finally { await browser.close(); srv.close(); }
}

/* ───────────────────────────── esecuzione ───────────────────────────── */
let tmp = null;
try {
  await parteG();
  if (!ROSSO) { try { execFileSync(process.execPath, [path.join(ROOT, 'tools', 'build-dist.mjs')], { cwd: ROOT, stdio: 'pipe' }); }
    catch (e) { console.log('  · build-dist fallita: ' + String(e.stderr || e.message).slice(0, 200)); }
    parteS(ROOT, path.join(ROOT, 'dist')); }
  else { tmp = copiaGuastata(); parteS(tmp.T, tmp.D); }
} catch (e) { console.log('  ✗ esecuzione interrotta: ' + String(e && e.message || e).slice(0, 300)); }
finally { if (tmp) fs.rmSync(tmp.T, { recursive: true, force: true }); }

const ATTESI = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
const mancanti = ATTESI.filter(k => !esiti[k]);
if (!ROSSO) { const ko = ATTESI.filter(k => !esiti[k] || !esiti[k].ok);
  console.log(ko.length ? `STORE-236 ROSSO: ${ko.join(', ')}${mancanti.length ? ' (non giudicati: ' + mancanti.join(', ') + ')' : ''}` : 'STORE-236 VERDE: 13/13 (6 difetti G189-18 chiusi · 7 controlli store)');
  process.exit(ko.length ? 1 : 0); }
else { const ciechi = ATTESI.filter(k => !esiti[k] || esiti[k].ok);
  console.log(ciechi.length ? `PROVA DEL ROSSO FALLITA: non cadono ${ciechi.join(', ')}` : 'PROVA DEL ROSSO OK: 13/13 controlli cadono');
  process.exit(ciechi.length ? 1 : 0); }
