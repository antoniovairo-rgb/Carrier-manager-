# Coda dei rapporti Codex da lavorare

Messaggi di Codex messi in coda dal PO. Ogni rilievo resta un'ipotesi finché il team non lo riproduce.

## 04/10/2026 — Allineamento, base CPM 7.999.128 (letto dal team il 05/10)

- **Banco 7.999.105 archiviato** (decisione PO 03/10): nota pubblicata su `codex/2026-10-02-banco-deterministico`, commit `f6d96723` (verificato dal team con `git ls-remote`).
- **Ramo attivo:** `codex/2026-10-04-po077-7999128`, commit `e0bc7e9b` (verificato), creato da main `fba48b4e` (7.999.128). Nessun file del gioco modificato.
- **PO-077:** i 6 casi validi di gi64 (7.999.122) restano il riferimento. Catalogo attuale: gi86 testa all'indice 0; gi90 indici 0-2; gi171 indici 0-1. **gi86 sulla 7.999.128 non verificata:** Chrome ed Edge (D3D11, GLB acceso) sotto 3 GB liberi durante il caricamento, nessuna foto.
- **Passaggi 3D:** sonda adattata alla 7.999.128; scena 38 fermata a 2,94 GB liberi prima di scoprire le azioni: zero casi validi, codici 005/014/012/011 non verificati.
- **Restano:** gi86 e gi90 (3 success + 3 fail), rosso gi171 (3 giri), passaggi 3D, difesa 3D sulla build attuale.
- **Rapporti:** `reports/codex/2026-10-04-po077-7999128.md`, `reports/codex/2026-10-04-passaggi-7999128.md`.
- **Blocco:** memoria del computer del collaudatore. Codex mantiene la soglia di 3 GB indicata dal PO; per misure valide serve più memoria libera all'avvio del singolo caso.

Da fare dal team quando si riprende: leggere i due rapporti dal ramo `e0bc7e9b`; valutare se i casi di testa si possono misurare nella sessione cloud del team (15 GB) invece che sul computer del collaudatore.

**Lettura del team, 05/10** (ramo scaricato, `git log` fino a `e0bc7e9b`; letti `reports/codex/2026-10-04-po077-7999128.md` e `2026-10-04-passaggi-7999128.md`):
- I due rapporti confermano quanto riassunto sopra: **nessuna misura valida** sulla 7.999.128. PO-077 gi86: `valid:false`, `lowMemory:true`, 0 fotogrammi, sia con Chrome (3,510 GiB liberi all'avvio) sia con Edge (4,033 GiB). Passaggi: `discovery:0`, `cases:0`.
- Nulla da riprodurre: non ci sono rilievi sul gioco, solo tentativi non validi dichiarati come tali.
- **Discrepanza da chiarire col PO:** il rapporto parla di una soglia di **3 GiB** «indicata dal PO»; il prompt del team del 04/10 (`docs/governo/prompt/codex-2026-10-04b-ripresa.md`) dice **6 GB**. Non posso confermare quale valore il PO abbia comunicato a Codex.
- Proposta: le scene di testa (gi86, gi90, rosso gi171) si possono misurare nella sessione cloud del team, che non ha il limite di memoria; serve il via del PO, perché finora PO-077 è stato affidato a Codex.

## 06/10/2026 — Passaggio di consegne (decisione PO)

Il PO ha deciso: «le vecchie attività di collaudo in sospeso collaudale tu, ripartirà da questi nuovi collaudi».

- **Codex** riparte da zero con il prompt delle zone ferme (DECISIONI 06/10):
  - A: PO-209/216, tabellino;
  - B: PO-048/127, camera;
  - C: PO-210, fisarmoniche del post-partita;
  - D: PO-203, piedi nell'esultanza.
- **Il team** si prende i collaudi rimasti in sospeso:
  1. PO-077: colpi di testa gi86 e gi90 (3 riusciti + 3 falliti) e il rosso di gi171 (3 giri). Prima della 7.999.143 nessuna misura era valida.
  2. Passaggi 3D, conferma dei codici 005/014/012/011 (PO-147, scena 38).
  3. Difesa 3D sulla build attuale: ipotesi 001 «apertura» e 002 «fuori quadro» di PO-185 (gi138, gi36, gi45, gi133f, gi168f, gi31f, gi32, gi36s), dentro PO-123.
  4. PO-143: taccuino #64, #126, #18.
  5. PO-153, fase 1 carriere: 30 carriere × 10 stagioni con la scheda estesa (`reports/codex/PROMPT-2026-10-01-carriere-fase1-completa.md`). Sblocca PO-098 e PO-154…157 (L6).
- **Ordine:** prima le voci di L1 (1-4), poi la fase 1 carriere (L6).
- **Regola:** nessuna catena va interrotta. Le sonde pesanti girano solo fra una catena e l'altra.

## 06/10/2026 — Rapporto Codex sulle zone ferme (main `6f35d47f`, 7.999.143)

Codex ha lavorato in sola lettura, senza commit né PR. Il banco era Chrome 154 headless (fallback dell'harness), non il Chromium di Playwright: le misure sono esplorative.

- **A · PO-209/216, tabellino.**
  - 5 partite: 4 autoplay e 1 manuale con 5 azioni.
  - Tabellone e gol del motore concordano in tutte e 5. Nessuna nota `auto216`.
  - Tabellino visibile letto in 4 partite su 5.
  - Prova con gol iniettato non valida: l'iniezione non si è attivata.
  - NON CHIUSO.
- **B · PO-048/127, camera.**
  - 3 esecuzioni forzate: #3 due volte, #74 una volta.
  - Il punto dei piedi dell'eroe è fuori quadro in 22 fotogrammi su 717; 20 sono attorno al gol della prima #3.
  - Nessun palo che copre l'eroe.
  - Ipotesi da verificare: sagoma tagliata al gol della #3.
  - NON CHIUSO.
- **C · PO-210, post-partita.**
  - 9 chiusure e 9 riaperture corrette a 360, 375 e 412 px; nessuno scorrimento orizzontale.
  - Manca il controllo visivo di testi tagliati e sovrapposizioni.
  - NON CHIUSO.
- **D · PO-203, piedi nell'esultanza.**
  - #74, 53 campioni: piede più basso a 0,093–0,558 u, contro 0,119 da fermo; nessun campione sotto 0.
  - Il picco coincide con la clip `lift`.
  - NON CHIUSO.

**Regola applicata:** le quattro zone restano ferme e il team non corregge nulla finché il collaudo non è dichiarato chiuso. I rilievi restano ipotesi finché non sono riprodotti.

## 07/10/2026 — Collaudi ereditati, eseguiti dal team (CPM 7.999.145, Chromium di Playwright)

- **PO-077, colpi di testa: nessun difetto.**
  - Sonda `testa-tempismo-test.mjs`, a cui è stato aggiunto `CPM_ESITO` per scegliere l'esito.
  - gi86 (×3) e gi90 (azioni 0-2), esito riuscito e fallito: 12/12 verdi. Picco del salto al contatto entro 0,10 s; pallone alla testa entro 0,248 u; salto 0,32-0,34 u.
  - gi171 rosso (`__CPM_NO_TESTA33`/`__CPM_NO_TUFFO109`), 3 giri: scarto 0,61-0,67 s, nessun gesto al contatto. Il difetto si vede.
  - gi171 verde, 3 giri: scarto 0,06-0,10 s.
- **PO-147, passaggi della scena 38: due difetti riprodotti.**
  - `daievai-92.mjs`, azioni 0-2 × riuscito/fallito, 6 casi: 014 = 0, 012 = 0, 005 = 3 (una per ogni esito riuscito), 011 = 2.
  - 011 negli esiti falliti di «Accelera in profondità» e «Conclusione di prima» (pallone fermo 2,2 e 1,5 s), misurato con la sonda 2D (GLB spento).
  - **Verifica in 3D** (GLB acceso, foto): gli esiti falliti sono coerenti col testo. «Tiro fuori!»: il pallone va largo fino a (47; 9). «Conclusione murata»: il difensore scivola e il pallone resta vicino. Il pallone fermo è il punto in cui l'azione è finita (muro o intercetto), non un congelamento a metà azione.
  - **Nessun difetto confermato.**
  - Il guardiano in catena guarda solo l'azione 0.
- **PO-185, difesa 001/002: confermate su 2 scene.** Sonda in scratch: inquadratura dell'eroe e del pallone ogni 150 ms, più foto.
  - **Confermata su gi138** «Allineamento difensivo immediato»: pallone mai inquadrato (60/60 campioni nel riuscito, 45/60 nel fallito); in foto l'eroe è solo sul prato, senza pallone né portatore.
  - **Confermata su gi133** «Sprint disperato sulla linea»: pallone fuori quadro in 57/60, eroe fuori in 16/60.
  - **Non confermata su gi36** (fallito), **gi45, gi31, gi32**: eroe in quadro; pallone fuori 0-14 volte su 60, tranne gi36 (43/60 nel periodo dopo il gesto, mentre in foto al contatto è visibile).
  - **Da verificare su gi168:** pallone fuori quadro 45/60.
- **PO-143: indizi.**
  - #18, «Dribbling netto e assist» (gi18 azione 0): non ottiene il dribbling di preparazione, perché la regola 7.999.145 riconosce solo sterzata, doppio passo, roulette e rientro.
  - gi126 azione 1, «Stacco difensivo deciso»: è reso come colpo di testa d'attacco al primo palo (type header, variante header_near_post).
  - Colpi di testa #64 (azioni 0 e 2) e #126 (azioni 0 e 1), esito riuscito e fallito: 8/8 sincronizzati (scarto 0-0,05 s, pallone a 0,07-0,24 u dalla testa). Il tempismo non spiega «scena strana» e «azione confusionaria»: non posso confermare la causa delle due note senza il video del PO.

## 07/10/2026 — Secondo giro Codex sulle zone ferme (main `6f35d47f`, 7.999.143)

Banco: Chrome 155 (fallback dell'harness), numeri visivi esplorativi. Codex non ha modificato il repository.

- **A · PO-209/216, tabellino — CHIUSO (Codex).**
  - 5 nuove partite con le scelte fatte dall'interfaccia: tabellone, tabellino visibile e gol del motore concordano 5/5.
  - Iniezione valida: con il motore da 0–0 a 0–1 e il tabellone fermo, a fine gara compare 1 nota `auto216`.
  - Il team accetta la chiusura: nessun difetto riprodotto in 10 partite normali, e il testimone scatta.
- **B · PO-048/127, camera — NON CHIUSO.**
  - 12 scene, 1.860 fotogrammi; punto dei piedi fuori quadro in 189.
  - Rilievo visivo: gi3 «Tiro a giro», esito riuscito, eroe fuori dall'immagine a circa 1,7 s di scena (visibile a 1,5 s, rientra a 2,7 s).
  - Ipotesi, zona ferma: nessun intervento finché il collaudo non è chiuso.
- **C · PO-210, post-partita — NON CHIUSO.**
  - Prova valida solo a 360 px con le sezioni aperte.
  - Chiusura non provata; 375 e 412 px incompleti.
- **D · PO-203, piedi nell'esultanza — NON CHIUSO.**
  - 4 esultanze (#3, #2, #24, #74). Fuori dalla clip `lift`: piede più basso a 0,091–0,240 u, 0 campioni sotto il prato.
  - Manca la quinta esultanza e una verifica visiva della sospensione.

## 07/10/2026 — PO-185 difesa 001/002: tentativo 7.999.146 annullato (non dimostrato)

- **Censimento delle 30 scene difensive** (apertura a 900 ms, sonda 2D):
  - pallone alle spalle dell'eroe in 4–5 scene su 30;
  - fuori quadro in 3–4;
  - i casi cambiano da un giro all'altro.
- **Correzione provata:** portatore = avversario davanti all'eroe, portiere escluso (`src/15` blocco `_pal84`, rosso `__CPM_NO_PORT149`).
- **Esito: correzione annullata.** Accesa 3/30 contro 4/30 spenta: differenza nel rumore della misura.
- **Analisi dei casi rimasti:**
  - in gi132 e gi168 il pallone è esattamente su un avversario alle spalle dell'eroe;
  - l'eroe parte a x 8 e x 22, vicino alla propria porta;
  - ipotesi: il portatore scelto davanti lo supera prima della scelta e il pallone lo segue. Da verificare con una traccia nel tempo, non con un solo campione;
  - gi31: pallone ancora a (50; 50), quindi misura presa prima dell'allestimento (artefatto della sonda).
- **Resta** il rilievo confermato in foto su gi138 e gi133. Nuova misura serve prima di toccare di nuovo il codice.
- **Secondo tentativo, anch'esso annullato.**
  - **Traccia nel tempo:** il portatore è alle spalle dell'eroe fin dall'allestimento. `src/12` lo porta a «eroe − 6»; su gi138 eroe a x 24, portatore a x 19.
  - **Correzione provata:** «eroe + 6», eccezione per le scene di rincorsa, più la regola del 2D.
  - **Misura 3D** su 10 scene (riuscito e fallito): pallone fuori quadro 196 campioni con la correzione accesa contro 190 da spenta; gi138 47/60 in entrambi.
  - **Conclusione:** il portatore alle spalle esiste, ma non spiega il pallone fuori quadro. La causa del pallone fuori quadro su gi138/gi133 resta aperta: non posso confermarla.
- **Il gioco resta identico alla 7.999.145.**

## 07/10/2026 — Terzo giro Codex sulle zone ferme (main `6f35d47f`, 7.999.143): tutte e quattro CHIUSE

Banco: Chrome 155 (fallback dell'harness), esplorativo; pagina nuova per scena, tempo di scena. Repository non modificato.

- **A · tabellino — CHIUSO.**
  - Semi 777–781, con 3–10 scelte manuali: tabellone, tabellino e motore concordano 5/5; nessuna nota `auto216`.
  - Testimone provato: motore 0–1 contro tabellone 0–0, poi 1 nota a fine gara.
- **B · inquadratura — CHIUSO come collaudo, difetto riprodotto da Codex.**
  - 60 foto (10 scene × 6): 9 interessate, in 4 scene.
  - Eroe tagliato o non visibile:
    - #3 «Tiro a giro», riuscito: circa 1,7–2,4 s;
    - #38 «Dai e vai preciso», fallito: circa 2,0–3,0 s;
    - #64 «Testa potente angolato», fallito: circa 1,2–2,4 s.
  - Palo davanti all'eroe: #74 «Prima intenzione — dentro!», riuscito, circa 2,4 s.
  - **La zona torna al team:** il team riproduce sul proprio ambiente prima di correggere.
- **C · post-partita — CHIUSO.**
  - 360/375/412 px, sezioni aperte e chiuse, alto e basso: nessun taglio o sovrapposizione.
  - Larghezza del documento uguale alla viewport.
- **D · piedi nell'esultanza — CHIUSO.**
  - 5 esultanze, 330 campioni: 0 sotto il prato.
  - Le quote alte coincidono con salti riconoscibili in foto.

## 07/10/2026 — Rapporto Codex zone E-F (main `22629405`, 7.999.145): entrambe CHIUSE

Banco: Chrome 155 (fallback), esplorativo; pagina nuova per prova; repository non modificato.

- **E · PO-176, salvataggio e ricarica — CHIUSO.**
  - 11 cicli: prima e dopo una partita, a metà settimana, al cambio di stagione, dopo un prestito.
  - 6 identici. Negli altri solo normalizzazioni interne:
    - `fitnessCoachRel` assente → 50;
    - a inizio S13, `playedMd` della S12 → elenco vuoto della S13;
    - `cup.club` assente → club corrente;
    - identificativo del club aggiunto a una voce storica.
  - Nessuna perdita visibile: classifica, calendario, risultati, contratto, statistiche, rivale e sponsor invariati; nessuna giornata tornata «da giocare».
  - Non confermati: la resa di tutte le schermate e l'effetto futuro dell'identificativo storico.
- **F · PO-183, partita rigiocata — CHIUSO.**
  - 12/12 prove valide (S12 W38): interruzioni durante la partita, al fischio, in background, durante la conferenza.
  - In 12/12: risultato coerente con calendario e storico, settimana 38→39, una sola partita aggiunta, classifica 33→34.
  - Non confermata l'interruzione durante il discorso del mister: il banco non avviava quel percorso.
- **Codex non ha zone assegnate.**

## 09/10/2026 — Rapporto Codex zona G (PO-153, fase 1 carriere), base `f7026f4f` (7.999.148): MISURATA, NON CHIUSA

Riportato dal PO in chat il 09/10. Codex non ha modificato file del repository né fatto commit o push.

- **Campione:** 39 carriere × 10 stagioni (10 create dall'interfaccia), 6 percorsi fino al ritiro, 20 coppie biforcate sulle interviste, 5 coppie economiche, confronto separato di 12 voci dell'Ufficio.
- **Ricontrolli:** nel campione principale nessun errore JavaScript e nessuno scarto GF/GS nella stessa lega.
- **Da verificare (Codex):**
  - percentuale effettiva di partite iniziate da titolare;
  - conseguenze attribuibili ai singoli eventi;
  - fase internazionale senza `__CPM_SIM_NAT=1`;
  - coppie che differiscono per la scelta di un'offerta.
- **Avvisi sul contratto:** 84, di cui 80 nel seme 15. Non confermato che producano un problema visibile.
- **Ruoli:** la creazione normale assegna attaccante; i controlli sintetici con «portiere» non provano che sia un ruolo giocabile.
- **Collaudi precedenti fuori dalla zona G:** sospesi su richiesta del PO, da non considerare tutti conclusi.
- **Stato per il team:** zona G **NON CHIUSA** — resta ferma: il team non tocca stagioni, offerte, impulsi, Nazionale, difficoltà, economia e Ufficio. I rilievi non riprodotti dal team **non sono difetti confermati** (ipotesi fino alla riproduzione).

## 09/10/2026 (sera) — Chiusura dell'esecuzione dei collaudi A–G (Codex), base zona G `f7026f4f` (7.999.148)

Riportato dal PO in chat il 09/10. Codex: «chiusura del lavoro di verifica, non un'approvazione senza riserve del gioco». Nessun file del repository modificato, nessun commit/push/PR.

- **A–F:** esito per i campioni richiesti.
- **G:** stesso campione (39 carriere × 10 stagioni, 6 percorsi al ritiro, 20 coppie di scelte, 5 coppie economiche). Due fatti **riprodotti da Codex** (prova grezza, script sulla macchina del PO, non nel repo):
  - un eroe classificato «non convocato» riceve comunque una presenza quando la gara viene simulata → la percentuale reale di partenze da titolare non e' confermabile dalle carriere simulate (→ PO-222);
  - un investimento pendente aggiunge €55.000 alla stagione successiva nel confronto controllato; il catalogo assegna lo stesso flag a tre scelte con promesse diverse; il percorso dall'interfaccia di ciascuna scelta non e' verificato (→ PO-223).
- **Eventi:** 99 dei 106 impulsi comparsi nel campione, tutti con almeno un effetto di stato; un clic reale verificato (fatica 13→28, forma 70→77, applicato una volta); seguito sponsor→shooting in 39/39 carriere. Non confermato che l'effetto di ogni impulso sia visibile al giocatore.
- **Ancora non verificati:** fase internazionale naturale senza flag di simulazione; portiere non selezionabile nella creazione normale.
- **Stato per il team:** zona G **resta NON CHIUSA e ferma**. I due fatti sono riprodotti da Codex ma **non ancora dal team**: restano ipotesi nel registro (PO-222, PO-223) finche' non li riproduco sul codice attuale, e non si toccano finche' la zona G e' congelata.

### Rapporto finale A–G (Codex, 09/10 sera) — esiti per zona

Codex: «non equivale ad approvare tutte le funzioni del gioco». Prove sui commit fissati per ciascun giro; nessun file del gioco modificato o pubblicato.

| Zona | Base | Esito riportato da Codex | Lettura per il team |
|---|---|---|---|
| A — tabellone, tabellino, gol del motore | 7.999.143 | nessun nuovo disallineamento confermato nel campione | la prova artificiale della nota auto216 **non vale** finche' non si dimostra che l'iniezione e' scattata |
| B — camera negli highlight | 7.999.143 | scena #3: punto dei piedi fuori quadro 20/717 fotogrammi | da solo non prova la sagoma tagliata; banco ≠ telefono |
| C — fisarmoniche post-partita | 360/375/412 px | nessun difetto riproducibile sufficiente a bloccare | — |
| D — piedi nell'esultanza | 7.999.143 | nessun affondamento/volo riproducibile (salto distinto da appoggio) | risultato di banco, non telefono |
| E — ricaricamento carriera (PO-176) | 7.999.145, 11 cicli | 0 errori di pagina; 5 cicli con valori cambiati | il conteggio delle differenze non prova una perdita: va letto **campo per campo** |
| F — partita interrotta (PO-183) | 7.999.145, 12 casi | nessuna riproposta di partita gia' registrata nei casi completati | — |
| G — sistemi di carriera (PO-153–157) | 7.999.148, 39×10 | campione completo; **anomalia presenze riprodotta** (PO-222); limiti di misura | **non supera l'approvazione funzionale piena** |

Dettagli G aggiuntivi: 10 carriere dall'interfaccia + 29 sintetiche; 6 fino al ritiro (2 deboli, 2 medie, 2 forti); 0 errori JS, 0 scarti GF/GS. Scelte d'intervista (20 coppie): effetto immediato sulla fiducia, effetti a due stagioni non sempre dello stesso segno. Economia (5 coppie): il ramo staff/accademia/investimenti finisce con meno denaro e talvolta OVR piu' alto, non in modo uniforme; indicatore d'investimento: €100.000 → €155.000 contro €100.000 (verifica l'indicatore, non le tre scelte dall'interfaccia, PO-223). Presenze: «non convocato» prima della gara, poi presenze 0→1 e storico 0→1 dopo la partita simulata, senza errori JS (PO-222). Nazionale: il flag `__CPM_SIM_NAT=1` cambia l'avanzamento di una fase; frequenza ed effetto nel percorso naturale non confermabili. Portiere: controlli sintetici, non provano che sia selezionabile o giocabile.

**Condizioni di Codex per l'approvazione di G:** chiarire la presenza al «non convocato», la quota reale di partenze da titolare, gli effetti reali delle scelte evento non provate singolarmente.
**Stato per il team:** collaudi A–G **conclusi come esecuzione**; nessuna zona promossa ad «approvata» da questo rapporto; zona G **ferma** finche' il PO non la riapre.
