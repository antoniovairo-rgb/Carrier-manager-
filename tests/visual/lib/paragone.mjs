/* IL PARAGONE — un rosso e un verde nello stesso giro, o non e' un paragone.

   PERCHE' ESISTE. Il 23 agosto ho detto al PO «l'appoggio funziona, 15,7 → 10,7 metri» e non era vero:
   avevo confrontato il rosso di UNA misura col verde di UN'ALTRA. Queste sonde ballano parecchio fra un
   giro e l'altro, e appaiando i due colori nello stesso giro il segno si e' GIRATO — il rosso batteva il
   verde. Non e' stato l'unico caso: nella stessa giornata sette conclusioni sono nate da un difetto del mio
   strumento e non del gioco, e questa e' quella che e' arrivata piu' vicina a essere spedita.

   COSA IMPONE, e non e' un promemoria ma un attrezzo:
     1. i due colori girano nello STESSO processo e sulla STESSA popolazione, alternati;
     2. ogni colore si misura ALMENO DUE volte, perche' un numero non ripetuto non e' un numero;
     3. il verdetto non guarda solo la differenza fra i colori: la confronta con la DISPERSIONE DELLO
        STESSO COLORE. Se il rumore e' piu' grande dello scarto, il verdetto e' «non separati» — che
        significa «non lo so», e va detto invece di scegliere il numero che fa comodo.

   USO:
     const R = await paragone({ giri: 2, rosso: '__CPM_NO555',
       misura: async (rossoOn) => { ...apre, misura, chiude...; return {campo: valore, ...}; } });
     stampaParagone('scene offensive', R, { campo: {basso:true, nome:'1º compagno (m)'} });                */

export async function paragone({ misura, giri = 2, rosso = null }) {
  const out = { rosso: [], verde: [], nomeRosso: rosso };
  for (let g = 0; g < giri; g++) {
    /* alternati: se la macchina rallenta a meta' passata, rallenta per ENTRAMBI i colori */
    out.rosso.push(await misura(true));
    out.verde.push(await misura(false));
  }
  return out;
}

const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };

export function stampaParagone(titolo, R, campi) {
  console.log(`\n=== PARAGONE — ${titolo} ===`);
  console.log(`   ${R.rosso.length} giri per colore, alternati nello stesso processo${R.nomeRosso ? ` · rosso = ${R.nomeRosso}` : ''}\n`);
  const righe = [];
  for (const [k, cfg] of Object.entries(campi)) {
    const r = R.rosso.map(x => +x[k]).filter(Number.isFinite);
    const v = R.verde.map(x => +x[k]).filter(Number.isFinite);
    if (!r.length || !v.length) { console.log(`  ${(cfg.nome || k).padEnd(34)} campioni insufficienti`); continue; }
    const mr = med(r), mv = med(v);
    /* il rumore e' la dispersione DENTRO un colore: max-min sul colore piu' ballerino */
    const rumore = Math.max(Math.max(...r) - Math.min(...r), Math.max(...v) - Math.min(...v));
    const scarto = mv - mr;
    const meglio = cfg.basso ? scarto < 0 : scarto > 0;
    const separati = Math.abs(scarto) > rumore;
    const verdetto = !separati ? '⚖️  NON SEPARATI (il rumore e\' piu\' grande dello scarto)'
      : meglio ? '✅ MIGLIORA' : '❌ PEGGIORA';
    console.log(`  ${(cfg.nome || k).padEnd(34)} rosso ${String(mr.toFixed(2)).padStart(8)}  →  verde ${String(mv.toFixed(2)).padStart(8)}   [rumore ${rumore.toFixed(2)}]  ${verdetto}`);
    righe.push({ k, mr, mv, separati, meglio });
  }
  const decisi = righe.filter(x => x.separati);
  const peggio = decisi.filter(x => !x.meglio);
  console.log('');
  if (!decisi.length) console.log('  >> NESSUN CAMPO SEPARATO DAL RUMORE: questa misura non decide niente. Servono piu\' giri o una sonda meno ballerina.');
  else if (peggio.length) console.log(`  >> ${peggio.length} campo/i PEGGIORANO oltre il rumore: si disfa, non si costruisce sopra.`);
  else console.log(`  >> ${decisi.length} campo/i migliorano oltre il rumore, nessuno peggiora.`);
  return { decisi, peggio };
}
