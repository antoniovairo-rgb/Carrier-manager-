/* [giro 237 — PO-502] GUARDIANO web-237: LA PAGINA WEB PUBBLICATA E' GIA' TRADOTTA, COME QUELLA DELLO STORE.
   Serve la cartella che il deploy pubblica (default dist-web/, prodotta da `node tools/build-dist.mjs --web`; CPM_WEB237_DIR
   per un'altra, es. _site nel workflow) sui due indirizzi del sito (radice e /CARRIER-MANAGER-AV.html) e pretende:
   (1) la pagina non SCARICA Babel (nessuna richiesta *babel*.js) e non lo ESEGUE (window.Babel assente, nessun
       <script type="text/babel"> nel documento, nessun «text/babel» nel file servito);
   (2) avvio fino al menu («Nuova carriera») sotto SOGLIA_MS, mediana di N_APERTURE pagine nuove;
   (3) un salvataggio esistente (fixtures/save-194-primavera-w38.json, scritto in cpm-v3 come lo trova il gioco) viene
       caricato: «Continua» presente, la carriera si apre col club del salvataggio, il salvataggio resta leggibile;
   (4) zero errori di pagina, zero richieste esterne (rete bloccata: offline come lo Store).
   Prova del rosso: CPM_PROVA_ROSSO=1 serve dist-web-babel/ (`--web --babel-browser`, la ritirata dichiarata = traduzione nel
   browser): il guardiano DEVE essere rosso su (1) e (2). Uscita: 0 verde, 1 rosso, 2 non giudicato (= rosso). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './lib/harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ROSSO = process.env.CPM_PROVA_ROSSO === '1';
const SOGLIA_MS = 4000;      /* misurato giro 237: tradotta ~0,6 s, Babel nel browser ~10 s sul banco cloud */
const N_APERTURE = 3;
const DIR = path.resolve(ROOT, process.env.CPM_WEB237_DIR || (ROSSO ? 'dist-web-babel' : 'dist-web'));
const braccio = ROSSO ? 'ROSSO (dist-web-babel, Babel nel browser)' : 'VERDE';
const fine = (code, msg) => { console.log(`\n[web-237] braccio ${braccio} · cartella ${path.relative(ROOT, DIR) || '.'} · ${msg}`); process.exit(code); };

/* la cartella si costruisce se manca (stessa build del deploy) */
if (!process.env.CPM_WEB237_DIR && !process.env.CPM_WEB237_NOBUILD) {
  execFileSync('node', [path.join(ROOT, 'tools/build-dist.mjs'), '--web', ...(ROSSO ? ['--babel-browser'] : [])], { stdio: 'ignore' });
}
const fIdx = path.join(DIR, 'index.html');
if (!fs.existsSync(fIdx)) fine(2, `NON GIUDICATO: manca ${fIdx}`);

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
/* gli indirizzi del sito: «/» e «/CARRIER-MANAGER-AV.html» servono lo stesso file (deploy-pages copia dist-web/index.html su entrambi) */
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]); if (p === '/' || p === '/CARRIER-MANAGER-AV.html') p = '/index.html';
  const fp = path.join(DIR, p); if (!fp.startsWith(DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(fp, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); res.end(d); });
});
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const html = fs.readFileSync(fIdx, 'utf8');
const issues = [];
if (html.includes('type="text/babel"')) issues.push('il file servito contiene <script type="text/babel">');
if (/babel-standalone\/[0-9.]+\/babel(\.min)?\.js/.test(html)) issues.push('il file servito carica babel-standalone da CDN');

const browser = await launchBrowser();
const apri = async (url, seed) => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  const ev = { babel: 0, esterne: [], errori: [] };
  page.on('request', r => { if (/babel[^/]*\.js(\?|$)/i.test(r.url())) ev.babel++; });
  page.on('pageerror', e => ev.errori.push(e.message.slice(0, 140)));
  await page.route(/^https?:\/\//, route => { const u = route.request().url(); if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(u)) return route.continue(); ev.esterne.push(u.slice(0, 80)); return route.abort(); });
  if (seed) await page.addInitScript(s => { if (!sessionStorage.getItem('w237')) { sessionStorage.setItem('w237', '1'); localStorage.setItem('cpm-v3', s); } }, seed);
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  const menuOk = await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => /nuova carriera/i.test(b.textContent || '')), null, { timeout: 60000 }).then(() => true).catch(() => false);
  const ms = Date.now() - t0;
  const rt = await page.evaluate(() => ({ babelGlobale: typeof window.Babel !== 'undefined', scriptBabel: document.querySelectorAll('script[type="text/babel"]').length }));
  return { ctx, page, ev, ms, menuOk, ...rt };
};

const tempi = [];
for (let i = 0; i < N_APERTURE; i++) {
  const url = `http://localhost:${port}/${i % 2 ? 'CARRIER-MANAGER-AV.html' : ''}`;
  const a = await apri(url);
  tempi.push(a.ms);
  console.log(`apertura ${i + 1} ${url.replace(/^http:\/\/localhost:\d+/, '') || '/'}: menu ${a.menuOk ? a.ms + ' ms' : 'NON RAGGIUNTO'} · babel chiesto ${a.ev.babel} · window.Babel ${a.babelGlobale} · script text/babel ${a.scriptBabel} · esterne ${a.ev.esterne.length} · errori ${a.ev.errori.length}`);
  if (!a.menuOk) issues.push(`apertura ${i + 1}: menu non raggiunto in 60 s`);
  if (a.ev.babel) issues.push(`apertura ${i + 1}: la pagina ha SCARICATO Babel (${a.ev.babel} richieste)`);
  if (a.babelGlobale || a.scriptBabel) issues.push(`apertura ${i + 1}: Babel ESEGUITO nella pagina (window.Babel ${a.babelGlobale}, script text/babel ${a.scriptBabel})`);
  if (a.ev.esterne.length) issues.push(`apertura ${i + 1}: richieste esterne ${a.ev.esterne.slice(0, 3).join(' ')}`);
  if (a.ev.errori.length) issues.push(`apertura ${i + 1}: errori di pagina ${a.ev.errori.slice(0, 2).join(' | ')}`);
  await a.ctx.close();
}
const med = [...tempi].sort((x, y) => x - y)[tempi.length >> 1];
console.log(`avvio fino al menu: mediana ${med} ms (soglia ${SOGLIA_MS} ms) su ${tempi.length} aperture`);
if (!(med < SOGLIA_MS)) issues.push(`avvio fino al menu ${med} ms ≥ soglia ${SOGLIA_MS} ms`);

/* (3) salvataggio esistente */
const fx = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/visual/fixtures/save-194-primavera-w38.json'), 'utf8'));
const pl = fx.player || fx; const clubN = (pl.club && (pl.club.n || pl.club.name)) || '';
const s = await apri(`http://localhost:${port}/`, JSON.stringify(fx));
let caricato = false, letto = null, settimana = null;
try {
  const cont = await s.page.waitForFunction(() => [...document.querySelectorAll('button')].find(b => /continua/i.test(b.textContent || '')) || null, null, { timeout: 20000 }).then(h => h.asElement()).catch(() => null);
  if (cont) {
    await cont.evaluate(b => b.click());
    caricato = await s.page.waitForFunction(n => !!n && document.body.innerText.toLowerCase().includes(n.toLowerCase()) /* innerText segue text-transform: maiuscolo */ && ![...document.querySelectorAll('button')].some(b => /nuova carriera/i.test(b.textContent || '')), clubN, { timeout: 30000 }).then(() => true).catch(() => false);
  }
  await new Promise(r => setTimeout(r, 800));
  letto = await s.page.evaluate(() => { try { const v = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); const p = v && (v.player || v); return p ? { name: !!p.name, season: p.season, week: p.week } : null; } catch (e) { return { err: String(e) }; } });
  settimana = letto && letto.week;
} catch (e) { issues.push('salvataggio: ' + e.message.slice(0, 120)); }
console.log(`salvataggio esistente (club «${clubN}», stagione ${pl.season} settimana ${pl.week}): Continua→carriera ${caricato ? 'sì' : 'NO'} · dopo il caricamento cpm-v3 stagione ${letto && letto.season} settimana ${settimana}`);
if (!clubN) issues.push('salvataggio di prova senza club: non giudicabile');
if (!caricato) issues.push('salvataggio esistente non caricato (Continua → carriera)');
if (!letto || letto.err || letto.season !== pl.season || letto.week !== pl.week) issues.push('salvataggio non piu\' leggibile o cambiato dopo il caricamento: ' + JSON.stringify(letto));
if (s.ev.errori.length) issues.push('salvataggio: errori di pagina ' + s.ev.errori.slice(0, 2).join(' | '));
await s.ctx.close();
await browser.close(); srv.close();

for (const m of issues) console.log('  ❌ ' + m);
if (ROSSO) {
  const vede = issues.some(m => /Babel/.test(m)) && issues.some(m => /soglia/.test(m));
  fine(vede ? 0 : 1, vede ? `PROVA DEL ROSSO RIUSCITA: il guardiano vede la traduzione nel browser (${issues.length} rilievi, avvio ${med} ms)` : 'PROVA DEL ROSSO FALLITA: con Babel nel browser il guardiano non e\' rosso su Babel E soglia');
}
fine(issues.length ? 1 : 0, issues.length ? `ROSSO: ${issues.length} rilievi` : `VERDE: niente Babel, menu in ${med} ms < ${SOGLIA_MS} ms, salvataggio caricato`);
