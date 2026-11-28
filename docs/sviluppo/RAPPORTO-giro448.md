# Giro 448 — PO-652 registro delle offerte di mercato (dubbio 4 del giro 351)

Base: `main` (7.999.219, a7aa5ba). Ramo di consegna: `sviluppo/giro448-registro-offerte`. `GAME_VERSION` e `docs/governo` non
toccati.

**Esito in una riga:** su 10 carriere simulate di 3 stagioni (handler veri, corpi accesi) il gioco ha generato **66 offerte**, e
sulle **47** a cui si applicano le regole del giro 351 le violazioni sono **0** (A 0 · B 0 · C 0). Con le regole di prima
(`__CPM_NO_G351`) le stesse carriere ne mostrano di nuovo (A 2 · B 3 · C 4 su 19). Nessuna correzione alla fonte: non c'era
niente da correggere. Restano tre cose che le regole permettono ma che il PO potrebbe non volere: vedi i dubbi.

## Cosa è cambiato

- **src/06, `generateTransferOffer`**: prima del `return`, una riga `cpmEv("offerta",{…})` dentro `try/catch`. Il registro è
  **inerte** come il libro mastro del 7.496: il gioco non lo legge mai, l'offerta restituita è la stessa di prima (stesso oggetto,
  stessi campi). Campi: stagione, settimana, OVR, età, ruolo, professionista/svincolato, club di oggi (id, prestigio, lega), club
  che offre (id, nome, prestigio, lega), tipo, minutaggio, morale, crescita, stipendio offerto, stipendio di oggi, durata offerta e
  di oggi, regole 351 attive sì/no, preferenza dell'agente, numero progressivo `n448` (il registro è un anello da 400 voci e si
  svuota a ogni partita dal vivo: la sonda lo legge a ogni settimana e toglie i doppioni con `n448`).
- **Rosso `window.__CPM_NO_G448`**: spegne la riga del registro. Serve al guardiano per provare che legge davvero il registro.
- Nessun campo nuovo nel salvataggio.

## Misura (No Blind Fix) — `tests/visual/offerte-448.mjs`

Popolazione: 10 carriere da professionista, club presi su tutta la scala di prestigio di `CLUBS` (da 40 a 90), ruolo di
partenza a rotazione (riserva, rotazione, titolare, leader), metà in lista trasferimenti, un terzo con agente; 3 stagioni
ciascuna con `__CPM_CAREER.step()` (gli stessi handler di `career-sim`). ⚠️ Le carriere sono **simulate** dal banco: il banco
chiude ogni finestra con `dismiss()`, quindi rifiuta ogni offerta e non rinnova mai il contratto. Per questo le carriere arrivano
allo svincolo e lo stipendio di oggi resta quello di partenza mentre l'OVR cresce.

| misura | valore |
|---|---|
| offerte generate | **66** (10 carriere su 10 con almeno un'offerta) |
| a cui si applicano le regole 351 (professionista sotto contratto) | **47** |
| a svincolati (regole di prima, sempre definitivo) | 19 (29%) |
| tipi, tutte | prestito 24 (36%) · definitivo 25 (38%) · prestito con opzione 12 (18%) · prestito con obbligo 5 (8%) |
| tipi, sotto contratto (47) | **prestiti 41 (87%)** · definitivo 6 (13%) |
| prestigio del club che offre rispetto a oggi | più forte (+5) 18 · alla pari 21 · più debole (−5) 8 |
| più debole (−5), cosa propone | 3 a chi è in rotazione: **tutti definitivi, minuti 77-90** · 5 a riserve: prestiti con minuti 45-57 |
| finestre | estate 20 · inverno 38 · fuori finestra 8 |
| ruolo di chi riceve (sotto contratto) | riserva 26 · rotazione 18 · titolare 2 · leader 1 |
| club | 49 club diversi su 66 offerte; il più frequente 4 volte |
| stipendio offerto / stipendio di oggi | quartili **1,63 · 2,19 · 2,96** (min 1,16 · max 6,45) |
| morale mostrato | mediana +20; **31 offerte su 47 al tetto +20** |
| crescita mostrata | mediana +5 |
| **A · assurde** | **0** |
| **B · senza guadagno** | **0** |
| **C · effetti incoerenti** | **0** |
| E · righe del registro incomplete | 0 |
| pageerror | 0 |

Confronto con le regole del 351: un club più debole a chi gioca offre solo definitivo da titolare — **sì, 3 su 3**; a una riserva
un prestito con almeno la rotazione — **sì, 5 su 5 (minuti ≥ 45)**; ogni offerta migliora almeno un asse — **sì, 47 su 47**;
morale e crescita calcolati dai guadagni — **sì** (nessuna C). Le regole reggono anche dove la popolazione sintetica del 351 non
pesava la frequenza.

## Guardiano

`npm run offerte-448` (~13 min, tre bracci):
- **VERDE**: 10 carriere × 3 stagioni, A = B = C = E = 0, copertura ≥ 40 offerte giudicabili, ≥ 3 tipi, ≥ 6 carriere con almeno
  un'offerta, 0 pageerror, tutte le stagioni completate. Copertura mancante = NON GIUDICATO = rosso.
- **ROSSO** (`__CPM_NO_G351`, 4 carriere): deve vedere A > 0 o B > 0, altrimenti è cieco = rosso. Misurato: A 2 · B 3 · C 4 (un
  leader di un club da 82 a cui due club da 49-50 offrono un prestito pagato meno).
- **CIECO** (`__CPM_NO_G448`, 1 carriera): col registro spento deve vedere 0 offerte. Prova che il guardiano legge la riga che il
  gioco scrive.

Riga della MAPPA: `offerte-448` accanto a `offerte-351` nella riga `src/0[0-8]` (il registro vive in src/06) e nella riga
`src/18|src/16|src/10` (le offerte nascono dagli handler della settimana). `mappa-unica` verde. Uscita completa in
`tests/visual/out/offerte-448.json` (righe del registro comprese).

## Rituale

`node ci-runner.mjs giro offerte-448 career-critical` — esito nella sezione «Rituale: esito» in fondo.

## Dubbi per il PO

1. **Quasi solo prestiti a chi ha un contratto (87%).** Le regole lo permettono: il tipo si tira ancora a caso in base all'OVR
   (sopra 75: 3 su 4 sono prestiti), e il 351 lo ha cambiato solo verso un club più debole.
   - (a, consigliata, applicata = nessun cambio) Lasciare così: ogni prestito oggi porta un guadagno vero (nessuna B), e i 6
     definitivi arrivano dove contano (club più debole a chi gioca, salti).
   - (b) Dare più definitivi verso un club più forte (per esempio metà e metà sopra +5): tocca il tiro del tipo in src/06.
   - (c) Far dipendere il tipo dagli anni di contratto rimasti (a un anno dalla scadenza più definitivi).
2. **Morale al tetto (+20) in 31 offerte su 47.** Nella formula del 351 l'aumento di stipendio pesa 15 per ogni +100%, e nelle
   carriere simulate lo stipendio offerto è mediamente 2,2 volte quello di oggi (il contratto resta quello di partenza mentre
   l'OVR cresce: col banco non si rinnova mai). Non è una violazione: il guadagno c'è.
   - (a, consigliata, applicata = nessun cambio) Lasciare così e misurare in una carriera vera con rinnovi (il banco non ne fa).
   - (b) Mettere un tetto al peso dello stipendio nel morale (per esempio +8 al massimo dallo stipendio).
   - (c) Mostrare il morale come fasce («poco · buono · molto») invece del numero.
3. **Offerte a svincolati con morale ancora a caso (19 offerte, morale fra +5 e +19).** Il 351 ha lasciato fuori svincolati e
   Primavera di proposito. Per uno svincolato qualunque contratto è un passo avanti, quindi la classe B non ha senso, ma il morale
   resta un dado.
   - (a, consigliata, applicata = nessun cambio) Lasciare così: il registro ora le conta, e un'offerta a uno svincolato è sempre
     definitiva.
   - (b) Calcolare anche per loro morale e crescita dalla formula del 351 (prestigio rispetto all'ultimo club, ruolo).
   - (c) Mostrare per gli svincolati solo «contratto» senza morale e crescita.
4. **Le carriere del banco non accettano e non rinnovano mai.** Quindi il registro non misura cosa succede dopo un trasferimento.
   - (a, consigliata, applicata) Dichiararlo qui; il guardiano giudica le offerte, non le scelte.
   - (b) Un braccio che accetta la prima offerta di ogni stagione (serve un comando di accettazione nel banco `__CPM_CAREER`).
   - (c) Chiedere al PO 3-4 foto di offerte dopo il rilascio, come nel dubbio 4 del 351.

## Rituale: esito

`node ci-runner.mjs giro offerte-448 career-critical` (+ 17 sentinelle) sul commit 425b00e (build 7.999.219): **18/18 verdi**,
nessun passo ripetuto. Tempi: offerte-448 813 s (verde, rosso e cieco) · mappa-unica 0 s · test:logic 3 s · save-compat 1 s ·
replay 48 s · migrazione-194 28 s · design-system 1 s · tema-unico 15 s · griglia-mobile 200 s · render-3d-023 37 s · tunnel-285
205 s · home-298 121 s · web-237 58 s · career-critical 398 s · battito-264 384 s · partita-vera 633 s · gk-dive-sync 194 s ·
schermate-97 120 s. `docs/governo/STABILITA.json` scritto dal runner non è stato committato (regola del giro).
