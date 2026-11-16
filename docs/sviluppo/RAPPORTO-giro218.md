# Rapporto giro 218 — il calendario della coppa europea si legge (PO-483)

Ramo `sviluppo/giro218-calendario`, partito da `lavoro/195` (d95d504). `GAME_VERSION` non toccata, roadmap non toccata.
Rosso unico del giro: `window.__CPM_NO_G218` (= righe e colori di prima). Ogni numero qui sotto è **misurato** dal guardiano
`calendario-218`; dove non lo è lo scrivo. Foto in `docs/sviluppo/giro218/` (`coppe-375-prima/dopo.png`, `coppe-pc-prima/dopo.png`).

Foto del PO (7.999.194, telefono, `docs/collaudo-po/194-calendario-coppa-illeggibile.jpg` sul ramo `poc/marioprada-character-system`):
«Illeggibile così». Scheda STAGIONE → Coppe → coppa europea → CALENDARIO: righe con fondo verde/rosa/giallo pallido e il testo
«FC Merseyside vs FC Lumeranza» quasi bianco.

## 0. In breve

| Punto | Prima (rosso `__CPM_NO_G218`) | Dopo |
|---|---|---|
| Testi sotto 4,5:1 nella scheda Coppe (UCL) | **38** su 195 (UEL 40, UECL 38) | **0** in tutte e tre le coppe |
| Peggior testo del calendario europeo | «FC Merseyside vs FC Lumeranza» **1,03:1** (#f4f1ea su #dcfce7) | ≥ 4,5:1 su ogni testo di ogni riga |
| Testi sotto 4,5:1 nella scheda Calendario | **1** (lettera «V» di `MatchBadge`, bianco su #4ade80: **1,74:1**) | **0** |
| Scheda Nazionale | 0 (51 testi) | 0 (51 testi) |
| Nomi tagliati nel calendario europeo a 375 | **2** righe coi puntini («…Sporting Valparaiso Atletico Primavera», «FC Valdoria vs…») | **0**: si scende sulla scala dei nomi (es. «MER vs Sp. Valparaiso Atl.») |

Viste: 375×667 touch e 1366×768; per ciascuna la preferenza vecchia `cpm-dark` = "1" e = "0" (vedi Dubbio 1). Stati di riga
misurati tutti: vinta · persa · pari · da giocare · eliminazione (giocata e da giocare).

## 1. Misura prima

Componente: `src/18-career-app.jsx`, tab `coppe`, card «COPPA EUROPEA» (IIFE con `_ecCol`/`_ecBg`/`_ecBorder`). Causa: la card era
disegnata per il tema chiaro, e con il tema unico notte (TINTE) ne sono rimasti
- fondi chiari **cablati** sulle righe del calendario: `#dcfce7` vinta · `#fffbeb` pari · `#fee2e2` persa, sotto `TH.text` #f4f1ea;
- il colore della competizione come TESTO (`_ecCol` #1e40af / #b45309 / #5b21b6, scuri) sul fondo notte: «G6» e «Quarti di Finale»
  a 1,91:1, «⭐ FC Merseyside» nella classifica del girone a 1,08:1, «⏭ Prossima partita» a 1,58:1;
- i fondi chiari `_ecBorder+"66"` / `+"44"` (prossima partita, tua riga della classifica) e `#fff7ed`;
- testata: «Stagione 3» bianco al 70% sul gradiente (3,34:1), «✅ KO» #d9f99d (3,4:1), in UEL il secondo stop #f97316 sotto il bianco;
- differenza reti negativa `#dc2626` sul fondo notte (3,45:1);
- capocannonieri europei `#2563eb` (3,23:1).

Stesso difetto, **cercato** come chiesto, negli altri elenchi:
- tabellone della **Coppa Nazionale** (righe «tua partita» `#fffbeb` sotto `TH.text`): scheda Calendario (r. ~9717) e scheda Coppe
  (r. ~12539) — «⭐ CAL» 1,09:1, «X4» 2,8:1, «2–0» 1,39:1;
- **capocannonieri della Coppa** (tua riga `#fffbeb`);
- `MatchBadge` (primitiva di `src/11`, usata dalle righe risultato della Coppa nella scheda Calendario): lettera bianca su
  verde/giallo/rosso chiari del tema.
- Calendario di **campionato** («Prossime partite», riga `riga-cal-v2`) e scheda **Nazionale**: nessun testo sotto soglia (misurato).

Il metro (`calendario-218.mjs`): per ogni elemento con testo proprio visibile nella scheda aperta (fisarmoniche tutte aperte con
`__CPM_FIS_APERTE`, il criterio della griglia mobile), contrasto WCAG fra colore del testo (alfa × opacità degli antenati) e fondo
effettivo composto risalendo gli antenati; con un gradiente si prende lo stop peggiore.

## 2. Correzione

Solo token del tema, nessun colore nuovo:
- righe del calendario europeo: fondo `TH.winBg/drawBg/lossBg` (trasparente da giocare), bordo `winBd/drawBd/lossBd`, settimana
  `TH.muted`, punteggio `txGreen/txAmber/txRed`; i due nomi sono due `NomeSquadra182` (scala dei nomi: intero → U19 → abbreviato →
  senza FC → sigla) separati da «vs», mai coi puntini;
- `_ecCol` → `txBlue/txAmber/txPurple`; fondi chiari della card → `bgBlue/bgAmber/bgPurple` (`_ecSf`) e `bgAmber`; GD negativa →
  `txRed`; capocannonieri europei → `txBlue`;
- testata: «Stagione N» e le pillole di stato in bianco pieno su `rgba(0,0,0,0.3)`; gradiente UEL `#9a3412→#c2410c` (era `#f97316`);
- tabellone Coppa Nazionale (2 punti) e capocannonieri di Coppa: `#fffbeb` → `TH.bgAmber`;
- `MatchBadge`: lettera `TH.bg` (inchiostro scuro) invece di bianco.
Tutto dietro `__CPM_NO_G218`. Le righe portano `data-cpm="cal-euro-218"`, `data-stato218`, `data-ko218` in entrambi i bracci.

Fuori ambito del PO ma necessario a tenere verde `design-system`: `src/15-live-match.jsx:725` aveva `borderRadius:8` scritto a mano
(arrivato col giro 216 su `lavoro/195`, il guardiano era **già rosso sulla base**): sostituito con `RAD.sm`, stesso valore 8, nessun
pixel cambiato (vedi Dubbio 4).

## 3. Guardiano e controlli

`calendario-218` (nuovo, `npm run calendario-218`): in `ci-runner.mjs` nelle catene **completa** e **carriera** una volta ciascuna,
nella MAPPA di `src/1[17]` e `src/18`, e fra i LENTI (`node --check` ok).

| Controllo (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`) | Esito |
|---|---|
| `calendario-218` verde | VERDE (uscita 0) |
| `calendario-218` rosso (`CPM_ROSSO218=1`) | ROSSO, 22 controlli falliti (uscita 1) |
| `design-system` | VERDE dopo il token di `src/15` (prima: 1 raggio a mano, preesistente) |
| `griglia-mobile` | uscita 0, «misura completa: 14 schermate x 5 larghezze» |
| `hud-c3` | uscita 0 |
| `nomi-190` | VERDE 23/0 |
| `nomi-211` | VERDE 22/0 |
| `career-critical` | VERDE (uscita 0, nessun ❌; piu' di 10 minuti: eseguito in sottofondo con attesa in primo piano sul file d'esito) |
| `test:logic` | 51 pass · 0 fail |
| `save-compat` | 12 pass · 0 fail |

Dopo ogni modifica a `src/`: `node tools/build-src.mjs` + `node tools/check-src.mjs` → IDENTICO BYTE PER BYTE.
Nota di metodo: `griglia-mobile` e un import accidentale di `ci-runner.mjs` (fermato subito) hanno riscritto foto di altri giri in
`docs/collaudo-grafico/g0/` e `docs/sviluppo/giro212/`: ripristinate da git, non fanno parte del giro.

## Dubbi per il PO

1. **«Tema chiaro e scuro».** Dal giro V2/4 il gioco ha **un tema solo** (decisione PO 03/11, guardiano `tema-unico`): non esiste più
   un tema chiaro da misurare. Ho misurato con la vecchia preferenza `cpm-dark` a "1" e a "0" (esiti identici, come deve essere).
   Se per «tema chiaro» si intendeva altro, va detto.
2. **Nomi nella riga a eliminazione a 375.** Con un avversario dal nome molto lungo la scala accorcia entrambi i nomi: la tua squadra
   può scendere fino alla sigla («MER vs Sp. Valparaiso Atl.», vedi foto). È la regola della scala (ogni nome scende solo se non ci
   sta), ma forse il PO preferisce tenere intero il proprio club e accorciare solo l'avversario.
3. **Colore dell'esito.** Ora l'esito si legge da fondo scuro tenue + bordo + colore del punteggio; il verde/rosa pieno della foto non
   c'è più. Da confermare sul telefono che la differenza vinta/pari/persa resti evidente a colpo d'occhio.
4. **Ritocco fuori ambito** in `src/15` (raggio → token, stesso valore) fatto solo per non lasciare rosso `design-system`, che lo era
   già sulla base `lavoro/195`. Nessun rosso dedicato: non cambia nulla a schermo.
5. **`MatchBadge`** è una primitiva condivisa: la lettera scura vale ovunque sia usata, non solo nel calendario. Misurata solo nelle
   schede Calendario/Coppe/Nazionale.
6. Nella foto del PO la riga «Ottavi di Finale» ha fondo giallo e «0–0»: nel codice il fondo pari compare solo su una gara giocata
   pareggiata; non ho riprodotto quel salvataggio, quindi non posso confermare se fosse una gara giocata o un dato anomalo.
