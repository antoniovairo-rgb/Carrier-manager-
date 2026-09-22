# Shortlist modello 3D Korward — 22 settembre 2026

## Verdetto attuale

| Priorità | Candidato | Stato | Perché |
| --- | --- | --- | --- |
| 1 | **CGTrader Hisenberg acquistato** | **Base runtime attiva** | Unico asset con kit neutro modificabile, rig conosciuto, dribbling locale con palla e braccia coordinate, e LOD misurati. |
| 2 | **Human Generator trial** | **Test tecnico da completare** | Volto adulto, rig facciale e potenziale capelli/barba. Non ha kit calcistico pronto; il modello grezzo non è mobile e l’estrazione haircard richiede la pipeline ufficiale. |
| 3 | **MetaPerson** | Riferimento futuro per volti | Buon volto e dettagli facciali, ma sample senza kit e dribbling locale visivamente fallito sul retarget corrente. |

## Perché il CGTrader resta la base

- Dribbling locale: palla in contatto e braccia in movimento coordinato al gesto.
- Kit da calcio e componenti UV già disponibili.
- Budget misurato: Hero 34.995 triangoli; LOD1 12.243; LOD2 4.193.
- Limiti aperti: un solo taglio nativo, quattro colori di texture, assenza di barbe modulari; transizioni e prestazioni sul telefono ancora da superare.

## Unico esperimento con reale potenziale

Human Generator è l’unica pista che può aggiungere un volto adulto, capelli e barba senza passare a un modello cartoon o a una libreria esterna già bocciata. La trial effettiva sblocca però un solo maschio, un taglio a particelle e un outfit civile. Il body grezzo pesa 73.488 triangoli e conserva texture fino a 4K: è un sorgente, non un asset da runtime.

La prova necessaria è l’installazione isolata dell’add-on trial: generare il solo campione disponibile, ottenere haircard reali, esportare LOD, applicare il kit e rifare i gate su clip/palla/scala/mobile. Senza questo passaggio non esiste una variante capelli onesta da promuovere.

## Candidati esclusi

| Candidato | Ragione verificata |
| --- | --- |
| African Football Soccer Player Male gratuito | 1.003.976 poligoni, 875 MB FBX e 732 MB texture: fuori budget mobile. |
| ActorCore | Nessun kit calcistico; geometria non modificabile; documentazione riporta braccia incrociate con export Blender e motion. |
| Football Team Player Pack Fab | 11 modelli ma texture 4K, 372.700 triangoli solo per la scena showcase, nessun LOD o rig comune dimostrato, generazione AI dichiarata. |
| Male Football Player Rigged CGTrader | Rig solo nella scena 3ds Max; FBX/OBJ non riggati; 4K e $79. |
| MetaPerson | 68.758 triangoli nel campione migliore, outfit civile e retarget dribbling non leggibile. |
| MHR / Character Factory | LOD3 promettente, ma generatore completo non eseguibile su Intel UHD 620/1 GB locale. |
| Librerie CC0 / MakeHuman / Vincent | Fit sulla testa non professionale, volto coperto o calotta; i tentativi ottimizzati non hanno superato la review estetica. |

## Criterio per chiudere la selezione

Un candidato può sostituire il CGTrader soltanto dopo aver provato sul posto: volto adulto credibile, kit neutro, capelli/barba non ridicoli, braccia coordinate in tutte le clip, palla sincronizzata, transizioni pulite, scala corretta e prestazioni mobili. Al momento nessun sostituto soddisfa questi criteri; il CGTrader resta quindi la scelta operativa corretta.

## Aggiornamento 22 settembre 2026 — licenza e prezzo Human Generator verificati

- **Fatti verificati:** la trial e' personale/portfolio e usa texture 4K con watermark: puo' servire solo al provino tecnico, non al runtime Korward. La licenza commerciale ufficiale costa `$128` una tantum per utente, include tutto il contenuto e dichiara esplicitamente l'uso in software e videogiochi, a condizione che gli utenti finali non possano estrarre e riutilizzare gli asset.
- **Compatibilita':** la pagina ufficiale Superhive dichiara Blender `3.6–5.2`; il Blender locale 4.5.14 rientra quindi nella versione dichiarata.
- **Decisione:** nessun acquisto ora. Se il provino isolato supera i gate tecnici e visivi, Human Generator diventa una proposta di acquisto concreta: costa meno di Character Creator 5 (`$299`) e sarebbe legalmente utilizzabile nel gioco con la licenza commerciale. La trial continua a essere solo una prova.

## Chiarimento licenza Human Generator per GitHub Pages

- **Fatto verificato:** la FAQ ufficiale chiarisce che software, videogiochi e siti con asset Human Generator sono consentiti con licenza commerciale. Indica come caso non consentito il rendere l'estrazione una funzione esplicita per gli utenti, ad esempio un pulsante di download.
- **Applicazione alla POC:** una build pubblicata su GitHub Pages non e' esclusa dalla FAQ per il solo fatto di essere un sito; l'app non deve offrire esportazione o download del modello, delle texture o delle sorgenti Human Generator. La licenza completa va conservata insieme all'acquisto.
- **Decisione:** il vincolo licenza non blocca il provino tecnico o una futura adozione commerciale. Restano da superare i gate qualitativi: kit, LOD, rig/clip, palla, transizioni e mobile.

## Capacita' Human Generator da verificare nel provino isolato

- **Fatti da documentazione ufficiale:** Human Generator offre generazione automatica di haircard, bake texture, esportazione tramite processing, LOD corpo `0/1/2`, decimazione separata dei vestiti, slider faccia/pelle/capelli/barba e rinomina di oggetti, materiali e ossa.
- **Limite dell'evidenza:** la documentazione non fornisce un conteggio garantito dei triangoli o memoria texture per il nostro umano finale. LOD1 abbassa volto e LOD2 l'intero corpo; questi valori devono essere misurati dopo l'installazione isolata e l'export reale.
- **Gate del provino:** generare il solo adulto trial, creare haircard, produrre LOD0/1/2 con bake ridotto, applicare il kit in copia, esportare GLB e rieseguire scala, rig, dribbling/palla, transizioni e benchmark mobile.
