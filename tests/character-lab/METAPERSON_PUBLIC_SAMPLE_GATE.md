# Gate campioni pubblici MetaPerson

## Provenienza e perimetro

- Sorgente: repository ufficiale `avatarsdk/metaperson-unity-rendering-sample`.
- La radice del repository dichiara licenza BSD-3-Clause e include cinque FBX con materiali configurati.
- Questo audit usa solo i tre campioni maschili (`model1`, `model3`, `model5`) in una directory di prova non inclusa in Git.
- I file non entrano nel renderer Korward, non vengono pubblicati e non sostituiscono il modello CGTrader in questa fase.
- Qualunque eventuale integrazione richiede una verifica finale della licenza applicabile agli asset del repository e un nuovo audit di kit, rig, gesti e telefono.

## Evidenza tecnica verificata

| Campione | Triangoli totali | Vertici | Mesh | Ossa | Shape key | Osservazione |
|---|---:|---:|---:|---:|---:|---|
| `model1` | 59.831 | 34.594 | 12 | 73 | 129 | Volto maschile giovane, capelli corti nativi. |
| `model3` | 60.193 | 35.387 | 13 | 73 | 129 | Volto maschile chiaro, barba corta nativa. |
| `model5` | 68.758 | 46.222 | 13 | 73 | 129 | Volto maschile adulto, capelli separati e barba corta nativa. |

Tutti e tre sono stati importati senza eccezioni in Blender 4.5.14. La gerarchia contiene anche dita, occhi e dita dei piedi; i 129 shape key sono distribuiti tra testa (67), ciglia (42) e denti inferiori (20). Il modello 5 ha una mesh `haircut` separata da 17.249 triangoli: è una vera risorsa capelli e non un disegno sulla texture del volto.

## Valutazione provvisoria

**Passano** il pre-screening su volti adulti e distinti, capelli/barba visibili e separazione di testa, corpo, capelli e outfit. Questa separazione risolve il limite dell'atlante unico del CGTrader per futuri colori e dettagli.

**Non passano ancora** il gate Korward: 60–69 mila triangoli sono troppi per una squadra completa su mobile, gli abiti civili/logati non sono un kit da calcio, e non sono stati ancora verificati retarget del dribbling, contatto palla, transizioni o prestazioni sul telefono.

## Compatibilità con le clip già disponibili

Il confronto diretto del rig di `model5` con il source locale delle clip Mixamo ha trovato **65 nomi anatomici condivisi su 65**. Tutte le 22 ossa core richieste dal gesto — anche braccia, avambracci, mani, gambe, piedi e punte — sono presenti nel modello MetaPerson. Le otto ossa aggiuntive sono dettagli di collo, occhi e avambracci.

Questo prova che una mappatura nominale completa è disponibile; non prova ancora la qualità del movimento. Il prossimo test deve applicare una clip al rig MetaPerson e misurare posa, braccia, piedi e palla nei fotogrammi di contatto.

## Primo provino dribbling: metodo rifiutato

È stato applicato in un banco separato il dribbling locale `regular-anim-dribble.glb` a 62 ossa corrispondenti di `model5`, con sole rotazioni locali e senza spostamento radice. L'import e la mappatura non hanno sollevato eccezioni, ma i fotogrammi 0, 10, 21, 32 e 41 mostrano una deformazione grave di busto e gambe: il personaggio ruota di profilo e la parte inferiore collassa in una superficie piatta.

**FAIL del metodo di trasferimento diretto.** I due rig hanno la stessa semantica ma assi/rest pose diversi; il risultato non è una preview del dribbling e non viene promosso. Il candidato MetaPerson non è ancora rifiutato: il prossimo metodo deve usare un trasferimento calibrato nello spazio bind, come già richiesto per i rig eterogenei, prima di qualsiasi verifica palla o kit.

## Passo successivo

Usare solo `model5` come prova tecnica: rimuovere visivamente l'abbigliamento civile nel banco locale, verificare mappatura delle 73 ossa verso una clip esistente e misurare un LOD separato. Il candidato potrà avanzare solo se conserva volto e capelli leggibili, raggiunge un budget misurato e supera il gesto con palla.
