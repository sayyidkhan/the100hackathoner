# LrnMate character assets

These are authored, skinned character meshes from Microsoft Rocketbox, redistributed under the included MIT licence (Copyright 2020 Microsoft).

Source repository: https://github.com/microsoft/Microsoft-Rocketbox
Source revision: 0943055db6ec570bcef9f2c8b41c9e5467c808f9

- `learner.bin`: `Assets/Avatars/Adults/Female_Adult_01/Export/Female_Adult_01_facial.fbx`
- `mentor.bin`: `Assets/Avatars/Professions/Business_Male_01/Export/Business_Male_01_facial.fbx`

Converted using the official Three.js r186 FBXLoader into Three.js ObjectLoader JSON, gzip-compressed. Files use `.bin` to prevent the development proxy treating the gzip payload as transport compression. Each file retains the authored mesh, skin weights, bind matrices and bones. Original colour maps and unused facial morph targets were removed; meshes receive an ivory material. No runtime requests go to Microsoft or a model service.

The exhibit poses and animates the imported skeletons in `artifacts/lrnmate-people.js`. These are locally authored motions, not original Rocketbox animation clips. Retain LICENSE-Rocketbox.txt with redistributed copies. Run `node --test scripts/tests/lrnmate-rigged.test.mjs` after changes.
