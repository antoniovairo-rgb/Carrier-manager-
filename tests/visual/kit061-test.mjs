#!/usr/bin/env node
/* [PO-061 giro 48] GUARDIANO — KIT 3D DI QUALITA': i motivi delle maglie si disegnano dal corpo, collo e polsini, niente pelle che buca, calzettoni nel colore del kit (prima sempre bianchi: dipinti nella texture delle gambe).
   Due prove. (1) PROVINO (provino-kit061.mjs, corpo lod1 vestito col codice VERO fra i marcatori KIT061, resa del renderer di
   partita): misura sui pixel della foto di fronte la quota del secondo colore sulla maglia — banda verticale ≥0,25 (prima 0: sul
   davanti non c'era), maniche ≥0,22 (prima 0,145), fascia diagonale ≥0,17 (prima 0,115) — e i pixel color pelle nel riquadro del
   petto delle tinte unite ≤15 (prima 26-38: il busto bucava la maglia). (2) PARTITA VERA coi corpi CGTrader (il default), motivi
   forzati band/vband (__CPM_KITPAT061, solo cpmtest): il pittore dal corpo e' passato per entrambi, i calzettoni sono stati tinti (almeno due colori, ≥2000 px della texture ciascuno), zero errori di pagina.
   CPM_ROSSO=1 → __CPM_NO_KIT061: deve tornare il mondo di prima (nessuna banda davanti, pelle sul petto, pittore mai chiamato). */
import { spawnSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1'; const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(HERE, 'out'); fs.mkdirSync(OUT, { recursive: true });
const pr = spawnSync(process.execPath, [path.join(HERE, 'provino-kit061.mjs'), 'kit061-guardiano'], { env: { ...process.env, CPM_VICINO: '1', CPM_OUT: OUT }, encoding: 'utf8', timeout: 240000 });
const line = (pr.stdout || '').split('\n').find(l => l.startsWith('PROVINO '));
const P = line ? JSON.parse(line.slice(8)) : { ok: false, err: 'provino senza esito: ' + (pr.stderr || '').slice(0, 200) };
const M = (P.misure || []); const q = pat => (M.find(m => m.pat === pat) || {}).quotaB;
const pelle = M.filter(m => m.pat === 'solid').map(m => m.pelle);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const E = []; page.on('pageerror', e => E.push(e.message));
await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_KITPAT061 = { home: 'band', away: 'vband' }; if (r) window.__CPM_NO_KIT061 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Kit061' }); await sleep(12000);
const pit = await page.evaluate(() => [...new Set((window.__CPM_KIT061 || []).map(x => x.pattern))]);
const calze = await page.evaluate(() => (window.__CPM_SOCKS061 || []).map(x => x.socks + ':' + x.px));
await b.close(); srv.close();
console.log(`provino ok=${P.ok} · banda verticale ${q('vband')} · maniche ${q('sleeves')} · fascia ${q('sash')} · pelle sul petto (tinte unite) ${JSON.stringify(pelle)} · pittore in partita ${JSON.stringify(pit)} · calzettoni tinti ${JSON.stringify(calze)} · errori pagina ${E.length}`);
if (ROSSO) {
  const ok = P.ok && q('vband') < 0.1 && pelle.length && Math.min(...pelle) > 20 && !pit.length && !calze.length;
  console.log(ok ? '✅ ROSSO come atteso: senza il giro 48 la banda sparisce dal davanti, la pelle buca il petto, il pittore dal corpo non gira' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1);
}
const fails = [];
if (!P.ok) fails.push('provino fallito: ' + (P.err || ''));
if (!(q('vband') >= 0.25)) fails.push(`banda verticale ${q('vband')} < 0,25`);
if (!(q('sleeves') >= 0.22)) fails.push(`maniche ${q('sleeves')} < 0,22`);
if (!(q('sash') >= 0.17)) fails.push(`fascia diagonale ${q('sash')} < 0,17`);
if (!pelle.length || Math.max(...pelle) > 15) fails.push(`pelle sul petto ${JSON.stringify(pelle)} > 15`);
if (!(pit.includes('band') && pit.includes('vband'))) fails.push('in partita il pittore dal corpo non e\' passato per band/vband: ' + JSON.stringify(pit));
if (calze.length < 2 || calze.some(c => +c.split(':')[1] < 2000)) fails.push('calzettoni non tinti col colore del kit (almeno 2 colori, >=2000 px ciascuno): ' + JSON.stringify(calze));
if (E.length) fails.push('errori di pagina: ' + E[0]);
console.log(fails.length ? '❌ FAIL kit-061\n  ' + fails.join('\n  ') : '✅ PASS kit-061'); process.exit(fails.length ? 1 : 0);
