#!/usr/bin/env node
/* [giro 341 · PO-618 + PO-622] GUARDIANO fisarmonica-341 — non-gate, carriera/UI. Telefono 412x915 col tocco.
 *   A  CHIUDIBILE: nel Profilo (carriera di prova save-190, 11 stagioni) ogni sezione dentro un gruppo ha la testata-tasto con
 *      aria-expanded e la freccia; «Stagione per stagione» si chiude dalla testata (il corpo sparisce, la sezione si accorcia) e si
 *      riapre. Almeno 10 sezioni censite, se no non giudicato.
 *   S  LA PAGINA SCORRE: nessun riquadro dentro le sezioni del Profilo ha scorrimento interno (overflow auto/scroll con contenuto
 *      piu' alto del riquadro); e una rotella sopra la lista delle stagioni sposta la LISTA nella pagina (la pagina scorre) di
 *      almeno meta' del gesto.
 *   C  «CONSIGLIATO» SUI PUNTI DEBOLI: Ufficio › Staff › Personal trainer coi valori della foto PO 202 (velocita' 59, tecnica 68,
 *      fisico 60, mentalita' 59, tiro 72, passaggio 55, dribbling 75, posizionamento 65) → la stella sta esattamente sulle due piu'
 *      basse fra quelle che pesano nel giudizio (+ pari merito con la seconda, tetto 3), calcolate qui senza leggere il gioco:
 *      {passaggio, velocita', mentalita'}; la legenda parla di «punti deboli».
 * Bracci: VERDE deve passare A, S, C; ROSSO window.__CPM_NO_G341 (comportamento di prima) deve essere bocciato su A, S e C.
 * «Non giudicato» (misura mancante, errori di pagina) = rosso. Verde e rosso stampati per ultimi.
 * Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node fisarmonica-341.mjs   ·   CPM_FOTO=<cartella> per le foto prima/dopo */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { readFileSync } from 'node:fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';

const SAVE = JSON.parse(readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url), 'utf8'));
const ATTR = ['velocità', 'tecnica', 'fisico', 'mentalità', 'tiro', 'passaggio', 'dribbling', 'posizionamento'];
const PESI = { tiro: 2.5, tecnica: 2, 'velocità': 1.5, dribbling: 1.5, posizionamento: 1.5, 'mentalità': 1, fisico: 1, passaggio: 1 };/* copia di calcOvr */
const FOTO202 = { 'velocità': 59, tecnica: 68, fisico: 60, 'mentalità': 59, tiro: 72, passaggio: 55, dribbling: 75, posizionamento: 65 };
const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const TRAINER = { name: 'Sim Trainer', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20, ovr: 65, tutorialDone: true, club: CLUB, stats: FOTO202,
  form: 70, morale: 72, fatigue: 10, popularity: 20, coachTrust: 60, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, bankBalance: 5000000,
  perkTrainer: true, perkTrainerLv: 3, perkTrainerFocus: 'velocità' };
/* la regola nuova, scritta qui da capo: piu' basse fra quelle che pesano (peso >= 1) e sotto 85; a pari valore prima chi pesa di piu' */
function attesi(st) {
  const c = ATTR.filter(a => st[a] < 85 && PESI[a] >= 1).sort((x, y) => st[x] - st[y] || PESI[y] - PESI[x] || ATTR.indexOf(x) - ATTR.indexOf(y));
  const soglia = c.length >= 2 ? st[c[1]] : c.length ? st[c[0]] : -1;
  return c.filter(a => st[a] <= soglia).slice(0, 3);
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

async function apri(save, rosso) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 140)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G341 = true;
    try { for (const k of Object.keys(localStorage)) if (/^cpm-(sez341|gr235|fis)-/.test(k)) localStorage.removeItem(k); } catch (e) {}
    localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save, rosso });
  for (let t = 0; t < 3; t++) { try { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); break; } catch (e) { if (t === 2) throw e; } }
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(600);
  return { ctx, page, err };
}

async function profilo(rosso, foto) {
  const { ctx, page, err } = await apri({ ...SAVE, phase: 'career' }, rosso);
  const o = {};
  try {
    await page.evaluate(() => window.__CPM_CAREER.goTab('profile')); await sleep(900);
    await page.waitForSelector('[data-gruppo235]', { timeout: 15000 });
    /* apre tutti i gruppi */
    for (let i = 0; i < 6; i++) { const n = await page.evaluate(() => { const b = [...document.querySelectorAll('section[data-gruppo235] > button[aria-expanded="false"]')]; if (b[0]) b[0].click(); return b.length; }); if (!n) break; await sleep(400); }
    Object.assign(o, await page.evaluate(() => {
      const sez = [...document.querySelectorAll('[data-sezione235]')];
      const conTasto = sez.filter(s => { const b = s.firstElementChild; return b && b.tagName === 'BUTTON' && b.hasAttribute('aria-expanded') && /›/.test(b.textContent); });
      const trappole = [];
      for (const s of sez) for (const e of s.querySelectorAll('*')) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 4) trappole.push(s.getAttribute('data-sezione235') + ' ' + e.clientHeight + '/' + e.scrollHeight); }
      return { nSez: sez.length, nTasto: conTasto.length, senza: sez.filter(s => !conTasto.includes(s)).map(s => s.getAttribute('data-sezione235')).slice(0, 5), trappole };
    }));
    const tl = page.locator('[data-sezione235^="Stagione per stagione"]').first();
    o.tl = await tl.count();
    if (o.tl) {
      await tl.evaluate(e => e.scrollIntoView({ block: 'start' })); await page.evaluate(() => window.scrollBy(0, -120)); await sleep(400);
      if (foto) await page.screenshot({ path: foto });
      /* S: rotella sopra la lista delle stagioni */
      const lista = page.locator('[data-sezione235^="Stagione per stagione"] [data-scorri341]').first();
      if (await lista.count()) {
        const b0 = await lista.boundingBox(); const y0 = b0.y;
        await page.mouse.move(b0.x + b0.width / 2, Math.min(800, b0.y + Math.min(b0.height, 600) / 2));
        await page.mouse.wheel(0, 300); await sleep(700);
        const b1 = await lista.boundingBox(); o.spostamento = Math.round(y0 - b1.y);
      }
      /* A: chiusura dalla testata */
      const h0 = await tl.evaluate(e => e.getBoundingClientRect().height);
      const tasto = tl.locator(':scope > button').first();
      if (await tasto.count()) {
        await tasto.click(); await sleep(500);
        const h1 = await tl.evaluate(e => e.getBoundingClientRect().height); const corpo1 = await tl.locator('[data-scorri341]').count();
        const esp1 = await tasto.getAttribute('aria-expanded');
        await tasto.click(); await sleep(500);
        const corpo2 = await tl.locator('[data-scorri341]').count(); const esp2 = await tasto.getAttribute('aria-expanded');
        o.chiusura = { h0: Math.round(h0), h1: Math.round(h1), corpo1, corpo2, esp1, esp2 };
      }
    }
  } catch (e) { o.eccezione = String(e.message).slice(0, 160); }
  await ctx.close();
  return { o, err };
}

async function trainer(rosso, foto) {
  const { ctx, page, err } = await apri({ phase: 'career', player: TRAINER }, rosso);
  const o = {};
  try {
    await page.evaluate(() => window.__CPM_CAREER.goTab('ufficio')); await sleep(900);
    await page.waitForSelector('[data-cpm="trainer281-piano"]', { timeout: 15000 });
    Object.assign(o, await page.evaluate((ATTR) => ({ cons: ATTR.filter(a => !!document.querySelector(`[data-cpm="trainer288-cons-${a}"]`)),
      legenda: (document.querySelector('[data-cpm="trainer288-legenda"]') || {}).textContent || null }), ATTR));
    if (foto) { await page.locator('[data-cpm="trainer281-piano"]').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await page.screenshot({ path: foto }); }
  } catch (e) { o.eccezione = String(e.message).slice(0, 160); }
  await ctx.close();
  return { o, err };
}

function giudica(P, T) {
  const ko = {}; const no = (k, m) => (ko[k] = ko[k] || []).push(m);
  const errs = [...P.err, ...T.err]; if (errs.length) no('X', 'errori di pagina: ' + errs.slice(0, 3).join(' | '));
  const p = P.o, t = T.o;
  if (p.eccezione) no('A', 'profilo non giudicato: ' + p.eccezione);
  if (!(p.nSez >= 10)) no('A', `solo ${p.nSez} sezioni censite — non giudicato`);
  else if (p.nTasto !== p.nSez) no('A', `${p.nSez - p.nTasto} sezioni senza testata-tasto con freccia (${(p.senza || []).join(', ')})`);
  if (!p.tl) no('A', '«Stagione per stagione» non trovata — non giudicato');
  else if (!p.chiusura) no('A', '«Stagione per stagione» senza tasto nella testata');
  else { const c = p.chiusura; if (!(c.esp1 === 'false' && c.corpo1 === 0 && c.h1 < c.h0 - 40 && c.esp2 === 'true' && c.corpo2 > 0)) no('A', 'chiusura/riapertura dalla testata non riuscita ' + JSON.stringify(c)); }
  if (p.trappole && p.trappole.length) no('S', `${p.trappole.length} riquadri con scorrimento interno (${p.trappole.slice(0, 4).join(' · ')})`);
  if (p.spostamento == null) no('S', 'rotella sulla lista non misurata — non giudicato');
  else if (p.spostamento < 150) no('S', `la pagina non scorre sopra la lista: spostamento ${p.spostamento}px su 300`);
  const att = attesi(FOTO202);
  if (t.eccezione || !t.cons) no('C', 'trainer non giudicato: ' + (t.eccezione || 'nessuna misura'));
  else {
    if (JSON.stringify([...t.cons].sort()) !== JSON.stringify([...att].sort())) no('C', `consigliato su {${t.cons.join(', ')}}, atteso {${att.join(', ')}}`);
    if (!t.legenda || !/punti deboli/i.test(t.legenda)) no('C', 'legenda senza «punti deboli»');
  }
  return { ko, att };
}

const foto = process.env.CPM_FOTO;
const out = {};
for (const [nome, rosso] of [['verde', false], ['rosso', true]]) {
  const P = await profilo(rosso, foto && `${foto}/341-stagioni-${rosso ? 'prima' : 'dopo'}.png`);
  const T = await trainer(rosso, foto && `${foto}/341-trainer-${rosso ? 'prima' : 'dopo'}.png`);
  const g = giudica(P, T);
  out[nome] = g;
  console.log(`${nome.toUpperCase()} · sezioni ${P.o.nSez}/${P.o.nTasto} con tasto · chiusura ${JSON.stringify(P.o.chiusura || null)} · trappole ${(P.o.trappole || []).length} · rotella ${P.o.spostamento}px · consigliato {${(T.o.cons || []).join(', ')}} atteso {${g.att.join(', ')}}`);
  for (const [k, m] of Object.entries(g.ko)) console.log(`  ${nome} ✗ ${k}: ${m.join(' / ')}`);
}
await browser.close(); srv.close();
const verdeOk = Object.keys(out.verde.ko).length === 0;
const cadute = ['A', 'S', 'C'].filter(k => out.rosso.ko[k]);
const rossoOk = cadute.length === 3;
console.log(`BRACCIO ROSSO __CPM_NO_G341 → cadono ${cadute.join(',') || 'nessuno'} ${rossoOk ? '✅' : '❌ (deve cadere su A, S e C)'}`);
console.log(`BRACCIO VERDE → ${verdeOk ? '✅ A, S, C' : '❌ ' + Object.keys(out.verde.ko).join(',')}`);
console.log(verdeOk && rossoOk ? 'FISARMONICA-341: ✅ VERDE' : 'FISARMONICA-341: ❌ ROSSO');
process.exit(verdeOk && rossoOk ? 0 : 1);
