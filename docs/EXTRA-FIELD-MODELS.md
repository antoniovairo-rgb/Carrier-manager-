# Modelli 3D dedicati alle scene EXTRA CAMPO (task #108)

> Direttiva PO: «il CH38 extra campo ha troppi limiti su acconciature, vestiti, ecc.»
> Obiettivo: nelle scene ravvicinate (intervista, gala, cerimonie) usare personaggi con
> **capelli e abiti REALI modellati**, non il calciatore CH38 tinto.

## Stato

- ✅ **Filiera verificata in sessione** (7.141.0): download FBX → conversione `FBX2glTF` (npm) →
  GLB con rig `mixamorig` completo + clip inclusa. Provata su un personaggio Mixamo reale.
- ✅ **ASSET ACQUISITO IN SESSIONE** (il PO è da mobile e non può scaricare): `assets/actor-journalist.glb`
  = **Michelle** (personaggio Mixamo vestito, dagli esempi ufficiali three.js, 3.3MB) — capelli VERI
  modellati (afro puffs), abiti veri (top+joggers), texture PNG, rig mixamorig 65 ossa.
- ✅ **INTEGRATA nell'intervista** (7.141.0) con le lezioni tecniche sotto; fallback CH38 se il file manca.
- ⏳ **Presentatore gala** (`actor-presenter.glb`): serve un modello maschile ELEGANTE — dalla rete di
  sessione è reperibile solo Soldier (militare, inadatto) → ricerca da continuare (npm/altri repo noti).
- 🔎 Se il look street di Michelle non convince il PO come giornalista, si cercano alternative con lo
  stesso pipeline (il codice non cambia: basta sostituire il file).

## Lezioni tecniche (per i prossimi actor)

1. **Scala dalle OSSA, non dal bbox**: sui SkinnedMesh `Box3.setFromObject` misura la geometria in
   bind-space (per Michelle ≈0 → modello di 6cm). L'altezza vera = min/max Y delle world-position delle ossa.
2. **Ricentrare dal baricentro delle ossa**: alcuni export hanno il mesh offset dal root (sbordava a sinistra).
3. **MAI clip CH38 sull'actor**: bind pose diverse → arti deformati e fianchi fluttuanti (position-track
   non trasferibili). Posa MANUALE dal T-pose (braccia giù, pattern Gala 7.68.0) + respiro/annuiti post-mixer.
4. **Offset ASSOLUTI su base-pose nel tick**: senza mixer che azzera le ossa ogni frame, un `+=`
   per-frame accumula (testa riversa all'indietro all'infinito). `pose0` memorizzata → `rotation = base + delta`.
5. I nomi-ossa arrivano come `mixamorig:Head` (due punti) da FBX2glTF: normalizzare nel match.

## Cosa scaricare (Mixamo, stesso ecosistema/licenza del CH38 già in gioco)

Su https://www.mixamo.com (login Adobe gratuito) → tab **Characters**:

| Ruolo | Personaggi consigliati | Note |
|---|---|---|
| **Giornalista (donna)** | Sophie · Kate · Michelle | abbigliamento civile, capigliatura vera modellata |
| **Presentatore gala (uomo elegante)** | un personaggio in giacca/abito dal catalogo (es. Pete, Malcolm, The Boss) | scegli quello che sul preview rende meglio in smoking/elegante |

Procedura per OGNI personaggio:
1. Seleziona il personaggio → tab **Animations** → cerca **"Standing Idle"** e applicala
   (così il file arriva con l'idle già dentro: niente retargeting).
2. **Download** → Format: **FBX Binary (.fbx)** · Skin: **With Skin** · 30 fps · Keyframe Reduction: none.
3. Carica il file `.fbx` nel repo sotto `assets/raw/` (o passamelo in chat come per l'audio).

## Cosa faccio io quando arriva il file

```bash
npm install fbx2gltf            # (verificato raggiungibile dal cloud)
node_modules/fbx2gltf/bin/Linux/FBX2glTF --binary --input <file>.fbx --output actor-journalist
# → assets/actor-journalist.glb  (target peso: ≤3-4MB come il CH38)
```
Poi: screenshot GLB-ON della scena reale, collaudo resa (scala/luci/mic in mano), gate 14/14, push.

## Naming atteso dal gioco

| File | Scena | Stato hook |
|---|---|---|
| `assets/actor-journalist.glb` | InterviewStage3D (giornalista) | ✅ attivo dal 7.141.0 |
| `assets/actor-presenter.glb`  | GalaStage3D (presentatore)    | ⏳ hook da attivare quando il modello è scelto |

## Vincoli rispettati

1. **Peso store**: 1-2 modelli caricati solo nelle scene extra campo (non 22 in partita).
2. **Licenza**: Mixamo = stessa famiglia del CH38 già pubblicato; audit-copyright resta 0 hit
   (nomi file neutri, nessun brand).
3. **Offline/store build**: asset in `assets/`, copiati da build-dist, cachati dal SW.
4. **Zero regressioni**: fallback CH38 automatico se il file manca o non carica.

## Alternative valutate (e perché no)

- **Ready Player Me**: avatar ottimi ma rig non-mixamorig (retargeting clip) + API/rete bloccata.
- **Quaternius/Kenney/PolyPizza (CC0)**: siti bloccati dal cloud; stile low-poly stride col CH38.
- **three.js sample models** (Xbot/Soldier, scaricabili): robot/militare — non adatti alle scene.
