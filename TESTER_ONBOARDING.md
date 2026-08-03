# TESTER_ONBOARDING.md — reclutare e istruire i 12 tester del test chiuso

> Serve per soddisfare il requisito Google Play del **test chiuso** (account sviluppatore personale:
> ≥12 tester iscritti per 14 giorni consecutivi prima di poter passare in produzione).
> ⚠️ Il numero e la durata esatti sono quelli che la **Play Console** mostra sul TUO account nella
> schermata *Test → Test chiuso*: quella è la fonte autorevole, non questo file.

---

## 1. Prima di scrivere a chiunque (10 minuti in Console)

1. **Play Console → Crea app** (nome, lingua, gioco, gratuita).
2. **Test → Test chiuso → Crea una release.** Carica l'AAB (vedi `PACKAGING.md`).
3. **Tester:** crea un elenco di indirizzi email, oppure — più comodo — un **Gruppo Google**
   (`groups.google.com`, gruppo privato) e incolla l'indirizzo del gruppo. Così aggiungi o togli
   persone senza ricaricare nulla.
4. Copia il **link di partecipazione** (`https://play.google.com/apps/testing/com.elevora.football`).
   È quello che manderai.

Il conteggio dei 14 giorni parte da quando i tester **si iscrivono**, non da quando finisci lo
sviluppo → manda gli inviti **subito**, e continua a pubblicare aggiornamenti sulla stessa traccia.

---

## 2. Chi cercare

Servono **12 account Google distinti**, ciascuno con un dispositivo Android. Non serve che giochino
per ore: conta che restino iscritti e che l'app venga aperta almeno qualche volta.

Dove trovarli, in ordine di efficacia reale:

- **amici, parenti, colleghi** con un telefono Android (la via più veloce: 12 messaggi);
- gruppi WhatsApp/Telegram di persone che ti conoscono;
- eventuali amici appassionati di calcio o di manageriali — sono anche i migliori come feedback.

⚠️ **Da evitare:** i gruppi di «scambio tester» tra sviluppatori e i servizi a pagamento che
promettono i 12 iscritti. Funzionano, ma sono esattamente il pattern che Google controlla, e un
test palesemente finto può costare la review. Con 12 persone vere si risolve in una serata.

---

## 3. Il messaggio da inoltrare

> Ciao! Ho scritto un gioco per Android — **Elevora**, un simulatore di carriera calcistica: controlli
> un solo giocatore, dalle giovanili fino ai grandi stadi, e ogni scelta dentro e fuori dal campo
> costruisce la sua storia. È gratis, senza pubblicità e senza acquisti.
>
> Per poterlo pubblicare mi serve un gruppo di persone che lo provino per due settimane. Ti va di
> darmi una mano? Sono 3 minuti:
>
> 1. apri questo link **dal telefono Android**, con l'account Google che usi sul Play Store:
>    👉 `<LINK DI PARTECIPAZIONE>`
> 2. tocca **«Diventa tester»**;
> 3. tocca il link *«Scarica su Google Play»* che compare subito sotto e installa l'app.
>
> Poi basta che tu la tenga installata per due settimane e ci giochi ogni tanto. Se noti qualcosa
> che non va — o che semplicemente non ti piace — scrivimelo pure: mi serve davvero.
>
> Grazie! 🙏

**Se qualcuno non trova l'app su Play:** succede, ci vogliono fino a un paio d'ore perché l'iscrizione
si propaghi. Basta riprovare più tardi dallo stesso link.

**Se qualcuno ha un iPhone:** purtroppo non può partecipare, il test è solo Android.

---

## 4. Cosa chiedere di segnalare

Da mandare come secondo messaggio, o da mettere in fondo al primo. Sono i punti dove il gioco ha
più superficie e dove un occhio esterno vede cose che noi non vediamo più:

- **all'avvio:** quanto ci mette ad aprirsi, e se resta bloccato su una schermata;
- **in partita 3D:** scatti, cose che si vedono male, giocatori che fanno movimenti strani;
- **testi:** frasi sbagliate, ripetitive o fuori contesto («questa cosa non c'entra niente»);
- **numeri che non tornano:** classifiche, gol, stipendi, età — tutto ciò che sembra assurdo;
- **la sensazione generale:** è troppo facile? troppo difficile? noioso in qualche punto?

E soprattutto: **modello di telefono + versione Android**, altrimenti i problemi di prestazioni non
sono riproducibili.

Il canale più comodo è un gruppo WhatsApp/Telegram dedicato: uno screenshot vale dieci righe di
descrizione.

---

## 5. Controllo dei requisiti

In **Play Console → Test → Test chiuso** trovi il contatore degli iscritti e i giorni trascorsi.
Guardalo una volta a settimana: se qualcuno si è disiscritto o ha cambiato telefono il conteggio
può scendere, e conviene accorgersene prima della fine dei 14 giorni — non dopo.

Tieni **2-3 tester di riserva** oltre ai 12: qualcuno cambia idea, e ripartire da capo con il
conteggio è la cosa più fastidiosa che possa succedere in questa fase.
