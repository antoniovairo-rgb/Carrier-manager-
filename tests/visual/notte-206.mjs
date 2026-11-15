#!/usr/bin/env node
/* [giro 206 PO-373 «partite di notte», decisione PO «Atmosfera si', campo no»: cielo scuro, riflettori visibili con alone, stadio piu'
   buio intorno; il PRATO resta luminoso e coi colori pieni (vincolo 7.539)] GUARDIANO FOTOGRAFICO PER ZONE.
   Ora congelata (__CPM_TOD), meteo fisso (?cpmwx=partly), stadio forzato per tipologia, partita vera del salvataggio ferma al
   cronometro, tre camere fisse messe dalla sonda. Ogni campione del fotogramma e' assegnato a prato / cielo / spalti con un raggio
   nella scena (lib/notte-206.mjs). Si confronta la NOTTE col GIORNO dello stesso stadio e della stessa camera.
   VERDE (soglie dichiarate nel giro): prato di notte: luminosita' >= 95% del giorno e saturazione >= 93% · spalti di notte <= 80% del
   giorno · cielo di notte <= 0,20 e <= 26% del giorno · riflettori: di notte ogni testata ha il suo alone (aloni >= teste >= 4).
   ROSSO (__CPM_NO_G206): spalti di notte luminosi come di giorno e/o testate senza alone. CPM_FORZA_ROSSO=1: prova del guardiano.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node notte-206.mjs */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import { CAMERE, misuraZone, apriPartita } from './lib/notte-206.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FORZA = !!process.env.CPM_FORZA_ROSSO, TAG = process.env.CPM_TAG || (FORZA ? 'rosso' : 'dopo'), FOTO = process.env.CPM_FOTO !== '0';
const PRATO_L = +(process.env.CPM_PRATO_L || 0.95), PRATO_S = +(process.env.CPM_PRATO_S || 0.93), SPALTI = +(process.env.CPM_SPALTI || 0.80), CIELO_A = +(process.env.CPM_CIELO_A || 0.20), CIELO_R = +(process.env.CPM_CIELO_R || 0.26);
const DIR = path.join(ROOT, 'docs', 'sviluppo', 'giro206'); fs.mkdirSync(DIR, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function scatta(tpl, tod, vista, rosso) { const [vw, vh] = vista.split('x').map(Number);
  const { ctx, page, errs, fase } = await apriPartita(b, port, SAVE, { tod, tpl, vw, vh, init: (rosso || FORZA) ? { __CPM_NO_G206: 1 } : {}, installCdnRoutes, sleep });
  const o = { tpl, tod, vista, rosso: !!rosso, fase, errs: errs.length, cam: {} };
  for (const cam of Object.keys(CAMERE)) { const m = await misuraZone(page, cam, FOTO ? path.join(DIR, `${rosso ? 'prima' : TAG}-notte-${tpl}-${tod}-${cam}-${vista}.png`) : null); o.cam[cam] = m.zone; o.fari = m.fari; }
  o.spalti206 = await page.evaluate(() => window.__CPM_SPALTI206 || null);
  await ctx.close(); console.log(JSON.stringify(o)); return o; }
const R = [];
for (const tpl of (process.env.CPM_TPL || 'inglese,storico_it,comunale').split(',')) for (const tod of ['day', 'night']) R.push(await scatta(tpl, tod, '1280x720', false));
for (const tod of ['day', 'night']) R.push(await scatta('inglese', tod, '375x667', false));
const Z = []; if (!FORZA) for (const tpl of ['inglese', 'storico_it']) Z.push(await scatta(tpl, 'night', '1280x720', true));
await b.close(); srv.close();
fs.writeFileSync(path.join(DIR, `misura-notte-${TAG}.json`), JSON.stringify({ verde: R, rosso: Z }, null, 1));
const g = []; const righe = [];
const cfr = (N, G, nome, rosso) => { const out = { spaltiMax: 0, aloni: N.fari ? N.fari.aloni : null, teste: N.fari ? N.fari.teste : null };
  for (const cam of Object.keys(CAMERE)) { const n = N.cam[cam], d = G.cam[cam]; if (!n || !d) { if (!rosso) g.push(`${nome} ${cam}: non misurato`); continue; }
    for (const z of ['prato', 'cielo', 'spalti']) { const a = d[z], c = n[z]; if (!(a && c && a.n >= 150 && c.n >= 150)) continue; const rl = c.lum / a.lum, rs = c.sat / a.sat;
      righe.push(`${rosso ? 'ROSSO ' : ''}${nome} · ${cam} · ${z}: giorno ${a.lum}/${a.sat} → notte ${c.lum}/${c.sat} (lum ×${rl.toFixed(2)}, sat ×${rs.toFixed(2)})`);
      if (z === 'spalti') out.spaltiMax = Math.max(out.spaltiMax, rl);
      if (rosso) continue;
      if (z === 'prato') { if (rl < PRATO_L) g.push(`${nome} ${cam}: prato di notte al ${(rl * 100).toFixed(0)}% della luminosita' del giorno (minimo ${PRATO_L * 100}%)`); if (rs < PRATO_S) g.push(`${nome} ${cam}: prato di notte al ${(rs * 100).toFixed(0)}% della saturazione del giorno (minimo ${PRATO_S * 100}%)`); }
      if (z === 'spalti' && rl > SPALTI) g.push(`${nome} ${cam}: spalti di notte al ${(rl * 100).toFixed(0)}% del giorno (tetto ${SPALTI * 100}%)`);
      if (z === 'cielo') { if (c.lum > CIELO_A) g.push(`${nome} ${cam}: cielo di notte a ${c.lum} (tetto ${CIELO_A})`); if (rl > CIELO_R) g.push(`${nome} ${cam}: cielo di notte al ${(rl * 100).toFixed(0)}% del giorno (tetto ${CIELO_R * 100}%)`); } } }
  return out; };
for (const N of R.filter(x => x.tod === 'night')) { const G = R.find(x => x.tod === 'day' && x.tpl === N.tpl && x.vista === N.vista); const nome = `${N.tpl} ${N.vista}`;
  if (!G || N.fase !== 'playing' || G.fase !== 'playing') { g.push(`${nome}: scena non raggiunta (${N.fase}/${G && G.fase})`); continue; }
  const o = cfr(N, G, nome, false);
  if (!(N.fari && N.fari.notte && N.fari.teste >= 4 && N.fari.aloni >= N.fari.teste)) g.push(`${nome}: riflettori senza alone di notte ${JSON.stringify(N.fari)}`);
  if (N.errs || G.errs) g.push(`${nome}: errori di pagina`); }
for (const N of Z) { const G = R.find(x => x.tod === 'day' && x.tpl === N.tpl && x.vista === N.vista); if (!G) continue; const o = cfr(N, G, `${N.tpl} ${N.vista}`, true);
  if (!(o.spaltiMax > 0.9 || (o.aloni != null && o.aloni < o.teste))) g.push(`rosso ${N.tpl}: il difetto non si vede ${JSON.stringify(o)}`);
  if (N.tpl === 'inglese' && !(o.spaltiMax > 0.9)) g.push(`rosso ${N.tpl}: gli spalti non tornano luminosi (${o.spaltiMax.toFixed(2)})`); }
righe.forEach(x => console.log(x)); fs.writeFileSync(path.join(DIR, `misura-notte-${TAG}.txt`), righe.join('\n') + '\n');
if (g.length) { console.log('❌ notte-206'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ notte-206 verde (prato come di giorno, spalti e cielo piu\' scuri, un alone per testata) e il rosso si vede');
