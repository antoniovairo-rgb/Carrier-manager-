#!/usr/bin/env node
/* [giro 199 · PO-409] GUARDIANO figurina-199 — la figurina di Carriera › Profilo e' compatta e senza fascia rossa vuota.
   Gioco vero (?cpmtest=1), una pagina nuova per viewport. Soglie FISSATE PRIMA della correzione (misura prima, build 7.999.193:
   375x667 alta 365 px = 0,547 schermi e 94 px vuoti · 390x844 380 px / 102 · 1366x768 392 px / 110):
     - spazio vuoto fra la riga alta (OVR + volto) e la fascia del nome <= 16 px, su tutte e tre le viste;
     - altezza <= 0,42 schermi a 375x667 e 390x844, <= 0,40 schermi a 1366x768;
     - la riga «anni · club» sotto la figurina sta dentro il primo schermo a 375x667;
     - zero errori di pagina.
   Rosso window.__CPM_NO_G199 (altezza fissa w*1,4, fascia in fondo, larghezza 62%) → DEVE essere bocciato.
   Foto (dpr 2) in docs/sviluppo/giro199/. Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node figurina-199.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser } from './lib/harness.mjs';
import { salva, apri, misuraFigurina } from './misura-199.mjs';

const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro199'); fs.mkdirSync(FOTO, { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const VUOTO_MAX = 16, QUOTA = { 375: 0.42, 390: 0.42, 1366: 0.40 };
const giudica = (f, w) => !!f && f.vuoto <= VUOTO_MAX && f.quota <= QUOTA[w] && (w !== 375 || (f.rigaAnni != null && f.rigaAnni <= f.H));
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
try {
  for (const [flag, rosso] of [[[], false], [['__CPM_NO_G199'], true]]) {
    for (const [w, h] of [[375, 667], [390, 844], [1366, 768]]) {
      const a = await apri(browser, port, salva(), flag, w, h); const f = await misuraFigurina(a.page);
      const tag = w === 1366 ? 'pc' : String(w);
      await a.page.screenshot({ path: path.join(FOTO, `${rosso ? 'prima' : 'dopo'}-figurina-${tag}.png`) });
      const v = giudica(f, w) && !a.errors.length;
      const d = f ? `alta ${f.h} px (${f.quota} schermi, soglia ${QUOTA[w]}) · vuoto ${f.vuoto} px (soglia ${VUOTO_MAX}) · riga anni a ${f.rigaAnni} px` : 'figurina non trovata (non giudicato)';
      if (!rosso) ok(v, `verde ${w}x${h}: ${d}`); else ok(!v && !!f, `rosso ${w}x${h} bocciato: ${d}`);
      await a.page.close();
    }
  }
} finally { await browser.close(); srv.close(); }
console.log(fails.length ? `\n✗ figurina-199 ROSSO (${fails.length})` : '\n✓ figurina-199 VERDE');
process.exit(fails.length ? 1 : 0);
