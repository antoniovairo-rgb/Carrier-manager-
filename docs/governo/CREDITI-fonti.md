# Fonti dei Crediti (PO-238) — verificate il 14/10

Fonti: risposte del PO al questionario del 14/10 (DECISIONI.md) e verifica sulle pagine ufficiali. Dove il dato non è verificabile: «Non posso confermarlo».

Giro 25b (15/10, decisione PO «Rimettile con la loro fonte»): le ultime cinque righe tornano nei Crediti con la fonte già presente nel repo. Decisione PO «Senza riga licenza»: per «Regular Male» e per i ritratti la schermata mostra autore e provenienza senza riga Licenza; lo stesso vale per le righe con Licenza «—».

| Risorsa | Autore | Licenza | Fonte |
|---|---|---|---|
| Giocatori 3D «Soccer Player - Rigged» (CGTrader) | Hisenberg | Royalty Free (standard) — dichiarata dal PO | ordine CGTrader #17876008 del 2026-09-20, foto docs/governo/foto/po238-ordine-cgtrader.jpg |
| Corpo «Regular Male» | Mixamo (Adobe) | — (dichiarata dal PO la provenienza) | risposta PO 14/10 |
| Ritratti delle figurine | generati con l'API a pagamento di OpenAI | — | risposta PO 14/10 |
| Font Great Vibes | Robert Leuschke («The Great Vibes Pro Project Authors») | SIL Open Font License 1.1 | github.com/google/fonts/blob/main/ofl/greatvibes/METADATA.pb, OFL.txt |
| Font Barlow, Barlow Condensed | Jeremy Tribby («The Barlow Project Authors») | SIL Open Font License 1.1 | github.com/google/fonts/blob/main/ofl/barlow/ e /barlowcondensed/ |
| Suono «Stadium joy shouting crowd» (Mixkit 3022) | Non posso confermarlo (la pagina non indica l'autore) | Mixkit Sound Effects Free License | mixkit.co/free-sound-effects/crowd/, mixkit.co/license/ |
| Suono «Brusio di folla» (file `assets/audio/sfx/crowd/brusio-folla-korward.wav`) | generato per Korward Elite (giro 20, 14/10) | nostra: nessun campione di terzi, solo sintesi da numeri pseudo-casuali con seme fisso | tools/gen-crowd-bed.mjs (procedimento nel commento in testa e in assets/audio/sfx/crowd/README.md). Sostituisce il vecchio mp3 «football crowd 3» (fonte e licenza non verificabili: su freesound.org l'id 69245 è un altro suono), tolto dal repo e dal gioco su decisione PO 14/10 «Sostituiscilo» (DECISIONI.md, «14/10 sera — brusio di folla») |
| DiceBear (libreria) | Florian Körner | MIT | dicebear.com/licenses, github.com/dicebear/dicebear LICENSE |
| DiceBear «Avataaars» | Pablo Stanley | dicebear.com: «Free for personal and commercial use»; licenza esatta: Non posso confermarlo (avataaars.com non raggiungibile durante la verifica) | dicebear.com/licenses |
| DiceBear «Micah» (Avatar Illustration System) | Micah Lanier | CC BY 4.0 (attribuzione obbligatoria) | dicebear.com/licenses |
| React/ReactDOM 18.2.0, Three.js r128, Babel standalone 7.23.6 | come da rapporto giro 15 | MIT | docs/sviluppo/RAPPORTO-giro15.md |
| Microsoft Rocketbox: giornalista e presentatori delle cerimonie (`assets/actor-journalist.glb`, `actor-presenter.glb`, `actor-presenter-f.glb`; Female_Adult_15, Male_Adult_03, Female_Adult_11) | Microsoft (github.com/microsoft/Microsoft-Rocketbox) | MIT | docs/archivio/EXTRA-FIELD-MODELS.md (righe 5-7 e 96: «licenza MIT» dal README Rocketbox, 12/2020). Il testo dell'avviso di copyright della LICENSE non è nel repo: vedi docs/sviluppo/RAPPORTO-giro25.md, giro 25b |
| Animazioni Mixamo (`assets/anim-*.glb`, `cgtrader-clip-mixamo.glb`, `cgtrader-clip-po*.glb`) e modello CH38 (`assets/footballer*.glb`) | Mixamo (Adobe) | «royalty free for personal, commercial, and non-profit projects, including creating video games» (FAQ Adobe) | tests/character-lab/CLIP_REGISTRY.md (tabella licenze, righe 10, 26, 53), FAQ helpx.adobe.com/creative-cloud/faq/mixamo-faq.html; CH38 «Mixamo»: docs/LIVE_MATCH_ENGINE_ANALYSIS.md riga 268 |
| GLTFLoader e SkeletonUtils (esempi di three@0.128.0) | three.js authors | MIT, come Three.js — «Copyright © 2010-2021 three.js authors» | src/00-head.html righe 64-65 (three@0.128.0/examples/js/...); LICENSE del pacchetto npm three 0.128.0 (devDependency di tests/visual/package.json), che contiene anche examples/js |
| Effetti sonori sintetizzati con Web Audio | realizzati per Korward Elite | — | assets/audio/README.md (righe 6-7), src/09-audio-scout-anagrafiche.jsx |
| Icone dell'app e grafiche dello store | realizzate per Korward Elite | — | tools/gen-pwa-icons.mjs, tools/gen-store-graphics.mjs |
