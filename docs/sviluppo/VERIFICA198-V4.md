# Verifica della 7.999.198 — parte V4 (schermate)

- **Ramo provato:** `prova/198-finale` (0f0b13d8) → lavoro su `sviluppo/verifica198-v4`.
- **Base di confronto:** `lavoro/198` (b3b75b9d), in una copia di lavoro separata.
- **Ambiente:** sessione cloud, 16 GB di memoria (15,4 liberi alla partenza), 59 GB di disco liberi; `CPM_CHROME=/opt/pw-browsers/chromium`; un controllo alla volta (`CPM_CI_PAR=0`); tetto 40 minuti per controllo. `@babel/standalone` installato 7.29.15.
- **Durata:** circa 3 ore e 20 minuti (18:55 → 22:15).
- **Elenco dei controlli:** letto da `tests/visual/ci-runner.mjs` senza eseguirlo: unione di TUTTE le righe della MAPPA che corrispondono a src/11, 17, 18, 19, 02, 13 (la riga di src/19 contiene anche l'intera catena `completa`), meno `highlight-95`, `ingresso-206`, `career-critical` e meno tutto ciò che compare nelle righe di src/12 e src/15. Risultato: **132 controlli**, più `avvio-233` e `prepartita-pc-300` chiesti dalla consegna (il primo sta nelle righe di src/12/15, il secondo non è in MAPPA) = **134**.

## Verdetto

**V4 pronto: SÌ, con riserva.** Sui **110 controlli eseguiti** (su 134) **nessun rosso nasce dall'unione** dei giri 293–302:

- 108 verdi;
- 2 rossi, entrambi **identici sulla base** o già dichiarati: `difficolta-156` (già dichiarato) e `store-236` (non era nell'elenco dei dichiarati; rieseguito su `lavoro/198`: stesso rosso, stesso punto S8);
- `avvio-233` è verde **dopo un ritocco al controllo** (non al gioco), spiegato sotto.

La riserva: **24 controlli non eseguiti** per il tetto di tempo (elenco preciso in fondo). Di questi non posso confermare l'esito.

## avvio-233 (il primo della consegna)

| corsa | dove | esito | nota |
|---|---|---|---|
| 1 | finale | rosso dopo 301 s | attesa scaduta in `misura-233.mjs` riga 47: il menu «non compare» entro 300 s |
| 1 | base `lavoro/198` | rosso dopo 301 s | identico: **non nasce dall'unione** |
| sonda | finale | — | la pagina arriva al menu in meno di 10 s; il testo a schermo è «NUOVA CARRIERA» in maiuscolo, il controllo aspettava «Nuova carriera» esatto |
| 2 | finale, dopo il ritocco a `misura-233.mjs` | rosso dopo 148 s | stessa attesa, seconda copia (`avvio-233.mjs` riga 68) |
| 3 | finale, dopo il secondo ritocco | **verde** in 263 s | braccio verde: (1) verde · (2) verde · (3) verde; braccio rosso: (1) ROSSO · (2) ROSSO · (3) ROSSO, «prova del rosso riuscita» |

Numeri del braccio verde (corsa 3): menu dopo 7,4 s; 2,69 MB sul filo prima del menu + 12 s (soglia 3,50); 7,61 MB di file (soglia 8,50); 0 modelli 3D chiesti senza tocco.

**Ritocco (commit 9d80be3 e cfbea7b):** aggiunta la sola `i` (non distingue maiuscole) alle due ricerche del testo del menu. Nessuna soglia toccata. Il giro 302 l'aveva fermato a 225 s: con questo difetto non sarebbe finito nemmeno col tetto lungo (cadeva da solo a 300 s). Non ho verificato da quale giro il controllo è cieco: sulla base `lavoro/198` lo è già.

## Rossi

| controllo | esito su finale | esito sulla base | nato da quale giro | nota |
|---|---|---|---|---|
| store-236 | ROSSO (24 s) | ROSSO (25 s), stesso punto | nessuno (identico sulla base) | S8: «TWA versionName 7.999.197 · twa-manifest 7.999.197/7.999.197 · versionCode 2001/2001 · GAME_VERSION 7.999.198 (ammesse 7.999.198 o 7.999.199)». Gli altri punti sono verdi. I file del pacchetto store sono fermi alla 197: non corretto (tocca la versione del pacchetto, fuori dalla consegna). **Non era fra i rossi già dichiarati.** |
| difficolta-156 | ROSSO (151 s) | non rieseguito | già dichiarato | fasce gavetta/affermazione/declino fuori soglia (log `out/v4-logs/fin/difficolta-156.log`) |
| avvio-233 | verde dopo il ritocco | rosso (controllo cieco) | nessuno | vedi sopra |

Rossi già dichiarati che stanno nel mio elenco ma **non sono stati eseguiti**: `diagonali-210`, `testata-209` (messi in fondo alla coda perché già dichiarati; il tempo è finito prima). Gli altri rossi dichiarati (finale-202, voto-79, giornale-244, buildup-sync, difesa-220-scena, tocco3d-219, intervista-231, classifica-194, esiti-218, schede-259, schede-260, pagella-75, esito-280, assist-nome-98, scene-221, ball-attended, movimento-147, parata-100, nomi-182) non sono nel mio elenco: stanno nelle righe di src/12 o src/15.

Instabili: nessun controllo è passato da rosso a verde senza una modifica; non ho quindi avuto doppie corse da fare.

## Tutti i controlli eseguiti su `prova/198-finale`

Colonna «base»: «—» = non rieseguito sulla base (verde sul finale, non serve). Colonna «s» = secondi.

| controllo | esito su finale | s | esito sulla base | nato da quale giro | nota |
|---|---|---|---|---|---|
| ritocchi-302 | verde | 66 | — | — |  |
| prepartita-pc-300 | verde | 124 | — | — |  |
| rosa-angoli-299 | verde | 602 | — | — | 24 casi |
| avvio-233 | verde | 263 | rosso (controllo cieco) | nessuno | verde dopo il ritocco alle maiuscole |
| home-298 | verde | 119 | — | — |  |
| test:logic | verde | 2 | — | — |  |
| save-compat | verde | 1 | — | — |  |
| nomi-248 | verde | 46 | — | — |  |
| calendario-218 | verde | 32 | — | — |  |
| figurina-199 | verde | 45 | — | — |  |
| spogliatoio-182 | verde | 14 | — | — |  |
| patrimonio-303 | verde | 53 | — | — |  |
| grafica-v2 | verde | 117 | — | — |  |
| momenti-v2 | verde | 158 | — | — |  |
| schermate-97 | verde | 126 | — | — |  |
| crea-home-295 | verde | 5 | — | — |  |
| neutro-287 | verde | 37 | — | — |  |
| piccoli-85 | verde | 42 | — | — |  |
| ritratto-171-72 | verde | 56 | — | — |  |
| stili-098-migrazione | verde | 2 | — | — |  |
| stile-unico-75 | verde | 10 | — | — |  |
| popup-224b | verde | 37 | — | — |  |
| chip-269 | verde | 9 | — | — |  |
| badge-255 | verde | 46 | — | — |  |
| finestra-230 | verde | 41 | — | — |  |
| popup-224 | verde | 17 | — | — |  |
| migrazione-194 | verde | 25 | — | — |  |
| classifica-102 | verde | 7 | — | — |  |
| convocazione-235 | verde | 20 | — | — |  |
| toast-247 | verde | 19 | — | — |  |
| brusio-238 | verde | 3 | — | — |  |
| toast-intervista-247 | verde | 43 | — | — |  |
| festa-oro-251 | verde | 20 | — | — |  |
| crediti-254 | verde | 6 | — | — |  |
| toast-256 | verde | 33 | — | — |  |
| via-ch38-171 | verde | 71 | — | — |  |
| pulsanti-263 | verde | 131 | — | — |  |
| primavera-260 | verde | 63 | — | — |  |
| podio-260 | verde | 20 | — | — |  |
| store-236 | ROSSO | 24 | ROSSO | nessuno | S8, versione del pacchetto store |
| interviste-211 | verde | 5 | — | — |  |
| patto-227 | verde | 39 | — | — |  |
| rosa-228 | verde | 56 | — | — |  |
| agente-198 | verde | 81 | — | — |  |
| svincolato-198 | verde | 75 | — | — |  |
| home-199 | verde | 119 | — | — |  |
| rifiniture-200 | verde | 151 | — | — |  |
| indice-163 | verde | 20 | — | — |  |
| salta-163 | verde | 105 | — | — |  |
| momento-165 | verde | 175 | — | — |  |
| momento-165b | verde | 179 | — | — |  |
| momento-185 | verde | 153 | — | — |  |
| gioca-188 | verde | 29 | — | — |  |
| simula-v2 | verde | 29 | — | — |  |
| impulsi-289 | verde | 19 | — | — |  |
| trainer-288 | verde | 11 | — | — |  |
| livello-79 | verde | 30 | — | — |  |
| errori-168 | verde | 9 | — | — |  |
| barra-360-72 | verde | 26 | — | — |  |
| acquisti-281 | verde | 24 | — | — |  |
| difficolta-156 | ROSSO | 151 | — | — | già dichiarato |
| impulsi-memoria-154 | verde | 44 | — | — |  |
| nazionale-155 | verde | 40 | — | — |  |
| rinnovo-270 | verde | 31 | — | — |  |
| simulata-272 | verde | 7 | — | — |  |
| giornata-233 | verde | 15 | — | — |  |
| recupero-103 | verde | 23 | — | — |  |
| euro-attesa-181 | verde | 8 | — | — |  |
| riquadro-euro-105 | verde | 10 | — | — |  |
| avversario-106 | verde | 1 | — | — |  |
| rinvio-coppe-107 | verde | 16 | — | — |  |
| etichette-108 | verde | 1 | — | — |  |
| titolo-110 | verde | 8 | — | — |  |
| pre-188 | verde | 7 | — | — |  |
| conferenza-192 | verde | 0 | — | — |  |
| partita-rigiocata-194 | verde | 315 | — | — |  |
| pro-rivale-176 | verde | 21 | — | — |  |
| anteprima-212 | verde | 19 | — | — |  |
| mister-215 | verde | 28 | — | — |  |
| presentazione-214 | verde | 29 | — | — |  |
| calendario-247 | verde | 15 | — | — |  |
| coppa-prestito-245 | verde | 24 | — | — |  |
| procuratore-253 | verde | 73 | — | — |  |
| backup-167 | verde | 23 | — | — |  |
| home-066 | verde | 51 | — | — |  |
| squalifica-222 | verde | 54 | — | — |  |
| investimento-223 | verde | 118 | — | — |  |
| infortunio-263 | verde | 79 | — | — |  |
| svincolato-264 | verde | 58 | — | — |  |
| meta-conto-265 | verde | 25 | — | — |  |
| scene-fuori-137 | verde | 18 | — | — |  |
| offerta-249 | verde | 25 | — | — |  |
| rinnovo-238 | verde | 182 | — | — |  |
| serata-261 | verde | 368 | — | — |  |
| presentazione-225 | verde | 1219 | — | — |  |
| scelte-201 | verde | 452 | — | — |  |
| classifica-259 | verde | 139 | — | — |  |
| web-237 | verde | 43 | — | — |  |
| nomi-251 | verde | 44 | — | — |  |
| moves-budget | verde | 142 | — | — |  |
| tocco-213 | verde | 245 | — | — |  |
| gigante-212 | verde | 940 | — | — |  |
| design-system | verde | 0 | — | — |  |
| clip-180 | verde | 0 | — | — |  |
| stili-098 | verde | 18 | — | — |  |
| tema-unico | verde | 17 | — | — |  |
| typing-shortcuts | verde | 12 | — | — |  |
| provini-201 | verde | 17 | — | — |  |
| test:vision | verde | 2 | — | — |  |
| licenze-184 | verde | 100 | — | — |  |

## Rapporti dei giri 298–302: cosa era già stato eseguito

Non ho usato i verdi dei giri per saltare controlli: i giri li hanno eseguiti sui loro rami **prima** dell'unione, e l'unione ha cambiato gli stessi file (src/11, 17, 18). Li ho quindi rieseguiti sul finale. Fanno eccezione, per mancanza di tempo, due controlli che il giro 302 dichiara verdi e che qui **non** sono stati rieseguiti:

- `griglia-mobile`: verde nel giro 302 (187 s, 14 schermate × 5 larghezze) — sul finale **non posso confermarlo**.
- `diagonali-210`: rosso nel giro 300, «identico sulla base» — non rieseguito.
- `testata-209`: rosso nel giro 298, «identico sulla base» (16 minuti) — non rieseguito.

## NON eseguiti (24)

Motivo per tutti: tetto di tempo. Due sono stati interrotti a metà e **non valgono**.

| controllo | nota |
|---|---|
| interviste-183 | **interrotto** dopo circa 10 minuti: il processo della coda è stato fermato dal limite di due ore dei processi in sottofondo della sessione. Né verde né rosso. Log parziale in `out/v4-logs/fin/interviste-183-interrotto.log` |
| sigle-203 | **interrotto** da me dopo circa 6 minuti a tempo scaduto. Né verde né rosso |
| griglia-mobile | verde dichiarato dal giro 302, non rieseguito |
| diagonali-210 | rosso già dichiarato, non rieseguito |
| testata-209 | rosso già dichiarato, non rieseguito |
| box-fischio-169 | mai partito |
| cerimonie-192 | mai partito |
| convocazione-190 | mai partito |
| cronaca-nomi-190 | mai partito |
| difesa-220 | mai partito |
| gol-eroe-154 | mai partito |
| grafica-168 | mai partito |
| manovre-150 | mai partito |
| momento-194 | mai partito |
| nomi-190 | mai partito |
| nomi-211 | mai partito |
| nomi-219 | mai partito |
| nomi-salvati-190 | mai partito |
| passaggi-228 | mai partito |
| prima-partita-237 | mai partito |
| replay | mai partito |
| scena-motore-147 | mai partito |
| statistiche-228 | mai partito |
| testi-190 | mai partito |

Fuori dal mio perimetro per consegna: `highlight-95`, `ingresso-206`, `career-critical`, i controlli delle righe di src/12 e src/15 (V1, V2, V3), `node ci-runner.mjs mirata`, il gate `validate-situations` (sta nelle righe di src/12).

## Cose da sapere

1. **store-236 è un rosso non dichiarato**, presente anche sulla base: il pacchetto store (TWA) dichiara la 7.999.197 mentre il gioco è alla 7.999.198. Va allineato prima della pubblicazione; non l'ho toccato.
2. **avvio-233 era cieco** (cadeva per attesa scaduta) anche sulla base: chi l'ha contato «non concluso» nei giri 298–302 non poteva vederlo finire. Ora giudica ed è verde.
3. Alcuni controlli riscrivono le foto dei giri in `docs/sviluppo/giro302/`: rimesse con `git restore -- docs` dopo ogni controllo. Nessuna foto di altri giri è nel commit.
4. Un processo in sottofondo della sessione vive al massimo due ore: una coda più lunga va spezzata (qui è costata la corsa di `interviste-183`).
5. Log completi di ogni corsa in `tests/visual/out/v4-logs/` (cartella non versionata: restano solo in questa sessione).
