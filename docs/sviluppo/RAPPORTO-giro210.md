# Rapporto giro 210 — PO-401 (diagonali negli highlight) e PO-471 (pad che resta sul telefono)

Ramo `sviluppo/giro210-diagonali`, partito da `origin/lavoro/195` (54e0a6f, giro 208 compreso). `GAME_VERSION` non toccata:
nel file vale `7.999.194`, la consegna parla di 7.999.195 (stessa differenza già segnalata al giro 207).

Decisioni del PO (15/11) applicate:
- **A (PO-401)** — otto tasti nel pad degli highlight dell'eroe: le quattro celle d'angolo (prima vuote) sono tasti diagonali
  con lo chevron ruotato di 45°; il pad non cresce. **Passo diagonale uguale agli altri: 2,5u normalizzato** (2,5/√2 per asse),
  anche da tastiera (prima 3,54u).
- **E** — tastiera: finestra d'accordo di 70 ms (dentro i 60-80 chiesti) e riga d'aiuto «Diagonali: due frecce insieme».
- **B (PO-471)** — sul telefono, dopo la prima mossa il pad resta finché ci sono mosse, come sul PC.

Rosso unico: `window.__CPM_NO_G210` (pad a quattro tasti, diagonale da tastiera 3,54u senza accordo, pad che sparisce sul
telefono dopo la prima mossa).

---

## 1. Misura prima di correggere

Base: le misure del giro 207 (`docs/sviluppo/RAPPORTO-giro207.md`) più, in questo giro, la sonda `tests/visual/misura-210.mjs`
eseguita **sul commit base 54e0a6f** (copia di lavoro separata) per le foto e i numeri «prima», poi sul ramo per il «dopo».
Uscite in `docs/sviluppo/giro210/` (`prima-*.png`, `dopo-*.png`, `misura-prima.json`, `misura-dopo-*.json`).

| Schermo | Prima: tasti del pad | Prima: dopo un tocco su ▲ (scena da 2 mosse) | Dopo: tasti | Dopo: dopo un tocco su ▲ |
|---|---|---|---|---|
| 360×640 | 4 | fase `hl_choose`, 1 mossa rimasta, **pad sparito**, scheda delle giocate | 8 | fase `hl_choose`, 1 mossa, **pad a schermo (8 tasti)**, giocate nascoste |
| 375×667 | 4 | idem: pad sparito | 8 | pad a schermo |
| 390×844 | 4 | idem: pad sparito | 8 | pad a schermo |
| PC 1366×768 | 4 | `hl_choose`, 1 mossa, pad accanto alle giocate | 8 | idem (com'era) + riga «Diagonali: due frecce insieme» |

Foto: `prima-<schermo>-mossa.png` / `prima-<schermo>-dopo-mossa.png` e le corrispondenti `dopo-*`; `dopo-pc-pad-x4.png` è il pad
del PC ingrandito 4×.

## 2. Cosa è cambiato nel gioco (solo `src/13` e `src/15`)

| Dove | Cosa |
|---|---|
| `src/13-prepartita-formazioni.jsx` `DPad` | le quattro celle d'angolo diventano tasti `◤ ◥ ◣ ◢` con passo `(±2,5/√2, ±2,5/√2)`. Pad del telefono (`v94`): stesso chevron dei cardinali ruotato di 45°. Pad del PC: triangolo disegnato e ruotato (niente secondo «▲» di testo). Ogni tasto ha `aria-label`, `data-dir210` e un `title` («Avanti a destra»…). Griglia, misura dei tasti (44 px telefono, 42 PC) e fessura (4 px) invariate. |
| `src/15-live-match.jsx` anello della tastiera | due frecce → passo **normalizzato a 2,5u**; **finestra d'accordo 70 ms**: il passo parte quando ci sono due assi, quando scadono i 70 ms o quando i tasti vengono rilasciati prima. La finestra nasce dall'**evento** `keydown`, non dal fotogramma (vedi §4). |
| `src/15` `handleDPad` | invariato nella sostanza (accettava già qualunque direzione); in più il testimone di prova. |
| `src/15` scheda del telefono | nuovo stato `pad210`: dopo una mossa sul telefono, se restano mosse, la scheda del movimento (pad + «Scegli») resta a schermo anche in `hl_choose`. **La fase resta quella del PC** (`hl_choose` dopo la prima mossa): stessi timer, stesso motore, cambia solo cosa mostra la scheda. «Scegli» o la fine delle mosse portano alle giocate. Le giocate che compaiono dopo il pad nascono disarmate come all'ingresso (regola 7.926). La barra del tempo, in `hl_choose`, parte da quanto è già passato invece di ricominciare piena. |
| `src/15` pannello del PC | riga «Diagonali: due frecce insieme» sotto la zona, sia in `hl_move` sia nel pad di `hl_choose` (non sui PC a tocco `_dito292`). |
| testimone (solo `?cpmtest=1`) | `window.__CPM_PASSO210`: per ogni passo sorgente (pad/tasti), dx, dy, lunghezza, stacco applicato, mosse rimaste, marcatore e punto dell'eroe usati da `_moveGain317`. |

Nessun campo nuovo nel salvataggio (`SAVE_VERSION` invariata); nessun asset nuovo.

## 3. Guardiano nuovo `diagonali-210` (verde + rosso nello stesso giro)

`tests/visual/diagonali-210.mjs`, script `npm run diagonali-210`, nelle catene **completa** e **carriera** di `ci-runner.mjs`
(una volta sola ciascuna, `node --check` verde, nessun doppione). Durata misurata: **2 min 49 s** (verde + rosso).

Cosa giudica, a 360×640, 375×667, 390×844 (tocco vero, `touchscreen.tap`) e PC 1366×768 (clic e tastiera), GLB spento:
- **G** otto tasti a schermo, nessuna sovrapposizione fra loro né con altri tasti (stampa lato minimo e fessura);
- **P** per ognuna delle otto direzioni un tocco sul suo tasto: direzione giusta, **una** mossa, passo **2,5u** (testimone e punto
  logico dell'eroe), stacco dal marcatore = regola del 7.317 sul marcatore dell'istante del tocco **e** = `__CPM_MOVEGAIN`
  chiesto un istante prima quando il marcatore non si è mosso;
- **T** (telefono) dopo la prima mossa fase `hl_choose` e pad ancora a schermo con le giocate nascoste; a mosse finite pad via e
  giocate a schermo; «Scegli» col pad a schermo porta alle giocate;
- **K** (PC) due frecce con 0/20/40 ms fra l'una e l'altra → sempre diagonale da 2,5u in una mossa (12/12); una freccia sola →
  cardinale 2,5u; riga d'aiuto a schermo.

Esito (registro `docs/sviluppo/giro210/controlli/diagonali-210.txt`):
- **verde**: 0 difetti, 0 non giudicati. Su tutti e quattro gli schermi: 8 tasti, lato 44 px (PC 42), fessura minima **4,0 px**,
  0 sovrapposizioni; 8/8 direzioni con passo 2,5u e una mossa; stacco = `__CPM_MOVEGAIN` al millesimo dove il marcatore era fermo;
  accordi 12/12.
- **rosso** (`__CPM_NO_G210`): bocciato come deve — 4 tasti invece di 8 su tutti gli schermi, pad sparito dopo la prima mossa su
  tutti e tre i telefoni, diagonale da tastiera **3,5355u** su tutti e quattro gli accordi.

⚠️ Limite dello strumento, dichiarato nel guardiano: le scene forzate (`__CPM_FORCE_SIT`) **non riazzerano la barra della
pressione** (lo fa solo `startHL`, il percorso vero). Dopo qualche secondo cumulato di `hl_move` sulla stessa pagina le scene
forzate entrano «a tempo scaduto» e passano subito a `hl_choose`. Il guardiano allora riapre la pagina (sul PC usa la scena lo
stesso, perché lì pad e tastiera valgono anche in `hl_choose`). Non è un difetto del gioco e non l'ho toccato.

## 4. Due difetti trovati misurando (e corretti)

1. **Un tocco breve di freccia si perdeva.** La prima stesura della finestra d'accordo aspettava 70 ms con i tasti ancora premuti:
   un tasto rilasciato prima non dava passo. Corretto: il passo parte anche al rilascio, con gli assi visti nel frattempo.
2. **Sulla prima scena di una pagina appena aperta il passo da tastiera si perdeva anche prima del giro 210** (il giro 207 l'aveva
   visto senza indagarlo: «1 è la prima scena su pagina appena aperta»). Misurato col registro dei tasti della sonda: i due
   `keydown` arrivano in `hl_move`, ma nessun fotogramma cade dentro i 220 ms di pressione (fotogrammi radi a pagina appena
   caricata), quindi l'anello che legge i tasti non li vede mai. Corretto: la finestra d'accordo nasce dall'evento `keydown`;
   il fotogramma successivo fa il passo anche a tasti già rilasciati. Il rosso `__CPM_NO_G210` riporta il comportamento di prima.

## 5. Il rischio dei 4 px fra tasti vicini (misurato)

Sonda `misura-210.mjs`, parte «tocchi», sui tre telefoni (numeri identici su 360, 375 e 390: il pad è lo stesso, 140×140 px).

**a) Geometria (`document.elementFromPoint`, cioè il bersaglio di `pointerdown` senza correzioni)**, errore del dito gaussiano a
seme fisso, 1000 tocchi per tasto:

| σ dell'errore | Prima (4 tasti): giusto · sbagliato · a vuoto | Dopo (8 tasti): giusto · sbagliato · a vuoto |
|---|---|---|
| 4 px | 100% · 0% · 0% | 100% · 0% · 0% |
| 6 px | 100% · 0% · 0% | 100% · 0% · 0% |
| 8 px | 99,1% · 0% · 0,9% | 99,1% · **0,2%** · 0,7% |

Per tasto, a σ 8 px, il «sbagliato» va da 0,1% (diagonali basse) a 0,5% (▶). I valori di σ sono **ipotesi di lavoro**: non ho una
fonte verificata sull'errore tipico del pollice e non lo dichiaro.

**b) Tocchi VERI (`touchscreen.tap`)** sulla linea fra il centro di un tasto diagonale e quello di ciascun cardinale vicino
(8 coppie per distanza; il bordo del tasto diagonale è a 22 px dal centro, la fessura fra 22 e 26):

| distanza dal centro della diagonale | 16 | 18 | 20 | 22 | **24 (metà fessura)** | 26 | 28 | 30 |
|---|---|---|---|---|---|---|---|---|
| parte la diagonale | 8/8 | 8/8 | 8/8 | 8/8 | **4/8** | 0/8 | 0/8 | 0/8 |
| parte il cardinale | 0 | 0 | 0 | 0 | **4/8** | 8/8 | 8/8 | 8/8 |
| non parte niente | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Lettura: **con il dito vero la fessura non è mai «a vuoto»**: Chrome (emulazione mobile) assegna il tocco al tasto più vicino, e a
metà fessura si divide in parti uguali. Quindi il «tocco sbagliato» esiste solo per chi tocca **oltre la metà della fessura**, cioè
almeno 24 px dal centro del tasto voluto (2 px oltre il suo bordo). La tabella (a) sottostima questo effetto perché conta come «a
vuoto» quello che il dito vero assegna a un vicino: nel caso peggiore lo «sbagliato» a σ 8 px sale da 0,2% a 0,9%.
⚠️ La correzione del bersaglio è quella di Chromium in emulazione: su un telefono vero (in particolare Safari su iOS) può essere
diversa. **Non posso confermarlo senza dispositivo.**

## 6. Controlli (uno alla volta, `CPM_CI_PAR=0`, `free -m` e `df -h` prima di ciascuno)

Registri in `docs/sviluppo/giro210/controlli/`. Il nome dello script di `moves-budget-test` in `package.json` è **`moves-budget`**.

Tutti sul build finale del ramo (`CARRIER-MANAGER-AV.html` ricomposto dai frammenti, `check-src`: IDENTICO BYTE PER BYTE).

| controllo | esito | note |
|---|---|---|
| diagonali-210 | **verde** (177 s) | verde 0 difetti · 0 non giudicati; rosso bocciato sui tre difetti (vedi §3) |
| hud-c3 | **verde** (367 s) | la scheda delle giocate entrata direttamente in `hl_choose` (nessuna mossa fatta) resta senza pad, come vuole il punto 5 |
| hl-94 | **verde** (56 s) | eroe 101-105 px sopra la scheda, mosse dentro il pad, barra «in corso» |
| esiti-96 | **verde** (724 s) | verde D1…D15 ok, rosso cade su tutti |
| design-system | **rosso, preesistente** | «1 raggio scritto a mano che ha già un token: `15-live-match.jsx:725` borderRadius:8 (esiste RAD.sm)». La riga viene dal commit 904b7544 (14/11), non da questo giro; **identico sul commit base 54e0a6f** (eseguito nella copia separata). Non corretto: fuori ambito |
| griglia-mobile | **verde** (220 s) | 14 schermate × 5 larghezze |
| moves-budget | **rosso, preesistente** | «gi4: concessi 0 passi, l'Eroe ne ha fatti 17,3 (spostamento 43,3 unità)». **Identico sul commit base** (stessi numeri). Misurato col testimone: su gi4, prima scena di una pagina appena aperta, la mesh dell'eroe va da (81,26) a (86,69) **senza nessun tasto premuto**; passi registrati 0, mosse 0, distanza dal marcatore ferma a 100. È la mesh che raggiunge il suo punto, letta dalla sonda come passi. Le altre 9 scene: nessun passo oltre il concesso. Non corretto (strumento, fuori ambito) |
| test:logic | **verde** (2 s) | |
| save-compat | **verde** (9 s) | 12 pass · 0 fail |
| momento-194 | **verde** (185 s) | A, B, C verdi; rossi bocciati |
| solo-highlight-166 | **verde** (658 s) | verde passa, rosso cade su 3, 7 e 8 |
| gioca-188 | **verde** (36 s) | 6 ok, 0 ko |
| career-critical | **verde** (654 s) | |
| highlight-95 | **verde** (5293 s, passata intera in un colpo solo) | verde: 106 highlight, D4 senza esito 0, passaggi 30 (86,7% arrivati), finte 6; «✅ highlight-95 verde (e il rosso si vede)»: il rosso cade su D1/D3/D4 |

⚠️ `griglia-mobile` e `momento-194` riscrivono foto tracciate (`docs/collaudo-grafico/g0/`, `docs/sviluppo/giro194/`): le ho rimesse com'erano (non fanno parte del giro).
⚠️ Una sola eccezione all'«uno alla volta»: durante `diagonali-210` del primo giro di controlli ho scattato una foto del pad (30 s,
un browser in più). Quel giro di controlli è stato poi **fermato e rifatto da capo** perché ho cambiato il disegno dei triangoli
del PC: gli esiti in tabella sono tutti del secondo giro, senza sovrapposizioni.

## Dubbi per il PO

1. **Il pad resta anche quando scade il tempo senza mosse fatte?** Ho applicato B alla lettera: il pad resta **dopo la prima mossa**.
   Se la barra della pressione scade in `hl_move` senza nessuna mossa, la fase passa a `hl_choose` e sul telefono compaiono le
   giocate senza pad (come prima), mentre sul PC il pad resta accanto alle giocate. Va allineato anche quel caso?
2. **«Scegli» in più sul telefono.** Sul PC pad e giocate stanno insieme; sul telefono, con il pad che resta, per scegliere serve
   un tocco su «Scegli» (le giocate non stanno nella stessa scheda: la tavola C3 approvata le tiene separate, e il PO aveva tolto
   il pad dalla scheda delle giocate nella 7.905 «secondo cursore inutile»). Va bene così o le giocate vanno nella stessa scheda?
3. **Timer dell'esitazione e barra non coincidono (trovato, non toccato).** In `hl_choose` l'anticipo del marcatore scatta dopo
   16/12/9 s (7.916), ma la barra «Pressione» della scheda delle giocate dura 9/6/4 s (formula del 7.905, mai aggiornata): la barra
   si svuota prima che il marcatore arrivi. Il commento nel codice dice «la STESSA formula del timer». Ho lasciato le durate come
   sono (anche nella barra nuova della scheda del movimento in `hl_choose`): va corretta la barra?
4. **Fessura di 4 px**: §5 dice che il tocco a metà fessura si divide 50/50 e che a σ 8 px i tocchi sbagliati vanno dallo 0,2%
   allo 0,9%. Basta, o si vuole l'alternativa **B** del giro 207 (croce a otto settori, niente fessure)? Solo il dispositivo può
   dire quanto pesa davvero.
5. **Doppio passo da tastiera nel rosso.** Nel braccio rosso (comportamento di prima) un accordo di due frecce ha consumato **due**
   mosse una volta (`K ArrowUp+ArrowLeft a 0 ms: 2 passi`, giro di prova del guardiano). Con la finestra d'accordo non è più
   successo (12/12 con una mossa sola), ma non ho indagato la causa nel comportamento vecchio.
6. Versione: la consegna parla di 7.999.195, il file dice 7.999.194; non toccata (regola del giro).
7. Roadmap: questo giro non è un rilascio e non ho scritto righe in `docs/governo/ROADMAP.md`; la riga va scritta dalla sessione
   di rilascio che porterà il giro su `main`.
