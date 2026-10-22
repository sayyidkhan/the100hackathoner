import { riverWeather } from './two-rivers-weather.js';
// Small local atmosphere layer; animation follows the gallery pause clock.
export function riverAtmosphere(T, root, land) {
  const weather=riverWeather(T,root);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.12,'rgba(255,255,255,.65)');g.addColorStop(.45,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
  const map=new T.CanvasTexture(canvas),night=new T.Group(),day=new T.Group();root.add(night,day);
  const sprite=(parent,color,size,opacity,x,y,z)=>{const m=new T.SpriteMaterial({map,color,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending});const s=new T.Sprite(m);s.position.set(x,y,z);s.scale.setScalar(size);parent.add(s);return s;};
  const flies=[];
  for(let i=0;i<60;i++){
    const a=i*2.39996,r=.65+(i%13)*.19,x=Math.cos(a)*r,z=Math.sin(a)*r*.62,y=.85+(i%9)*.17;
    const s=sprite(night,i%4?0xffcf70:0x8fe9c2,.06+(i%3)*.018,.8,x,y,z);flies.push({s,x,y,z,phase:i*1.73});
  }
  // Broad, faint halos behind each crown avoid replacing the metal with a flat glow.
  for(const [x,y,z,r] of [[-.94,2.6,-.6,1.5],[.58,2.18,-.54,1.35],[-.16,3.35,-.72,1.8]])sprite(night,0xffb653,r*1.25,.23,x,y,z);
  const dust=[];
  for(let i=0;i<35;i++){const s=sprite(day,0xffe9ba,.018,.55,Math.sin(i*2.4)*2.8,.8+(i%10)*.29,Math.cos(i*1.7)*1.5);dust.push(s);}
  // A broken path of warm reflected light sits on the water beneath the tree.
  const reflectionMaterial=new T.MeshBasicMaterial({map,color:0xffc26e,transparent:true,opacity:.16,depthWrite:false,blending:T.AdditiveBlending});
  for(let i=0;i<24;i++){
    const z=.78+i*.064,x=.02+Math.sin(i*2.7)*.09;
    if(land.bankDistance(x,z)>-.05)continue;
    const p=new T.Mesh(new T.PlaneGeometry(.16+i*.012,.022),reflectionMaterial);p.rotation.x=-Math.PI/2;p.position.set(x,.438,z);p.userData.noShadow=true;night.add(p);
  }
  return {setTheme(theme){weather.setTheme(theme);night.visible=theme==='dark';day.visible=!night.visible;},animate(t){weather.animate(t);flies.forEach(({s,x,y,z,phase})=>{s.position.set(x+Math.sin(t*.18+phase)*.09,y+Math.sin(t*.4+phase)*.07,z+Math.cos(t*.22+phase)*.06);s.material.opacity=.25+.65*(.5+.5*Math.sin(t*1.2+phase));});dust.forEach((s,i)=>{s.position.y=.8+((i*.29+t*.018)%2.9);});reflectionMaterial.opacity=.12+Math.sin(t*.7)*.025;}};
}
