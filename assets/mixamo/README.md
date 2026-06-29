# assets/mixamo/ — asset di produzione 1.0b (personaggi)

Qui vanno i file scaricati da **Mixamo** (mixamo.com, login Adobe gratuito).
Il Technical Director li converte/integra (GLB o FBX) e ne fa lo swap dei
personaggi del Live Match 3D. Licenza Mixamo: uso commerciale nei giochi
consentito (asset **incorporato** nel gioco, non redistribuito come asset a sé).

## Prima tornata (minima — fa correre l'eroe "vero")
- `character.fbx`  → personaggio **umano atletico in tenuta semplice** (t-shirt/sporty;
  es. **"Brian"**, **"Leonard"**, **"Liam"** — evita armature/abiti/tute pesanti) ·
  Download FBX Binary · Pose **T-pose**
  - Nota: per un umano texturizzato la **maglia** si tinta solo sul busto (mesh
    separate) → rifinitura colori-squadra DOPO il primo test; il primo look tiene
    la texture originale.
- `idle.fbx`       → animazione **"Idle"** · FBX Binary · **Without Skin** · **In Place**
- `run.fbx`        → animazione **"Running"** (o "Fast Run") · FBX Binary · **Without Skin** · **In Place**

## Seconda tornata (gesti calcistici)
- `pass.fbx`       → "Soccer Pass" / "Standing Pass"
- `kick.fbx`       → "Soccer Kick" / "Standing Soccer Kick"
- `header.fbx`     → "Soccer Header" / "Header"
- `tackle.fbx`     → "Slide Tackle" / "Soccer Tackle"
- `celebrate.fbx`  → "Celebration" / "Soccer Celebration"

Tutte le animazioni: **Without Skin** + **In Place** (la posizione è guidata
dal motore; l'animazione deve restare sul posto, niente drift).
