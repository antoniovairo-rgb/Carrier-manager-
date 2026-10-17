# Banco degli highlight dell'eroe — PO-248

**Giro 21 · 14/10/2026 · ramo `sviluppo/banco-highlight-248` · base `lavoro/167` (7.999.167) · nessun bump di versione, nessuna modifica a `src/`.**

Direttiva PO 14/10, come riportata nel compito: «Puntiamo molto alla fluidità, credibilità degli highlights dell'eroe a tutto tondo!».
Questo lavoro **misura, non corregge**: le correzioni sono in corso su altri rami (giro 17 `sviluppo/scene-gesti-022`,
giro 18 `sviluppo/ripartenza-207`, giro 19 `sviluppo/rilievi-collaudo-242`).

> ⚠️ **Fonti che non ho trovato.** La voce `PO-248` e la decisione «14/10 sera — priorità» **non compaiono** né in
> `docs/governo/BACKLOG.md` né in `docs/governo/DECISIONI.md`, né su `lavoro/167` né su `origin/main` (verificato il 14/10:
> `main` ha solo «14/10 sera — fonti dei Crediti» e «14/10 sera — Pubblica il prima possibile»). La citazione della direttiva
> viene dal testo del compito: **non posso confermarla dal repository**. Le voci lette e usate sono PO-218, PO-229 e PO-242.

---

## 1. Lo strumento

`tests/visual/banco-highlight-248.mjs`, con gli script npm (dalla cartella `tests/visual`):

```bash
export CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
npm run banco-248:tiro        # una famiglia = un gruppo, < 10 minuti (misurato 166-346 s)
npm run banco-248:testa       # … volee cross passaggio dribbling contrasto rigore punizione difesa
npm run banco-248:rapporto    # aggrega out/banco-248/*.json, esce 2 se una famiglia è cieca
```

**Cosa fa.** Per ogni famiglia sceglie dal repertorio (191 scene) 3 scene (tiri e piazzati) o 4 (le altre), sparse in modo
deterministico fra le candidate, e per ognuna gioca ogni esito previsto:

| famiglia | esiti giocati |
|---|---|
| tiro, testa, volée, rigore, punizione | gol (azione con premio «goal», successo) · sbaglia (fallimento, tipo deciso dal gioco) · parata · fuori · murata (tipo forzato) |
| cross, passaggio | riesce · sbaglia (tipo deciso dal gioco) · intercetto (tipo forzato) |
| dribbling, contrasto, difesa | riesce · sbaglia (tipo deciso dal gioco) |

La famiglia viene da `deriveHL` (la stessa funzione con cui il gioco decide tipo e variante): volée = variante `shot_volley`;
contrasto/difesa = scene `type:"def"` separate per etichetta (contrasto, scivolata, tackle, raddoppio, pressing, corpo, blocco,
chiusura → contrasto; il resto → difesa); dribbling = tipo `dribble` oppure passaggio/costruzione con etichetta da dribbling.

**Condizioni di misura.** GLB acceso (`__CPM_GLB=true`, direttiva PO 29/07), `__CPM_PRESENT=1` (teatro acceso, 7.345), passaggio da
`hl_intro`, **pagina nuova ogni 4 esecuzioni** (mai 191 scene sulla stessa pagina, 7.483). Prima di ogni scena se ne forza una
diversa (scena-esca) perché ripetere la stessa scena la ritrova già schierata.

**Testimoni letti — tutti già nel gioco, nessuno nuovo:** `__CPM_FRAME480` (taglia e fuori quadro, apertura) · `__CPM_GK229`
(portiere e pallone in tempo di scena) · `__CPM_PIEDI` (pattinamento) · `__CPM_GST` (gesto GLB dell'eroe) · `__CPM_BJ478` (salti del
pallone con lo scrittore, soglia abbassata a 3u) · `__CPM_CAMSTEP93` (passi di camera con snap/taglio) · `__CPM_REA519` (reazioni
avversarie) · `__CPM_ORF516` · `__CPM_RES218` · `__CPM_OUTCOME` (riquadro) · `__CPM_OWN`/`__CPM_STATE`/`__CPM_PROBE`/`__CPM_CUTLIVE`/
`__CPM_SCENET`. L'unica cosa nuova è un campionatore in pagina (`requestAnimationFrame`) che a ogni fotogramma annota **tempo
reale e tempo di scena**, fase, stacco nero vivo, eroe/pallone/camera dalle mesh e gesto GLB.

**Uscita.** 0 = misura valida · **2 = cieco** (meno di 2 esecuzioni giudicate in una famiglia, o una famiglia mai misurata nel
rapporto) · 3 = errore d'uso. Verificato: il rapporto esce 2 quando mancano famiglie (prima passata parziale: «BANCO CIECO su:
testa (non misurata), …»), e `CPM_SCENE=0 node banco-highlight-248.mjs dribbling` esce 2 («BANCO CIECO su «dribbling»: 0
esecuzioni giudicate, minimo 2»).

### 1.1 Soglie (dichiarate prima di misurare; stampate nel file)

| misura | soglia | perché |
|---|---|---|
| fotogramma lungo / picco | 50 ms / 100 ms reali | sotto 20 fps il moto si legge a scatti; 1/10 s è un inciampo visibile |
| salto dell'eroe | > 1,0u **e** > 20 u/s di scena **e** > 2,5× il passo vicino più grande | cap del modello di movimento 15 u/s (5.47.9) + margine per affondi |
| salto del pallone | > 3,0u e > 60 u/s e > 2,5× i vicini | un tiro forte vero sta sui 30 m/s; il confronto coi vicini separa un volo veloce da un teletrasporto |
| salto della camera | > 2,5u e > 60 u/s e > 2,5× i vicini | 2,5u è la soglia del testimone `__CPM_CAMSTEP93` |
| peso del gesto che salta | Δpeso > 0,5 in un passo di scena (≤ 0,05 s) sulla **stessa** clip | dissolvenza sotto 0,1 s |
| eroe congelato | ≥ 80% dei fotogrammi dei primi 2 s di scena con eroe fermo **e** senza gesto (peso > 0,1) | |
| pattinamento | > 0,10 dei fotogrammi con piede a terra che scorre > 0,5 m/s | definizione del testimone (OmniControl, ICLR 2024): 0,05-0,10 è la fascia dei metodi buoni |
| 001 | pallone a > 3u logiche dal corpo più vicino, finestra di scena 0,3-1,0 s | |
| 002 | eroe a > 3u logiche dal suo posto logico (`heroTarget`) | |
| eroe «figurina» | altezza apparente < 0,08 | censimento 7.480. **Non** 0,15: il PO ha bocciato la regia stretta sul telefono (7.509) e la mediana voluta è ~0,14 |
| eroe fuori quadro | > 30% dei fotogrammi della conclusione | |
| portiere | tuffo: corpo che parte > 0,05 s di scena **dopo** il passaggio del pallone sul suo piano; riflesso (`gk_block`): armo del gesto dopo l'arrivo, oppure spostamento tardivo se il pallone passa oltre 1,2u; lato opposto; fermo con pallone a portata (≤ 4,5u). Bruciapelo (< 0,20 s) non giudicato | criteri di `gk-miss-229` |

### 1.2 Tre correzioni dello strumento fatte durante il giro (misurate, non supposte)

1. **Il «salto» del pallone era una velocità.** La prima stesura chiamava salto ogni passo oltre 60 u/s: sui colpi di testa
   segnava 5-6 «salti» di fila da 3,1-3,5u, cioè un volo continuo. Ora un salto deve essere **isolato** (> 2,5× i passi vicini) e
   la velocità del volo si misura a parte (colonna «v arco»).
2. **L'apertura dipendeva dall'ordine sulla pagina.** La stessa scena dava 0-1,1u alla prima esecuzione di una pagina nuova e
   2-4u dopo altre conclusioni: 001/002 si giudicano **solo sulla prima esecuzione di ogni pagina**, che entra dal gioco fluido
   come nel gioco vero; il dato «dopo un altro highlight» si stampa a parte, senza giudizio.
3. **Con il tipo d'esito forzato il riquadro non segue.** `__CPM_FORCE_KIND` vale da `src/15-live-match.jsx:9168`, il testo del
   riquadro nasce prima, a `:8994`: forzando «fuori» il riquadro diceva ancora «Il portiere dice di no». È lo strumento, non il
   gioco: la coerenza riquadro↔motore↔3D si giudica **solo sulle esecuzioni a esito naturale** (67 su 117).

Altre esclusioni dichiarate: 001/002 non si applicano a rigori e punizioni (pallone fermo sul punto ed eroe alla rincorsa
**per costruzione**: misurati 3,2-4,3u costanti); il portiere non si giudica sui tiri murati da un difensore; sugli highlight
difensivi il riquadro «Gol subito» si confronta col pallone nella **nostra** porta, non col lessico del tiro.

---

## 2. Risultati per famiglia

117 esecuzioni giudicate su 118 (una punizione non forzabile per l'esito «gol»: nessuna azione con premio «goal» su gi15).
Tempi per gruppo: **166-346 s** (sotto i 10 minuti per costruzione).

| famiglia | giud. | dt reale med/p95 ms | salti eroe/palla/cam | peso | congelato | senza gesto | pattin. eroe (med) | incoer. (naturali) | portiere KO | 001 (prima esec.) | 001 dopo un altro HL | 002 | h eroe med | fuori quadro med | reazioni avv. | v arco med/max u/s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tiro | 15/15 | 106/155 | 0/3/2 | 0 | 0 | 0 | 0,40 | 0/6 | 0/4 | 1/4 | 2/11 | 0/4 | 0,157 | 0,011 | 13/15 | 17,6/21,4 |
| testa | 15/15 | 117/160 | 0/0/0 | 0 | 0 | 0 | 0,68 | 0/6 | 1/7 | 0/4 | 6/11 | 0/4 | 0,167 | 0,118 | 15/15 | 6,8/10,0 |
| volée | 15/15 | 121/166 | 0/6/0 | 0 | 0 | 0 | 0,35 | 0/6 | 1/12 | 0/4 | 5/11 | 0/4 | 0,161 | 0 | 15/15 | 13,7/29,6 |
| cross | 12/12 | 107/146 | 0/0/1 | 0 | 0 | 0 | 0,85 | 0/8 | 2/3 | 0/3 | 3/9 | 0/3 | 0,162 | 0,023 | 9/12 | 19,8/39,6 |
| passaggio | 12/12 | 111/146 | 0/2/0 | 0 | 0 | 0 | 0,79 | 0/8 | — | 0/3 | 6/9 | 0/3 | 0,158 | **0,291** | n.g. | 18,8/25,7 |
| dribbling | 8/8 | 110/152 | 0/0/0 | 0 | 0 | 0 | 0,52 | 0/8 | — | 0/2 | 2/6 | 0/2 | 0,173 | 0 | n.g. | 9,5/21,8 |
| contrasto | 8/8 | 104/137 | 0/0/0 | 0 | 1 | 0 | 0,63 | 0/8 | — | 0/2 | 0/6 | 0/2 | 0,153 | 0 | n.g. | 18,5/51,4 |
| rigore | 10/10 | 114/176 | 0/0/0 | 0 | 0 | 0 | 0,26 | 0/4 | 0/6 | n/a | n/a | n/a | 0,154 | 0 | 9/10 | 31,3/32,2 |
| punizione | 14/15 | 99/142 | 0/0/0 | 0 | 0 | 0 | 0,57 | 0/5 | **4/11** | n/a | n/a | n/a | 0,138 | 0,023 | 7/14 | 29,0/36,9 |
| difesa | 8/8 | 102/153 | 0/0/0 | 0 | **3** | **2** | 0,61 | 0/8 | — | 0/2 | 0/6 | 0/2 | 0,137 | 0,069 | n.g. | 21,0/**92,0** |

«n.g.» = non giudicato (il canale delle reazioni `__CPM_REA519` esiste solo per tiro/testa/cross). Scene misurate: tiro 0, 66, 113 ·
testa 1, 53, 90 · volée 1, 9, 65 · cross 16, 67, 93, 148 · passaggio 3, 56, 108, 148 · dribbling 18, 66, 120, 174 · contrasto 31, 45,
130, 137 · rigore 5, 58 (le sole due candidate) · punizione 13, 15, 78 · difesa 31, 45, 133, 146.

**Cosa NON è emerso (con i suoi limiti):** nessun salto del corpo dell'eroe, nessun salto di peso dentro la stessa clip, gesto GLB
montato in 115/117 esecuzioni, **0 incoerenze riquadro↔motore↔3D sulle 67 esecuzioni a esito naturale**, nessun falso gol.
Sono 67 esecuzioni su 28 scene forzate, non partite vere: la verità degli esiti sulle partite vere resta il campo di `esiti-218`.

---

## 3. I 10 difetti più pesanti

**Peso = frequenza × visibilità.** Frequenza = esecuzioni con il difetto sulle esecuzioni giudicabili per quel difetto.
Visibilità (dichiarata, non misurata): **3** = lo vede chiunque a velocità normale (teletrasporto, corpo immobile, portiere dalla
parte sbagliata); **2** = lo vede chi guarda quel dettaglio; **1** = scelta di regia discutibile, non un errore.

| # | difetto | frequenza (sulle esecuzioni in cui si applica) | vis. | peso |
|---|---|---|---|---|
| 1 | Piedi dell'eroe che pattinano durante la conclusione | 117/117 sopra 0,10 (mediane per famiglia 0,26-0,85) | 2 | 2,00 |
| 2 | Pallone che si teletrasporta in rete al gol (palo → fondo rete in un fotogramma) | 4/13 esecuzioni-gol (tiro 3/3, volée gi9 1) | 3 | 0,92 |
| 3 | Eroe immobile e senza gesto negli interventi difensivi | 4/16 difensive (difesa 3/8, di cui 2 senza clip; contrasto 1/8) | 3 | 0,75 |
| 4 | Rinvio difensivo troppo veloce (fino a 92 u/s) | 5/16 difensive sopra 40 u/s | 2 | 0,63 |
| 5 | Portiere che si sposta tardi o dalla parte opposta (111/112) | 8/43 portieri giudicati (punizione 4/11, cross 2/3, testa 1/7, volée 1/12) | 3 | 0,56 |
| 6 | Pallone che fa un passo indietro di 3u nel build-up aereo | 5/42 aeree (volée gi65 5/5) | 3 | 0,36 |
| 7 | Eroe fuori quadro nella conclusione | 15/117 (punizione 5, passaggio 5 — scelta di regia —, tiro 3, dribbling 2) | 2 (1 sul passaggio) | 0,21 |
| 8 | Nessuna reazione del reparto avversario | 5/54 (cross gi148 3/3, tiro gi66 2) | 2 | 0,19 |
| 9 | Salto isolato della camera (3,5-5,6u in un fotogramma, senza stacco) | 3/117 (tiro 2, cross 1) | 3 | 0,08 |
| 10 | Pallone lontano dai piedi all'apertura dopo un altro highlight (001 in catena) | 24/69 esecuzioni non prime di pagina (prima esecuzione: 1/24) | 3 se vero | non pesato: vedi sotto |

Il #10 non ha un peso perché **non posso confermare che sia il gioco** e non lo strumento.

### Dettaglio, causa probabile e cosa resta «Non posso confermarlo»

**1 · Pattinamento dei piedi (F7).** Su tutte le 117 esecuzioni il piede appoggiato dell'eroe scorre oltre 0,5 m/s in più del 10%
dei fotogrammi; più forte su cross (0,85), passaggio (0,79), testa (0,68), più basso sul rigore (0,26). È coerente con il rapporto
Codex a 60 FPS su GPU (`reports/codex/2026-09-28-fluidita-3d.md`: 450/968 campioni di piede appoggiato oltre soglia in conduzione).
*Causa probabile:* la radice del corpo GLB copia ogni fotogramma la posizione procedurale (`src/12-three-match-view.jsx:10363`,
`_a.root.position.set(_p.position.x,…)`, eroe «CRISP» a lerp diretto) mentre le clip dei gesti non hanno moto di radice né blocco
del piede; la cadenza segue la velocità solo per la corsa (`:10453-10455`, 7.999.7). *Non posso confermarlo:* quanta parte venga
dai gesti e quanta dalla locomozione; inoltre la ROADMAP (7.999.7) ha già dichiarato che in headless il pattinamento «non si può
misurare» in gioco fluido — qui si misura in tempo di scena durante l'highlight, ma il numero assoluto resta da validare sul telefono.

**2 · Teletrasporto del pallone in rete al gol (F2).** Sonda mirata su gi0 «🦵 Tiro angolato» → gol: il pallone resta 2,7 s di scena
a ridosso del palo (x 48,3-48,6; z 3,29, a 0,06u dalla mezza luce 3,35), poi **in un fotogramma** passa a x 50,6 / z 0,68 e resta
lì. Il varco `__CPM_BJ478` non lo vede nemmeno a soglia 1u. Nel banco: i tre gol del tiro (3,2-3,3u, vicini ≤ 0,2u) e il gol
in volée di gi9 (3,0u in 0,042 s, vicini ≤ 0,1u, non attribuito). *Causa probabile:* le coordinate coincidono con il punto logico
(100,6 ; 51) che `_golInRete811` impone al gol tramite `_affermaPallone811` (`src/15-live-match.jsx:3050-3066`, x 100,6 → mondo
50,6; y 51 → z 0,68); e x 50,6 sta **oltre il fondo della rete** (49,4 secondo `src/12-three-match-view.jsx:283`). *Non posso
confermarlo:* che sia quella scrittura e non un'altra (manca una trappola sul setter); e se il punto sia davvero fuori dalla rete
disegnata o il commento di r.283 sia superato.

**3 · Eroe immobile e senza gesto in difesa (F5/F6).** gi133 «🏃 Sprint disperato sulla linea»: eroe fermo nel 100% dei primi 2 s
di scena **e nessuna clip montata**, sia riuscito («Salvataggio decisivo!») sia sbagliato; gi31 «✋ Intercetta di piede» riuscito e
gi130 «💪 Contrasto di spalla» riuscito: fermi al 100% nei primi 2 s (la clip arriva dopo). Sugli highlight offensivi la stessa
quota sta a 0,02-0,35. *Causa probabile:* da cercare nella catena che dall'azione difensiva arma `actType`/`_gName` dell'eroe (mappa
dei gesti `src/12-three-match-view.jsx:10294` e tabella `GESTI`/`gestoDi`, 7.534) — un'azione di «velocità» con premio `save`
(`src/04-situazioni-zone-piazzati.jsx:508`) non sembra avere un gesto. *Non posso confermarlo:* non ho letto quale `actType` riceve
gi133 (il campionatore registra la clip, non `actType`), né perché sugli altri due il gesto arrivi oltre i 2 s.

**4 · Rinvio difensivo troppo veloce.** gi133 riuscito: 42,8u in 0,5 s = **92 u/s** (sbagliato 59,7), contrasti gi31/gi130 riusciti
45-51 u/s, contro 17,6 u/s di mediana sul tiro. *Causa probabile:* `resolveDefensiveOutcome` (`src/11-ui-kit-highlight.jsx:2360-2361`)
dà alle spazzate una durata d'arco fissa (0,50-0,60 s) qualunque sia la distanza (fino a +22 logiche più l'allargamento laterale).
*Non posso confermarlo:* quale chiave d'esito (`safe_clear`/`counter`) abbia prodotto i 42,8u.

**5 · Portiere col riflesso tardivo o dalla parte opposta (C2, codici 111/112).** Punizioni gi13 e gi15: gesto armato al calcio
(−0,5/−0,8 s), ma con il pallone che passa a 1,27-1,53u dal portiere il corpo parte **0,10-0,25 s di scena dopo** il passaggio
sul suo piano; in 2 casi si sposta dalla parte opposta. Testa gi1 (parata) e cross gi16/gi67: lato opposto. È la stessa famiglia
del residuo aperto di PO-229 («gk_block dal lato opposto su gi6 palo»). *Causa probabile:* il riflesso traslata poco per costruzione
(`src/12-three-match-view.jsx:7439`) e il suo bersaglio laterale viene da `:5478` (clamp ±3 sul punto stimato); `gk_block` è scelto a
`:5440` quando il bersaglio dell'arco è entro 2,4u — ma l'arco non è lineare e il pallone vero passa più largo. *Non posso
confermarlo:* il giro 12 (`sviluppo/portiere-lato-229`) lavora proprio qui e questo banco non ha misurato quel ramo.

**6 · Passo indietro di 3u nel build-up aereo (F2).** Volée gi65, 5 esecuzioni su 5 (tutti gli esiti): un passo isolato di 3,0-3,1u
(vicini ≤ 1,0u) attribuito dal varco allo scrittore `buildup-aereo` in 4 casi su 5 (il quinto non attribuito). *Causa probabile:* `src/12-three-match-view.jsx:6971` riposiziona il pallone a
`_ltx52-_ddx52/_dl52*3.0`, cioè **3,0u indietro** lungo la traiettoria del cross, salvo quando il cross viene dal motore
(`tag==="orig26"`). Il 3,0 del codice coincide col 3,0-3,1 misurato. *Non posso confermarlo:* se il caso esista anche nelle partite
vere (qui le scene sono forzate e il cross non viene dal motore).

**7 · Eroe fuori quadro nella conclusione (C7).** Passaggio: mediana 0,29, 5/12 sopra il 30% (gi108 in tutti e tre gli esiti fino a
0,62). **Sul passaggio è una scelta di regia**: dal 7.522 il soggetto passa subito al pallone durante una consegna (collaudo PO
codice 008; `src/12-three-match-view.jsx:9272` e seguenti) — per questo visibilità 1. Punizione gi15 (cross basso teso) 0,69-0,77 in
tre esiti, gi78 0,34-0,61; tiro gi66/gi113 0,33-0,46. *Non posso confermarlo:* la causa sulle punizioni e sul tiro.

**8 · Nessuna reazione avversaria (C8).** Cross gi148 in tutti e tre gli esiti e tiro gi66 (fuori, murata): `__CPM_REA519` vuoto.
*Causa probabile:* il canale `_mateFx` ha tetto 9u e uno slot sequenziale (`src/12-three-match-view.jsx:5266-5278`, 7.519): se nessun
avversario di movimento è entro 9u non reagisce nessuno. *Non posso confermarlo:* le distanze vere su quelle scene.

**9 · Salto isolato della camera (F3).** Tiro gi0 (sbaglia) e gi66 (parata): 5,4-5,6u in un passo di scena con i vicini ≤ 0,2u,
fuori da ogni stacco nero vivo; `__CPM_CAMSTEP93` lo registra **senza** flag di snap né di cambio scena. Cross gi16 (intercetto): 3,5u.
*Causa probabile:* una delle passate di camera scrive dopo l'arbitro d'inerzia (`src/12-three-match-view.jsx:9782`, `_iner521`: chi
scrive dopo l'arbitro non viene smussato). *Non posso confermarlo:* quale passata; serve il contatore `__CPM_CAM503` acceso su queste
due scene.

**10 · 001 dopo un altro highlight.** Alla **prima** esecuzione di una pagina il pallone è ai piedi di qualcuno in 23 casi su 24
(unica eccezione tiro gi66 «fuori», 4,2u). Dopo altre conclusioni sulla stessa pagina il pallone sta oltre 3u dal corpo più vicino
in 24 casi su 69 (passaggio 6/9, testa 6/11, volée 5/11). *Non posso confermarlo:* che sia il gioco e non la «pagina stanca»; nel
gioco vero due highlight di fila esistono (catene `CHAIN_SITS`), ma la forzatura usa un percorso diverso. Va verificato col taccuino.

---

## 4. Limiti dell'headless

- **Fluidità.** GL software: fps mediani 8,7-11,1 (`__CPM_FPS708`), fotogramma reale mediano 99-121 ms, p95 137-176 ms: in headless
  **quasi ogni fotogramma è «lungo»** e i picchi si contano a centinaia. Questi numeri descrivono la macchina, non il gioco: la
  fluidità vera la giudica il telefono del PO. Per questo i difetti di fluidità del banco sono giudicati in **tempo di scena**
  (spostamento / dt di scena, tappato a 0,05 s da `src/12-three-match-view.jsx:3310`), che non dipende dal frame-rate.
- **Il tetto di 0,05 s** vuol dire che in headless un secondo di scena dura 2-3 s reali: tutto ciò che dipende da timer reali
  (`setTimeout`) contro il clock di scena si comporta diversamente dal telefono (lezione 7.460).
- **La classe «traballa» della camera (codice 007)** non ha prova headless (7.475/7.507): il banco non la misura.
- **Esiti forzati.** Le scene sono forzate (`__CPM_FORCE_SIT`), non nate in partita; il cross dell'eroe non compare nelle partite vere
  (PO-218: 0 su 98 scene), quindi qui è misurato solo forzato.
- **Campione.** 117 esecuzioni su 28 scene: abbastanza per dire che un difetto **esiste** e dove, non per stimarne la frequenza nel
  gioco vero. Rigore ha solo 2 scene candidate nel repertorio.

## 5. Come verificarli sul telefono col taccuino

Per ognuno: cosa fare, cosa annotare. I codici sono quelli della legenda in `CLAUDE.md`.

| # | come riprodurlo | cosa annotare |
|---|---|---|
| 1 | qualunque colpo di testa o cross dell'eroe; guardare solo i piedi nell'istante prima del contatto | nota «piedi che scivolano» con codice **000**, scena e gesto |
| 2 | un gol dell'eroe con tiro angolato: guardare il pallone in rete dopo il gol | «pallone che salta in fondo alla rete / esce dalla rete», minuto; se la bozza nomina lo scrittore, annotarlo |
| 3 | highlight difensivo «Sprint disperato sulla linea» (o qualunque intervento difensivo): contare se l'eroe si muove nei primi 2 secondi | codice **002** se l'eroe non parte; «nessun gesto» se non si vede né scatto né intervento |
| 4 | intervento difensivo riuscito con rinvio lungo | «rinvio troppo veloce», con il minuto |
| 5 | punizione a giro o cross basso teso con esito parata/fuori, oppure colpo di testa parato | codice **111** (tardi) o **112**, specificando «si muove dalla parte opposta» |
| 6 | volée su cross («attacca il pallone in area») | «pallone che torna indietro prima della volée»; **001** se sembra senza padrone |
| 7 | punizione «cross basso teso» e passaggi filtranti | «non vedo l'eroe quando calcia»; sul passaggio dire se dà fastidio (è la regia voluta dal 7.522) |
| 8 | cross dell'eroe in area | «nessun difensore reagisce» |
| 9 | tiro sbagliato o parato: guardare l'inquadratura subito dopo il calcio | «scatto della camera», distinto dal **007** (traballa continuo) |
| 10 | due highlight di fila nella stessa azione (catena) | **001** con «secondo highlight di fila» |

## 6. Dati (uscita di `npm run banco-248:rapporto`, sezione dettaglio)

```
tiro gi0 gol (pag 1) · palla 3.3u in 0.050s (vicini ≤ 0.2u, hl_result)
tiro gi0 sbaglia (pag 2) · camera 5.6u in 0.050s (vicini ≤ 0.2u, hl_result) | camera93: 5.64u
tiro gi66 gol (pag 2) · palla 3.2u in 0.050s (vicini ≤ 0.2u, hl_result)
tiro gi66 parata (pag 4) · camera 5.4u in 0.050s (vicini ≤ 0.1u, hl_result) | camera93: 5.44u,3.53u,3.22u,2.94u,2.68u
tiro gi113 gol (pag 3) · palla 3.2u in 0.050s (vicini ≤ 0.2u, hl_result)
testa gi1 parata (pag 3) · portiere gk_block · dz 1,23 · lato opposto
volee gi9 gol (pag 2) · palla 3.0u in 0.042s (vicini ≤ 0.1u, hl_result)
volee gi9 sbaglia (pag 3) · portiere gk_block · dz 1,41 · corpo +0,152 s dopo il piano
volee gi65 gol/sbaglia/parata/fuori/murata · palla 3.0-3.1u in 0.050s (vicini ≤ 1.0u) | varco: buildup-aereo:3 (4 esiti su 5)
cross gi16 intercetto (pag 3) · portiere lato opposto · camera 3.5u in 0.050s (vicini ≤ 1.3u) | camera93: 3.53u,3.24u
cross gi67 riesce (pag 4) · portiere gk_dive · lato opposto
passaggio gi3 riesce (pag 1) · palla 3.2u in 0.050s (vicini ≤ 0.2u)
passaggio gi56 riesce (pag 4) · palla 3.1u in 0.050s (vicini ≤ 1.0u)
punizione gi13 sbaglia/parata · gk_block · dz 1,29/1,53 · corpo +0,246/+0,182 s dopo il piano · (sbaglia) lato opposto
punizione gi15 sbaglia/parata · gk_block · dz 1,27 · corpo +0,102/+0,153 s dopo il piano · (sbaglia) lato opposto
```

Sonda mirata del #3 (gi0, gol, una pagina nuova, GLB acceso), fotogrammi attorno al salto, coordinate mondo del pallone:

```
56 hl_result scena 2.679  palla x 48.64  y 0.26  z 3.29
57 hl_result scena 2.729  palla x 50.60  y 0.27  z 0.68   ← un fotogramma, nessuno stacco nero vivo
58 hl_result scena 2.779  palla x 50.60  y 0.28  z 0.68
```

I JSON completi di ogni famiglia stanno in `tests/visual/out/banco-248/` (cartella ignorata da git): si rigenerano con gli script
sopra.
