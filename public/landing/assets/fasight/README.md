# Fasight portrait reliefs

`portraits.js` contains cropped upper-body geometry derived from the Microsoft Rocketbox mentor and learner meshes already shipped in `../lrnmate-people/`. Copyright 2020 Microsoft, MIT licence: [LICENSE-Rocketbox.txt](../lrnmate-people/LICENSE-Rocketbox.txt). Original source revision and paths are recorded in that directory's README.

Rebuild with `node scripts/assets/build-fasight-cameos.mjs`. The script bakes the authored bind pose, crops the upper body, and normalizes the geometry. The exhibit turns and compresses these actual character surfaces into carved portrait reliefs. The portraits are decorative representations, not actual user identities.
