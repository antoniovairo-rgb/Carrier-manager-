# Rapporto giro 132 — PO-332 «braccia a T e compagni girati» nella premiazione

Ramo `sviluppo/giro132-premiazione` (da `lavoro/187`, c27e506). `GAME_VERSION` non toccata. Nessun campo nuovo nel salvataggio.

## Difetto (foto del PO sulla 7.999.186)
Finale di Coppa delle Nazioni vinta, fase «PREMIAZIONE · TRIONFO!»: l'eroe sul podio col trofeo sopra la testa ma le braccia
orizzontali; i compagni dietro mostrano la schiena alla camera e al podio; il capitano davanti al podio guarda la camera.

## Misura (testimone nuovo `__CPM_G132`, solo sotto test, corpi 3D accesi)
Per l'eroe: quota delle mani vere rispetto all'osso della testa e ai piedi. Per ogni compagno: angolo fra il davanti delle spalle
del corpo 3D e la direzione del podio (verificato sull'eroe, che guarda la camera a 1-3°).

| | prima (`__CPM_NO_G132`) | dopo |
|---|---|---|
| compagni, corpo CGTrader (Nazionale / Coppa / campionato) | max 152° / 155° / 153° (sei su otto fra 41° e 102°, capitano 149-155°) | max 21° in tutte e tre |
| clip d'alzata dell'eroe, CGTrader | `mx-victory-jump` congelata al 45% | `mx-victory` (il punto 45% del 7.999.118 era tarato su questa) |
| mani dell'eroe sulla testa, CGTrader | +0,46 m | +0,43 m |
| mani dell'eroe sulla testa, corpo «regular» (`throwin`) | da −0,42 a −0,68 m (sotto la testa) | +0,28 / +0,31 m |
| compagni, corpo «regular» | max 105-113° | max 11° |

### Cause misurate
1. **Compagni**: la rotazione verso la camera era scritta sul modello *procedurale*, nascosto sotto il corpo 3D. Il corpo 3D gira
   solo col movimento e le file sono ferme: ognuno restava col verso dell'ultimo passo. Ora il corpo 3D di ogni compagno guarda il
   centro del podio; il capitano lo guarda durante `lift` e `fest`.
2. **Clip dell'alzata (CGTrader)**: nella premiazione completa il sorteggio escludeva `mx-victory` (riservata alla festa leggera,
   7.999.61) e montava `mx-victory-jump`. Ora con il trofeo l'eroe usa sempre `mx-victory`, come il capitano.
3. **Posa a T**: in headless, sul corpo CGTrader, **non sono riuscito a riprodurla**. Ho misurato e scartato tre ipotesi:
   scelta della clip (anche il braccio rosso ha mani +0,46 m), corpo CGTrader che arriva in ritardo (25 s di ritardo, nessun fotogramma
   con le mani sotto la testa nell'alzata), CPU rallentata 4x con la cerimonia in tempo reale (715 fotogrammi di alzata, 0 sotto la testa).
   La posa si riproduce invece sul corpo «regular» (senza pacchetto Mixamo: alzata = `throwin`, mani 0,4-0,7 m sotto la testa).
   Rimedio: **rete dell'alzata** — durante l'alzata col trofeo, dopo il mixer, se le mani dell'eroe sono sotto la testa (+0,15 m) le
   braccia si puntano in alto (stesso metodo delle braccia procedurali del 7.999.31, strette e senza pugni ritmati). Copre ogni caso
   in cui la clip manca o non attecchisce, qualunque sia la causa sul telefono. ⚠️ Non dichiaro chiusa la causa del telefono: va
   confermata dal collaudo sul dispositivo.

Interruttore rosso: `__CPM_NO_G132` (tutte e tre le correzioni insieme = com'è oggi).

## Guardiano nuovo: `npm run premiazione-132`
Corpo CGTrader: Nazionale + Coppa + campionato. Corpo «regular»: Nazionale (banco della rete). Soglie fissate dopo la misura:
mani ≥ 0,15 m sopra la testa, ogni compagno ≤ 35° dal podio. Campione mancante = non giudicato = rosso. Verde e rosso stampati per ultimi.
Esito: ✅ verde, e il rosso cade su entrambi i corpi (~7,5 min).

## Catena (un controllo alla volta, GLB acceso dove serve)
| controllo | esito |
|---|---|
| premiazione-132 | ✅ verde, rosso cade |
| scena3d-96 (tel · pc · tabv · tabo, un formato per chiamata) | ✅ 16/16 · 9/9 · 3/3 · 3/3 |
| validate-situations | ✅ PASS 14/14, fingerprint 00001505, 0 failure |
| career-critical | ✅ |
| test:logic | ✅ |
| save-compat | ✅ 12 pass · 0 fail |
| posa-sollevamento-191 | ✅ |
| premiazione-palco-191 | ✅ |
| festa-57 | ❌ «il rosso non riproduce il congelamento» — **pre-esistente**: identico sul commit di partenza c27e506 (worktree pulito). La festa leggera non passa dalle correzioni di questo giro. Non riparato (fuori ambito). |

## Foto (GLB acceso, Nazionale, a metà alzata) — `docs/sviluppo/foto-giro132/`
`prima-int-alzata-360x800.png` · `dopo-int-alzata-360x800.png` · `prima-int-alzata-1440x900.png` · `dopo-int-alzata-1440x900.png`.
Sono foto del corpo CGTrader in headless: lì il «prima» ha già le braccia alzate (vedi causa 3); la differenza visibile è nei compagni.

## Domande aperte per il PO
1. **Capitano**: ora durante l'alzata guarda il podio e quindi, stando davanti al palco, mostra la schiena (n° 2) alla camera. Preferisce
   che guardi il podio (com'è ora) o la camera (com'era, 150° dal podio)?
2. **Posa a T sul telefono**: sul banco non si riproduce col corpo CGTrader. Serve il collaudo sul dispositivo per confermare che la rete
   la copre. Se ricapitasse, utile una nota del taccuino durante la premiazione (indica clip e corpo in uso).
3. festa-57 è rosso da prima di questo giro: va aperto un giro dedicato?
