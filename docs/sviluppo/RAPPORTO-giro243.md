# Rapporto giro 243 — PO-508: «Gioca solo i momenti salienti» anche nelle partite della Nazionale

Versione di riferimento 7.999.197 (GAME_VERSION non toccata, come da regole). Ramo `sviluppo/giro243-salienti-nazionale`, partito da `lavoro/197`.

## Il difetto (foto PO 196)

Mondiale, fase a gironi, Spagna-Belgio: la schermata pre-partita (`MatchdayCard`, `src/13-prepartita-formazioni.jsx`) mostrava
«Vedi le formazioni · Analisi dell'avversario · Salta e gioca · Simula la partita · Torna alla home», senza «Gioca solo i momenti
salienti». Decisione PO-494 (16/11): il tasto c'è in ogni partita da titolare.

## Misura prima (codice di `lavoro/197`)

Dove c'era la scelta dei soli salienti (lettura del codice, `src/18` e `src/15`):

- `src/18` ~7413: il **prompt della partita** (`showMatchPrompt`), da titolare, giocatore professionista, senza infortunio/squalifica
  → `soloChiesta166Ref` → `startMatch`.
- `src/18` ~12368 / ~12473: le **lobby** della Coppa delle Nazioni e di Europeo/Mondiale (giro 229).
- **Nessuna** scelta nella schermata pre-partita (`MatchdayCard`): `LiveMatch` riceveva `soloHL` solo dalla carriera.
- Il **tasto principale della home** (`data-cpm="avanza23"` → `handleContinua`, `src/18` ~1574-1577) con un torneo della Nazionale in
  corso chiama direttamente `startNationsCupMatch()` / `startEuroMondialeMatch()`: niente prompt, niente lobby → si arriva alla
  schermata pre-partita **senza alcuna possibilità** di scegliere i salienti. È il percorso della foto.
- L'amichevole calendarizzata: prompt (col tasto) → convocazione (`NationalCallupScreen`, solo «Gioca la partita») → pre-partita.

Ogni partita giocabile monta `LiveMatch`, che parte sempre dalla fase `matchday` (cioè dalla schermata pre-partita) salvo la ripresa
dopo un'interruzione (`resumeState`) e il provino (`trial`). Per questo il punto unico dove mettere il tasto è la schermata pre-partita.

## Correzione

- `src/15-live-match.jsx`: stato locale `soloScelto243` (+ ref per il salvataggio della ripresa, che vive in un effetto montato una
  volta). `_solo166 = soloHL || soloScelto243 || …`: la partita scelta dalla pre-partita usa lo stesso battito della partita a soli
  salienti del giro 166/229 (`_lotto166`), quindi il risultato lo decide la stessa partita. La ripresa salva `s166` anche per questa
  scelta. Il tasto viene passato a `MatchdayCard` solo se: non già a soli salienti, non dalla panchina (`benchStart`), non provino,
  giocatore professionista, non infortunato, e non con `__CPM_NO_G166`.
- `src/13-prepartita-formazioni.jsx`: nuovo prop `onSolo243`; se presente, sotto «Salta e gioca» c'è il tasto «Gioca solo i momenti
  salienti» (`data-cpm="solo-243"`) con la **stessa nota** del giro 229 («Giochi solo le tue azioni, il resto della partita scorre
  veloce. Il risultato lo decide la stessa partita.», `data-cpm="solo-243-nota"`). Il tasto salta formazioni e ingresso in campo
  (come «Salta e gioca»).
- Rosso `window.__CPM_NO_G243`: il tasto non c'è e la scelta non vale.
- `node tools/build-src.mjs` + `node tools/check-src.mjs`: IDENTICO BYTE PER BYTE.

## Tabella dei percorsi (dopo la correzione, misurata dal guardiano salvo dove indicato)

| Percorso | Prima (`lavoro/197`) | Dopo |
|---|---|---|
| Campionato — prompt | tasto (giro 229) | tasto (invariato, non rigiocato qui) |
| Campionato — prompt → pre-partita | **no** | **sì** (misurato) |
| Coppa nazionale — prompt → pre-partita | solo nel prompt | **sì** (misurato) |
| Europa gironi — prompt → pre-partita | solo nel prompt | **sì** (misurato) |
| Europa eliminazione diretta — prompt → pre-partita | solo nel prompt | **sì** (misurato) |
| Nazionale amichevole — prompt → convocazione → pre-partita | solo nel prompt | **sì** (misurato) e **giocata** a soli salienti |
| Coppa delle Nazioni — lobby | tasto (giro 229) | invariato (non rigiocato qui) |
| Coppa delle Nazioni — tasto principale della home → pre-partita | **no** | **sì** (misurato) |
| Europeo qualificazioni — tasto principale della home → pre-partita | **no** | **sì** (misurato) |
| Mondiale gironi — tasto principale della home → pre-partita (foto PO) | **no** | **sì** (misurato) e **giocata** a soli salienti |
| Mondiale eliminazione diretta — tasto principale della home → pre-partita | **no** | **sì** (misurato) |
| Europeo/Mondiale — lobby | tasto (giro 229) | invariato (non rigiocato qui) |
| Dalla panchina (campionato) → pre-partita | no | **no** (misurato: corretto, non è da titolare) |
| Squalificato | partita simulata | invariato (non giocabile) |
| Calendario (tasto «Gioca» della voce di settimana) | passa da `startMatch` → prompt | coperto dalla pre-partita (non misurato a parte) |
| Ripresa dopo interruzione | rientra nella modalità salvata | anche la scelta della pre-partita viene salvata (`s166`); non rigiocato |
| Provino / Primavera | no | no (come giro 166/229, vedi dubbi) |

## Guardiano `salienti-243` (nuovo)

`tests/visual/salienti-243.mjs`, `npm run salienti-243`; in `ci-runner.mjs` una volta nelle catene `completa` e `carriera`, fra i
lenti, e nella mappa mirata di `src/13`, `src/15`, `src/18` (accanto a `salienti-229`). `node --check` verde, nessun doppione.
Gioca, non legge il sorgente:

- **A — percorsi**: apre ciascun percorso della tabella fino alla schermata pre-partita (prompt vero, convocazione vera, tasto
  `avanza23` vero) e controlla tasto + nota; dalla panchina il tasto non deve esserci (prompt verificato «Gioca · parti dalla panchina»).
- **B — partite**: Mondiale gironi (dal tasto principale della home) e amichevole della Nazionale (dal prompt + convocazione), aperte
  dal tasto della pre-partita e giocate col pilota automatico fino al fischio.

Esito (build finale):

- **Verde**: A 9/9 percorsi col tasto + panchina senza tasto + 0 errori di pagina. B Mondiale: testimone
  `{"chiesta":false,"scelta243":true,"attiva":true}`, velo dei salienti visto, fine al 90' in ~57 s, carriera registrata
  (`groupMatchIdx` 0→1); amichevole: stessa modalità, fine al 90' in ~63 s, `nationalCaps` 0→1; 0 errori. **PASSA**.
- **Rosso** (`__CPM_NO_G243`): i 9 percorsi cadono (tasto assente nella pre-partita), la panchina resta senza tasto, Mondiale e
  amichevole arrivano alla pre-partita ma non possono aprirsi a soli salienti. **CADE come deve**.

Prima stesura: la prova della panchina era «non giudicata» (cercava «Gioca la partita», ma da panchina il tasto è «Gioca · parti
dalla panchina») e poi finiva sull'amichevole rimasta in calendario; corretto ripristinando il calendario originale e verificando il
testo del prompt. Nessuna soglia abbassata.

## Controlli

| Controllo | Esito |
|---|---|
| salienti-243 (verde + rosso) | verde PASSA · rosso CADE |
| test:logic | 51 pass · 0 fail |
| save-compat | 12 pass · 0 fail |
| solo-highlight-166 | VERDE PASSA (13/13; soli salienti 62,8 s contro 193,9 s; libro mastro 270/270 identico) · ROSSO `__CPM_NO_G166` CADE su 3, 7, 8 |
| barra-221 | VERDE (difetti 0, non giudicati 0) · rossi `__CPM_NO_G221` e `__CPM_NO_G229` bocciati come devono |
| salienti-229 | non eseguito (la consegna chiedeva 229 *oppure* 243; scelto il nuovo) |

Incidente: lanciando `node ci-runner.mjs mirata lavoro/197` per **vedere** l'elenco, la catena mirata è partita davvero (il runner non
ha una modalità «solo elenco»); l'ho fermata dopo 4 passi verdi (test:logic, save-compat, design-system, tema-unico), nessun browser
residuo, nessun file in `docs/` modificato. L'elenco mostrava anche file `src/00/01/11/19` come «toccati»: il ramo locale `lavoro/197`
era più vecchio di `origin/lavoro/197`, non è una modifica di questo giro.

## Dubbi per il PO

1. **Tasto nella pre-partita anche dopo aver scelto «Gioca la partita» nel prompt.** In campionato/coppe/Europa il prompt offre già
   la scelta; ora la pre-partita la ripropone. Ho tenuto entrambe (la decisione dice «in ogni percorso»); se il PO preferisce una
   scelta sola, si può togliere dal prompt o dalla pre-partita.
2. **Convocazione dell'amichevole e lobby della Nazionale** hanno ancora solo «Gioca la partita» (convocazione) o i tasti del giro 229
   (lobby). Il tasto è comunque nella schermata successiva; non l'ho aggiunto alla convocazione per non duplicarlo.
3. **Il tasto salta formazioni e ingresso in campo** (come «Salta e gioca»). Dal prompt invece la partita a soli salienti passa da
   formazioni e ingresso. Da decidere se uniformare.
4. **Primavera (u18)** e **provino**: restano senza tasto, come il giro 166/229 (dubbio 1 del giro 229 ancora aperto).
5. **Infortunato**: in Nazionale il tasto sparisce se `player.injured`, come nelle lobby del 229; non ho trovato un caso in cui un
   infortunato arrivi davvero alla pre-partita, quindi non è giocato.
6. **Ripresa**: la scelta fatta nella pre-partita viene salvata nel punto di ripresa (`s166`), ma non ho rigiocato una ripresa dopo
   interruzione.
7. (Chiarito, non è un dubbio) Dopo la gara del girone il gioco scrive `groupMatchIdx`/`groupMatches`/`groupPts`, non
   `groupResults` (verificato in `src/18` ~4027-4070): il guardiano giudica `groupMatchIdx` 0→1, il campo giusto.
