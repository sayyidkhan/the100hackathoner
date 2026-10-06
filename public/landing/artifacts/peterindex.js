import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
  const { root, box, disk, line, person, finish } = sculpture(THREE);
  // Contact archive: open box, hinged lid, and staggered tabbed conversation cards.
  const archive = new THREE.Group(); root.add(archive); archive.position.set(-1.5, .08, -1.25); archive.rotation.y = -.12;
  box(2.65, .15, 1.35, 0, .075, 0, 'red', archive);
  box(2.65, 1.05, .12, 0, .59, .64, 'red', archive);
  box(.12, 1.05, 1.35, -1.27, .59, 0, 'red', archive);
  box(.12, 1.05, 1.35, 1.27, .59, 0, 'red', archive);
  box(2.65, 1.05, .12, 0, .59, -.64, 'red', archive);
  const lid = box(2.65, 1.55, .12, 0, 1.65, -.85, 'red', archive); lid.rotation.x = -.22;
  box(.38, .16, .08, 0, 1.08, .73, 'wood', archive);
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 3; col++) {
      const card = new THREE.Group(); archive.add(card); card.position.set((col - 1) * .75, .4 + row * .055, .4 - row * .18); card.rotation.x = -.13;
      box(.71, 1.0, .045, 0, .5, 0, row % 2 ? 'ivory' : 'paper', card);
      box(.25, .1, .045, (row % 3 - 1) * .18, 1.04, 0, 'ivory', card);
      person(0, .26, .045, .48, 'shade', card);
    }
  }
  // Each island represents a person; the highlighted chain ends at an opportunity.
  const nodes = [[-2.1, .9], [-.1, -.3], [-.45, 1.7], [1.65, .95]];
  for (const [x,z] of nodes) { disk(.64, .15, x, .12, z, 'paper'); disk(.58, .07, x, .23, z); person(x, .27, z, 1.02); }
  for (const [a,b] of [[0,1],[0,2],[1,2],[1,3],[2,3]]) {
    const [x,z] = nodes[a], [u,v] = nodes[b]; line([[x,.11,z],[(x+u)/2,.10,(z+v)/2],[u,.11,v]], .045, 'blue');
  }
  line([[-2.1,.27,.9],[-1.45,.23,1.35],[-.45,.28,1.7],[.6,.28,1.3],[1.65,.28,.95],[2.25,.34,.3],[2.5,.63,-.9]], .10, 'red');
  disk(.83,.16,2.5,.12,-.9,'paper');
  for(let i=0;i<3;i++) box(1.15-i*.1,.12, .45,2.5,.26+i*.12,-.35-i*.25);
  box(.2,1.65,.22,1.94,1.17,-1.1); box(.2,1.65,.22,3.06,1.17,-1.1); box(1.32,.23,.22,2.5,2.0,-1.1);
  const door=box(.91,1.5,.08,2.94,1.17,-1.36,'red'); door.rotation.y=-.85;
  return finish(78);
}
