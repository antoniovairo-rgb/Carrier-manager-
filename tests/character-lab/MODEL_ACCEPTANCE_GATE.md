# Gate di accettazione modello — Korward

Data: 21 settembre 2026  
Oggetto: base personaggio per Hero e calciatori in campo.

| Requisito | Evidenza primaria | Esito |
|---|---|---|
| Adulto credibile in una partita | Render locali `cgtrader-character-review.png` e `cgtrader-hero-profile-clean-preview.png`; proporzioni, volto e kit sono quelli del file acquistato, senza capelli procedurali di prova. | **PASS condizionato**: migliorare luce e crop della card Hero, non la mesh del volto. |
| Formato modificabile | Source `BLENDER+RIG.blend`, FBX e GLB presenti nel pacchetto acquistato; scheda del venditore conferma FBX/GLB/OBJ/BLEND. | **PASS** |
| Rig riutilizzabile | Ispezione diretta del GLB runtime: 68 joint deformanti, 7 mesh skinned, nessuna animazione incorporata. | **PASS** per retarget/import; le clip devono ancora passare il gate corpo-palla. |
| Maglie e kit modificabili | Sei materiali e texture PNG locali; la struttura separa la superficie del kit dagli altri componenti. | **PASS** tecnico; la nuova livrea deve restare un asset model-side. |
| Varianti aspetti sicure | Quattro materiali colore del taglio nativo con render locale approvato; ogni prova hair esterna/procedurale fallita e non integrata. | **PASS parziale**: colori sì, nuove forme capelli/barba no. |
| Qualità Hero | GLB runtime: 34.995 triangoli, 6 texture/materiali. | **PASS** per un solo Hero in quadro. |
| 22 giocatori mobile | Smoke con 23 avatar: 680 draw call, 23 skeleton update, 2 FPS sul banco software anche con LOD review. | **FAIL aperto**: prima della pubblicazione servono LOD verificato, scheduling update e benchmark su telefono. |
| Package ufficiale `?hyperCharacter=full` | Ispezione di `CARRIER-MANAGER-AV.html`: l'array `_hyperAssetUrls` punta ai quattro `hyper-casual-korward-football-authored*.glb`, non al GLB CGTrader. | **FAIL P0**: la scelta modello non e` ancora visibile nel collaudo ufficiale. |
| Licenza adatta al prodotto | Asset Hisenberg acquistato con licenza royalty-free; candidati TurboSquid analizzati hanno vincoli editoriali e sono esclusi. | **PASS** per la base acquistata. |

## Decisione

Il modello **Hisenberg acquistato** è la base approvata per Korward. Non e` stato trovato un sostituto che migliori insieme realismo adulto, rig esportabile, licenza d'uso e costo mobile. Questa decisione non dichiara il sistema personaggi concluso: chiude solo la scelta della base estetico-tecnica. L'accettazione finale nel gioco richiede ancora il gate mobile e le prove dinamiche di animazione e palla.

Il prossimo lavoro non e` acquistare un'altra base: e` portare questa base nel package che il link ufficiale realmente carica, retargettando o sostituendo le clip senza modificare il match engine.

## Esclusioni confermate

- CH38 e Quaternius non vengono usati.
- I pack Studio Ochi e 3djoenish hanno stile troppo low-poly per il gioco.
- I pack TurboSquid Imperium verificati sono editorial-only e fuori budget.
- Nessun modello con likeness di calciatori reali entra nel prodotto.

## Inventario dei componenti inclusi

Tutti i componenti disponibili nel pacchetto locale sono stati inventariati: `CHARACTER`, `HEAD`, `HANDS`, `LEGS`, `TEE`, `SHORTS`, `NORMAL+RIG`, `UNREAL+RIG`, le texture e `Earring`. `HEAD`, `HANDS`, `TEE` e `SHORTS` sono parti statiche del medesimo personaggio, utili per authoring ma non nuove varianti di anatomia o capelli. `Earring.fbx` contiene invece una sola mesh da **50.000 triangoli** e quattro mappe 4K; e` incompatibile con il budget mobile e non e` una libreria di capelli. Il pacchetto non nasconde quindi tagli lunghi, barbe o altre teste modulari riutilizzabili.

## Capacita` volto ed espressioni — 21 settembre 2026

L'ispezione diretta di `BLENDER+RIG.blend` trova 68 ossa deformanti, **zero shape key** su tutte le sette mesh skinned e nessuna osso facciale oltre a `head.x`/`neck.x`. Il modello supporta quindi una resa Hero statica adulta e movimenti testa-corpo, ma non espressioni facciali articolate senza un successivo authoring model-side. Non verranno simulate espressioni con deformazioni casuali del volto.

## Aggiornamento verificato — 21 settembre 2026, 20:10

La decisione resta il modello acquistato **Soccer Player di Hisenberg/CGTrader**. La catena corrente e` distinta in modo esplicito:

- **Sorgente LOD0:** 34.995 triangoli, 7 mesh skinned, rig Blender con 68 ossa deformanti e materiali/texture separati per volto, mani e kit.
- **Package animato review:** 75 joint, 31 clip, inclusi idle, jog, dribble, pass, kick, header, volley, receive e slide-tackle. Il dribbling review ha superato il test di marker palla sul clock della clip: sinistro 0,270, destro 0,360, sinistro 0,790.
- **LOD animati compatibili:** LOD1 12.244 triangoli/7,07 MB e LOD2 4.190 triangoli/4,12 MB. Il validatore conferma per tutti e tre i livelli 75 joint nello stesso ordine, 7 primitive skinned e 31 clip identiche per nome/durata.

Questi sono **PASS tecnici locali**. Non sono ancora una promozione nel gioco: occorrono selettore LOD runtime, ripresa sul dispositivo mobile, frame time/FPS e conferma di licenza per distribuire i file acquistati o derivati nel repository pubblico. Il percorso ufficiale `?hyperCharacter=full` resta volutamente Hyper fino alla chiusura dei quality gate.

## Separabilita` delle caratteristiche del volto — 22 settembre 2026

L'ispezione del builder delle varianti e della sorgente Blender conferma che la
mesh della testa `part_00000001.005` usa un solo materiale texture con una sola
immagine `HEAD`: capelli, pelle, occhi e sopracciglia sono nello stesso atlante.
Le quattro varianti approvate sostituiscono l'intera texture con versioni
ritoccate dall'autore, lasciando invariata la mesh. Non esiste una mesh occhi o
un materiale pelle separato da usare per tint o colori arbitrari.

Per questo non vengono promosse varianti automatiche di pelle o occhi: una
correzione per soglia/colore rischierebbe di modificare anche capelli,
sopracciglia o dettagli del volto. Le sole varianti corrette del package restano
il taglio nativo in nero, castano, biondo e ramato.
### Barba e baffi: gate di authoring

La texture `HEAD` CGTrader è un atlante 2048×2048 con più isole UV ruotate; pelle, capelli e sopracciglia condividono il file. Non sono consentiti overlay o tint automatici per barba/baffi: senza un layout specifico e una review renderizzata causerebbero disallineamenti sul volto. Una variante può essere considerata solo se deriva da una `HEAD` texture completa, dipinta e verificata su tutti i lati del modello, senza geometria flottante.
