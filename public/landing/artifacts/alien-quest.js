import { sculpture } from './sculpture.js';

// A deterministic timeline: the gallery owns time, pause, visibility and reset.
export function createCrystalQuest(THREE) {
  const quest = new THREE.Group();
  quest.name = 'alien-crystal-quest';
  const character = sculpture(THREE);
  const body = character.ball(.32, 0, .46, 0, 'lavender');
  body.scale.set(1, 1.4, .84);
  for (const x of [-.14, .14]) {
    const eye = character.ball(.042, x, .62, .266, 'ink');
    eye.scale.y = 1.5;
    character.ball(.08, x, .10, .06, 'lavender');
  }
  for (const side of [-1, 1]) {
    const arm = character.ball(.085, side * .32, .33, .02, 'lavender');
    arm.scale.y = 1.7;
    arm.rotation.z = side * .3;
  }
  character.line([[0,.82,0],[-.06,1.02,0],[-.05,1.14,0]], .022, 'lavender');
  character.ball(.075, -.05, 1.16, 0);
  const alien = character.finish(72);
  alien.name = 'collecting-alien';
  quest.add(alien);

  const red = new THREE.MeshStandardMaterial({color:0xd9282d, roughness:.38, metalness:.12});
  const blue = new THREE.MeshStandardMaterial({color:0x235ad2, roughness:.38, metalness:.12});
  const baseMaterial = new THREE.MeshStandardMaterial({color:0xe7dbc2, roughness:.8});
  const crystalGeometry = new THREE.OctahedronGeometry(.17);
  const baseGeometry = new THREE.CylinderGeometry(.23,.26,.06,32);
  // Collection order: observatory, home gate, starting island.
  const locations = [[-1.42,1.08,-.70],[.82,1.18,-.72],[.70,1.08,1.85]];
  const crystals = locations.map(([x,y,z], index) => {
    const crystal = new THREE.Mesh(crystalGeometry, index === 2 ? red : blue);
    crystal.name = `quest-crystal-${index}`;
    crystal.position.set(x,y,z);
    crystal.castShadow = true;
    quest.add(crystal);
    const base = new THREE.Mesh(baseGeometry,baseMaterial);
    base.position.set(x,.73,z);
    base.receiveShadow = true;
    quest.add(base);
    return crystal;
  });

  const routes = [
    [[.40,.74,1.85],[0,.93,1.65],[.15,.94,.60],[-.9,.94,-.05],[-1.75,.74,-.68]],
    [[-1.75,.74,-.68],[-.9,.94,-.05],[0,.94,.55],[.9,.94,.12],[1.03,.85,-.63]],
    [[1.03,.85,-.63],[.9,.94,.12],[0,.94,.55],[.15,.94,.60],[0,.93,1.65],[.40,.74,1.85]],
  ].map(points => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, 'centripetal'));

  const sparkMaterial = new THREE.MeshBasicMaterial({color:0xffcf72, transparent:true, depthWrite:false});
  const sparkGeometry = new THREE.OctahedronGeometry(.045);
  const sparks = Array.from({length:8}, () => {
    const spark = new THREE.Mesh(sparkGeometry,sparkMaterial);
    spark.visible = false;
    quest.add(spark);
    return spark;
  });
  const ringMaterial = new THREE.MeshBasicMaterial({color:0xffcf72, transparent:true, depthWrite:false});
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.20,.015,6,40),ringMaterial);
  ring.rotation.x = -Math.PI/2;
  ring.visible = false;
  quest.add(ring);

  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const walkTime = 5;
  const legTime = 6.5;
  const cycleTime = legTime * routes.length;
  quest.userData.animate = (elapsed) => {
    const time = Math.max(0,elapsed) % cycleTime;
    const leg = Math.floor(time / legTime);
    const local = time - leg * legTime;
    const progress = Math.min(local / walkTime,1);
    // Ease into each stop without pausing halfway across a bridge.
    const travel = progress * progress * (3 - 2 * progress);
    routes[leg].getPointAt(travel, point);
    routes[leg].getTangentAt(travel, tangent);
    const pickupAge = local - walkTime;
    const walking = local < walkTime;
    const hop = walking ? Math.abs(Math.sin(local * 9)) * .055 * Math.sin(Math.PI * progress)
      : pickupAge < .75 ? Math.sin(pickupAge / .75 * Math.PI) * .20 : 0;
    alien.position.copy(point);
    alien.position.y += hop;
    const heading = Math.atan2(tangent.x,tangent.z);
    const target = locations[leg];
    const faceCrystal = Math.atan2(target[0] - point.x,target[2] - point.z);
    const turn = Math.atan2(Math.sin(faceCrystal-heading),Math.cos(faceCrystal-heading));
    alien.rotation.y = heading + turn * Math.min(Math.max(pickupAge,0) / .25,1);
    // Start facing the visitor, including when reduced motion is enabled.
    if (time < .5) alien.rotation.y *= THREE.MathUtils.smoothstep(time,0,.5);
    alien.rotation.z = walking ? Math.sin(local * 9) * .045 * Math.sin(Math.PI * progress) : 0;
    const stretch = walking ? hop * .45 : hop * .4;
    alien.scale.set(1 - stretch*.5,1 + stretch,1 - stretch*.5);

    crystals.forEach((crystal,index) => {
      const age = time - (index * legTime + walkTime);
      const pickup = Math.max(0,Math.min(age / .35,1));
      crystal.visible = age < .35;
      crystal.scale.setScalar(age < 0 ? 1 : Math.max(.001,1 - pickup));
      crystal.rotation.y = elapsed * 1.5 + index;
      crystal.position.y = locations[index][1] + (age < 0 ? Math.sin(elapsed*2+index)*.045 : pickup*.35);
    });

    const bursting = pickupAge >= 0 && pickupAge < .85;
    const burst = Math.max(0,Math.min(pickupAge / .85,1));
    sparkMaterial.opacity = (1-burst) * .95;
    sparks.forEach((spark,index) => {
      spark.visible = bursting;
      const angle = index / sparks.length * Math.PI * 2;
      spark.position.set(target[0] + Math.cos(angle) * burst*.52,
        target[1] + Math.sin(burst*Math.PI)*.35 + (index%2)*burst*.12,
        target[2] + Math.sin(angle)*burst*.52);
      spark.scale.setScalar(1 - burst*.7);
    });
    ring.visible = bursting;
    ring.position.set(target[0],.79,target[2]);
    ring.scale.setScalar(1 + burst*2.3);
    ringMaterial.opacity = (1-burst)*.65;
    quest.userData.collected = leg + (walking ? 0 : 1);
  };
  quest.userData.animate(0);
  return quest;
}
