# POC — Marioprada Character System

Branch: `poc/marioprada-character-system`

## Objective

Evaluate and, if compatible, integrate the Marioprada **Stylized Soccer Player** as the visual character system for Korward Elite without changing the Match Engine, career logic, match statistics, commentary, or gameplay rules.

The target architecture is:

- **Hero:** highest visual priority, full-quality character and action animation.
- **21 field/GK players:** same shared source character system, cloned/reused geometry/skeleton/materials wherever possible.
- **Simulation:** remains the source of truth; the character layer only visualizes positions/actions already decided by the simulation.
- **Highlights:** Hero and relevant opponents/teammates can receive higher visual/animation fidelity during 3D highlights.

## Current baseline found in the project

The current game already has a mature GLB pipeline:

- Three.js r128 + GLTFLoader.
- Shared GLB loading/cache.
- SkeletonUtils-style cloning.
- `footballer.glb` and `footballer-lite.glb`.
- A combined `footballer-uno.glb` variant was introduced to reduce mesh/draw-call overhead.
- Existing animation GLBs include idle, jog, kick, penalty, header, tackle, volley, receive and goalkeeper actions.
- Current full body is about 48k triangles; the previous seven-mesh body generated too many draw calls.
- A paired mobile measurement showed that reducing triangles alone did not improve phone FPS; CPU/draw calls/skeletons were the dominant constraint.

## Non-negotiable constraints

1. Do not modify the Match Engine or possession simulation in this POC.
2. Do not modify career/save schema.
3. Do not introduce VAR, replay, own-goal, or training-management mechanics.
4. Do not replace the current character pipeline blindly.
5. Do not create 22 independent heavy GLB assets.
6. Do not make 21 secondary players visually identical.
7. Do not let the 3D layer invent football outcomes that were not decided by the simulation.
8. Keep a rollback path to the current CH38 implementation.
9. Any performance conclusion must be measured on the target mobile path, not inferred from triangle count alone.

## POC phases

### P0 — Asset compatibility gate

Before changing the game code, inspect the actual Marioprada asset and record:

- file format and size;
- triangle/vertex counts;
- mesh count and material count;
- skeleton type and bone names;
- skinning/weights;
- rest pose and scale;
- animation clips and clip names;
- texture sizes/formats;
- whether the asset can accept the existing animation set;
- whether geometry/materials can be shared across 22 clones.

**PASS condition:** the model can be driven reliably by the existing Three.js animation architecture, or a small adapter can bridge it without changing gameplay code.

### P1 — Hero-only integration

Introduce a feature-gated character provider:

`CH38 provider -> Marioprada provider`

The provider must expose the same conceptual contract currently consumed by the match view:

- create character;
- clone character;
- apply kit;
- apply appearance;
- attach number/name where supported;
- play locomotion;
- play action gesture;
- locate hand/head/foot bones when required;
- dispose safely.

First test only the Hero. The existing CH38 path remains the default rollback path until P1 passes visual and animation checks.

### P2 — Shared 22-player system

Use one source asset and cloned instances. Optimize for:

- shared geometry;
- shared materials;
- shared skeleton structure;
- reused AnimationClips;
- low draw-call count;
- frustum culling;
- distance-based fidelity;
- no unnecessary per-player WebGL resources.

Appearance variation must remain deterministic and cheap: height/body proportion where supported, skin, hair, kit pattern, number and role.

### P3 — Hero highlight fidelity

The Hero receives the highest fidelity only when relevant to the highlight camera. Secondary players remain credible but cheaper.

The highlight system must continue to follow:

`MATCH EVENT -> importance/hero involvement -> HERO HIGHLIGHT -> 3D representation`

Never:

`3D animation -> invented football event`.

### P4 — Performance gate

Measure at least:

- FPS over 5 seconds;
- renderer draw calls;
- triangles;
- active animated characters;
- animation mixers/actions;
- asset download size;
- memory pressure where measurable;
- highlight start latency;
- frame stability during 22-player scenes.

Compare against the current CH38 baseline using the same match/scene and same device/test conditions.

**Decision rule:** no migration solely because the new model has fewer triangles. The new system must be equal or better on the metrics that matter to the target device, while delivering the desired visual quality.

## Existing integration risks

### 1. Animation skeleton mismatch

The current pipeline expects Mixamo-style bones and already contains logic around those bones. The Marioprada asset must be inspected rather than assumed compatible.

### 2. Existing action clips

The project has many separate animation GLBs. Reusing them is preferable to importing a second large animation library, but only if the skeleton is compatible.

### 3. Material customization

The current system dynamically applies kit/skin/hair/material changes. The Marioprada material layout must be mapped to this abstraction rather than introducing one-off logic for every player.

### 4. Performance

The project already established empirically that triangle reduction alone is insufficient. The POC therefore treats draw calls, animated skeletons and CPU cost as first-class metrics.

### 5. Regression surface

The current CH38 implementation has accumulated many production fixes around visibility, animation gestures, goalkeeper reactions, substitutions, ceremony and bench characters. The new provider must not disturb those call sites. The safest first implementation is an adapter/provider boundary, not a wholesale rewrite.

## Acceptance criteria

### Visual

- Hero has the intended stylized football aesthetic.
- Character proportions are stable at gameplay and highlight camera distances.
- Kits remain team-specific and deterministic.
- Skin/hair/appearance variations are visible without breaking materials.
- No floating feet, ground penetration, exploding skeletons or incorrect orientation.

### Animation

- idle/jog transition is stable;
- action animation starts from the correct body state;
- kick/header/tackle/receive can be tested where the asset supports them;
- no double-driving by procedural pose + GLB clip;
- ball/hand/head attachment points remain correct where required.

### Multi-player

- 22 characters render simultaneously;
- Hero remains distinguishable without becoming a different football kit;
- secondary players have deterministic visual variation;
- no unnecessary asset duplication;
- no visible synchronization of every player's idle animation.

### Regression

- current match event flow unchanged;
- current 2D simulation unchanged;
- current statistics/votes unchanged;
- current commentary unchanged;
- current career/save behavior unchanged;
- CH38 rollback remains possible.

## Current conclusion

The repository is already architecturally prepared for a character-provider approach. The existing implementation has a GLB cache, cloned characters, shared animation assets and an explicit performance history showing why draw calls matter more than triangle count alone.

The next blocking input is the **actual Marioprada asset**. Until the GLB/FBX is available, compatibility of its skeleton, materials and animations cannot honestly be marked PASS.

No production character migration should be considered complete before the POC passes P0–P4.
