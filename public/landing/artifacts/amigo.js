import { earlyStudio, ease } from './early-exhibit-studio.js';
import { amigoLand } from './amigo-land.js';

// Amigo: the reciprocal conversation becomes a word saved for later practice.
// A source-grounded conceptual exhibit, not a running translation/video service.
export function createArtifact(T) {
  const k = earlyStudio(T);
  const { root, m, mesh, box, disk, ball, line, group, rounded, slab, ring, finish, texture } = k;
  for (const [name,color,roughness,metalness] of [
    ['rust',0xb64d2e,.49,0],['teal',0x145254,.44,.08],['walnut',0x513622,.72,0],
    ['page',0xe7dac0,.85,0],['globeGold',0xc5a05e,.5,.3],['screen',0xf2e8d4,.78,0]
  ]) m[name] = new T.MeshStandardMaterial({color,roughness,metalness});
  for(const name of ['rust','teal','page','screen']) {m[name].bumpMap=texture(name==='page'?'cloth':'stone');m[name].bumpScale=.008;}
  m.walnut.bumpMap=texture('wood');m.walnut.bumpScale=.019;

  const labels=[];
  function text(value,w,x,y,z,parent=root,color='#dec08b'){
    const label=group(x,y,z,parent);cardText(T,value,w,0,0,0,label,color);labels.push(label);return label;
  }

  // Continuous stone foundation and brass seam, matching the artwork silhouette.
  slab(6.6,3.7,.29,0,.145,0,'stone',root,.36);
  slab(6.61,3.71,.022,0,.175,0,'brass',root,.36);
  rounded(1.73,.27,.025,0,.15,1.872,'brass');
  rounded(1.63,.20,.02,0,.15,1.895,'walnut');
  text('A M I G O',1.23,0,.15,1.931);
  for(const x of [-.75,.75]) {const s=disk(.024,.015,x,.15,1.91,'brass');s.rotation.x=Math.PI/2;}

  const waveforms=[];
  function terminal(x,color,yaw,word) {
    const g=group(x,.31,-.63);g.rotation.y=yaw;
    slab(1.58,.77,.10,0,.05,0,'brass',g,.15);
    for(const sx of [-.64,.64]) {
      line([[sx,.09,.22],[sx,.55,.06],[sx,.70,-.01]],.037,'brass',g);
      const pivot=disk(.10,.075,sx,.70,0,'brass',g);pivot.rotation.z=Math.PI/2;
    }
    rounded(1.47,2.60,.18,0,1.49,0,'brass',g,.22);
    rounded(1.40,2.53,.20,0,1.49,.018,color,g,.20);
    rounded(1.24,1.93,.025,0,1.38,.136,'brass',g,.18);
    rounded(1.17,1.85,.03,0,1.38,.158,'screen',g,.17);
    const cam=disk(.070,.014,-.10,2.58,.151,'black',g);cam.rotation.x=Math.PI/2;
    ring(.080,.011,-.10,2.58,.169,'brass',g);
    for(let row=0;row<3;row++)for(let col=0;col<3;col++) {
      const dot=disk(.013,.009,.28+col*.055,2.53+row*.055,.155,'dark',g);dot.rotation.x=Math.PI/2;
    }
    for(let i=0;i<2;i++) rounded(.035,.19,.08,-.736,1.86-i*.35,0,'brass',g,.015);
    const waves=group(0,1.63,.195,g);
    for(let i=0;i<11;i++) {
      const h=.06+.43*Math.exp(-Math.pow((i-5)/2.7,2));
      rounded(.031,h,.02,(i-5)*.075,0,0,'brass',waves,.014);
    }
    waveforms.push(waves);
    rounded(.79,.37,.038,0,.91,.207,'cream',g,.14);
    const tail=new T.Shape();tail.moveTo(-.25,-.03);tail.lineTo(-.34,-.16);tail.lineTo(-.12,-.03);tail.closePath();
    const t=mesh(new T.ExtrudeGeometry(tail,{depth:.035,bevelEnabled:true,bevelThickness:.01,bevelSize:.01,bevelSegments:2}),'cream',g);t.position.set(0,.77,.19);
    text(word,.57,0,.91,.239,g,'#453622');
    // The frame has a back panel and vents, so orbiting is deliberate too.
    rounded(1.14,1.9,.014,0,1.47,-.112,color,g,.15);
    for(let i=0;i<8;i++)box(.43,.017,.01,0,.75+i*.061,-.124,'dark',g);
    return g;
  }
  terminal(-2.17,'rust',.12,'Hello'); terminal(2.17,'teal',-.12,'Hola');

  // A geographical globe rather than an anonymous sphere. Map pixels are
  // deterministic and generated locally; no external texture/CDN dependency.
  const globe=group(0,1.64,-.52);globe.rotation.z=-.22;
  const globeSurface=ball(.89,0,0,0,'teal',globe);
  const map=globeMap(T);const globeMaterial=m.teal.clone();globeMaterial.color.setHex(0xffffff);globeMaterial.map=map;globeSurface.material=globeMaterial;
  for(let latitude=-60;latitude<=60;latitude+=30) {
    const a=latitude*Math.PI/180;
    const r=ring(.893*Math.cos(a),.004,0,.893*Math.sin(a),0,'brass',globe);r.rotation.x=Math.PI/2;
  }
  for(let longitude=0;longitude<180;longitude+=30){const r=ring(.895,.004,0,0,0,'brass',globe);r.rotation.y=longitude*Math.PI/180;}
  ring(.98,.037,0,0,0,'brass',globe);
  for(const s of [-1,1])ball(.07,0,s*.99,0,'brass',globe);
  disk(.43,.08,0,.35,-.52,'brass');disk(.35,.06,0,.42,-.52,'brass');
  const stand=mesh(new T.LatheGeometry([new T.Vector2(.28,0),new T.Vector2(.24,.04),new T.Vector2(.14,.10),new T.Vector2(.095,.24),new T.Vector2(.13,.30)],64),'brass');stand.position.set(0,.45,-.52);
  line([[-.21,.75,-.52],[-.19,.68,-.52],[0,.63,-.52]],.035,'brass');

  // Two distinct paths allow the greeting and its reply to take turns.
  const outbound=new T.CatmullRomCurve3([new T.Vector3(-1.64,2.52,-.56),new T.Vector3(-.75,3.13,-.74),new T.Vector3(.58,3.17,-.74),new T.Vector3(1.64,2.60,-.56)]);
  const inbound=new T.CatmullRomCurve3([new T.Vector3(1.64,2.49,-.65),new T.Vector3(.55,2.98,-.86),new T.Vector3(-.66,3.00,-.86),new T.Vector3(-1.64,2.42,-.65)]);
  mesh(new T.TubeGeometry(outbound,90,.014,8,false),'brass');
  mesh(new T.TubeGeometry(inbound,90,.010,8,false),'brass');
  function message(color) {
    const g=group();ball(.105,0,0,0,color,g);
    for(let i=-1;i<=1;i++)ball(.012,i*.039,0,.101,'cream',g);
    return g;
  }
  const greeting=message('rust'),reply=message('teal');

  // Phrasebooks: layered paper, wrapped linen covers and spine tooling.
  const books=group(-2.04,.31,.88);books.rotation.y=.10;
  for(let i=0;i<2;i++) {
    const y=i*.27;
    slab(1.65,.87,.035,0,y+.02,0,i?'rust':'teal',books,.07);
    slab(1.55,.80,.18,.025,y+.13,0,'page',books,.035);
    slab(1.65,.87,.035,0,y+.24,0,i?'rust':'teal',books,.07);
    rounded(1.65,.26,.065,0,y+.13,.42,i?'rust':'teal',books,.035);
    for(let n=0;n<8;n++)box(.011,.01,.72,-.76,y+.055+n*.02,0,'shade',books);
    text(i?'ENGLISH':'ESPAÑOL',1.0,0,y+.13,.48,books,'#dec08b');
    for(const sx of [-.64,.64])box(.017,.20,.009,sx,y+.13,.46,'brass',books);
  }
  const pencil=group(-1.66,.36,1.51);pencil.rotation.z=Math.PI/2;pencil.rotation.y=-.09;
  mesh(new T.CylinderGeometry(.028,.028,.95,16),'walnut',pencil);
  for(const y of [-.44,.23,.31]){const band=mesh(new T.CylinderGeometry(.035,.035,.065,32),'brass',pencil);band.position.y=y;}
  const nib=mesh(new T.ConeGeometry(.029,.16,24),'brass',pencil);nib.position.y=.55;
  const badge=disk(.22,.035,-.62,.35,1.36,'brass');badge.rotation.x=.12;
  const ear=group(-.62,.38,1.36);ear.rotation.x=-Math.PI/2;
  line([[-.06,-.06,0],[-.085,.04,0],[-.04,.10,0],[.04,.10,0],[.075,.035,0],[.025,-.035,0],[.025,-.10,0],[-.025,-.11,0]],.012,'walnut',ear);

  const tray=group(1.91,.31,1.00);tray.rotation.y=-.09;
  slab(1.90,1.0,.10,0,.05,0,'walnut',tray,.10);
  rounded(1.90,.30,.09,0,.19,.46,'walnut',tray,.05);
  rounded(1.90,.48,.09,0,.29,-.46,'walnut',tray,.05);
  for(const x of [-.90,.90])box(.09,.46,.87,x,.27,0,'walnut',tray);
  for(let i=0;i<4;i++) {
    const card=group(0,.23,-.31+i*.13,tray);card.rotation.x=-.12;
    rounded(1.60,.79,.031,0,.40,0,'page',card,.06);
    rounded(.37,.11,.026,(i%2?-.48:.48),.84,0,'brass',card,.025);
    box(1.20,.012,.009,0,.64,.022,'shade',card);
  }
  const saved=group(0,.23,.30,tray);saved.rotation.x=-.12;
  rounded(1.61,.81,.037,0,.40,0,'cream',saved,.07);
  const apple=group(0,.49,.035,saved);
  const a=ball(.115,-.055,0,0,'rust',apple);a.scale.set(1,1.15,.28);
  const b=ball(.115,.055,0,0,'rust',apple);b.scale.set(1,1.15,.28);
  line([[0,.07,.025],[.01,.13,.025],[-.02,.18,.02]],.012,'walnut',apple);
  const leaf=ball(.055,.06,.15,.01,'green',apple);leaf.scale.set(1.3,.5,.2);leaf.rotation.z=.45;
  // Text is a child of the saved card so it follows the same animation.
  cardText(T,'apple  |  manzana',1.20,0,.20,.046,saved);

  // Preserve only real moving assemblies; the rest becomes material batches.
  root.updateMatrixWorld(true);
  const waveBefore=waveforms[0].getWorldPosition(new T.Vector3());
  const out=finish(26,[greeting,reply,saved,...waveforms,...labels]);
  const pathOffset=waveforms[0].position.clone().sub(waveBefore);
  out.userData.studioProfile='lrnmate';
  out.userData.initialElevation=.30;
  const cardRest=saved.position.clone();
  out.userData.animate=time=>{
    const t=((time%14)+14)%14;
    const send=t>=1&&t<4.2,answer=t>=5.2&&t<8.4;
    greeting.visible=send;reply.visible=answer;
    greeting.position.copy(outbound.getPointAt(ease((t-1)/3.2)));
    reply.position.copy(inbound.getPointAt(ease((t-5.2)/3.2)));
    // finish recentres the geometry; preserve the same translation for paths.
    greeting.position.add(pathOffset);reply.position.add(pathOffset);
    greeting.scale.setScalar(Math.max(.001,Math.min(1,(t-1)*5,(4.2-t)*5)));
    reply.scale.setScalar(Math.max(.001,Math.min(1,(t-5.2)*5,(8.4-t)*5)));
    waveforms.forEach((wave,i)=>{
      const active=i===0?send:answer;
      wave.scale.y=active?1+.12*Math.sin(t*12):1;
    });
    // A single flashcard rises for inspection after the reply, then settles.
    const lift=ease((t-8.8)/.9)*(1-ease((t-11.7)/1.0));
    saved.position.copy(cardRest);saved.position.y+=lift*.30;
  };
  out.userData.animate(0);
  return out;
}

function cardText(T,value,width,x,y,z,parent,color='#463924'){
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.height=160;
  let ctx=c.getContext('2d');ctx.font='96px Georgia';c.width=Math.ceil(ctx.measureText(value).width+28);
  ctx=c.getContext('2d');ctx.font='96px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(value,c.width/2,80);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
  const label=new T.Mesh(new T.PlaneGeometry(width,width*160/c.width),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));label.position.set(x,y,z);parent.add(label);
}

function globeMap(T){
  const w=1024,h=512,data=new Uint8Array(w*h*4);
  // Natural Earth public-domain coastline, scan-converted once at creation.
  const landMask=new Uint8Array(w*h);
  for(let y=0;y<h;y++){
    const lat=90-(y+.5)/h*180;
    for(const polygon of amigoLand){
      const cuts=[];
      for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
        const [ax,ay]=polygon[j],[bx,by]=polygon[i];
        if((ay>lat)!==(by>lat)) cuts.push((ax+(bx-ax)*(lat-ay)/(by-ay)+180)/360*w);
      }
      cuts.sort((a,b)=>a-b);
      for(let i=0;i+1<cuts.length;i+=2){
        const start=Math.max(0,Math.ceil(cuts[i])),end=Math.min(w,Math.ceil(cuts[i+1]));
        landMask.fill(1,y*w+start,y*w+end);
      }
    }
  }
  let seed=26;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const land=landMask[y*w+x];
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=(seed/4294967296-.5)*20;
    const color=land?[186,146,78]:[21,65,65];const idx=(y*w+x)*4;
    data[idx]=color[0]+n;data[idx+1]=color[1]+n;data[idx+2]=color[2]+n;data[idx+3]=255;
  }
  const tex=new T.DataTexture(data,w,h);tex.colorSpace=T.SRGBColorSpace;tex.flipY=true;tex.needsUpdate=true;tex.wrapS=T.RepeatWrapping;tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;
  return tex;
}
