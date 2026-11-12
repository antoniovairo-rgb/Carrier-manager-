# Rapporto giro 174 — controlli rossi o ciechi preesistenti nella catena grafica e parata-100 (PO-371)

Ramo `sviluppo/giro174-rossi-grafica`, partito da `lavoro/191` (13fa539). Versione nel codice invariata (7.999.190, `GAME_VERSION` non toccata).
Sessione figlia: nessuna decisione di prodotto presa qui; i dubbi sono in fondo, come domande per la sessione madre.

## Tabella

| Controllo | Prima (misurato su questo ramo, prima delle modifiche) | Causa | Dopo |
|---|---|---|---|
| `spazio-296` | verde ❌: «tel menu-home / opzioni: 16,8 div «Crea il tuo calciatore»» | **gioco** — margine sotto della carta (7) + margine sopra del pulsante «Crediti» (8) | verde ✅ (7,8 px) · rosso 296 ✅ · **rosso 174** `__CPM_NO_G174_SPAZIO` ✅ (torna 16,8) |
| `calendario-offerte-195` | verde ❌ e rosso ❌: «opzioni: false» in entrambi (il rosso con 0 caselle era giusto) | **strumento** — l'«Impulso della settimana» (scelta obbligatoria dal 7.35) blocca la chiusura della stagione e la sonda non lo rispondeva | verde ✅ (34 caselle, 4 leghe) · rosso ✅ (0 caselle, 0 leghe) |
| `palco-corpi-191` | verde «dentro 0», rosso «dentro 0» (rosso cieco) | **strumento** — oggi nessun corpo capita dove compare il palco: la condizione non si produce più da sola | verde ✅ dentro 0 · rosso ✅ dentro 236 (con la condizione provocata) |
| `figurine-208` | «carte 0» in entrambi i bracci | **strumento** — la home V2 non mostra più la carta dell'eroe | verde ✅ 4/4 grigie (Club 3 + Agente 1) · rosso ✅ 0/4 grigie |
| `piede-cross-p1b2` | rosso ❌ 1,56 / 1,65 (soglia ≥ 2,5) | **strumento** — misurava il minimo su tutto il gesto: la rincorsa porta l'eroe accanto al pallone prima del calcio | verde ✅ 0,41 / 0,65 · rosso ✅ 2,89 / 2,83 (misura all'istante del lancio) |
| `doppio-gesto-148` | verde ❌: «assist» e «generico» (gi18) con la finta nella sequenza ma senza cambio di direzione | **gioco** — la guardia «un gesto per azione» (7.396) contava l'avvicinamento della scelta come gesto dell'azione scelta | verde ✅ · rosso 148 ✅ · **rosso 174** `__CPM_NO_G174_DOPPIO` ✅ |
| `testa-146` | rosso ❌ 2,41 / 2,45 / 1,25 (soglia ≥ 2,5) | **strumento** — senza il 146 il difetto oggi ha un'altra forma (l'eroe arriva sul pallone e lo supera nel caricamento) e oscilla attorno alla soglia | gioco ✅ · rete ✅ · provocato ✅ 0,63-0,74 · rosso ✅ 3,15-4,17 · rosso naturale stampato (2,42 / 2,42 / 1,20) |
| `home-066` | ❌ «7 fuori standard», tutti «F1 fondo sfumato» sul riquadro della prossima partita | **strumento** — l'esenzione F1 del riquadro nel colore del club copriva «fondo non neutro» ma non «fondo sfumato» (sfumatura del giro 106 B) | verde ✅ 0 su 132 · rosso ✅ 17 su 132 |
| `festa-3d` | partita persa 0–2, niente festa, non giudicato | **strumento** — il nome «Festa2» genera una sconfitta; dietro c'erano altri due criteri superati dal gioco (cori PO-291, squadre fisse PO-297) | verde ✅ (2–1, coro a schermo) · rosso 47 ✅ · rosso 48 ✅ |
| `parata-100` | 0 parate sul ramo `cross_goal` in verde e rosso → non giudicato | **strumento** — le partite vere non producono il caso; con l'esito forzato il ramo è spento per costruzione | verde ✅ (2 provocate a 2,0-2,1 dal portiere + 6 parate vere, 0 difetti) · rosso ✅ (provocata gi42 a 17,9) |

Nessuna soglia abbassata, nessun guardiano ritirato. Due difetti del **gioco** corretti, otto **strumenti** riscritti. Tre di questi
(palco, testa, parata) ora **provocano** la condizione con un gancio di collaudo che esiste solo sotto `?cpmtest=1`.

## Dettaglio, controllo per controllo

### 1. `spazio-296` — difetto del gioco
- **Misura** (`CPM_MISURA=1`, telefono): sul menu e nelle Opzioni la coppia «Crea il tuo calciatore» → «Crediti» è a 16,8 px
  (margine sotto della carta 7 + margine sopra del contenitore del pulsante `SP.sm` 8, allo zoom 1,12). Tutte le altre coppie del menu
  sono a 7,8.
- **Correzione** (`src/17-menu-creazione-pannelli.jsx`): il contenitore del pulsante «Crediti» non ha più margine sopra. Ogni riquadro che
  può precederlo (benvenuto, salvataggi, carta di sovrascrittura, suggerimento dei tasti) ha già il suo margine sotto. Rosso
  `__CPM_NO_G174_SPAZIO` (torna `SP.sm`).
- **Guardiano**: `npm run spazio-296` ora gira tre bracci: verde, rosso 296 (invariato), e `CPM_PROVA_ROSSO=174` (solo telefono, senza
  post-partita) che pretende di nuovo «tel menu-home: … oltre 10».
- **Foto**: `docs/sviluppo/giro174/spazio296-menu-prima.png`, `spazio296-menu-dopo.png`.
- **Nota**: alla prima prova verde (prima della correzione) è comparso anche «pc post-partita (niente fischio)», che non si è ripetuto
  nelle prove successive: è un'attesa a parete (84 × 5 s) su una partita in autoplay che su PC può sforare. Lo segnalo, non l'ho toccato.

### 2. `calendario-offerte-195` — strumento
- **Prima**: verde `{"caselle":34,"opzioni":false,"leghe":[]}`, rosso `{"caselle":0,"opzioni":false,"leghe":[]}`. Il rosso a 0 caselle è
  il comportamento atteso, non la cecità: a fallire era l'arrivo alle offerte in **entrambi** i bracci.
- **Causa**: foto alla fine del ciclo → home con l'«Impulso della settimana» aperto (`data-cpm="settimana23"`). Dal 7.35 ogni
  settimana vissuta estrae un impulso con scelta obbligatoria; la sonda rispondeva solo a bottoni con testi fissi.
- **Criterio vecchio → nuovo**: identico. Cambia solo la navigazione: se il riquadro dell'impulso è aperto si sceglie la sua ultima voce.
  Non è più permissivo: le condizioni (34 caselle, «ALT · t», ≥ 3 leghe con «Lega B · prima squadra» e «giovanili»; rosso 0 e 0) sono
  le stesse.

### 3. `palco-corpi-191` — strumento (condizione provocata)
- **Prima**: verde 127 campioni dentro 0, rosso 131 campioni dentro 0. Il palco sta al centro (0,0,0) e oggi nessun compagno o
  avversario si trova lì quando la cerimonia comincia: il difetto che la spinta del 191 ripara non si produce più da solo.
- **Nuovo**: gancio di collaudo `__CPM_PALCO174_INTRUSO` (`src/12`, solo sotto `?cpmtest=1`): a ogni fotogramma un compagno e un
  avversario (mai l'eroe) vengono messi dentro l'impronta del corpo del palco, **prima** della spinta. Verde (spinta attiva) → 0 dentro;
  rosso (`__CPM_NO_PALCO191B`) → 236 dentro (2 corpi × 118 campioni). Soglie invariate (0 e ≥ 10). Più severo di prima: il verde
  ora deve espellere un corpo che gli viene rimesso dentro a ogni fotogramma, prima doveva solo non trovarne.

### 4. `figurine-208` — strumento
- **Prima**: «carte 0» in entrambi i bracci. La home V2 (testata compatta, decisione PO 02/11) non ha più la carta dell'eroe.
- **Misura**: figurine per scheda — Club 3 (giocatori), Agente 1 (procuratore), le altre 0.
- **Criterio vecchio**: la **prima** carta della home grigia (verde) / non grigia (rosso). **Nuovo**: tutte le carte di Club e Agente;
  verde = tutte grigie (servono almeno una carta in ciascuna scheda), rosso = nessuna grigia. Più severo: la regola PO-208 vale per
  ogni carta, e il procuratore è esattamente il caso nato dal collaudo («carta del procuratore con la cornice rossa»).
- La parte PO-213 (17 voci di statistica / 2 col rosso) è invariata.

### 5. `piede-cross-p1b2` — strumento
- **Prima**: verde 0,42 / 0,48, rosso 1,56 / 1,65 (soglia rosso ≥ 2,5).
- **Misura** (traccia per fotogramma di gi16): nel rosso il piede passa a 1,6-1,7 dal pallone durante la rincorsa (l'eroe gli corre
  accanto), ma quando l'arco parte (`ballArcT` 0) il pallone è a 2,8-3,1. Nel verde all'istante del lancio è a 0,32.
- **Criterio vecchio**: minimo della distanza su **tutto** il gesto. **Nuovo**: minimo su tre fotogrammi attorno al lancio (l'ultimo
  prima che l'arco parta e i primi due dopo). Soglie invariate (≤ 0,8 e ≥ 2,5). Più severo per il verde: il pallone deve essere al
  piede quando parte il cross, prima bastava sfiorarlo in un istante qualunque.

### 6. `doppio-gesto-148` — difetto del gioco
- **Prima**: verde ❌ su «assist» (gi18 «Sterzata e assist») e «generico» (gi18 «Dribbling netto e assist»): tratto `feint` presente,
  clip del cambio di direzione mai suonata (solo `dribble` e `pass`).
- **Misura** (`__CPM_GST` campionato ogni 60 ms in `hl_result`): nel tratto di finta la catena dei gesti **vuole** `change`, ma il gesto
  montato resta vuoto. Il testimone `__CPM_DOPPIO148` conferma che la finta è armata (`pre: dribble_outside`).
- **Causa**: la guardia del 7.396 («un'azione ha un gesto solo») usa la chiave `actType|scena`. Sulle scene con intento dribbling
  l'avvicinamento dei 23/09 (clip `dribble` in `hl_move`/`hl_choose`, actType vuoto) spende quella chiave; la finta dell'azione scelta
  (`hl_result`, actType ancora vuoto) ha la stessa chiave e viene scartata. Su gi94 (cross) l'avvicinamento non c'è e la finta si vede.
- **Correzione** (`src/12-three-match-view.jsx`): la chiave aggiunge `|esito` in `hl_result`. L'azione scelta comincia alla
  risoluzione. Rosso `__CPM_NO_G174_DOPPIO`. Dopo: sequenza dei gesti `dribble → change → pass`.
- **Guardiano**: terzo braccio `rosso174` in `doppio-gesto-148.mjs`: con l'interruttore, «assist» e «generico» devono avere la finta
  in sequenza **e** nessun cambio di direzione (il difetto misurato).

### 7. `testa-146` — strumento (condizione provocata)
- **Prima**: gioco ✅, rete ✅, rosso ❌ 2,41 / 2,45 / 1,25. Identico sul commit più vecchio disponibile nella storia del clone
  (c861406, 07/11: 2,46 / 2,44 / 1,21), quindi non ho potuto trovare per bisezione la modifica che l'ha cambiato.
- **Misura** (testimone `__CPM_P1B2`, colonna testa, rosso): il pallone arriva alla testa (0,24-0,5) **prima** che l'arco del colpo si
  armi; nei 0,22 s di caricamento l'eroe lo supera e al lancio la distanza è 2,4-2,6. Il difetto c'è ancora ma è di forma diversa da
  quello descritto al 7.999.144 («l'arco parte dal punto di consegna, 3 u prima della testa») e la sua ampiezza oscilla attorno alla
  soglia. Ho provato a spegnere anche `__CPM_NO_G121H` e `__CPM_NO_AER252`: nessuno dei due riporta il difetto pieno in modo stabile.
- **Nuovo**: gancio `__CPM_TESTA174_LONTANO` (`src/12`, solo `?cpmtest=1`): al primo fotogramma del caricamento il pallone viene messo
  3 u prima della testa, alla quota della testa — il difetto originale. Bracci: gioco e rete invariati; **provocato** (gancio, 76 spento)
  → tutte ≤ 1,0; **rosso** (gancio, 76 e 146 spenti) → almeno 2 su 3 ≥ 2,5; il vecchio rosso naturale resta stampato, non giudicato.
  Soglie invariate. Il braccio provocato in più dimostra che il 146 ripara il difetto pieno, non solo quello attenuato.

### 8. `home-066` — strumento
- **Prima**: 127-132 riquadri, 7 fuori standard, tutti «F1 fondo sfumato» sul riquadro `prossima-v2`, uno per situazione.
- **Causa**: la sonda esenta dichiaratamente quel riquadro dalla regola F1 «card neutra» (colore del club per scelta PO, tavola V2Home),
  ma l'esenzione copriva solo la riga «fondo non neutro». La sfumatura verso la notte è arrivata dopo, col giro 106 B
  (`fondoClub106`, rosso `__CPM_NO_G106B`).
- **Criterio nuovo**: l'esenzione F1 vale per tutta la regola, solo su `[data-cpm="prossima-v2"]`. Per ogni altro riquadro F1 è
  identica. Il rosso `CPM_ROSSO=1` cade con 17 riquadri fuori standard.

### 9. `festa-3d` — strumento
- **Prima**: «Festa2» con autoplay 4545 perde 0–2 → niente festa (direttiva PO 23/09) → non giudicato.
- **Seme**: il seme di partita nasce dal **nome** (7.496). Misurati quattro nomi: Festa2 0–2, Festa3 2–1, Festa4 1–0, Festa5 3–2.
  Scelto «Festa3» (vittoria vera). Ho scartato la vittoria forzata dal gancio perché avrebbe messo la festa su un tabellone 0–2.
- **Due criteri superati dal gioco**, emersi appena la festa è comparsa:
  1. **coro**: la sonda voleva «COGNOME!» a schermo. Dal 7.999.177 (PO-291) i cori escono da un repertorio di varianti, non tutte con
     quella forma. Nuovo criterio: un coro registrato (`__CPM_CORO48`) che contiene il cognome **e** che è a schermo.
  2. **`--rosso48`**: dal giro 92 (PO-297, squadre fisse come in TV) la barra non si specchia più, quindi il tabellone specchiato che il
     7.999.48 correggeva esiste solo spegnendo anche il 297. Il braccio ora accende anche `__CPM_NO_FISSE297` → scudo di casa a x 257.

### 10. `parata-100` — strumento (condizione provocata)
- **Prima** (giro 166 e questo ramo): verde 8 parate, tutte sul tiro del compagno, 0 sul ramo `cross_goal` → «non giudicato»; rosso 1
  parata, difetto non visto. 9.115 s a prova (copertura insufficiente → due rigiochi).
- **Causa**: dal giro 102 il ramo `cross_goal` finisce sul portiere solo col tiro sprecato del compagno scritto dal motore
  (`outcome.mate298` → `hlSpreca102`). Con l'esito forzato dalle sonde è spento per costruzione (`!_forz298`); nelle partite vere è raro.
- **Nuovo**: gancio `__CPM_SPRECA174='saved'` (`src/15`, solo `?cpmtest=1`): su un'azione fallita forzata scrive il tiro parato del
  compagno come lo scriverebbe il motore. Due scene provocate (gi16, gi42; opzione di cross; pagina nuova per scena) entrano nel
  giudizio accanto alle partite vere, che restano tutte (il pavimento delle 3 parate sul tiro del compagno lo danno ancora loro).
  Verde: `cross_goal>assist_shot` a 2,0-2,1 dal portiere; rosso (`__CPM_NO_G100D3`): `cross_goal>deflect` a 4,8 (gi16) e 17,9 (gi42).
  Una scena provocata che non arriva al riquadro di parata è «non giudicata» = rossa. Soglia 6 invariata.

