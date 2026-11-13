# Fonti dei Crediti (PO-238) — verificate il 14/10

Fonti: risposte del PO al questionario del 14/10 (DECISIONI.md) e verifica sulle pagine ufficiali. Dove il dato non è verificabile: «Non posso confermarlo».

Giro 25b (15/10, decisione PO «Rimettile con la loro fonte»): le ultime cinque righe tornano nei Crediti con la fonte già presente nel repo. Decisione PO «Senza riga licenza»: per «Regular Male» e per i ritratti la schermata mostra autore e provenienza senza riga Licenza; lo stesso vale per le righe con Licenza «—».

Giro 161b (11/11, decisione PO «Togliere il file»): il suono «Stadium joy shouting crowd» (n. 3022, licenza propria del sito d'origine, non CC0) è uscito dal repo, dal gioco e dai Crediti; la sua riga è tolta. Il testo della licenza letto l'11/11 resta come documentazione in `docs/sviluppo/giro161/`.

Giro 184 (13/11, PO-374, decisione PO 12/11 «Toglierli dal repo»): gli originali CGTrader (`assets/source/cgtrader-soccer-player/originals/`: FBX, OBJ/MTL, GLB parziali; e `TEXTURES.zip`) sono tolti dal repo e dal sito il 13/11; restano nella storia git (nessun force push, decisione PO) e il PO li conserva nel suo acquisto CGTrader. Il gioco usa solo i GLB convertiti in `assets/` (verificato con grep e sulla rete del browser, rapporto `docs/sviluppo/RAPPORTO-giro184.md`). Guardiano `licenze-184`: nessun originale CGTrader/Mixamo/Rohr in `assets/`, `dist/`, `dist-web/`.

| Risorsa | Autore | Licenza | Fonte |
|---|---|---|---|
| Giocatori 3D «Soccer Player - Rigged» (CGTrader) | Hisenberg | Royalty Free (standard) — dichiarata dal PO | ordine CGTrader #17876008 del 2026-09-20, foto docs/governo/foto/po238-ordine-cgtrader.jpg |
| Corpo «Regular Male» | Mixamo (Adobe) | — (dichiarata dal PO la provenienza) | risposta PO 14/10 |
| Ritratti delle figurine | generati con l'API a pagamento di OpenAI | — | risposta PO 14/10 |
| Font Great Vibes | Robert Leuschke («The Great Vibes Pro Project Authors») | SIL Open Font License 1.1 | github.com/google/fonts/blob/main/ofl/greatvibes/METADATA.pb, OFL.txt |
| Font Barlow, Barlow Condensed | Jeremy Tribby («The Barlow Project Authors») | SIL Open Font License 1.1 | github.com/google/fonts/blob/main/ofl/barlow/ e /barlowcondensed/ |
| Suoni «The Designer's Choice» (fischietti, applausi/boato, impatti) — giro 149 | Nicholas A. Judy | CC0 1.0 (licenseurl dell'oggetto, caricato dall'autore) | archive.org/details/Designers-Choice-Collection-{Whistles,Crowds,Fight,Cloth,Metal,Sports}, letta il 10/11; file per file in assets/audio/LICENZE.json |
| Suoni «Interface Sounds» e «85 Short Music Jingles» — giro 149 | Kenney | CC0 (pagina + License.txt nel pacchetto) | opengameart.org/content/interface-sounds · /content/85-short-music-jingles, lette il 10/11 |
| Musica «Victory Fanfare Short» — giro 149 | cynicmusic | CC0 | opengameart.org/content/victory-fanfare-short, letta il 10/11 |
| Musica «Beach Sports Theme (Loop)» — giro 149 | Trex0n (nota sulla pagina: Cal McEachern) | CC0 | opengameart.org/content/beach-sports-theme-loop, letta il 10/11 |
| Musica «Happy Adventure (Loop)» — giro 149 | TinyWorlds | CC0 | opengameart.org/content/happy-adventure-loop, letta il 10/11 |
| Suono «Brusio di folla» (file `assets/audio/sfx/crowd/brusio-folla-korward.wav`) | generato per Korward Elite (giro 20, 14/10) | nostra: nessun campione di terzi, solo sintesi da numeri pseudo-casuali con seme fisso | tools/gen-crowd-bed.mjs (procedimento nel commento in testa e in assets/audio/sfx/crowd/README.md). Sostituisce il vecchio mp3 «football crowd 3» (fonte e licenza non verificabili: su freesound.org l'id 69245 è un altro suono), tolto dal repo e dal gioco su decisione PO 14/10 «Sostituiscilo» (DECISIONI.md, «14/10 sera — brusio di folla») |
| DiceBear (libreria) | Florian Körner | MIT | dicebear.com/licenses, github.com/dicebear/dicebear LICENSE |
| DiceBear «Avataaars» | Pablo Stanley | «Free for personal and commercial use» — dichiarata da dicebear.com e dai metadati della libreria inclusa (`assets/dicebear-avatars.min.js`: `license.name`, `url` avataaars.com; giro 68). Testo originale su avataaars.com: Non posso confermarlo (sito non raggiungibile durante la verifica) | dicebear.com/licenses, assets/dicebear-avatars.min.js |
| DiceBear «Micah» (Avatar Illustration System) | Micah Lanier | CC BY 4.0 (attribuzione obbligatoria: nei Crediti autore, fonte figma.com/community/file/829741575478342595 e link creativecommons.org/licenses/by/4.0, dai metadati della libreria inclusa) | dicebear.com/licenses, assets/dicebear-avatars.min.js |
| React/ReactDOM 18.2.0, Three.js r128, Babel standalone 7.23.6 | come da rapporto giro 15 | MIT | docs/sviluppo/RAPPORTO-giro15.md |
| Microsoft Rocketbox: giornalista e presentatori delle cerimonie (`assets/actor-journalist.glb`, `actor-presenter.glb`, `actor-presenter-f.glb`; Female_Adult_15, Male_Adult_03, Female_Adult_11) | Microsoft (github.com/microsoft/Microsoft-Rocketbox) | MIT | docs/archivio/EXTRA-FIELD-MODELS.md (righe 5-7 e 96: «licenza MIT» dal README Rocketbox, 12/2020). Il testo dell'avviso di copyright della LICENSE non è nel repo: vedi docs/sviluppo/RAPPORTO-giro25.md, giro 25b |
| Animazioni Mixamo (`assets/anim-*.glb`, `cgtrader-clip-mixamo.glb`, `cgtrader-clip-po*.glb`) e modello CH38 (`assets/footballer*.glb`) | Mixamo (Adobe) | «royalty free for personal, commercial, and non-profit projects, including creating video games» (FAQ Adobe) | tests/character-lab/CLIP_REGISTRY.md (tabella licenze, righe 10, 26, 53), FAQ helpx.adobe.com/creative-cloud/faq/mixamo-faq.html; CH38 «Mixamo»: docs/LIVE_MATCH_ENGINE_ANALYSIS.md riga 268 |
| GLTFLoader e SkeletonUtils (esempi di three@0.128.0) | three.js authors | MIT, come Three.js — «Copyright © 2010-2021 three.js authors» | src/00-head.html righe 64-65 (three@0.128.0/examples/js/...); LICENSE del pacchetto npm three 0.128.0 (devDependency di tests/visual/package.json), che contiene anche examples/js |
| Effetti sonori sintetizzati con Web Audio | realizzati per Korward Elite | — | assets/audio/README.md (righe 6-7), src/09-audio-scout-anagrafiche.jsx |
| Icone dell'app e grafiche dello store | realizzate per Korward Elite | — | tools/gen-pwa-icons.mjs, tools/gen-store-graphics.mjs |

## Clip Anderson Rohr (giro 180b, 12/11/2026) — registrate qui, FUORI dalla tabella

**Perché fuori dalla tabella:** il guardiano `crediti-254` pretende nella finestra Crediti del gioco ogni riga della tabella qui
sopra (conta ogni riga che comincia con «|», per questo qui è un elenco); aggiungere la riga senza toccare `src/` lo renderebbe rosso, e il mandato del giro 180b vieta cambi a `src/` (le clip non
sono ancora collegate ai gesti). La riga entra in tabella **quando** le clip entreranno nel gioco — domanda aperta per la
sessione madre nel rapporto 180b §6. **Decisione madre (180c):** la riga entra in tabella e nella finestra Crediti solo quando le clip
entreranno nel gioco; la riga di cortesia è preparata (non attivata) nel rapporto 180c §7.

- **Risorsa:** 28 clip di animazione (giro 184 = 180d; 24 nel 180c, 9 nel 180b) convertite e riadattate allo scheletro CGTrader, file `assets/cgtrader-clip-rohr.glb` (nessuna mesh, solo animazioni; **fuori da `dist/`** finché il gioco non lo carica)
- **Autore:** Anderson Rohr
- **Fonte:** «Free mocap pack 05: Soccer» <https://andersonrohr.gumroad.com/l/mocap_pack5> e «Free mocap pack 04: Crowd Reactions» <https://andersonrohr.gumroad.com/l/mocap_pack4> (Gumroad)
- **Licenza, parola per parola (sezione «Licensing», identica sulle due pagine, riletta alla fonte il 12/11/2026):** «This pack can be used for free in both personal and commercial projects. Attribution is not required, but feel free to tag me (my socials: https://linktr.ee/andersonrohr). I’d love to see what you create with it. You may not redistribute, resell, or repackage this pack as a standalone product.»
- **Credito nel gioco:** non richiesto dalla licenza («Attribution is not required»)
- **Scaricamento:** **scaricato dal PO il 12/11/2026** (carrello Gumroad a prezzo 0) e messo a disposizione della sessione tramite una sua cartella Drive condivisa via link; zip: pack 05 135.824.549 byte, sha256 `1a26159823911a0b509cee8b82e1f9916714dcf0dc71e90139ece7fc99792c44` · pack 04 161.335.621 byte, sha256 `56fcdcc77ceb7d4591309fbb088f32c35f2a39aebe087344fff1282c69721786`
- **Originali:** gli zip e gli FBX **non sono nel repository né in `dist/`** (tenuti solo in una cartella temporanea fuori dal clone e cancellati a fine giro); rete di sicurezza in `.gitignore`
- **Rischio repo pubblico:** il GLB convertito si scarica come file a sé dal repository pubblico; se questo sia «redistribute … as a standalone product»: Non posso confermarlo. **Rischio accettato dal PO il 12/11/2026**, come per CGTrader e Mixamo
