#!/usr/bin/env node
/* [giro 260 · seguito del giro 258 (dubbio 2) · decisione PO 17/11 E] GUARDIANO podio-260. Il podio dei premi (Podio23, src/16) a
   375 px coi quattro nomi di club piu' lunghi del gioco (FC Sampierdarena Primavera, FC Biancocelesti, Catanzarese Primavera,
   Wolverhampton). Monta la schermata VERA dei premi (SeasonAwardsScreen) fuori dall'app, con i premi generati dal gioco
   (generateSeasonAwards) e i tre podi di ciascun premio riempiti coi quattro nomi a rotazione: ogni nome passa in ogni gradino
   (centro e lati), in tutti e quattro i podi (capocannoniere: club · MVP: «N assist · club» · Re dei Bomber: lega/club ·
   Trofeo d'Oro: lega/club · trofei · OVR).
   Giudica ogni riquadro di testo sotto le figurine (nome del premiato e riga sotto): togliendo il taglio a 2 righe misura le righe
   NATURALI e se una parola esce dalla colonna. Regola: al piu' 2 righe e nessuna parola fuori colonna, quindi il nome si legge
   intero (con il taglio a 2 righe una terza riga sparisce, una parola piu' larga della colonna viene mozzata).
   Bracci: VERDE (gioco) deve stare nella regola; ROSSO window.__CPM_NO_G260 deve violarla (com'era prima del giro 260).
   «Non giudicato» (meno di 4 podi o 36 riquadri misurati, errori di pagina) = rosso. Foto (podio dell'MVP, la riga «N assist · club») in out/podio-260-<braccio>.png.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node podio-260.mjs   (CPM_PARTE=verde|rosso) */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const PARTE = process.env.CPM_PARTE || 'tutto';
const NOMI = ['FC Sampierdarena Primavera', 'FC Biancocelesti', 'Catanzarese Primavera', 'Wolverhampton'];
const CLUB = { id: 'cre', n: 'FC Cremona', a: 'CRE', p: 60, c: '#c8102e', c2: '#ffffff', nat: '🇮🇹', lg: 'Lega B' };
const BASE = { name: 'Dario Ferrante', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 2, week: 38, age: 19, ovr: 72, tutorialDone: true,
  club: CLUB, foot: 'L', goals: 9, assists: 5, matches: 30, form: 70, morale: 50, fatigue: 10, popularity: 40, coachTrust: 60,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 } };

async function braccio(b, port, rosso) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, serviceWorkers: 'block' }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 140)));
  await page.addInitScript(({ rosso }) => { window.__CPM_GLB = false; window.__CPM_FIS_APERTE = true; if (rosso) window.__CPM_NO_G260 = true; }, { rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => typeof SeasonAwardsScreen === 'function' && typeof generateSeasonAwards === 'function', null, { timeout: 90000 });
  await sleep(600);
  const misure = [];
  for (let rot = 0; rot < 4; rot++) {
    const m = await page.evaluate(async ({ B, NOMI, rot }) => {
      const tre = [0, 1, 2].map(k => NOMI[(rot + k) % 4]);
      const st = initStandings([B.club, { id: 'ank', n: 'FC Ankara', p: 60 }]);
      const aw = generateSeasonAwards(B, st);
      const persone = ['Leo Marra', 'Ivo Barbieri', 'Remo Fontana'];
      const riga = (k, extra) => ({ name: persone[k], goals: 20 - k * 3, assists: 9 - k, club: tre[k], league: tre[k], ovr: 84 - k, trofei: 2, ...extra });
      const top3 = [0, 1, 2].map(k => riga(k));
      const awards = { ...aw,
        leagueTopScorer: { ...(aw.leagueTopScorer || {}), top3, playerWins: false, playerPos: 5 },
        leagueMvp: { ...(aw.leagueMvp || {}), top3, playerWins: false, playerPos: 5 },
        scarpaOro: { ...(aw.scarpaOro || {}), top3, playerWins: false, playerPos: 5 },
        palloneOro: { ...(aw.palloneOro || {}), top3, playerWins: false, playerPos: 5 } };
      const d = document.createElement('div'); d.id = 'p260'; d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0d0f14;overflow:auto'; document.body.appendChild(d);
      const r = ReactDOM.createRoot(d); r.render(React.createElement(SeasonAwardsScreen, { awards, player: B, season: B.season, club: B.club, onContinue() {} }));
      await new Promise(x => setTimeout(x, 1200));
      const podi = [...d.querySelectorAll('[data-cpm=podio23]')]; const out = { podi: podi.length, riquadri: [] };
      for (const [pi, p] of podi.entries()) for (const col of p.children) {
        const testi = [...col.children].filter(x => x.tagName === 'DIV' && !x.querySelector('img,canvas,svg') && x.textContent.trim() && getComputedStyle(x).webkitLineClamp !== 'none' && getComputedStyle(x).webkitLineClamp !== '');
        for (const t of testi) { const lh = parseFloat(getComputedStyle(t).lineHeight) || 14.4; const tagliato = t.scrollHeight > t.clientHeight + 1;
          const c = t.cloneNode(true); c.style.webkitLineClamp = 'none'; c.style.display = 'block'; c.style.overflow = 'visible'; c.style.maxHeight = 'none'; c.style.width = t.clientWidth + 'px';
          c.style.position = 'absolute'; c.style.visibility = 'hidden'; col.appendChild(c);
          const righe = Math.round(c.scrollHeight / lh); const fuori = c.scrollWidth > c.clientWidth + 1; c.remove();
          out.riquadri.push({ podio: pi, testo: t.textContent.trim(), larg: t.clientWidth, righe, fuori, tagliato }); } }
      r.unmount(); d.remove(); return out; }, { B: BASE, NOMI, rot });
    misure.push(m);
  }
  /* foto: rotazione 0 rimontata, scorrimento fino al primo podio */
  const foto = path.join(ROOT, 'tests/visual/out', `podio-260-${rosso ? 'rosso' : 'verde'}.png`);
  try { await page.evaluate(async ({ B, NOMI }) => { const st = initStandings([B.club, { id: 'ank', n: 'FC Ankara', p: 60 }]); const aw = generateSeasonAwards(B, st);
      const top3 = [0, 1, 2].map(k => ({ name: ['Leo Marra', 'Ivo Barbieri', 'Remo Fontana'][k], goals: 20 - k * 3, assists: 9 - k, club: NOMI[k], league: NOMI[k], ovr: 84 - k, trofei: 2 }));
      top3[0].club = NOMI[0]; top3[1].club = NOMI[3]; top3[2].club = NOMI[2];
      const awards = { ...aw, leagueTopScorer: { ...(aw.leagueTopScorer || {}), top3, playerWins: false, playerPos: 5 }, leagueMvp: { ...(aw.leagueMvp || {}), top3, playerWins: false, playerPos: 5 } };
      const d = document.createElement('div'); d.id = 'p260f'; d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0d0f14;overflow:auto'; document.body.appendChild(d);
      ReactDOM.createRoot(d).render(React.createElement(SeasonAwardsScreen, { awards, player: B, season: B.season, club: B.club, onContinue() {} }));
      await new Promise(x => setTimeout(x, 1500));
      const salta = [...d.querySelectorAll('button,a,[role=button]')].find(x => /Salta il gal/i.test(x.textContent)); if (salta) { salta.click(); await new Promise(x => setTimeout(x, 1200)); }
      const p = d.querySelectorAll('[data-cpm=podio23]')[1]; if (p) p.scrollIntoView({ block: 'center' }); }, { B: BASE, NOMI });
    await sleep(800); fs.mkdirSync(path.dirname(foto), { recursive: true });
    const pod = page.locator('#p260f [data-cpm=podio23]').nth(1); await pod.screenshot({ path: foto }); } catch (e) { console.log('  · foto non fatta: ' + String(e.message).slice(0, 100)); }
  await ctx.close();
  const tutti = misure.flatMap(m => m.riquadri); const podi = Math.min(...misure.map(m => m.podi));
  const ko = tutti.filter(x => x.righe > 2 || x.fuori);
  return { podi, n: tutti.length, ko, err, maxRighe: Math.max(0, ...tutti.map(x => x.righe)), largMin: Math.min(...tutti.map(x => x.larg)), largMax: Math.max(...tutti.map(x => x.larg)) };
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let v = null, r = null;
try { if (PARTE !== 'rosso') v = await braccio(b, port, false); if (PARTE !== 'verde') r = await braccio(b, port, true); }
finally { await b.close(); srv.close(); }
const descr = x => `${x.podi} podi per rotazione · ${x.n} riquadri · colonne ${x.largMin}-${x.largMax} px · righe max ${x.maxRighe} · fuori regola ${x.ko.length}` +
  (x.ko.length ? ' (' + [...new Set(x.ko.map(k => `«${k.testo.slice(0, 40)}» ${k.righe} righe${k.fuori ? ' + parola fuori colonna' : ''} in ${k.larg} px`))].slice(0, 5).join(' · ') + ')' : '') + (x.err.length ? ' · errori ' + x.err.join(' | ') : '');
let ok = true;
if (process.env.CPM_DETT) for (const x of [v, r].filter(Boolean)) for (const k of x.ko) console.log('   ·', k.podio, k.larg, k.righe, k.fuori, k.testo);
if (v) { const giud = v.podi >= 4 && v.n >= 36 && !v.err.length; const vOk = giud && !v.ko.length; ok = ok && vOk;
  console.log(`VERDE: ${vOk ? '✓' : '✗'}${giud ? '' : ' NON GIUDICATO'} ${descr(v)}`); }
if (r) { const giud = r.podi >= 4 && r.n >= 36 && !r.err.length; const rOk = giud && r.ko.length > 0; ok = ok && rOk;
  console.log(`ROSSO __CPM_NO_G260: ${rOk ? '✓ bocciato' : '✗ non bocciato'}${giud ? '' : ' NON GIUDICATO'} ${descr(r)}`); }
console.log(ok ? '✓ podio-260 VERDE' : '✗ podio-260 ROSSO');
process.exit(ok ? 0 : 1);
