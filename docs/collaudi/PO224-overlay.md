# PO-224 — Quali overlay possono stare sopra la finestra del patto/spogliatoio (SOLO MISURA)

**Build:** `origin/main` 7.999.158 (commit `1a819fb`). Solo lettura di codice: nessuna sonda eseguita su questo punto, nessuna proposta di modifica.
**Riferimento file:riga:** `CARRIER-MANAGER-AV.html` nella build 7.999.158.

## 1. La finestra

- `_pop224` (`CARRIER-MANAGER-AV.html:45876`): overlay `position:fixed; inset:0; zIndex:9997`, con `data-cpm="pop224"`.
- Lucchetto per render: `_popTaken224` (`:45873`). Il primo pop che si disegna prende la finestra; gli altri ritornano `null` o il nodo grezzo.
- Chiamate: `:51462` (patto, `pv.st==="offer"`), `:51489` (patto, seconda fase), `:51499` (legame/spogliatoio, `bondEvent`).
- La finestra è dentro il ramo `tab==="dashboard"` (`:51455`–`:51499`), cioè nel ramo principale del render di `CareerApp`.

## 2. Come l'overlay si perde: la regola di z-index

La finestra sta a **9997**. Qualunque overlay che il render di `CareerApp` monta **con z ≥ 9998** la copre. Tra questi c'è il `Modal` standard (9998), usato da quasi tutti i dialoghi.

## 3. Overlay che possono coesistere con la home (stesso albero di `CareerApp`)

| Componente / elemento | File:riga | zIndex | Condizione di apertura letta | Copre la finestra? |
|---|---|---|---|---|
| `Modal` (componente) | `:10712` | 9998 | — (definizione) | **sì** |
| `Modal` · discorso mister | `:49914`, `:50266` | 9998 | `misterDiscorsoModal&&` | **sì** |
| `Modal` · impulso settimanale | `:50120` | 9998 | `!window.__CPM_NO_IMPULSO23` (condizione parziale) | **sì** |
| `Modal` · coach | `:50412` | 9998 | `coachModal&&!coachModal.chosen` | **sì** |
| `Modal` · revisione mensile | `:50454` | 9998 | `monthlyReviewModal&&` | **sì** |
| `Modal` · prompt partita | `:50567` | 9998 | `showMatchPrompt` (ricostruito dal contesto) | **sì** |
| `Modal` · conferma avanzamento | `:50605` | 9998 | `showAdvanceConfirm&&` | **sì** |
| `Modal` · offerta trasferimento | `:50621` | 9998 | `transferOffer&&` | **sì** |
| `Modal` · evento rifiutato | `:50703` | 9998 | `refuseEvent&&` | **sì** |
| `Modal` · gruppo europeo | `:50964` | 9998 | `euroGroupModal&&` | **sì** |
| `Modal` · coppa nazioni | `:51002` | 9998 | `nationsCupModal&&` | **sì** |
| `Modal` · altri (`:50079`, `:50737`, `:50853`) | `:50079`, `:50737`, `:50853` | 9998 | condizione non letta | **sì** |
| `Modal` · cambio procuratore (`_sw379`, fase `conferma`/`scegli`) | `:54554`–`:54560` | 9998 | `_sw379&&` | **sì**, se montato sullo stesso albero (vedi §5) |
| `MilestoneCelebrationModal` | `:50056` (def. `:43215`) | 10000 (backdrop) | `milestoneModal&&` | **sì** |
| `TutorialOverlay` | `:50059` (def. `:43188`) | 9999 | condizione non letta | **sì** |
| Toast settimanale `weekEvent` | `:50070` | 9998 | `weekEvent&&` | **sì** |
| Toast intervista `riscontro23` | `:50488` | 10000 | `interviewFeedback&&` | **sì** |
| Portal intervista 3D | `:50307` | 9998 | `_iv3d` (condizione non letta) | **sì** |
| Backdrop «Un momento leggendario» | `:50242` | 9998 | condizione non letta | **sì** |
| Notifica (`Notif`, `_NotifVecchio`) | `:10557`, `:10552` | 9999 | `notify(...)` | **sì** (toast) |
| Figurina a schermo intero | `:51083` | 9000 | `figAperta23&&` | no (9000 < 9997) |

## 4. Overlay che NON possono coesistere con la home

Questi ritornano l'intero albero e la home non viene disegnata: la finestra non è mai visibile lì, quindi non è «coperta».

| Elemento | File:riga | Note |
|---|---|---|
| `_presOverlay` (presentazione) | `:49773` (`if(presEvent)return _presOverlay`), z 9997 a `:49755` | ritorno anticipato |
| `_ritOverlay` (ritiro) | `:49820` (`if(ritiroEvent)return _ritOverlay`), z 9997 a `:49791` | ritorno anticipato |
| `SeasonAwardsScreen` | `:49724`, z 9997 a `:40543`/`:40623` | schermata |
| `ProTransitionScreen` | `:49736` | schermata |
| `seasonEnd` | `:49823` | schermata |
| `clubPresentation` | `:49829` | schermata |
| `LiveMatch` (`screen==="match"`) | `:49835` | schermata |
| `press` / `postmatch` | `:49949`, `:49953` | schermata |
| `nationalCallup` | `:49959` | schermata |

## 5. Dialoghi che il PO ha citato e non ho potuto attribuire con certezza

- **«Festa del titolo»:** l'unica festa con z-index trovata è `FestaFine942` (`:27672`, z 9997 a `:27685`), montata a `:37075` **dentro `LiveMatch`** (`:28032` in poi), cioè la festa di fine gara (commento `:28574` e `:28779`, «la festa cartoon di fine partita del 7.942»). Non sta nell'albero della home. La cerimonia di campionato è calcolata a `:49876`–`:49884` (`kind:"league"`, con `titleCeremonyShown`), ma **non ho trovato il componente che la disegna**: il rapporto non la attribuisce. Non posso confermare quale sia l'overlay del titolo che il PO ha visto.
- **«Procuratore in più passi»:** il flusso è in `_sw379` (`:44079`, stati `null | "conferma" | "scegli"`), con `Modal` a `:54560`. L'albero a `:54554` non è nel ramo dashboard (`:44064`–`:51500`); non ho verificato in quale schermata sta. Se è montato sopra la home, la sua `Modal` (9998) copre la finestra.
- **`PopScelta919`** (`:27753`, z 9998, montato a `:37077`): anch'esso dentro `LiveMatch` (stesso ragionamento di `FestaFine942`).

## 6. Conclusione di misura (senza proposte)

1. **Ogni `Modal` montato dal ramo dashboard copre la finestra** (9998 > 9997). Sono almeno dodici istanze in `CareerApp`.
2. **Toast e tutorial** (`weekEvent`, `riscontro23`, `Notif`, `TutorialOverlay`, `MilestoneCelebrationModal`) coprono la finestra o arrivano sopra.
3. **Le schermate a ritorno anticipato** non coesistono con la home: la finestra è assente lì, non coperta.
4. **Il lucchetto `_popTaken224` non protegge dal z-index**: decide solo chi vince fra due pop, non chi sta sopra.
5. **Dei dialoghi citati dal PO**, la «festa» trovata sta dentro `LiveMatch`, non sulla home; il procuratore e la cerimonia del titolo **non sono stati attribuiti con certezza**.

Non posso confermare che il rilievo «la finestra resta coperta» si verifichi in una sessione reale: questo rapporto elenca i candidati dal codice, non una sequenza misurata.

## 7. Limiti

- Lettura di codice. Nessuna sonda eseguita per PO-224.
- Le condizioni marcate «non letta» o «ricostruito» non sono verificate riga per riga.
- Il ramo `tab==="dashboard"` è l'unico in cui la finestra compare. Gli altri tab non sono stati censiti.
