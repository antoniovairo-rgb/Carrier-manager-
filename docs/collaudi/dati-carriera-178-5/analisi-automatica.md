# Analisi automatica — 186 highlight, 29 partite dal vivo, 631 finestre

## Scene per tipo (act.ht o difensiva)
- difensiva: 30
- freekick: 15
- shot: 80
- build: 58
- cross: 1
- penalty: 2

## DIFESA — 30 scene difensive su 186 (16.1%)
| opzione | n | esiti |
|---|---|---|
| 🛑 Chiusura immediata | 7 | through 4, recovery 3 |
| 💪 Contrasto pulito senza fallo | 7 | foul 5, recovery 2 |
| 🧠 Anticipa sul primo controllo | 7 | through 4, recovery 3 |
| 🛡️ Scivolata netta | 5 | recovery 3, foul 2 |
| 🤼 Raddoppio coordinato col compagno | 4 | recovery 2, through 2 |

Esiti totali difesa: through 10 · foul 7 · recovery 13

## Incoerenze automatiche (candidati, da guardare uno a uno)
- punteggio-senza-esito-gol: 1 → s1w20#5
- nome-vs-esito:fallo: 5 → s1w24#2, s2w25#3, s3w5#2, s3w13#2, s4w19#4
- esito-assente: 18 → s1w24#7, s1w29#5, s2w7#1, s2w7#4, s2w34#1, s3w10#6, s3w13#3, s3w13#5, s3w16#4, s3w19#5, s3w27#3, s3w27#5
- gol-subito-durante-scena: 4 → ripresa#1, ripresa#3, s3w1#6, s3w16#4

## Tempi di tocco
- tocchi entro 0,5 s: 91 (registrati 91, non registrati 0)
- tocchi dopo 1,5 s: 47 (registrati 47, non registrati 0)

## Tabellino vs scene (26 partite con dati)
- gol dell'eroe: scena = tabellino in 25/26
- assist: scene con gol del compagno >= assist del tabellino in 26/26
- assist con nome del marcatore NON presente nelle scene: 9
- assist con minuto diverso (>2'): 5
  - s1w24: assist registrato a Stanco al 83' ma nessuna scena con gol del compagno lo nomina (scene con gol compagno: 90' ROSSI/ORLANDO/ORLANDO)
  - s1w29: assist registrato a Guerra al 40' ma nessuna scena con gol del compagno lo nomina (scene con gol compagno: 48' ROSA/RIZZI/RIZZI)
  - s2w7: Brunet segna al 14' nella scena, il tabellino dice 9'
  - s2w7: assist registrato a Berger al 54' ma nessuna scena con gol del compagno lo nomina (scene con gol compagno: 14' BRUNET/BRUNET; 62' BONNET/GAILLARD/GAILLARD)
  - s3w13: assist registrato a Berger al 16' ma nessuna scena con gol del compagno lo nomina (scene con gol compagno: 16' BUISSON; 48' DUPONT)
  - s3w13: assist registrato a Robin al 39' ma nessuna scena con gol del compagno lo nomina (scene con gol compagno: 16' BUISSON; 48' DUPONT)
  - s3w16: Martin segna al 69' nella scena, il tabellino dice 60'
  - s3w19: assist registrato a Legrand al 68' ma nessuna scena con gol del compagno lo nomina (scene con gol compagno: 77' BIGOT/BIGOT/BIGOT)
  - s3w27: Bigot segna al 31' nella scena, il tabellino dice 15'
  - s3w27: assist registrato a Robin al 21' ma nessuna scena con gol del compagno lo nomina (scene con gol compagno: 15' ; 31' BIGOT/BIGOT; 73' PETIT/GAILLARD/BERGER)
  - s3w27: Gaillard segna al 73' nella scena, il tabellino dice 64'
  - s3w32: assist registrato a Robin al 73' ma nessuna scena con gol del compagno lo nomina (scene con gol compagno: 82' GIRARD/GAILLARD/DUPONT)
  - s4w7: Fournier segna al 33' nella scena, il tabellino dice 26'
  - s4w11: assist registrato a Legrand al 52' ma nessuna scena con gol del compagno lo nomina (scene con gol compagno: 61' DAVID/BERGER/BERGER)
