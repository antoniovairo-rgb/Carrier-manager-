# FASE 6 — LE INTERAZIONI DELL'EROE: VERITÀ E VARIETÀ
*(nota PO 02/09: «molto molto ripetitive e poco credibili — es. il compagno che segna al tiro
successivo ma non è vero!». Misure fatte, rimedi pianificati; si esegue nel blocco dedicato.)*

## Misure agli atti (02/09)
1. **GOL PER DECRETO** (la promessa falsa, riprodotta al banco assist-719): fuori dal ramo aereo
   (7.0.4) l'esito `assist` dichiara il gol del compagno (festa ASSIST! + punteggio) SENZA che
   esista un tiro: gi118 consegna a gx 72-75 e la palla resta lì (post=assist_recv); gi123
   consegna a gx 57 — gol celebrato con palla a metà campo. Due vie di fuga nominate (r.5882):
   la famiglia pass converte in `chance`+secondo tempo SOLO se il dado di esecuzione dice chance;
   le altre famiglie non convertono mai.
2. **CONSEGUENZE INVISIBILI** (§7 violato, censito): zona/marcatura/fiducia/intesa/coinv sono
   scritte dalle scelte (r.1645-49) e lette SOLO dai cancelli delle carte successive
   (r.3416-20) — mai dal campo, mai dal Match State. Circuito chiuso.
3. **RIPETITIVITÀ STRUTTURALE**: 38 carte totali, cancelli stretti; le memorie esistenti
   (fatte per-partita, esclusione bi-partita 7.682/7.690) girano su un mazzo che a ogni stato
   qualifica 1-3 carte → rotazione percepita di 4-6 per stagione.

## Rimedi (ordine di esecuzione del blocco)
A. **L'ASSIST NON È MAI UN DECRETO**: estendere la regola aerea a ogni famiglia — consegna ⇒
   `chance` + secondo tempo SEMPRE (via `_chance78`→pendingChainSit, plumbing esistente r.6118);
   il gol si dichiara solo alla palla-in-rete della catena. PRIMA: audit dell'economia
   (chi accredita l'assist quando segna il compagno nella catena — il ramo aereo lo fa già:
   fireGoalCeleb by:'mate'; mischia/second_ball da verificare). Rosso NO720.
B. **LE CONSEGUENZE TOCCANO IL CAMPO**: ora che il Match State esiste (7.711), le scelte scrivono
   su di lui e il campo risponde — v1: `zona` sposta l'ancora di corsia dell'eroe (visibile),
   `marcatura` modula la distanza del marcatore nel deployment (misurabile col censimento marks
   del MS). Rosso NO721.
C. **IL MAZZO RESPIRA**: +20 carte nella voce di casa (famiglie sottorappresentate: AVVERSARI in
   vantaggio, COMPAGNI dopo errore, METEO/pubblico) + cancelli allargati con pesi invece che
   soglie secche. Misura: censimento id distinti su 6 partite (oggi ~4-6 attesi, target ≥12).
