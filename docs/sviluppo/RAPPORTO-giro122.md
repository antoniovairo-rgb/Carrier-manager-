# Giro 122 — Albo d'oro per lega (PO-326, lotto 7.999.185)

**Rilievo del PO (foto 184, albo al telefono):** «Non mi è chiara questa schermata, che c'entra nerazzurri??»
**Decisione del PO:** «In alto i tuoi titoli, sotto per lega».

## Misura prima
`src/18-career-app.jsx` (tab Stagione, albo): `titleCount` contava i campioni di **tutte** le leghe dell'archivio mescolate, senza nome della lega
(in foto: Merseyside ×6, Rotterdam ×3, Nerazzurri ×2 da tre leghe diverse); «Hai vinto la lega!» non diceva quale né quante volte.
Foto «prima» (stesso salvataggio di prova, albo su 3 leghe) a 360x800, 412x915, 1440x900: `foto-giro122/prima-*.png`.

## Cosa cambia
1. **In cima solo il giocatore** («I tuoi titoli»): campionati vinti con club e lega (`🏆 4 campionati vinti · FC Salernum, Lega B`; con più club/leghe, elenco breve con ×n, max 4 + «altri»), Coppe e Coppe europee (da `isPlayerCupChamp`/`isPlayerEuroChamp`), miglior piazzamento con club, lega e stagione solo se non ha mai vinto. Niente «Hai vinto la lega!».
2. **Etichette dei campioni dentro ogni lega**, sotto il nome, contando solo le stagioni chiuse di quella lega.
3. **Una sezione per lega**: attuale aperta, le altre in `Fisarmonica` chiusa (tocco effettivo ≥44 px), dalla più recente (la lega attuale sempre prima).
4. Riga **IN CORSO** invariata (non conta nei titoli).
Interruttore rosso `__CPM_NO_G122` = albo di prima. Nessun campo di salvataggio nuovo, `GAME_VERSION` non toccata.

## Guardiano `npm run albo-122` (non-gate)
Salvataggio con 3 leghe (Lega B attuale, Serie A, Eredivisie). Verde nei 3 formati: riepilogo unico, «4 campionati vinti · FC Salernum, Lega B», 1 Coppa, 1 Euro, nessun club estraneo, niente «Hai vinto la lega!»;
etichette per lega esatte (Lega B: Salernum ×4, Brescia ×2 · Serie A: Nerazzurri ×2 · Eredivisie: Rotterdam ×3) e nessun club di un'altra lega; ordine Lega B › Serie A › Eredivisie, prima aperta e altre chiuse; tocco (area effettiva) ≥44; contrasto minimo misurato 6,35:1; nessuno scroll orizzontale.
Rosso con l'interruttore: 6/6 difetti (riepilogo assente, «Hai vinto la lega!» presente). Foto «dopo»: `foto-giro122/dopo-*.png`.

## Catena
`node tools/build-src.mjs` + `check-src.mjs`: identico byte per byte. albo-122 verde+rosso · save-compat 12/12 · test:logic verde · career-critical verde · career-critical verde · altezza-114 verde+rosso · collaudo-110 verde+rosso · scorri-113 verde+rosso · pc-tablet-292 verde. Tutti eseguiti uno alla volta (CPM_CI_PAR=0) sul build esatto.
