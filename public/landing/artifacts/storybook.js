import { createStorybookPages } from './storybook-pages.js';
import { createStorybookDetails } from './storybook-details.js';
import { createStorybookJourney } from './storybook-journey.js';
import { applyBakedAO } from './storybook-surface.js';

// A physical paper sculpture of the concept artwork: cloth, deckled pages,
// folded relief and a grounded blue road, with local tactile paper maps.
export function createArtifact(THREE, { bake = false } = {}) {
  const root = new THREE.Group(); root.name = 'draw-your-way-home';
  let seed = 81027;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  function grainTexture(cloth = false) {
    const size = 256, data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const fiber = cloth
        ? Math.sin(x * Math.PI / 2) * 22 + Math.sin(y * Math.PI / 2) * 18
        : Math.sin(x * .11 + Math.sin(y * .17)) * 8 + Math.sin(y * .27 + Math.sin(x * .05) * 3) * 9;
      const value = Math.round(142 + fiber + (random() - .5) * (cloth ? 23 : 50));
      const i = (y * size + x) * 4; data[i] = data[i + 1] = data[i + 2] = value; data[i + 3] = 255;
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter; texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true; texture.anisotropy = 4; texture.needsUpdate = true;
    texture.repeat.set(cloth ? 7 : 3.5, cloth ? 7 : 3.5);
    return texture;
  }
  const paperGrain = grainTexture(), clothGrain = grainTexture(true);
  let paperMap = null;
  if (!bake && typeof document !== 'undefined') {
    paperMap = new THREE.TextureLoader().load('/landing/assets/storybook-paper-v1.jpg', () => {
      if (!root.userData.disposed) root.userData.requestRender?.();
    });
    paperMap.wrapS = paperMap.wrapT = THREE.RepeatWrapping;
    paperMap.colorSpace = THREE.SRGBColorSpace;
    paperMap.anisotropy = 8;
    paperMap.repeat.set(1.8, 1.8);
  }
  const paper = color => new THREE.MeshPhysicalMaterial({ color, map: paperMap, roughness: .98, metalness: 0, bumpMap: paperMap ?? paperGrain, bumpScale: paperMap ? .055 : .013, sheen: .08, sheenRoughness: 1, sheenColor: 0xffeaca, side: THREE.DoubleSide });
  const materials = {
    paper: paper(0xfff8ea), paperWarm: paper(0xf3e5cd), paperShade: paper(0xc9b898), edge: paper(0xfffbef),
    red: new THREE.MeshPhysicalMaterial({ color: 0x9c171c, roughness: .73, bumpMap: clothGrain, bumpScale: .013, sheen: .25, sheenColor: 0xbd352e, sheenRoughness: .75 }),
    redDark: new THREE.MeshStandardMaterial({ color: 0x66121b, roughness: .86, bumpMap: clothGrain, bumpScale: .010 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xb99756, roughness: .56, metalness: .5 }),
    cobalt: new THREE.MeshStandardMaterial({ color: 0x164f94, roughness: .94, metalness: 0, bumpMap: paperGrain, bumpScale: .0015, side: THREE.DoubleSide }),
    roadPaint: new THREE.MeshStandardMaterial({ color: 0xfff7df, roughness: .9, side: THREE.DoubleSide }),
    curb: new THREE.MeshStandardMaterial({ color: 0xd6c8ad, roughness: .95, side: THREE.DoubleSide }),
    ink: new THREE.MeshStandardMaterial({ color: 0x443c32, roughness: .88 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x8c7050, roughness: .89, bumpMap: paperGrain, bumpScale: .008 }),
    window: new THREE.MeshStandardMaterial({ color: 0xf4cb84, emissive: 0xffa342, emissiveIntensity: .3, roughness: .45 }),
  };
  const book = createStorybookPages(THREE, materials); root.add(book.group);
  const height = book.surfaceHeight;
  const add = (geometry, material, parent = root) => { const m = new THREE.Mesh(geometry, material); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };

  // Asymmetric folded sheets run all the way down into the page. Each wing
  // has a different slope, curl and cut edge, like an actual paper maquette.
  function mountain({x, z, width, rise, depth, peak = .45, lean = .0, phase = 0}) {
    const nx = 72, nz = 54;
    const sample = (u,v) => {
      const d = u < peak ? u / peak : (1-u)/(1-peak);
      // Ease the last few millimetres into a folded-paper tip, rather than
      // ending two perfectly straight planes at a razor-sharp point.
      const tipRadius = .024;
      const rounded = (Math.sqrt(1 + tipRadius * tipRadius) - Math.sqrt((1-d)*(1-d) + tipRadius*tipRadius)) / (Math.sqrt(1 + tipRadius*tipRadius) - tipRadius);
      const silhouette = Math.pow(Math.max(0, rounded), .88);
      const fan = Math.pow(v, .82);
      const xx = x + (u-.5)*width + lean*fan*silhouette + Math.sin(v*Math.PI)*.17*(u-.3);
      const zz = z + depth*(1-v) + (u-.5)*.36 + .46*silhouette*fan + .24*Math.sin(u*Math.PI*2+phase)*Math.sin(v*Math.PI);
      // Broad pleats and small compression wrinkles share the same paper surface.
      const pleat = Math.sin(u*Math.PI*4.0 + v*.6 + phase)*.095*Math.sin(v*Math.PI)*Math.sin(u*Math.PI);
      const wrinkle = (Math.sin(xx*27+zz*13)+Math.sin(xx*41-zz*24))*.0035*Math.sin(u*Math.PI)*Math.sin(v*Math.PI);
      const y = height(xx,zz)+.012 + rise*silhouette*fan + pleat + wrinkle;
      return [xx,y,zz];
    };
    // Split at the main ridge, preserving the hard fold between bowed wings.
    for (const [lo,hi] of [[0,peak],[peak,1]]) {
      const pos=[],uv=[],ix=[];
      for(let j=0;j<=nz;j++)for(let i=0;i<=nx/2;i++) {
        const u=lo+(hi-lo)*i/(nx/2),v=j/nz;
        pos.push(...sample(u,v));uv.push(u*width/2,v*depth/2);
        if(i<nx/2&&j<nz){const a=j*(nx/2+1)+i,b=a+nx/2+1;ix.push(a,a+1,b,a+1,b+1,b);}
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();add(g,materials.paper).name='sculpted-paper-mountain';
    }
    const rim=[],uv=[],ix=[];
    for(let i=0;i<=nx;i++){
      const p=sample(i/nx,1);rim.push(...p,p[0],p[1]-.014,p[2]-.012);uv.push(i/nx,0,i/nx,1);
      if(i<nx){const a=i*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(rim,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();add(g,materials.edge);
  }
  mountain({x:-1.65,z:-1.62,width:2.36,rise:1.62,depth:1.28,peak:.36,lean:.15,phase:.3});
  mountain({x:-1.12,z:-1.32,width:2.36,rise:1.80,depth:1.65,peak:.43,lean:-.17,phase:1.7});
  mountain({x:-.54,z:-1.24,width:1.35,rise:1.25,depth:1.34,peak:.56,lean:-.14,phase:3.2});
  mountain({x:-1.76,z:-.61,width:1.89,rise:.92,depth:1.36,peak:.24,lean:.08,phase:.8});

  const details = createStorybookDetails(THREE, materials, height); root.add(details.group);
  const target = details.pathTarget ?? {...details.doorstep, y:details.doorstep.y+.004, z:details.doorstep.z-.035};
  const pathPoints = [[-.065,2.045],[-.34,1.82],[-.32,1.46],[.38,1.10],[1.01,.79],[1.12,.48],[.61,.19],[.70,-.08],[1.20,-.34],[target.x,target.z]];
  const route = new THREE.CatmullRomCurve3(pathPoints.map(([x,z]) => new THREE.Vector3(x, 0, z)));
  const pathPositions = [], pathUV = [], pathIndices = [], steps = 220, across = 8;
  const p = new THREE.Vector3(), tangent = new THREE.Vector3();
  for (let j = 0; j <= steps; j++) {
    const t = j / steps; route.getPoint(t, p); route.getTangent(t, tangent);
    // A constant-width carriageway rests on the page, with no fabric banking or curl.
    const width = .30;
    for (let k = 0; k <= across; k++) {
      const side = (k / across - .5) * width;
      const x = p.x - tangent.z * side, z = p.z + tangent.x * side;
      const crown = .002 * Math.sin(k / across * Math.PI);
      const restingY = height(x,z) + .014 + crown;
      const arrival = THREE.MathUtils.smoothstep(t, .87, 1);
      const y = THREE.MathUtils.lerp(restingY, target.y + crown, arrival);
      pathPositions.push(x,y,z); pathUV.push(t * 9, k / across);
      if (j < steps && k < across) { const a = j * (across + 1) + k; pathIndices.push(a,a+1,a+across+1,a+1,a+across+2,a+across+1); }
    }
  }
  function roadSurface(pos,uv,ix,name,material=materials.cobalt) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    geometry.setIndex(ix);geometry.computeVertexNormals();
    add(geometry,material).name=name;
  }
  roadSurface(pathPositions,pathUV,pathIndices,'blue-road-home');
  const underside=pathPositions.map((n,i)=>i%3===1?n-.005:n);
  const reverse=[];for(let i=0;i<pathIndices.length;i+=3)reverse.push(pathIndices[i],pathIndices[i+2],pathIndices[i+1]);
  roadSurface(underside,pathUV,reverse,'roadbed-underside');
  // A thin roadbed meets the paper terrain along both edges.
  for (const edge of [0,across]) {
    const pos=[],uv=[],ix=[];
    for(let j=0;j<=steps;j++){
      const a=(j*(across+1)+edge)*3;
      pos.push(...pathPositions.slice(a,a+3),...underside.slice(a,a+3));uv.push(j/steps*9,0,j/steps*9,1);
      if(j<steps){const n=j*2;if(edge===0)ix.push(n,n+2,n+1,n+1,n+2,n+3);else ix.push(n,n+1,n+2,n+1,n+3,n+2);}
    }
    roadSurface(pos,uv,ix,'roadbed-edge');
  }

  // Paint follows the exact road mesh. Pale shoulders and dashed centre markings
  // distinguish a walkable road from a loose strip of fabric at every camera angle.
  function roadStrip(lo,hi,lift,material,name,dashed=false){
    const pos=[],uv=[],ix=[];
    for(let j=0;j<=steps;j++){
      for(const f of [lo,hi]){
        const k=f*across, a=Math.min(across-1,Math.floor(k)), blend=k-a;
        const i=(j*(across+1)+a)*3;
        pos.push(...[0,1,2].map(c=>THREE.MathUtils.lerp(pathPositions[i+c],pathPositions[i+3+c],blend)+(c===1?lift:0)));
        uv.push(j/steps,f);
      }
      if(j<steps&&(!dashed||j%9<4)){const n=j*2;ix.push(n,n+1,n+2,n+1,n+3,n+2);}
    }
    roadSurface(pos,uv,ix,name,material);
  }
  roadStrip(0,.065,.008,materials.curb,'left-road-shoulder');
  roadStrip(.935,1,.008,materials.curb,'right-road-shoulder');
  roadStrip(.11,.135,.003,materials.roadPaint,'left-road-edge-line');
  roadStrip(.865,.89,.003,materials.roadPaint,'right-road-edge-line');
  roadStrip(.477,.523,.003,materials.roadPaint,'dashed-road-centreline',true);

  // Retain articulated parts; merge everything else by material with UVs intact.
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root), center = bounds.getCenter(new THREE.Vector3());
  const offset = new THREE.Vector3(-center.x, -bounds.min.y, -center.z);
  for (const child of root.children) child.position.add(offset);
  root.updateMatrixWorld(true);
  const moving = [];
  root.traverse(object => { if (object.userData.keep && !moving.some(parent => { for(let p=object.parent;p;p=p.parent) if(p===parent)return true; return false; })) moving.push(object); });
  for (const object of moving) root.attach(object);
  for (const object of moving) root.remove(object);
  const batches = new Map(), geometries = new Set();
  root.traverse(object => {
    if (!object.isMesh) return;
    const geo = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone(); geo.applyMatrix4(object.matrixWorld);
    if (!batches.has(object.material)) batches.set(object.material,{position:[],normal:[],uv:[]});
    const b = batches.get(object.material), position = geo.getAttribute('position'), normal = geo.getAttribute('normal'), uv = geo.getAttribute('uv');
    for(let i=0;i<position.count;i++) { b.position.push(position.getX(i),position.getY(i),position.getZ(i)); b.normal.push(normal.getX(i),normal.getY(i),normal.getZ(i)); b.uv.push(uv?.getX(i)??0,uv?.getY(i)??0); }
    geo.dispose(); geometries.add(object.geometry);
  });
  root.clear(); geometries.forEach(g=>g.dispose());
  for(const [material,b] of batches) {const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(b.position,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(b.normal,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));geo.computeBoundingSphere();add(geo,material);}
  moving.forEach(object=>root.add(object));
  root.userData = { conceptual:true, artifactId:81, displayBase:false, groundLevel:0, initialYaw:-.22, initialElevation:.48, studioProfile:"paper", framingPoints: silhouettePoints(THREE, root) };
  root.userData.animate = elapsed => { const t=Number.isFinite(elapsed)?Math.max(0,elapsed):0;book.animate?.(t);details.animate?.(t); };
  root.userData.setTheme = theme => { root.userData.studioLightScale=theme==='dark'?.9:1;details.setTheme?.(theme); };
  root.userData.setTheme('light');root.userData.animate(0);
  if (!bake && typeof document !== 'undefined') applyBakedAO(THREE, root);
  // Capture only the unchanged environment for its existing AO bake. Dynamic
  // actors own their materials and are added afterwards, so the bake stays valid.
  if (!bake) {
    const sample = t => {
      const f=Math.max(0,Math.min(1,t))*steps, a=Math.min(steps-1,Math.floor(f)), blend=f-a;
      const i=(a*(across+1)+across/2)*3, j=((a+1)*(across+1)+across/2)*3;
      return new THREE.Vector3(...[0,1,2].map(k=>THREE.MathUtils.lerp(pathPositions[i+k],pathPositions[j+k],blend))).add(offset).add(new THREE.Vector3(0,.008,0));
    };
    const journey=createStorybookJourney(THREE,{sample,ground:(x,z)=>height(x-offset.x,z-offset.z)+offset.y+.012});root.add(journey.group);
    const environmentAnimate=root.userData.animate;
    Object.assign(root.userData,{autoOrbit:false,realTimeAnimation:true,cycleDuration:48,framingTargetY:1.1,restartGuidedCamera:true});
    root.userData.animate=t=>{environmentAnimate(t);root.userData.story=journey.animate(t);root.userData.cameraCue=journey.group.userData.cameraCue;};
    root.userData.animate(0);
  }
  return root;
}

// Compact, conservative silhouettes avoid fitting empty space above the page
// corners. Every vertex contributes; quantised cells are expanded outwards.
function silhouettePoints(THREE, root) {
  const bands = new Map(), cell = .055, step = .17, point = new THREE.Vector3();
  root.updateMatrixWorld(true);
  root.traverse(mesh => {
    if (!mesh.isMesh) return;
    const positions = mesh.geometry.getAttribute('position');
    for(let i=0;i<positions.count;i++) {
      point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);
      const level=Math.floor(point.y/step);
      if(!bands.has(level))bands.set(level,{min:point.y,max:point.y,cells:new Set()});
      const band=bands.get(level);band.min=Math.min(band.min,point.y);band.max=Math.max(band.max,point.y);
      band.cells.add(`${Math.floor(point.x/cell)},${Math.floor(point.z/cell)}`);
    }
  });
  const result=[];
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  for(const band of bands.values()) {
    const points=[];
    for(const key of band.cells) {
      const [ix,iz]=key.split(',').map(Number);
      for(const x of [ix*cell-.02,(ix+1)*cell+.02])for(const z of [iz*cell-.02,(iz+1)*cell+.02])points.push([x,z]);
    }
    points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    const lower=[],upper=[];
    for(const p of points){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
    for(let i=points.length-1;i>=0;i--){const p=points[i];while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
    for(const [x,z]of lower.slice(0,-1).concat(upper.slice(0,-1)))for(const y of [band.min-.025,band.max+.025])result.push(new THREE.Vector3(x,y,z));
  }
  return result;
}
