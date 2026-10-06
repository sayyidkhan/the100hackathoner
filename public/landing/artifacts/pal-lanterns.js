// Local warm lighting follows the exhibit theme; no separate animation clock.
export function addKingdomLanterns(THREE, model) {
  const fixtures=new THREE.Group();fixtures.name='kingdom-lanterns';model.add(fixtures);
  const illumination=new THREE.Group();illumination.name='kingdom-night-light';model.add(illumination);
  const brass=new THREE.MeshStandardMaterial({color:0x917044,roughness:.55,metalness:.35});
  const glass=new THREE.MeshStandardMaterial({color:0xe2c99b,roughness:.4,emissive:0xffa82f,emissiveIntensity:0});
  const windowMaterial=new THREE.MeshStandardMaterial({color:0x9b805b,roughness:.5,emissive:0xffad42,emissiveIntensity:0});
  const add=(geometry,material,x,y,z)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);fixtures.add(m);return m;};
  // Soft, camera-facing bloom without a postprocessing pass or extra renderer.
  const size=64,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const r=Math.hypot((x+.5-size/2)/(size/2),(y+.5-size/2)/(size/2));
    const i=(y*size+x)*4;data[i]=255;data[i+1]=160;data[i+2]=52;
    data[i+3]=Math.round(100*Math.pow(Math.max(0,1-r),2.4));
  }
  const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.needsUpdate=true;texture.colorSpace=THREE.SRGBColorSpace;
  const glowMaterial=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
  function glow(x,y,z,scale){const sprite=new THREE.Sprite(glowMaterial);sprite.position.set(x,y,z);sprite.scale.set(scale,scale,1);illumination.add(sprite);}
  function lantern(x,y,z){
    add(new THREE.BoxGeometry(.15,.025,.13),brass,x,y-.095,z);
    add(new THREE.ConeGeometry(.13,.09,4),brass,x,y+.13,z).rotation.y=Math.PI/4;
    add(new THREE.BoxGeometry(.105,.17,.085),glass,x,y,z);
    for(const side of [-1,1])add(new THREE.BoxGeometry(.013,.20,.013),brass,x+side*.062,y,z+.051);
    const handle=add(new THREE.TorusGeometry(.04,.009,6,16),brass,x,y+.20,z);handle.rotation.y=Math.PI/2;
    glow(x,y,z+.055,.65);
  }
  // Castle windows, tiny village windows, and useful public gathering places.
  for(const x of [-2.12,2.12]){
    add(new THREE.BoxGeometry(.085,.28,.024),windowMaterial,x,1.32,-1.158);
    glow(x,1.32,-1.12,.75);
    lantern(x,2.14,-1.53);
  }
  for(const [x,z] of [[-.24,.12],[.25,.1],[0,-.16]]){
    add(new THREE.BoxGeometry(.048,.085,.016),windowMaterial,x,1.07,z+.104);
    glow(x,1.08,z+.13,.32);
  }
  lantern(-1.88,1.09,1.53);
  lantern(2.14,1.48,1.58);
  for(const x of [-.78,.78])lantern(x,.40,2.20);
  const lights=[];
  for(const [x,y,z,power,range] of [[-2.12,1.45,-.85,2.4,3],[2.12,1.45,-.85,2.4,3],[-1.88,1.08,1.73,1.65,2.8],[0,1.62,.15,1.5,2.6],[2.14,1.4,1.7,1.4,2.5]]){
    const light=new THREE.PointLight(0xffb455,power,range,2);light.position.set(x,y,z);illumination.add(light);lights.push({light,power});
  }
  let night=false;
  model.userData.setTheme=theme=>{
    night=theme==='dark';illumination.visible=night;
    model.userData.studioLightScale=night?.28:1;
    glass.emissiveIntensity=night?2.6:0;windowMaterial.emissiveIntensity=night?2.8:0;
    windowMaterial.color.setHex(night?0xffcf83:0x9b805b);
    lights.forEach(({light,power})=>{light.intensity=night?power:0;});
  };
  model.userData.setTheme('light');
}
