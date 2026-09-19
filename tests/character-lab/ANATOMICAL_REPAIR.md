# Hyper Casual anatomical repair

The previous y > 142 vertex selection cut through the head (the original face starts at y=118.56). Repeated scaling corrupted the lower face and assigned it to clothing.

The authoring script now restores pristine positions from hyper-casual-korward-animated.glb. Welding UV seams identifies six disconnected head surfaces (1005 vertices total). Face, eyes, brows and hair receive one uniform 0.52 scale about the base of the head. The body is untouched. No runtime head transform is used.

Skin triangles are identified from the original UV atlas before garment assignment. This keeps the neck, hands and exposed legs on their original texture. Garment boundaries are calibrated against close front/back views. Pattern groups and their child meshes are selected together to prevent overlapping shirts.

Validation: repair-preview.cjs produces front/back/side, jogging and kicking close-ups, checks finite skin matrices at four times in all 31 animation clips, and asserts exactly one solid shirt material is visible. The complete match smoke test also passes. These are desktop Chromium checks, not physical mobile performance measurements.

Remaining limits: the source silhouette is still stylized; club stripe boundaries use the existing triangle topology. This repair does not claim bespoke clothing geometry or mobile 60 FPS validation.
