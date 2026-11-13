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

**Originali CGTrader tolti dal repo (giro 184, 13/11/2026, PO-374, decisione PO 12/11 «Toglierli dal repo»):** la cartella `assets/source/cgtrader-soccer-player/originals/` (FBX, OBJ/MTL, GLB parziali del pacchetto) e `TEXTURES.zip` non sono più nell'albero né nel sito; restano nei commit vecchi (nessun force push, decisione PO) e il PO li conserva nel suo acquisto CGTrader. Verificato prima di toglierli: nessuna riga di `src/`, `tools/` o dei guardiani li apre, e caricando il gioco (home, plancia, partita, GLB acceso) il browser non li chiede mai. Nel gioco restano solo i GLB convertiti in `assets/`. Guardiano `npm run licenze-184`. Restano in `assets/source/` il puntatore LFS `BLENDER+RIG.blend` e `CHARACTER.glb` (fuori dalla decisione: dubbio nel rapporto giro 184).

**Regola del lotto:** le nuove clip del lotto P1-a vengono da pacchetti già presenti, quindi non aggravano il rischio (stessi file), ma non ne aggiungo di nuovi da fuori finché il PO non decide.

## Anderson Rohr — `assets/cgtrader-clip-rohr.glb` (giro 180b, 12/11/2026)

**Giro 184 (180d, 13/11/2026):** il file ha ora **28 clip** (3,30 MB). La correzione delle mani resta solo dove abbassa il massimo del cancello (5 clip: goal-celebration-02, juggling-02, clapping-hands-up, hands-up-looking-up, standing-selfie), spenta sulle altre; rientrano `rohr-defending-01` (28,58°), `rohr-goalkeeper-save-03` (28,34°), `rohr-dribble-03` (28,94°) e `rohr-juggling-03` (anello di 4,7 s, 24,74°); `rohr-swaying-arms` sul tratto più mosso (3,4 s). Elenco e opzioni: `tools/rohr-180/clip-184.txt`; misure per clip in `docs/sviluppo/RAPPORTO-giro184.md`. La tabella qui sotto è quella del 180c (storica).

| Pacchetto | Cosa dice la licenza (citazione, riletta alla fonte il 12/11/2026) | Fonte | Esito per il gioco |
|---|---|---|---|
| Anderson Rohr, «Free mocap pack 05: Soccer» e «Free mocap pack 04: Crowd Reactions» (**scaricati dal PO il 12/11**, prezzo 0) | «This pack can be used for free in both personal and commercial projects. Attribution is not required, but feel free to tag me (my socials: https://linktr.ee/andersonrohr). I’d love to see what you create with it. You may not redistribute, resell, or repackage this pack as a standalone product.» | [andersonrohr.gumroad.com/l/mocap_pack5](https://andersonrohr.gumroad.com/l/mocap_pack5), [/l/mocap_pack4](https://andersonrohr.gumroad.com/l/mocap_pack4) | uso nel gioco permesso; **rischio repo pubblico accettato dal PO il 12/11** (stesso rischio di CGTrader/Mixamo). Originali (FBX, zip, PDF) mai nel repo né in `dist/` |

Sorgente: FBX scheletro «UE5» (Manny, 79 ossa, 60 fps). Conversione e riadattamento: `tools/rohr-180/riadatta_rohr.py` (Blender 5.3
come modulo Python `bpy`, da PyPI) → 30 fps, scheletro CGTrader a 75 ossa, solo animazioni. Il primo fotogramma di ogni FBX è una
posa di riferimento ed è escluso. Provini: `docs/sviluppo/giro180/` (`npm run clip-180-foto`). Guardiano: `npm run clip-180`.
**Nessuna clip è collegata a un gesto** (nessuna riga in `GESTI`/`BRAIN_GESTI`, nessun flag `__CPM_NO_*`): restano da fare i
passi del rito sopra quando la sessione madre deciderà quali usare.

**Giro 180c (12/11/2026):** correzione delle mani (IK del braccio rispetto alla spalla), cancello invariato; anelli di 3-4 s per
pubblico e palleggi; coda del tiro di collo tagliata; ginocchia della scivolata sul suolo. Dettaglio e giudizi nel rapporto
`docs/sviluppo/RAPPORTO-giro180.md` §180c. Il file è **fuori da `dist/`** finché il gioco non lo carica.

| Clip nel GLB | FBX sorgente (sha256, primi 16) | Durata | Cancello prima della correzione mani (mediana/max) | Dopo | Nel file |
|---|---|---|---|---|---|
|`rohr-side-foot-kick`|08_Side_Foot_Kick_ue5 (`e2baf0928c0f5da7…`)|4,5 s|3,77° / 18,27°|3,77° / 19,58°|sì|
|`rohr-power-kick`|09_Power_Kick_ue5 (`2dcadd8d78b58469…`)|2,6 s|5,06° / 16,78°|5,06° / 18,49°|sì|
|`rohr-goal-celebration-01`|12_Goal_Celebration_01_ue5 (`3d33fb8ebba86261…`)|3,467 s|4,05° / 21,23°|4,05° / 22,49°|sì|
|`rohr-goal-celebration-02`|13_Goal_Celebration_02_ue5 (`b43fae915f4244bc…`)|3,5 s|1,42° / 6,17°|1,33° / 5,13°|sì|
|`rohr-goal-celebration-03`|14_Goal_Celebration_03_ue5 (`64508912d21cea94…`)|3,167 s|4,19° / 22,46°|4,28° / 23,24°|sì|
|— (rohr-defending-01)|18_Defending_01_ue5 (`ed9789d1c8f4cb49…`)|6,233 s|7,45° / 28,58°|7,53° / 33,31°|**no**|
|`rohr-clapping-hands-up`|03_Clapping_Hands_Up_ue5 (`0174b0b26b952522…`)|3,9 s|3,35° / 8,43°|3,35° / 7,32°|sì|
|`rohr-fist-up-cheering`|05_Fist_Up_Cheering_ue5 (`7bf69a418c9dbb07…`)|3,7 s|3,72° / 16,2°|3,72° / 17,2°|sì|
|`rohr-pointing-up-cheering`|17_Pointing_Up_Cheering_ue5 (`ef5b6c2fc3cf941e…`)|4 s|3,46° / 15,52°|3,47° / 18,85°|sì|
|— (rohr-penalty-kick-01)|10_Penalty_Kick_01_ue5 (`4bd04c128d1f36d3…`)|10,533 s|4,88° / 30,33°|4,88° / 31,62°|**no**|
|— (rohr-penalty-kick-02)|11_Penalty_Kick_02_ue5 (`045c5bea65085b93…`)|8,733 s|5,36° / 39,78°|5,36° / 41,46°|**no**|
|— (rohr-defending-02)|19_Defending_02_ue5 (`af5f864fc7ec475b…`)|8,45 s|7,71° / 35,6°|7,64° / 39,36°|**no**|
|`rohr-goalkeeper-save-01`|15_Goalkeeper_Save_01_ue5 (`1e265d0fe409b2df…`)|7,167 s|7,38° / 27,34°|7,38° / 28,79°|sì|
|`rohr-goalkeeper-save-02`|16_Goalkeeper_Save_02_ue5 (`17fea4c6aacd806a…`)|4,367 s|6,35° / 18,83°|6,46° / 20,5°|sì|
|— (rohr-goalkeeper-save-03)|17_Goalkeeper_Save_03_ue5 (`519a22f817339044…`)|8,9 s|7,63° / 28,32°|7,63° / 30,1°|**no**|
|— (rohr-dribble-01)|01_Dribble_01_ue5 (`77f2f953aef1a4ba…`)|5,917 s|6,32° / 31,64°|6,32° / 35,03°|**no**|
|— (rohr-dribble-02)|02_Dribble_02_ue5 (`a4fbfc1f2b6759c4…`)|9,017 s|6,62° / 35,91°|6,62° / 37,33°|**no**|
|— (rohr-dribble-03)|03_Dribble_03_ue5 (`25559ae92624a132…`)|3,383 s|6,12° / 28,94°|6,14° / 31,32°|**no**|
|`rohr-throw-in`|07_Throw_In_ue5 (`7c0493fed556ce41…`)|7,933 s|3,02° / 27,81°|2,96° / 29,47°|sì|
|`rohr-yellow-card`|20_Yellow_Card_ue5 (`7273daef858baa30…`)|2,867 s|2,47° / 21,05°|2,47° / 21,22°|sì|
|`rohr-yellow-red-card`|21_Yellow_And_Red_Card_ue5 (`20c2d68e5ca5d92b…`)|5,7 s|2,97° / 18,82°|2,97° / 18,98°|sì|
|`rohr-juggling-01`|04_Juggling_01_ue5 (`6e067597e6c525d6…`)|3,133 s|6,37° / 19,06°|6,37° / 20,41°|sì|
|`rohr-juggling-02`|05_Juggling_02_ue5 (`d1ef01b574a80bc9…`)|3,733 s|5,62° / 17,42°|5,63° / 18,65°|sì|
|— (rohr-juggling-03)|06_Juggling_03_ue5 (`c0dca47ce5989044…`)|3,0 s|6,7° / 21,62°|6,77° / 33,89°|**no**|
|`rohr-sitting-clapping`|01_Sitting_Clapping_ue5 (`f934a0f3e581a57b…`)|3,167 s|6,51° / 15,91°|6,49° / 16,45°|sì|
|`rohr-standing-clapping`|02_Standing_Clapping_ue5 (`b2e15ae9e4f83700…`)|3,5 s|3,68° / 14,34°|3,68° / 15,51°|sì|
|`rohr-clapping-and-agree`|04_Clapping_And_Agree_ue5 (`a6f141cf08bac419…`)|3,033 s|3,32° / 12,38°|3,34° / 13,42°|sì|
|`rohr-clap-twice-hand-up`|15_Clap_Twice_Hand_Up_ue5 (`c7237e92553dc34d…`)|3,367 s|3,73° / 11,84°|3,72° / 12,04°|sì|
|`rohr-swaying-arms`|06_Swaying_Arms_ue5 (`3f8572d7642ddc6a…`)|3,9 s|3,4° / 18,6°|3,4° / 19,12°|sì|
|`rohr-hands-up-swaying`|07_Hands_Up_Swaying_ue5 (`e38cfb1e946364e4…`)|4 s|3,44° / 5,84°|3,48° / 6,06°|sì|
|`rohr-hands-up-looking-up`|08_Hands_Up_Looking_Up_ue5 (`128ff7a324d5501a…`)|3,767 s|1,54° / 4,06°|1,55° / 4,87°|sì|
|`rohr-standing-selfie`|12_Standing_Selfie_ue5 (`48dfa0ed7ae51642…`)|4 s|3,99° / 5,25°|3,87° / 5,72°|sì|
|`rohr-sitting-phone-video`|13_Sitting_Phone_Video_ue5 (`84a482a0963e1ddf…`)|3,367 s|6,7° / 22,98°|6,7° / 27,84°|sì|

## Inventario (letto dai file GLB, 26/09)

| File | Clip | In uso oggi | Mai usate |
|---|---|---|---|
| `assets/cgtrader-review-lod{0,1,2}-kit-adapter.glb` | 33 ciascuno | 24 (idle, jog, jog-back, strafe ×2, kick, penalty, header, slide-tackle, tackle, volley, receive, dribble, pass, change-direction, missed-chance, throwin, gk ×7, look-over-shoulder solo in mappa, sit-clap in panchina) | walk, running, jogging, recovery-run, run-look-back, running-to-turn, opening, sit-to-stand |
| `assets/cgtrader-clip-mixamo.glb` (3,0 MB) | 54 | 19 + `kick~m` specchiata + strike-foward-jog (tiro dell'eroe, 7.999.34, radice tolta e specchiata per il sinistro) (cadute ×3, rovesciata, tackle ×3, portiere ×10) | header-soccerball ×2, kick-soccerball ×2 (solo tabella contatti), kick-up-soccerball, kneeing-soccerball ×2, stall-soccerball ×4, receive-soccerball, soccer-penalty-kick, throw-in, offensive-idle, transition, jog (7 direzioni), goalkeeper-directing ×2, placing-ball ×2, scoop, sidestep ×2, miss |
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
| `mx-ruleta` | Dribbling: ruleta / roulette / veronica | FBX dal PO 27/09 «Soccer_Spin.fbx» («La ruleta, chiamata anche roulette, veronica o marsiglia»), Mixamo | Mixamo | Blender (`bpy` 4.2), tolte le tracce di `root`; sul posto (bacino fermo in pianta) | come sopra | misurata in scena (`ruleta-test.mjs`): suonata intera, pallone al piede entro 0,56 u | 1,27 s (in scena a 1,27x, circa 1,0 s) | tratto «feint» del tiro dopo un dribbling, SOLO se l'azione promette la roulette (7.999.39) | `ruleta-test.mjs` · `__CPM_NO_FINTA39` (niente gesto nel tratto di finta) · `__CPM_NO_RULETA39` (niente clip: finta generica) |
| `mx-disappunto` | Occasione sprecata dell'eroe (tiro fuori) | FBX dal PO 27/09 «Golf_Bad_Shot.fbx» («gesto per il disappunto, non preoccuparti che si chiama golf»), Mixamo, **ritagliato 0,5-2,6 s** (fotogrammi 15-78: mani alla testa, si piega, si rialza a testa bassa; il resto dei 13,3 s è camminata e posa ferma) | Mixamo | Blender, striscia NLA 15-78 | come sopra | `provini-p1a/mx-disappunto-41.png` (7 istanti) | 2,1 s a velocità nativa | gesto `miss` dell'eroe al posto di `missed-chance`, che nella finestra di 1,4 s correva a ~2,4× (7.999.41) | `disappunto-test.mjs` · `__CPM_NO_DISAPP41` |

File (dal 7.999.41): `assets/cgtrader-clip-po.glb`, 654 KB, sei clip: le cinque della 7.999.39 (identiche) più `mx-disappunto`.
Dal PO, convertita ma non ancora collegata: «Scissor Kick» (da confrontare con la rovesciata in uso, `mx-scissor-kick`).
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
