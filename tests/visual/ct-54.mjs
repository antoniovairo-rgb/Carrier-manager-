#!/usr/bin/env node
/* [7.999.54 guardiano — collaudo PO «il mister non cambia in nazionale»] In una gara della Nazionale parla il CT, non il mister
   del club; il CT dipende dalla nazione e cambia a ogni ciclo di 4 stagioni. VERDE: CT ≠ mister del club in nazionale, uguale al
   club in campionato, cicli diversi → almeno 2 nomi su 4 cicli, nazioni diverse → CT diversi. ROSSO __CPM_NO_CT54: in nazionale
   torna il mister del club (il guardiano deve vederlo). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const b = await launchBrowser(); const page = await b.newPage(); await installCdnRoutes(page);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load' });
await page.waitForFunction(() => typeof misterInPartita === 'function', null, { timeout: 90000 });
const r = await page.evaluate(() => {
  const pl = (nation, season) => ({ nation, season, coach: { name: 'Mister Tarantola', style: 'Offensivo' } });
  const out = {};
  out.naz = misterInPartita(pl('Italia', 12), 'euroMondiale_ko').name;
  out.club = misterInPartita(pl('Italia', 12), 'career').name;
  out.cicli = [1, 5, 9, 13].map(s => ctDiNazione('Italia', s).name);
  out.stessoCiclo = [9, 10, 11, 12].map(s => ctDiNazione('Italia', s).name);
  out.nazioni = ['Italia', 'Spagna', 'Belgio', 'Francia'].map(n => ctDiNazione(n, 12).name);
  window.__CPM_NO_CT54 = 1; out.rosso = misterInPartita(pl('Italia', 12), 'national').name; delete window.__CPM_NO_CT54;
  return out;
});
await b.close(); srv.close();
console.log(JSON.stringify(r));
const ok = r.naz !== r.club && /^CT /.test(r.naz) && r.club === 'Mister Tarantola' && new Set(r.cicli).size >= 2
  && new Set(r.stessoCiclo).size === 1 && new Set(r.nazioni).size >= 3;
const rossoVisto = r.rosso === 'Mister Tarantola';
console.log(ok ? '✅ in Nazionale parla il CT, che cambia col ciclo' : '❌ CT errato');
console.log(rossoVisto ? '✅ il rosso __CPM_NO_CT54 si vede' : '❌ il rosso non spegne il CT');
process.exit(ok && rossoVisto ? 0 : 1);
