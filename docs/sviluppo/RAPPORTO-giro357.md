# Giro 357 · PO-654 — «Occhio al copyright delle coppe»

Base `lavoro/201` (7.999.209). Ramo `sviluppo/giro357-sigle-coppe`. GAME_VERSION non toccata (rilascio automatico).

## Sintomo
Schermata di fine carriera, riquadro «✨ Momenti indimenticabili»: «UEL · FC Rotterdam · S.3», «UCL · FC Merseyside · S.9».
Sono le sigle vere delle coppe UEFA, cioè le chiavi interne (`UCL/UEL/UECL`) che il gioco salva nei trofei.

## Causa (misurata)
`src/17` `CareerEndScreen`, costruzione dei momenti (dal 7.257.0 i momenti vengono prima dai trofei persistenti):
`headline:\`${t.league||"Titolo"}…\`` stampava `t.league` grezzo. Per un trofeo europeo `t.league` è la chiave salvata
(`src/18`: `league:md2.competition`, `league:p.euro?.competition`, `league:md.competition||"UCL"`, tutti `type:"euro"`).
Gli altri punti che mostrano un trofeo (bacheca in `src/17` e `src/16`) passavano già da `compLbl`.

Riprodotto dal guardiano sul codice di partenza: fine carriera con **3 sigle vere** a schermo
(«🏆 UEL FC Rotterdam · S.3 🏆 UECL FC Altoadige · S.4 🏆 UCL FC Merseyside · S.5»), 0 nelle altre nove schede.

## Censimento
1. **Statico** (`grep` sui frammenti `src/*`): ogni interpolazione di `competition`, `euroPlayed`, `euroComp`, `*.league`
   in testi, notifiche, diario, rassegna, interviste, calendario, albo, storico. Esito: tutte passano già da `euroSig`/`compLbl`/
   `EURO_SIGLA` o da mappe ai nomi di fantasia («Korward Champions/Europa/Conference Cup»), tranne `src/17:1110`.
   Le altre occorrenze di `UCL/UEL/UECL` nei sorgenti sono chiavi (confronti, campi salvati) o commenti.
2. **A schermo** (guardiano `sigle-357`, sotto): con un salvataggio che ha trofei UCL/UEL/UECL, storico con
   `euroPlayed/euroComp/euroEnd` e la UEL in corso, il testo renderizzato di dashboard · calendario · classifica · coppe ·
   profilo · nazionale · club · agente · ufficio (tutte le fisarmoniche aperte) e della fine carriera.
   Unico punto con sigle vere: «Momenti indimenticabili».

Non coperto (dichiarato): un vecchio salvataggio con testi del diario SCRITTI da versioni anteriori al 6.74 con la sigla
dentro la frase non viene ripulito (il diario si mostra come è stato scritto). Non ne abbiamo trovato traccia nelle fixture.

## Correzione
- `src/17` `CareerEndScreen`: `headline` usa `compLbl(t.league)` — il filtro display unico già esistente accanto a `EURO_SIGLA`.
- `src/02` `compLbl`: braccio rosso `window.__CPM_NO_G357` (lascia passare la chiave).
- Chiavi salvate invariate (nessun bump SAVE, nessuna migrazione).

## Guardiano `npm run sigle-357` (verde + rosso)
`tests/visual/sigle-357.mjs`, telefono 412×915, fixture `save-c177-s5w20` + trofei/storico europei iniettati con `__CPM_CAREER.patch`.
- A: nessuna sigla vera (`UCL|UEL|UECL` come parola intera) né nome vero («Champions League», «Europa League», «Conference League»)
  nel `document.body.innerText` di nove schede e della fine carriera (aperta con `retired:true`, superati i due atti della cerimonia).
- B (copertura, «non giudicato» = rosso): sigle di fantasia a schermo in ≥ 2 schede; fine carriera disegnata con ≥ 3 sigle di fantasia.
- Rosso `CPM_ROSSO357=1` → `__CPM_NO_G357`: deve vedere sigle vere in fine carriera e nelle schede.

Misure: verde 14 ok / 0 ko (fine carriera: 0 sigle vere, 6 di fantasia) · rosso 4 ok / 0 ko (fine carriera 6 sigle vere, schede 5).
MAPPA: righe esistenti `src/1[17]-` e `src/0[0-8]-` (compLbl vive in src/02). `npm run mappa-unica` verde.

## Rituali
- `node tools/audit-copyright.mjs`: ✅ 0 hit.
- `node tools/build-src.mjs` + `check-src.mjs`: HTML ricomposto dai frammenti.
- `node ci-runner.mjs giro sigle-357 career-critical save-compat` (+ 17 sentinelle): **18/18 verdi** su 7.999.209, nessun instabile
  (sigle-357 53 s · save-compat · mappa-unica · test:logic · replay · migrazione-194 · design-system · tema-unico · griglia-mobile ·
  render-3d-023 · tunnel-285 · home-298 · web-237 · career-critical 307 s · battito-264 · partita-vera 671 s · gk-dive-sync · schermate-97).
