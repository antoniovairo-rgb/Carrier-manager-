# POC — Hyper Casual Cartoon Soccer Player

Branch: `poc/marioprada-character-system`

Asset tested: `hyper_casual_cartoon_character_soccer_player.glb`

## Purpose

Validate the purchased Hyper Casual Cartoon Soccer Player as a lightweight character source for Korward Elite, without touching the Match Engine, career logic, statistics, commentary or gameplay rules.

The asset is intentionally **not committed to the public repository**. The POC harness loads the user's local GLB through a file picker/drag-and-drop, avoiding redistribution of the purchased asset.

## P0 — Actual GLB inspection

The uploaded GLB was parsed directly before integration work.

- GLB 2.0.
- File size: ~2.03 MB.
- Meshes: 1.
- Vertices: 3,514.
- Triangles: 5,072.
- Materials: 1.
- Texture: 2048×2048 PNG.
- Skinning: present.
- JOINTS_0 / WEIGHTS_0: present; 4 influences per vertex.
- Skeleton: 60 bones.
- Embedded animation clips: **0**.
- Core rig includes root, spine, neck, head, shoulders, arms, forearms, hands, thighs, legs, feet and toes.
- The skeleton does **not** use the existing `mixamorig*` bone names.

### Core target bones found

`root.x_00`, `spine_01.x_013`, `spine_02.x_014`, `spine_03.x_015`, `neck.x_016`, `head.x_017`.

Left side: `shoulder.l_039`, `arm_stretch.l_040`, `forearm_stretch.l_041`, `hand.l_042`, `thigh_stretch.l_01`, `leg_stretch.l_02`, `foot.l_03`, `toes_01.l_04`.

Right side: `shoulder.r_018`, `arm_stretch.r_019`, `forearm_stretch.r_020`, `hand.r_021`, `thigh_stretch.r_07`, `leg_stretch.r_08`, `foot.r_09`, `toes_01.r_010`.

## P1 — Standalone integration harness

Added:

`tests/hyper-casual-character-poc.html`

The harness uses the project's target rendering stack:

- Three.js r128.
- `GLTFLoader`.
- `SkeletonUtils.clone()`.

It supports:

1. loading the local purchased GLB;
2. displaying the source character;
3. spawning exactly **1 Hero + 21 players**;
4. cloning the skinned character with `SkeletonUtils`;
5. measuring renderer draw calls and triangles;
6. counting active skinned meshes;
7. checking the core-bone set;
8. optional per-player material cloning for a performance comparison;
9. optional core-bone markers on the Hero;
10. reset/re-spawn without changing the production match code.

## P2 — Initial performance expectation

The source geometry is approximately 5,072 triangles. If geometry is shared through clones, 22 players represent approximately 111,584 geometry triangles before other scene costs.

This is only a geometry estimate. FPS must be measured because the project has already demonstrated that skeleton updates, CPU work, draw calls and other renderer costs can dominate triangle count.

## P3 — Animation blocker

The asset contains no embedded animation clips. This is compatible with the seller's intended Mixamo workflow, but the POC must still prove that Mixamo clips can be retargeted to this skeleton.

The target skeleton is not named `mixamorig*`, so existing animation clips cannot be assumed to work unchanged. A dedicated adapter/mapping layer is required before production integration.

The first semantic mapping to validate is:

- `mixamorigHips` → `root.x_00`
- `mixamorigSpine` → `spine_01.x_013`
- `mixamorigSpine1` → `spine_02.x_014`
- `mixamorigSpine2` → `spine_03.x_015`
- `mixamorigNeck` → `neck.x_016`
- `mixamorigHead` → `head.x_017`
- `mixamorigLeftShoulder` → `shoulder.l_039`
- `mixamorigLeftArm` → `arm_stretch.l_040`
- `mixamorigLeftForeArm` → `forearm_stretch.l_041`
- `mixamorigLeftHand` → `hand.l_042`
- `mixamorigLeftUpLeg` → `thigh_stretch.l_01`
- `mixamorigLeftLeg` → `leg_stretch.l_02`
- `mixamorigLeftFoot` → `foot.l_03`
- `mixamorigLeftToeBase` → `toes_01.l_04`
- corresponding right-side Mixamo bones → `.r_` targets above.

Twist bones and finger bones should not be driven blindly until a real animation clip is tested.

## P4 — Decision gate

Current status:

- **Asset load:** PASS by direct GLB inspection.
- **Skinning:** PASS.
- **22-player cloning architecture:** READY for browser POC.
- **Geometry budget:** PROMISING.
- **Embedded animations:** FAIL / not present, but expected to be supplied separately.
- **Mixamo retargeting:** BLOCKED pending an actual animation clip test.
- **Production replacement of CH38:** NOT APPROVED yet.

The next technical test is therefore **not** a match-engine change. It is a controlled animation-retarget test using one idle/jog and one kick clip, followed by the 22-player performance measurement.
