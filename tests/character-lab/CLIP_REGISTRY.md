# Registro delle clip — corpi CGTrader dell'eroe

Aperto il 26/09 su mandato PO («colmare i gap dei gesti»). Una riga per clip. Una clip entra nel gioco solo con: retarget (`tools/retarget_cgtrader_clip.py`), cancello anatomico, provino (`tests/visual/provino-clip.html`), riga in `BRAIN_GESTI`/`GESTI`, guardiano e flag rosso `__CPM_NO_*`.

**Licenze — stato (verificato 27/09, fonti sotto):**

| Pacchetto | Cosa dice la licenza (citazione) | Fonte | Esito per il gioco |
|---|---|---|---|
| CGTrader, corpi + 33 clip (acquisto «Realistic Soccer Player v2 rigged»; **comprato dal PO, 20 € il pacchetto**, conferma PO 27/09) | Uso consentito «as part of a game if the Product is contained inside a proprietary format and displays inside the game during play», a condizione che il prodotto «is not downloadable by users … in the form in which it is downloaded from the Site»; «resale or redistribution … is expressly prohibited unless it is an Incorporated Product». | [CGTrader, Terms and Conditions — Royalty Free License](https://www.cgtrader.com/pages/terms-and-conditions) | Uso nel gioco: **sì**. Che il listino di quel prodotto sia «Royalty Free» e non «Editorial»: **non posso confermarlo** (la pagina del prodotto non l'ho letta). |
| Mixamo (54 clip, dalla cartella Drive del PO) | Personaggi e animazioni «royalty free for personal, commercial, and non-profit projects, including creating video games»; non si possono distribuire i file grezzi né usarli per addestrare modelli di apprendimento automatico. | FAQ Adobe [helpx.adobe.com/creative-cloud/faq/mixamo-faq.html](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) (dal controllo automatico risponde 403: testo letto tramite il motore di ricerca e il [forum ufficiale Adobe](https://community.adobe.com/questions-696/mixamo-faq-licensing-royalties-ownership-eula-and-tos-589400)) | Uso nel gioco: **sì**, se le clip restano incorporate. |

**⚠️ Rischio aperto, decisione del PO:** il repository `antoniovairo-rgb/Carrier-manager-` è **pubblico** (API GitHub: `"visibility": "public"`, verificato il 27/09). I GLB in `assets/` (corpi CGTrader, `cgtrader-clip-mixamo.glb`) si scaricano come file a sé, per esempio da `raw.githubusercontent.com/.../assets/cgtrader-clip-mixamo.glb` (risposta 200). Entrambe le licenze vietano la distribuzione dei file grezzi. I nostri GLB sono convertiti e adattati, non il file originale. Se questo basti a rispettare le licenze: **non posso confermarlo**, serve un parere. Strade possibili, tutte da decidere col PO:
1. repository privato: su GitHub Pages cambia il piano, da verificare;
2. asset fuori dal repository pubblico, in un archivio privato caricato dalla build;
3. parere scritto di CGTrader/Adobe.

**Decisione PO (questionario 27/09): «Lascia com'è».** Il PO accetta il rischio così com'è. Registrato qui come decisione del PO, non come verifica di conformità.

**Regola del lotto:** le nuove clip del lotto P1-a vengono da pacchetti già presenti, quindi non aggravano il rischio (stessi file), ma non ne aggiungo di nuovi da fuori finché il PO non decide.

## Inventario (letto dai file GLB, 26/09)

| File | Clip | In uso oggi | Mai usate |
|---|---|---|---|
| `assets/cgtrader-review-lod{0,1,2}-kit-adapter.glb` | 33 ciascuno | 24 (idle, jog, jog-back, strafe ×2, kick, penalty, header, slide-tackle, tackle, volley, receive, dribble, pass, change-direction, missed-chance, throwin, gk ×7, look-over-shoulder solo in mappa, sit-clap in panchina) | walk, running, jogging, recovery-run, run-look-back, running-to-turn, opening, sit-to-stand |
| `assets/cgtrader-clip-mixamo.glb` (3,0 MB) | 54 | 18 + `kick~m` specchiata (cadute ×3, rovesciata, tackle ×3, portiere ×10) | header-soccerball ×2, kick-soccerball ×2 (solo tabella contatti), kick-up-soccerball, kneeing-soccerball ×2, stall-soccerball ×4, receive-soccerball, strike-foward-jog, soccer-penalty-kick, throw-in, offensive-idle, transition, jog (7 direzioni), goalkeeper-directing ×2, placing-ball ×2, scoop, sidestep ×2, miss |
| — | `celebrate` | **chiamata dal codice ma assente in tutti i pacchetti** → esultanza senza clip sul corpo CGTrader | — |

## Clip in lavorazione

| Nome interno | Voce catalogo | Fonte | Licenza | Strada | Cancello | Provino | Peso | Righe BRAIN_GESTI/GESTI | Guardiano / rosso |
|---|---|---|---|---|---|---|---|---|---|
| (lotto P1-a da aprire) | I1, A1, A5, B2, G1, A7/I3, L4 | pacchetti già nel progetto | da verificare | esistente / specchiata | — | — | — | — | — |
