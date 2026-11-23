# Giro 344 — i sette rossi nuovi del treno 45139940995 (7.999.208)

Base: `lavoro/201` punta **fd2b9334** (treno con i giri 331 · 333 · 335 · 336 · 337 · 338). Confronto: **d6819779** (prima dei
cinque vagoni nuovi). Banco: sessione cloud, `CPM_CHROME=/opt/pw-browsers/chromium`, ogni guardiano lanciato con `npm run`.
Ramo di consegna: `sviluppo/giro344-rossi-208`.

**Esito in una riga:** nessun difetto nel gioco. Quattro guardiani premevano o confrontavano ciò che i giri 336/337 hanno cambiato
per decisione del PO (sono stati aggiornati alla decisione, senza toccare una soglia); patto-227 è verde sul banco su entrambi i
commit (instabile del runner); panchina-293 resta il rosso dichiarato «banco»; intervista-231 non giudica sul banco né sulla punta
né sulla base (strumento rotto dal 7.484, riparato qui). **Nessuna riga di `src/` cambiata → nessun rosso `__CPM_NO_G344` da
aggiungere** (non c'è una correzione del gioco da spegnere; ogni guardiano aggiornato tiene il suo braccio rosso, rigiocato).

| guardiano | punta fd2b9334 | d6819779 | causa | correzione |
|---|---|---|---|---|
| patto-227 | verde (52 s) | verde (53 s) | censimento sempre pulito (3000 carriere/765 capitani, 0 incoerenti). Nella catena `ci-runner` (due passi in parallelo, carico 8) il braccio verde è caduto 2 su 2 sul flusso della **riserva**: «Una stretta di mano» non visibile in 8 s (il verdetto esce dalla coda delle finestre `_pop224`). Da solo e con 3 copie in parallelo: verde 7/7. Causa esatta **non misurata** (nessuna finestra davanti nelle prove riuscite) | la sonda chiude ciò che sta davanti al verdetto fino a 6 volte e lo stampa («davanti al verdetto: …»), poi preme; il giudizio non cambia. Riga `solo_runner` in ROSSI-DICHIARATI |
| anteprima-230 | **rosso** 2/3 («3V 2N **6P**» contro «5P» atteso) | verde | giro 336 · PO-609: la rassegna mostra la classifica **dopo** la giornata (l'avversario ha già giocato la sua); il guardiano la confrontava con la classifica salvata **prima** del ritorno in carriera | il riferimento diventa la riga dell'avversario nella classifica che il gioco **salva** tornando alla carriera (`chiudi166`, come `partita-336` F5). Uguaglianza esatta invariata. Ora **3/3 verde, rosso `__CPM_NO_G230` bocciato** |
| forma-239 | **rosso** 5/6 (striscia «V N P V P» contro forma salvata «V V N P V») | verde | stessa decisione PO-609: la striscia include il risultato della giornata (la stessa forma scalata di uno) | parte A: forma attesa = `f239` salvata al ritorno in carriera; il braccio rosso giudica la striscia sparita contro la forma messa dal banco. Ora **6/6 verde, rosso 3/3 bocciato** |
| coerenza-235 | **rosso** (C: «nessun rimando al contratto in club», 375 e 1366) | verde | giro 337 · PO-617: «il contratto è dell'eroe: vive in Agente, non nella scheda Club» — la riga-rimando in Club è stata tolta apposta | il controllo C si **rovescia**, non si allenta: in Profilo il rimando resta obbligatorio, in Club un rimando rimasto è un rosso, scheda Club non letta = non giudicato. Ora **verde, rossi `__CPM_NO_G235`/`__CPM_NO_G260` bocciati** |
| nomi-248 | **rosso** 17 ok · 3 ko (D: partita ferma in `formations`) | verde | giro 336 · PO-608: il primo tasto della pre-partita è «Gioca la partita» (→ formazioni); la sonda premeva il primo tasto con /Gioca/i, che prima era «Salta e gioca» | la sonda preme `data-cpm="salta-336"` («Salta formazioni e ingresso», stesso gestore `onSkip` del vecchio «Salta e gioca»). Ora **verde 20/20, rosso `CPM_ROSSO248` 20/20 come deve** |
| intervista-231 | rosso: **non giudicato** (le 4 partite ferme fra 65' e 86' al tetto di 400 s, a 1× e anche a 2×) | rosso identico (non giudicato, anche a 2×) | non è dei giri 335-338: la sonda chiede `cpm-match-speed` = '4', che dal 7.484 non esiste (velocità 1 · 1,5 · 2) e il gioco riscrive a 1× → sul banco la partita non arriva al fischio. Sul runner arrivava (diceva solo «nazionale rosso: il difetto non si vede»). In più premeva «Salta e gioca» (rinominato dal 336) | velocità '2' (la massima che il giocatore può scegliere) + «Salta formazioni e ingresso» nella regex. Sul banco resta non giudicato (identico alla base): riga `banco` in ROSSI-DICHIARATI. **Non posso confermare** che il rosso del runner sparisca: lì la causa più probabile è la strada diversa presa nella Nazionale dopo il rename del 336, da rileggere al prossimo treno |
| panchina-293 | verde (244 s) | rosso (228 s) | già dichiarato «banco» su main (fps del braccio verde sotto il pavimento headless 3, instabile) | confermato, nessuna modifica |

## Decisioni del PO a cui i guardiani sono stati allineati

- **PO-608 (giro 336)** — pre-partita a due strade: «Gioca la partita» (formazioni → ingresso → 90') e «Gioca solo i momenti
  salienti»; il vecchio «Salta e gioca» diventa la voce secondaria «Salta formazioni e ingresso» (`data-cpm="salta-336"`).
- **PO-609 (giro 336)** — «la classifica deve essere già aggiornata, non quella della settimana prima»: la rassegna di fine partita
  usa la classifica dopo la giornata, la stessa che la Home mostrerà.
- **PO-617 (giro 337)** — il contratto vive in Agente, nella scheda Club non c'è più nemmeno il rimando.

Nessuna soglia abbassata: ogni confronto resta un'uguaglianza esatta; è cambiato solo **contro quale stato del gioco** si
confronta, e per coerenza-235 il controllo è diventato più stretto (un rimando in Club ora boccia).

## Sonde con lo stesso schema non toccate (fuori ambito, da sapere)

Cercano ancora «Salta e gioca» o «Vedi le formazioni»: `giornale-244`, `seme-a`, `sonda-seme-traccia`, `flussi-115`,
`c184-provini`, `scelte-197`, `misura-213`, `altezza-114`, `partita-rigiocata-194`, `prepartita-pc-300`. Non erano fra i rossi del
treno: alcune hanno ripieghi («Salta», «Gioca», «Entra in campo») che bastano, altre potrebbero diventare rosse quando girano.
Non le ho cambiate senza una misura.

## Rigiocata dopo le correzioni

Banco, punta del ramo (fd2b9334 + guardiani del giro 344):

- `npm run` singoli: anteprima-230 **3/3 verde, rosso bocciato** · forma-239 **6/6 verde, rosso 3/3 bocciato** · coerenza-235
  **verde, rossi bocciati** · nomi-248 **verde 20/20, rosso 20/20 come deve** · patto-227 (rinforzato) **verde 4/4**, anche in coppia
  con anteprima-230 come all'avvio della catena · intervista-231 non giudicato, identico su d6819779 (vedi tabella).
- `node ci-runner.mjs giro patto-227 anteprima-230 forma-239 nomi-248 coerenza-235 panchina-293 home-335 partita-336 club-337
  career-critical` (+17 sentinelle, 26 passi): **25/26 verdi**. L'unico rosso è patto-227 nella versione **prima** della
  rinforzatura (verde caduto sul flusso della riserva, 3 su 3 nella catena) — è il motivo del commit 6735b21. intervista-231 è stato
  giocato fuori catena sui due commit (31 minuti l'uno). Esito registrato in `docs/governo/STABILITA.json`.

Nessuna riga di `src/` toccata, `GAME_VERSION` invariato.
