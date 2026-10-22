import { applyBakedAO } from './storybook-surface.js';
import { coastalMotion } from './anginombak-motion.js';
import { createCoastalWalk, createWalkingShadows } from './anginombak-walk.js';

// A hand-built coastal atlas. Waves, picture reliefs, folds and foliage are
// actual geometry. Keep seed and batching order stable for the offline bake.
// Rebuild shading after geometry edits:
// node scripts/bake-storybook-ao.mjs --model=anginombak --rays=48 --distance=0.65 --cell=0.022
export function createArtifact(T, { bake = false } = {}) {
  const root = new T.Group();
  const motion = coastalMotion(T);
  const palette = {
    limestone: 0xd4b78b, paper: 0xe7d1a5, edge: 0xbfa074, ivory: 0xf4dfb8, contour: 0xd3bd92,
    sea: 0x14537c, blue: 0x166da0, cobalt: 0x124879, foam: 0x82b7bd,
    route: 0x144c8b, red: 0xc34125, stripe: 0xe47c45, canvas: 0xf6d9a6,
    wood: 0x9a7242, leaf: 0x536442, sage: 0x7a8350, darkLeaf: 0x354b39,
    vein: 0xa6a16b, mountain: 0x85876a, ridge: 0x616b51,
    terracotta: 0xaf613c, fruit: 0xdaaa43, lime: 0x81913f,
    sky: 0xa7bdc1, sunset: 0xdba76e, distant: 0x839a9b,
    leather: 0x96754e, hair: 0x59442e, brass: 0xb69a5d,
  };
  const materials = {};
  for (const [name, color] of Object.entries(palette)) {
    const polished = ['blue', 'sea', 'cobalt', 'route'].includes(name);
    const material = new T.MeshStandardMaterial({ color, roughness: name === 'sea' ? .72 : polished ? .39 : .83, envMapIntensity: name === 'sea' ? .25 : 1, metalness: name === 'brass' ? .55 : 0, side: T.DoubleSide });
    // World-sized pigment, paper fibre and limestone mottling. No downloads,
    // UV seams or texture stretching on the sculpted forms.
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vCoastPosition;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCoastPosition = position;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vCoastPosition;
        float coastHash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
        float coastNoise(vec3 p) {
          vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(mix(coastHash(i),coastHash(i+vec3(1,0,0)),f.x),mix(coastHash(i+vec3(0,1,0)),coastHash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(coastHash(i+vec3(0,0,1)),coastHash(i+vec3(1,0,1)),f.x),mix(coastHash(i+vec3(0,1,1)),coastHash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float cloud=coastNoise(vCoastPosition*7.0);
          float mineral=coastNoise(vCoastPosition*46.0);
          float fibre=coastNoise(vCoastPosition*vec3(310.0,250.0,165.0));
          diffuseColor.rgb *= ${polished ? '0.82 + .18*cloud + .085*mineral + .025*fibre' : '0.78 + .20*cloud + .10*mineral + .08*fibre'};
        `)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
          float coastHeight = coastNoise(vCoastPosition * 85.0) * .25 + coastNoise(vCoastPosition * 280.0) * .12;
          vec3 coastDx = normalize(dFdx(-vViewPosition)), coastDy = normalize(dFdy(-vViewPosition));
          vec3 coastR1 = cross(coastDy, normal), coastR2 = cross(normal, coastDx);
          float coastDet = dot(coastDx, coastR1) * faceDirection;
          vec3 coastGrad = sign(coastDet) * (dFdx(coastHeight) * coastR1 + dFdy(coastHeight) * coastR2);
          normal = normalize(abs(coastDet) * normal - coastGrad * ${polished ? '.26' : '.50'});
        `);
    };
    material.customProgramCacheKey = () => `coastal-surface-v2-${polished}`;
    motion.install(material);
    materials[name] = material;
  }
  const group = (x = 0, y = 0, z = 0, yaw = 0, parent = root) => {
    const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = yaw; parent.add(g); return g;
  };
  function mesh(geometry, material, parent = root) {
    const o = new T.Mesh(geometry, materials[material]); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
  }
  function shape(points) {
    const s = new T.Shape(); points.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return s;
  }
  function rounded(w, h, r) {
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function relief(s, depth, mat, parent = root, bevel = .012) {
    const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 32, steps: 1 });
    return mesh(g, mat, parent);
  }
  function box(w, h, d, x, y, z, mat, parent = root, radius = .025) {
    const b = Math.min(radius, w / 5, h / 5, d / 5);
    const o = relief(rounded(w - 2 * b, h - 2 * b, Math.min(b, w / 8, h / 8)), d - 2 * b, mat, parent, b);
    o.position.set(x, y, z - d / 2 + b); return o;
  }
  function ball(x, y, z, sx, sy, sz, mat, parent = root, segments = 20) {
    const o = mesh(new T.SphereGeometry(1, segments, 12), mat, parent); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return o;
  }
  function disk(r, h, x, y, z, mat, parent = root, top = r) {
    const o = mesh(new T.CylinderGeometry(top, r, h, 40), mat, parent); o.position.set(x, y, z); return o;
  }
  function tube(points, radius, mat, parent = root, segments = 32) {
    return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), segments, radius, 8, false), mat, parent);
  }
  function ring(r, thickness, x, y, z, mat, parent = root, horizontal = false) {
    const o = mesh(new T.TorusGeometry(r, thickness, 10, 48), mat, parent); o.position.set(x, y, z); if (horizontal) o.rotation.x = Math.PI / 2; return o;
  }

  // Limestone slab with a subdivided top for soft baked contact shadows.
  box(7.6, .26, 5.25, 0, .13, 0, 'limestone', root, .055);
  const top = new T.PlaneGeometry(7.45, 5.10, 100, 72); top.rotateX(-Math.PI / 2);
  mesh(top, 'limestone').position.y = .263;
  function coast(z) { return -1.64 + .25 * Math.sin(z * 2.1) + .14 * Math.cos(z * 4.0); }
  function fold(x, z) {
    const ridges = .26 * (1 - Math.abs(((x + 2.2) / 1.38 % 2 + 2) % 2 - 1));
    return .37 + ridges + .075 * Math.sin(z * 1.4 + x * .6) + Math.max(0, -z - .72) * .24;
  }
  function sheet(xStart, xEnd, zStart, zEnd, height, mat, nx = 70, nz = 60) {
    const geometry = new T.PlaneGeometry(1, 1, nx, nz), p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) + .5, v = p.getY(i) + .5;
      const z = zStart + v * (zEnd - zStart);
      const left = typeof xStart === 'function' ? xStart(z) : xStart;
      const right = typeof xEnd === 'function' ? xEnd(z) : xEnd;
      const x = left + u * (right - left); p.setXYZ(i, x, height(x, z), z);
    }
    const index = geometry.index.array;
    for (let i = 0; i < index.length; i += 3) [index[i + 1], index[i + 2]] = [index[i + 2], index[i + 1]];
    geometry.computeVertexNormals(); return mesh(geometry, mat);
  }
  sheet(-3.59, z => coast(z) + .12, -2.36, 2.35, () => .282, 'sea');
  sheet(z => coast(z) - .12, z => coast(z) + .28, -2.31, 2.31, () => .30, 'foam', 8, 90);
  sheet(z => coast(z) + .02, 3.51, -2.30, 2.31, (x, z) => fold(x, z) - .035, 'edge');
  sheet(coast, 3.48, -2.30, 2.30, fold, 'paper');
  // Closed paper edges show its thickness and raised accordion folds.
  for (const z of [-2.30, 2.30]) {
    const points = [];
    for (let i = 0; i <= 90; i++) { const x = coast(z) + i / 90 * (3.48 - coast(z)); points.push([x, fold(x, z)]); }
    for (let i = 90; i >= 0; i--) { const x = coast(z) + i / 90 * (3.48 - coast(z)); points.push([x, fold(x, z) - .037]); }
    relief(shape(points), .015, 'edge', root, .001).position.z = z;
  }
  for (const x of [-.82, .56, 1.94, 3.32]) {
    const points = Array.from({ length: 55 }, (_, i) => { const z = -2.29 + i / 54 * 4.58; return [x, fold(x, z) + .004, z]; });
    tube(points, .006, 'edge');
  }
  for (let i = 0; i < 24; i++) {
    const points = [];
    for (let j = 0; j <= 65; j++) {
      const z = -2.21 + j / 65 * 4.42, x = -.98 + i * .19 + .09 * Math.sin(z * 5 + i * .65) + .045 * Math.sin(z * 13 + i);
      if (x < 3.40 && x > coast(z) + .06) points.push([x, fold(x, z) + .006, z]);
    }
    if (points.length > 2) tube(points, .0028, 'contour', root, 70);
  }
  // Curling wave silhouettes are broad carved fins, not round piping.
  function wave(x, z, scale, mat) {
    const g = group(x, .29, z, -.04); g.scale.setScalar(scale);
    motion.mark(g, 1, -z * 1.45);
    const s = new T.Shape();
    s.moveTo(-.99, 0); s.bezierCurveTo(-1.05, .59, -.76, 1.21, -.20, 1.38);
    s.bezierCurveTo(.15, 1.51, .68, 1.38, .65, 1.04);
    s.bezierCurveTo(.63, .83, .40, .82, .39, 1.00);
    s.bezierCurveTo(.54, .93, .55, 1.19, .30, 1.18);
    s.bezierCurveTo(-.03, 1.15, .02, .65, .48, .35);
    s.bezierCurveTo(.71, .21, .86, .09, .94, 0); s.closePath();
    relief(s, .16, mat, g, .025);
    tube([[-.96,.18,.194],[-.75,.91,.194],[-.17,1.32,.194],[.38,1.32,.194],[.57,1.12,.194]], .009, 'foam', g, 48);
    tube([[-.78,.04,.194],[-.56,.63,.194],[-.18,.94,.194],[.05,.97,.194]], .005, 'blue', g);
  }
  [[-2.52,-1.97,1.00,'cobalt'],[-2.55,-1.39,.94,'blue'],[-2.60,-.78,.80,'cobalt'],[-2.70,-.14,.67,'blue'],[-2.81,.49,.56,'cobalt'],[-2.91,1.05,.44,'blue'],[-3.02,1.60,.32,'blue']].forEach(a => wave(...a));
  for (let i = 0; i < 8; i++) {
    const points = [];
    for (let j = 0; j < 60; j++) { const z = -2.25 + j / 59 * 4.50; points.push([coast(z) - .16 - i * .19 + .025 * Math.sin(z * 9 + i), .291, z]); }
    tube(points, i % 3 === 0 ? .006 : .003, i % 3 === 0 ? 'foam' : 'blue', root, 80);
  }
  function rock(x, y, z, sx, sy, sz, mat = 'ivory', parent = root) {
    const geo = new T.IcosahedronGeometry(1, 1), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const a = p.getX(i), b = p.getY(i), c = p.getZ(i), n = 1 + .13 * Math.sin(a * 8 + b * 6 + c * 12);
      p.setXYZ(i, a * n, Math.max(-.60, b * n), c * n);
    }
    geo.computeVertexNormals(); const o = mesh(geo, mat, parent); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return o;
  }
  function mountain(x, z, radius, height, mat = 'mountain') {
    const sides = 17, rings = 7, positions = [], indices = [];
    for (let r = 0; r <= rings; r++) for (let i = 0; i <= sides; i++) {
      const t = r / rings, angle = i / sides * Math.PI * 2;
      const jagged = 1 + .18 * Math.sin(angle * 3 + x) + .12 * Math.cos(angle * 7 + z);
      const xx = x + Math.cos(angle) * radius * t * jagged, zz = z + Math.sin(angle) * radius * t * jagged * .63;
      const h = height * Math.pow(1 - t, 1.30) * (1 + .16 * Math.sin(angle * 5) * t);
      positions.push(xx, fold(xx, zz) + h, zz);
      if (r < rings && i < sides) { const k = r * (sides + 1) + i; indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1); }
    }
    const geo = new T.BufferGeometry(); geo.setAttribute('position',new T.Float32BufferAttribute(positions,3)); geo.setIndex(indices); geo.computeVertexNormals();
    mesh(geo.toNonIndexed(), mat); geo.dispose();
  }
  [[1.36,-1.87,.75,.67],[2.10,-1.91,.62,.48],[.25,1.38,.63,.45],[.78,1.59,.49,.29],[-.20,1.58,.33,.22],[2.97,.63,.35,.24]].forEach(a => mountain(...a));
  [[-3.22,1.99,.22,.24,.20],[-2.95,2.13,.16,.16,.14],[-1.94,.06,.18,.31,.15],[-2.16,.18,.13,.20,.14]].forEach(([x,z,sx,sy,sz]) => rock(x,.34+sy*.30,z,sx,sy,sz));

  function leaf(x, y, z, yaw, length, mat, parent, droop = .10) {
    const g = group(x, y, z, yaw, parent), positions = [], indices = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, width = Math.sin(Math.PI * t) * length * .16;
      for (const side of [-1,0,1]) positions.push(side * width, .18 * Math.sin(Math.PI*t) - droop*t*t + (side === 0 ? .026*Math.sin(Math.PI*t) : 0), -t*length);
      if (i < 14) for(let c=0;c<2;c++){const n=i*3+c;indices.push(n,n+1,n+3,n+1,n+4,n+3);}
    }
    const geo = new T.BufferGeometry(); geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,mat,g);
    tube([[0,0,0],[0,.19-droop*.25,-length*.5],[0,-droop,-length]],.006,'vein',g,18);
    for(let i=2;i<12;i+=2){const t=i/14;for(const side of [-1,1])tube([[0,.18*Math.sin(Math.PI*t)-droop*t*t+.02,-t*length],[side*Math.sin(Math.PI*(t+.07))*length*.145,.18*Math.sin(Math.PI*(t+.07))-droop*(t+.07)**2,-(t+.07)*length]],.0025,'vein',g,8);}
  }
  function palm(x,z,scale=1) {
    const g=group(x,fold(x,z)+.01,z);g.scale.setScalar(scale);
    motion.mark(g, 2, x * .9 + z * .5);
    tube([[0,0,0],[.025,.38,0],[.11,.79,-.03],[.07,1.11,-.03]],.047,'wood',g);
    for(let i=1;i<12;i++)ring(.045,.007,.01+Math.sin(i/11*Math.PI)*.065,i*.085,-i*.002,'edge',g,true);
    for(let i=0;i<9;i++)leaf(.07,1.09,-.03,i*Math.PI*2/9,.65+(i%3)*.10,i%2?'leaf':'sage',g,.20+(i%2)*.08);
    for(let i=0;i<3;i++)ball(.07+Math.cos(i*2.1)*.065,1.02,Math.sin(i*2.1)*.06,.05,.06,.05,'wood',g);
  }
  function shrub(x,z,scale=1) {
    const y=fold(x,z),g=group(x,y,z);g.scale.setScalar(scale);
    motion.mark(g,2,x+z);
    for(let i=0;i<7;i++){const a=i*2.4,r=.11*Math.sqrt(i);const o=ball(Math.cos(a)*r,.11+(i%3)*.07,Math.sin(a)*r,.115,.18+(i%3)*.025,.10,i%3===0?'sage':i%3===1?'leaf':'darkLeaf',g,12);o.rotation.z=Math.sin(a)*.25;}
    for(let i=0;i<3;i++)tube([[i*.065-.07,0,.15],[i*.07-.07,.13,.14],[i*.085-.08,.23,.13]],.009,'vein',g,10);
  }
  palm(-1.10,1.59,.78);palm(3.02,-1.73,1.02);palm(-.28,1.96,.40);
  [[-.74,1.90,.65],[.96,2.01,.69],[1.30,-1.48,.68],[2.82,-1.33,.56],[3.17,.65,.58],[-.48,-1.78,.64],[.10,1.94,.42],[2.52,.95,.38]].forEach(a=>shrub(...a));

  // Sewn canopy, scalloped valance, timber counter, turned pottery and produce.
  const stall=group(-.31,fold(-.31,-.95),-.95,-.06);
  box(1.00,.52,.61,0,.26,0,'paper',stall);box(1.10,.07,.73,0,.55,0,'ivory',stall,.018);
  for(let i=0;i<8;i++)box(.008,.43,.012,-.44+i*.126,.27,.314,'edge',stall,.002);
  for(const x of [-.49,.49])for(const z of [-.25,.25]){disk(.027,1.21,x,.64,z,'wood',stall);disk(.047,.06,x,.07,z,'edge',stall);}
  box(1.13,.075,.065,0,1.23,-.27,'wood',stall);
  for(let i=0;i<9;i++){
    const x=-.51+i*.128,g=new T.PlaneGeometry(.127,.86,2,16),p=g.attributes.position;
    for(let j=0;j<p.count;j++){const zz=p.getY(j);p.setXYZ(j,p.getX(j)+x,1.31-.25*(zz+.43)+.055*Math.sin((zz+.43)/.86*Math.PI),zz);}
    const indices=g.index.array;
    for(let j=0;j<indices.length;j+=3)[indices[j+1],indices[j+2]]=[indices[j+2],indices[j+1]];
    g.computeVertexNormals();motion.mark(mesh(g,i%2?'stripe':'red',stall),6,0,stall);
    const scallop=new T.Shape();scallop.moveTo(-.064,0);scallop.lineTo(.064,0);scallop.lineTo(.064,-.085);scallop.quadraticCurveTo(0,-.16,-.064,-.085);scallop.closePath();
    const valance=relief(scallop,.025,i%2?'stripe':'red',stall,.004);valance.position.set(x,1.095,.43);
    motion.mark(valance,6,0,stall);
    motion.mark(tube([[x-.06,1.31,-.43],[x-.06,1.25,0],[x-.06,1.095,.43]],.003,'canvas',stall),6,0,stall);
  }
  function pot(x,y,z,r,h,mat,parent=root){
    const points=[[0,0],[r*.7,0],[r,.12*h],[r,h*.55],[r*.60,h*.81],[r*.58,h],[r*.72,h],[r*.72,h*.90],[r*.49,h*.90],[r*.49,h*.79],[r*.82,h*.52],[r*.75,h*.18],[0,h*.13]].map(p=>new T.Vector2(...p));
    const o=mesh(new T.LatheGeometry(points,24),mat,parent);o.position.set(x,y,z);ring(r*.65,.012,x,y+h,z,mat,parent,true);return o;
  }
  function basket(x,y,z,r,parent=root){
    pot(x,y,z,r,.13,'wood',parent);
    for(let i=0;i<3;i++)ring(r*(.88+i*.025),.008,x,y+.035+i*.031,z,'edge',parent,true);
    for(let i=0;i<8;i++){const a=i*2.4,rr=r*.60*Math.sqrt(i/8);ball(x+Math.cos(a)*rr,y+.12+(i%3)*.018,z+Math.sin(a)*rr,.031,.033,.031,i%2?'lime':'fruit',parent,12);}
  }
  basket(-.26,.59,.14,.13,stall);basket(.08,.59,.15,.12,stall);
  pot(.32,.59,.05,.072,.24,'terracotta',stall);pot(.36,.59,-.16,.062,.18,'ivory',stall);
  pot(-.68,.02,.08,.12,.30,'terracotta',stall);pot(-.64,.01,.36,.10,.21,'ivory',stall);basket(-.44,.01,.49,.16,stall);
  ball(0,.86,-.12,.12,.20,.095,'ivory',stall);ball(0,1.12,-.12,.105,.13,.105,'ivory',stall);
  tube([[-.09,.95,-.12],[-.17,.80,.02],[-.11,.70,.14]],.041,'ivory',stall);tube([[.09,.95,-.12],[.17,.82,0],[.14,.72,.12]],.041,'ivory',stall);

  // Continuous bevelled pin, including its true circular opening.
  const pin=group(-1.35,fold(-1.35,-.39)+.07,-.39,.05);
  const pinShape=new T.Shape();pinShape.moveTo(0,0);pinShape.bezierCurveTo(-.17,.36,-.49,.68,-.49,1.03);
  pinShape.bezierCurveTo(-.49,1.70,.49,1.70,.49,1.03);pinShape.bezierCurveTo(.49,.68,.17,.36,0,0);
  const hole=new T.Path();hole.absarc(0,1.04,.215,0,Math.PI*2,true);pinShape.holes.push(hole);
  motion.mark(relief(pinShape,.14,'red',pin,.035),4,0,pin);ring(.16,.045,0,-.005,.08,'route',pin,true);

  // Framed landscapes contain layered paper mountains and a winding inlet.
  function postcard(x,z,yaw,sunset=false){
    const g=group(x,fold(x,z)+.05,z,yaw);g.rotation.x=-.10;
    motion.mark(g,8,x*1.2);
    box(1.02,1.52,.065,0,.76,0,'ivory',g,.018);box(.90,1.26,.018,0,.83,.043,sunset?'sunset':'sky',g,.006);
    const landscape=group(0,.27,.067,0,g);
    const layer=(points,depth,mat,offset)=>{const o=relief(shape(points),depth,mat,landscape,.003);o.position.z=offset;};
    layer([[-.443,0],[-.443,.53],[-.33,.58],[-.14,.44],[.08,.75],[.20,.63],[.28,.80],[.443,.62],[.443,0]],.018,'distant',.006);
    layer([[-.443,0],[-.443,.36],[-.28,.45],[-.12,.30],[.08,.59],[.19,.79],[.30,.56],[.443,.48],[.443,0]],.018,'ridge',.031);
    layer([[-.443,0],[-.443,.20],[-.23,.25],[-.04,.20],[.12,.39],[.22,.52],[.35,.39],[.443,.34],[.443,0]],.018,'leaf',.055);
    layer([[-.443,0],[-.443,.12],[-.17,.21],[.07,.22],[.29,.32],[.443,.29],[.443,0]],.015,'paper',.079);
    const river=new T.Shape();river.moveTo(-.443,0);river.lineTo(.443,0);river.lineTo(.443,.12);river.bezierCurveTo(.15,.13,.02,.07,-.05,.12);river.bezierCurveTo(-.24,.21,.21,.21,.29,.32);river.bezierCurveTo(.06,.22,-.30,.25,-.27,.13);river.lineTo(-.443,.10);river.closePath();relief(river,.012,'blue',landscape,.003).position.z=.101;
    for(let i=0;i<4;i++)tube([[-.35,.035+i*.027,.12],[-.08,.05+i*.021,.12],[.10,.029+i*.016,.12]],.003,'foam',landscape,12);
    if(sunset){const sun=disk(.115,.01,-.25,.90,.012,'canvas',landscape);sun.rotation.x=Math.PI/2;}
    else for(const [cx,cy,s] of [[-.23,.91,.13],[.22,1.02,.095]]){ball(cx,cy,.01,s,.034,.008,'ivory',landscape);ball(cx-.025,cy+.027,.01,s*.4,.04,.009,'ivory',landscape);}
    box(.86,.014,.02,0,.12,.046,'edge',g,.002);tube([[-.30,.02,-.36],[0,1.19,-.06],[.30,.02,-.36]],.018,'wood',g);
  }
  postcard(.97,-.92,-.09);postcard(2.74,-.26,.12,true);
  const pathPoints=[[-1.35,-.29],[-.95,.20],[-.20,.34],[.45,.08],[.95,-.03],[1.35,.48],[1.42,1.01],[2.03,1.22],[2.76,.62],[2.70,1.21],[2.98,1.91]];
  const routeCurve=new T.CatmullRomCurve3(pathPoints.map(([x,z])=>new T.Vector3(x,0,z)));
  for(let i=0;i<49;i++){
    const a=routeCurve.getPointAt(i/49),b=routeCurve.getPointAt((i+.61)/49),mid=a.clone().lerp(b,.5);
    motion.mark(tube([[a.x,fold(a.x,a.z)+.035,a.z],[mid.x,fold(mid.x,mid.z)+.035,mid.z],[b.x,fold(b.x,b.z)+.035,b.z]],.022,'route',root,6),7,(i+.3)/49);
  }
  for(const [x,z] of [[-1.35,-.29],[.95,-.03],[2.76,.62],[2.98,1.91]])ring(.12,.038,x,fold(x,z)+.045,z,'route',root,true);
  const bubble=group(.93,fold(.93,.90)+.34,.90,-.04);
  relief(rounded(.94,.60,.25),.12,'ivory',bubble,.025);
  const tail=relief(shape([[-.24,-.24],[-.27,-.49],[-.02,-.25]]),.10,'ivory',bubble,.015);tail.position.z=.006;
  for(const x of [-.23,0,.23])motion.mark(ball(x,0,.15,.064,.064,.025,'route',bubble),5,-x*7,bubble);

  // Carved travelling companions with boots, jacket seams, satchels and hat.
  function explorer(x,z,scale,yaw,child=false){
    const g=group(x,fold(x,z)+.015,z,yaw);g.scale.setScalar(scale);
    motion.mark(g,child?10:9,0,g);
    for(const side of [-1,1]){
      const kind=(child?15:11)+(side===1?1:0);
      motion.mark(box(.14,.10,.25,side*.115,.07,.04,'leather',g,.035),kind,0,g);
      motion.mark(tube([[side*.115,.14,0],[side*.10,.28,side*.035],[side*.08,.46,0]],.066,'ivory',g,18),kind,0,g);
    }
    ball(0,.62,0,.18,.235,.12,child?'canvas':'ivory',g);box(.30,.10,.23,0,.47,0,'paper',g,.028);
    tube([[0,.48,.119],[0,.64,.125],[0,.80,.08]],.006,'edge',g,16);
    for(const side of [-1,1]){
      const kind=(child?17:13)+(side===1?1:0);
      motion.mark(tube([[side*.14,.77,0],[side*.23,.63,.02],[side*.24,.51,.10]],.055,'ivory',g,18),kind,0,g);
      motion.mark(ball(side*.24,.49,.11,.057,.068,.05,'paper',g),kind,0,g);box(.075,.09,.018,side*.09,.66,.116,'paper',g,.008);
      ball(side*.09,.68,.131,.009,.009,.006,'brass',g,10);
    }
    ball(0,.94,0,.124,.15,.115,'ivory',g);ball(0,.936,.114,.027,.033,.033,'paper',g);
    if(child){ball(0,1.03,-.025,.13,.075,.11,'hair',g);ball(-.02,1.048,.05,.12,.04,.07,'hair',g);}
    else {disk(.25,.033,0,1.047,0,'ivory',g);const crown=ball(0,1.09,0,.166,.12,.145,'ivory',g);crown.rotation.z=-.09;disk(.164,.035,0,1.071,0,'leather',g,.158);}
    box(.29,.34,.15,0,.65,-.156,'paper',g,.05);box(.30,.11,.16,0,.80,-.16,'ivory',g,.03);
    for(const side of [-1,1]){
      tube([[side*.10,.47,-.21],[side*.10,.68,-.24],[side*.10,.83,-.19]],.014,'leather',g,14);
      tube([[side*.10,.78,-.11],[side*.14,.82,.02],[side*.12,.53,.11]],.012,'leather',g,18);
      box(.031,.039,.014,side*.10,.65,-.25,'brass',g,.004);
    }
  }
  explorer(3.03,1.63,.86,-.70);explorer(2.49,1.77,.57,-.55,true);
  function wind(x,y,z,scale){
    const g=group(x,y,z,.05);g.scale.setScalar(scale);
    motion.mark(g,3,x*1.3);
    const s=new T.Shape();s.moveTo(-.68,-.08);s.bezierCurveTo(-.30,.42,.17,-.14,.43,.19);s.bezierCurveTo(.66,.47,.25,.65,.22,.40);
    s.bezierCurveTo(.13,.74,.78,.75,.78,.33);s.bezierCurveTo(.80,-.14,.29,-.22,-.05,-.08);s.bezierCurveTo(-.30,.03,-.48,.08,-.68,-.08);s.closePath();
    relief(s,.065,'ivory',g,.012);
  }
  wind(-2.69,1.96,-1.53,.69);wind(-1.98,2.40,-1.95,.94);

  // Hundreds of crafted parts become a small fixed set of draw calls.
  root.updateMatrixWorld(true);
  const batches=new Map(), originals=new Set(), framingPoints=[];
  root.traverse(o=>{
    if(!o.isMesh)return;
    const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo.computeBoundingBox();
    const b=geo.boundingBox;
    for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));
    if(!batches.has(o.material))batches.set(o.material,{position:[],normal:[],coastMotion:[],coastPivot:[]});
    const batch=batches.get(o.material);
    for(const name of ['position','normal'])for(const value of geo.attributes[name].array)batch[name].push(value);
    const [kind,phase,x,y,z]=motion.attributes(o);
    for(let i=0;i<geo.attributes.position.count;i++){
      batch.coastMotion.push(kind,phase);batch.coastPivot.push(x,y,z);
    }
    originals.add(o.geometry);geo.dispose();
  });
  root.clear();originals.forEach(g=>g.dispose());
  for(const [material,attributes] of batches){
    const geo=new T.BufferGeometry();for(const name of ['position','normal'])geo.setAttribute(name,new T.Float32BufferAttribute(attributes[name],3));
    geo.setAttribute('coastMotion',new T.Float32BufferAttribute(attributes.coastMotion,2));
    geo.setAttribute('coastPivot',new T.Float32BufferAttribute(attributes.coastPivot,3));
    geo.computeBoundingSphere();const o=new T.Mesh(geo,material);o.name=Object.keys(materials).find(k=>materials[k]===material);o.castShadow=o.receiveShadow=true;root.add(o);
    o.customDepthMaterial=motion.depthMaterial;
    // Include the walkers' complete route in the GPU-deformed mesh bounds.
    geo.boundingSphere.radius+=3;
  }
  for(const material of Object.values(materials))if(!batches.has(material))material.dispose();
  Object.assign(root.userData,{artifactId:35,conceptual:true,displayBase:false,studioProfile:'coastal',groundLevel:0,initialYaw:-.34,initialElevation:.55,framingPoints,aoHashQuantization:1000});
  const walk=createCoastalWalk(T,fold);
  let updateShadows;
  root.userData.animate=seconds=>{
    const poses=walk(seconds);
    motion.animate(seconds);motion.setWalkers(poses);updateShadows?.(poses);
  };
  root.userData.animate(0);
  root.userData.realTimeAnimation=true;
  if(!bake)applyBakedAO(T,root,{url:new URL('../assets/anginombak-ao-v1.bin',import.meta.url),label:'Coastal atlas',quantization:1000});
  // Add decals after the AO loader snapshots the original material batches.
  if(!bake){updateShadows=createWalkingShadows(T,root,fold);updateShadows(walk(0));}
  return root;
}
