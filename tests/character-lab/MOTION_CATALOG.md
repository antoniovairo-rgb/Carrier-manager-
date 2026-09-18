# Catalogo movimenti del POC Hero

`assets/animated.glb` contiene solo animazioni che hanno un clip sorgente nel
repository e che hanno superato il bake sul rig ricostruito, il controllo del
piede sul terreno e la prova visiva. Non usa pose procedurali al posto di un
movimento registrato.

| Area | Movimento | Clip | Stato |
| --- | --- | --- | --- |
| Giocatore | Attesa | `idle` | pronto |
| Giocatore | Corsa, corsa indietro, cambi laterali | `jog`, `jog-back`, `strafe-left`, `strafe-right` | pronto |
| Giocatore | Stop e primo controllo | `receive` | pronto |
| Giocatore | Tiro, rigore, testa, rovesciata, scivolata, rimessa | `kick`, `penalty`, `header`, `volley`, `tackle`, `throwin` | pronto |
| Giocatore | Dribbling e passaggio | `dribble`, `pass` | pronto |
| Giocatore | Cross | `cross` | manca il sorgente |
| Giocatore | Corsa piena, jogging, camminata | `running`, `jogging`, `walk` | pronto |
| Giocatore | Corsa con curva, cambio direzione, corsa guardando dietro | `running-to-turn`, `change-direction`, `run-look-back`, `look-over-shoulder` | pronto |
| Giocatore | Accovacciato in piedi | `crouch-to-stand` | rifiutato: rig senza ossa delle dita dei piedi |
| Difesa | Scivolata | `slide-tackle` | pronto e collegato |
| Difesa | Contrasto in piedi e spallata | `standing-tackle`, `shoulder-challenge` | manca il sorgente |
| Difesa | Marcamento, intercetto e blocco tiro | `marking-shuffle`, `intercept`, `shot-block` | manca il sorgente affidabile |
| Difesa | Corsa di recupero | `recovery-run` | pronto |
| Reazioni | Disperazione per occasione mancata | `missed-chance` | pronto |
| Esultanze | Esultanza generica e passo di capoeira | `celebrate`, `capoeira-celebration` | in acquisizione |
| Panchina | Applauso da seduto e alzata | `sit-clap`, `sit-to-stand` | pronto; `sit-clap` è collegato |
| Panchina | Seduto fermo, parla, indica | `sit-idle`, `sit-talking`, `sit-pointing` | primo e indicazione rifiutati dal rig; parlato manca |
| Mister | Indica, urla, parla, applaude | `coach-point`, `coach-yell`, `coach-talk`, `coach-clap` | manca un sorgente completo |
| Portiere | Posizione base e presa alta | `gk-ready`, `gk-high-catch` | pronto e collegato |
| Portiere | Presa bassa | `gk-low-catch` | rifiutata: la clip disponibile non è una presa bassa affidabile |
| Portiere | Tuffi e respinte destra/sinistra | `gk-dive-left`, `gk-dive-right`, `gk-parry-left`, `gk-parry-right` | manca il sorgente |
| Portiere | Uscita e rialzata | `gk-rush-out`, `gk-get-up` | manca il sorgente |
| Portiere | Rinvio e lancio | `gk-goal-kick`, `gk-throw` | pronto |

## Regola di ingresso

Ogni clip acquisito viene scaricato con licenza valida, senza personaggio
incluso e senza traslazione del personaggio quando disponibile. Diventa pronto
solo dopo conversione in `assets/anim-<nome>.glb`, retarget sul rig ricostruito,
controllo automatico dei piedi e prova visiva nel laboratorio. Finché questi
controlli non passano, non compare né viene sostituito con una posa finta.
