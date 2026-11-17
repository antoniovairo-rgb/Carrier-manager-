# Checklist Play Console — i passi che SOLO il PO può fare (test chiuso)

> Giro 236 · PO-322 · 17/11/2026. Nessun passo qui sotto è stato fatto dalla sessione: niente account, niente accesso alla Console,
> niente credenziali, niente chiavi, niente invii a Google. L'ordine è una proposta; i tempi di Google non li garantisco.

## ⚠️ Prima di tutto

1. **Parere legale sui nomi dei club prima di pubblicare.** Per decisione del PO del 17/11 («Tengo i miei nomi, rischio mio») molti
   nomi sono soprannomi o nomi vicini ai club veri (FC Nerazzurri, FC Rossoneri, FC Partenope, FC Zebre, FC Hammers, FC Goodison… —
   elenco completo in `docs/sviluppo/RAPPORTO-giro251.md`, sezione «Copyright — scelta del PO»). Il controllo copyright del gioco è a
   0 segnalazioni **perché quelle voci sono state tolte dalla lista per scelta del PO**, non perché i nomi siano lontani dai club
   reali. Io non valuto se siano ammessi: non sono un legale e non ho consultato registri dei marchi. Le norme dello store, come le
   scrive Google nella pagina «Proprietà intellettuale» della Guida di Play Console
   (https://support.google.com/googleplay/android-developer/answer/9888072, letta il 17/11/2026, nessuna data di aggiornamento
   indicata), sezione «Violazione dei marchi», testualmente:
   - «Le app che violano i marchi di altre persone sono vietate.»
   - «Se l'app utilizza marchi di un'altra parte in un modo che rischia di creare confusione, tale app potrebbe essere sospesa.»

   La stessa pagina dice che gli sviluppatori devono assicurarsi che i contenuti siano opera propria o di avere le licenze
   necessarie, e fra gli esempi di violazione cita i loghi di squadre sportive professionali (riportato in sintesi, non alla
   lettera). Non aggiungo interpretazioni. Da portare al legale anche: la frase «nomi di fantasia» nella descrizione storica
   (`STORE_LISTING.md`) e nel piè di pagina di `privacy.html`, che **non ho toccato**.

## Poi, in ordine

2. **Scegliere il pacchetto**: Capacitor offline (gioco dentro l'app, ~105 MB al giro 116) oppure TWA (sito in un guscio, ~4 MB).
   Stessa identità `com.korward.elite`: se ne carica uno solo, per sempre con quell'ID. Dettagli in `PACCHETTO.md`.
3. **Decidere sul pulsante «Sostieni il progetto»** (donazione PayPal, link esterno) nella versione store: tenerlo o toglierlo. Le
   regole Google sui pagamenti per questo caso **non le ho rilette oggi** (rischio segnalato al giro 184, §4.6).
4. **Account sviluppatore Google Play**: crearlo o verificarlo con la propria identità; capire se è «personale» o «organizzazione».
   Se è personale e creato dopo il 13/11/2023, prima della produzione servono **almeno 12 tester per 14 giorni consecutivi** nel test
   chiuso (requisito letto il 07/11/2026, pagina answer/14151465, citato in `TESTER_ONBOARDING.md`; non riletto oggi).
5. **Chiave di caricamento**: crearla sul proprio PC, custodirne una copia; **mai** nel repository (segnaposto in `PACCHETTO.md`).
6. **Costruire e firmare l'AAB** (Android Studio o workflow GitHub con i 4 segreti `ANDROID_KEYSTORE_BASE64`, `…_PASSWORD`,
   `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`). Controllare `targetSdk 36` (comando in `PACCHETTO.md`).
7. **Creare l'app in Console**: nome «Korward Elite», lingua predefinita italiano, tipo **Gioco**, gratuita/a pagamento (decisione PO).
8. **Primo caricamento** dell'AAB in un **test interno**, poi nel **test chiuso**; attivare **Play App Signing** al primo caricamento.
   Solo TWA: leggere l'impronta SHA-256 della firma Google e pubblicare `assetlinks.json` (proposta in `USCITA-STORE-184.md` §10.5),
   altrimenti il gioco si apre con la barra dell'indirizzo.
9. **Contenuti dell'app** in Console — bozze pronte in `SCHEDA-PLAY.md`:
   informativa privacy `https://antoniovairo-rgb.github.io/Carrier-manager-/privacy.html` · annunci: no · accesso all'app: nessun
   login · classificazione dei contenuti (questionario IARC) · pubblico di destinazione · sicurezza dei dati · categoria.
10. **Scheda dello store**: nome, descrizione breve e completa (`SCHEDA-PLAY.md`), icona 512, grafica 1024×500, screenshot telefono
    (`IMMAGINI.md`), email di contatto `korward.devteam@gmail.com`.
11. **Tester**: lista email o gruppo Google, link di adesione col pacchetto `com.korward.elite` (`TESTER_ONBOARDING.md`).
12. **Prova su un telefono vero** durante il test: avvio, salvataggi, partita 3D, tasto Indietro, verticale, senza rete.
13. Dopo i 14 giorni (se richiesti): **richiesta di accesso alla produzione** e pubblicazione. Tempi di revisione di Google: **non
    posso confermarli**.

## Cosa trova già pronto nel repository

| Cosa | Dove | Verifica |
|---|---|---|
| Testi della scheda, categoria, bozze IARC / pubblico / sicurezza dati | `docs/store/SCHEDA-PLAY.md` | `store-236` S5 |
| Elenco immagini + 5 screenshot 9:16 | `docs/store/IMMAGINI.md`, `docs/store/screenshots/` | `store-236` S3 |
| Permessi e motivazione | `docs/store/PERMESSI.md` | lettura dei manifest |
| Pacchetto e firma (segnaposto) | `docs/store/PACCHETTO.md` | `store-236` S1, S7 |
| Informativa privacy raggiungibile | `privacy.html` (HTTP 200 il 17/11/2026), contatto `korward.devteam@gmail.com` | `store-236` S4 |
