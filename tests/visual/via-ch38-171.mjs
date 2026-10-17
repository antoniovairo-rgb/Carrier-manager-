#!/usr/bin/env node
/* [giro 39 — PO-171 «Via CH38 ovunque (cerimonie, ritratto dei menu, download), corpi caricati in anticipo»]
   GUARDIANO + CENSIMENTO DI RETE. Ogni percorso gira in un CONTESTO NUOVO (cache fredda, service worker bloccato: altrimenti
   serve lui i file e la richiesta non si vede) col GLB ACCESO (direttiva PO 29/07), e si registra ogni .glb richiesto.
   Due famiglie, contate separate:
     CH38 vero   = assets/footballer*.glb + assets/anim-*.glb (il modello Mixamo CH38 e le sue clip): non lo usa piu' nessuna scena,
                   quindi deve sparire da TUTTI i percorsi, partita compresa.
     «regular»   = assets/korward-regular-player*.glb + assets/korward-regular-anims/* (chiamato «corpo CH38» nel codice della
                   partita): la partita lo monta ancora sotto i CGTrader (logica, ripiego, prontezza PO-232) e il pre-caricamento
                   PO-237 lo scarica in anticipo dal menu. Si DICHIARA, non si giudica: toglierlo e' un lavoro sul motore.
   Percorsi:
     home        — schermata iniziale senza salvataggio, 12 s di menu
     carriera    — salvataggio pro, «Continua» → plancia, 12 s
     presentazione — settimana 1 → «Vai allo stadio» → serata di presentazione (corpi CGTrader in campo)
     partita     — partita vera (dove il CH38 serve ancora: lo si DICHIARA, non si giudica)
   VERDE: nessuna richiesta del CH38 vero su nessun percorso, e la presentazione monta i corpi CGTrader (__CPM_PRES200.cg >= 2).
   ROSSO (__CPM_NO_CH38_PREFETCH: il pre-caricamento CH38 del 6.95.0 al boot torna attivo): le richieste CH38 ricompaiono in home.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node via-ch38-171.mjs
        CPM_171_SOLO=home,carriera,... (solo alcuni percorsi) · CPM_171_BRACCI=verde|rosso · CPM_171_FOTO=1 (foto 360/412) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';

const CH38 = /assets\/(footballer[a-z-]*\.glb|anim-[a-z-]+\.glb)/;
const REG = /assets\/(korward-regular-player[a-z-]*\.glb|korward-regular-anims\/)/;
const SOLO = (process.env.CPM_171_SOLO || 'home,carriera,presentazione,partita').split(',');
const BRACCI = (process.env.CPM_171_BRACCI || 'verde,rosso').split(',');
const FOTO = !!process.env.CPM_171_FOTO;
const FOTODIR = path.join(ROOT, 'docs', 'sviluppo', 'foto-giro39');
if (FOTO) fs.mkdirSync(FOTODIR, { recursive: true });
const peso = u => { try { const p = path.join(ROOT, decodeURIComponent(new URL(u).pathname).replace(/^\//, '')); return fs.statSync(p).size; } catch (e) { return 0; } };

const PRO = { id: 'tor', n: 'FC Granata', a: 'GRA', p: 70, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };
const save = { phase: 'career', player: {
  name: 'Via Ch38', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 1, age: 24, ovr: 80,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 4, presidentModalSeason: 4,
  drawSeen: 4, mercatoSeen: 4, coachPactSeason: 4, presentedClub: PRO.id, presentSeason: 0,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', club: PRO,
  stats: { 'velocità': 78, tecnica: 78, fisico: 76, 'mentalità': 76, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 80, morale: 72, fatigue: 25, coachTrust: 70, teamChemistry: 60, popularity: 45, bankBalance: 1e6,
  goals: 0, assists: 0, matches: 0, totalMatches: 90, totalGoals: 40, matchHistory: [],
  contract: { duration: 3, wage: 400000, expiresAtSeason: 8 } } };

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const URL0 = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;

async function apri(rosso, conSave, vw = 412) {
  const ctx = await b.newContext({ viewport: { width: vw, height: 915 }, serviceWorkers: 'block' }); const page = await ctx.newPage();
  await installCdnRoutes(page);
  const req = []; page.on('request', r => { const u = r.url(); if (/\.glb(\?|$)/.test(u)) req.push(u.split('?')[0]); });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(([r, s]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_CH38_PREFETCH = 1;
    if (s) { localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.setItem('cpm-intro-seen', '1'); } }, [rosso, conSave ? save : null]);
  return { ctx, page, req, errs };
}
const riassunto = req => { const ch = [...new Set(req.filter(u => CH38.test(u)))]; const tutti = [...new Set(req)];
  return { glb: tutti.length, ch38: ch.length, ch38MB: +(ch.reduce((s, u) => s + peso(u), 0) / 1048576).toFixed(2),
    totMB: +(tutti.reduce((s, u) => s + peso(u), 0) / 1048576).toFixed(2), ch38File: ch.map(u => u.split('/assets/')[1]),
    regular: [...new Set(req.filter(u => REG.test(u)))].length, regularMB: +([...new Set(req.filter(u => REG.test(u)))].reduce((s, u) => s + peso(u), 0) / 1048576).toFixed(2) }; };
const foto = async (page, nome) => { if (!FOTO) return; try { await page.screenshot({ path: path.join(FOTODIR, nome + '.png') }); } catch (e) {} };

async function home(rosso, vw = 412) {
  const { ctx, page, req, errs } = await apri(rosso, false, vw);
  await page.goto(URL0, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(12000); await foto(page, `home-${rosso ? 'rosso' : 'verde'}-${vw}`);
  const out = { ...riassunto(req), errori: errs.length }; await ctx.close(); return out;
}
async function carriera(rosso, vw = 412) {
  const { ctx, page, req, errs } = await apri(rosso, true, vw);
  await page.goto(URL0, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }).catch(() => {}); await sleep(12000);
  await foto(page, `carriera-${rosso ? 'rosso' : 'verde'}-${vw}`);
  const out = { ...riassunto(req), errori: errs.length }; await ctx.close(); return out;
}
async function presentazione(rosso, vw = 412) {
  const { ctx, page, req, errs } = await apri(rosso, true, vw);
  await page.goto(URL0, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
  try { await page.getByText('Avvia Stagione', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await sleep(1200);
  for (let i = 0; i < 14; i++) { const t = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '));
    if (/Vai allo stadio/i.test(t)) break;
    try { await page.getByRole('button', { name: /Tieni #|Continua|Conferma|Accetta|Avanti|Prosegui|Inizia/i }).last().click({ timeout: 2500 }); } catch (e) { break; } await sleep(900); }
  try { await page.getByRole('button', { name: /Vai allo stadio/i }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(2500);
  for (let k = 0; k < 2; k++) { try { await page.getByRole('button', { name: /^Avanti/i }).first().click({ timeout: 4000 }); } catch (e) {} await sleep(1200); }
  let cg = 0; for (let t = 0; t < 40; t++) { cg = await page.evaluate(() => (window.__CPM_PRES200 || {}).cg || 0); if (cg >= 2) break; await sleep(1000); }
  await sleep(1500); await foto(page, `presentazione-${rosso ? 'rosso' : 'verde'}-${vw}`);
  const out = { ...riassunto(req), cg, errori: errs.length }; await ctx.close(); return out;
}
async function partita(rosso) {
  const { ctx, page, req, errs } = await apri(rosso, false);
  await openMatch(page, port, { skipLoadAll: true, name: 'Via Ch38' });
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 90000 }).catch(() => {}); await sleep(4000);
  const out = { ...riassunto(req), errori: errs.length }; await ctx.close(); return out;
}

const PERC = { home, carriera, presentazione, partita };
const esito = {};
for (const br of BRACCI) { const rosso = br === 'rosso'; esito[br] = {};
  for (const k of SOLO) { if (rosso && k !== 'home') continue;/* il rosso riaccende il solo pre-caricamento del boot: si vede in home */
    esito[br][k] = await PERC[k](rosso); console.log(br, k, JSON.stringify(esito[br][k])); } }
if (FOTO) for (const vw of [360]) for (const k of ['home', 'carriera', 'presentazione']) if (SOLO.includes(k)) await PERC[k](false, vw);
await b.close(); srv.close();

const g = [], V = esito.verde || {}, R = esito.rosso || {};
for (const k of Object.keys(V)) if (V[k] && V[k].ch38) g.push(`verde/${k}: ${V[k].ch38} richieste CH38 (${V[k].ch38MB} MB): ${V[k].ch38File.join(', ')}`);
if (V.presentazione && !(V.presentazione.cg >= 2)) g.push('verde/presentazione: corpi CGTrader in campo ' + V.presentazione.cg + ' (attesi >= 2)');
for (const k of Object.keys(V)) if (V[k].errori) g.push(`verde/${k}: ${V[k].errori} errori di pagina`);
if (R.home && !(R.home.ch38 >= 1)) g.push('rosso/home: nessuna richiesta CH38 col pre-caricamento riacceso — il guardiano non vede');
for (const k of Object.keys(V)) console.log(`${k} (dichiarato, non giudicato): corpo «regular» ${V[k].regular} file, ${V[k].regularMB} MB su ${V[k].totMB} MB di .glb`);
if (g.length) { console.log('❌ via-ch38-171'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ via-ch38-171 verde (e il rosso si vede)');
