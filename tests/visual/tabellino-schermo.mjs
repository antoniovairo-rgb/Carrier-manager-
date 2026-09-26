/* [7.914] Il TABELLINO DELLA GARA si vede davvero a fine partita? Gioca una partita col motore fino al
   fischio finale, poi fotografa il post-partita e legge le righe del tabellino dal DOM. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'tabellino');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
let errori = 0; const messaggi = [];
page.on('pageerror', (e) => { errori++; if (messaggi.length < 5) messaggi.push(String(e).slice(0, 180)); });
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_TIRI17 = 1; }, process.env.CPM_ROSSO === '1');
await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 60 }); }).catch(() => {});
/* velocita' doppia: il fischio finale arriva prima e la sonda non scade */
try { await page.evaluate(() => { try { localStorage.setItem('cpm-match-speed', '2'); } catch (_e) {} const b = [...document.querySelectorAll('button')].find((x) => /^1x$|^1×$/.test((x.textContent || '').trim())); if (b) { b.click(); b.click(); } }); } catch (_e) {}
/* si aspetta il fischio finale: la fase diventa `ended` */
let fase = null;
for (let i = 0; i < 520; i++) {
  fase = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) { return null; } }).catch(() => null);
  if (fase === 'ended') break;
  if (i % 60 === 59) { try { const c = await page.evaluate(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s ? s.clock : null; } catch (_e) { return null; } }); console.log(`  ...${Math.round(i * 0.5)}s reali, minuto di gioco ${c}, fase ${fase}`); } catch (_e) {} }
  await sleep(500);
}
await sleep(2500);
const r = await page.evaluate(() => {
  const testo = document.body.innerText || '';
  const i = testo.indexOf('TABELLINO DELLA GARA');
  const blocco = i >= 0 ? testo.slice(i, i + 700) : null;
  let tab = null; try { tab = window.__CPM_TABELLINO914 ? window.__CPM_TABELLINO914() : null; } catch (_e) {}
  return { presente: i >= 0, blocco, tab, fase: (window.__CPM_PHASE && window.__CPM_PHASE()) || null };
});
/* si fotografa scorrendo fino al tabellino */
try {
  await page.evaluate(() => { const els = [...document.querySelectorAll('div')].filter((d) => (d.textContent || '').trim().startsWith('TABELLINO DELLA GARA')); if (els.length) els[els.length - 1].scrollIntoView({ block: 'center' }); });
  await sleep(900);
} catch (_e) {}
const foto = path.join(OUT, 'post-partita.png');
await page.screenshot({ path: foto }).catch(() => {});
/* [7.915] IL METRO DEL PONTE: i gol e i tiri che il giocatore vede nel SUO tabellino devono comparire anche
   in quello della gara. Il PO ha fotografato 3 gol con «4 tiri, 2 in porta» per la sua squadra: due verita'
   diverse sulla stessa partita. Qui si confrontano. */
const coerenza = await page.evaluate(() => {
  const T = (document.body.innerText || '');
  const num = (dopo, etichetta) => { const i = T.indexOf(dopo); if (i < 0) return null; const j = T.indexOf(etichetta, i); if (j < 0) return null;
    const prima = T.slice(Math.max(0, j - 14), j).trim().split(/\s+/).pop(); const dopoN = T.slice(j + etichetta.length, j + etichetta.length + 14).trim().split(/\s+/)[0];
    return { casa: parseFloat(prima), ospiti: parseFloat(dopoN) }; };
  const mio = (etichetta) => { const i = T.indexOf('IL TUO TABELLINO'); if (i < 0) return null; const j = T.indexOf(etichetta, i); if (j < 0) return null;
    const prima = T.slice(Math.max(0, j - 12), j).trim().split(/\s+/).pop(); return parseFloat(prima); };
  return { garaGol: num('TABELLINO DELLA GARA', 'Gol'), garaTiri: num('TABELLINO DELLA GARA', 'Tiri'),
           mieiGol: mio('Gol'), mieiTiri: mio('Tiri'),
           /* [7.999.17] i tiri del TUO tabellino = il denominatore di «Tiri in porta x/y» nel riquadro in numeri */
           numeriTiri: (() => { const m = T.match(/(\d+)\/(\d+)\s*\n?\s*Tiri in porta/); return m ? +m[2] : null; })() };
});
console.log(`fase finale: ${r.fase} · tabellino a schermo: ${r.presente ? 'SÌ' : 'NO'} · errori di pagina: ${errori}${messaggi.length ? ' → ' + messaggi[0] : ''}`);
if (coerenza) {
  const g = coerenza.garaGol, t = coerenza.garaTiri;
  console.log(`\n--- coerenza fra i due tabellini ---`);
  console.log(`  i tuoi gol: ${coerenza.mieiGol} · gol della tua squadra nel tabellino: ${g ? g.casa : '?'}`);
  console.log(`  i tuoi tiri: ${coerenza.mieiTiri} · tiri della tua squadra nel tabellino: ${t ? t.casa : '?'}`);
  const okGol = g && coerenza.mieiGol != null && g.casa >= coerenza.mieiGol;
  const okTiri = t && coerenza.mieiTiri != null && t.casa >= coerenza.mieiTiri;
  console.log(`  ${okGol ? '✅' : '❌'} i tuoi gol sono dentro quelli della squadra`);
  console.log(`  ${okTiri ? '✅' : '❌'} i tuoi tiri sono dentro quelli della squadra`);
}
if (r.blocco) console.log('\n--- quello che si legge ---\n' + r.blocco.split('\n').slice(0, 30).join('\n'));
console.log('\nfoto:', foto);
await browser.close(); server.close();
const tiriOk = coerenza && coerenza.numeriTiri != null && coerenza.mieiTiri === coerenza.numeriTiri;
console.log(`  ${tiriOk ? '✅' : '❌'} [7.999.17] i tuoi tiri (${coerenza && coerenza.mieiTiri}) = i tiri del riquadro «in numeri» (${coerenza && coerenza.numeriTiri})`);
if (process.env.CPM_ROSSO === '1') { console.log(!tiriOk ? '✅ ROSSO come atteso: senza il 7.999.17 il tuo tabellino mostra i tiri della squadra' : '❌ il rosso non riproduce'); process.exit(!tiriOk ? 0 : 1); }
process.exit(r.presente && errori === 0 && tiriOk ? 0 : 1);
