import {medivoiceStudio} from './medivoice-studio.js';
// Shared craftsmanship for the 2019 exhibits; each exhibit owns its composition.
export function earlyStudio(T){
 const k=medivoiceStudio(T),{root,materials:m,mesh,texture}=k,live=[];
 for(const [key,color,roughness,metalness] of [
  ['stone',0xe6d8bf,.85,0],['cream',0xf3e9d5,.68,0],['brass',0xae8445,.32,.7],
  ['dark',0x172d2c,.55,0],['green',0x22664d,.6,0],['jade',0x489b7a,.5,0],
  ['coral',0xc45e40,.62,0],['brick',0xa96d51,.92,0],['mortar',0xc7b69a,.9,0],
  ['silver',0x9ba5a4,.34,.65],['copper',0xa96840,.4,.65],['black',0x182321,.6,0],
  ['fur',0x665547,.95,0],['pink',0xc2a085,.85,0],['gold',0xe2b65c,.35,.55]]){
   m[key]=new T.MeshStandardMaterial({color,roughness,metalness});
 }
 const grain=texture('stone');for(const key of ['stone','cream','brick','fur']){m[key].bumpMap=grain;m[key].bumpScale=key==='brick'?.035:.012;}
 // Fine mineral pores and enamel variation remain visible under broad studio light.
 for(const key of ['stone','brick','green']){
  const size=256,data=new Uint8Array(size*size*4),base=m[key].color.clone().convertLinearToSRGB();let seed=23;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=seed/4294967296;const vein=Math.sin(x*.035+Math.sin(y*.029)*2)*.022;const pore=key==='stone'&&n>.985?-.17:0;const v=.97+(n-.5)*(key==='green'?.09:.15)+vein+pore;const i=(y*size+x)*4;data[i]=Math.min(255,base.r*v*255);data[i+1]=Math.min(255,base.g*v*255);data[i+2]=Math.min(255,base.b*v*255);data[i+3]=255;}
  const map=new T.DataTexture(data,size,size);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;m[key].map=map;m[key].color.setHex(0xffffff);
 }
 const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
 function rounded(w,h,d,x,y,z,color,parent=root,r=.08){
  r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:12});g.translate(0,0,-d/2);const o=mesh(g,color,parent);o.position.set(x,y,z);return o;
 }
 function slab(w,d,h,x,y,z,color,parent=root,r=.13){const o=rounded(w,d,h,x,y,z,color,parent,r);o.rotation.x=-Math.PI/2;return o;}
 function ring(r,t,x,y,z,color,parent=root){const o=mesh(new T.TorusGeometry(r,t,12,56),color,parent);o.position.set(x,y,z);return o;}
 function ellipsoid(x,y,z,sx,sy,sz,color,parent=root){const o=k.ball(1,x,y,z,color,parent);o.scale.set(sx,sy,sz);return o;}
 function text(value,w,x,y,z,parent=root,color='#e8d7b4'){
  const g=group(x,y,z,parent);live.push(g);
  if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1024;c.height=160;const cx=c.getContext('2d');cx.font='600 84px Georgia';cx.fillStyle=color;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(value,512,80,1000);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,w*160/1024),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));g.add(o);o.userData.noShadow=true;}
  return g;
 }
 function base(title){slab(6.6,3.7,.24,0,.12,0,'stone',root,.38);slab(6.38,3.48,.035,0,.263,0,'cream',root,.3);rounded(2.15,.29,.025,0,.14,1.872,'brass');rounded(2.04,.22,.02,0,.14,1.892,'dark');text(title,1.85,0,.145,1.91);}
 function finish(id,animated=[]){root.updateMatrixWorld(true);for(const g of [...live,...animated])root.attach(g);const out=k.finish(id,[...live,...animated]);Object.assign(out.userData,{displayBase:false,studioProfile:'lrnmate',contactFootprint:false,groundLevel:0,initialYaw:-.16,initialElevation:.34,autoOrbit:false,realTimeAnimation:true});return out;}
 return {...k,m,group,rounded,slab,ring,ellipsoid,text,base,finish};
}
export const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
