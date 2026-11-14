# Rapporto — giro 190 (7.999.194, prima ondata)

Ramo `sviluppo/giro190-testi-nomi`, partito da `lavoro/194` (= 7.999.193 pubblicata). `GAME_VERSION` non toccato.
Ogni correzione ha il suo rosso `window.__CPM_NO_G190<lettera>` e un guardiano nuovo, provato verde col verde e rosso col rosso.
Foto prima/dopo in `docs/sviluppo/giro190/`.

| Lettera | Voce | Rosso |
|---|---|---|
| A | PO-380a · G181-01 testi che rompono l'incanto | `__CPM_NO_G190A` |
| B | PO-380b · G181-02 frase del mister alla convocazione | `__CPM_NO_G190B` |
| C | PO-380c · G181-06 nomi reali nei salvataggi vecchi | `__CPM_NO_G190C` |
| D | PO-396 «Primavera» → «U19» | `__CPM_NO_G190D` |
| E | PO-397 nome abbreviato prima della sigla | `__CPM_NO_G190E` |

---

## 1. PO-380 a) — G181-01, i testi che rompono l'incanto

**Inventario misurato** (sul gioco vero; i sette punti del collaudo 181 più la ricerca delle parole tecniche a vista):

| # | Testo | Dove | Misura prima | Correzione |
|---|---|---|---|---|
| 1 | «riprendi il **wizard** col tasto Avanza» (2 volte) | apertura di stagione, passi maglia e presentazione (`src/18`) | visto 2 volte camminando l'apertura | «poi torni qui col tasto Avanza» / «si riparte da qui col tasto Avanza» |
| 2 | «fallo di **un giocatore su un giocatore**» | cronaca a motore acceso (`src/15`, narratore del fallo) | **6 righe su 125 (4,8%)** in 2 partite vere, tutte di fallo | quando il motore non passa i nomi la riga non inventa segnaposti; se il fallo nasce nella scena dell'eroe lo nomina («fallo su {eroe}») → **0 su 125** |
| 3 | consiglio tagliato «Nessun taglio in profondità:…» | pannello «La tua giocata», sottotitolo a una riga con i puntini (`src/15`) | a 375 px **7 consigli tagliati** su 39 letti | nuovo `FraseIntera190` (`src/11`): frasi intere, al massimo due righe, mai i puntini → **0** |
| 4 | 😄 accanto a «−3» | esito della scelta d'impulso e riepilogo della settimana (`src/18`) | 😄 su morale −3 (`wi_dieta_ferrea`) | 😟 quando il morale scende |
| 5 | «Contratto **trascorso**» | scheda contratto (`src/18`, `contratto-v2`) | visto | «Contratto in corso» |
| 6 | tutorial: «La **Dashboard**» e la scheda «**Opzioni**» che non esiste | `TUTORIAL_STEPS` (`src/17`) | la barra ha Home·Stagione·Club·Carriera·Agente·Ufficio | «La Home», «… Agente e Ufficio» |
| 7 | «**Il ragazzo della Primavera** ti chiede di restare…» a un giocatore della Primavera | evento `vita_aiuto_compagno` (`src/03`) | usciva anche in Primavera (nessuna condizione) | esce solo a un professionista |
| 8 | «Torna alla **dashboard**», «rimani in dashboard», «Back to Dashboard» | `LOCALE` IT/EN (`src/17`), prepartita (`src/13`), fine partita (`src/15`) | visti nel catalogo | «Torna alla Home», «resta nella Home», «Back to Home» |

Guardiani:
- **`npm run testi-190`** (≈ 5 min): cammina l'apertura di stagione vera (6 passi, maglia compresa), Home/Carriera/Agente/Ufficio/Club, catalogo (tutorial, LOCALE, evento), un impulso vero col morale negativo, e i 45 consigli del catalogo a 375 px. Verde **14 ok · 0 ko**; rosso `CPM_ROSSO190A=1` **7 ko** (wizard 2 · trascorso · tutorial · LOCALE · Primavera · faccina · consigli tagliati 7).
- **`npm run cronaca-nomi-190`** (≈ 4,5 min, 2 partite vere a motore acceso): verde 0/125 righe col segnaposto; rosso 6/125.

⚠️ Note e dubbi (non decisi):
- **Il consiglio ora può occupare due righe**: il pannello cresce di una riga (foto `consiglio-dopo.png`). Se il PO preferisce una riga sola, la stessa funzione può mostrare solo la prima frase intera.
- `FraseIntera190` spezza le frasi su «. ! ?» seguiti da spazio: un'abbreviazione col punto dentro un consiglio («Sel. Granata») verrebbe trattata come fine frase. Oggi nessun consiglio del catalogo ne contiene, ma i consigli del motore usano i nomi: da tenere presente.
- **Sei scene del catalogo con un consiglio non mostrano il pannello di scelta** (gi 5, 41, 58, 151, 170, 175) e non sono giudicabili da questo guardiano; la soglia «al più 7 mancanti» è fissata sulla misura.
- **Il fallo della scena dell'eroe (`src/14`, esiti `fouled`/`win_freekick`) porta `per` = squadra AVVERSARIA dell'eroe**, mentre il commento accanto dice che il fallo lo subisce l'eroe. La cronaca quindi può dire «{eroe} viene steso: punizione per [avversari]». Non l'ho toccato: è il motore (catena completa) e va confermato. Da decidere.
- Una riga di fallo non della scena esce senza nomi («Fischia l'arbitro: fallo, punizione dalle retrovie»): corretta ma impersonale. I nomi mancano nel fatto del motore.
- Visto di passaggio, fuori ambito: la home mostra «Offerta di sponsor · **Kappa** …», che è un marchio reale. Da verificare con `audit-copyright` e decidere.

## 2. PO-380 b) — G181-02, la frase del mister alla convocazione

Misura prima (funzione vera `calcCoachDecision`, salvataggio di prova S12, sei settimane di fila con avversari, voti, gol e fatica diversi): **1 frase distinta su 6** per il titolare, 1 su 6 in panchina, 1 su 6 non convocato.

Correzione (`src/08`, `fraseConvocazione190`): **la scelta del mister non cambia** (status e minuto d'ingresso intatti), cambia solo la frase, scelta fra i fatti veri della settimana: avversario in calendario, ultimo voto e contro chi, serie di gol, stanchezza, forma, fiducia, peso della gara. Nessun sorteggio: hash di stagione/settimana/nome/status, quindi la stessa settimana dice sempre la stessa cosa. Senza fatti (nessun avversario in calendario, nessuna partita alle spalle) resta la frase di sempre.

Dopo: titolare **6/6 distinte**, panchina 4/4, non convocato 6/6; ogni frase cita un fatto della sua settimana; status e minuto d'ingresso identici al braccio rosso su **300/300** settimane sintetiche.

Guardiano **`npm run convocazione-190`** (≈ 30 s): verde 13 ok; rosso `CPM_ROSSO190B=1` 6 ko.

⚠️ La frase di prova nel varco di collaudo `__CPM_CAREER.apriPartita` (`src/18` r.~1710) è fissa e resta tale: è solo per le sonde.

## 3. PO-380 c) — G181-06, nomi reali nei salvataggi vecchi

Misura prima: nei salvataggi di prova (`tests/visual/fixtures/*.json`) le parole della lista `_CR_PLAYERS` (la stessa di `audit-copyright`) compaiono **solo** in `save-190-s12-ovr93.json`: «Bukayo Saka» in `player.rival.name`, `player.lastAwards.aw.rival.name` e due voci del diario — **4 testi**.

Correzione (`src/17`, `pulisciNomiReali190` chiamata in fondo a `migratePlayer`): al caricamento ogni parola della lista presente in un testo del salvataggio diventa un nome inventato preso da `RIVAL_FIRST`/`RIVAL_LAST`, scelto dall'hash della parola stessa: **stesso nome ovunque** e a ogni caricamento («Bukayo Saka» → «Bruno Asante»). Additiva e idempotente, `SAVE_VERSION` resta 9. **Il nome dell'eroe scelto dal giocatore non si tocca mai** (se l'eroe si chiama «Neymar Rossi», quelle parole sono escluse dalla pulizia).

Guardiano **`npm run nomi-salvati-190`** (≈ 2 min): pura (rinomina coerente, idempotenza, eroe intatto) + i quattro salvataggi di prova caricati nel gioco vero: 0 parole della lista nel salvataggio riscritto, diario e rivale col nome nuovo. Verde 19 ok; rosso `CPM_ROSSO190C=1` 1 ko (le 4 parole restano).

⚠️ La lista `_CR_PLAYERS` è di 38 parole: un nome reale fuori lista non viene visto (né qui né da `audit-copyright`). La lista contiene «Immobile», che è anche una parola italiana: la pulizia è sensibile alle maiuscole e oggi nessun testo del gioco la usa con la maiuscola, ma un testo futuro che cominciasse con «Immobile…» verrebbe cambiato. ⚠️ Due fixture (`save-c177-*`) hanno un'altra forma e non sono giudicate.

## 4. PO-396 — «Primavera» si accorcia in «U19»

Correzione nella funzione unica `candidatiSquadra182` (`src/11`): il primo gradino dopo il nome intero sostituisce «Primavera» con «U19». Scala completa, dal più lungo al più corto: «FC Valmora Primavera» → «FC Valmora U19» → «Valmora U19» → «Valmora» → «VAL». 36 club Primavera su 36. `abbreviaSquadra182` (dizionario) non cambia, quindi i casi di nomi-182 restano validi.

## 5. PO-397 — barra della partita a 375 px

Correzione nella stessa scala: il **nome abbreviato** è il nome senza la sigla societaria in testa (FC/AC/CF/AT…: **285 club su 295** cominciano così); la sigla resta l'ultimo gradino.

Misura (censimento di tutti i 296 club sul carattere e sullo spazio veri del nome sulla barra del provino):

| Larghezza | Spazio del nome | Prima: intero / dizionario / abbreviato / **sigla** | Dopo: intero / U19-dizionario / abbreviato / **sigla** |
|---|---|---|---|
| 375 px | 58 px | 79 / 1 / 0 / **215** | 79 / 1 / 162 / **53** |
| 390 px | 72 px | 201 / 2 / 0 / **92** | 201 / 4 / 76 / **14** |
| 412 px (nomi-182) | 83 px | 242 / 3 / — / **51** | 242 / 46 / — / **8** |

(Il censimento di nomi-182 conta 216 sigle a 375 px perché classifica i gradini in tre colonne; il conteggio di nomi-190 ne trova 215: un club con sigla uguale al nome. Partenza dichiarata nel backlog: 216.)

Guardiano **`npm run nomi-190`** (≈ 2 min): scala pura su tutti i club, censimento a 375 e 390 px, nessun club in sigla che abbia un nome abbreviato che ci sta, il nome mostrato sulla barra è il primo gradino che ci sta. Verde 23 ok; rosso `CPM_ROSSO190=1` (D+E spenti) 10 ko.

⚠️ Le foto della barra (`barra-375/390-prima/dopo.png`) sono **uguali** fra prima e dopo: nel provino le squadre sono «Selezione Granata» e «Polisportiva Centro», senza FC in testa, quindi la barra non cambia. Il cambiamento si vede in carriera con club «FC …»; la prova è il censimento, non la foto.
⚠️ Il nome abbreviato vale ovunque passi la funzione unica (classifica, slot, prepartita…), ma solo dove l'intero non ci sta.

## 6. Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `free -m`/`df -h` prima di ognuno)

| Controllo | Esito |
|---|---|
| nomi-190 · nomi-salvati-190 · convocazione-190 · testi-190 · cronaca-nomi-190 | verdi col verde, rossi col rosso |
| nomi-182 | VERDE 27/0 |
| spogliatoio-182 | VERDE 15/0 |
| interviste-183 | VERDE (e il rosso si vede) |
| **convocazione-235** | **ROSSO — già rosso sulla base 7.999.193** (eseguito su un worktree di `origin/lavoro/194`: stesso esito «card del kit 0» su tutti e quattro i casi). Non causato da questo giro; la schermata `NationalCallupScreen` non è stata toccata. Da riparare in un giro dedicato. |
| lessico-218 | VERDE |
| griglia-mobile | uscita 0, misura completa 14 schermate × 5 larghezze |
| career-critical | vedi sotto |
| test:logic | vedi sotto |
| save-compat | vedi sotto |

Dopo ogni modifica a `src/`: `node tools/build-src.mjs` e `node tools/check-src.mjs` → IDENTICO BYTE PER BYTE.
