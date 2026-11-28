# Giro 449 — Quote reali di pareggi e partite con 5 o più gol (PO-645, verifica)

Ramo `sviluppo/giro449-quote-reali`, partito da `main` (1f64d5a, 7.999.219). **Motore non toccato**, `GAME_VERSION` e `docs/governo`
non toccati. Nuova sonda `npm run quote-449` (non bloccante).

Domanda (giro 347, dubbio 3, «Accetta e verifica»): con la taratura dei gol del giro 347 i pareggi sono scesi dal 24,6% al 20,4% e le
partite con 5 o più gol sono salite dal 7,9% al 14,4%. Quanto valgono queste quote nel calcio vero?

---

## In breve

1. **Pareggi: il motore ne fa troppo pochi.** Motore 20,1%, reale 26,4%: mancano 6,3 punti. Gli intervalli al 95% non si toccano
   (motore 19,1-21,1, reale 24,4-28,5).
2. **Partite con 5 o più gol: il motore NON ne fa troppe, ne fa un po' meno del reale.** Motore 14,0%, reale 17,0% (−3,0 punti;
   intervalli 13,1-14,8 e 15,3-18,8). Il salto dal 7,6% al 14,0% del giro 347 ha portato questa quota **verso** il reale, non oltre.
3. **Gol a partita:** motore 2,77, reale 2,88 (cinque campionati 2023/24).
4. Il giro 347 ha migliorato i gol (2,31 → 2,77) e le partite con molti gol (7,6% → 14,0%), ma ha allontanato i pareggi dal reale
   (23,0% → 20,1%, contro 26,4%). Il difetto da guardare è nei **pareggi**, non nelle goleade.

---

## 1. Fonte reale e calcolo

**Fonte:** football-data.co.uk, risultati finali della stagione 2023/24 (colonne `FTHG` = gol della squadra di casa a fine partita,
`FTAG` = gol della squadra ospite). Scaricati da questo container il 28/11/2026 (l'host risponde con un 302 verso `football-data.co.uk`):

- Premier League: https://www.football-data.co.uk/mmz4281/2324/E0.csv
- Serie A: https://www.football-data.co.uk/mmz4281/2324/I1.csv
- LaLiga: https://www.football-data.co.uk/mmz4281/2324/SP1.csv
- Bundesliga: https://www.football-data.co.uk/mmz4281/2324/D1.csv
- Ligue 1: https://www.football-data.co.uk/mmz4281/2324/F1.csv

**Calcolo**, per ogni riga con risultato: pareggio se `FTHG = FTAG`; «5 o più gol» se `FTHG + FTAG ≥ 5`. Quota = conteggio / partite.
Gli intervalli sono intervalli di Wilson al 95% e misurano solo il rumore dovuto alla dimensione del campione.

| campionato | partite | gol | gol/partita | pareggi | quota | ≥5 gol | quota |
|---|---|---|---|---|---|---|---|
| Premier League | 380 | 1.246 | 3,28 | 82 | 21,6% | 86 | 22,6% |
| Serie A | 380 | 992 | 2,61 | 112 | 29,5% | 47 | 12,4% |
| LaLiga | 380 | 1.005 | 2,64 | 107 | 28,2% | 60 | 15,8% |
| Bundesliga | 306 | 985 | 3,22 | 81 | 26,5% | 66 | 21,6% |
| Ligue 1 | 306 | 826 | 2,70 | 81 | 26,5% | 38 | 12,4% |
| **totale** | **1.752** | **5.054** | **2,88** | **463** | **26,4%** | **297** | **17,0%** |

Esempio di calcolo sul totale: pareggi 463 / 1.752 = 26,43%, partite con ≥5 gol 297 / 1.752 = 16,95%.

**Controllo incrociato:** i 985 gol in 306 partite della Bundesliga coincidono con la fonte citata nel giro 347
([Wikipedia, 2023–24 Bundesliga](https://en.wikipedia.org/wiki/2023%E2%80%9324_Bundesliga)). Le altre quattro leghe non le ho
confrontate con una seconda fonte. I conteggi sono scritti nella sonda e si possono ricontrollare con `CPM_RICALCOLA=1`, che riscarica
i file e confronta ogni numero: alla seconda corsa coincidevano tutti e venti.

⚠️ **Limiti della fonte:**
- è una sola stagione. La Premier 2023/24 ha 3,28 gol a partita, un valore alto per quella lega. Con più stagioni la quota reale
  di partite con ≥5 gol potrebbe scendere.
- La quota dei pareggi cambia molto da lega a lega: 21,6% in Premier, 29,5% in Serie A.

## 2. Misura del motore

Sonda `npm run quote-449`, sulla stessa strada di `misura-347.mjs` (giro 347). Per ogni lega analoga, ogni club fa da squadra
dell'eroe per 2 stagioni, col calendario vero (`legaDopoTrasferimento212`) e i semi del gioco (`standingsSeed + giornata·31 + 1`).
Ogni partita passa da `simulateMatch(…, {motore:true})`, che è il percorso «Simula» del motore della simulazione rapida.

Come leghe analoghe ho preso Premier Division per la Premier League, Lega A per la Serie A, Liga Ibérica per LaLiga, Deutsche Liga
per la Bundesliga e Ligue Nationale per la Ligue 1. Sono 1.224 partite per lega, **6.120 in tutto**.

La sonda è deterministica: due corse sul codice di oggi hanno dato numeri identici.

| braccio | partite | gol/partita | pareggi (IC 95%) | ≥5 gol (IC 95%) |
|---|---|---|---|---|
| **reale, cinque campionati** | 1.752 | 2,88 | **26,4%** (24,4-28,5) | **17,0%** (15,3-18,8) |
| **motore di oggi** | 6.120 | 2,77 | **20,1%** (19,1-21,1) | **14,0%** (13,1-14,8) |
| motore com'era prima del giro 347 (`CPM_ROSSO=1`, rosso `__CPM_NO_G347`) | 6.120 | 2,31 | 23,0% (22,0-24,1) | 7,6% (6,9-8,3) |

Motore di oggi, lega per lega:

| lega del motore | gol | pareggi | ≥5 gol |
|---|---|---|---|
| Premier Division | 2,98 | 20,1% | 17,3% |
| Lega A | 2,69 | 20,5% | 12,3% |
| Liga Ibérica | 2,74 | 20,4% | 13,5% |
| Deutsche Liga | 2,77 | 19,0% | 13,5% |
| Ligue Nationale | 2,70 | 20,4% | 13,2% |

**Perché i numeri non sono quelli del giro 347** (24,6 → 20,4 e 7,9 → 14,4): il giro 347 misurava 14 leghe, comprese le seconde
divisioni. Qui ci sono solo le cinque analoghe ai campionati della fonte. Andamento e ordine di grandezza sono gli stessi.

**Cosa NON è uguale fra motore e reale:**
- Nel motore le quote dei pareggi sono quasi uguali in tutte le leghe (19-20,5%). Nel reale vanno dal 21,6% al 29,5%.
- Nel motore la lega non ha uno stile proprio: cambiano solo i club e i loro prestigi.
- Quindi il confronto onesto è fra i due **totali**, non fra una lega e la sua analoga.

## 3. Lettura

- **Partite con ≥5 gol:** il sospetto del giro 347 («sono salite troppo») non regge contro la fonte. Il 14,0% sta **sotto** il
  17,0% reale, e il suo intervallo non tocca quello reale. Anche se la Premier 2023/24 fosse un'eccezione alta, quattro leghe su cinque
  stanno fra il 12,4% e il 21,6%.
- **Pareggi:** lo scarto è il più grande e il più sicuro (−6,3 punti). Esisteva già prima del giro 347 (23,0%, −3,4 punti); la
  taratura lo ha raddoppiato.
- **La causa dei pochi pareggi non l'ho misurata.** Il motore non è stato toccato né scomposto. Le ipotesi da verificare, che
  restano ipotesi:
  - la distanza di forza fra i club del motore è più larga di quella vera;
  - il motore non ha un effetto «risultato in parità che si congela» a fine partita.

  Non posso confermarle.

## 4. Sonda `npm run quote-449`

- Stampa le quote del motore accanto a quelle reali (per lega e in totale), con gli intervalli al 95% e lo scarto in punti.
- Non è un guardiano: esce con 0, salvo pagina rotta.
- Scrive le cifre in `tests/visual/out/quote-449/quote.json`, che non è versionato.
- Opzioni:
  - `CPM_RICALCOLA=1` riscarica la fonte; serve l'host `football-data.co.uk`, altrimenti la sonda lo dice e usa i conteggi salvati;
  - `CPM_ROSSO=1` aggiunge il braccio di prima del giro 347;
  - `CPM_LEGHE` e `CPM_STAG` cambiano il campione; sotto le 2.000 partite la sonda avvisa.
- Durata misurata su questo container: 4 min 40 s con il solo motore di oggi, 9 min 24 s con `CPM_ROSSO=1`.

**Comando:**

```bash
cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium npm run quote-449
```

**Non eseguiti in questo giro:** gate e catene. Non ho toccato `src/` né l'HTML: ho aggiunto un file di sonda e una riga di script
in `package.json`. Come sonda nuova, nessuno script di codice la importa.

⚠️ Da verificare sul treno: la riga di `package.json` riguarda solo gli script, quindi per la regola del giro 317 dovrebbe far girare
solo lo script cambiato. Non ho controllato se `quote-449` finisce fra i file che nessuno copre.

## 5. Dubbi per il PO

**Dubbio 1 — Cosa fare dello scarto sui pareggi (20,1% contro 26,4%)?**

1. **(consigliata) Lasciare i gol come sono e aprire una voce di sola misura sui pareggi.** È il passo prima di toccare qualunque cosa.
   - Si scompone il motore per capire dove si perdono i pareggi: forza relativa (pareggi per scarto di prestigio contro le quote
     reali per scarto di quota del bookmaker, che la stessa fonte contiene) e minuto in cui si rompe la parità.
   - La taratura si decide dopo, con la causa in mano.
   - Le goleade non vanno ritoccate: sono già sotto il reale.
2. **Accettare lo scarto e chiudere PO-645.** I gol medi (2,77 contro 2,88) e le goleade (14,0% contro 17,0%) sono vicini. Lo scarto
   dei pareggi resta dichiarato nella sonda, che lo stampa a ogni corsa.
3. **Tarare subito i pareggi con una manopola nella sola simulazione rapida**, sullo stampo del giro 347: per esempio gestione del
   vantaggio più forte nel finale, o forza relativa più stretta.
   - È più veloce.
   - Senza la causa misurata rischia di spostare anche i gol medi e la differenza fra forte e debole, contro la regola *No Blind Fix*.
4. **Allargare prima la fonte**: 3-5 stagioni (2019/20 → 2023/24, stesso sito, stesso formato) per avere una banda reale e non un
   punto. La sonda ha già il ricalcolo; basta aggiungere le stagioni.

**Dubbio 2 — La sonda deve diventare un guardiano con una banda reale?**

1. **(consigliata) Non ancora.** Prima si decide il Dubbio 1: una banda sui pareggi oggi sarebbe rossa dal primo giorno.
2. Sì, ma solo sui gol medi e sulle goleade, che oggi stanno vicini al reale. La banda andrebbe dichiarata dalla fonte (per esempio
   l'intervallo di più stagioni), mai abbassata.
3. Sì, su tutte e tre le quote, con il rosso dei pareggi messo in `ROSSI-DICHIARATI` finché non si decide il Dubbio 1.

**Dubbio 3 — Il confronto deve essere per lega?**

1. **(consigliata) No, solo sul totale.** Le leghe del motore non hanno uno stile proprio, e lo scarto fra Serie A (29,5% di pareggi)
   e Premier (21,6%) non ha un corrispondente nel motore.
2. Sì: dare a ogni lega del motore un suo carattere (gol, pareggi). È un cantiere di contenuto, non una verifica.
3. Confrontare per fascia di forza invece che per lega: la fonte ha le quote del bookmaker per partita. Questo si unisce all'opzione 1
   del Dubbio 1.
