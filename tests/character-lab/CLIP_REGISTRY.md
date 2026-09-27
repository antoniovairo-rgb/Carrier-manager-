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

## Provino delle clip in casa (27/09, `tests/visual/provino-lotto.mjs` → `tests/character-lab/provini-p1a/`)
| Clip | Cosa si vede sul corpo di gioco | Esito |
|---|---|---|
| `opening` (CGTrader) | un gesto col braccio e uno sguardo al polso | ❌ non è un'esultanza |
| `running`, `walk`, `jogging` (CGTrader) | corsa/camminata pulite | 🟡 per il lotto «scatto/camminata» |
| `run-look-back` (CGTrader) | corsa guardandosi alle spalle | 🟡 per lo scanning |
| `mx-stall-soccerball` | palleggio di coscia e piede | 🟡 per il controllo di coscia (non di petto) |
| `mx-goalkeeper-directing` | il corpo esce dal quadro dopo il primo istante | ❌ inutilizzabile così com'è |
| `kick`, `pass` | calciano col **sinistro** (picco del piede 8,3 e 5,3 contro 0,5 e 1,1) | base del mancino |
| `penalty` | **destro** (14,3 contro 9,4) | base del destro |
| `volley` | incerto (destro 12,3 contro sinistro 10,3) | escluso dalla scelta del piede |

## Clip in uso da questa release (7.999.31)
| Nome interno | Voce catalogo | Fonte | Licenza | Strada | Cancello | Provino | Peso | Righe | Guardiano / rosso |
|---|---|---|---|---|---|---|---|---|---|
| `mx-victory` | I1 esultanza (braccia al cielo) | FBX dal PO 27/09 «Victory.fbx», Creator «Mixamo, Inc.», **già sullo scheletro CGTrader** | Mixamo (vedi sopra) | estratta con Blender (`bpy` 4.2), tolte le tracce di `root` (scala 0,01) | non serve (stesso scheletro, stesse unità: tracce confrontate) | `provini-p1a/mx-victory.png` | 4,5 s | gesto `lift` quando il corpo non ha `celebrate` | `esultanza-braccia-test.mjs` · `__CPM_NO_ESULTA31` |
| `mx-victory-jump` | I1 esultanza (salto a braccia alzate) | FBX dal PO «Victory_Idle.fbx», Mixamo | Mixamo | come sopra | come sopra | `provini-p1a/mx-victory-idle.png` | 1,9 s | variante di `lift` | come sopra |
| `pass~m`, `penalty~m` | L4 piede | specchio delle clip CGTrader (`_specchiaClip23`) | CGTrader | specchio | errore di specchio in `__CPM_SPECCHIO23` | — | 0 (in memoria) | scelta dal piede per l'eroe | `piede-preferito-test.mjs` · `__CPM_NO_PIEDE31` |

| `mx-fist-pump` | I1 esultanza SOBRIA (ginocchio su e pugno, poi braccio al cielo) | FBX dal PO «Golf Putt Victory», Mixamo, **ritagliato 4,3-8,0 s** (via il colpo da golf) | Mixamo | Blender, striscia NLA 129-240 | come sopra | `provini-p1a/mx-golf-putt-victory.png` (24 istanti) | 3,7 s | variante di `lift` SOLO per il piano `contained` (7.999.32) | `esultanza-braccia-test.mjs` |
| `mx-defend-ready` | G/difesa: attesa in marcatura | FBX dal PO «Goalkeeper Idle», Mixamo (idea del PO) | Mixamo | Blender | come sopra | `provini-p1a/mx-gk-idle-po.png` | 4,6 s | seconda posa ferma di ogni corpo, pesata su chi difende nella scena (7.999.32) | `attesa-difesa-test.mjs` · `__CPM_NO_ATTESA32` |

File (dal 7.999.32): `assets/cgtrader-clip-po.glb`, 477 KB, quattro clip (sostituisce `cgtrader-clip-esultanze.glb` della 7.999.31).
In prova, non ancora collegate: `Receive Soccerball` (controllo di coscia, tratto 2,2-3,0 s), `Soccer Header` (testa da fermo: contatto da misurare), `Jog Forward` (corsa: da tarare sulla cadenza). Scartate dal PO-pacchetto: «Golf Putt Victory» (contiene un colpo da golf), «Victory_1» (8,6 s, mani alla testa: tenuta di riserva, non collegata).
Riserva: se la clip manca, le braccia al cielo si fanno proceduralmente (stesso metodo del cartellino).

## Clip da cercare (per il PO) — tutte su Mixamo, scaricate **sul nostro personaggio** (come «Victory»), FBX, 30 fps, «In Place» quando c'è la spunta
1. **Esultanze:** «Knee Slide» o «Sliding» (scivolata in ginocchio), «Chest Pound»/«Fist Pump», «Cheering», «Happy Hand Gesture», «Pointing» (dito al cielo o verso la curva), «Clapping» (applauso ai compagni).
2. **Rammarico:** «Disappointed», «Defeated», «Head Hit»/«Frustration», «Rejected».
3. **Controlli di palla:** «Chest Trap»/«Soccer Chest Control», «Soccer Trap», «Receive Soccer Ball» varianti.
4. **Scatto e corsa:** «Sprint», «Fast Run», «Running Turn»; «Walking» lenta per i momenti morti.
5. **Pressione e difesa:** «Defensive Idle», «Soccer Pass Block», «Jockeying» (passi laterali marcando), «Goalkeeper Directing» nuova versione (la nostra esce dal quadro).
6. **Proteste e chiamate:** «Arguing», «Yelling», «Waving» (chiamare palla), «Shrug».
7. **Colpo di testa in tuffo:** «Diving Header» / «Soccer Header» con salto.
8. **Infortunio e caduta:** «Injured Idle», «Hurting», «Falling Back».
⚠️ I nomi sono **indicativi** (parole da cercare): non posso confermare che su Mixamo esistano con quel nome esatto. Per ognuna: il FBX va bene così com'è; controllo io durata, scheletro, provino, piede e cancello prima di collegarla.

## Clip in lavorazione

| Nome interno | Voce catalogo | Fonte | Licenza | Strada | Cancello | Provino | Peso | Righe BRAIN_GESTI/GESTI | Guardiano / rosso |
|---|---|---|---|---|---|---|---|---|---|
| (lotto P1-a da aprire) | I1, A1, A5, B2, G1, A7/I3, L4 | pacchetti già nel progetto | da verificare | esistente / specchiata | — | — | — | — | — |
