#!/usr/bin/env node
/* Collaudo carriera 178 n.5 — pilota: creazione → provini → offerte → carriera → ritiro. Registra in docs/collaudi/dati-carriera-178-5/. */
import { avvia, nuovaPagina, foto, testo, bottoni, sleep, clickByText, jl, evalSafe, fase, DATI, FOTO, SCR, ROOT } from './c178-car5-lib.mjs';
import { giocaLive } from './c178-car5-live.mjs';
import fs from 'node:fs'; import path from 'node:path';
const conta = { n: 0 };
const S = await avvia(); let page = await nuovaPagina(S, { glb: false });
await page.evaluate(() => { try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
const stuckDump = async (m) => { console.log('STUCK', m); console.log((await testo(page)).replace(/\n+/g, ' / ').slice(0, 1200)); console.log(await bottoni(page)); await foto(page, 'stuck'); };
await sleep(1200);
await clickByText(page, 'Nuova carriera'); await sleep(700);
await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); }, 'Marco Bastoni');
await sleep(300); await clickByText(page, 'Inizia i provini'); await sleep(1500);
for (let p = 1; p <= 3; p++) {
  let ok = false;
  for (let k = 0; k < 8 && !ok; k++) { ok = await clickByText(page, 'Inizia il provino', 2500); if (!ok) { await clickByText(page, 'Risultati provino|Vai al Provino|Continua', 2500); await sleep(800); } }
  if (!ok) { await stuckDump('provino ' + p); break; }
  await sleep(1500);
  const rec = await giocaLive(page, { tag: 'provino' + p, stagione: 1, settimana: 1, conta });
  jl('partite.jsonl', { ...rec, hl: rec.hl.length }); console.log('provino', p, JSON.stringify({ ms: rec.ms, hl: rec.hl.length, sc: rec.sc1, flags: rec.flags, fine: rec.fine }));
  await sleep(800); await foto(page, 'prov' + p + '-fine');
}
for (let k = 0; k < 6; k++) {
  if (!await clickByText(page, 'Risultati provino|Continua|Vedi le offerte', 2500)) break;
  await sleep(1200);
}
console.log('offerte:', (await testo(page)).replace(/\n+/g, ' / ').slice(0, 400)); await foto(page, 'offerte');
await evalSafe(page, () => { const b = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /^Scegli/.test((x.innerText || '').trim())); (b[b.length - 1]).click(); });
for (let k = 0; k < 14; k++) {
  await sleep(2500); console.log('dopo-offerta', k, (await testo(page)).replace(/\n+/g, ' / ').slice(0, 350)); console.log(await bottoni(page)); await foto(page, 'inizio' + k);
  if (await evalSafe(page, () => !!window.__CPM_CAREER)) { console.log('CAREER pronto'); break; }
  await clickByText(page, 'Firma|Accetta|Continua|Avanti|Inizia|Vai|Entra|Conferma|Ok|OK', 2000);
}
const dump = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])));
fs.writeFileSync(path.join(SCR, 'stato-dopo-provini.json'), JSON.stringify(dump));
console.log(page._err.filter(e => !/BABEL/.test(e)));
await S.browser.close(); S.srv.close();
