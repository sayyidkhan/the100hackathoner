import { createWorkshop } from './pal-workshop.js';
import { buildCourtyard } from './pal-courtyard.js';
import { buildCompanions } from './pal-companions.js';
import { animateCouncil } from './pal-council.js';
import { addKingdomLanterns } from './pal-lanterns.js';
import { applyPalOcclusion } from './pal-surface.js';

// A hand-crafted council miniature, with rigid detail batched around its joints.
export function createArtifact(THREE, options = {}) {
  const workshop = createWorkshop(THREE);
  const { root, batch } = workshop;
  const { flags, emblem } = buildCourtyard(workshop);
  const cast = buildCompanions(workshop, emblem);
  batch(root);
  root.userData = {
    conceptual: true, artifactId: 71, displayBase: false, groundLevel: -.06,
    studioProfile: 'pal', initialYaw: -.04, initialElevation: .49,
  };
  // Fit the courtyard silhouette at its lower, portrait-like viewing angle.
  root.userData.framingPoints = [
    ...[-2.95,2.95].flatMap(x=>[-2.65,2.55].map(z=>new THREE.Vector3(x,0,z))),
    ...[-2.6,2.6].flatMap(x=>[new THREE.Vector3(x,3.07,-1.8),new THREE.Vector3(x,3.07,-1.2)]),
    new THREE.Vector3(0,2.62,-1.47),
  ];
  animateCouncil(THREE,root,cast,flags);
  addKingdomLanterns(THREE,root);
  batch(root.getObjectByName('kingdom-lanterns'));
  if (!options.bake) applyPalOcclusion(root);
  return root;
}
