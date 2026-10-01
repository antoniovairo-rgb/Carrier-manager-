# PO-175 — Classifica: gol fatti e subiti su CPM 7.999.91

**Base misurata:** `main` al commit `d5d60bedec39b2d2dfbd7ebceccfa206999f36d2`, `GAME_VERSION=7.999.91`. Dati grezzi: `tests/codex/classifica-gol.json.gz`. Il gioco non è stato modificato.

**Esito:** il difetto si riproduce nei semi 17 e 35 alla stagione 3, settimana 2. Nel seme 4 non si è riprodotto in cinque stagioni. La prima apertura del seme 4 ha dato un timeout (errore integrale nel grezzo); il tentativo su pagina nuova è terminato senza errore. Il campione usa salvataggi e offerte seedati dallo script, quindi la frequenza nelle carriere naturali è non verificata.

## Prima settimana con scarto

| Seme | Prima divergenza | GF | GA | Scarto | Stato |
| --- | --- | --- | --- | --- | --- |
| 17 | S3/W2 | 19 | 15 | 4 | first-mismatch-captured |
| 35 | S3/W2 | 34 | 37 | -3 | first-mismatch-captured |
| 4 | nessuna in 5 stagioni | — | — | — | target-reached |

## Squadre e giornata responsabile

| Seme | Club iniziale | Club eroe dopo trasferimento | Posizione prima | Messaggio promozione/retrocessione | Lega del club nel nuovo save | Presente nella nuova classifica | Uscite / entrate nella lega |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 17 | FC Ruhrpott | FC Augsburg | 16 | ⬇️ FC Augsburg RETROCESSA in Deutsche Liga 2! | Deutsche Liga | no | aug, boc, dsc / hbu, nub, fur |
| 35 | FC Bruxella | FC Guingamp | 3 | 🆙 FC Guingamp PROMOSSA in Ligue Nationale! | Ligue Nationale 2 | no | cae, aux, gui / bre2, hac, metz |
| 4 | FC Bergamo Primavera | non verificato | non verificato | non osservato | non verificato | non verificato | non verificato |

| Seme | Ruolo | ID squadra | Classifica S3/W1 | Classifica S3/W2 |
| --- | --- | --- | --- | --- |
| 17 | eroe | aug | assente | assente |
| 17 | avversario | b04 | G0 GF0 GA0 | G1 GF3 GA0 |
| 17 | riga isolata* | wer | G0 GF0 GA0 | G1 GF2 GA1 |
| 35 | eroe | gui | assente | assente |
| 35 | avversario | hac | G0 GF0 GA0 | G1 GF1 GA3 |
| 35 | riga isolata* | que | G0 GF0 GA0 | G1 GF0 GA1 |

Nei semi 17 e 35 il calendario e lo storico contano **una** partita dell’eroe, non due. La riga dell’eroe manca nella classifica della lega che il suo club dichiara; la riga dell’avversario riceve il risultato. Non risulta un punteggio diverso nel tabellino della partita dell’eroe. Nel seme 17 anche il vecchio club (`boc`) esce dalla lega superiore per retrocessione; nel seme 35 il vecchio club (`and`) appartiene a un’altra lega, mentre è il club nuovo (`gui`) a essere promosso. Non ho osservato righe con dati importati direttamente da un’altra lega, ma non posso confermare tutte le gare degli altri club: il calendario salvato contiene solo quelle dell’eroe.

| Seme | S/W | Partita calendario/storico | Riga avversario ΔGF/ΔGA | Squadra simulata senza controparte* ΔGF/ΔGA | Scarto della settimana | Δ scarto | Somma spiegata |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 17 | S3/W2 | aug–b04: 0–3 | b04 3 / 0 | wer 2 / 1 | 4 | 4 | sì |
| 17 | S3/W3 | aug–stu: 0–2 | stu 2 / 0 | fre 1 / 1 | 6 | 2 | sì |
| 17 | S3/W4 | aug–bvb: 0–3 | bvb 3 / 0 | bsc 2 / 1 | 10 | 4 | sì |
| 17 | S3/W5 | aug–mgb: 0–3 | mgb 3 / 0 | wer 1 / 3 | 11 | 1 | sì |
| 35 | S3/W2 | gui–hac: 3–1 | hac 1 / 3 | que 0 / 1 | -3 | -3 | sì |

*La «squadra senza controparte» non è una partita di calendario. Il suo ID deriva dallo shuffle seedato di `updateStandings` (`src/09-audio-scout-anagrafiche.jsx:1428-1438`); l’incremento GF/GA è letto nelle due classifiche consecutive. Questa combinazione spiega esattamente lo scarto misurato, ma l’attribuzione della singola partita simulata resta una ricostruzione del codice.

## Meccanismo probabile (ipotesi da riprodurre dal team)

A fine stagione l’override sposta il club promosso/retrocesso. Se un prestito con obbligo diventa definitivo, `_loanStayClub` copia `p.club` con la vecchia `lg` (`src/18-career-app.jsx:4856`); `nextClub84` dà precedenza a quella copia rispetto a `_nextClubPre` già aggiornata (`:4866`). `getLeagueClubs` prende la `lg` del club per selezionare la lega ma rispetta gli override delle squadre (`src/06-archetipi-agenti-sponsor.jsx:110-122`): così la classifica viene inizializzata senza il club dell’eroe (`src/18-career-app.jsx:4867-4868`). Alla partita successiva `updateStandings` non trova la riga dell’eroe, ma trova l’avversario e ne applica il risultato; poi, con 17 squadre rimaste, simula anche una riga isolata (`src/09-audio-scout-anagrafiche.jsx:1410-1438`). Il differenziale di quelle due righe coincide con ogni aumento misurato dello scarto. La causalità del prestito è un’ipotesi sostenuta dal codice e dai due tracciati, non una correzione testata.

## Riproduzione

Da radice repository, con Chrome locale e dipendenze di `tests/visual` già installate:
```powershell
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='5'; $env:CPM_TIME_LIMIT_MS='900000'; $env:CPM_OUTPUT='classifica-gol-17.json'; node tests/codex/classifica-gol.mjs
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35,4'; $env:CPM_MAX_SEASONS='5'; $env:CPM_TIME_LIMIT_MS='1500000'; $env:CPM_OUTPUT='classifica-gol-35-4.json'; node tests/codex/classifica-gol.mjs
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='5'; $env:CPM_TIME_LIMIT_MS='900000'; $env:CPM_OUTPUT='classifica-gol-4.json'; node tests/codex/classifica-gol.mjs
node tests/codex/classifica-gol-report.mjs
```
I comandi sopra producono un JSON locale per ogni seme; il rapporto usa anche il file del primo tentativo combinato (`classifica-gol-35-4.json`) per conservare il timeout, incluso nell’archivio compresso. Lo script si arresta dopo tre settimane aggiuntive nel seme 17 e alla prima divergenza nei semi 35/4.

## Limiti

- Il seme 4 resta **non riprodotto su questa build**, non «corretto»: il percorso di carriera può essere diverso.
- Non ho alterato i dati del gioco per isolare l’override né eseguito un test con il fix: la riga precisa che causa il bug resta un’ipotesi.
- Il grezzo registra anche gli interventi dell’harness e il timeout; questi non sono difetti della classifica.
- Nessun giudizio sulla frequenza nelle partite naturali o sulla UI mobile.
