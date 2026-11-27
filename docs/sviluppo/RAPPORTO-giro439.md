# Rapporto giro 439 — PO-638 «la barriera c'è nel flusso vero?»

Ramo `sviluppo/giro439-barriera-vera`, base `main` (7.999.218, giri 375 e 418 già dentro). Solo strumenti di prova:
nessun tocco a `src/`, a `GAME_VERSION`, a `SAVE_VERSION` o a `docs/governo`. Licenze invariate.

## 1. Domanda

Il giro 343, al dubbio 4, ha portato alla scelta PO «Tutte le consigliate»: serve una sonda su **partite vere**, del tipo di
`sonda-rigore-139`, che trovi le punizioni dell'eroe e misuri la barriera all'apertura della scena. I guardiani esistenti
(`barriera-73`, `barriera-375`) **forzano** le scene (`__CPM_FORCE_SIT`), quindi non confermavano il flusso vero.

## 2. Strumento: `tests/visual/sonda-barriera-439.mjs`

- Le partite sono di carriera, dal salvataggio `fixtures/save-190-s12-ovr93.json`, con autoplay seedato. Il **nome** del
  giocatore cambia a ogni partita, perché il seme di partita nasce da avversario + stagione + settimana + nome. Corpi accesi
  (`__CPM_GLB`), teatro acceso (`__CPM_PRESENT` + `__CPM_CINE`), `__CPM_REC`.
- Nelle fasi di lettura (`hl_intro`/`hl_move`/`hl_choose`) prende un campione ogni ~120 ms, con una sola lettura della
  pagina. Usa `__CPM_PUN343` (pallone e corpi della barriera), `__CPM_MUR72` (bersagli) e `__CPM_STATE` (tutte le mesh), tutte
  dalle stesse mesh, con 1 u = 1 m.
- Per ogni campione misura: uomini in barriera, distanza del centro dal pallone (9,15 m), scarto del centro dalla linea
  pallone → centro porta (48,6 · 0), uomo di barriera più vicino (≥ 9 m) e avversario di movimento più vicino **fuori** dalla
  barriera (≥ 10,15 m).
- Censisce anche ogni scena di lettura il cui testo contiene «punizione». Se una di queste non ha il testimone, è una
  punizione senza barriera (per esempio una scena di tipo diverso da `freekick`), e viene dichiarata.

### Difetti dello strumento trovati e corretti durante la misura (No Blind Fix)

1. **Voce vecchia.** La riga di `__CPM_PUN343` resta scritta dopo la fine della scena. Al primo giro, 60 campioni di scene
   successive sono stati attribuiti alla punizione (un «avversario a 1,63 m» falso). Ora la sonda **consuma** la voce: se il
   3D non la riscrive entro la lettura successiva, il campione non vale.
2. **Fotogramma di passaggio.** Al cambio di scena il testimone porta ancora per un fotogramma la chiave della punizione
   (avversario a 5,96–7,37 m, ma di un'altra scena). La sonda tiene solo i campioni il cui testo di scena
   (`__CPM_SITCTX`) è quello della punizione. È successo su 1 campione ogni 15–19.
3. **Primo fotogramma senza uomini (`n=0`).** Nel ciclo di `src/12` il testimone gira **prima** della passata che scrive
   `_w72` per la scena nuova. I corpi però sono già sul punto: riconosciuti dalla sola geometria, sono 4 a 9,15 m, a 0,01 m
   dalla linea. Su quel campione la sonda usa la barriera riconosciuta dai corpi (8,5–9,8 m dal pallone, entro 3 m dalla
   linea) e lo **dichiara** nel conto («N dai soli corpi»).

## 3. Misura (flusso vero, corpi accesi)

| Corsa | Partite | Punizioni dell'eroe | Esito |
|---|---|---|---|
| s2 (b439-0..5, partite intere) | 6 | 3 (8', 51', 80') | barriera corretta dal secondo campione; il primo era il fotogramma del punto 3, l'ultimo la scena successiva (punto 2) |
| s3 (nomi b439-0/1/3, fermata alla punizione) | 3 | 2 (8', 51') | tutte corrette; b439-3 questa volta **non** ha dato la punizione dell'80' |
| s4 (c439-0..5, partite intere) | 6 | 4 (4', 6', 25', 82') | tutte corrette |
| guardiano, verde | 5 | 5 | tutte corrette |
| guardiano, rosso | 3 | 3 | tutte storte |

In ogni punizione giudicata e in ogni campione:
- **4 uomini in barriera**;
- **centro a 9,15 m**;
- **scarto dalla linea 0,00–0,01 m**;
- uomo di barriera più vicino a 9,13–9,16 m;
- **avversari fuori barriera a 11,0–13,4 m** (≥ 10,15 m);
- nessuna scena «punizione» senza testimone.

**Conclusione: nel flusso vero la barriera c'è sempre ed è giusta.** Il motore non va corretto, quindi l'interruttore
`__CPM_NO_G439` previsto dal compito non è stato creato: senza una correzione non avrebbe niente da spegnere.

## 4. Guardiano `npm run barriera-vera-439`

- **Verde.** Cinque partite vere (b439-0, c439-5, c439-0, c439-3, b439-1), ognuna chiusa appena la sua prima punizione
  dell'eroe è stata letta. Servono almeno 3 punizioni giudicate, ogni campione dentro le soglie del giro 375 (≥ 3 uomini,
  9,15 ± 0,3 m, scarto ≤ 0,5 m, nessuno sotto 9 m) e del giro 418 (fuori barriera ≥ 10,15 m), e nessuna punizione senza
  testimone.
- **Rosso.** `__CPM_NO_G375` + `__CPM_NO_G418`, cioè lo schieramento di prima, sulle stesse tre partite dei primi minuti.
  Servono almeno 2 punizioni giudicate e devono essere **tutte** storte. Misurato: 3/3 storte, con centro a 7,4–7,9 m, fino a
  4,3 m fuori linea e avversari a 7,4–7,8 m.
- Le soglie sono quelle dei guardiani 375 e 418, senza abbassamenti. Una partita senza punizione viene dichiarata; meno di
  3 punizioni giudicate equivale a «non giudicato», cioè rosso.
- Durata misurata: circa 10 minuti (verde 5 partite, rosso 3, tre in parallelo).
- Il guardiano è nella riga MAPPA che contiene già `barriera-73` e `barriera-375` (`ci-runner.mjs`, riga `src/12-|src/13-`).
  Esito del giro: 19/19 verdi (sezione 6).

## 5. Dubbi per il PO

**D1 — Il rosso: interruttore nuovo o schieramento di prima?** Il compito chiedeva `__CPM_NO_G439` *se* si fosse corretto
qualcosa. Non c'era niente da correggere.
1. **(consigliata, applicata)** Rosso = `__CPM_NO_G375` + `__CPM_NO_G418`, cioè la barriera com'era prima dei due giri. Prova
   che il guardiano vede una barriera storta nel flusso vero, senza aggiungere al gioco un interruttore che non spegne niente.
2. Aggiungere a `src/12` un `__CPM_NO_G439` che toglie la barriera (doppione del 375). Costa una build e un bump senza
   cambiare il gioco.
3. Nessun braccio rosso, solo la misura verde. Sconsigliata: un guardiano senza rosso non dimostra di vedere.

**D2 — Il testimone `__CPM_PUN343` sul primo fotogramma.** Gira prima della passata che scrive la barriera della scena nuova,
quindi sul primo fotogramma dice «0 in barriera» anche quando i corpi sono già a posto.
1. **(consigliata, applicata)** Lasciare il gioco com'è: sul primo fotogramma la sonda riconosce la barriera dai corpi e lo
   dichiara nel conto. Non tocca `src/`.
2. Spostare la scrittura del testimone dopo la passata dei bersagli, in `src/12`. Il testimone diventa giusto da subito, ma
   serve un giro sul motore con la catena completa.
3. Scartare il primo campione di ogni scena. Sconsigliata: proprio «all'apertura» è il momento che il PO ha chiesto di
   misurare.

**D3 — Il seme di partita non è identico fra due esecuzioni.** b439-3 ha dato una punizione all'80' in una corsa e nessuna in
quella dopo: dallo stesso nome non è venuta la stessa partita. La causa non l'ho cercata; **non posso confermare** se sia il
pilota automatico (a orologio di parete) o il gioco.
1. **(consigliata, applicata)** Il guardiano usa cinque nomi con la punizione presto (4'–51') e ne pretende tre, così regge
   anche se un nome «perde» la sua punizione.
2. Aprire un giro di misura sul determinismo della partita vera con autoplay (stesso nome, N esecuzioni, impronta degli
   eventi).
3. Provocare la punizione dalla sonda, come `CPM_PROVOCA` del 139. Sconsigliata qui: la domanda era proprio il flusso
   **non** provocato.

**D4 — Frequenza.** Sono uscite 7 punizioni dell'eroe in 13 partite vere intere (circa 1 ogni 2). Se il PO le vuole più (o
meno) frequenti, è un tema di motore e di carriera, fuori da questo giro.

## 6. Rituale del giro

- `node ci-runner.mjs giro barriera-vera-439 barriera-73` su 7.999.218: **19/19 verdi**. `barriera-vera-439` ha impiegato 499 s,
  `barriera-73` 65 s; tutte e 17 le sentinelle verdi, fra cui `partita-vera` (630 s), `career-critical`, `save-compat`,
  `replay` e `web-237`. Nessun passo è stato riprovato.
- Nessun bump di `GAME_VERSION`: il rilascio automatico del vagone è acceso, il giro non lo tocca.
