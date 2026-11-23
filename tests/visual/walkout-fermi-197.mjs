#!/usr/bin/env node
/* [7.999.115 guardiano — collaudo PO-197 «i giocatori corrono sul posto, non sono in modalita' idle nel prepartita»]
   Walkout forzato coi corpi GLB, testimone __CPM_WALK197 (velocita' vera e peso della clip di corsa di ogni corpo).
   Si conta quanti corpi hanno la corsa sopra 0,3 mentre si muovono a meno di 0,5 u/s («corsa sul posto»).
   [giro 58] IL CAMPIONAMENTO E' SUL TEMPO DI SCENA, non sul tempo reale. MISURATO sulla base 7.999.171: in headless coi corpi GLB il
   tempo di scena dell'ingresso (walkT, letto dal testimone __CPM_WALK245) scorre a ~0,15 s per secondo reale, e i 12 s reali della
   prima stesura coprivano ~2 s di un ingresso da 38,5 s: nessuno era ancora arrivato, verde e rosso davano entrambi 0 e il guardiano
   era rosso per cecita'. Ora un campione ogni 0,5 s di SCENA per tutto l'ingresso (fino a WALK_DUR, __CPM_WALKDUR245), i due bracci
   in parallelo; vale per qualunque durata dell'ingresso (38,5 s sulla base, 24 s col giro 54). Copertura < 90% = cieco = rosso.
   VERDE → somma ≤ 1/3 del rosso e al massimo 2 per campione. ROSSO (__CPM_NO_FERMI197) → somma ≥ SOGLIA_ROSSO.
   [giro 331 · PO-620] LA MISURA E' SU TUTTI I FOTOGRAMMI, non su un campione ogni 0,5 s. MISURATO (registratore in pagina, 320 fotogrammi
   di ingresso): nel verde NON ci sono «due corpi che corrono da fermi per 1,5 s»: ogni corpo corre da fermo per 0,10 s (due fotogrammi)
   quando arriva al posto, e i ventuno arrivi sono sfalsati fra 18,9 e 21,3 s. Un campione ogni 0,5 s ne pescava 0 o 2 a seconda del
   fotogramma in cui cadeva (banco «20:2 20.5:2 21:2» = 6, treno 202 «19.5:2 20:2 20.5:2 21:2» = 8, soglia 7): contava la fase del
   campionamento, non il gioco. Ora: `secondi` = secondi-corpo di corsa da fermo sommati su tutti i fotogrammi (tempo di scena);
   `somma` = secondi / PASSO (la stessa grandezza di prima, senza la fase); `picco` = media dei corpi che corrono da fermo sulla finestra
   peggiore di PASSO secondi (il valore atteso di un campione; `piccoFotogramma` e' il massimo istantaneo, solo riportato).
   Soglie invariate. Tre corse di fila sul banco, anche sotto carico: verde 2,15 s → somma 4,3, picco 1,2; rosso 9,3 s → 18,6, picco 4,4.
   Uso: node walkout-fermi-197.mjs */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SOGLIA_ROSSO = 15, PASSO = 0.5, TETTO_REALE = +(process.env.CPM_WF_TETTO || 600) * 1000;
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = true; window.__CPM_WALK197 = {}; window.__CPM_WALK245 = []; window.__CPM_WALKTEST74 = 1; if (r) window.__CPM_NO_FERMI197 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_WALK197 = {};
    /* [giro 331] REGISTRATORE FOTOGRAMMA PER FOTOGRAMMA, dentro la pagina. Il gioco scrive il tempo di scena dell'ingresso con un push su
       __CPM_WALK245 a OGNI fotogramma: il push e' sostituito da una funzione che, per quel fotogramma, legge il testimone dei corpi
       (__CPM_WALK197, i valori del fotogramma appena disegnato) e accumula per ogni corpo i SECONDI DI SCENA passati a «correre da fermo»
       (corsa sopra 0,3 con velocita' sotto 0,5 u/s). L'array resta vuoto (il gioco smette di scrivere a 4000 elementi). */
    const R = window.__R331 = { t: null, n: 0, fermo: {}, corpi: 0, fr: [], picco: 0, piccoT: null, stacchi: 0 }; const A = [];
    A.push = function (e) { try { const t = e && e.t; if (typeof t !== 'number') return 0; const c = (window.__CPM_WALK197 || {}).c || {}; const ks = Object.keys(c); R.corpi = Math.max(R.corpi, ks.length);
        let dt = (R.t == null) ? 0 : t - R.t; if (dt < 0) return 0; if (dt > 0.31) { R.stacchi++; dt = 0; }/* uno stacco di montaggio (giro 285) salta in avanti il tempo dell'ingresso: non e' tempo guardato */ R.t = t; R.n++; let n = 0;
        for (const k of ks) { const x = c[k]; if (x.run != null && x.run > 0.3 && x.sp < 0.5) { n++; R.fermo[k] = (R.fermo[k] || 0) + dt; } }
        if (n > R.picco) { R.picco = n; R.piccoT = t; } if (R.fr.length < 6000) R.fr.push([t, dt, n]); } catch (_e) {} return 0; };
    window.__CPM_WALK245 = A; return window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT(); });
  let wt = 0, dur = null, uscita = 'tetto'; const t0 = Date.now();
  /* si aspetta un EVENTO (la fase lascia l'ingresso), non un tempo: il ciclo qui sotto guarda soltanto, la misura la fa il registratore */
  while (Date.now() - t0 < TETTO_REALE) { await sleep(300);
    const r = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), t: (window.__R331 || {}).t, dur: window.__CPM_WALKDUR245 })).catch(() => null); if (!r) continue;
    if (r.dur != null) dur = r.dur; if (r.t != null) wt = Math.max(wt, r.t);
    if (r.ph !== 'walkout') { uscita = 'fine-ingresso'; break; } }
  const R = await page.evaluate(() => window.__R331).catch(() => null) || { n: 0, fermo: {}, corpi: 0, fr: [], picco: 0, stacchi: 0 };
  await ctx.close();
  const copertura = dur ? Math.min(1, wt / (dur - 0.3)) : 0;
  const sec = Object.values(R.fermo).reduce((a, x) => a + x, 0);/* secondi-corpo di corsa da fermo, tempo di scena */
  const per = Object.entries(R.fermo).filter(([, x]) => x > 0.05).map(([k, x]) => k + ':' + x.toFixed(2)).join(' ');
  const F = R.fr || [], con = F.filter(f => f[2] > 0); const serie = con.length ? `${con[0][0].toFixed(2)}-${con[con.length - 1][0].toFixed(2)}` : '';
  /* PICCO: «quanti corrono da fermo in un campione». Un campione ogni PASSO secondi cade in un fotogramma qualunque: il suo valore atteso e'
     la MEDIA dei corpi che corrono da fermo sulla finestra di PASSO secondi di scena che finisce li'. Si prende la finestra peggiore. */
  let picco = 0, piccoT = null; for (let i = 0, j = 0, acc = 0; i < F.length; i++) { acc += F[i][2] * F[i][1]; while (F[j][0] <= F[i][0] - PASSO) { acc -= F[j][2] * F[j][1]; j++; } const m = acc / PASSO; if (m > picco) { picco = m; piccoT = F[i][0]; } }
  /* `somma` resta la grandezza di sempre («corpi che corrono da fermo», contati ogni PASSO secondi di scena): ora e' l'integrale su tutti i
     fotogrammi diviso per PASSO, cioe' la stessa conta senza la fase del campionamento (prima un campione in piu' o in meno valeva 2) */
  return { pm, dur, scena: +wt.toFixed(1), copertura: +copertura.toFixed(2), reale_s: Math.round((Date.now() - t0) / 1000), uscita, fotogrammi: R.n, stacchi: R.stacchi, corpi: R.corpi, secondi: +sec.toFixed(2), somma: +(sec / PASSO).toFixed(1), picco: +picco.toFixed(2), piccoT: piccoT == null ? null : +piccoT.toFixed(2), piccoFotogramma: R.picco, serie, per };
}
const [v, r] = await Promise.all([braccio(false), braccio(true)]);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_FERMI197):', JSON.stringify(r));
const cieco = [v, r].some(x => x.copertura < 0.9 || x.corpi < 20 || x.fotogrammi < 200);/* [giro 331] almeno 200 fotogrammi di ingresso misurati */
const ok = !cieco && r.somma >= SOGLIA_ROSSO && v.somma <= r.somma / 3 && v.picco <= 2;
await b.close(); srv.close();
const perche = cieco ? 'non giudicato: ' + [v, r].map((x, i) => `${i ? 'rosso' : 'verde'} copertura ${x.copertura}, corpi ${x.corpi}, fotogrammi ${x.fotogrammi}`).join(' · ')
  : [r.somma >= SOGLIA_ROSSO ? null : `braccio rosso: somma ${r.somma} < ${SOGLIA_ROSSO} (il difetto non si vede)`, v.somma <= r.somma / 3 ? null : `braccio verde: somma ${v.somma} > un terzo del rosso (${(r.somma / 3).toFixed(1)})`, v.picco <= 2 ? null : `braccio verde: picco ${v.picco} > 2 a ${v.piccoT} s`].filter(Boolean).join(' · ');
console.log(ok ? `✅ walkout-fermi-197 verde (verde somma ${v.somma}, picco ${v.picco}; rosso somma ${r.somma}, picco ${r.picco})` : `❌ walkout-fermi-197 ${cieco ? 'CIECO' : 'ROSSO'} — ${perche}`); process.exit(ok ? 0 : 1);
