# Consegna a Claude Code — figurine e identita' Korward

Stato verificato il 22/09/2026 sul ramo locale `poc/marioprada-character-system-local`. Questa consegna serve a preparare un'integrazione controllata: non e' un via libera al merge, al push o alla pubblicazione su `main`/GitHub Pages.

## Che cosa esiste davvero

- Dieci fogli JPEG in `assets/portraits/`, ciascuno 768×768 e diviso in quattro ritratti: 40 volti visivi. `cast-heroes-a` (4), `cast-team-a/b/c` (12), `cast-rivals-a/b/c` (12), `cast-staff-a/b/c` (12). Sono asset statici, con fondale del volto bianco.
- `tests/character-lab/previews/figurina-korward-marco-rinaldi.png` e' un **mock-up statico** 900×1260, cioe' rapporto 5:7. Il nome e il ruolo presenti nell'immagine sono dimostrativi: non sono dati da importare nel gioco.
- `assets/hero-highlight-portrait-v1.webp` e' un pilota 2D separato per l'avatar eroe 0. Non rappresenta automaticamente gli altri avatar.
- La precedente integrazione JSX di catalogo, `CastPortrait`, `resolveCastPersona`, `appearanceForAvatar` e `HeroHighlightPortrait` e' recuperabile in `tests/character-lab/recovery/2026-09-22-source-recovery/CARRIER-MANAGER-AV.compacted-before-recovery.html`. Il file e' una **copia di recupero compattata**, non una sorgente da sostituire in blocco.
- **Attenzione allo stato attuale:** queste funzioni non sono presenti in `CARRIER-MANAGER-AV.html` corrente. In questo momento il gioco usa ancora `AvatarSVG` con `assets/avatar-0..9.png` e un hash del `seed`. La roadmap racconta una integrazione precedente, ma non va letta come prova che sia tuttora attiva. Reintegrare e verificare prima del merge.

## Contratto dei dati del gioco

Il gioco resta fonte unica per ID attore stabile, nome, cognome, ruolo/posizione, club, colori del club, avatar scelto dell'eroe e attributi fisici di gameplay. Il catalogo visivo non deve creare nomi, ruoli, biografie, abilita' o statistiche. La figurina mostra nome/cognome e ruolo ricevuti dal gioco; **non mostra carnagione, statura, corporatura o etichette tecniche**. Anche giornalisti/giornaliste, agenti, mister e altri attori narrativi ricevono un volto stabile, usando i rispettivi dati del gioco.

Il mock-up fissa la direzione editoriale: rapporto 5:7, primo piano leggibile, volto su bianco, cornice con colori del club quando esiste un club; per staff e media senza club usare la palette Korward. La figurina dinamica 5:7 e la cornice legata al club **non erano implementate** dal vecchio `CastPortrait`: quel componente mostrava un quadrato, a volte con overlay di nome/ruolo, e bordo `TH.primary`. Non scambiare il mock-up per un componente pronto.

## Logica recuperabile e limiti

Nella copia di recupero `CAST_SHEETS` mappa dieci JPEG; `CAST_POOLS` contiene 16 scelte `team` (12 compagni + 4 eroi), 12 `rival`, 12 `staff`. `_castHash(kind + '|' + identity) % pool.length` selezionava foglio e quadrante; CSS `background-size: 200% 200%` ne mostrava uno. `resolveCastPersona(identity, actorType)` restituiva chiave, foglio, slot, `appearance` e categoria. `CAST_APPEARANCE` conservava per ciascuno dei 40 slot pelle, capelli, acconciatura, altezza, corporatura. `appearanceForAvatar(avatarId)` derivava il profilo dell'eroe dall'avatar selezionato.

Questa era una scelta **deterministica**, non un sistema di 1000 volti: identita' diverse possono ricevere lo stesso ritratto. Inoltre l'hash di un nome visibile puo' cambiare se il nome cambia. Per la nuova integrazione usare un ID persistente del gioco (con chiave di categoria esplicita) e salvare l'assegnazione nell'identita' di carriera; pianificare distribuzione senza duplicati almeno nella rosa e nella scena corrente. Non promettere unicita' globale finche' il catalogo ha 40 slot. Evitare di copiare senza revisione il vecchio `Math.abs` dell'hash signed, che ha un caso limite su `-2147483648`.

L'eroe deve conservare la scelta dell'avatar. Un nuovo ritratto va associato solo alla variante fisica coerente, con fallback al ritratto locale dell'avatar se manca. L'aspetto 3D CGTrader deve ricevere pelle, capelli, acconciatura e proporzioni coerenti **per quanto il modello e i materiali supportano davvero**. Il ritratto 2D non costituisce prova di corrispondenza facciale esatta con la mesh CGTrader. Le stesse assegnazioni di volto devono essere riusate in profilo, dialoghi, interviste, cerimonie, premiazioni e UI degli highlight; il live match non deve caricare un nuovo renderer per le figurine.

## Confini di integrazione

1. Non sostituire `CARRIER-MANAGER-AV.html` con la copia compattata di recupero. Estrarre solo il contratto e le parti approvate, poi adattarle alla sorgente corrente.
2. Tenere separati: ID/ruolo/club provenienti dal gioco; mappatura visiva persistente; presentazione 5:7; parametri CGTrader. Nessun nome o colore di club hard-coded nel catalogo.
3. Non riattivare CH38, Quaternius o altri asset/gesti rifiutati. Le figurine sono corredo 2D; la priorita' degli highlight resta coordinazione corpo/braccia, palla, direzione della porta, transizioni e fps mobile.
4. Non trascinare nel merge tutte le cartelle di ricerca, ZIP, file `.blend1` e asset non approvati. Verificare provenienza/licenza dei ritratti prima di pubblicarli.
5. L'obiettivo di circa 1000 volti distinti e' **aperto**. Servono nuovi lotti visivi originali e un catalogo estendibile; 40 ritratti non vanno presentati come 1000 personaggi unici.

## Criteri prima di proporre il merge

- La stessa identita' mostra lo stesso volto dopo salvataggio/ricarica e in tutte le schermate narrative; un cambio di club aggiorna la cornice, non il volto.
- Nome, cognome e ruolo coincidono con i dati di carriera; il colore della pelle non appare nel testo della figurina.
- Figurina 5:7 leggibile su telefono, con sfondo del ritratto bianco e colori coerenti con club/Korward; nessun volto sovrapposto o quadrante sprite errato.
- Una rosa e una scena con piu' attori non ripetono volti dove il catalogo consente di evitarlo; collisioni residue sono dichiarate.
- Scelta eroe e aspetto CGTrader non si contraddicono nei tratti supportati. Nessun nuovo carico WebGL durante il match.
- Build e smoke test passano sul ramo isolato. I gate di animazione, sincronismo palla, transizioni e performance mobile rimangono separati e aperti finche' non sono misurati. `main` e la GitHub Pages principale restano intatti.
