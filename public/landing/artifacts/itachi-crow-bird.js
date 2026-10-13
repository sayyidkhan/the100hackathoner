// An articulated paper sculpture: broad folded sheets, a purposeful silhouette,
// and charcoal surfaces whose creases are revealed by the exhibit lighting.
export function createCrowBird(THREE) {
  const root = new THREE.Group();
  root.name = 'folded-paper-crow';
  const flight = new THREE.Group();
  flight.name = 'crow-flight';
  root.add(flight);
  const torso = new THREE.Group();
  torso.name = 'crow-sculpted-torso';
  torso.rotation.x = -.12;
  flight.add(torso);
  const wingPresentation = new THREE.Group();
  wingPresentation.name = 'crow-broad-wing-presentation';
  // Wings share the body's coordinate system. Independent presentation yaw
  // previously made the shoulders cross the torso when viewed from behind.
  torso.add(wingPresentation);
  const surface = new THREE.MeshStandardMaterial({
    color: 0xffffff, vertexColors: true, roughness: .66, metalness: .035,
    flatShading: true, side: THREE.FrontSide,
  });
  // A deterministic, low-contrast grain gives large lit planes a tactile paper
  // finish. The texture perturbs light only; it does not paint noise on the bird.
  const grainSize = 128, grainData = new Uint8Array(grainSize * grainSize * 4);
  let seed = 801971, previous = 0;
  for (let y = 0; y < grainSize; y++) for (let x = 0; x < grainSize; x++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = seed / 4294967296 * 2 - 1;
    const fiber = Math.sin(x * .21 + Math.sin(y * .12) * 2.6) * 4 + Math.sin(y * .39 + x * .075) * 3;
    const value = 128 + Math.round(noise * 12 + previous * 4 + fiber);
    const index = (y * grainSize + x) * 4;
    grainData[index] = grainData[index + 1] = grainData[index + 2] = value;
    grainData[index + 3] = 255; previous = noise;
  }
  const paperGrain = new THREE.DataTexture(grainData,grainSize,grainSize,THREE.RGBAFormat);
  paperGrain.name = 'charcoal-paper-grain';
  paperGrain.wrapS = paperGrain.wrapT = THREE.RepeatWrapping;
  paperGrain.repeat.set(4,4); paperGrain.generateMipmaps = true;
  paperGrain.minFilter = THREE.LinearMipmapLinearFilter;
  paperGrain.magFilter = THREE.LinearFilter;
  paperGrain.needsUpdate = true;
  surface.bumpMap = paperGrain; surface.bumpScale = .0026;
  // Cool graphite planes retain a black crow's silhouette against the night
  // exhibit. Light mode keeps the original, deeper charcoal paper palette.
  const pairedColor = (dark, light) => {
    const color = new THREE.Color(dark); color.lightColor = new THREE.Color(light); return color;
  };
  const paperColors = [
    [0x313238, 0x333135], [0x3c3d44, 0x403c40], [0x4c4d55, 0x514a4d],
    [0x25262d, 0x26262b], [0x55565e, 0x595154],
  ].map(([dark, light]) => pairedColor(dark, light));
  const cutColor = pairedColor(0x77747a, 0x777074);
  const creaseColor = pairedColor(0x5e5d67, 0x605b61);
  const batches = new Map();
  const colorVariants = [];
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const smooth = value => { const t = THREE.MathUtils.clamp(value, 0, 1); return t * t * (3 - 2 * t); };
  const pulse = (t, start, rise, hold, fall) => smooth((t - start) / rise) * (1 - smooth((t - start - rise - hold) / fall));
  function triangle(parent, a, b, c, color) {
    let batch = batches.get(parent);
    if (!batch) { batch = { positions: [], colors: [], lightColors: [] }; batches.set(parent, batch); }
    for (const [index, point] of [a, b, c].entries()) {
      const tint = Array.isArray(color) ? color[index] : color;
      batch.positions.push(point.x, point.y, point.z);
      batch.colors.push(tint.r, tint.g, tint.b);
      const light = tint.lightColor || tint;
      batch.lightColors.push(light.r, light.g, light.b);
    }
  }
  function strip(parent, a, b, normal, width, color = creaseColor) {
    const cross = new THREE.Vector3().subVectors(b, a).cross(normal).normalize().multiplyScalar(width / 2);
    const lift = normal.clone().multiplyScalar(.0007);
    const p = a.clone().add(lift), q = b.clone().add(lift);
    const a0 = p.clone().add(cross), a1 = p.clone().sub(cross);
    const b0 = q.clone().add(cross), b1 = q.clone().sub(cross);
    // Two faces keep the narrow paper edges readable around the sculpture.
    triangle(parent, a0, a1, b1, color); triangle(parent, a0, b1, b0, color);
    triangle(parent, a0, b1, a1, color); triangle(parent, a0, b0, b1, color);
  }
  function tinted(base, amount) {
    const color = base.clone().multiplyScalar(amount);
    color.lightColor = base.lightColor.clone().multiplyScalar(amount);
    return color;
  }
  function orientedTriangle(parent, a, b, c, normal, color) {
    const facing = b.clone().sub(a).cross(c.clone().sub(a)).dot(normal);
    if (facing >= 0) triangle(parent, a, b, c, color);
    else triangle(parent, a, c, b, Array.isArray(color) ? [color[0], color[2], color[1]] : color);
  }

  // A fan is one corrugated paper sheet. Adjacent broad pleats share their
  // valley vertices, leaving no slots or spear-shaped individual feathers.
  function pleatedFan(parent, hub, tips, normal, depth = .12, undersideShade = 0) {
    const outline = [];
    tips.forEach((tip, i) => {
      outline.push(tip);
      if (i < tips.length - 1) {
        const valley = tip.clone().lerp(tips[i + 1], .51);
        valley.lerp(hub, .085 + (i % 3) * .015);
        outline.push(valley);
      }
    });
    const radii = [0, .36, .70, 1];
    const ribs = outline.map((tip, index) => radii.map((u, row) => {
      const point = hub.clone().lerp(tip, u);
      const raised = index % 2 === 0;
      const fold = (raised ? depth : -depth * .42) * Math.sin(u * Math.PI * .90);
      const crinkle = row === 2 ? Math.sin(index * 1.73) * .012 : 0;
      return point.addScaledVector(normal, fold + crinkle);
    }));
    const thickness = .009;
    for (let i = 0; i < ribs.length - 1; i++) {
      const faceColor = tinted(paperColors[i % 2 ? 0 : 2], .94 + (i % 4) * .025);
      for (let row = 0; row < radii.length - 1; row++) {
        const a = ribs[i][row], b = ribs[i + 1][row], c = ribs[i][row + 1], d = ribs[i + 1][row + 1];
        const aa = a.clone().addScaledVector(normal, -thickness), bb = b.clone().addScaledVector(normal, -thickness);
        const cc = c.clone().addScaledVector(normal, -thickness), dd = d.clone().addScaledVector(normal, -thickness);
        if (row > 0) {
          orientedTriangle(parent, a, b, c, normal, faceColor);
          orientedTriangle(parent, aa, cc, bb, normal.clone().negate(), paperColors[undersideShade]);
        }
        orientedTriangle(parent, b, d, c, normal, row === 1 ? tinted(faceColor, .97) : faceColor);
        orientedTriangle(parent, bb, cc, dd, normal.clone().negate(), paperColors[undersideShade]);
      }
      // Visible knife-cut outer edge follows the shallow feather scallops.
      const a = ribs[i][3], b = ribs[i + 1][3];
      const aa = a.clone().addScaledVector(normal, -thickness), bb = b.clone().addScaledVector(normal, -thickness);
      const edgeNormal = b.clone().sub(a).cross(normal).normalize();
      const middle = a.clone().lerp(b, .5).sub(hub);
      if (edgeNormal.dot(middle) < 0) edgeNormal.negate();
      orientedTriangle(parent, a, aa, b, edgeNormal, cutColor);
      orientedTriangle(parent, b, aa, bb, edgeNormal, cutColor);
    }
    const fanCenter = outline.reduce((point, p) => point.add(p), v(0,0,0)).multiplyScalar(1 / outline.length).lerp(hub, .4);
    for (const edge of [0, ribs.length - 1]) for (let row = 0; row < 3; row++) {
      const a = ribs[edge][row], b = ribs[edge][row + 1];
      const aa = a.clone().addScaledVector(normal, -thickness), bb = b.clone().addScaledVector(normal, -thickness);
      const outward = b.clone().sub(a).cross(normal).normalize();
      if (outward.dot(fanCenter.clone().sub(a.clone().lerp(b, .5))) > 0) outward.negate();
      orientedTriangle(parent, a, aa, b, outward, cutColor);
      orientedTriangle(parent, b, aa, bb, outward, cutColor);
    }
    // Hairline secondary folds break up the large faces without drawing a
    // regular wireframe over the bird. These run on the actual paper planes.
    for (let i = 0; i < ribs.length; i += 4) {
      strip(parent, ribs[i][0], ribs[i][2], normal, .0018, tinted(creaseColor, .82));
      strip(parent, ribs[i][2], ribs[i][3], normal, .0018, tinted(creaseColor, .82));
    }
  }
  // Each feather is a folded five-sided sheet, with a continuous raised spine,
  // different planes on either side and a closed, thin paper edge.
  function foldedFeather(parent, start, tip, width, fold, shade = 0, normal = v(0, 1, 0), radial = false) {
    const direction = tip.clone().sub(start).normalize();
    const across = direction.clone().cross(normal).normalize();
    const planeNormal = across.clone().cross(direction).normalize();
    const at = (t, side, lift = 0) => start.clone().lerp(tip, t).addScaledVector(across, side * width).addScaledVector(planeNormal, lift);
    const outline = radial
      ? [at(0,0), at(.70,.50), tip.clone(), at(.84,-.44)]
      : [at(0,0), at(.66,.50), tip.clone(), at(.79,-.44), at(.20,-.24)];
    const ridge = at(radial ? .60 : .55, 0, fold);
    const thickness = .011;
    const under = outline.map(point => point.clone().addScaledVector(planeNormal, -thickness));
    const underRidge = ridge.clone().addScaledVector(planeNormal, -thickness);
    // The upper facets face the paper normal; the underside faces away.
    for (let i = 0; i < outline.length; i++) {
      const j = (i + 1) % outline.length;
      const base = paperColors[i <= 1 ? 2 : i === 2 ? 1 : 0], variation = .96 + (shade % 3) * .04;
      const tint = base.clone().multiplyScalar(variation);
      tint.lightColor = base.lightColor.clone().multiplyScalar(variation);
      triangle(parent, outline[i], outline[j], ridge, tint);
      triangle(parent, under[i], underRidge, under[j], paperColors[0]);
      triangle(parent, outline[i], under[j], outline[j], cutColor);
      triangle(parent, outline[i], under[i], under[j], cutColor);
    }
    strip(parent, outline[0], ridge, planeNormal, .0038);
    strip(parent, ridge, tip, planeNormal, .0038);
  }
  // Elliptical polygon sections are individually authored, giving the breast,
  // neck and skull a deliberate continuous shape instead of stacked spheres.
  function facetedBody(parent, sections, sides = 8, shade = 0) {
    const sculpted = parent === torso;
    const rings = sections.map(([z, width, height, center], r) => Array.from({ length: sides }, (_, i) => {
      const angle = i / sides * Math.PI * 2 + Math.PI / 8 + (sculpted ? (r % 2 ? .085 : -.045) : 0);
      const fold = sculpted ? 1 + Math.sin(i * 2.13 + r * 1.71) * .038 : 1;
      return v(Math.cos(angle) * width * fold, center + Math.sin(angle) * height * fold, z);
    }));
    for (let r = 0; r < rings.length - 1; r++) for (let i = 0; i < sides; i++) {
      const next = (i + 1) % sides;
      const color = paperColors[i === 1 || i === 2 ? 2 : i === 0 || i === 3 ? 1 : 0];
      const first = sculpted ? tinted(color, .88 + ((r * 3 + i * 2) % 5) * .045) : color;
      const second = sculpted ? tinted(color, .91 + ((r * 2 + i * 3) % 5) * .04) : color;
      if (sculpted && (r + i) % 2) {
        triangle(parent, rings[r][i], rings[r][next], rings[r + 1][i], first);
        triangle(parent, rings[r][next], rings[r + 1][next], rings[r + 1][i], second);
      } else {
        triangle(parent, rings[r][i], rings[r][next], rings[r + 1][next], first);
        triangle(parent, rings[r][i], rings[r + 1][next], rings[r + 1][i], second);
      }
    }
    for (const index of [0, rings.length - 1]) {
      const middle = v(0, sections[index][3], sections[index][0]);
      for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        if (index === 0) triangle(parent, middle, rings[index][next], rings[index][i], paperColors[shade]);
        else triangle(parent, middle, rings[index][i], rings[index][next], paperColors[shade]);
      }
    }
  }
  facetedBody(torso, [
    [-1.02, .15, .14, -.04], [-.68, .355, .29, .01], [-.27, .51, .40, .065],
    [.13, .525, .41, .10], [.43, .405, .35, .145], [.66, .28, .27, .22], [.79, .225, .215, .28],
  ], 10, 0);
  // Two large scapular folds continue the upper wing into the back.
  for (const side of [-1, 1]) {
    foldedFeather(torso, v(side * .16, .47, .36), v(side * .34, .245, -.70), .36, .04, side < 0 ? 0 : 1);
    foldedFeather(torso, v(side * .33, .26, .33), v(side * .38, -.20, -.47), .31, .045, 1, v(side * .7, .3, .15).normalize());
  }

  const head = new THREE.Group();
  head.name = 'crow-head';
  head.position.set(0, .26, .66);
  head.scale.set(1.08, 1.08, 1.09);
  torso.add(head);
  facetedBody(head, [
    [-.035, .205, .21, .01], [.16, .255, .235, .07], [.36, .225, .185, .045], [.47, .135, .10, -.015],
  ], 8, 1);
  const beakTop = [v(-.142, .025, .415), v(.142, .025, .415), v(0, .125, .42), v(0, -.13, .99)];
  const beakBottom = [v(-.126, .012, .417), v(.126, .012, .417), v(0, -.085, .435), v(0, -.15, .96)];
  for (const [points, order, color] of [
    [beakTop, [[0, 2, 3], [2, 1, 3], [1, 0, 3], [0, 1, 2]], paperColors[1]],
    [beakBottom, [[0, 3, 2], [2, 3, 1], [1, 3, 0], [0, 2, 1]], paperColors[3]],
  ]) for (const indices of order) triangle(head, points[indices[0]], points[indices[2]], points[indices[1]], color);
  strip(head, v(0, .125, .42), v(0, -.13, .99), v(0, 1, .12).normalize(), .004, cutColor);

  const ink = new THREE.MeshBasicMaterial({ color: 0x09090c });
  const red = new THREE.MeshStandardMaterial({ color: 0xaf1521, emissive: 0x8f0716, emissiveIntensity: .65, roughness: .46, metalness: 0 });
  const glint = new THREE.MeshBasicMaterial({ color: 0xee8280 });
  function smallMesh(geometry, material, parent) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.noShadow = true;
    parent.add(mesh); return mesh;
  }
  const tomoeShape = new THREE.Shape();
  tomoeShape.moveTo(0, -.009);
  tomoeShape.bezierCurveTo(-.012, -.009, -.014, .009, -.001, .011);
  tomoeShape.bezierCurveTo(.01, .016, .018, .009, .018, .001);
  tomoeShape.bezierCurveTo(.009, .008, .01, -.009, 0, -.009);
  const tomoeGeometry = new THREE.ShapeGeometry(tomoeShape, 6);
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.name = side < 0 ? 'left-sharingan' : 'right-sharingan';
    // Follow the skull side's shallow taper. The previous forward-facing
    // tilt sank the front of the iris into the cheek and brow triangles.
    eye.position.set(side * .236, .095, .270);
    eye.quaternion.setFromUnitVectors(v(0, 0, 1), v(side * .9905, 0, .1372).normalize());
    head.add(eye);
    const socket = smallMesh(new THREE.CircleGeometry(.089, 32), ink, eye);
    // A full circular socket frames the entire iris.
    const iris = smallMesh(new THREE.CircleGeometry(.075, 40), red, eye);
    iris.position.z = .004;
    const ring = smallMesh(new THREE.RingGeometry(.046, .049, 32), ink, eye);
    ring.position.z = .007;
    const pupil = smallMesh(new THREE.CircleGeometry(.017, 20), ink, eye);
    pupil.position.z = .008;
    for (let i = 0; i < 3; i++) {
      const angle = i * Math.PI * 2 / 3 + Math.PI / 2;
      const tomoe = smallMesh(tomoeGeometry, ink, eye);
      tomoe.position.set(Math.cos(angle) * .046, Math.sin(angle) * .046, .009);
      tomoe.rotation.z = angle - Math.PI / 2;
      tomoe.scale.setScalar(1.13);
    }
    const light = smallMesh(new THREE.CircleGeometry(.005, 10), glint, eye);
    light.position.set(-.022, .033, .011);
    const nostril = smallMesh(new THREE.CircleGeometry(.013, 10), ink, head);
    nostril.position.set(side * .094, .02, .505);
    nostril.quaternion.setFromUnitVectors(v(0, 0, 1), v(side * .8, .35, .25).normalize());
    nostril.scale.set(.72, .4, 1);
  }

  // Reference: Cornell Lab's labelled American Crow spread wing photograph.
  // Ten primaries grade from overlapping inner vanes to slotted outer fingers.
  // The inner wing is a broad airfoil, not a fan pivoted around one point.
  const wings = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.name = side < 0 ? 'raised-wing' : 'receding-wing';
    const origin = v(side * .27,.16,.12);
    shoulder.position.copy(origin);
    shoulder.scale.setScalar(.90); // Reduce wing size around the attached shoulder.
    wingPresentation.add(shoulder);
    const local = (x,z,lift=0) => v(side*x,.22+(x-.27)*.10+lift,z < 0 ? z * 1.30 : z).sub(origin);
    const normal = v(-side*.10,1,0).normalize();
    const hub = local(1.70,.25);
    // Curved vanes use longitudinal rows. A single triangle fan created the
    // old razor/accordion appearance, even when its perimeter resembled feathers.
    function feather(start,tip,width,shade=0,camber=.018) {
      const along=tip.clone().sub(start).normalize();
      const across=along.clone().cross(normal).normalize();
      const rows=[0,.12,.30,.52,.72,.86,.94,.985,1];
      const widths=[.20,.70,1,1,.94,.82,.59,.28,.035];
      const rails=[-.50,-.18,.10,.50];
      const grid=rows.map((u,r)=>rails.map(w=>start.clone().lerp(tip,u)
        .addScaledVector(across,w*width*widths[r])
        .addScaledVector(normal,Math.sin(u*Math.PI)*camber*(1-3*w*w))));
      const under=grid.map(row=>row.map(point=>point.clone().addScaledVector(normal,-.009)));
      for(let r=0;r<rows.length-1;r++)for(let c=0;c<rails.length-1;c++) {
        const color=tinted(paperColors[shade],.88+c*.035);
        const [a,b,c0,d]=[grid[r][c],grid[r][c+1],grid[r+1][c],grid[r+1][c+1]];
        orientedTriangle(shoulder,a,b,c0,normal,color);
        orientedTriangle(shoulder,b,d,c0,normal,color);
        const [aa,bb,cc,dd]=[under[r][c],under[r][c+1],under[r+1][c],under[r+1][c+1]];
        orientedTriangle(shoulder,aa,cc,bb,normal.clone().negate(),paperColors[0]);
        orientedTriangle(shoulder,bb,cc,dd,normal.clone().negate(),paperColors[0]);
      }
      const edge=(r,c,rr,cc)=>{
        const a=grid[r][c],b=grid[rr][cc],aa=under[r][c],bb=under[rr][cc];
        const n=b.clone().sub(a).cross(normal).normalize();
        orientedTriangle(shoulder,a,aa,b,n,paperColors[0]);
        orientedTriangle(shoulder,b,aa,bb,n,paperColors[0]);
      };
      for(let r=0;r<rows.length-1;r++){edge(r,0,r+1,0);edge(r+1,3,r,3);}
      for(let c=0;c<3;c++){edge(0,c+1,0,c);edge(8,c,8,c+1);}
    }
    // Nearly parallel secondaries fill the full trailing edge back to the body.
    for(let i=0;i<11;i++) {
      const x=.39+i*.133;
      feather(local(x,.10,-.026+i*.002),local(x+.10,-.86-.19*Math.sin(i/10*Math.PI*.75),-.035+i*.003),.255,0);
    }
    // P1–P10. Only the outer five have strongly separated, narrow tips.
    const tips=[[2.05,-1.15],[2.30,-1.18],[2.56,-1.14],[2.83,-1.06],[3.10,-.88],
      [3.34,-.64],[3.50,-.34],[3.52,-.01],[3.37,.29],[3.04,.46]];
    for(let i=0;i<10;i++) {
      const [x,z]=tips[i];
      feather(local(1.57+i*.061,-.44+i*.075,.003+i*.003),local(x,z,.012+i*.005),i<5?.36:.235,0,.024);
    }
    // Continuous cambered shoulder/forearm, with distributed cross-sections.
    const sections=[[.24,.32,-.52],[.65,.19,-.63],[1.08,.12,-.64],[1.53,.39,-.48],[1.98,.38,-.19],[2.31,.20,.035]];
    const cross=[0,.24,.65,1];
    const skin=sections.map(([x,front,back])=>cross.map(u=>local(x,front+(back-front)*u,.048+Math.sin(u*Math.PI)*.09)));
    for(let r=0;r<skin.length-1;r++)for(let c=0;c<3;c++) {
      const [a,b,cc,d]=[skin[r][c],skin[r][c+1],skin[r+1][c],skin[r+1][c+1]];
      const color=tinted(paperColors[0],1+c*.025);
      orientedTriangle(shoulder,a,b,cc,normal,color);orientedTriangle(shoulder,b,d,cc,normal,color);
      const aa=a.clone().addScaledVector(normal,-.085),bb=b.clone().addScaledVector(normal,-.085),ccc=cc.clone().addScaledVector(normal,-.085),dd=d.clone().addScaledVector(normal,-.085);
      orientedTriangle(shoulder,aa,ccc,bb,normal.clone().negate(),paperColors[0]);orientedTriangle(shoulder,bb,ccc,dd,normal.clone().negate(),paperColors[0]);
      if(c===0){orientedTriangle(shoulder,a,cc,aa,v(0,0,1),color);orientedTriangle(shoulder,cc,ccc,aa,v(0,0,1),color);}
    }
    // Two close, offset covert rows cover the feather roots without spikes.
    for(let row=0;row<2;row++)for(let i=0;i<12;i++) {
      const x=.42+i*.143;
      feather(local(x,.09-row*.18,.14-row*.025),local(x+.16,-.38-row*.22,.12-row*.025),.22,0,.012);
    }
    wings.push({shoulder,hub,side,geometry:null,restPositions:null});
  }
  // A centered tail extends behind the pelvis in the same coordinate system
  // as the body and paired wings, remaining coherent from every orbit angle.
  const tail = new THREE.Group();
  tail.name = 'crow-tail-fan';
  tail.position.set(0, .015, -.84);
  torso.add(tail);
  pleatedFan(tail, v(0, 0, 0), [
    v(-.64,-.10,-.72), v(-.49,-.14,-.99), v(-.27,-.17,-1.16), v(0,-.18,-1.23),
    v(.27,-.17,-1.16), v(.49,-.14,-.99), v(.64,-.10,-.72),
  ], v(0,1,-.14).normalize(), .075, 3);
  // Tucked angular feet remain part of the silhouette, without hanging props.
  for (const side of [-1,1]) {
    const a=v(side*.19,-.18,-.35), b=v(side*.15,-.36,-.53), c=v(side*.23,-.34,-.61), d=v(side*.26,-.15,-.47);
    triangle(torso,a,b,c,paperColors[3]); triangle(torso,a,c,d,paperColors[0]);
    triangle(torso,a,c,b,paperColors[3]); triangle(torso,a,d,c,paperColors[0]);
  }
  for (const [parent, batch] of batches) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(batch.positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(batch.colors, 3));
    const colorAttribute = geometry.getAttribute('color');
    colorVariants.push({ attribute: colorAttribute, dark: colorAttribute.array, light: new Float32Array(batch.lightColors) });
    geometry.computeVertexNormals();
    // Project each flat facet along its dominant normal to avoid stretched grain
    // on vertical fans, the chest and horizontal tail alike.
    const positions = geometry.attributes.position, normals = geometry.attributes.normal;
    const uv = new Float32Array(positions.count * 2);
    for (let i = 0; i < positions.count; i++) {
      const nx = Math.abs(normals.getX(i)), ny = Math.abs(normals.getY(i)), nz = Math.abs(normals.getZ(i));
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      uv[i * 2] = (nx > ny && nx > nz ? z : x) * .7;
      uv[i * 2 + 1] = (ny > nx && ny > nz ? z : y) * .7;
    }
    geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.name = `${parent.name || 'body'}-paper`;
    mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh);
    const wing = wings.find(item => item.shoulder === parent);
    if (wing) {
      wing.geometry = geometry;
      wing.restPositions = geometry.attributes.position.array.slice();
      geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    }
  }
  const wingPoint = v(0,0,0), wingBent = v(0,0,0), wingAxis = v(0,0,1);
  const animationDuration = 20.4;
  const tau = Math.PI * 2;
  const wrap = time => ((time % animationDuration) + animationDuration) % animationDuration;
  function flightState(time) {
    const t = wrap(time);
    const glide = pulse(t, 6.15, 1.35, 3.65, 1.55);
    const settle = pulse(t, 16.7, .9, 1.3, 1.45);
    const cycle = tau * t / 3.4;
    // The second harmonic gives the power stroke more intent and the recovery
    // more space, without abrupt pose changes or a hard stop during the glide.
    const beat = Math.sin(cycle) + .15 * Math.sin(cycle * 2);
    return { t, glide, settle, cycle, flap: beat * (.18 - glide * .12 - settle * .055) };
  }
  function animate(elapsed) {
    const { t, glide, settle, cycle, flap } = flightState(Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0);
    const delayed = flightState(t - .24).flap;
    const orbit = tau * t / animationDuration;
    const bank = glide - settle * .48;
    // Distinct look / hold / return beats read at exhibit scale. The first
    // glance starts promptly; both directions get a visible pause, not a wobble.
    const lookLeft = pulse(t, 1.0, .65, 1.35, .95) + pulse(t, 12.6, .75, 1.1, 1.0) * .8;
    const lookRight = pulse(t, 5.0, .70, 1.45, 1.0) + pulse(t, 16.6, .6, .85, 1.05) * .85;
    const look = lookLeft - lookRight;
    const inspect = pulse(t, 9.0, .75, .9, .85);
    const headTilt = pulse(t, 1.45, .50, .9, .9) - pulse(t, 5.45, .55, 1.0, .95);
    // Full shoulder stroke: raised recovery through horizontal to a deep
    // downstroke. Keep the smaller flap signal for head/body follow-through.
    const stroke = Math.cos(cycle) * (1 - glide * .82);
    const shoulderAngle = .15 + stroke * 1.05;
    const recovery = (Math.cos(cycle - .22) + 1) * .5;
    for (const { shoulder, hub, side, geometry, restPositions } of wings) {
      shoulder.rotation.set(.35 + stroke * .10,
        side * (.025 + glide * .035), side * shoulderAngle);
      // Keep the inner wing raised and hinge the outer wing down at the wrist.
      // Blend only around the joint: the hand is a distinct plane, not a
      // gentle whole-span curve. Identical vertices keep a closed shoulder.
      const bend = side * (-.22 - recovery * .48 - delayed * .16 - glide * .12);
      const positions = geometry.attributes.position;
      for (let i=0;i<positions.count;i++) {
        wingPoint.fromArray(restPositions,i*3);
        const span = Math.abs(wingPoint.x + side * .27);
        const weight = smooth((span-1.24)/.78);
        wingBent.copy(wingPoint).sub(hub).applyAxisAngle(wingAxis,bend*weight).add(hub);
        positions.setXYZ(i,wingBent.x,wingBent.y,wingBent.z);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
    }
    flight.rotation.set(-.035 + bank * .035 - flap * .065,
      -.075 * bank + Math.sin(orbit) * .035, -.015 - bank * .145 + Math.sin(orbit) * .025);
    flight.position.set(Math.sin(orbit) * .045,
      Math.sin(orbit) * .09 + (Math.cos(cycle) - 1) * .022 * (1 - glide * .7), 0);
    head.rotation.set(.08 * Math.abs(look) + inspect * .23 - flap * .025,
      -look * .90, headTilt * .16 + inspect * .10);
    // Follow the full shoulder stroke, not the tiny body-follow-through flap.
    // A 0.4-second lag lets the tail counter-pitch after each power stroke;
    // feather spread opens on the downstroke and narrows during recovery.
    // All motion stays anchored at the pelvis (the tail's local origin).
    const tailPhase = cycle - tau * .4 / 3.4;
    const tailStroke = Math.cos(tailPhase) * (1 - glide * .82);
    const tailSway = Math.sin(orbit * 2 - .45) - Math.sin(-.45);
    tail.rotation.set(.10 - tailStroke * .40 + glide * .07,
      tailSway * .115 + bank * .13,
      -bank * .065 + Math.sin(tailPhase) * .055 * (1 - glide * .82));
    tail.scale.x = 1.04 - tailStroke * .18 + glide * .18 + settle * .04;
  }
  function setTheme(theme) {
    const dark = theme === 'dark';
    for (const colors of colorVariants) {
      colors.attribute.array = dark ? colors.dark : colors.light;
      colors.attribute.needsUpdate = true;
    }
    surface.emissive.set(0x182538);
    surface.emissiveIntensity = dark ? .09 : 0;
    surface.roughness = dark ? .70 : .66;
    red.emissiveIntensity = dark ? .85 : .5;
  }
  root.userData = { animate, setTheme, animationDuration, conceptual: true, foldedFeathers: 35 };
  animate(0); setTheme('dark');
  return root;
}
