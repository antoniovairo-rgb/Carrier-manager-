# Scheda Google Play — testi in italiano (bozza da incollare in Play Console)

> Giro 236 · PO-322 · 17/11/2026. Base: `STORE_LISTING.md` (roadmap 1.9), riletta e aggiornata.
> Limiti di caratteri usati: nome 30 · descrizione breve 80 · descrizione completa 4000 (sono i limiti scritti nei documenti
> di questo repository dal giro 116; non li ho riletti oggi sulla pagina Google: **verificarli nel modulo della Console**, che
> conta da solo). Il guardiano `npm run store-236` (controllo S5) misura i tre blocchi qui sotto.
> Tutto ciò che è «bozza» lo decide il PO: io non ho scelto nulla al posto suo.

## Nome dell'app

```
Korward Elite: Carriera Calcio
```

Alternative (stesso limite): `Korward Elite — Carriera` · `Korward Elite`.
Nota: il nome nell'app Android è «Korward Elite» (`twa/android`, `capacitor.config.json`); il nome della scheda può essere più lungo.

## Descrizione breve

```
Vivi la carriera di un calciatore: dalle giovanili ai grandi stadi. Decidi tu.
```

## Descrizione completa

```
Korward Elite è un simulatore di carriera calcistica in cui controlli un solo giocatore: il tuo. Dalla Primavera fino ai palcoscenici più importanti, ogni scelta — in campo e fuori — costruisce la tua storia.

⚽ LA TUA CARRIERA, LA TUA STORIA
Crea il tuo calciatore, scegli il volto e parti dai provini. Allenati, cresci, conquista la fiducia del mister e guadagnati il primo contratto da professionista.

🎮 I MOMENTI DECISIVI IN 3D
Le partite scorrono con la cronaca e si fermano sulle azioni che contano: leggi l'azione, scegli la giocata — tiro, dribbling, cross, passaggio filtrante, contrasto, rigore — e guarda la conseguenza in campo. Campionato, coppa nazionale, tornei europei e nazionale: ogni competizione si gioca.

📈 UNA CRESCITA CHE SI GUADAGNA
Statistiche, forma, morale, fatica, infortuni e recupero, rapporti con lo staff e con i compagni. Il posto da titolare non è regalato: si conquista con le prestazioni.

🏆 UNA VITA DA CALCIATORE
Calendario, classifiche, mercato e contratti, procuratore, obiettivi della stagione, premi individuali, record e un diario che racconta la tua avventura stagione dopo stagione.

📱 PENSATO PER IL TELEFONO
Schermate in verticale, comandi semplici, partite che puoi accelerare o simulare. Nessun account e nessuna registrazione.

🔒 RISPETTO PER TE
- Nessuna pubblicità.
- Nessun dato personale raccolto: i salvataggi restano sul tuo dispositivo, con esporta e importa.
- Nessun acquisto in app.

Scendi in campo. La tua carriera comincia ora.
```

Cosa ho tolto rispetto a `STORE_LISTING.md` e perché (decide il PO se rimetterlo):
- **«Tutti i nomi di club … sono di FANTASIA. Ogni eventuale riferimento … è puramente casuale.»** Con la decisione PO del 17/11
  («Tengo i miei nomi, rischio mio») alcuni nomi sono soprannomi o nomi vicini a quelli dei club veri (elenco in
  `docs/sviluppo/RAPPORTO-giro251.md`, «Copyright — scelta del PO»). Se la frase sia opportuna, o vada riscritta, lo dice il parere
  legale (vedi la checklist, passo 1). La stessa frase è nel piè di pagina di `privacy.html`: **non l'ho toccata**.
- «Funziona offline»: vale per il pacchetto Capacitor (gioco dentro l'app). La TWA carica il sito dalla rete al primo avvio e poi
  regge senza rete grazie al service worker (giro 120, sonda `sw-cache-120`). Non l'ho scritto per non promettere ciò che dipende
  dal pacchetto scelto.
- «Gratuito»: non lo scrivo io: il prezzo si imposta in Console (decisione del PO).

## Categoria (bozza)

| Campo Console | Proposta | Perché |
|---|---|---|
| Tipo di app | **Gioco** | `appCategory="game"` è già dichiarato nel manifest Android della TWA (giro 120) |
| Categoria | **Sport** (alternativa: Simulazione) | gioco di carriera calcistica |
| Tag | carriera, calcio, manager di un giocatore | da scegliere nell'elenco della Console |
| Email di contatto della scheda | `korward.devteam@gmail.com` | contatto del progetto (mai l'email personale del PO) |
| Sito web | `https://antoniovairo-rgb.github.io/Carrier-manager-/` | facoltativo |
| Informativa sulla privacy | `https://antoniovairo-rgb.github.io/Carrier-manager-/privacy.html` | raggiungibile oggi: HTTP 200, 5.274 byte, «Ultimo aggiornamento: 9 novembre 2026» (curl, 17/11/2026) |

## Classificazione dei contenuti (bozza delle risposte al questionario IARC)

Il questionario si compila **solo** in Play Console; le domande esatte le mostra la Console e non le ho lette oggi. Questa è la
bozza delle risposte, tratta da ciò che il gioco contiene davvero (misurabile nel repository):

| Tema | Risposta proposta | Da dove lo so |
|---|---|---|
| Violenza | No (contrasti di gioco del calcio, infortuni descritti a parole, nessun sangue) | contenuti delle partite e degli eventi |
| Paura / orrore | No | — |
| Linguaggio volgare | No — **da verificare dal PO**: i cori dei tifosi contengono proteste verso l'arbitro («Arbitro venduto!», «Vergogna!») | `src/08`, `CROWD_CHANTS` |
| Sesso / nudità | No | — |
| Droghe, alcol, tabacco | No (non trovato con una ricerca; **non posso confermare** l'assenza in ogni testo narrativo) | — |
| Gioco d'azzardo / scommesse simulate | No — **da verificare dal PO**: nel gioco esiste la parola «lotteria» per i rigori (`lotteria-191`), non è un gioco d'azzardo | `src/15` |
| Interazione fra utenti / chat | No | nessuna funzione online fra giocatori |
| Condivisione della posizione | No | nessun permesso di posizione |
| Acquisti digitali | No acquisti in app. **Da decidere dal PO:** il pulsante «Sostieni il progetto» (donazione PayPal, link esterno) è visibile anche nella plancia (screenshot 03/04) | `src/18`, nota di `USCITA-STORE-184.md` §4.6 |
| Pubblicità | No | nessun SDK pubblicitario |

Esito atteso: **non lo stimo io**. Il documento storico del giro 184 parlava di «PEGI 3 (stima del repo, non verificata)»: resta
una stima; il valore lo assegna il questionario.

## Pubblico di destinazione (bozza)

Proposta: **13 anni e oltre** oppure **18+**, scelta del PO. Motivo per non indicare fasce sotto i 13 anni: in quel caso la Console
applica i requisiti della sezione «Famiglie», che non ho letto oggi e che toccherebbero anche il pulsante delle donazioni.
**Non posso confermare** quale fascia convenga: è una decisione del PO.

## Sicurezza dei dati (bozza)

| Domanda | Risposta proposta | Prova |
|---|---|---|
| L'app raccoglie dati dell'utente? | No | `privacy.html` §1; build store con AI spenta e 0 richieste esterne (`twa-120`, `validate-dist`) |
| L'app condivide dati con terze parti? | No | idem |
| Crittografia in transito | non applicabile (nessun dato trasmesso) — **TWA**: il sito è servito in HTTPS da GitHub Pages | — |
| Eliminazione dei dati | i dati restano sul dispositivo; si cancellano disinstallando o cancellando i dati dell'app | `privacy.html` §2 |

⚠️ Se il PO pubblica la **TWA**, il gioco viene scaricato dal sito (GitHub Pages): GitHub, come ogni server, registra le richieste.
Se questo vada dichiarato nella sezione «Sicurezza dei dati» **non posso confermarlo**: da rileggere nella Console col testo delle
domande davanti.
