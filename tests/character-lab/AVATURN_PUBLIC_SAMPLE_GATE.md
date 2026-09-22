# Gate Avaturn — campione pubblico, audit locale

## Perimetro

Questo audit usa un campione pubblico Avaturn prelevato dal repository `met4citizen/TalkingHead` esclusivamente per compatibilita tecnica. Il repository lo dichiara **non commerciale**: il file non viene aggiunto al prodotto, a Git o alla pubblicazione.

## Dati misurati

| Proprietà | Risultato |
| --- | --- |
| Dimensione GLB | 13.823.336 byte |
| Triangoli | 31.181 |
| Mesh skinned | 11 |
| Materiali | 11 |
| Texture | 27 |
| Scheletro | 55 bone deformanti, nomenclatura umanoide standard |
| Capelli | 2 mesh distinte con materiali separati |
| Azioni incorporate | Nessuna |

Il peso non e ancora adatto a una squadra mobile senza LOD; e comparabile all'Hero CGTrader e quindi richiederebbe una catena LOD dedicata.

## Prova dribbling locale

Il rig del campione e stato mappato alla clip Korward `dribble` per una prova solo locale, senza palla runtime, movimento della radice o export.

- 52/52 mapping di ossa trovato; nessun osso mancante.
- Trasformazioni finite per bacino, tronco, testa, braccia, mani, cosce, polpacci e piedi su tutti i frame 0–41.
- Movimento mano sinistra `0,6011 m`, mano destra `0,4288 m`.
- Movimento piede sinistro `0,8895 m`, piede destro `0,8610 m`.
- Massima distanza mano-spalla `0,6534 m` per lato, compatibile con la misura anatomica del campione.

Questi dati provano che il rig non collassa nel primo trasferimento locale delle rotazioni e che braccia e gambe partecipano. Non sostituiscono una review visiva dei fotogrammi, la sincronizzazione palla, le transizioni o un benchmark mobile.

## Confronto con le alternative

MetaPerson aveva volto e capelli migliori, ma falliva lo stesso provino locale con busto e gambe non leggibili. Avaturn supera il gate strutturale iniziale e dichiara ufficialmente GLB, rig umanoide e uso con Mixamo. Rispetto al CGTrader non ha ancora un kit da calcio validato e risulta piu pesante.

## Decisione

**Candidato promettente, non adottato.** La prova commerciale richiede un export ufficiale Avaturn con licenza d'uso per il gioco, una divisa calcistica conforme e LOD verificati. Il dominio `avaturn.me` e al momento bloccato da Zscaler, quindi non e possibile creare/esportare l'avatar ufficiale da questa rete. Il CGTrader resta il modello attivo finche questi requisiti non vengono provati.

## Verifica commerciale successiva

La pagina prezzi ufficiale indica il piano **Pro a $800/mese** per l'upload di capi personalizzati; la documentazione colloca inoltre API e Web SDK nel pacchetto a pagamento. L'integrazione base e dichiarata gratuita, ma non consente di assumere che la nostra maglia da calcio possa essere caricata senza tale piano.

**Decisione aggiornata:** non proseguire verso Avaturn come base del gioco. Resta un riferimento tecnico positivo per rig e personalizzazione, ma il costo ricorrente per il kit personalizzato e il blocco Zscaler lo rendono non proporzionato alla POC.
