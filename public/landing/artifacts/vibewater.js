// Vibewater's prompt → visual rules → backtest workflow, represented as a paper atelier.
// Sources: frontend/components/StrategyBuilder.tsx, PROJECT_README.md, Instagram DP-pSUWjPCS.
// Chart data below is a deterministic illustration, not a historical performance claim.
export function createArtifact(T) {
  const root=new T.Group();
  const routes=[],nodes=[],dots=[];
  const mat=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness,side:T.DoubleSide});
  const m={paper:mat(0xf0e2c8,.87),ivory:mat(0xfff3dc,.82),edge:mat(0xd3bd98,.8),blue:mat(0x16466d,.42,.2),navy:mat(0x173958,.9),red:mat(0xae3429,.62),gold:mat(0xbca073,.3,.65),ink:mat(0x334c5b,.65),page:mat(0xfaf2df,.94)};
  let seed=44;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=256;const gc=grainCanvas.getContext('2d'),gd=gc.createImageData(256,256);
  for(let i=0;i<gd.data.length;i+=4){const v=110+random()*80;gd.data.set([v,v,v,255],i);}gc.putImageData(gd,0,0);
  const grain=new T.CanvasTexture(grainCanvas);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(4,4);
  for(const key of ['paper','ivory','edge','red','navy','page']){m[key].bumpMap=grain;m[key].bumpScale=key==='navy'?.005:.003;}
  function group(x=0,y=0,z=0,parent=root){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
  function mesh(geometry,material,parent=root){const o=new T.Mesh(geometry,typeof material==='string'?m[material]:material);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function box(w,h,d,x,y,z,material,parent=root){const o=mesh(new T.BoxGeometry(w,h,d),material,parent);o.position.set(x,y,z);return o;}
  function rounded(w,h,d,x,y,z,material,parent=root,r=.055){
    const s=new T.Shape();r=Math.min(r,w/2,h/2);s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:3,curveSegments:12}),material,parent);o.position.set(x,y,z);return o;
  }
  function poly(points,depth,material,parent=root){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2}),material,parent);}
  function ball(r,x,y,z,material,parent=root){const o=mesh(new T.SphereGeometry(r,20,14),material,parent);o.position.set(x,y,z);return o;}
  function cylinder(r,h,x,y,z,material,parent=root){const o=mesh(new T.CylinderGeometry(r,r,h,48),material,parent);o.position.set(x,y,z);return o;}
  function tube(points,r,material,parent=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,8,false),material,parent);}
  function label(copy,x,y,z,w,color='#53616a',parent=root){
    const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='500 105px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(copy,512,80,900);
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,w*160/1024),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:T.DoubleSide}),parent);o.position.set(x,y,z);o.userData.noShadow=true;return o;
  }
  // The reference's blue desk inlay replaces the oversized shared display disk.
  const base=rounded(6.1,3.3,.16,0,.08,0,'paper',root,.12);base.rotation.x=-Math.PI/2;
  const inlay=rounded(5.77,2.97,.012,0,.258,0,'navy',root,.07);inlay.rotation.x=-Math.PI/2;
  const board=group(-1.44,.28,-.52);board.rotation.x=-.19;
  rounded(2.67,2.55,.12,0,1.275,-.08,'paper',board,.1);
  rounded(2.53,2.41,.012,0,1.275,.055,'ivory',board,.07);
  // Two triangular easel supports, visible when the user orbits the desk.
  for(const x of [-1.02,1.02]){const support=poly([[0,0],[-.61,0],[0,2.22]],.08,'edge',board);support.rotation.y=-Math.PI/2;support.position.set(x,0,-.12);}
  label('STRATEGY RULES',.68,2.35,.09,1.05,'#7b7261',board);
  const bubble=group(-.59,2.74,.13,board);
  rounded(1.42,.83,.12,0,0,0,'red',bubble,.17);
  const tail=poly([[-.48,-.35],[-.48,-.64],[-.15,-.35]],.11,'red',bubble);
  tail.position.z=.005;
  for(let i=0;i<3;i++){const dot=cylinder(.064,.028,-.29+i*.29,0,.151,'ivory',bubble);dot.rotation.x=Math.PI/2;dots.push(dot);}
  // A small folded paper message bridges the chat and the first strategy node.
  const stripPoints=[[0,0,0],[0,-.12,.08],[0,-.22,.16],[0,-.36,.16],[0,-.45,.24]];
  const stripCurve=new T.CatmullRomCurve3(stripPoints.map(p=>new T.Vector3(...p))),sp=[],suv=[],si=[];
  for(let i=0;i<=32;i++){const p=stripCurve.getPoint(i/32);for(const sign of [-1,1]){sp.push(p.x+sign*.19,p.y,p.z);suv.push((sign+1)/2,i/32);}if(i<32){const j=i*2;si.push(j,j+1,j+2,j+1,j+3,j+2);}}
  const stripGeo=new T.BufferGeometry();stripGeo.setAttribute('position',new T.Float32BufferAttribute(sp,3));stripGeo.setAttribute('uv',new T.Float32BufferAttribute(suv,2));stripGeo.setIndex(si);stripGeo.computeVertexNormals();const strip=mesh(stripGeo,'page',board);strip.position.set(-.45,2.43,.26);
  function route(points,material='blue'){
    const path=new T.CurvePath();const radius=.08;const v=points.map(p=>new T.Vector3(p[0],p[1],0));let last=v[0];
    for(let i=1;i<v.length-1;i++){const a=v[i].clone().lerp(v[i-1],Math.min(radius/v[i].distanceTo(v[i-1]),.45));const b=v[i].clone().lerp(v[i+1],Math.min(radius/v[i].distanceTo(v[i+1]),.45));path.add(new T.LineCurve3(last,a));path.add(new T.QuadraticBezierCurve3(a,v[i],b));last=b;}path.add(new T.LineCurve3(last,v.at(-1)));
    const o=mesh(new T.TubeGeometry(path,64,.031,8,false),material,board);o.position.z=.093;o.scale.z=.38;
    const end=v.at(-1),d=end.clone().sub(v.at(-2)).normalize();const tip=poly([[0,.09],[-.075,-.035],[.075,-.035]],.016,material,board);tip.rotation.z=Math.atan2(-d.x,d.y);tip.position.set(end.x,end.y,.093);
    const pulse=ball(.037,v[0].x,v[0].y,.128,'gold',board);routes.push({path,pulse});
  }
  route([[-.38,1.9],[-.38,1.5],[0,1.5]]);
  route([[0,1.47],[-.85,1.47],[-.85,1.08]]);
  route([[.18,1.47],[.83,1.47],[.83,1.08]]);
  route([[-.85,.67],[-.85,.36],[-.48,.36]]);
  route([[.83,.67],[.83,.36],[.48,.36]]);
  const definitions=[[-.38,2.02,.8,.34,'STRATEGY'],[0,1.48,.48,.48,'ENTRY'],[-.85,.82,.73,.36,'TARGET'],[.83,.82,.73,.36,'STOP LOSS'],[0,.36,.78,.35,'CAPITAL']];
  for(let i=0;i<definitions.length;i++){
    const [x,y,w,h,copy]=definitions[i],g=group(x,y,.125,board);
    const edgeMaterial=m[i===3?'red':'blue'].clone();edgeMaterial.emissive=new T.Color(i===3?0xa32b20:0x216595);edgeMaterial.emissiveIntensity=0;
    const plinth=rounded(w+.025,h+.025,.018,0,0,0,edgeMaterial,g,.025);const card=rounded(w,h,.065,0,0,.019,'ivory',g,.025);
    if(i===1){plinth.rotation.z=card.rotation.z=Math.PI/4;}
    label(copy,0,i===0?-.095:0,.104,w*.83,'#405264',g);nodes.push({g,edgeMaterial});
  }
  // Chart card and its stepped, paper-built stand.
  rounded(2.68,.42,.72,1.51,.47,-.18,'paper',root,.035);
  rounded(2.49,.13,.62,1.51,.74,-.23,'ivory',root,.035);
  const chartGroup=group(1.45,.82,-.71);chartGroup.rotation.x=-.055;
  rounded(2.54,1.91,.11,0,.955,-.04,'paper',chartGroup,.045);
  rounded(2.4,1.76,.012,0,.955,.079,'ivory',chartGroup,.035);
  label('HISTORICAL BACKTEST',0,1.73,.106,1.75,'#6a6f6b',chartGroup);
  const chartCanvas=document.createElement('canvas');chartCanvas.width=1024;chartCanvas.height=640;
  const ctx=chartCanvas.getContext('2d');
  const values=[.42,.50,.61,.53,.66,.74,.68,.79,.64,.72,.58,.63,.43,.49,.55,.46,.64,.56,.61,.41,.44,.31,.36,.27,.17,.29,.34,.43,.36,.51,.43,.55,.49,.63,.58,.71,.66,.75,.7,.81];
  const px=i=>50+i/(values.length-1)*924,py=v=>565-v*475;
  ctx.fillStyle='#efe7d6';ctx.fillRect(0,0,1024,640);ctx.strokeStyle='#c6c2b744';ctx.lineWidth=2;
  for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(50,70+i*99);ctx.lineTo(974,70+i*99);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(50,565);values.forEach((v,i)=>ctx.lineTo(px(i),py(v)));ctx.lineTo(974,565);ctx.closePath();const fill=ctx.createLinearGradient(0,80,0,565);fill.addColorStop(0,'#84a9b775');fill.addColorStop(1,'#afc3c92a');ctx.fillStyle=fill;ctx.fill();
  ctx.beginPath();values.forEach((v,i)=>i?ctx.lineTo(px(i),py(v)):ctx.moveTo(px(i),py(v)));ctx.strokeStyle='#16456b';ctx.lineWidth=11;ctx.lineJoin='round';ctx.stroke();
  const marker=20;ctx.setLineDash([12,10]);ctx.strokeStyle='#ac3b2d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(px(marker),py(values[marker]));ctx.lineTo(px(marker),565);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#b73d2b';ctx.beginPath();ctx.arc(px(marker),py(values[marker]),12,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#7b807e';ctx.font='22px Georgia';ctx.fillText('ILLUSTRATIVE SIMULATION',50,615);
  const chartMap=new T.CanvasTexture(chartCanvas);chartMap.colorSpace=T.SRGBColorSpace;chartMap.anisotropy=4;
  const chartMat=new T.MeshStandardMaterial({map:chartMap,roughness:.83,side:T.DoubleSide});const chart=mesh(new T.PlaneGeometry(2.21,1.38),chartMat,chartGroup);chart.position.set(0,.9,.111);
  // The lens samples the same chart, so its enlargement remains correct as it moves.
  const lens=group(.63,.91,.235,chartGroup);const lensRadius=.49;
  const ring=mesh(new T.TorusGeometry(lensRadius,.058,16,96),'blue',lens);
  const inner=mesh(new T.TorusGeometry(lensRadius-.065,.009,8,96),'gold',lens);inner.position.z=.018;
  const handle=rounded(.14,.73,.08,.45,-.62,-.015,'blue',lens,.065);handle.rotation.z=.58;
  const collar=rounded(.19,.12,.1,.29,-.37,-.02,'gold',lens,.02);collar.rotation.z=.58;
  const lensCanvas=document.createElement('canvas');lensCanvas.width=lensCanvas.height=512;const lc=lensCanvas.getContext('2d');const lensMap=new T.CanvasTexture(lensCanvas);lensMap.colorSpace=T.SRGBColorSpace;
  const lensImage=mesh(new T.CircleGeometry(lensRadius-.06,96),new T.MeshStandardMaterial({map:lensMap,roughness:.3,metalness:.02,side:T.DoubleSide}),lens);lensImage.position.z=.016;
  const glass=mesh(new T.CircleGeometry(lensRadius-.06,96),new T.MeshPhysicalMaterial({color:0xd9eef2,roughness:.1,metalness:.1,transparent:true,opacity:.09,depthWrite:false,side:T.DoubleSide,clearcoat:1}),lens);glass.position.z=.021;glass.userData.noShadow=true;
  // This is a mapped illustration, so suppress its solid circular shadow on the chart.
  lensImage.userData.noShadow=true;
  const reflection=tube([[-.36,.14,.028],[-.3,.28,.028],[-.19,.36,.028]],.008,'ivory',lens);reflection.userData.noShadow=true;
  const calendarTabs=[];
  for(let i=0;i<4;i++){
    const g=group(.55+i*.56,.82,.3);g.rotation.x=-.16;
    rounded(.45,.49,.055,0,.245,0,'ivory',g,.025);const tab=rounded(.34,.085,.025,0,.445,.061,i===2?'red':'blue',g,.012);calendarTabs.push(tab);
    for(const x of [-.115,.115]){const loop=mesh(new T.TorusGeometry(.021,.006,6,16),'gold',g);loop.position.set(x,.47,.087);}
    for(let r=0;r<4;r++)for(let c=0;c<5;c++)box(.036,.036,.008,-.135+c*.067,.12+r*.066,.086,(r===2&&c===2&&i===2)?'red':'edge',g);
  }
  // Open archive tray: actual folder silhouettes, pages, staggered tabs and dividers.
  const archive=group(-1.35,.27,1.15);archive.scale.y=.88;
  box(2.63,.07,.91,0,.035,0,'paper',archive);box(2.63,.38,.075,0,.23,.43,'paper',archive);box(2.63,.33,.065,0,.205,-.43,'paper',archive);
  for(const x of [-1.28,1.28])box(.07,.4,.85,x,.25,0,'paper',archive);
  for(let i=0;i<3;i++){
    const x=-.83+i*.83;
    for(let row=0;row<2;row++){
      const g=group(x,.11,-.21+row*.32,archive);g.rotation.x=-.04;
      for(const z of [-.04,0,.04])rounded(.69,.62,.012,0,.39,z,'page',g,.018);
      const folder=poly([[-.36,.02],[.36,.02],[.36,.63],[.28,.68],[.1,.68],[.02,.76],[-.29,.76],[-.36,.69]],.023,'ivory',g);folder.position.z=.072;
      rounded(.22,.11,.022,.18,.665,.061,(i===1&&row===1)?'red':'blue',g,.024);
      if(row===1)label(['MOMENTUM','REVERSION','LONG / SHORT'][i],0,.5,.106,.59,'#7d7a6d',g);
    }
  }
  label('STRATEGY ARCHIVE',0,.23,.473,1.8,'#777568',archive);
  // Hollow pencil cup and three lacquered pencils.
  const cup=group(2.67,.27,.93);const cupWall=mesh(new T.CylinderGeometry(.22,.2,.46,48,1,true),'paper',cup);cupWall.position.y=.23;cylinder(.2,.035,0,.035,0,'edge',cup);
  const rim=mesh(new T.TorusGeometry(.213,.018,10,48),'ivory',cup);rim.rotation.x=Math.PI/2;rim.position.y=.46;
  for(let i=0;i<3;i++){const pen=group(-.1+i*.1,.25,0,cup);pen.rotation.z=(i-1)*.18;const shaft=cylinder(.033,.59,0,.3,0,['blue','red','ivory'][i],pen);const point=mesh(new T.ConeGeometry(.033,.1,12),'edge',pen);point.position.y=.645;ball(.009,0,.696,0,'ink',pen);}
  root.updateMatrixWorld(true);
  const framingPoints=[];root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=3)framingPoints.push(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));});
  Object.assign(root.userData,{artifactId:44,conceptual:true,displayBase:false,studioProfile:'vibewater',groundLevel:0,framingPoints,initialYaw:-.22,initialElevation:.34,autoOrbit:false});
  let lastLensX=NaN,lastLensY=NaN;
  root.userData.animate=time=>{
    const phase=time%12;
    dots.forEach((dot,i)=>{dot.position.y=Math.sin(time*3-i*.9)*.018;});
    routes.forEach(({path,pulse},i)=>{const p=((phase-i*.55)/4);pulse.visible=p>=0&&p<=1;if(pulse.visible){const point=path.getPoint(p);pulse.position.set(point.x,point.y,.145);}});
    nodes.forEach(({edgeMaterial},i)=>{const active=Math.max(0,1-Math.abs(phase-(1+i*.65))/.6);edgeMaterial.emissiveIntensity=active*.6;});
    const scan=.5-.5*Math.cos(time*.5);lens.position.x=.28+scan*.42;lens.position.y=.9+Math.sin(time*.5)*.09;
    if(!Number.isFinite(lastLensX)||Math.abs(lens.position.x-lastLensX)>.002||Math.abs(lens.position.y-lastLensY)>.002){
      const magnification=1.5,diameter=(lensRadius-.06)*2;
      const sourceW=diameter/2.21*1024/magnification,sourceH=diameter/1.38*640/magnification;
      const cx=(lens.position.x/2.21+.5)*1024,cy=(.5-(lens.position.y-.9)/1.38)*640;
      lc.clearRect(0,0,512,512);lc.drawImage(chartCanvas,cx-sourceW/2,cy-sourceH/2,sourceW,sourceH,0,0,512,512);lensMap.needsUpdate=true;lastLensX=lens.position.x;lastLensY=lens.position.y;
    }
  };
  root.userData.animate(0);
  return root;
}
