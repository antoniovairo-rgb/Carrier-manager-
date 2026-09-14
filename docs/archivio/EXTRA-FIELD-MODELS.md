# Modelli 3D dedicati alle scene EXTRA CAMPO (task #108)

> Direttiva PO: «il CH38 extra campo ha troppi limiti su acconciature, vestiti, ecc.» →
> collaudo su Michelle (Mixamo, stilizzata): «**ma sembra un robot, devono essere UMANI
> vestiti in maniera civile in base alla scena!**» → pivot sui **Microsoft Rocketbox**
> (avatar FOTOREALISTICI riggati, repo `github.com/microsoft/Microsoft-Rocketbox`,
> **licenza MIT** dal 12/2020, 115 adulti in abiti civili/professionali).

## Stato

- ✅ **`assets/actor-journalist.glb` = Female_Adult_15** (7.142.0): giornalista TV realistica —
  camicetta blu, gonna nera, stivali, collana, capelli veri. Variante *lean* 4.2MB
  (texture embedded, niente normal map). ATTIVA nell'intervista, verificata con screenshot
  GLB-ON (win+loss) + `actor-diag` (7 ossa matchate) + `interview-3d-test`.
- ✅ **`assets/actor-presenter.glb` = Male_Adult_03** (giacca di tweed, elegante, 3.9MB):
  **ATTIVO nel gala** (7.143.0, `mkActorG`) — il palco torna ad avere una persona (rimossa al
  7.85.0 perché il CH38 era «disegnato malissimo»); SOLO l'actor, senza file la cerimonia resta
  senza persone. Busta del reveal di nuovo visibile, PARENTATA alla mano sinistra (lezione mic
  7.128.0). Verificato con `gala-glb-shot` (busta + reveal) + `gala-test`.
- ✅ **`assets/actor-presenter-f.glb` = Female_Adult_11** (abito da cerimonia scuro, chignon, 4.1MB —
  scelta dai preview raw del repo, 7.144.0): collaudo PO «la cerimonia sia con DONNA che UOMO che si
  alternano all'apertura delle buste» — i due presentatori stanno AI LATI del podio e si ALTERNANO
  per atto (pari donna · dispari uomo), la busta PASSA DI MANO (re-parent), la regia inquadra il
  lato di chi presenta.
- ✅ Filiera COMPLETA in-session (il PO non può scaricare nulla): vedi sotto.
- Fallback CH38 automatico se il file manca/non carica; compat mixamo (Michelle-style) intatta.

## Filiera (tutta eseguibile in sessione cloud)

```bash
# 1. sparse-clone del repo (git smart-http NON è bloccato, l'HTML di github.com sì)
git clone --filter=blob:none --sparse https://github.com/microsoft/Microsoft-Rocketbox rb
cd rb && git sparse-checkout set "Assets/Avatars/Adults/Female_Adult_15"
# 2. FBX → GLB (npx NON funziona: eseguire il binario direttamente, chmod +x)
npm install fbx2gltf
node_modules/fbx2gltf/bin/Linux/FBX2glTF --binary --input .../Export/Female_Adult_15.fbx --output raw
# 3. embed texture TGA (FBX2glTF le salta → placeholder 1×1) + lean
python3 tools/rocketbox-texfix.py raw.glb ".../Export/Textures" assets/actor-journalist.glb
```

`tools/rocketbox-texfix.py`: riscrive il chunk JSON del GLB embeddando le TGA come PNG
data-URI (color 1024px · opacity/capelli 512px + `alphaMode BLEND` + `doubleSided`),
azzera metallic, toglie le normal map (variante lean; `NORMALS=1` per tenerle).

## Lezioni tecniche (integrate in `mkActor`, InterviewStage3D)

1. **Scala dalle OSSA, non dal bbox**: sui SkinnedMesh `Box3.setFromObject` misura la
   geometria in bind-space (≈0 → modello di 6cm). Altezza vera = min/max Y world delle ossa.
2. **Ricentrare dal baricentro delle ossa** (mesh spesso offset dal root).
3. **MAI clip di un rig sull'altro** (bind pose diverse → arti deformati, fianchi fluttuanti).
   Posa MANUALE dal T-pose.
4. **Senza mixer gli offset `+=` per-frame ACCUMULANO** (testa riversa) → base-pose salvata
   (ora QUATERNION) + delta assoluto ogni frame.
5. **Matcher ossa TOLLERANTE**: FBX2glTF esporta `mixamorig:Head` (due punti) MA i Rocketbox
   usano il Biped 3ds Max (`Bip01 R UpperArm`, `Bip01 L Forearm`) → normalizzare `[:_. ]`
   + lowercase e matchare `rightforearm$|rforearm$` PRIMA di `rightarm$|rupperarm$`.
6. **POSA WORLD-SPACE rig-agnostica** (la lezione chiave del 7.142.0): gli Euler per-rig
   (`bone.rotation.set(...)` tarati sul mixamo) NON valgono sul Biped (assi locali diversi).
   Rotazione attorno agli ASSI DEL PERSONAGGIO (frontale/laterale derivati da `rotY`):
   ```js
   axisRot(bone,axisWorld,ang){ const pw=parentWorldQuat;
     bone.quaternion = pw⁻¹ · R(axisWorld,ang) · pw · bone.quaternion; }
   axisRot(lArm,fwd,-1.22); axisRot(lFore,left,-0.32);   // sx giù, mano avanti (via dalla gonna)
   axisRot(rArm,fwd,0.55);  axisRot(rFore,left,-1.25);   // dx alzato, gomito piegato (mic)
   ```
   Parametri convergiuti sul viewer `rb-tune` (3 iterazioni con screenshot).
7. **Accessori bone-attached su rig diversi**: il tesserino stampa va in un GRUPPO
   riallineato al FACING (`wrap.quaternion = qBoneWorld⁻¹ · qFacing`) → resta sul petto su
   ogni rig; auricolare SKIPPATO sull'actor (capelli veri sopra l'orecchio).
8. Il MIC parentato all'osso mano è già world-space (quaternioni) → rig-agnostico, zero cambi.
9. **Dita (collaudo PO «devono essere 5, mani/braccia al loro posto»)**: il Biped ha le 5 dita
   riggate (`Bip01 R Finger0..4` + falangi) ma in T-pose = mano aperta RIGIDA → curl naturale
   sull'asse LOCALE **z positivo** (empirico, uguale per entrambe le mani; pollice ×0.3):
   destra 0.42 = pugno morbido attorno al mic, sinistra 0.30 = mano rilassata. I rig mixamo
   chiamano le dita `HandIndex…` → non matchano, compat intatta.

## Naming / hook

| File | Modello | Scena | Stato |
|---|---|---|---|
| `assets/actor-journalist.glb` | Rocketbox Female_Adult_15 | InterviewStage3D | ✅ attivo (7.142.0) |
| `assets/actor-presenter.glb`  | Rocketbox Male_Adult_03 (giacca) | GalaStage3D (uomo, atti dispari) | ✅ attivo (7.143.0) |
| `assets/actor-presenter-f.glb` | Rocketbox Female_Adult_11 (abito da cerimonia) | GalaStage3D (donna, atti pari) | ✅ attivo (7.144.0) |

## Probe

- `tests/visual/actor-diag.mjs` — forza l'intervista e legge `__CPM_ACTOR` (ossa/scala/pos).
- `tests/visual/michelle-preview.mjs` — viewer standalone di un actor GLB (`ACTOR_GLB=` per
  altri file), full/face/back.
- `tests/visual/rb-sheet.mjs` — contact-sheet dei candidati (`out/rb-*.glb`).
- `tests/visual/interview-3d-glb-shot.mjs` — screenshot della scena reale (win/loss).

## Vincoli rispettati

1. **Peso store**: modelli caricati SOLO nelle scene extra campo, varianti lean ~4MB.
2. **Licenza**: MIT (Rocketbox README, aggiornata 12/2020) — audit-copyright 0 hit
   (nomi file neutri `actor-*`).
3. **Offline/store build**: asset in `assets/`, copiati da build-dist, cachati dal SW.
4. **Zero regressioni**: fallback CH38 automatico; gate 14/14 (la scena è gate-cieca,
   verificata con screenshot + probe dedicate).

## Alternative valutate (e perché no)

- **Michelle/Mixamo**: stilizzata → «sembra un robot» (collaudo PO). Il codice resta compat.
- **Ready Player Me**: API/rete bloccata dal cloud.
- **Quaternius/Kenney/PolyPizza (CC0)**: siti bloccati; low-poly.
- **three.js sample models**: robot/militare — inadatti.
