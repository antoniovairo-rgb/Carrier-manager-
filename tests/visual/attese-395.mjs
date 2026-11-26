#!/usr/bin/env node
/* ============================================================================
   attese-395.mjs — GUARDIANO STATICO: NESSUNA ATTESA FISSA PRIMA DI UNA LETTURA DEL SALVATAGGIO (giro 395, PO-532)

   Regola 4 di docs/governo/PROCESSO.md («Controlli instabili»): si attende un evento, mai un tempo fisso. I controlli di carriera
   qui sotto leggevano localStorage 'cpm-v3' dopo `sleep(N)`; ora aspettano l'evento con lib/attese-395.mjs
   (salvataggio identico alla copia viva, scritto dopo l'azione, fermo da 700 ms; tetto scaduto = «non giudicato» = rosso).

   VERDE (exit 0) se tutte vere:
     A. nessuno dei controlli toccati ha un'attesa fissa prima di una lettura del salvataggio (rilevatore censisciAttese395);
     B. ognuno importa lib/attese-395.mjs e chiama attendiSalvataggio395;
     C. la lib forza il codice 1 e stampa «non giudicato» per ultimo quando un tetto scade; la quiete (700) supera il debounce
        dell'autosave letto in src/18 (setTimeout del salvataggio di CareerApp);
     D. il rilevatore non e' cieco: sulla fotografia del prima (fixtures/attese-395-prima.json) ritrova tutte e 16 le attese.
   ROSSO (prova): CPM_NO_G395=1 → A si giudica sull'ELENCO DI PRIMA (le righe della fotografia): il guardiano DEVE uscire 1.
   Lo script npm nomina anche lib/attese-395.mjs e la fotografia: cosi' il trenino (regola f di tools/trenino-317.mjs) li assegna a
   questo guardiano invece di girare la mappa intera. Gli argomenti non sono letti.
   Uso: node attese-395.mjs   ·   CPM_NO_G395=1 node attese-395.mjs   ·   CPM_CENSIMENTO=1 stampa anche il censimento di tests/visual.
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { censisciAttese395 } from './lib/attese-395.mjs';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const RADICE = path.resolve(QUI, '../..');
const ROSSO = process.env.CPM_NO_G395 === '1';
const CONTROLLI_395 = ['infortunio-263.mjs', 'investimento-223.mjs', 'meta-conto-265.mjs', 'svincolato-264.mjs', 'simulata-272.mjs',
  'rinnovo-270.mjs', 'classifica-194.mjs', 'euro-attesa-181-test.mjs'];
const FOTO = JSON.parse(fs.readFileSync(path.join(QUI, 'fixtures/attese-395-prima.json'), 'utf8'));
const difetti = []; const righe = [];
const ok = (c, m) => { righe.push((c ? '✓ ' : '✗ ') + m); if (!c) difetti.push(m); };
const daFoto = (f) => { const v = FOTO.file[f]; return Array.from({ length: v.righe_totali }, (_, i) => v.righe[i + 1] ?? '').join('\n'); };

// A + B
for (const f of CONTROLLI_395) {
  const testo = ROSSO ? daFoto(f) : fs.readFileSync(path.join(QUI, f), 'utf8');
  const h = censisciAttese395(testo);
  ok(!h.length, `${f}: nessuna attesa fissa prima di una lettura del salvataggio${h.length ? ' — ' + h.map(x => `r.${x.riga_attesa}→${x.riga_lettura} ${x.attesa}`).join(', ') : ''}`);
  if (!ROSSO) ok(/from '\.\/lib\/attese-395\.mjs'/.test(testo) && /attendiSalvataggio395\(/.test(testo), `${f}: importa lib/attese-395.mjs e chiama attendiSalvataggio395`);
}
// C
const lib = fs.readFileSync(path.join(QUI, 'lib/attese-395.mjs'), 'utf8');
ok(/process\.on\('exit'/.test(lib) && /process\.exitCode = 1/.test(lib) && /non giudicato/.test(lib), 'lib: tetto scaduto = «non giudicato» stampato per ultimo e codice 1');
const quiete = +((lib.match(/quiete = (\d+)/) || [])[1] || 0);
const src18 = fs.readFileSync(path.join(RADICE, 'src/18-career-app.jsx'), 'utf8');
const deb = (src18.match(/saveTimerRef\.current=setTimeout\(\(\)=>\{[\s\S]{0,1500}?\},(\d+)\);/) || [])[1];
ok(!!deb && quiete > +deb, `lib: quiete ${quiete} ms oltre il debounce dell'autosave di src/18 (${deb || 'non trovato'} ms)`);
// D
let visti = 0, attesi = 0;
for (const f of CONTROLLI_395) {
  const v = FOTO.file[f]; const h = censisciAttese395(daFoto(f)).map(x => `${x.riga_attesa}->${x.riga_lettura} ${x.attesa}`);
  attesi += v.attese.length; visti += h.filter(x => v.attese.includes(x)).length;
}
ok(attesi === 16 && visti === attesi, `rilevatore non cieco: sulla fotografia del prima ritrova ${visti}/${attesi} attese (attese 16)`);

if (process.env.CPM_CENSIMENTO === '1') {
  let tot = 0, nf = 0;
  for (const f of fs.readdirSync(QUI).filter(x => /\.mjs$/.test(x)).sort()) {
    const h = censisciAttese395(fs.readFileSync(path.join(QUI, f), 'utf8')); if (!h.length) continue;
    nf++; tot += h.length; console.log(`  ${f}: ${h.map(x => `r.${x.riga_attesa}→${x.riga_lettura} ${x.attesa}`).join(' · ')}`);
  }
  console.log(`censimento tests/visual: ${tot} attese fisse prima di una lettura del salvataggio in ${nf} file (fuori dai controlli di questo guardiano)`);
}
console.log(righe.join('\n'));
const braccio = ROSSO ? 'braccio ROSSO (CPM_NO_G395=1, elenco di prima)' : 'braccio verde';
console.log(difetti.length ? `❌ attese-395 · ${braccio}: ${difetti.length} difetti — ${difetti.slice(0, 2).join(' · ')}` : `✅ attese-395 · ${braccio}: ${CONTROLLI_395.length} controlli aspettano il salvataggio, nessuna attesa fissa prima della lettura`);
process.exit(difetti.length ? 1 : 0);
