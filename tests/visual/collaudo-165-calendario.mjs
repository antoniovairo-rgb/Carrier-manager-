#!/usr/bin/env node
/* [collaudo release 7.999.165 · PO-233] Il calendario visto da un giocatore, sui salvataggi VERI (nessuna voce sintetica):
   per ogni salvataggio passato in argomento apre la carriera, fotografa la home, tocca «Stagione» → «Calendario» nella barra
   (ripiego dichiarato: __CPM_CAREER.goTab), legge TUTTO il testo della scheda e cerca:
     · codici interni stampati come giornata (>= 990: coppa 990+, Nazionale 1470+) in qualunque forma («1489ª giornata», «G. 1489», «Giornata 1489»);
     · come si presentano le righe di Nazionale e coppa (testo intorno);
     · la stessa ricerca sulla home, sulla scheda Coppe e sulla Classifica.
   Uscita: docs/collaudi/release-165/dati/calendario.json + foto cal-<nome>-*.jpg.
   Uso: node collaudo-165-calendario.mjs <salvataggio.json> [...] */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { clickGiocatore } from './lib/collaudo165.mjs';
const OUT = path.resolve('../../docs/collaudi/release-165'); fs.mkdirSync(path.join(OUT, 'dati'), { recursive: true });
const files = process.argv.slice(2); const esiti = [];
const srv = await startServer(); const b = await launchBrowser();
const RX = /\b\d{3,4}\s*ª\s*giornata|G\.\s*\d{3,4}\b|Giornata\s+\d{3,4}\b|\b(99\d|1[45]\d\d)ª/gi;
for (const f of files) {
  const nome = path.basename(f, '.json').slice(0, 30);
  const sv = JSON.parse(fs.readFileSync(f, 'utf8'));
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, sv);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(2500);
  const r = { file: f, voci: await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { season: s.season, week: s.week, speciali: (s.calendar || []).filter(c => c.type).map(c => [c.week, c.type, c.matchday, c.opponentName, c.played, c.competition || c.cupRoundName || null]) }; }) };
  const leggi = async (dove) => { const t = await page.evaluate(() => document.body.innerText || '');
    const righe = t.split('\n').map(x => x.trim()).filter(Boolean);
    const speciali = righe.map((x, k) => /Nazionale|Coppa|Amichevole|Internazional|Portogallo|Spagna|Francia|Germania|Olanda|Belgio|Brasile|Argentina|Inghilterra|Italia/i.test(x) ? righe.slice(Math.max(0, k - 1), k + 3).join(' | ') : null).filter(Boolean);
    r[dove] = { codici: t.match(RX) || [], speciali: speciali.slice(0, 10), giornate: [...new Set(t.match(/\d+\s*ª\s*giornata/gi) || [])].slice(0, 14) };
    await page.screenshot({ path: path.join(OUT, `cal-${nome}-${dove}.jpg`), type: 'jpeg', quality: 72, fullPage: true }); };
  await leggi('home');
  let via = await clickGiocatore(page, [/^Stagione$/]); await sleep(900);
  const v2 = await clickGiocatore(page, [/^Calendario$/]); await sleep(1200);
  if (!/Prossime partite/i.test(await page.evaluate(() => document.body.innerText))) { await page.evaluate(() => window.__CPM_CAREER.goTab('calendar')); await sleep(1200); via = 'goTab'; }
  r.via = via + '/' + v2; await leggi('calendario');
  await clickGiocatore(page, [/^Coppe$/]); await sleep(1000); await leggi('coppe');
  await clickGiocatore(page, [/^Classifica$/]); await sleep(1000); await leggi('classifica');
  esiti.push(r); console.log(JSON.stringify(r).slice(0, 1500)); await ctx.close();
}
fs.writeFileSync(path.join(OUT, 'dati', 'calendario.json'), JSON.stringify(esiti, null, 1));
await b.close(); srv.close();
const cod = esiti.flatMap(e => ['home', 'calendario', 'coppe', 'classifica'].flatMap(k => (e[k] && e[k].codici) || []));
console.log(cod.length ? '❌ codici interni a schermo: ' + JSON.stringify(cod) : '✅ nessun codice interno stampato come giornata');
