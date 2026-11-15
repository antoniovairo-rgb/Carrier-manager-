# Rapporto giro 206 — scene 3D: la notte (PO-373) e l'ingresso in campo (PO-412), dentro PO-367

Ramo `sviluppo/giro206-scene3d`, partito da `lavoro/195` (contiene la 7.999.194 e i giri 197-202, 205).
`GAME_VERSION` non toccata (regola fissa): nel sorgente resta 7.999.194; il numero 7.999.195 indicato nella consegna spetta a chi rilascia.
Interruttore unico del giro: `window.__CPM_NO_G206` (spegne tutto: notte, ingresso per tipo, guardalinee).
Tutte le misure sono headless (rendering software): confrontano due bracci sulla stessa macchina, **non sono le misure del telefono del PO**.

Letture richieste: rapporti 192 (cerimonie) e 196 (mai T-pose, 2D oltre il tetto) letti; `docs/LIVE_MATCH_3D_ROADMAP.md` letto (è l'audit
del vecchio motore 2D, non parla di notte né di ingresso). **I rapporti dei giri 170 e 170b non esistono nel ramo**: in `docs/sviluppo`
non c'è nessun `RAPPORTO-giro170*.md` e non compaiono nella storia di git; esistono solo le sonde (`tests/visual/giro170-*.mjs`,
`gesti-170b*.mjs`) e i rimandi nei rapporti 177/178 e nel backlog. Ho lavorato senza. Anche la voce PO-412 non è nel backlog del ramo:
ho usato il testo della consegna.

---

## A · PO-373 — partite di notte: «Atmosfera sì, campo no»

### Misura prima

Strumento nuovo `tests/visual/lib/notte-206.mjs`: partita vera del salvataggio di prova ferma al cronometro, ora congelata
(`__CPM_TOD`), meteo fisso (`?cpmwx=partly`), stadio forzato per tipologia, tre camere fisse messe dalla sonda. Ogni campione del
fotogramma è assegnato a **prato / cielo / spalti** con un raggio nella scena (non con una maschera a occhio). Luminosità = luminanza
Rec.709 sui valori del fotogramma (0-1); saturazione = (max−min)/max.

Rapporto notte/giorno **prima** (braccio rosso, PC 1280×720):

| stadio | camera | prato lum (sat) | cielo lum | spalti lum |
|---|---|---|---|---|
| tetto («inglese») | tribuna | ×1,06 (×0,98) | 0,143 (×0,18) | **×1,05** |
| | curva | ×1,05 (×0,98) | 0,143 (×0,18) | **×0,99** |
| | bordo campo | ×1,06 (×0,98) | 0,175 (×0,22) | **×1,03** |
| torri d'angolo («storico_it») | tribuna | ×1,04 (×0,98) | 0,135 (×0,17) | **×1,02** |
| | curva | ×1,04 (×0,98) | 0,140 (×0,18) | **×0,92** |
| | bordo campo | ×1,05 (×0,98) | 0,164 (×0,20) | **×1,01** |

Cosa dicono i numeri e le foto (`giro206/prima-notte-*`): di notte **gli spalti avevano la luminosità del giorno**; l'unica cosa che
diceva «notte» era il cielo. Il prato di notte era già un 4-6% più luminoso del giorno. Negli stadi con le luci sul tetto e in quelli
coi pali perimetrali le testate dei riflettori erano scatole bianche **senza alone** (testimone: 0 aloni su 8 testate nel «tetto»).

### Correzione (src/12, src/11)

- **Le luci non si toccano** (prato e giocatori restano com'erano: vincolo 7.539). Si scuriscono una volta, sul colore, i **materiali
  illuminati dello stadio** (gradinate, folla, strutture, tetto: fattore 0,42 sul colore lineare); i materiali che brillano di luce
  propria (LED, testate, cartelloni, tabellone) restano accesi. Un materiale usato dentro il rettangolo di gioco (porte, reti) non si
  tocca. Nessun costo per fotogramma.
- **Cielo**: colore di fondo dimezzato e orizzonte del fondale più scuro.
- **Riflettori**: di notte ogni testata ha il suo alone (sprite additivo, la stessa trama del giro 23: nessuna luce nuova, nessun
  asset); gli aloni delle torri moderne sono più larghi e pieni.
- Il tramonto (`dusk`) non è stato toccato.

### Misura dopo (guardiano `notte-206`, stesso build)

| stadio | camera | prato lum (sat) | cielo lum | spalti lum |
|---|---|---|---|---|
| tetto | tribuna / curva / bordo | ×1,06 / ×1,05 / ×1,06 (sat ×0,98) | 0,104 / 0,098 / 0,119 | **×0,68 / ×0,66 / ×0,70** |
| torri d'angolo | tribuna / curva / bordo | ×1,04 / ×1,04 / ×1,05 (sat ×0,98) | 0,096 / 0,102 / 0,113 | **×0,62 / ×0,63 / ×0,67** |
| pali perimetrali («comunale») | tribuna / curva / bordo | ×1,05 / ×1,05 / ×1,05 (sat ×0,98) | 0,100 / 0,102 / 0,110 | **×0,67 / ×0,65 / ×0,69** |
| tetto, telefono 375×667 | tribuna / curva / bordo | ×1,05 / ×1,05 / ×1,06 (sat ×0,98) | 0,092 / 0,098 / 0,119 | **×0,66 / ×0,64 / ×0,66** |

Il prato **non cambia** fra prima e dopo (stessi valori al terzo decimale). Riflettori: aloni = testate in tutti e tre i tipi (8/8, 4/4, 6/6).
Tabelle complete: `giro206/misura-notte-dopo.txt`; foto `giro206/prima-notte-*.jpg` e `dopo-notte-*.jpg`.

### Soglie dichiarate (mie, da confermare)

Guardiano `npm run notte-206`: prato di notte ≥ **95%** della luminosità del giorno e ≥ **93%** della saturazione · spalti di notte
≤ **80%** del giorno · cielo di notte ≤ **0,20** e ≤ **26%** del giorno · un alone per testata (almeno 4). Rosso col rosso: con
`__CPM_NO_G206` gli spalti tornano ×0,92-1,05 e il «tetto» resta senza aloni.

---

## B · PO-412 — ingresso in campo più scenico nelle partite importanti

### Misura prima (braccio rosso `__CPM_NO_G206` del guardiano `ingresso-206`)

| cosa | prima |
|---|---|
| tempi per tipo di partita | **uguali per tutte**: nel codice la regia dell'ingresso non dipendeva dal tipo. Misurati 15,9 s di scena sia nel big match di campionato sia nella finale di coppa (tunnel 3,2 s, giro, fila, carrellata; 3 stacchi) |
| coreografia / fumogeni / inno | nessuno. Esistevano già: tifo a livelli (bandiere, sciarpe, telo), bambini per mano in ogni partita, tappeto a centrocampo |
| fps telefono 375×667 (CPU ×2) | 2,3-2,5 nel big match · 1,7 nella finale (stadio neutro grande) |
| fps PC 1280×720 | 1,1 |
| difetto trovato misurando | **i due guardalinee erano alti 27,3 unità** (i calciatori 1,62-1,66): nel giro dello stadio la camera gli passava accanto (foto `prima-guardalinee-giganti-finale-1280x720.jpg`). C'era già prima di questo giro (stesso numero col rosso). Vedi sotto. |

Gli fps sono headless con rendering software: valgono solo come confronto fra i due bracci.

### Cosa è stato fatto (src/08 tabella, src/15 tipo e scritta, src/12 scena)

Il tipo di ingresso è **una tabella sola** (`INGRESSO206`, src/08) e una funzione pura (`tipoIngresso206`): finale > Nazionale > derby >
coppa europea > big match (peso ≥ 7) > normale. La finale è quella che il gioco già riconosce (campo neutro, tifo sui due lati).

| tipo | regia | scena | inno | coreografia | fumogeni · coriandoli |
|---|---|---|---|---|---|
| finale | **panoramica**: giro completo dello stadio, più alto, sguardo sulle curve (9,3 s) | 23 s | +7 s | **due lati** | sì |
| Nazionale | **bandiere**: la curva con le bandiere per 4,8 s, poi la fila | 19 s | +7 s | casa (i cartoncini si alzano dopo le bandiere) | sì |
| derby | **tunnel**: camera sulla bocca del tunnel per 7 s, lento avvicinamento | 19 s | — | casa | sì |
| coppa europea | quella di oggi | 16 s | +7 s | casa | sì |
| big match | quella di oggi (invariata: è quella che misurano `ingresso-285/277/245`) | 16 s | — | casa | sì |
| **normale** | **breve**: tunnel, uno stacco, squadre schierate | **9 s** | — | — | — |

1. **Coreografia della curva**: telo a cartoncini nei due colori sociali steso sulla pendenza della curva (stessa superficie di
   bandiere e sciarpe), una maglia sola per curva. Nelle finali anche sul lato ospite coi colori dell'altra squadra. Niente a stadio
   freddo (stessi cancelli della scenografia esistente).
2. **Fumogeni e coriandoli, dosati**: telefono 8 fumogeni per curva e 80 coriandoli, PC 14 e 180; un materiale per tipo, nessuna luce.
3. **Inno**: 7 secondi in più a squadre schierate coi bambini per mano (che c'erano già), carrellata lenta e vicina lungo la fila,
   scritta «🎵 Inno della competizione» / «🎵 Inni nazionali». **Senza musica** (vedi dubbi).
4. **Regia per tipo**: come in tabella. Il passo dei giocatori non cambia (camminata, tetto 2,3 u/s di PO-245): la durata si ottiene
   con gli stacchi, come nel giro 80.

Solo corpi e asset già presenti: nessun file nuovo, nessuna licenza nuova (`licenze-184` nei controlli).

**Guardalinee giganti (trovato misurando, corretto col rosso del giro).** I guardalinee CGTrader della modalità predefinita (giro 196,
pacchetto leggero) prendevano la taglia dal riquadro della geometria, che su quel pacchetto non è nella stessa unità dello scheletro:
27,3 u invece di ~1,7. Ora si controlla lo scheletro e si riscala a 1,62 u (misurato: 26,85 → 1,62). Il guardiano `tpose-196` non lo
vedeva perché misura la posa, non la taglia; `ingresso-206` ora misura l'altezza di ogni corpo in scena (tetto 2,4 u).

### Misura dopo (guardiano `ingresso-206`, telefono 375×667 CPU ×2, corpi 3D accesi)

| tipo (come provocato) | scena misurata | inquadrature in tempo di scena | coreografia | fumogeni | coriandoli | inno · scritta | fps verde (rosso) |
|---|---|---|---|---|---|---|---|
| normale (forzato) | **8,9 s** | tunnel 3,3 · schierati 5,75 | — | 0 | 0 | — | 2,39 |
| big match (forzato; è la partita del salvataggio) | 15,9 s | tunnel 3,3 · giro 5,8 · fila 2,05 · schierati 4,95 | casa | 8 | 80 | — | 2,47 (2,40) |
| derby (forzato) | 18,9 s | **tunnel 7,1** · fila 5,95 · schierati 6,05 | casa | 8 | 80 | — | 2,22 |
| coppa europea (forzato) | 22,9 s | tunnel 3,3 · giro 5,8 · fila 2,05 · schierati 4,9 · inno 7,05 | casa | 8 | 80 | 7,05 s · vista | 2,43 |
| Nazionale (forzato) | 25,9 s | tunnel 3,3 · **bandiere 4,8** · fila 4,95 · schierati 6 · inno 7,05 | casa | 8 | 80 | 7,05 s · vista | 2,53 |
| **finale di coppa vera** (salvataggio, non forzata) | 29,9 s | tunnel 3,3 · **panoramica 9,25** · fila 4,5 · schierati 6 · inno 7,05 | **casa + ospiti** | 16 | 80 | 7,05 s · vista | 2,02 (1,94) |
| big match, PC 1280×720 | 15,9 s | come sopra | casa | 14 | 180 | — | 1,12 (1,11) |
| finale di coppa vera, PC 1280×720 | 29,9 s | tunnel 3,2 · panoramica 9,3 · fila 4,5 · schierati 6 · inno 7,05 | casa + ospiti | 28 | 180 | 7,05 s · vista | 1,02 |

In tutti i bracci verdi: squadra schierata (scarto dal posto 0 u), corpo più alto in scena 1,82 u (rosso: 27,29 u), nessun errore di pagina.
Braccio rosso: finale 15,9 s e big match 15,9 s, nessuna regia per tipo, niente inno né coreografia.
La tabella dei tipi (`tipoIngresso206`) è giudicata su 13 contesti enumerati (campionato, provino, coppa, derby, girone e fase finale
europea, Nazionale, Mondiale/Europeo, Coppa delle Nazioni, finali): 13 su 13.

**«Forzato»** vuol dire che il tipo è stato imposto dal banco di prova (`__CPM_TIPO206`) sulla partita di campionato del salvataggio:
giudica la regia, non il riconoscimento. Il riconoscimento sul percorso vero è provato solo per la **finale di coppa** e per il **big
match** (la partita del salvataggio, peso 7). Derby, coppa europea e Nazionale non li ho giocati dal vero (vedi dubbi).

Foto: `giro206/dopo-ingresso-<tipo>-<inquadratura>-375x667.jpg` (una per inquadratura, a metà della sua durata in tempo di scena) e
`dopo-ingresso-finale-pc-*-1280x720.jpg`.

### Tetto di attesa e fluidità

- `__CPM_CAP196` (120 s) non è toccato: coreografia, fumogeni e coriandoli sono procedurali (nessun file da scaricare) e si costruiscono
  al montaggio della scena; l'attesa dei corpi resta quella del giro 196 (`tpose-196` nei controlli).
- fps: verde contro rosso sullo stesso ingresso, vedi tabella. Soglia del guardiano (mia): il verde non scende sotto l'85% del rosso.

---

## Guardiani nuovi (in `package.json`, catena `completa`, mappa di src/12-13 e src/15, fra i lenti)

| guardiano | cosa giudica | verde | rosso |
|---|---|---|---|
| `notte-206` (~5 min) | prato / spalti / cielo notte contro giorno, aloni dei riflettori; 3 stadi su PC + 1 su telefono | vedi sopra | `__CPM_NO_G206`: spalti ×0,92-1,05, tetto senza aloni; con `CPM_FORZA_ROSSO=1` il guardiano esce rosso |
| `ingresso-206` (~45 min) | tabella dei tipi (13 contesti) · per tipo: regia, durata di scena, coreografia/fumogeni/coriandoli/inno solo dove previsti, squadra schierata, corpi fuori scala · fps verde ≥ 85% del rosso (telefono e PC) | vedi sopra | `__CPM_NO_G206` sulla finale: 15,9 s, nessuna regia per tipo, guardalinee 27 u; con `CPM_FORZA_ROSSO=1` il guardiano esce rosso |

## Controlli (uno alla volta, `CPM_CI_PAR=0`, `free -m` e `df -h` prima di ciascuno, `CPM_CHROME=/opt/pw-browsers/chromium`)

TABELLA_CONTROLLI

## Peso

`CARRIER-MANAGER-AV.html`: 7.378.371 → PESO_DOPO byte (codice e commenti). Nessun asset aggiunto.

## Dubbi per il PO (non decisi)

DUBBI
