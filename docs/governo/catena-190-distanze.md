# Catena 190 — verifica `distanze-126` (rieseguita intera)

Versione 7.999.190, HEAD 4f9363a0 (ramo lavoro/190). Solo verifica: nessuna modifica a `src/`, alle sonde o alle soglie.

## Preparazione
- `node tools/build-src.mjs` ok · `node tools/check-src.mjs`: IDENTICO BYTE PER BYTE (7.184.653 byte, 21 frammenti), allineato a HEAD.
- `tests/visual`: mancava `node_modules` → `npm install` (12 pacchetti, senza `playwright install`). Il primo lancio e' morto subito per `ERR_MODULE_NOT_FOUND: playwright` (21 s, nessuna misura); rilanciato dopo l'install.
- Risorse prima del lancio: RAM 16086 MB totali, 14947 libere; disco `/` 252G, 10G usati, 29G liberi.

## Esecuzione
`CPM_CHROME=/opt/pw-browsers/chromium CPM_CI_PAR=0 nohup npm run distanze-126`, senza tetto di tempo esterno, attesa in primo piano sul PID fino alla terminazione.
- Durata: ~4174 s (ora di ultima scrittura del log meno l'avvio; ~70 min). Il codice di uscita numerico NON e' stato catturato (processo avviato con nohup, non atteso con `wait`): l'esito e' letto dal verdetto stampato «VERDE».
- Partite finite: **24/24** (18 `ended`, il resto `ceremony`, tutte «fine»).

## Tempi per partita (s)
- s1: seme 1–8 → 196, 253, 291, 182, 257, 252, 219, 489
- s5: seme 1–8 → 427, 473, 656, 546, 723, 564, 450, 424
- s12: seme 1–8 → 573, 572, 478, 401, 400, 625, 478, 474

## Misure (braccio verde, 157 highlight con contatto)
| classe | n | mediana | p90 | max | oltre soglia |
|---|---|---|---|---|---|
| tiri | 60 | 20,9 m | 27,4 | 29 | oltre 30 m: **0** |
| tiri dal limite | 17 | 19,2 m | 20,8 | 20,9 | oltre 22 m: 0 |
| colpi di testa | 11 | 10,2 m | 12,1 | 14 | oltre 16,5 m: 0 |
| di cui fra-linee | 29 | 26,8 m | 28,3 | 29 | oltre 30 m: 0 |

Campione minimo raggiunto: tiri 40, dal limite 8, teste 6.

## Esito
**VERDE**: nessun tiro > 30 m, nessun «dal limite» > 22 m, nessuna testa > 16,5 m, 24/24 partite finite. Non serve la ripetizione.
Confronto: nella verifica 189 lo stesso controllo chiedeva 3756 s per 24/24; qui ~4174 s. Un tetto esterno di 2400 s e' dunque incompatibile col controllo.
