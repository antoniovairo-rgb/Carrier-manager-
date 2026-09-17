# G1 · Censimento del reso — LA FOTO DI PRIMA

Misurato con `CPM_LARG=412 CPM_FOTO=0 node tests/visual/griglia-mobile.mjs` sul build a
`03b7299` (nessuna riga di `src/` toccata). **Chromium headless 412×915, NON l'Android del PO.**

Non è un guardiano e non ha una soglia: è il **tabellone** su cui si misurerà, schermata per
schermata, se la direzione grafica è diventata un sistema o è rimasta una collezione. Il conto
degli esadecimali nel sorgente (`tavolozza.mjs`, 522 tinte) è **cieco**: un colore scritto dieci
volte e mai reso vale zero, e uno calcolato a runtime non compare. Questo conta ciò che si vede.

| schermata | tinte di testo | fondi | corpi | raggi |
|---|---:|---:|---:|---:|
| Home fuori carriera | 1 | 1 | 2 | 5 |
| Impostazioni | 3 | 2 | 4 | 5 |
| Creazione | 9 | 6 | 6 | 5 |
| Offerte | 6 | 4 | 4 | 3 |
| **Dashboard** | **13** | **6** | **14** | **8** |
| **Stagione · Classifica** | **15** | **9** | **7** | **6** |
| Stagione · Calendario | 9 | 8 | 8 | 6 |
| Stagione · Coppe | 5 | 2 | 6 | 4 |
| **Club** | **11** | **10** | **10** | **7** |
| Carriera · Profilo | 16 | 7 | 10 | 11 |
| Carriera · Nazionale | 9 | 5 | 7 | 5 |
| Agente | 9 | 4 | 12 | 8 |
| Prepartita | 6 | 3 | 4 | 5 |

## Il provino, per confronto

`node tests/visual/provino-schermate.mjs`:

| schermata | tinte di testo | fondi | corpi | raggi |
|---|---:|---:|---:|---:|
| Home | 5 | 7 | 6 | 3 |
| Stagione · Classifica | 5 | 11 | 6 | 3 |
| Club | 5 | 4 | 6 | 3 |

**Corpi identici su tutte e tre**: 11 · 12,5 · 14 · 16 · 19 · 26.
**Raggi identici su tutte e tre**: 3 · 6 · 50 %.
La coerenza fra schermate chiesta dal PO lì è un **fatto misurato**, non una dichiarazione.

Le tre teste a testa:

| | oggi | provino |
|---|---:|---:|
| Dashboard / Home — tinte · corpi · raggi | 13 · 14 · 8 | 5 · 6 · 3 |
| Stagione · Classifica — tinte · corpi · raggi | 15 · 7 · 6 | 5 · 6 · 3 |
| Club — tinte · corpi · raggi | 11 · 10 · 7 | 5 · 6 · 3 |

**DA DICHIARARE, perché altrimenti il numero mente:** gli **11 fondi** della classifica del provino
non sono deriva — sono i **colori veri dei dodici club** dietro la sigla sullo scudo. L'identità dei
club non è una tinta di sistema e non va unificata. Le colonne che misurano il sistema sono
**tinte di testo, corpi e raggi**.

## Il difetto che il censimento ha trovato addosso a me

`font:800 14px/1 inherit` **non è CSS valido**: nella scorciatoia `font` l'ultimo valore è la
famiglia, e `inherit` lì dentro non vale — il browser buttava via tutta la dichiarazione e i due
bottoni della Home finivano al corpo di fabbrica, **13,3 px**. Il censimento ha visto sette gradini
invece di sei, e il settimo era un valore che non avevo scelto io. Nessun occhio l'aveva notato in
due letture dello screenshot.
