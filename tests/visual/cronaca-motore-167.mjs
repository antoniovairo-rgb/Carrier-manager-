#!/usr/bin/env node
/* GUARDIANO — [giro 167 PO-362] LA CRONACA A MOTORE ACCESO RACCONTA FATTI DI ADESSO.

   DA DOVE VIENE. Dal 7.870 la partita vera la racconta il narratore del motore del possesso (`narra870`, src/15): le frasi nascono
   dai FATTI che il motore restituisce a ogni battito. Fino al giro 167 nessun guardiano lo sorvegliava a motore acceso (i guardiani
   della cronaca giudicavano la cronaca pescata, o erano ciechi). Misurato nel giro 167 (4 partite vere, registro dei fatti di ogni
   tick): 15 righe su 272 (5,5%) raccontavano un fatto di DUE minuti prima, sempre a cavallo di un highlight — i fatti del minuto prima
   della scena restavano nel raccoglitore e al primo battito dopo la scena venivano raccontati come se fossero appena successi
   («Colombo allarga troppo: la palla esce» al 5' per un fallo laterale del 3'). Correzione nel gioco (`_vec167`/`msPend167Ref`): un
   fatto piu' vecchio del minuto precedente scende sotto i fatti freschi, e se nel battito ci sono solo fatti vecchi la riga non esce
   (i loro conti — tiri, falli, angoli — passano alla riga successiva).

   COSA GIUDICA. Per ogni riga del narratore (testimone `__CPM_NAR167`) si cerca nel registro dei fatti del motore (si avvolge `tick`,
   lib/cronaca-motore.mjs) il fatto piu' recente dello stesso tipo e con lo stesso uomo; l'ETA' e' il minuto della riga meno il minuto
   del fatto. Il narratore racconta al battito i fatti del minuto appena giocato, quindi eta' 0-1 e' il presente; 2 o piu' e' passato.
   Criteri: (1) quota di righe con eta' >= 2 minuti <= 2%; (2) campione >= 80 righe con il fatto trovato; (3) ogni partita arriva al
   fischio oltre l'85' (una partita troncata e' «non giudicata» = rosso).
   SOGLIE FISSATE DOPO LA MISURA (giro 167): verde 0/129 (0,0%), rosso `__CPM_NO_G167F` 7/138 (5,1%). 2% sta fra i due.

   PROVA DEL ROSSO: CPM_ROSSO=1 → `__CPM_NO_G167F` (il narratore di prima). Verde e rosso stampati per ultimi.
     CPM_CHROME=/opt/pw-browsers/chromium node cronaca-motore-167.mjs [CPM_ROSSO=1]                                                  */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { giocaPartita } from './lib/cronaca-motore.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 4), SOGLIA = 2, MIN_RIGHE = 80, MIN_MINUTO = 85;
const CLUB = /calcio d'inizio|dal centro|rimessa laterale per|angolo per|calcio d'angolo per|rinvio dal fondo per|punizione per/i;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let n = 0, vecchie = 0, senza = 0; const es = [], errs = [], fini = []; let troncata = false; const eta = {};
for (let i = 0; i < PARTITE; i++) {
  const r = await giocaPartita(b, port, { nome: 'Cron' + i, seed: 167 + i * 29, flags: ROSSO ? ['__CPM_NO_G167F'] : [] });
  errs.push(...r.errs); fini.push(`${r.minMax}' (${r.fine})`); if (r.fine !== 'fischio' || r.minMax < MIN_MINUTO) troncata = true;
  const eroe = r.nome.toLowerCase();
  for (const x of r.nar) {
    const tl = x.txt.toLowerCase();
    const c = r.fatti.filter(f => f.t <= x.t && f.k === x.k && (!f.n.length || CLUB.test(x.txt) || f.n.some(nm => nm === '{P}' ? tl.includes(eroe) : tl.includes(nm.toLowerCase()))));
    if (!c.length) { senza++; continue; }
    const a = x.min - c[c.length - 1].min; n++; eta[a] = (eta[a] | 0) + 1;
    if (a >= 2) { vecchie++; es.push(`${x.min}' ${x.k} (fatto del ${c[c.length - 1].min}') «${x.txt}»`); }
  }
}
await b.close(); srv.close();
const q = n ? 100 * vecchie / n : 0;
console.log(`\n=== LA CRONACA A MOTORE ACCESO RACCONTA FATTI DI ADESSO${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO_G167F)' : ''} ===`);
console.log(`  partite: ${fini.join(' · ')}`);
console.log(`  righe con il fatto trovato ${n} (minimo ${MIN_RIGHE}) · senza fatto nel registro ${senza} · eta' in minuti ${JSON.stringify(eta)}`);
console.log(`  righe che raccontano un fatto di 2' o piu' prima: ${vecchie}/${n} = ${q.toFixed(1)}%   (soglia ${SOGLIA}%)`);
for (const e of es.slice(0, 4)) console.log('    ' + e);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (troncata || n < MIN_RIGHE) { console.log(`\n❌ NON GIUDICATO: ${troncata ? 'una partita non e\' arrivata al fischio oltre l\'' + MIN_MINUTO + '\'' : 'campione sotto il minimo'}`); process.exit(2); }
const ko = q > SOGLIA;
if (ROSSO) {
  if (ko) { console.log('\n✅ prova del rosso riuscita: col narratore di prima la cronaca racconta il passato come presente'); process.exit(0); }
  console.log('\n❌ PROVA DEL ROSSO FALLITA: il guardiano resta verde anche col narratore di prima'); process.exit(2);
}
if (ko) { console.log('\n❌ la cronaca racconta fatti vecchi come se fossero appena successi'); process.exit(2); }
console.log('\n✅ ogni riga del narratore racconta il minuto appena giocato');
