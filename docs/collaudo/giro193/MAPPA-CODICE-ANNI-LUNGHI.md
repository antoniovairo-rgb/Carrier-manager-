# Giro 193 — appunti: cosa c'è nel codice per gli anni lunghi (lettura del sorgente, lavoro/194)

Fonte: ricerca nel sorgente fatta da un aiutante in sola lettura; i numeri di riga sono quelli che ha riportato lui. Li ho ricontrollati solo dove il rapporto li cita.

- Crescita attributi solo fino a 28 anni (src/18 r.4129). Calo dai 31: ogni settimana prob. 0,22 (31-32), 0,30 (33-34), 0,35 (35+) di perdere 1 punto, 70% su velocità o fisico (src/18 r.2034-2039). In partita −2 OVR a 31-32, −4 da 33 (src/10 r.950); voto simulato −3 da 31 (src/10 r.970).
- Infortuni e fatica NON dipendono dall'età (src/18 r.1976-1989). Rinnovo e stipendio non dipendono dall'età (src/18 r.5940-5953); il valore di mercato sì: ×0,78 fino a 30, ×0,45 fino a 33, ×0,25 oltre (src/06 r.102).
- Ritiro: annuncio nel percorso d'apertura dai 34 (src/18 r.1054, r.7538); volontario dai 32 dal Profilo (src/18 r.11070), dai 35 a fine stagione (src/16 r.3327). Nessun ritiro forzato: si può andare avanti senza limite.
- Tour d'addio (src/18 r.2890-2908): attestato del rivale dalla sett. 6, premio alla carriera dalla 10, 3 varianti. 6 eventi «addio» (src/03 r.536-556).
- Schermata di fine carriera (src/17 r.1052+): cerimonia, lettera d'addio con maglia ritirata nel club «bandiera», premi, «Hall of Fame» di lega, momenti, verdetto della stampa, tu contro il rivale, club, albo d'oro, biografia. Punteggio di eredità (src/17 r.975) max 1000. Nuova partita+ (src/17 r.1350): +1/+2/+3 agli attributi, «gioca come figlio/a».
- «Dopo il calcio» giocabile: 0. Solo un evento narrativo (src/03 r.1308) e una domanda d'intervista (src/07 r.995).
- Capitano (src/18 r.5217-5233): età ≥27, ≥130 presenze, fiducia ≥90, OVR ≥80, popolarità ≥58, poi 10% a occasione; si perde al cambio allenatore (r.5752). Effetti: discorso prima delle gare importanti, bonus gerarchie e legame tifosi.
- Fasi di carriera (src/03 r.1018): «veterano» dai 32, «bandiera» da 5 stagioni nello stesso club. Archi del veterano (src/18 r.2826-2837): corpo (31+), eredità (32+ e 80+ gol), panchina (32+). «L'erede» dai 34 (src/18 r.2746).
- Nazionale: presenze in natHistory (max 60), tornei ogni 2/4 stagioni, CT che cambia ogni 4 (src/08 r.250). Capitano della Nazionale, addio alla Nazionale, record di presenze/gol in Nazionale: 0.
- Record: LEAGUE_RECORDS (src/02 r.309), massimi personali (src/18 r.5347), archivio di lega 30 stagioni (src/18 r.5756). Storico stagioni: season, club, goals, assists, matches, ovr, league, leagueGoals (src/18 r.4749).
- Mondo: rosa che ruota (uno slot ogni ~7 stagioni, src/09 r.1241-1255), compagni senza età e senza ritiro; allenatore 20% di cambio a stagione (src/18 r.5620); rivale che cala dopo i 30 e non si ritira (src/18 r.4757-4776); club emergente ogni 5 stagioni, «fenomeno generazionale» ogni 8 (src/18 r.5626, r.5634).
- Eventi: ~112 settimanali (4 con condizione d'età, tutte ≤23), ~52 casuali (0 sull'età), ~130 impulsi (~4 sull'età, 6 d'addio), 248 domande d'intervista di cui 6 per i veterani (src/07 r.1299).
- Fuori campo: staff 3×3 livelli, accademia, investimenti, 4 beni (casa, auto, barca, fondazione) (src/08 r.42-148). Famiglia, partner, figli: 0. Soprannome, anniversari: 0.
- Traguardi (src/17 r.1525): 17 — gol 10/25/50/100/150; presenze 25/50/100/200; OVR 75/80/90/95; assist 10/25/50.
- Mercato: finestre sett. 1-5 e 19-23, prestiti, richiesta di cessione, trattativa. Clausola rescissoria, leghe «di fine carriera», ritorno al primo club: 0.
- Derby: ~19 coppie (src/08 r.271), +3 al peso partita.
