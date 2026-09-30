# Prompt per Codex — collaudo highlight, passo 3

## Com'è andato il collaudo mirato (7.999.61, 32 casi)

Buon lavoro. Il metodo regge: 32/32 casi con esito richiesto = esito osservato, 0 aperture nere nelle
acquisizioni finali. Cosa ne abbiamo fatto noi:

- **003 su gi30 e gi123 — CONFERMATO nel codice.** «Dribbling centrale e conduci» (gi30) e «Giratone e
  conduci» (gi123) sono azioni offensive con premio `rew:"recovery"`: il risolutore pesca i testi del
  recupero difensivo («Recupero decisivo», «Anticipo perfetto», «Riaggressione immediata»). Lo correggiamo noi.
- **001/002 su gi31, gi6, gi44** (protagonisti sotto il pannello delle azioni o fuori quadro in apertura):
  in coda da noi, con misura dell'altezza apparente e della quota fuori quadro prima di toccare la camera.
- **001 su gi81** (barriera annunciata ma difensori sparsi): in coda, da misurare.
- **Harness:** la tua segnalazione su `waitForFunction` era giusta, corretta in `tests/visual/lib/harness.mjs`.
- **Tabellone 1–0/0–0 della consegna parziale:** non riprodotto da noi (resta aperto, nessuna azione).

## Cosa fare adesso

Stesso metodo del collaudo mirato, **sulla versione attuale di `main`** (7.999.69 o successiva: annota
versione e commit), su famiglie di scene che non hai ancora toccato. **15 scene × 2 esiti = 30 casi**:

| Famiglia | Scene (gi) | Perché |
|---|---|---|
| Rovesciata / tap-in | 1, 2 | 7.999.68 ha cambiato il contatto della rovesciata: serve un occhio esterno |
| Rigore in partita | 58 | 7.999.68 ha messo il portiere sulla linea |
| Punizioni dirette | 13, 161 | area storica di difetti (salto del pallone, portiere) |
| Deviazione ravvicinata / volée dal limite | 4, 9 | conclusioni al volo mai collaudate da te |
| Difensive | 33, 133, 138, 168 | storicamente eroe fuori quadro sulle difensive |
| Sfida aerea / velo | 134, 110 | note del PO ancora aperte (001/006 sulla 134, 111 sulla 110) |
| Ricezione tra le linee | 24 | controllo del pallone e continuità |
| Cambio gioco | 105 | build-up tagliato in 7.999.65 |

Se un gi non esiste o non ha l'azione attesa, scrivilo e passa al successivo: non sostituirlo a caso.

## Regole (invariate)

- Scrivi solo in `reports/codex/` e `tests/codex/`; pusha solo su rami `codex/…`.
- Non toccare `src/`, `CARRIER-MANAGER-AV.html`, `assets/`, `tests/visual/`.
- Pagina nuova per ogni caso; GLB/PRESENT/CINE accesi; 412×915.
- Esito richiesto = osservato, letto da `window.__CPM_TIMELINE()` (`ActionResolved`). Un caso che non
  corrisponde è **non valido** e si conta, non si scarta.
- Usa l'azione per **etichetta** oltre che per indice, e dichiara quando l'indice canonico non è il primo
  pulsante visibile (come hai fatto su gi92).
- Codici solo dal menu del taccuino in `src/15-live-match.jsx` (000–012, 014, 111, 113): leggi lì il
  significato di ciascuno.
  Nessun codice senza la foto che lo mostra; «non verificato» quando il campione non basta.
- Nessuna conclusione su fluidità, FPS o tempi: in headless non valgono.

## Consegna

`reports/codex/2026-10-XX-collaudo-highlight-famiglie.md` + JSON grezzo, con la stessa struttura del
collaudo mirato (tabella codici in testa, poi una riga per caso con foto). In fondo, **le 5 segnalazioni
più gravi** in ordine, ciascuna con gi:azione:esito e il comando per riprodurla.
