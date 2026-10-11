# PO-218 — scene di cross dell'eroe: riquadro, cronaca ed eventi del motore (collaudo, sola lettura)

**Build:** `main` 7.999.158 (commit `1a819fb`), GLB default, `__CPM_PRESENT=1`, salvataggio `save-190-s12-ovr93.json`, autoplay `seeded`.
**Campione:** 16 partite vere (`Samuelito Vairo k`, k = 1…16). 16/16 fino alla cerimonia, 0 errori. **105 scene** dell'eroe.
**Sonda:** `po218-cross.mjs`. Per ogni scena registra cast (tipo di occasione e minuto), esito (`RES218`: etichetta, chiave, `outKind`, riquadro `ovl`, famiglia `fam`), eventi del motore (`ev`) e la cronaca del minuto (`TXT487`). Dati grezzi: `po218-158.jsonl`. Analisi: `po218-158-analisi.mjs` e `po218-158-coerenza.mjs`.

**Riesecuzione:** come PO-220 con `po218-cross.mjs`; analisi con `node po218-158-analisi.mjs po218-158.jsonl` e coerenza con `node po218-158-coerenza.mjs po218-158.jsonl`.

## Che cosa ho chiamato «cross»

Il motore usa due nozioni diverse, e le ho misurate separatamente:
- **Occasione cross**: scena il cui `tipo` di occasione (`CAST219`) è `cross`, cioè un cross che l'eroe riceve e da cui tira o colpisce di testa. **21 scene.**
- **Azione cross dell'eroe**: l'azione scelta è di tipo `cross` nel motore, o ha un'etichetta «cross/traversone/palla in area». **Nessuna scena con tipo motore `cross`**; le 5 scene trovate hanno etichetta «Palla in area» e tipo motore `freekick`.

## Risultato

- **Occasioni cross: 21, non riuscite 18.** Le 3 riuscite sono tutte gol: k=6 min 73 (volée), k=8 min 43 (testa), k=14 min 27 (volée). Il criterio «non riuscita» è `ok=false` nel motore.
- **Azioni cross dell'eroe: 5, non riuscite 5** (tutte `freekick` con etichetta «Palla in area»).
- Riquadro ↔ motore: su **105 scene**, **2 incoerenze chiare** e 2 discrepanze di testo (dettaglio al §3).

## 1. Occasioni cross (21 scene)

Ogni riga affianca riquadro (`ovl`, famiglia `fam`), eventi del motore (`ev`) e cronaca del minuto ±1. `min′` è il minuto della scena. Cronaca: `—` se nessuna riga cade nel minuto.

| k | min | hl | azione | esito | riquadro [famiglia] | motore | cronaca |
|---|---|---|---|---|---|---|---|
| 1 | 36′ | 3 | 🎯 Testa piazzata all'angolo | **non riuscita** | «Che peccato!» [wide] | pronto tuffo tiro:fuori({P}) rammarico({P}) pressione(MARSHALL) | 35: 🟡 Fischia l'arbitro: fallo di Gray (MER) su Mitchell (TYN), punizione sulla trequarti. |
| 1 | 71′ | 6 | ✈️ Testa di potenza | **non riuscita** | «Murato dalla difesa» [blocked] | pronto tiro:blocked({P}) murato(MARSHALL) rammarico({P}) | 70: ↗ Cross di Spencer (MER) dalla fascia: 1 attacca il primo palo! ▸ 72: 🟡 Hughes (MER) stende Hayes (TYN): punizione per FC Tyneside. |
| 2 | 31′ | 3 | ✈️ Testa di potenza | **non riuscita** | «Tiro fuori di poco» [wide] | pronto tuffo tiro:fuori({P}) rammarico({P}) pressione(BAILEY) | 30: 🎯 Traversone teso di Hammond (MER) in area: 2 stacca! ▸ 32: ⏸️ Pallone di Quinn (TYN) troppo lungo: esce sulla fascia, rimessa laterale. |
| 2 | 45′ | 5 | 🎯 Controllo e tiro fermo | **non riuscita** | «Conclusione centrale» [saved] | pronto tiro:saved({P}) parata({P}) rammarico({P}) pressione(BAILEY) | 44: ↗ Cross di Hammond (MER) dalla fascia: 2 attacca il primo palo! |
| 3 | 64′ | 6 | ✈️ Testa di potenza | **non riuscita** | «Il palo gli dice no» [post] | pronto tuffo tiro:post({P}) palo({P}) rammarico({P}) pressione(MARSHALL) | 63: ↗ Cross di Spencer (MER) dalla fascia: 3 attacca il primo palo! ▸ 65: 🛡️ Gray (MER) chiude in scivolata su Stanley (TYN) e riparte. |
| 6 | 73′ | 5 | ⚽ Volée di collo potente | riuscita | «Non perdona!» [null] | pronto tuffo tiro:goal({P}) gol({P}) pressione(MARSHALL) | 72: 🟡 Mitchell (TYN) stende Howard (MER): punizione per FC Merseyside. ▸ 74: ✊ Ha segnato lui. 6 si ferma un attimo davanti alla curva prima di tornare a centrocampo: adesso la partita ha il suo nome sopra. |
| 7 | 15′ | 1 | ✈️ Testa di potenza | **non riuscita** | «Conclusione murata» [blocked] | pronto tiro:blocked({P}) murato(QUINN) rammarico({P}) | 14: 🎯 Traversone teso di Spencer (MER) in area: 7 stacca! ▸ 16: ⏸️ Pallone di Mitchell (TYN) troppo lungo: esce sulla fascia, rimessa laterale. |
| 7 | 34′ | 5 | ✈️ Testa di potenza | **non riuscita** | «Il difensore si oppone» [blocked] | pronto tiro:blocked({P}) murato(BAILEY) rammarico({P}) | 33: ↗ Cross di Spencer (MER) dalla fascia: 7 attacca il primo palo! |
| 8 | 43′ | 3 | ✈️ Testa di potenza | riuscita | «Freddezza assoluta!» [null] | pronto tuffo tiro:goal({P}) gol({P}) pressione(BAILEY) | 42: 🎯 Traversone teso di Spencer (MER) in area: 8 stacca! ▸ 44: ✊ Ha segnato lui. 8 si ferma un attimo davanti alla curva prima di tornare a centrocampo: adesso la partita ha il suo nome sopra. |
| 9 | 29′ | 3 | ⚽ Volée di collo potente | **non riuscita** | «Palo!» [post] | pronto tuffo tiro:post({P}) palo({P}) rammarico({P}) pressione(BAILEY) | 28: ↗ Cross di Spencer (MER) dalla fascia: 9 attacca il primo palo! |
| 10 | 41′ | 5 | ⚽ Volée di collo potente | **non riuscita** | «Conclusione murata» [blocked] | pronto tiro:blocked({P}) murato(BAILEY) rammarico({P}) | 40: ↗ Cross di Spencer (MER) dalla fascia: 10 attacca il primo palo! |
| 11 | 18′ | 2 | 🎯 Testa piazzata all'angolo | **non riuscita** | «Conclusione centrale» [saved] | pronto tiro:saved({P}) parata({P}) rammarico({P}) pressione(BAILEY) | 17: 🎯 Traversone teso di Spencer (MER) in area: 11 stacca! |
| 13 | 25′ | 2 | ⚽ Volée di collo potente | **non riuscita** | «Il gol sembrava fatto» [saved] | pronto tiro:saved({P}) parata({P}) rammarico({P}) pressione(BAILEY) | 24: 🎯 Traversone teso di Spencer (MER) in area: 13 stacca! ▸ 26: 😠 Il loro centrale gli si presenta al primo pallone: una spallata e due parole. È il benvenuto. |
| 13 | 74′ | 6 | 🎯 Testa piazzata all'angolo | **non riuscita** | «Conclusione murata» [blocked] | pronto tiro:blocked({P}) murato(MARSHALL) rammarico({P}) | 73: 🎯 Traversone teso di Spencer (MER) in area: 13 stacca! ▸ 75: ⏸️ Pallone di Burke (TYN) troppo lungo: esce sulla fascia, rimessa laterale. |
| 14 | 27′ | 3 | ⚽ Volée di collo potente | riuscita | «GOL — Samuelito!» [null] | pronto tuffo tiro:goal({P}) gol({P}) pressione(BAILEY) | 26: 🎯 Traversone teso di Hammond (MER) in area: 14 stacca! ▸ 28: ✊ Ha segnato lui. 14 si ferma un attimo davanti alla curva prima di tornare a centrocampo: adesso la partita ha il suo nome sopra. |
| 14 | 37′ | 4 | 🎯 Testa piazzata all'angolo | **non riuscita** | «Ci è andato vicinissimo» [post] | pronto tuffo tiro:post({P}) palo({P}) rammarico({P}) pressione(MARSHALL) | 36: 🟡 Quinn (TYN) stende Russell (MER): punizione per FC Merseyside. |
| 14 | 65′ | 6 | 🎯 Controllo e tiro fermo | **non riuscita** | «Il difensore si oppone» [blocked] | pronto tiro:blocked({P}) murato(BAILEY) rammarico({P}) | 64: 🎯 Traversone teso di Spencer (MER) in area: 14 stacca! ▸ 66: 🚀 Lancio lungo di Marshall (TYN) per Burke (TYN), a centrocampo. |
| 15 | 26′ | 2 | ✈️ Testa di potenza | **non riuscita** | «Il palo gli dice no» [post] | pronto tuffo tiro:post({P}) palo({P}) rammarico({P}) pressione(BAILEY) | 25: 📣 Primo quarto d'ora letto dalla panchina: il mister chiama 15 con due dita e gli indica il compagno di reparto. «Vi state pestan |
| 15 | 48′ | 4 | ⚽ Volée di collo potente | **non riuscita** | «Il difensore si oppone» [blocked] | pronto tiro:blocked({P}) murato(MARSHALL) rammarico({P}) | 47: 🎯 Traversone teso di Spencer (MER) in area: 15 stacca! ▸ 49: 🛡️ Wright (MER) chiude in scivolata su Quinn (TYN) e riparte. |
| 16 | 31′ | 3 | 🎯 Testa piazzata all'angolo | **non riuscita** | «Non trova lo specchio» [wide] | pronto tuffo tiro:fuori({P}) rammarico({P}) pressione(MARSHALL) | 30: ↗ Cross di Spencer (MER) dalla fascia: 16 attacca il primo palo! ▸ 32: 🤝 Il capitano lo raggiunge e gli batte una mano sul petto: «La prossima entra. Continua a metterti lì.» |
| 16 | 45′ | 5 | 🎯 Testa piazzata all'angolo | **non riuscita** | «Tiro fuori di poco» [wide] | pronto tuffo tiro:fuori({P}) rammarico({P}) pressione(MARSHALL) | 44: ⏸️ Pallone di 16 troppo lungo: esce sulla fascia, rimessa laterale. ▸ 46: 🤝 Si riparte, e Wright gli dice due parole camminando: «Io taglio dentro, tu resta largo. Ci troviamo.» |
Nota di lettura: la cronaca non sempre riguarda l'azione. Per i gol (k=6 min 73, k=8 min 43, k=14 min 27) la riga «Ha segnato lui» cade nel minuto successivo, cioè dopo la scena.

## 2. Azioni cross dell'eroe (5 scene, tutte non riuscite)

| k | min | hl | occasione | azione (tipo) | esito | riquadro [famiglia] | motore |
|---|---|---|---|---|---|---|---|
| 3 | 29′ | 3 | punizione | ↗️ Palla in area (freekick) | **non riuscita** | «Il legno alto respinge» [post] | pronto tuffo tiro:post({P}) palo({P}) rammarico({P}) |
| 7 | 22′ | 3 | punizione | ↗️ Palla in area (freekick) | **non riuscita** | «Il gol sembrava fatto» [saved] | pronto tiro:saved({P}) parata({P}) rammarico({P}) |
| 8 | 76′ | 6 | punizione | ↗️ Palla in area (freekick) | **non riuscita** | «Grande parata del portiere» [saved] | pronto tiro:saved({P}) parata({P}) rammarico({P}) |
| 12 | 33′ | 3 | punizione | ↗️ Palla in area (freekick) | **non riuscita** | «Ci è andato vicinissimo» [post] | pronto tuffo tiro:post({P}) palo({P}) rammarico({P}) |
| 15 | 64′ | 6 | punizione | ↗️ Palla in area (freekick) | **non riuscita** | «Il gol sembrava fatto» [saved] | pronto tiro:saved({P}) parata({P}) rammarico({P}) |
Queste cinque sono **tutte** «Palla in area» con tipo motore `freekick`, cioè il motore le tratta come punizioni. Non le chiamo cross per il tipo: le riporto perché la cronaca e l'etichetta le descrivono come palla in area. Le famiglie di riquadro (`post`, `saved`) coincidono con il motore (`tiro:post`/`palo`, `tiro:saved`/`parata`) in 5/5.

## 3. Coerenza riquadro ↔ motore su tutte le 105 scene

Controllo per famiglia su tutte le scene:
- Riquadri di tiro (`saved`, `blocked`, `post`, `wide`): **53 scene**. Accordo col motore in 52 per regex sui soli tiri; la 53ª è un «Passaggio fuori misura» con motore `passaggio`, cioè coerente, ma la regex non lo copriva.
- Intercetti: 31 scene con chiave `intercept`. In 24 il motore registra `intercetto`, e il riquadro dice «Intercettato», «Anticipato dall'avversario», «Palla persa», «Ti portano via il pallone»: coerente. Le altre 7 hanno esito `wide`, `blocked`, `overhit`, `fouled`, `saved`: coerenti per famiglia tranne k=8 hl4 (incoerenza 2) e due discrepanze di testo (k=9 hl2 e k=1 hl5).
- Fuorigioco: **1 scena** con `outKind=offside`. Nel motore non esiste nessun evento fuorigioco (0 occorrenze su 105 scene).

**Incoerenze chiare (2)**

1. **k=8, minuto 34, hl 2 (nel gruppo delle 24) — «Oltre la linea — offside» contro `passaggio intercetto(BAILEY)`.** Azione «Filtrante per HUGHES» (tipo motore `pass`, chiave `intercept`, `ok=false`). Il riquadro dice fuorigioco; il motore dice che il passaggio è stato intercettato da BAILEY. Il motore non ha alcun evento di fuorigioco. Cronaca nei minuti 32, 33 e 36: «stende 8: punizione», «Pallone di Mitchell troppo lungo: esce sulla fascia», «GOOOL! Howard»; nessuna riga parla di fuorigioco o intercetto. **È il sintomo del PO-218 originale** («fuorigioco» dove il motore dice «intercetto»). Visto una volta in 16 partite.
2. **k=8, minuto 50, hl 4 — «Palla persa nel dribbling» [blocked] contro `tiro:blocked` e `murato(BAILEY)`.** Azione «Conduci palla al piede e tira» (tipo motore `shot`). Il riquadro descrive una palla persa in dribbling, il motore registra un tiro murato da BAILEY. È una discordanza di famiglia (possesso perso contro tiro murato).

**Discrepanze di testo (2), da leggere ma non conto come contraddizioni**

- k=9, minuto 18, hl 2: «Finta e tiro» (tipo motore `shot`, esito fuori). Il riquadro dice «Palla troppo lunga»: è il messaggio di un passaggio, non di un tiro.
- k=1, minuto 60, hl 5: «Conduci palla al piede e tira» (tipo motore `shot`, esito fuori). Il riquadro dice «Ci prova ma viene chiuso», con «chiuso» che suona come murato, mentre il motore registra un tiro fuori.

**Lettura complessiva.** Su 105 scene: 101 coerenti, 2 discrepanze di testo, 2 incoerenze chiare. Il sintomo più grave del PO-218 originale (fuorigioco al posto di intercetto) si ripresenta una volta sola in questo campione. Non posso confermare quanto spesso accada su un campione più grande: 16 partite sono poche.

## 4. Limiti

- Azioni cross dell'eroe **rare**: 5 in 16 partite, tutte classificate come punizione. Le occasioni cross (21) sono il campione più solido, ma includono colpi di testa e tiri che il motore non tratta come cross.
- La corrispondenza riquadro ↔ motore l'ho giudicata io, per famiglia e per testo: è una lettura, non un controllo automatico completo. Le due incoerenze chiare sono entrambe in k=8, quindi potrebbero dipendere dalla stessa partita.
- La cronaca è affiancata per minuto (±1): non è sempre la riga che descrive l'azione.
- Partite girate in parallelo (4 processi su 4 CPU). Nessuna modifica al gioco: sola lettura, `main` 7.999.158 non toccato.
