#!/usr/bin/env node
/* [giro 19 PO-244] GUARDIANO DEL GIORNALE DEL DOPO PARTITA, verde col gioco e rosso con __CPM_NO_GIORN244.
   Collaudi 164 N3 / 165 N4-N5: (a) «COPPA DELLE NAZIONI · FASE A ELIMINAZIONE» su una gara di girone (e «NAZIONALE · FASE A
   ELIMINAZIONE» sull'amichevole) quando il salvataggio porta un Europeo gia' chiuso; (b) «Stag. 13 · G. 10» sulla 9a giornata,
   cioe' la settimana al posto della giornata.
   Due partite vere fino al giornale (save-190, che porta l'Europeo S12 chiuso), pilota seedato, velocita' 4:
     · CAMPIONATO: la gara della settimana 38, che e' la 34a giornata. VERDE: «G. 34».
     · COPPA DELLE NAZIONI: girone, gara 1. VERDE: testata senza «eliminazione», con «Fase a gironi».
   ROSSO: «G. 38» e «FASE A ELIMINAZIONE». Uso: node giornale-244.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function partita(tipo, rosso) {
  const save = JSON.parse(JSON.stringify(SAVE)); const p = save.player;
  /* campionato: la gara della settimana 38 del save-190 e' la 34a giornata (le settimane senza campionato fanno divergere i due numeri) */
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO_GIORN244 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: save, r: rosso });
  const out = { tipo, rosso };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    if (tipo === 'naz') { await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); window.__CPM_CAREER.patch({ nationalCaps: Math.max(2, s.nationalCaps | 0), nationsCupQueue: { active: true, opponents: ['Francia', 'Portogallo', 'Olanda'].filter(n => n !== s.nation), matchIdx: 0, pts: 0, matches: [], done: false, season: s.season } }); }); await sleep(1500); }
    out.pm = await page.evaluate(n => { try { return n ? window.__CPM_CAREER.apriNC243() : window.__CPM_CAREER.playMatch(); } catch (e) { return 'err ' + e.message; } }, tipo === 'naz');
    for (let k = 0; k < 14; k++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
        const x = bs.find(b => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti|Salta e gioca/i.test(b.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(b.textContent || '')); if (x) x.click(); });
      await sleep(900); }
    out.etichettaPre = await page.evaluate(() => (document.body.innerText.match(/Giornata \d+ di \d+/) || [null])[0]);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
    await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2441, policy: 'seeded', tickMs: 150 }));
    const t0 = Date.now(); let ph; while (Date.now() - t0 < 400000) { ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'ended') break; if (ph === 'ceremony') { await page.mouse.click(206, 460).catch(() => {}); await page.keyboard.press('Enter').catch(() => {}); } await sleep(800); }/* la festa del titolo si chiude con un tocco, come fa il giocatore */
    out.fine = ph; await sleep(1500);
    const T = await page.evaluate(() => document.body.innerText);
    out.stag = (T.match(/Stag\. \d+ · (G|Sett)\. \d+/) || [null])[0];
    out.testata = (T.split('\n').find(l => /NAZIONI|NAZIONALE|COPPA|FISCHIO/i.test(l) && /·/.test(l)) || '').trim().slice(0, 90);
    out.elim = /eliminazione/i.test(T);
    await page.screenshot({ path: new URL('./out/giornale-244-' + tipo + (rosso ? '-rosso' : '') + '.png', import.meta.url).pathname }).catch(() => {});
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
const E = {};
const TIPI = (process.env.CPM_TIPI || 'lega,naz').split(',');
for (const rosso of [false, true]) for (const t of ['lega', 'naz']) { if (!TIPI.includes(t)) { E[(rosso ? 'r' : 'v') + t] = null; continue; } const o = await partita(t, rosso); E[(rosso ? 'r' : 'v') + t] = o; console.log((rosso ? 'ROSSO ' : 'VERDE ') + JSON.stringify(o)); }
await b.close(); srv.close();
const g = [];
if (E.vlega && E.vlega.fine !== 'ended') g.push('verde campionato: la partita non arriva al giornale');
if (E.vlega && E.vlega.stag !== 'Stag. 12 · G. 34') g.push('verde campionato: testata ' + E.vlega.stag + ' (attesa «Stag. 12 · G. 34»)');
if (E.vnaz && E.vnaz.fine !== 'ended') g.push('verde nazionale: la partita non arriva al giornale');
if (E.vnaz && E.vnaz.elim) g.push('verde nazionale: «fase a eliminazione» su una gara di girone');
if (E.vnaz && !/gironi/i.test(E.vnaz.testata)) g.push('verde nazionale: la testata non dice la fase a gironi («' + E.vnaz.testata + '»)');
if ((E.vlega && E.vlega.errori.length) || (E.vnaz && E.vnaz.errori.length)) g.push('verde: errori di pagina');
if (E.rlega && E.rlega.stag !== 'Stag. 12 · G. 38') g.push('rosso campionato: il difetto non si vede (' + E.rlega.stag + ')');
if (E.rnaz && !E.rnaz.elim) g.push('rosso nazionale: il difetto non si vede');
if (g.length) { console.log('❌ giornale-244'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ giornale-244 verde (giornata vera e fase a gironi) e il rosso si vede');
