# Rapporto giro 299 — C e VC nella Rosa, angoli dei riquadri, audio nella serata (PO-563 · PO-564 · PO-567)

Versione di riferimento 7.999.198 (blocco 2), `GAME_VERSION` non toccata. Ramo `sviluppo/giro299-rosa-angoli`.
Lavoro in due sessioni: la prima (interrotta dal limite d'uso) ha scritto codice e sonda (commit `2757ada`); la seconda ha fatto
censimento, registrazione del guardiano, controlli e questo rapporto. Non è una release: nessuna promozione su `main`, nessuna riga
di roadmap.

## In breve

- **PO-563** — nella Rosa (Club › Rosa) il capitano ha la «C» e il vice la «VC», stesso pallino della «R» del rigorista, accanto al ruolo.
- **PO-564** — regola unica degli angoli dei riquadri (`RAGGI299`, src/11): censimento di 24 schermate × 3 taglie,
  `docs/sviluppo/giro299/CENSIMENTO-ANGOLI.md`. Difetti 20 / 26 / 26 per taglia → 0 / 0 / 0.
- **PO-567** — tasto audio nella serata di presentazione: apre lo stesso pannello della partita, stesso salvataggio (`cpm-audio`).
- **Guardiano** `npm run rosa-angoli-299` (rosso `__CPM_NO_G299`): verde 22/22, il rosso cade su A, B e C, 0 non giudicati.
- **Home di carriera: non toccata.** Misurato: 0 elementi diversi su 103 fra verde e rosso a 375 px (la Home non usa la fisarmonica).
  Resta al giro 298.

## Prima / dopo

| Punto | Prima | Dopo | Fonte |
|---|---|---|---|
| «C» nella Rosa | assente | 1 sola, sul capitano atteso (3 salvataggi su 3) | `rosa-angoli-299`, braccio A |
| «VC» nella Rosa | assente | 1 sola, sul vice atteso, diversa dal capitano (3 su 3) | idem |
| Pallino di C e VC rispetto alla «R» | — | stessa altezza 16, stesso fondo `rgb(232,180,74)`, stesso raggio 6 px, stesso carattere 10 px/800; «VC» larga 18 invece di 16 | idem |
| Club › Rosa: testata «ROSA 24» sopra «TITOLARI» | testata 6/6/0/0, riquadro sotto 16/16/16/16 (attacco incoerente) | testata 16/16/0/0, corpo 0/0/16/16 | censimento, foto `giro299/foto-prima/375/club-rosa.jpg` → `giro299/foto/375/club-rosa.jpg` |
| Club › Allenatore | stesso difetto della Rosa | 0 | censimento |
| Difetti d'angolo, 375×667 | 20 (Club 2 · Calendario 10 · Profilo 2 · Agente 5 · Offerta 1) | 0 su 786 riquadri | `censimento-prima.json` / `censimento.json` |
| Difetti d'angolo, 412×915 | 26 (Profilo 8, il resto uguale) | 0 su 786 riquadri | idem |
| Difetti d'angolo, 1366×768 | 26 | 0 su 781 riquadri | idem |
| Tasto audio nella serata | assente | presente, 49×49 px, non coperto, a 375 e a 1366 | `rosa-angoli-299`, braccio C |
| Muto dalla serata | — | `AudioMgr` false → true, `cpm-audio` mute=true, nessuna seconda chiave, icona 🔊 → 🔇 | idem |

## Cosa ho fatto in questa sessione

1. Censimento «dopo» e «prima» (braccio rosso) alle tre taglie, con foto; documento generato dai due file di dati.
2. Guardiano registrato nella mappa di `ci-runner.mjs` sulle prime righe di `src/05-|09-`, `src/1[17]-`, `src/18-|16-|10-`, `src/19-`
   (la mirata legge solo la prima riga che corrisponde). In `package.json` c'era già.
3. **`rosa-228` era rosso** dopo il giro: la sua misura (`misura-228.mjs`) prendeva come «ruolo» il primo elemento dopo il nome,
   saltando solo la «R»; ora trovava «C»/«VC» (48 righe = 24 club × 2). Ho aggiunto il salto di `fascia299`, come il giro 268 aveva
   fatto per la «R». Nessuna soglia cambiata. Dopo: verde 576 righe, 0 ruoli non in sigla; i due rossi cadono ancora.

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`)

| Controllo | Esito | Nota |
|---|---|---|
| `rosa-angoli-299` | verde | verde 22/22; rosso cade su A, B, C |
| `test:logic` | verde | 51 pass, 0 fail |
| `save-compat` | verde | 12 pass, 0 fail |
| `design-system` | verde | |
| `tema-unico` | verde | e rosso atteso |
| `griglia-mobile` | verde | 14 schermate × 5 larghezze |
| `pc-289` | verde | |
| `audio-172` | verde | primo lancio interrotto da un mio tetto di 560 s (non vale); rilanciato senza tetto: verde, rosso cade su 3, 4, 6–11 |
| `rosa-228` | verde | dopo l'aggiornamento della misura (vedi sopra); prima rosso |
| `rigorista-257` | verde | |
| `spogliatoio-182` | verde | 15 ok |
| `patto-227` | verde | |
| `presentazione-214` | verde | |
| `serata-261` | verde | |
| `popup-224` | verde | |
| `finestra-230` | verde | |
| `badge-255` | verde | |
| `chip-269` | verde | |
| `spazio-296` | verde | 44 schermate |
| `build-src` / `check-src` | verde | `check-src`: html allineato; `build-src` non rilanciato perché `src/` non è cambiato in questa sessione |

Foto di altri giri rigenerate dai controlli (`collaudo-grafico/g0`, `giro172/foto`, `foto-giro26`): rimesse con `git restore`.

## Controlli NON eseguiti

Per regola: `highlight-95`, `ingresso-206`, `career-critical`, `ci-runner mirata`.

Per tempo, dalla mappa dei file toccati (src/09, 11, 18, 19):

- messi in coda e non partiti: `accessibilita-234`, `coerenza-235`, `home-199`, `pc-tablet-292`, `stile-unico-75`, `schermate-97`, `grafica-v2`;
- mai messi in coda: `forma-239`, `nomi-248`, `nomi-251`, `carriera3-94`, `assist-298`, `esiti-96`, `voto-79`, `lessico-218`,
  `cross-218`, `nomi-219`, `migrazione-194`, `classifica-194`, `classifica-102`, `brusio-238`, `esiti-241`, `calendario-218`,
  `figurina-199`, `nomi-182`, `patrimonio-303`, `partita-v2`, `momenti-v2`, `crea-home-295`, `neutro-287`, `piccoli-85`,
  `ritratto-171-72`, `stili-098-migrazione`, `popup-224b`, `convocazione-235`, `toast-247`, `attesa-241`, `toast-intervista-247`,
  `festa-oro-251`, `crediti-254`, `toast-256`, `via-ch38-171`, `stadi-071`, `pulsanti-263`, `primavera-260`, `podio-260`,
  `store-236`, `interviste-211`, `salienti-229`, `salienti-243`, `agente-198`, `pullman-204`, `svincolato-198`, `rifiniture-200`,
  `indice-163`, `salta-163`, `momento-165`, `momento-165b`, `momento-173`, `momento-185`, `gioca-188`, `simula-v2`,
  `assist-nome-98`, `impulsi-289`, `trainer-288`, `livello-79`, `errori-168`, `barra-360-72`, `acquisti-281`, `difficolta-156`,
  `impulsi-memoria-154`, `nazionale-155`, `rinnovo-270`, `simulata-272`, `giornata-233`, `testata-209`, `intervista-231`,
  `recupero-103`, `euro-attesa-181`, `riquadro-euro-105`, `avversario-106`, `rinvio-coppe-107`, `etichette-108`, `titolo-110`,
  `pre-188`, `conferenza-192`, `partita-rigiocata-194`, `pro-rivale-176`, `anteprima-212`, `mister-215`, `calendario-247`,
  `coppa-prestito-245`, `procuratore-253`, `backup-167`, `home-066`, `squalifica-222`, `investimento-223`, `infortunio-263`,
  `svincolato-264`, `meta-conto-265`, `scene-fuori-137`;
- la riga di `src/19` porta anche tutta la catena `completa`: non eseguita;
- fuori mappa, non eseguiti: `presentazione-225`, `pelle-240`, `patto-238`, `formazioni-262`, `typing-shortcuts`, `web-237`,
  `validate-situations` (gate), `audit-copyright`.

## Dubbi per il PO

1. **Chi è il capitano quando il gioco non lo sa.** Il gioco conosce il capitano solo se è l'eroe o se nello spogliatoio c'è un
   compagno «capitano» (lo spogliatoio pesca 3 archetipi su 4). Negli altri club la «C» va al titolare con l'«attitudine» più alta
   ricavata dal nome (stesso calcolo fisso del rigorista), e la «VC» al secondo. È una regola inventata per riempire il vuoto, non un
   dato della carriera: va bene così o preferisci un'altra regola (per esempio il più anziano, o il valore più alto)?
2. **Quel ramo non è coperto dal guardiano.** Nei tre salvataggi di prova il capitano viene sempre dallo spogliatoio («dalla regola
   dell'attitudine 0» nell'uscita). Il controllo passa lo stesso perché chiede solo che almeno un caso sia coperto. Non posso
   confermare con una misura che la regola dell'attitudine metta «C» e «VC» giuste: servirebbe un quarto salvataggio senza
   «capitano» nello spogliatoio.
3. **Il vice dell'eroe capitano.** Se l'eroe ha la fascia e c'è un «ex capitano» nello spogliatoio, la «VC» va a lui. È una scelta
   del giro, non una regola che esisteva.
4. **Fisarmoniche più tonde ovunque.** La regola porta testata e corpo delle fisarmoniche da raggio 6 a 16 in tutte le schermate che
   le usano (Club, Calendario, Profilo, Agente…), non solo nella Rosa. Sul Club a 375 px cambiano 75 elementi su 140. Le foto «dopo»
   sono in `giro299/foto/`: da guardare sul telefono.
5. **Limiti del censimento.** Misura le schermate raggiungibili col salvataggio del banco; non misura la partita (2D e 3D) né le
   schermate che compaiono solo in altri stati (infortunio, prestito, tornei delle Nazionali in corso). «Tutti i riquadri» va letto
   con questo limite.
6. **Il tasto audio della serata sparisce anche col rosso del giro 172** (`__CPM_NO_G172`): scelta della prima sessione, coerente
   col pannello che è di quel giro.
7. **Guardiano solo nella mappa**, non nelle catene `grafica`/`carriera`/`completa`: gira nella mirata quando si toccano src/05, 09, 10, 11,
   16, 17, 18, 19. Se lo vuoi anche nella notte va aggiunto a una catena.
8. **Molti guardiani della mappa non sono stati eseguiti** (elenco sopra): prima di un'unione in `lavoro/198` serve una mirata o la
   catena di notte.
