/* [23/09] FIGURINE: assegnazione, persistenza, riuso nelle scene, peso di rete, anteprime. Viewport telefono 412x915.
   Inietta un salvataggio di carriera (come coach-face-test). CPM_VOLTO = volto scelto dell'eroe (numero ai-NNNN) da salvare;
   senza, l'eroe prende il primo candidato coerente col suo aspetto. CPM_ROSSO=__CPM_NO_VOLTI23 per il rosso (niente volti).
   Scrive foto e json in `figurine/`. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const out = path.join(here, 'figurine'); fs.mkdirSync(out, { recursive: true });
const ROSSO = process.env.CPM_ROSSO || '', VOLTO = process.env.CPM_VOLTO ? +process.env.CPM_VOLTO : null, TAG = ROSSO ? '-rosso' : '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); /* il service worker del gioco, al secondo avvio, scavalca le rotte locali delle librerie */
const page = await ctx.newPage();
const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
const richieste = []; page.on('request', r => { const u = r.url(); if (/assets\/portraits\//.test(u)) richieste.push(u.replace(/^.*assets\/portraits\//, '')); });
await installCdnRoutes(page);
await page.addInitScript(({ r, v }) => {
  window.__CPM_GLB = false; if (r) window[r] = true;
  if (!localStorage.getItem('cpm-v3')) {
    const J = [{ id: 'j_ferretti', name: 'Marco Ferretti', paper: 'Corriere Sport', color: '#dc2626' }, { id: 'j_esposito', name: 'Sofia Esposito', f: true, paper: 'Diretta TV', color: '#3b82f6' }];
    const save = { phase: 'career', player: { name: 'Luca Brain', nation: 'Italia', avatarId: 5, ...(v != null ? { voltoEroe: v } : {}), proStatus: 'pro', season: 2, week: 5, age: 21, ovr: 74,
      club: { id: 'mil', n: 'AC Milanello', a: 'ACM', p: 82, c: '#dc2626', c2: '#111111', nat: '🇮🇹', lg: 'Serie Alfa' },
      coach: { name: 'Mister Bellandi', style: 'Bilanciato', trustMod: 0 }, journalists: J,
      stats: { 'velocità': 74, tecnica: 73, fisico: 72, 'mentalità': 73, tiro: 74, passaggio: 73, dribbling: 74, posizionamento: 73 },
      form: 70, morale: 70, fatigue: 10, popularity: 40, value: 10, bankBalance: 50000, contract: { duration: 3, wage: 15000, expiresAtSeason: 5 } } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }
}, { r: ROSSO, v: VOLTO });
const apri = async () => {
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  try { await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 }); } catch (e) { await page.screenshot({ path: path.join(out, 'blocco-root.png') }); console.log('ERRORI', JSON.stringify(errori), await page.evaluate(() => document.body.innerText.slice(0, 300))); throw e; }
  await sleep(1500);
  for (let k = 0; k < 4; k++) { if (await page.evaluate(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.goTab))) break;
    await page.evaluate(() => { const b = [...document.querySelectorAll('button,[role=button],div')].filter(x => /^\s*(▶\s*)?continua/i.test(x.textContent || '') && x.children.length < 4).pop(); if (b) b.click(); }).catch(() => {}); await sleep(2500); }
  if (!(await page.evaluate(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.goTab)))) { await page.screenshot({ path: path.join(out, 'blocco-apertura.png') }); throw new Error('carriera non aperta'); }
  await sleep(1500);
};
const volti = () => page.evaluate(() => [...document.querySelectorAll('[data-cpm-figurina]')].map(d => ({ tipo: d.getAttribute('data-cpm-figurina'), nome: d.title || null, src: (d.querySelector('img') || {}).getAttribute ? (d.querySelector('img') ? d.querySelector('img').getAttribute('src').replace(/^.*ai\//, '') : null) : null, w: Math.round(d.getBoundingClientRect().width), h: Math.round(d.getBoundingClientRect().height) })));
const R = {};
await apri();
R.salvato = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-v3')).player.voltoEroe ?? null; } catch (e) { return 'err'; } });
R.eroe = await page.evaluate(() => ({ registro: window.__CPM_EROE23 || null, id: typeof voltoEroeId23 === 'function' ? voltoEroeId23() : null, candidati: typeof candidatiEroe23 === 'function' ? candidatiEroe23(5).slice(0, 6) : null }));
R.dashboard = await volti(); await page.screenshot({ path: path.join(out, `dashboard${TAG}.png`) });
await page.evaluate(() => window.__CPM_CAREER.goTab('club')); await sleep(1500);
R.club = await volti(); await page.screenshot({ path: path.join(out, `club${TAG}.png`) });
const intervista = async (i, nome) => { await page.evaluate(k => { const P = window.__CPM_CAREER; const j = (P.player ? P.player().journalists : null); return P.forceInterview && P.forceInterview('win'); }, i).catch(() => {}); await sleep(1200); };
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(800);
await intervista(0); R.intervista = await volti(); await page.screenshot({ path: path.join(out, `intervista${TAG}.png`) });
/* anteprime: figurine grandi con i dati del gioco (nome, ruolo, colori del club), montate con lo stesso componente */
R.anteprime = await page.evaluate(() => new Promise(res => {
  const d = document.createElement('div'); d.id = 'anteprima23'; d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#e2e8f0;display:flex;gap:18px;align-items:center;justify-content:center;flex-wrap:wrap;padding:12px';
  document.body.appendChild(d); const E = window.__CPM_EROE23 || {};
  ReactDOM.createRoot(d).render(React.createElement(React.Fragment, null,
    React.createElement(Figurina, { tipo: 'giocatore', chiave: E.nome, nome: E.nome, ruolo: 'Attaccante · AC Milanello', col: '#dc2626', col2: '#111111', larg: 170 }),
    React.createElement(Figurina, { tipo: 'mister', chiave: 'Mister Bellandi', nome: 'Mister Bellandi', ruolo: 'Allenatore · AC Milanello', col: '#dc2626', col2: '#111111', larg: 170 }),
    React.createElement(Figurina, { tipo: 'avversario', chiave: 'Ferraro', nome: 'Ferraro', ruolo: 'Difensore · rivale', larg: 110 }),
    React.createElement(Figurina, { tipo: 'procuratore', chiave: 'Dario Conti', nome: 'Dario Conti', ruolo: 'Procuratore', larg: 110 })));
  setTimeout(() => res([...d.querySelectorAll('img')].map(i => ({ src: i.getAttribute('src').replace(/^.*ai\//, ''), ok: i.complete && i.naturalWidth > 0 }))), 2500);
}));
await page.screenshot({ path: path.join(out, `anteprime${TAG}.png`) });
await page.evaluate(() => document.getElementById('anteprima23')?.remove());
/* una persona, una faccia: due chiavi che collidono, dentro e fuori da una scena */
R.scena = await page.evaluate(() => new Promise(res => {
  if (typeof voltoId23 !== 'function' || !VOLTI23.idx) return res({ saltato: 'indice assente' });
  const visti = new Map(); let a = null, b = null;
  for (let i = 0; i < 4000 && !a; i++) { const k = 'Compagno ' + i, n = voltoId23('giocatore', k); if (visti.has(n)) { a = visti.get(n); b = k; } else visti.set(n, k); }
  const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#fff'; document.body.appendChild(d);
  ReactDOM.createRoot(d).render(React.createElement('div', null,
    React.createElement('div', { id: 's23-dentro' }, React.createElement(ScenaVolti23, null, React.createElement(Figurina, { tipo: 'giocatore', chiave: a, larg: 60 }), React.createElement(Figurina, { tipo: 'giocatore', chiave: b, larg: 60 }))),
    React.createElement('div', { id: 's23-fuori' }, React.createElement(Figurina, { tipo: 'giocatore', chiave: a, larg: 60 }), React.createElement(Figurina, { tipo: 'giocatore', chiave: b, larg: 60 })),
    React.createElement('div', { id: 's23-giornalista' }, React.createElement(Figurina, { tipo: 'giornalista', chiave: 'Sofia Esposito', voltoId: -1, larg: 60 }))));
  setTimeout(() => { const src = id => [...document.querySelectorAll('#' + id + ' img')].map(i => i.getAttribute('src').replace(/^.*ai\//, ''));
    res({ chiavi: [a, b], dentro: src('s23-dentro'), fuori: src('s23-fuori'), giornalistaImmagini: src('s23-giornalista').length }); d.remove(); }, 1500);
}));
/* persistenza: ricarico la pagina e rileggo il volto dell'eroe */
const prima = R.eroe.id; await apri();
R.dopoRicarica = await page.evaluate(() => (typeof voltoEroeId23 === 'function' ? voltoEroeId23() : null));
R.stabile = prima === R.dopoRicarica;
/* il volto dell'eroe non va a nessun altro: 300 chiavi di giocatori/avversari/staff */
R.riservato = await page.evaluate(() => { const E = voltoEroeId23(); let hit = 0; const tipi = ['giocatore', 'avversario', 'mister', 'procuratore', 'giornalista', 'arbitro']; for (let i = 0; i < 300; i++) { const t = tipi[i % tipi.length]; if (voltoId23(t, 'npc-' + i) === E) hit++; } return { eroe: E, collisioni: hit }; });
R.richiestePortraits = { totale: richieste.length, uniche: [...new Set(richieste)].length, indice: richieste.filter(u => /indice\.json/.test(u)).length, manifest: richieste.filter(u => /manifest\.json/.test(u)).length };
R.errori = errori;
fs.writeFileSync(path.join(out, `verifica${TAG}.json`), JSON.stringify(R, null, 1));
console.log(JSON.stringify({ scena: R.scena, salvato: R.salvato, eroe: R.eroe.id, candidati: R.eroe.candidati, stabile: R.stabile, riservato: R.riservato, rete: R.richiestePortraits, dashboard: R.dashboard, club: R.club.filter(x => x.src), intervista: R.intervista.filter(x => x.tipo === 'giornalista'), anteprime: R.anteprime, errori }, null, 1));
await b.close(); srv.close();
