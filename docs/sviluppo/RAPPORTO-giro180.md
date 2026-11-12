# Rapporto giro 180 — clip Anderson Rohr (PO-367) — **FERMO: lo scaricamento chiede un'email**

Ramo `sviluppo/giro180-animazioni-rohr`, partito da `lavoro/191` (`13fa539`). Data: **12/11/2026, ~11:20 ora di Roma**.
Decisione PO di riferimento (12/11): «Usa il pacchetto Anderson Rohr» (pack 05 Soccer + pack 04 Crowd Reactions per le esultanze sobrie).

## In una riga

**Non ho importato nessuna clip.** Il pacchetto si ottiene solo passando dal carrello Gumroad a prezzo 0, e il
carrello chiede un **indirizzo email** (protetto da reCAPTCHA di Google). Il vincolo duro del giro dice di
fermarsi: mi sono fermato prima di scrivere qualsiasi cosa nel modulo. Serve che **il PO scarichi lui** i due
pacchetti; poi il giro 180 si può rifare da capo con i file in mano.

## 1. Cosa chiede lo scaricamento (verificato il 12/11/2026)

| Passo | Pagina | Cosa chiede |
|---|---|---|
| 1 | <https://andersonrohr.gumroad.com/l/mocap_pack5> (pack 05) e <https://andersonrohr.gumroad.com/l/mocap_pack4> (pack 04) | Prezzo «$0+». Testo della pagina: «It's free (just enter 0 and add it to the cart).» Pulsante «I want this!» |
| 2 | Il pulsante porta a `https://gumroad.com/checkout?product=vqlel&quantity=1&price=0` (pack 05) e `…?product=muxdl…` (pack 04) | Modulo «Checkout»: totale **US$0**, un solo campo **«Email address»** e il pulsante **«Get»**; sotto: «This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.» |

Come l'ho verificato: pagina prodotto letta con `curl`; pagina del carrello aperta in Chromium headless in
sola lettura, elencando i campi del modulo (`input type=email` + `g-recaptcha-response`). **Non ho scritto
nulla nel campo email, non ho premuto «Get», non ho accettato termini.** Non ho provato se il modulo accetti
un'email vuota: per saperlo avrei dovuto premere «Get», cioè inviare un ordine (accettazione dei termini
Gumroad) e far partire il reCAPTCHA.

⚠️ Da dichiarare: **aprire** la pagina del carrello carica da sé lo script reCAPTCHA di Google (lo dice la
pagina stessa). Non ho inviato dati miei né del PO, ma il semplice caricamento della pagina ha contattato
Google come fa per ogni visitatore. Le foto del carrello stanno solo nello scratchpad della sessione, non nel
repo (la pagina non dichiara una licenza per le proprie immagini, stessa regola del giro 179).

Fonti alternative senza email (specchi, ricaricamenti di terzi): **non le ho cercate né usate** — sarebbero
proprio la ridistribuzione che la licenza vieta, e la decisione PO riguarda il pacchetto originale.

## 2. Licenza riletta alla fonte (12/11/2026)

Testo **identico** sulle due pagine, sezione «Licensing», copiato parola per parola:

> This pack can be used for free in both personal and commercial projects.
> Attribution is not required, but feel free to tag me (my socials: https://linktr.ee/andersonrohr). I'd love to see what you create with it.
> **You may not redistribute, resell, or repackage this pack as a standalone product.**

Descrizione (entrambe): «This pack is part of a series of free motion capture packs for the community. You can
use it in your games, cinematics, 3D/VFX , or any other creative work.»

- **Credito nel gioco:** la licenza dice «Attribution is not required» → **non richiesto** (confermato quanto
  scritto dal giro 179). Una riga di cortesia nei Crediti resta una scelta, non un obbligo.
- **Rischio repo pubblico:** invariato rispetto al 179 §3.2 (il GLB convertito sarebbe scaricabile da
  `raw.githubusercontent.com`); il PO lo ha accettato il 12/11. Da registrare in `CREDITI-fonti.md` **quando**
  le clip entreranno — oggi non c'è nulla da registrare.

Dati tecnici dalla pagina (non verificati sui file, che non ho):

| | pack 05 Soccer | pack 04 Crowd Reactions |
|---|---|---|
| Animazioni | 21 | 22 |
| Durata totale dichiarata | 5 min 55 s | 5 min 55 s (⚠️ identica al pack 05: possibile copia sulla pagina, Non posso confermarlo) |
| Formato · scheletri · fps | FBX · Rokoko Default, iClone, Manny (UE5) · 60 fps | uguale |
| Identificativo prodotto Gumroad | `vqlel` | `muxdl` |
| Clip che il giro 180 doveva prendere — presenti nell'elenco | 08_Side_Foot_Kick · 09_Power_Kick · 10/11_Penalty_Kick_01/02 · 12/13/14_Goal_Celebration_01..03 · 18/19_Defending_01/02 (**tutte presenti**) | 03_Clapping_Hands_Up · 05_Fist_Up_Cheering · 17_Pointing_Up_Cheering (**tutte presenti**) |

## 3. Tabella per il PO

| Clip | Cosa dovrebbe mostrare (dal nome) | Usabile? | Foto |
|---|---|---|---|
| 08_Side_Foot_Kick | tiro di piatto | **non valutata** — file non scaricato | — |
| 09_Power_Kick | tiro di collo | non valutata | — |
| 10_Penalty_Kick_01 · 11_Penalty_Kick_02 | rigore | non valutata | — |
| 12/13/14_Goal_Celebration_01..03 | esultanze | non valutata | — |
| 18_Defending_01 · 19_Defending_02 | difesa | non valutata | — |
| 05_Fist_Up_Cheering · 17_Pointing_Up_Cheering · 03_Clapping_Hands_Up (pack 04) | esultanze sobrie | non valutata | — |

## 4. Cosa NON è stato fatto (e perché)

Punti 1-5 del mandato: **nessuno eseguito**, tutti dipendono dai file.
- Nessun `assets/cgtrader-clip-rohr.glb`, nessuna foto in `docs/sviluppo/giro180/`, nessuna misura di piedi/compenetrazioni.
- Nessuna riga in `CLIP_REGISTRY.md` / `CREDITI-fonti.md` (registrare una clip che non c'è sarebbe falso).
- Nessun guardiano `clip-180` (senza file non ha nulla da guardare; scriverlo vuoto lo farebbe passare a vuoto).
- **Nessuna modifica a `src/` né ad `assets/`**, `GAME_VERSION` non toccata → `build-src`/`check-src`,
  `design-system`, `test:logic`, `save-compat`, `validate-dist` **non eseguiti**: il ramo aggiunge solo questo
  rapporto, nessun byte del gioco cambia. Roadmap non aggiornata: non c'è una versione che parte.

## 5. Per ripartire (quando il PO avrà i file)

1. Il PO scarica dal proprio browser i due pacchetti (pagine del §1, prezzo 0, la sua email o quella di squadra
   `korward.devteam@gmail.com` — scelta sua) e li mette a disposizione della sessione **fuori dal repo**
   (es. allegati alla sessione o una cartella condivisa), scegliendo lo scheletro **Manny (UE5)**, il più
   vicino al nostro.
2. Annotare data dello scaricamento e sha256 dei file sorgente (andranno nel registro, modello `assets/audio/LICENZE.json`).
3. Rifare il giro 180 dal punto 1 del mandato. Nota tecnica già nota dal 179 §2: in queste sessioni **`bpy`
   (Blender) non è installato**; il passaggio FBX → GLB va o fatto dove c'è Blender, o con un convertitore
   FBX installabile dai registri di pacchetti (da verificare in quel giro: Non posso confermarlo che esista
   uno strumento adatto senza Blender).

## 6. Domande per la sessione madre

1. Chi scarica i pacchetti e con quale email (PO o casella di squadra)? Decisione del PO, io non l'ho presa.
2. Dove consegnare i file sorgente alla sessione del giro 180-bis, visto che **non devono entrare nel repo**?
3. Va bene che il riadattamento (FBX → GLB) si faccia in una sessione con Blender, o si vuole tentare un
   convertitore senza Blender (da verificare)?
