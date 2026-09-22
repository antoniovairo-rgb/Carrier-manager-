# Gate di selezione del modello — 22 settembre 2026

## Requisiti vincolanti

Il candidato deve raffigurare un calciatore maschile adulto credibile; avere kit neutro modificabile; muovere tutto il corpo con braccia coordinate; mantenere la palla sincronizzata; offrire una strada realistica per differenziare volto e capelli; e rispettare il budget mobile. Non vengono considerati finali modelli cartoon, likeness di atleti reali, kit con brand/stemmi riconoscibili, CH38 o Quaternius.

## Evidenza comparata

| Candidato | Volto / capelli | Kit | Rig / dribbling | Runtime mobile | Stato |
| --- | --- | --- | --- | --- | --- |
| **CGTrader Hisenberg acquistato** | Volto adulto; un taglio nativo e quattro colori texture; nessuna libreria di tagli | Calcio, componenti e UV verificati | Dribbling locale con braccia e palla superato | LOD0 34.995 triangoli; LOD1 12.243; LOD2 4.193. Il gate telefono completo resta aperto | **Base runtime attiva** |
| **Human Generator trial** | Base adulta, rig facciale; un taglio reale a particelle nella trial. La trial non prova una libreria utilizzabile | Nessun kit da calcio | 21/21 ossa centrali nel dribbling strutturale; non ancora root/palla/export finale | Raw 73.488 triangoli, circa 126 MB RGBA: non idoneo diretto | **Generatore candidato, non adottato** |
| **MetaPerson** | Volto e capelli più flessibili | Outfit civile | Rig mappabile, ma il dribbling locale collassa visivamente | 68.758 triangoli nel sample | Rifiutato per la POC |
| **Hisenberg a 11.816 poligoni** | Nessuna variante dichiarata | Kit a righe | Nessun file/clip da audit | Nessun vantaggio provato sul LOD1 già disponibile | Non acquistare |
| **Modello UE con facial rig a $40** | Preview semplificata | Brand/stemma riconoscibili | Nessuna clip auditabile | Conta e LOD non dichiarati | Rifiutato |

## Decisione corrente

**Il pacchetto CGTrader acquistato è l’unico modello pronto da continuare a integrare oggi.** Ha già un rig testato, kit, LOD derivati e una prova di dribbling con braccia coordinate. Non è la soluzione definitiva alla varietà estetica.

**Human Generator è l’unico candidato alternativo che ha dimostrato rig, volto e una strada verso capelli/barba**, ma diventa interessante soltanto se la prova isolata produce: haircards credibili, GLB con LOD e texture ridotte, kit neutro, palla sincronizzata e prestazioni mobili. La trial resta non pubblicata e non viene usata come asset di gioco.

## Gate successivo

Installare esclusivamente in ambiente Blender isolato la trial Human Generator; generare il solo maschio disponibile; convertire il taglio in haircards; produrre Hero e LOD; quindi sottoporli agli stessi controlli CGTrader su rig, palla, transizioni e dispositivo mobile.

## Aggiornamento 22 settembre 2026 — conversione Hair Generator trial non disponibile senza pipeline dedicata

- **Fatti verificati:** il file `Short Side Part.blend` trial contiene due sistemi particellari `HAIR`: 1.000 guide per `hair_short_fade` e 100 per `hair_parted_side`, con ciocche figlie. Non e' una mesh GLB pronta.
- **Prova isolata:** su una copia temporanea, Blender 4.5.14 ha convertito l'oggetto mantenendo invariati i `25.286` vertici e `25.324` poligoni del solo corpo e rimuovendo entrambi i modifier particellari. La conversione standard non produce una geometria capelli esportabile.
- **Decisione:** non aggiungere questo taglio al runtime e non simulare una libreria. Per una capigliatura Human Generator utilizzabile servono l'add-on/pipeline ufficiale che genera haircard o una nuova authoring controllata, poi gate di qualità, peso, rig e mobile.
