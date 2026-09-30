# Prompt per Codex — Collaudo difesa 3D su CPM 7.999.82

Ripeti il tuo collaudo «highlight famiglie» (rapporto 2026-09-30, base 7.999.69) sulla build attuale e allargalo alle scene difensive: nel rapporto precedente le scene d'attacco erano pulite e tutti i codici 001/002/003 erano nelle scene di difesa.

## Base
- Ramo `main`, commit `fa129a41` (CPM 7.999.82). Scrivi il commit esatto nel rapporto; se `main` è avanzato, usa l'ultimo commit e dichiaralo.
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO su un ramo `codex/2026-09-30-collaudo-difesa-3d`. Non toccare `src/`, `tools/`, altri test, `main`.

## Casi (gi = indice del catalogo, lo stesso che hai usato: 33 = «Muro in area», 133 = «Recupero sulla linea di fondo»)
Per ogni scena: azione 0, esito `success` e `fail` forzati → 2 casi per scena.
- Ripetuti dal rapporto precedente (per dire cosa è ancora vero): **33, 133, 134, 138, 168**
- Nuovi: **31** (scivolata), **32** (anticipo filtrante), **36** (duello aereo su corner), **44** (cross in area, allontana), **45** (tiro sulla linea), **128** (chiusura urgente), **137** (tackle in corsa), **157** (gettati sulla traiettoria), **184** (lettura della linea di passaggio — intercetta)
- Controllo: **24** e **2** (attacco, erano puliti) — servono a vedere se la build nuova ha rotto l'attacco.
Totale 16 scene × 2 = 32 casi.

## Metodo (come l'ultima volta)
- Viewport 412×915, pagina nuova per ogni caso, GLB + presentazione + cinema attivi (`__CPM_GLB=true`, `__CPM_PRESENT=1`).
- Forza con `__CPM_FORCE_SIT(gi,…)`, `__CPM_FORCE_OUTCOME`, `__CPM_RESOLVE(0)`; verifica l'esito con `__CPM_TIMELINE()` → `ActionResolved`. Un caso vale solo se l'esito richiesto e ActionResolved coincidono; i tentativi non validi restano nel grezzo.
- 6 foto per caso: 01-apertura, 02-scelta, 03-rincorsa, 04-contatto, 05-volo, 06-esito.
- Allega la bozza automatica `__CPM_DRAFTNOTE` come dato grezzo, distinta dal tuo giudizio.

## Per ogni caso, rispondi a queste domande con la foto che lo prova
1. **Apertura (001)**: nella foto 01 si vedono il pallone e l'eroe? Dove sono rispetto a quello che dice il titolo (es. «in area», «sulla linea di fondo»)? Distanza eroe–pallone dal testimone.
2. **Inquadratura (002)**: nelle foto 03-05 l'eroe e il pallone restano nel quadro? Quale esce e in quale foto?
3. **Esito visibile (003)**: il testo finale (titolo + riga) descrive quello che si vede? Segnala in particolare testi da portiere («Il portiere dice no», «Para in tuffo», «SALVATO») su scene dove il portiere non è in quadro o dove ha agito l'eroe; e tabellone che cambia prima che il tiro arrivi in porta.
4. **Gesto**: si vede il gesto difensivo scelto (scivolata, blocco col corpo, colpo di testa, intercetto)? Sì / no / parziale.

## Rapporto
`reports/codex/2026-09-30-collaudo-difesa-3d.md` con la stessa struttura del precedente, più:
- una tabella **Prima (7.999.69) → Adesso (7.999.82)** per le 5 scene ripetute: codici prima, codici adesso;
- per ogni codice, il conteggio sui 32 casi;
- le 5 segnalazioni più gravi con il comando per riprodurle.
Dati grezzi compressi in `tests/codex/collaudo-difesa-3d.json.gz`.

## Regole
- Scrivi in italiano. Non inventare: se una foto non basta a decidere, scrivi «non verificato».
- Campioni headless: nessuna conclusione su fluidità, FPS o tempi di risposta.
- Le anomalie restano ipotesi finché il team non le riproduce; non proporre patch al codice del gioco.
- Non usare credenziali di terzi.
