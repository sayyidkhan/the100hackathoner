// Decorative in-game income, driven by the exhibit clock (never wall time).
export function createRevenue(THREE, racks) {
  const root=new THREE.Group();root.name='tycoon-revenue';
  const gold=new THREE.MeshStandardMaterial({color:0xf2bf50,metalness:.65,roughness:.3,emissive:0x9b6011,emissiveIntensity:.16});
  const stamp=new THREE.MeshStandardMaterial({color:0x795017,metalness:.4,roughness:.5});
  const coinGeometry=new THREE.CylinderGeometry(.135,.135,.036,32);
  const rimGeometry=new THREE.TorusGeometry(.109,.009,6,32);
  function label(width,height,worldWidth,worldHeight) {
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d');
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});
    const sprite=new THREE.Sprite(material);sprite.scale.set(worldWidth,worldHeight,1);root.add(sprite);
    return {sprite,context,texture,width,height};
  }
  function panel(l) {
    const c=l.context;c.clearRect(0,0,l.width,l.height);
    c.fillStyle='#17362d';c.beginPath();c.roundRect(2,2,l.width-4,l.height-4,20);c.fill();
    c.strokeStyle='#c9a352';c.lineWidth=3;c.stroke();
  }
  const total=label(640,240,2.0,.75);total.sprite.name='game-revenue-counter';total.sprite.position.set(0,.77,2.91);
  const bursts=racks.map(([x,z],i)=>{
    const coin=new THREE.Group();coin.name='income-coin-'+i;root.add(coin);
    const disc=new THREE.Mesh(coinGeometry,gold);disc.rotation.x=Math.PI/2;coin.add(disc);
    for(const side of [-1,1]){
      const rim=new THREE.Mesh(rimGeometry,gold);rim.position.z=side*.022;coin.add(rim);
      // Raised dollar mark: curved S and vertical stroke on each face.
      const points=[[-.038,.046],[.029,.053],[.041,.028],[-.025,.002],[-.036,-.029],[.031,-.052]].map(([a,b])=>new THREE.Vector3(a,b,side*.025));
      const curve=new THREE.CatmullRomCurve3(points);
      const s=new THREE.Mesh(new THREE.TubeGeometry(curve,20,.010,6,false),stamp);coin.add(s);
      const bar=new THREE.Mesh(new THREE.BoxGeometry(.010,.143,.009),stamp);bar.position.z=side*.03;coin.add(bar);
    }
    const pop=label(384,112,.88,.257);pop.sprite.name='income-amount-'+i;
    panel(pop);pop.context.fillStyle='#ffe19a';pop.context.font='bold 60px system-ui, sans-serif';pop.context.textAlign='center';pop.context.textBaseline='middle';pop.context.fillText('+$20.00',192,59);pop.texture.needsUpdate=true;
    return {coin,pop,x,z};
  });
  let lastTick=-1;
  const formatter=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2});
  root.userData.animate=elapsed=>{
    const t=Math.max(0,elapsed);
    // Source economy: six server racks at $20/s each. Tenths keep uploads bounded.
    const cents=Math.floor(t*12000),tick=Math.floor(t*10);
    root.userData.earnedCents=cents;
    if(tick!==lastTick) {
      lastTick=tick;panel(total);const c=total.context;
      c.textAlign='center';c.textBaseline='middle';
      c.fillStyle='#b7d2c4';c.font='600 25px system-ui, sans-serif';c.fillText('GAME REVENUE',320,43);
      c.fillStyle='#ffe19a';const amount=formatter.format(cents/100);
      c.font='bold 76px system-ui, sans-serif';const width=c.measureText(amount).width;if(width>584)c.font=`bold ${76*584/width}px system-ui, sans-serif`;
      c.fillText(amount,320,121);
      c.font='500 28px system-ui, sans-serif';c.fillStyle='#b7d2c4';c.fillText('6 racks  ·  $120.00 / sec',320,195);total.texture.needsUpdate=true;
    }
    bursts.forEach(({coin,pop,x,z},i)=>{
      const age=(t+i*.6)%3.6,life=1.45,active=age<life,p=Math.min(age/life,1);
      const appear=Math.min(1,age/.12),fade=1-THREE.MathUtils.smoothstep(age,1.05,life);
      coin.visible=pop.sprite.visible=active;
      coin.position.set(x+Math.sin(p*Math.PI)*.12,2.02+p*.82,z);
      coin.rotation.set(.12,age*5,Math.sin(age*3)*.12);coin.scale.setScalar(Math.max(0,appear*fade));
      pop.sprite.position.set(x,2.43+p*.80,z+.03);
      pop.sprite.material.opacity=Math.max(0,appear*fade);
    });
  };
  root.userData.setTheme=theme=>{gold.emissiveIntensity=theme==='dark'?.35:.16;};
  root.userData.animate(0);
  return root;
}
