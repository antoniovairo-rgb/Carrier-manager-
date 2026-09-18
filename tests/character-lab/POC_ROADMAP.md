# Roadmap POC Character System Hyper Casual

**Branch:** `poc/marioprada-character-system`  
**Vincolo:** rendering e asset soltanto; il motore della partita, la telecronaca e la carriera restano invariati.

## Obiettivo

Portare il modello Hyper Casual validato dall’Hero all’intero ecosistema della
partita: giocatori, portieri, panchina, arbitro e assistenti, mister, staff e
bambini all’ingresso. Tutti devono mantenere proporzioni coerenti, colori e
personalizzazioni ereditate dai dati del gioco, e stabilità mobile.

## Piano di consegna

| Fase | Risultato verificabile | Stato |
| --- | --- | --- |
| 0. Base | GLB ricostruito, rig di 60 ossa, retarget e test mobile Hero | completata |
| 1. Hero negli highlight | Nuovo modello su stop, tiro, testa, rovesciata, scivolata e rimessa | completata |
| 2. Intro e ingresso | I 22 giocatori dell’ingresso usano la famiglia Hyper Casual. **Nessun CH38 visibile nell’intro.** | completata e verificata |
| 3. Squadre in campo | 22 giocatori, 2 portieri e arbitro principale Hyper con kit home/away/portiere/arbitro | completata nella POC |
| 4. Bordo campo | 12 riserve sedute, 4 mister/staff Hyper; le riserve usano la clip `sit-clap` | completata nella POC |
| 5. Ufficiali e bambini | 2 assistenti con divisa e bandierina; 22 bambini Hyper nell’ingresso | completata nella POC |
| 6. Personalizzazione | Kit e ruolo sono ereditati; nome, numero, pelle, capelli e barba attendono un asset/maschera dedicata | parziale |
| 7. Movimento | 31 clip pubblicate e controllate; le azioni mancanti restano in acquisizione | in corso |
| 8. Collaudo | Smoke test browser mobile completo superato; restano i test reali Android/iOS, memoria e fluidità | in corso |

## Prova POC

- `?hyperCharacter=hero`: solo l’eroe negli highlight.
- `?hyperCharacter=intro`: formazione Hyper nell’ingresso.
- `?hyperCharacter=full`: campo, panchine, mister/staff, ufficiali e bambini Hyper.

Il controllo mobile automatico della modalità `full` conferma 23 figure Hyper nella
formazione, 16 a bordo campo, 2 assistenti e 22 bambini; non registra errori né
figure procedurali visibili nei gruppi sostituiti.

### Prova da telefono autorizzato

Dopo il build, dalla cartella `tests/character-lab` esegui `npm run start:lan`.
Il terminale mostra un link temporaneo di pairing per `?hyperCharacter=full`:
apri quel link, e solo quello, sul telefono connesso alla stessa rete Wi-Fi. Il
link crea una sessione locale nel browser; chi non possiede il token non può
caricare la POC. Se Windows lo chiede, consenti la rete **Privata** per Node.

## Regole visive

- Stile cartoon Hyper Casual coerente fra tutti i ruoli.
- Testa ridotta rispetto alla prima POC, circa 15–25%; proporzione indicativa di 6,5–7 teste.
- Silhouette leggibili a distanza e movimenti naturali.
- Kit club applicati a runtime: maglia, pantaloncini, calzettoni, pattern e sponsor.
- Varianti per portiere, arbitro, mister, staff e bambini; niente riuso indistinto del giocatore di movimento.
- Accessori essenziali per il ruolo: guanti, pettorine, bandierine, cartellini e abbigliamento da panchina.

## Criteri di accettazione per fase

### Fase 2 — Intro

1. I 22 giocatori dell’ingresso non richiedono né mostrano `footballer.glb`/CH38.
2. Mantengono la disposizione, l’ordine d’ingresso e la logica esistente.
3. Home, away e portiere sono riconoscibili dai kit.
4. Il test mobile non mostra compenetrazioni, piede sotto il terreno o errori di caricamento.

### Fasi 3–6 — Sistema completo

1. Ruolo, kit e colori arrivano dai dati della partita. Le personalizzazioni non
   ancora mappate sono segnalate come lavoro residuo e non simulate.
2. Ogni clone ha scheletro e animatore indipendenti, mentre geometrie e materiali condivisibili restano condivisi.
3. Le clip vengono pubblicate solo dopo conversione, retarget, controllo del terreno e prova visiva.
4. La scena mantiene il budget mobile; se serve, le persone lontane usano LOD prima di ridurre qualità ai protagonisti.

## Controllo finale

- 22 giocatori in campo e nell’intro.
- Panchina completa, arbitro con assistenti, mister, staff e bambini.
- Kit verificati con dati di club diversi; completare la mappa di personalizzazione.
- Highlight, ingresso, sostituzioni e cerimonie senza CH38 nelle scene incluse.
- Test Android/iOS e mobile browser: fluidità, memoria, assenza di errori e stabilità dopo più partite.
- Commit piccoli e tracciabili, soltanto su questo branch.
