# FitStake — athlete refinement

The humans in project 82's interactive 3D exhibit are sculpted procedural athletes. `fitstake-runners.js` replaces the original five-sided limbs, faceted heads and block shoes, while retaining the five-step product walkthrough.

- Smooth elliptical spline sections shape the jersey, neck, jaw, arms, thighs and calves.
- Distinct faces have eyelids, brows, ears, a shaped nose and a restrained mouth. Continuous hair shells cover the crown; a ponytail and swept short hair distinguish the runners.
- Clothing includes bound collars, sleeve hems, panel seams and woven bump texture. Trainers have layered soles, heel support, laces and side detailing; hands have four curled fingers and an opposing thumb.
- Every rigid body part is batched by material without flattening the animated joints. The shared scene disposer releases its geometry, materials and textures.
- Track contact is computed from the outsole profile in rig-local space. The competition step runs; other steps use restrained weight shifts. Head and ponytail motion follows the same elapsed clock, so pause, replay and reduced motion use the existing exhibit lifecycle.
- The live 3D asset is the scope of this pass. The separate raster artwork is unchanged.

Validation: all six checks in `node --test scripts/tests/fitstake.test.mjs` pass, including actual trainer-vertex contact through 32 stride phases and outward surface normals. `npm run build` passes. Offline CPU geometry proofs in `outputs/fitstake-review/` were inspected at front, three-quarter and face-closeup views; these omit production materials, environment lighting and shadows. That inspection caught and corrected scalp intersections and the upper shorts seam. Live browser review is pending because local browser access is disabled in Work settings.

Idle-pose correction: shoulders now angle gently away from the torso, elbows relax almost straight and palms face inward. Bent elbows and stronger arm swings are restricted to the competition step, avoiding the previous hands-up pose during onboarding.
