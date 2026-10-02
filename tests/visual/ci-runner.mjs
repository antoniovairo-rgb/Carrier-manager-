#!/usr/bin/env node
/* [PO-163 — «una sola suite di non regressione e indicatori di stabilita'»] Esecutore unico delle catene. `npm run ci` = catena
   completa (quella di CLAUDE.md e del workflow GitHub + partita-vera e design-system); `ci:carriera`, `ci:grafica`, `ci:guardiani`
   le altre. Ogni passo gira in sequenza; il giro si registra in docs/governo/STABILITA.json (ultimi 60 giri: data, versione del
   gioco, catena, per passo esito e durata) da cui la pagina di governo calcola gli indicatori. Esce != 0 se un passo fallisce,
   ma esegue comunque TUTTI i passi (CPM_CI_STOP=1 per fermarsi al primo rosso). Uso: node ci-runner.mjs [completa|carriera|grafica|guardiani]. */
import { spawnSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const CATENE = {
  completa: ['test:vision', 'test:logic', 'typing-shortcuts', 'validate-situations', 'save-compat', 'replay', 'career-critical', 'partita-vera', 'design-system'],
  carriera: ['test:logic', 'save-compat', 'replay', 'career-critical', 'classifica-102', 'recupero-103', 'euro-attesa-181', 'riquadro-euro-105'],
  grafica: ['griglia-mobile', 'design-system', 'career-critical', 'test:logic', 'save-compat'],
  guardiani: ['goleade', 'scene-disegnabili', 'nomi-51', 'piazzati-eroe', 'cross-origine', 'tiro-caricato', 'passo-velocita', 'gesti-copertura-96', 'etichette-95',
    'attesa-difesa', 'calendario-nazionale', 'career-nat-sim', 'disappunto', 'esultanza-braccia', 'fallo-cercato', 'filtrante-intercetto', 'home-riquadri', 'numeri-home',
    'occasioni-dinamiche', 'occasioni-squadra', 'piede-preferito', 'ruleta', 'strisce-corpo', 'testa-tempismo', 'classifica-102', 'recupero-103', 'euro-attesa-181', 'riquadro-euro-105'],
  /* witness-frameskip FUORI (PO-180): instabile anche sulla 7.999.96 — sonda __CPM_WD_FILL a volte assente, pallone fermo nella
     finestra di 1,2 s (0-0,42u contro 3-6u), un campione fuori ordine. Da riscrivere prima di rientrare. */
};
const nome = process.argv[2] || 'completa'; const passi = CATENE[nome]; if (!passi) { console.error('catena sconosciuta: ' + nome + ' (' + Object.keys(CATENE).join(', ') + ')'); process.exit(2); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..'), FILE = path.join(ROOT, 'docs/governo/STABILITA.json'), LOG = process.env.CPM_CI_LOG || null;
const ver = (fs.readFileSync(path.join(ROOT, 'src/07-versione-save-interviste.jsx'), 'utf8').match(/GAME_VERSION="([0-9.]+)"/) || [])[1] || '?';
const env = { ...process.env, CPM_CHROME: process.env.CPM_CHROME || '/opt/pw-browsers/chromium', PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers', VISION_PROVIDER: process.env.VISION_PROVIDER || 'none' };
const giro = { data: new Date().toISOString().slice(0, 16).replace('T', ' '), versione: ver, catena: nome, passi: [] };
let rossi = 0;
for (const p of passi) {
  const t0 = Date.now(); const r = spawnSync('npm', ['run', '-s', p], { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const ok = r.status === 0, s = Math.round((Date.now() - t0) / 1000); if (!ok) rossi++;
  const coda = ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-3).join(' | ').slice(0, 240);
  giro.passi.push({ passo: p, ok, s, coda: ok ? undefined : coda });
  const riga = `${ok ? '✅' : '❌'} ${p} (${s}s)${ok ? '' : ' — ' + coda}`; console.log(riga); if (LOG) fs.appendFileSync(LOG, riga + '\n');
  if (!ok && process.env.CPM_CI_STOP === '1') break;
}
let st = []; try { st = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
st.unshift(giro); fs.writeFileSync(FILE, JSON.stringify(st.slice(0, 60), null, 1) + '\n');
const fine = `${rossi ? '❌' : '✅'} catena ${nome} su ${ver}: ${giro.passi.length - rossi}/${giro.passi.length} verdi`; console.log(fine); if (LOG) fs.appendFileSync(LOG, fine + '\nFINE\n');
process.exit(rossi ? 1 : 0);
