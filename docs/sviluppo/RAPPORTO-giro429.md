# Rapporto giro 429 — PO-692 «la musica del pannello iniziale non è molto bella» → tre brani da ascoltare

Ramo: `sviluppo/giro429-musica-menu` (base `main` 936175f). GAME_VERSION e `docs/governo` non toccati.
Il brano in gioco **non è stato sostituito**: il PO ascolta prima e sceglie.

## I tre candidati

Tutti da OpenGameArt, licenza **CC0** letta sulla pagina il 27/11/2026 (campo «License(s): CC0»), sha256 dell'originale
registrato. Tarati come la musica del giro 149: **−19 LUFS** integrati, picco ≤ −1,5 dBFS, Ogg/Opus 96k + MP3 128k.

| | Titolo · autore | Link | Durata del loop | Peso ogg / mp3 |
|---|---|---|---|---|
| **A** | *Determined Pursuit (Epic Orchestra Loop)* · **Emma_MA** | https://opengameart.org/content/determined-pursuit-epic-orchestra-loop | 54,0 s | 597 / 845 KB |
| **B** | *Virtual Rush* (versione loop) · **Vitalezzz** | https://opengameart.org/content/virtual-rush | 63,8 s | 803 / 998 KB |
| **C** | *Fever Stadium* (bpm 165) · **MintoDog** | https://opengameart.org/content/fever-stadium | 85,8 s | 963 / 1342 KB |

**A — epico orchestrale.** Archi incalzanti, corni e percussioni fitte (descrizione dell'autrice: «Frantic strings, determined
horns and busy drums»), tempo stimato ~160 BPM. È il carattere «grande evento»: il più vicino a una sigla di stadio.
Licenza: CC0; nota dell'autrice «public domain as of January 2017. No attribution necessary».

**B — moderno elettronico, ritmato.** Elettronica a 120 BPM, battuta regolare, più «interfaccia di videogioco» che sigla.
Licenza: CC0; la pagina riporta «Copyright/Attribution Notice: Vitalezzz - Virtual Rush» (il CC0 non obbliga, ma lo
metterei comunque nei crediti se scelto).

**C — eurobeat da arcade, la mia terza proposta.** 165 BPM, energia alta e costante («Let's lift your spirits», scritto per un
gioco di corse). Lo propongo perché è il più carico dei tre: dove A è solenne e B è misurato, C è festa; e l'autore lo dichiara
loopabile, quindi gira intero senza tagli. Rischio: il suo carattere «corsa» può sembrare poco calcistico.

**Quale consiglio per primo: A.** È un'opinione, non una misura: per il biglietto da visita di una carriera calcistica
il tono orchestrale epico è quello più distante dal «tono estivo/leggero» che il PO ha bocciato; è anche il loop più pulito
(il brano si ripete identico ogni 54 s, quindi il giro non ha nessuna giunta artificiale) e il file più leggero.

⚠️ **Non ho ascoltato i brani**: il carattere viene dalle descrizioni degli autori e dalle misure (tempo, inviluppo, ripetizioni).
Il giudizio d'ascolto è del PO.

## Come sono stati tagliati i loop (misurato)

- **A**: la correlazione della forma d'onda fra il tratto a 36 s e quello 54 s dopo è **0,9995** → loop = [36, 90) s, nessuna
  dissolvenza.
- **B**: nessuna ripetizione esatta (correlazione 0,42): tratto di 32 battute da 16 s, periodo cercato attorno a 63,79 s, coda
  di 2 s fusa nella testa a potenza costante (metodo del giro 172).
- **C**: file intero, loop dell'autore.

Misure sui file decodificati dal browser (sono quelle che giudica il guardiano):

| | LUFS ogg / mp3 | picco ogg / mp3 | salto al giunto (ogg) | 99° percentile dei passi |
|---|---|---|---|---|
| A | −19,0 / −19,4 | −7,6 / −7,1 dBFS | 0,0082 | 0,0745 |
| B | −18,9 / −19,4 | −8,5 / −9,8 dBFS | 0,0186 | 0,0524 |
| C | −18,9 / −19,4 | −8,2 / −9,1 dBFS | 0,0060 | 0,0690 |

Prova che la misura del giunto distingue: tre tagli GREZZI di B (senza fusione) danno salti di 0,51 / 0,31 / 0,46 contro un
99° percentile di 0,18-0,19 → cadono tutti.

## Come ascoltarli

1. **File**: `docs/collaudo-po/429-brano-A.mp3`, `-B.mp3`, `-C.mp3` (identici agli mp3 del gioco, il guardiano lo controlla).
2. **Nel gioco**: dalla console del browser `localStorage.setItem('cpm-menu429','A')` (o `'B'`, `'C'`), poi ricaricare la pagina e
   toccare lo schermo; per tornare com'era `localStorage.removeItem('cpm-menu429')`. Sotto `?cpmtest=1` vale anche
   `window.__CPM_MENU429='A'|'B'|'C'` (ma lì l'audio è muto per costruzione, serve solo alle sonde).

## ⚠️ Una cosa che non torna con la richiesta

Nel codice di `main` **`music.home` non suona nel menu**: dal POC del 23/09 («musica menu da eliminare», `_mus23` in src/09)
home, creazione e provino spengono la musica; fuori partita suonano solo le cerimonie (giro 161). Quindi **non posso
confermare quale brano senta il PO nel «pannello iniziale»**: non è `spiaggia-loop` secondo il codice. Possibilità da
verificare col PO (non verificate da me): la versione installata sul telefono è vecchia, oppure «pannello iniziale» indica
un'altra scena (intro, serata di presentazione con «The Storm Chasers»). Per questo l'interruttore, quando è acceso, fa
anche **suonare** music.home in home/creazione/provino; spento, tutto resta com'è oggi (niente musica nel menu).

## Cosa è cambiato

- `assets/audio/music/menu/429-{a-orchestra,b-elettronica,c-stadio}.{ogg,mp3}` + `docs/collaudo-po/429-brano-{A,B,C}.mp3`.
- `assets/audio/LICENZE.json`: sei righe nella sezione **«altri»** (non in `file`: non entrano in F149 né nella precarica di sw.js,
  si scaricano solo con l'interruttore acceso).
- `tools/audio-429/prepara-429.py` (riproducibile: due esecuzioni danno gli stessi byte); `tools/audio-149/prepara-audio.py`
  conserva le righe «altri» che hanno il campo `generatore` (prima una rigenerazione le avrebbe cancellate).
- `src/09` (+ HTML ricomposto): `MENU429`, `_menu429()`, scelta applicata in `_load149`, menu che suona il candidato (mai la
  sintesi: se il file non è pronto parte al caricamento), testimone `__CPM_MENU429S`. Rosso `__CPM_NO_G429`.
- Guardiano `npm run musica-menu-429`, nella riga MAPPA `src/05-|src/09-` (quella di `musica-316`).

## Verifiche

- `musica-menu-429`: **verde** (6 statici + 24 misure + 4 nel gioco) e il **rosso cade** (con `__CPM_NO_G429` e la scelta A:
  scelta null, file spiaggia-loop, niente musica).
- `musica-316` verde · `test:logic` 51/51 · `save-compat` 12/12 · `mappa-unica` verde.
- `audio-149`: **rosso su 3, 5 e 7, PREESISTENTE**: dipende solo dalla sezione `file` del registro, da sw.js e da F149, che sono
  identici a main (verificato: `file` invariato, sw.js e F149 non toccati). Cause lette nell'output: peso della sezione `file`
  8,03 MB contro il tetto 6; `cacciatori-di-tempeste` (giro 316) non è nella precarica di sw.js → 67/68 senza rete. Non
  corretto qui (fuori ambito, e il tetto non si alza); non è in `ROSSI-DICHIARATI.json`: da segnalare al governo.
- Catena scelta: solo audio/UI di menu, nessun tocco a motore, partita o carriera.
