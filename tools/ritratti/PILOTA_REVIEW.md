# Esito pilota ritratti — 2026-09-23

Lotto `pilota-budget5` sul ramo `poc/marioprada-character-system`: due richieste API riuscite con `gpt-image-1-mini`, qualità medium, 1024×1024. Ottenuti 8 ritagli WebP 512×512 (6 giocatori, 2 staff). I PNG originali sono fuori dal repository in `C:\Users\a.vairo\ritratti-grezzi\pilota-budget5`. Nessun commit o push.

Verifica automatica: maglia neutra 8/8; fondale bianco 4/8. Lo sfondo del secondo foglio è grigio molto chiaro: media del canale minimo nelle aree di campionamento ~226–229, contro la soglia di 235. Perciò i volti ai-0005–0008 non superano il requisito di bianco pieno. Il controllo percettivo segnala ai-0001, ai-0003 e ai-0006 come possibili doppioni. Il confronto visivo con gli altri ritratti del pilota e con `cast-rivals-c.jpg` e `cast-heroes-a.jpg` non mostra duplicati evidenti: sono falsi positivi probabili, ma la valutazione finale resta umana. ai-0003 non mostra chiaramente i capelli lunghi raccolti richiesti.

Esito: pilota generato e verificato, non ancora approvato per produzione in serie. I quattro fondali fuori soglia e la resa dei capelli lunghi richiedono decisione prima del lotto successivo. Nessuna rigenerazione a pagamento eseguita.

Uso API riportato: 929 token di input testuale e 2112 token di output immagine in totale. Costo fatturato effettivo non verificato; la stima preliminare dell'output era circa 0,022 USD, oltre all'input. Il budget dell'utente è 5 EUR.
Nota di stato: la frase «Nessun commit o push» descrive la situazione alla redazione iniziale del rapporto; il successivo commit autorizzato è registrato in CONSENSI.md. Il push resta separato.

