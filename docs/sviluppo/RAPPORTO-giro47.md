# Rapporto del giro 47 — premiazione di squadra (PO-002) e scene 3D fuori dalla partita (PO-137)

Ramo `sviluppo/cerimonie-137-giro47`, base `lavoro/171-base` (7.999.171). `GAME_VERSION` e `SAVE_VERSION` **non toccati**.
File di gioco toccati: `src/12-three-match-view.jsx` (solo il ramo della cerimonia di `ThreeMatchView`) e
`src/16-scene-3d-cerimonie.jsx` (galà e parata). Zona G non toccata.

## 1. Perché il guardiano `cerimonie` era rosso dal 24/09 — misurato: era il GIOCO

Rosso riprodotto sulla base: `league e cup hanno la STESSA cerimonia: present>captain>lift>fest` (e così league/int,
cup/int). Causa: la premiazione di squadra del POC 24/09 (`_team23`) sostituiva il copione di **ogni** competizione con la
stessa sequenza. Lo strumento era giusto: verificava proprio la richiesta PO «una Coppa deve sembrare una Coppa» (e PO-150,
risposta PO «Differenziarle»). Le altre sezioni del guardiano (warp scudetto, warp Nazionale) erano già verdi.

## 2. PO-002 — il capitano alza la coppa e la PASSA all'eroe

Misure dai provini a corpi accesi (`foto-premiazione-47.mjs`, testimoni `__CPM_PREMIO23`, `__CPM_PASSA137`):

| Difetto misurato sulla base | Correzione | Rosso |
|---|---|---|
| Il passaggio non esisteva: la coppa saltava dalle mani del capitano a quelle dell'eroe al cambio di beat | nuovo beat `pass` (2,6 s): il capitano si avvicina, la coppa viaggia mano→mano (smoothstep con piccolo arco), i due si guardano | `__CPM_NO_PASSA137` |
| Il capitano «alzava» la coppa all'altezza dei fianchi (mani 1,08-1,29) | gesto d'alzata dal canale unico `_mateFx`, congelato all'apice come l'eroe (45%), esecuzione a due braccia fissata (il sorteggio gli dava a volte il pugno solo: 1,62) → mani 2,06-2,07 | `__CPM_NO_CAPALZA137` |
| Il bersaglio del capitano (0;0,2) stava DENTRO il palco solido: la spinta lo portava dietro e di lato (-3,9;0 … -8;-0,5), fuori quadro; col modello d'inerzia oscillava di 3-5 u | il capitano sta sul fronte del palco accanto all'eroe, nel riferimento del palco (attesa 2,6 u, alzata 1,25 u, passaggio 0,95 u, applauso 1,7 u), passo d'uomo 1,6 u/s, fronte camera | (insieme a `PASSA137`) |
| Festa di squadra: l'eroe spinto dal solido fino a (1,8;-1,1), dietro il palco e dentro le file — sparito con la coppa | nella festa di squadra l'eroe resta sul palco (quota 1,05) | `__CPM_NO_FESTA137` |

Copioni per competizione (PO-150), rosso del copione unico `__CPM_NO_VARIA137`:
- **scudetto**: consegna › capitano › passaggio › sollevamento › festa sul palco
- **coppa** (cerimonia formale): consegna › capitano › passaggio › sollevamento lungo (5,2 s)
- **Nazionale**: consegna › capitano › passaggio › festa sul palco › alzata finale

Provati e **scartati** coi provini (dichiarati nel commento del codice): la corsa sotto la curva con la coppa (l'eroe finiva in
scivolata, mani a 0,1, coppa sotto il prato a −0,6), l'abbraccio del mister (eroe in ginocchio con la coppa a terra, mister
ancora dietro il palco), il CT prima della consegna (la coppa passava eroe→capitano→eroe).

⚠️ La differenza fra le tre premiazioni è di **regia** (ordine e durata dei beat), più i coriandoli/fuochi per competizione
che c'erano già (7.422). Varianti più scenografiche (corsa sotto la curva, abbraccio del mister) **non sono pronte**.

## 3. PO-137 — censimento fotografico e correzioni

Strumento `censimento-scene-47.mjs` (galà, parata, festa del trofeo; 360 e 412 px) + `foto-premiazione-47.mjs` (podio e festa
in campo). Foto in `docs/sviluppo/foto-giro47/` (`prima-*` dalla base, `dopo-*` da questo ramo).

| Scena | Difetti più visibili (censimento 412/360 px) | Stato |
|---|---|---|
| **Galà** | 1. presentatori tagliati dai bordi (campo orizzontale ~21° in verticale) · 2. flash dei fotografi = quadrati bianchi, uno davanti al podio · 3. metà inferiore di moquette vuota · 4. presentatore in maglione e jeans (il PO chiedeva «abito da sera») | 1 e 2 **corretti** (fov 46→60,6 a 412×915, rosso `__CPM_NO_GALAFOV137`; bagliori rotondi, rosso `__CPM_NO_FLASH137`). 3 e 4 aperti (il 4 è un asset) |
| **Pullman** | 1. la via sembra vuota: la folla dipinta era una striscia scura · 2. giocatori sul tetto minuscoli rispetto al pullman · 3. un taglio di regia stretto sul muso | 1 **migliorato** (pannello 2,6→3,4, emissivo 0,35→0,75, rosso `__CPM_NO_FOLLA137`): si legge nel taglio laterale, poco nei tagli larghi — la folla resta lontana dal pullman (via larga 24). 2 e 3 aperti |
| **Podio** (premiazione di squadra) | capitano fuori quadro e coppa ai fianchi · passaggio assente · eroe nascosto nella festa | **corretti** (sezione 2) |
| **Festa in campo** (promozione, grande vittoria) | 1. inquadrature larghe coi festeggianti piccoli e gli avversari ancora in campo · 2. una coppa vista una volta nella promozione | 1 aperto · 2 **non riprodotto** (testimone: coppa nascosta in tutti i beat su una seconda corsa) |
| **Festa del trofeo** (schermata 2D) | nessun difetto nuovo (pulsante oro verificato da `festa-oro-251`) | — |
| **Ingresso** | non censito in questo giro (lavoro in parallelo del giro 46 sugli stadi) | — |

## 4. Guardiani

Nuovi (in `package.json`, nella `MAPPA` di `ci-runner.mjs` e nella catena `grafica`):
- `passaggio-coppa-137` (corpi accesi): mani del capitano ≥1,9 al beat `captain`; coppa nelle mani del capitano a inizio
  passaggio e in quelle dell'eroe alla fine (scarto 0); eroe sul palco nella festa. Tre rossi visti: mani 1,29-1,30 · beat
  `pass` assente · quota eroe 0. Verde 2 su 2 dopo la correzione del campionamento (vedi nota).
- `scene-fuori-137`: fov del galà >50 in verticale, flash rotondi, folla 3,4/≥0,7; rosso con i tre interruttori (46 · quadrati · 2,6/0,35).
- `cerimonie` (esistente): torna **verde**; aggiunta la verifica «dopo `captain` viene `pass`» e `CPM_ROSSO=...` per provarne i
  rossi (`__CPM_NO_VARIA137` → 3 «STESSA cerimonia»; `__CPM_NO_PASSA137` → 3 «il capitano non passa la coppa»). Messo in
  `MAPPA` src/12 e nella catena grafica: non c'era in nessuna catena, per questo il rosso è rimasto invisibile tre settimane.

⚠️ Nota di strumento: in headless il clock di scena va a 1/10-1/30 del reale, quindi l'apice del gesto del capitano arriva
quando arriva — il guardiano tiene fermo il tempo di cerimonia e campiona fino a 8 s (con due campioni a orologio usciva 1,62-1,85).
⚠️ I guardiani a corpi accesi **non si lanciano in parallelo**: con quattro insieme `coppa-mani-191`, `premiazione-palco-191` e
`palco-corpi-191` uscivano rossi per campioni insufficienti (5 contro 10) — in sequenza sono verdi.

Esiti misurati su questo ramo (in sequenza):
- `premiazione-palco-191` ✅ · `coppa-mani-191` ✅ · `posa-sollevamento-191` ✅ · `palco-corpi-191` ✅ (con il passaggio: 0 corpi nel palco su 127 campioni)
- `cerimonie` ✅ · `passaggio-coppa-137` ✅ · `scene-fuori-137` ✅ · `parata-198` ✅
- `presentazione-200` ✅ · `figurine-208` ✅ · `post-210` ✅ · `festa-oro-251` ✅
- `gala-3d` ❌ **anche sulla base, identico** (`eroe:false, premio:false`): misura ancora l'eroe sul palco del galà, tolto per
  decisione PO al 7.999.52. Pre-esistente, non toccato; non è in nessuna catena.

CATENA_MIRATA

## 5. Fuori ambito / da fare

- Non toccati: stadi (giro 46), rimozione del CH38 dalle cerimonie (giro 39), zona G, versioni.
- Possibile attrito col giro 39: tocca anch'esso la cerimonia; le mie modifiche stanno nel blocco del capitano
  (`_cap23`), nei copioni `_team23` e nella scelta della variante `lift` per il capitano (`_capVit137`).
- Roadmap/BACKLOG non aggiornati da qui (nessuna versione spedita da questo giro): proposta per l'integratore —
  PO-002 «passaggio della coppa fatto, da collaudare sul telefono»; PO-150 «differenziate nella regia, varianti
  scenografiche non pronte»; PO-137 «guardiano `cerimonie` verde; galà e parata migliorati; restano i punti aperti della tabella».
- `docs/governo/STABILITA.json` scritto dall'esecutore della catena e **non** committato (lo scrivono anche i giri paralleli).
