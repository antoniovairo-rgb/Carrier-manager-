#!/usr/bin/env node
/* [giro 190 · PO-380c · G181-06 «nomi reali nei salvataggi vecchi»] GUARDIANO nomi-salvati-190.
   1. PURA: pulisciNomiReali190 rinomina «Bukayo Saka» con lo stesso nome inventato ovunque, e' idempotente (secondo giro: 0
      sostituzioni), non tocca il nome dell'eroe scelto dal giocatore, non tocca un testo senza parole della lista.
   2. SALVATAGGI DI PROVA (tutti i fixtures/*.json che contengono un giocatore): caricati nel gioco vero e aperti in carriera,
      il salvataggio RISCRITTO in localStorage non contiene nessuna parola di _CR_PLAYERS (la stessa lista di audit-copyright),
      il rivale e il diario dicono lo stesso nome, e il testo visibile della carriera (cruscotto, club, profilo) non ne mostra.
   Braccio rosso: CPM_ROSSO190C=1 accende __CPM_NO_G190C → deve uscire 1 (il fixture della stagione 12 ha «Bukayo Saka»).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node nomi-salvati-190.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO190C === '1';
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const dir = new URL('./fixtures/', import.meta.url);
const fixtures = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => ({ f, d: JSON.parse(fs.readFileSync(new URL(f, dir))) }))
  .filter(x => x.d && x.d.player && x.d.player.name);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const SCAN = () => { const L = 'A-Za-zÀ-ÖØ-öø-ÿ'; const rx = new RegExp('(^|[^' + L + '])(' + _CR_PLAYERS.join('|') + ')(?![' + L + '])');
  return (t) => { const m = String(t).match(rx); return m ? m[2] : null; }; };
let conRivale = 0;
try {
  console.log('1) funzione pura');
  {
    const page = await browser.newPage(); await installCdnRoutes(page);
    await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G190C = 1; }, ROSSO);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!window.__CPM_NOMI190, null, { timeout: 60000 });
    const r = await page.evaluate(() => { const P = window.__CPM_NOMI190.pulisci;
      const a = P({ name: 'Max Blond', rival: { name: 'Bukayo Saka' }, diary: [{ body: 'Bukayo Saka torna sulla tua strada.' }, { body: 'Pareggio sotto la pioggia.' }] });
      const b = P(a.p); const c = P({ name: 'Neymar Rossi', rival: { name: 'Luca Conti' }, diary: [{ body: 'Neymar Rossi decide il derby.' }] });
      const d = { name: 'X', diary: [{ body: 'Pareggio' }] }; const e = P(d);
      return { a: a.p, na: a.n, nb: b.n, c: c.p, nc: c.n, stesso: e.p === d }; });
    const nuovo = r.a.rival.name;
    ok(r.na === 4 && !/Bukayo|Saka/.test(JSON.stringify(r.a)), `«Bukayo Saka» → «${nuovo}» (${r.na} parole sostituite)`);
    ok(r.a.diary[0].body.startsWith(nuovo + ' '), `stesso nome nel rivale e nel diario: «${r.a.diary[0].body}»`);
    ok(r.nb === 0, `idempotente: secondo giro ${r.nb} sostituzioni`);
    ok(r.nc === 0 && r.c.name === 'Neymar Rossi', `il nome dell'eroe scelto dal giocatore resta «${r.c.name}» (${r.nc} sostituzioni)`);
    ok(r.stesso, 'un salvataggio senza parole della lista resta lo stesso oggetto');
    await page.close();
  }
  for (const { f, d } of fixtures) {
    console.log(`2) salvataggio di prova ${f}`);
    const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
    const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
    await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G190C = 1; }, ROSSO);
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(() => typeof _CR_PLAYERS !== 'undefined', null, { timeout: 60000 });
      await page.evaluate((s) => { localStorage.clear(); localStorage.setItem('cpm-v3', JSON.stringify({ ...s, phase: 'career' })); }, d);
      await page.reload({ waitUntil: 'load' });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
      await sleep(1200);
      try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
      await sleep(2500);
      const visti = [];
      for (const t of ['dashboard', 'club', 'profile', 'dashboard']) {
        try { await page.evaluate((t) => window.__CPM_CAREER.goTab(t), t); } catch (e) {}
        await sleep(900);
        const v = await page.evaluate((s) => { const sc = eval('(' + s + ')')(); return sc(document.body.innerText); }, SCAN.toString());
        if (v) visti.push(t + ':' + v);
      }
      const r = await page.evaluate((s) => { const sc = eval('(' + s + ')')(); const raw = localStorage.getItem('cpm-v3') || ''; const j = JSON.parse(raw); const p = j.player || j;
        const hits = []; const giro = (v, path) => { if (typeof v === 'string') { const m = sc(v); if (m) hits.push(path + ' «' + m + '»'); } else if (Array.isArray(v)) v.forEach((x, i) => giro(x, path + '[' + i + ']')); else if (v && typeof v === 'object') for (const k of Object.keys(v)) giro(v[k], path + '.' + k); };
        giro(p, 'player'); const rn = p.rival && p.rival.name; const diaryRiv = rn ? (p.diary || []).filter(e => e && typeof e.body === 'string' && e.body.indexOf(rn) >= 0).length : 0;
        return { hits: hits.slice(0, 4), n: hits.length, rn, diaryRiv }; }, SCAN.toString());
      const prima = JSON.stringify(d).match(new RegExp('Bukayo|Saka')) ? 'si' : 'no';
      ok(r.n === 0, `${f}: parole della lista nel salvataggio riscritto ${r.n} ${r.hits.join(', ')} (nel file di partenza: ${prima})`);
      ok(visti.length === 0, `${f}: parole della lista a schermo ${visti.length} ${visti.join(', ')}`);
      ok(errors.length === 0, `${f}: errori di pagina ${errors.length} ${errors.slice(0, 1).join('')}`);
      if (prima === 'si') { conRivale++; ok(r.diaryRiv > 0, `${f}: il diario cita il rivale col nome nuovo «${r.rn}» (${r.diaryRiv} voci)`); }
    } catch (e) { ok(false, `${f}: non giudicato (${String(e.message).slice(0, 160)})`); }
    await page.close();
  }
} catch (e) { ok(false, 'eccezione: ' + String(e && e.message || e).slice(0, 300)); }
await browser.close(); srv.close();
ok(fixtures.length >= 3 && conRivale >= 1, `salvataggi giudicati ${fixtures.length}, con un nome reale in partenza ${conRivale}`);
console.log(`\n${ROSSO ? '[braccio ROSSO __CPM_NO_G190C] ' : ''}nomi-salvati-190: ${fails.length ? 'ROSSO' : 'VERDE'} (${oks.length} ok · ${fails.length} ko)`);
process.exit(fails.length ? 1 : 0);
