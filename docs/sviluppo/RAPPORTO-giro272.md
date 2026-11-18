# Rapporto giro 272 — tabellone dei rigori e ripartenza dopo il rigore

Ramo `sviluppo/giro272-tabellone-ripartenza` da `lavoro/197` (7398dada). Decisione PO-516 (18/11 14:10): un rosso nato nella 197 si ripara prima dell'uscita.
**Gioco invariato**: nessun file `src/` toccato, nessun `GAME_VERSION`. Corretti solo i controlli (`tests/visual/sonda-214.mjs`, `tabellone-214.mjs`, `ripartenza-piazzato-27.mjs`). Motivazioni in `docs/governo/DECISIONI.md` (voce «giro 272»).

## Esiti

| Controllo | 7.999.196 (3076a1b7) | 197 prima (7398dada) | 197 dopo (questo ramo) |
|---|---|---|---|
| tabellone-214 | madre: verde 2/2 · **qui: rosso 1/1** (pixel 723 su A e D, 1798 su B; D «serie 11/12») | rosso (ordine 216: tabellone eroe a sinistra 0; pixel 723) | **verde 2/2** di fila (t214-7, t214-8); rossi C (~34.000 pixel) ed E cadono |
| ripartenza-235 | madre: verde | rosso («rigore verde: nessuna battuta dopo il gol: misura cieca») | **verde 2/2** |
| ripartenza-piazzato-27 (verde + rosso, rigore + punizione) | — | rigore verde cieco (`ponte257` = 3) | verde; rosso `__CPM_NO_SCHIERA27` cade (fuori 6) su entrambi |
| battito-264 | — | — | verde (0 divergenti su 3), rosso cade |
| solo-highlight-166 | — | — | verde, rosso cade su 3, 7 e 8 |
| test:logic | — | — | 51/51 |
| save-compat | — | — | 12 pass · 0 fail |

Guardiani della mappa mirata: nessuno, perché non è stato toccato nessun file `src/`.

## Commit che li fa nascere

Li ho trovati cercando nel codice il commit che ha introdotto il meccanismo (`git log -S`), poi ho misurato il meccanismo. **Non ho fatto un bisect completo**: non ho fatto girare il controllo sul commit prima e su quello dopo.

1. **tabellone-214 → 8ef0d6c7** (giro 251, PO-512, nomi definitivi dei club). Il salvataggio di prova «FC Salernum»/«SAL» viene migrato a «FC Salernum 1919»/«SLR». Il tabellone è giusto. Era la sonda a pretendere `'SAL'`, scritto a mano. Misurato: `tab SLR 0—0 … 5—4` in ogni campione.
2. **ripartenza-235 → 721d29ca** (giro 257, decisioni PO 17/11: «il ponte non nomina l'eroe sul dischetto senza premio»). L'ipotesi del giro 264 è **verificata**: `conta.ponte257` = 3 su 3 richieste e la scena del rigore non si apre mai. La sonda ora mette nel salvataggio il premio «il rigorista sei tu» (`premiPatto227.rig`), cioè la strada che il gioco consente. Con `CPM_SENZA_PREMIO272=1` si torna alla misura cieca.

## Difetti di strumento (presenti anche sulla 196)

Nella sonda-214 ho trovato quattro instabilità, riparate con la regola PO-311 e senza toccare nessuna soglia:
- **Stato e DOM sfasati di un fotogramma.** Esempi: «RIGORI 4–3 | serie 3–3», oppure «🏆 1–1» con la partita ancora in `shootout`. Ora si legge due volte, a due fotogrammi di distanza, finché le due letture coincidono.
- **Riquadro misurato prima della copia congelata.** Era 2 px più alto della copia, e nelle due righe scoperte si vedeva il 3D (723 pixel). Ora il riquadro si prende dalla copia.
- **Tela nascosta.** Nascondendo la tela cambia il livello di composizione: risultava 1 pixel diverso, per antialiasing, all'angolo di un pallino verde. Ora la tela viene invertita: i livelli restano gli stessi e il 3D visto in trasparenza cambia comunque.
- **Lettura «dopo la serie» a tempo fisso (+1,2 s).** Su PC la cerimonia a volte era già finita. Ora si aspetta l'evento: prima lettura stabile in cerimonia, con la striscia tornata alla partita.

Per compensare il costo della lettura stabile, il passo fra due campioni è sceso da 500 a 150 ms (`CPM_PASSO214`). Il minimo di 5 campioni giudicati resta invariato; misurati 6-8.

## Dubbi per il PO

1. **«Verde sulla 196».** In questa sessione tabellone-214 originale sulla 7.999.196 è uscito **rosso** (1 corsa, pixel 723/1798), contro i 2 verdi su 2 della sessione madre. Con la sonda riparata questa parte non dipende più dalla macchina. Non posso confermare perché alla madre fosse uscito verde.
2. **Cerimonia della finale breve su PC.** Sul banco la cerimonia della coppa su PC, in trasferta, è passata a `ended` 2-6 s dopo la serie, sia su 196 sia su 197. Il gioco prevede 17,5 s (`ceremonyEndRef`). Non ho trovato chi la chiude: non è nato nella 197, ma è un comportamento da guardare dal vivo. Il controllo ora legge la cerimonia appena c'è, quindi non lo giudica più.
3. **Sigla al posto del nome.** Sul telefono, in cerimonia, la striscia mostra «SLR SLR» (stemma + sigla al posto del nome lungo «Salernum 1919», regola NomeSquadra182). È coerente con le regole esistenti, ma con i nomi del 251 succede più spesso. Va bene così?
4. **Ripartenza dopo il rigore senza premio.** Senza il premio, in carriera il rigore lo tira un compagno. Il caso «rigore segnato da un compagno → ripartenza dal centro» non è coperto da questo guardiano. Lo copre in parte ripartenza-235 sui gol ambientali. Serve un braccio dedicato?
