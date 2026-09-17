/* GUARDIANO DEL TEMA SCURO — il PO gioca su un telefono, e di notte.
   Misura il contrasto WCAG delle schermate fuori partita a 412 px (la taglia del suo telefono)
   nel tema SCURO, e giudica DUE cose: (a) i nodi sotto soglia stanno sotto il tetto, (b) NESSUN
   nodo e' praticamente invisibile. Il secondo numero esiste perche' il conteggio da solo mente:
   alla partenza c'erano 61 nodi sotto soglia e uno di quei 61 aveva rapporto 1,01 — testo
   invisibile sulla riga piu' importante del calendario — e un conteggio non lo distingue da 61
   nodi appena sotto la soglia.
   Rosso: CPM_ROSSO=__CPM_NO944 spegne l'alzata dei colori dei club. */
/* GUARDIANO RITIRATO — 7.947, decisione del PO: «non perdere tempo con grafica chiara o scura della
   grafica extra partita. La grafica deve essere UNA e fatta benissimo», con la base CHIARA, e
   l'interruttore del tema tolto dalle impostazioni.
   Il tema scuro non e' piu' raggiungibile, quindi questo guardiano non ha piu' un oggetto. Non lo
   cancello e non lo lascio girare: forzando `cpm-dark=1` dalla sonda misurerebbe il tema CHIARO e
   direbbe di aver misurato lo scuro — un guardiano che mente e' peggio di un guardiano ritirato.
   Cosa resta VALIDO della 7.944, ed e' il motivo per cui quel lavoro non e' buttato: i fondi chiari
   scritti a mano sostituiti col loro token e i colori dei club resi leggibili erano giusti in ogni caso.
   Cosa decade: la misura del contrasto notturno (61 -> 46 nodi) non ha piu' un bersaglio. */
console.log('\n=== CONTRASTO NEL TEMA SCURO — GUARDIANO RITIRATO ===');
console.log('  Il tema scuro e\' stato rimosso alla 7.947 per decisione del PO: la grafica e\' UNA, chiara,');
console.log('  e l\'interruttore non c\'e\' piu\'. Questo guardiano non ha piu\' un oggetto da misurare.');
console.log('\n✅ RITIRATO — dichiarato, non cancellato');
process.exit(0);
/* --- il corpo originale resta qui sotto, inerte, come verbale di cosa misurava --- */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const TETTO = +(process.env.CPM_TETTO || 52);
const PAVIMENTO = +(process.env.CPM_PAVIMENTO || 1.25);
const rosso = (process.env.CPM_ROSSO || '').includes('__CPM_NO944');
function misura(tema, rossi){
  const out = path.join('/tmp', `cpm-contrasto-${tema}-${rossi?'rosso':'verde'}`);
  execFileSync(process.execPath, [path.join(QUI,'griglia-mobile.mjs')],
    { encoding:'utf8', stdio:['ignore','ignore','pipe'], maxBuffer:8*1024*1024,
      env:{...process.env, CPM_TEMA:tema, CPM_LARG:'412', CPM_FOTO:'0', CPM_OUT:out,
           CPM_ROSSO: rossi?'__CPM_NO944':'' } });
  const d = JSON.parse(fs.readFileSync(path.join(out,'dati.json'),'utf8'));
  let sotto=0, mis=0, peggio=99, dove='';
  for(const [nome,per] of Object.entries(d.dati)) for(const v of Object.values(per)){
    sotto += v.nSotto||0; mis += v.nMisurati||0;
    for(const q of (v.peggiori||[])) if(q.rap<q.soglia && q.rap<peggio){ peggio=q.rap; dove=`${nome}: ${(q.esempio||'').slice(0,24)} (${q.testo} su ${q.fondo})`; }
  }
  return { sotto, mis, peggio:+peggio.toFixed(2), dove };
}
const v = misura('scuro', rosso);
console.log(`\n=== CONTRASTO NEL TEMA SCURO === 412 px, schermate fuori partita${rosso?' [ROSSO __CPM_NO944]':''}`);
console.log(`  nodi sotto la soglia WCAG: ${v.sotto} su ${v.mis} misurabili (tetto ${TETTO})`);
console.log(`  il peggiore: ${v.peggio} (pavimento ${PAVIMENTO}) — ${v.dove}`);
const okTetto = v.sotto <= TETTO, okPav = v.peggio >= PAVIMENTO;
if(rosso){ const rotto = !okTetto || !okPav;
  console.log(rotto ? '\n✅ difetto riprodotto — senza l\'alzata dei colori il tema scuro non regge'
                    : '\n❌ il rosso NON riproduce il difetto: la prova non vale');
  process.exit(rotto?0:1); }
if(!okTetto) console.log(`  ✗ troppi nodi sotto soglia (${v.sotto} > ${TETTO})`);
if(!okPav)  console.log(`  ✗ c'è del testo praticamente invisibile (${v.peggio} < ${PAVIMENTO})`);
const ok = okTetto && okPav;
console.log(ok ? '\n✅ PASS — di notte si legge: nessun testo invisibile e il conto sta sotto il tetto'
               : '\n❌ FAIL — il tema scuro non regge');
process.exit(ok?0:1);
