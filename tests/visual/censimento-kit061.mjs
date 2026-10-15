#!/usr/bin/env node
/* [PO-061 giro 48] CENSIMENTO FOTOGRAFICO DEI KIT IN PARTITA, corpi CGTrader accesi (il default), a 360 e 412 px di larghezza.
   Per ogni motivo forzato sulla squadra di casa (__CPM_FORCE_KITPAT, solo sotto cpmtest) apre una partita vera, fotografa il gioco
   (il gioco fluido e' la lavagna 2D, quindi niente foto) e fotografa un highlight forzato (camera vicina all'eroe). Uso: node censimento-kit061.mjs <prefisso> ; CPM_ROSSO=1 → __CPM_NO_KIT061.
   Scrive docs/sviluppo/foto-giro48/<prefisso>-<larghezza>-<motivo>-{azione,zoom}.png — densita' di un telefono (2,625) */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const OD = path.join(ROOT, 'docs/sviluppo/foto-giro48'); fs.mkdirSync(OD, { recursive: true });
const PRE = process.argv[2] || 'censimento'; const ROSSO = process.env.CPM_ROSSO === '1';
const LARG = (process.env.CPM_LARG || '360,412').split(',').map(Number);
const MOTIVI = (process.env.CPM_MOTIVI || 'band/vband,halves/sash,sleeves/solid').split(',');
const GI = +(process.env.CPM_GI || 12);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = [];
for (const w of LARG) for (const mot of MOTIVI) {
  const page = await b.newPage({ viewport: { width: w, height: w === 360 ? 780 : 915 }, deviceScaleFactor: 2.625 }); await installCdnRoutes(page);
  const E = []; page.on('pageerror', e => E.push(e.message));
  await page.addInitScript(([r, m]) => { window.__CPM_PRESENT = 1; const [h, a] = m.split('/'); window.__CPM_KITPAT061 = { home: h, away: a, homeC2: '#f4f4f4', awayC2: '#111827' }; if (r) window.__CPM_NO_KIT061 = 1; }, [ROSSO, mot]);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Kit061' }); await sleep(10000);
    await page.evaluate(gi => window.__CPM_FORCE_SIT(gi, true), GI); await sleep(4000);
    await page.screenshot({ path: path.join(OD, `${PRE}-${w}-${mot.replace('/', '+')}-azione.png`) });
    /* ritaglio ingrandito sulla fascia del campo 3D dove stanno i giocatori dell'highlight */
    const y0 = Math.round((w === 360 ? 780 : 915) * 0.42), hh = Math.round((w === 360 ? 780 : 915) * 0.30);
    await page.screenshot({ path: path.join(OD, `${PRE}-${w}-${mot.replace('/', '+')}-zoom.png`), clip: { x: 0, y: y0, width: w, height: hh }, scale: 'device' });
    const k = await page.evaluate(() => (window.__CPM_KIT061 || []).map(x => x.pattern));
    out.push({ w, mot, kit: [...new Set(k)], errori: E.length });
  } catch (e) { out.push({ w, mot, err: String(e.message).slice(0, 120) }); }
  await page.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(out));
