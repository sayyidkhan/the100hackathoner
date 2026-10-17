// Small, deterministic modeling kit for the Pal miniature. Textures are generated
// locally; rigid details are merged per material without losing UVs or color.
export function createWorkshop(THREE) {
  const root = new THREE.Group();
  let seed = 71;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const palette = {
    stone: 0xd7c4a2, pale: 0xe9d9bc, mortar: 0xa18f71, wood: 0x88603a,
    honey: 0xb78b50, darkwood: 0x543b29, cream: 0xf2e4c9, skin: 0xe7b184,
    rose: 0xc78065, beard: 0xe6dfcc, ink: 0x292624, navy: 0x29445d,
    red: 0xa33e32, green: 0x566344, olive: 0x707a48, leaf: 0x43543a,
    gold: 0xc6a15d, steel: 0x909a99, water: 0x477e88, roof: 0xad5840,
  };
  function surface(kind) {
    const n = 128, data = new Uint8Array(n * n * 4);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const grain = kind === 'wood' ? Math.sin(y * .8 + Math.sin(x * .055) * 3) * 19
        : kind === 'cloth' ? ((x % 3 === 0 ? -1 : 1) + (y % 3 === 0 ? -1 : 1)) * 9 : 0;
      const value = Math.round(177 + grain + random() * 65);
      const i = (y * n + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = value; data[i + 3] = 255;
    }
    const texture = new THREE.DataTexture(data, n, n);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true; texture.needsUpdate = true;
    return texture;
  }
  const stoneTexture = surface('stone'), woodTexture = surface('wood'), clothTexture = surface('cloth');
  const make = options => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85, ...options });
  const materials = {
    stone: make({ bumpMap: stoneTexture, bumpScale: .018 }),
    wood: make({ bumpMap: woodTexture, bumpScale: .012, roughness: .74 }),
    cloth: make({ bumpMap: clothTexture, bumpScale: .002, side: THREE.DoubleSide }),
    clay: make({ roughness: .68 }),
    skin: make({ roughness: .68 }),
    hair: make({ roughness: .93 }),
    eye: make({ roughness: .3 }),
    metal: make({ metalness: .65, roughness: .39 }),
    water: make({ roughness: .23, metalness: .32 }),
  };
  function mesh(geometry, color = 'pale', parent = root, kind = 'clay') {
    const m = new THREE.Mesh(geometry, materials[kind]);
    m.userData.tint = new THREE.Color(palette[color] ?? color);
    m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  }
  function box(w, h, d, x, y, z, color = 'pale', parent = root, kind = 'stone', bevel = .012) {
    const r = Math.min(bevel, w / 5, h / 5, d / 5);
    const s = new THREE.Shape();
    s.moveTo(-w/2+r,-h/2+r);s.lineTo(w/2-r,-h/2+r);s.lineTo(w/2-r,h/2-r);s.lineTo(-w/2+r,h/2-r);s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: d-2*r, bevelEnabled: true, bevelThickness:r, bevelSize:r, bevelSegments:1, steps:1, curveSegments:1 });
    geo.translate(0,0,-d/2+r);
    const m=mesh(geo,color,parent,kind);m.position.set(x,y,z);return m;
  }
  function ball(r,x,y,z,color='pale',parent=root,kind='clay',segments=12) {
    const m=mesh(new THREE.SphereGeometry(r,segments,8),color,parent,kind);m.position.set(x,y,z);return m;
  }
  function disk(r,h,x,y,z,color='pale',parent=root,kind='stone',segments=40) {
    const m=mesh(new THREE.CylinderGeometry(r,r,h,segments),color,parent,kind);m.position.set(x,y,z);return m;
  }
  function line(points,r=.015,color='gold',parent=root,kind='clay') {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(8,points.length*5),r,6,false),color,parent,kind);
  }
  function ring(r,t,x,y,z,color='gold',parent=root,kind='metal') {
    const m=mesh(new THREE.TorusGeometry(r,t,6,40),color,parent,kind);m.rotation.x=Math.PI/2;m.position.set(x,y,z);return m;
  }
  // Merge only direct mesh children. Nested named joints keep their transforms,
  // while all the face, garment, and prop details share a handful of draw calls.
  function batch(group) {
    for(const child of [...group.children]) if(child.isGroup) batch(child);
    const batches=new Map();
    for(const object of [...group.children]) {
      if(!object.isMesh)continue;
      object.updateMatrix();
      const geometry=object.geometry.clone();
      geometry.applyMatrix4(object.matrix);
      const key=object.material.uuid;
      if(!batches.has(key))batches.set(key,{material:object.material,position:[],normal:[],uv:[],color:[],indices:[]});
      const b=batches.get(key),p=geometry.attributes.position,n=geometry.attributes.normal,u=geometry.attributes.uv;
      const tint=object.userData.tint ?? new THREE.Color(0xffffff);
      const offset=b.position.length/3;
      for(let i=0;i<(geometry.index?.count??p.count);i++)b.indices.push(offset+(geometry.index?geometry.index.getX(i):i));
      for(let i=0;i<p.count;i++) {
        b.position.push(p.getX(i),p.getY(i),p.getZ(i));b.normal.push(n.getX(i),n.getY(i),n.getZ(i));
        b.uv.push(u?.getX(i)??0,u?.getY(i)??0);
        const c=geometry.attributes.color;
        b.color.push(tint.r*(c?.getX(i)??1),tint.g*(c?.getY(i)??1),tint.b*(c?.getZ(i)??1));
      }
      geometry.dispose();object.geometry.dispose();group.remove(object);
    }
    for(const b of batches.values()) {
      const geo=new THREE.BufferGeometry();
      for(const [key,size]of [['position',3],['normal',3],['uv',2],['color',3]])geo.setAttribute(key,new THREE.Float32BufferAttribute(b[key],size));
      geo.setIndex(b.indices);
      geo.computeBoundingBox();geo.computeBoundingSphere();
      const m=new THREE.Mesh(geo,b.material);m.castShadow=true;
      // Fine two-sided fabric folds use their baked contact shading. Sampling
      // their own shadow map causes moiré at the exhibit's small display scale.
      const face=[materials.skin,materials.hair,materials.eye].includes(b.material);
      m.userData.noReceiveShadow=b.material===materials.cloth||face;
      m.userData.contactShadeStrength=b.material===materials.eye?0:face?.20:.54;
      m.receiveShadow=!m.userData.noReceiveShadow;group.add(m);
    }
  }
  return {THREE,root,random,palette,materials,mesh,box,ball,disk,line,ring,batch};
}
