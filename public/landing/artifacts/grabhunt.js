import {earlyStudio,ease} from './early-exhibit-studio.js';
// Concept interpretation: the historical record says only e-credits via GrabPoints.
export function createArtifact(T){
 const k=earlyStudio(T),{root,m,mesh,box,disk,line,group,rounded,slab,ring,text,base,finish}=k;
 base('GrabHunt');
 function star(x,y,z,r,parent){const s=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,q=i%2?r*.46:r;i?s.lineTo(Math.cos(a)*q,Math.sin(a)*q):s.moveTo(Math.cos(a)*q,Math.sin(a)*q);}s.closePath();const o=mesh(new T.ExtrudeGeometry(s,{depth:.012,bevelEnabled:true,bevelSize:.006,bevelThickness:.005,bevelSegments:2}),'cream',parent);o.position.set(x,y,z);return o;}
 function check(x,y,z,r,parent){line([[x-r*.55,y,z],[x-r*.1,y-r*.4,z],[x+r*.65,y+r*.55,z]],.025,'cream',parent);}
 // Open-front rewards reservoir: coins and machined containment ribs.
 const reservoir=group(-2.18,.30,-.18);
 for(const [y,r,h,c] of [[.12,.67,.24,'green'],[.26,.71,.06,'brass'],[1.95,.70,.13,'brass'],[2.04,.66,.035,'green']])disk(r,h,0,y,0,c,reservoir);
 for(let i=0;i<7;i++){const a=i/6*Math.PI;const x=Math.cos(a)*.6,z=-Math.sin(a)*.6;line([[x,.28,z],[x,1.91,z]],.035,'brass',reservoir);for(const y of [.35,1.85])disk(.055,.06,x,y,z,'gold',reservoir);}
 const coins=[];for(let i=0;i<7;i++){const g=group(0,.36+i*.13,0,reservoir);disk(.38,.1,0,0,0,'gold',g);const rim=ring(.354,.012,0,.057,0,'brass',g);rim.rotation.x=Math.PI/2;const mark=star(0,.06,0,.19,g);mark.rotation.x=-Math.PI/2;for(let j=0;j<40;j++){const a=j/40*Math.PI*2;const cut=box(.012,.06,.012,Math.cos(a)*.377,0,Math.sin(a)*.377,'brass',g);cut.rotation.y=-a;}coins.push(g);}
 // Smartphone exchange console.
 const phone=group(-.02,.3,-.23);
 slab(1.4,.94,.16,0,.08,0,'green',phone);rounded(1.36,.3,.19,0,.24,.28,'brass',phone);
 rounded(1.37,2.75,.18,0,1.62,0,'brass',phone,.18);rounded(1.26,2.64,.16,0,1.62,.105,'green',phone,.16);
 rounded(.38,.075,.025,0,2.8,.2,'black',phone,.035);
 const exchange=group(0,1.91,.205,phone);
 for(let side=0;side<2;side++){const shape=mesh(new T.RingGeometry(.28,.34,40,1,side*Math.PI+.25,2.2),'cream',exchange);const arrow=mesh(new T.ConeGeometry(.10,.19,3),'cream',exchange);const a=side*Math.PI+2.45;arrow.position.set(Math.cos(a)*.31,Math.sin(a)*.31,.01);arrow.rotation.z=a;}
 const checks=[];for(let i=0;i<3;i++){const g=group(-.33+i*.33,1.07,.21,phone);const c=disk(.12,.015,0,0,0,'jade',g);c.rotation.x=Math.PI/2;check(0,0,.022,.10,g);checks.push(g);}
 text('EXCHANGE',.93,0,2.48,.215,phone);text('GRABPOINTS',.87,0,.68,.215,phone);
 // Ivory voucher kiosk with recessed outlet, vents and perforated paper.
 const printer=group(2.15,.3,-.18);
 slab(1.55,1.2,.15,0,.08,0,'green',printer);rounded(1.50,1.91,.9,0,1.08,-.1,'green',printer,.16);rounded(1.35,1.84,.92,0,1.10,-.07,'stone',printer,.14);
 rounded(1.11,.55,.07,0,1.37,.43,'brass',printer,.08);rounded(.93,.14,.04,0,1.37,.477,'black',printer,.03);
 for(const x of [-.48,.48])for(const y of [1.17,1.57]){const s=disk(.026,.02,x,y,.48,'gold',printer);s.rotation.x=Math.PI/2;}
 rounded(.55,.055,.027,0,1.83,.41,'brass',printer,.02);
 for(let i=0;i<5;i++)box(.22,.025,.02,-.43,.45+i*.08,.41,'dark',printer);
 const tray=slab(1.13,.75,.04,0,.27,.65,'brass',printer);tray.rotation.x=-.18;
 const voucher=group(0,1.32,.52,printer);voucher.rotation.x=-.38;
 rounded(.83,1.05,.023,0,-.48,0,'cream',voucher,.025);
 for(const x of [-.36,.36])box(.009,.87,.008,x,-.48,.02,'brass',voucher);
 for(const y of [-.07,-.91])box(.72,.009,.008,0,y,.02,'brass',voucher);
 const seal=disk(.17,.016,0,-.35,.02,'jade',voucher);seal.rotation.x=Math.PI/2;check(0,-.35,.035,.15,voucher);
 for(let i=0;i<3;i++)box(.43-i*.07,.018,.009,-i*.035,-.65-i*.07,.022,'brass',voucher);
 for(let i=0;i<15;i++)box(.016,.028,.006,-.36+i*.052,-.96,.02,'stone',voucher);
 // A single token moves through a connected route; acknowledgement precedes output.
 const track=new T.CatmullRomCurve3([new T.Vector3(-2.17,.74,.34),new T.Vector3(-1.7,.60,.75),new T.Vector3(-.95,.60,.8),new T.Vector3(-.11,.63,.46)]);
 for(const offset of [-.11,.11])line(track.getPoints(30).map(p=>[p.x,p.y,p.z+offset]),.027,'brass');
 for(const x of [-1.65,-.85]){disk(.09,.025,x,.31,.78,'brass');line([[x,.32,.78],[x,.59,.78]],.026,'brass');}
 for(let i=0;i<2;i++)line([[.65,1.02+i*.1,-.1],[.99,1.02+i*.1,-.1],[1.18,1.37+i*.1,-.1],[1.45,1.37+i*.1,-.1]],.033,i?'brass':'green');
 const token=group();disk(.16,.055,0,0,0,'gold',token);const mark=star(0,.034,0,.085,token);mark.rotation.x=-Math.PI/2;
 const out=finish(27,[token,voucher,exchange,...checks]);const tokenOffset=token.position.clone(),voucherRest=voucher.position.clone(),scale=voucher.scale.clone();
 out.userData.animate=t=>{const p=((t%16)+16)%16;token.visible=p<4;token.position.copy(track.getPointAt(ease(p/4))).add(tokenOffset);exchange.rotation.z=p<4?0:p<6?-Math.PI*2*ease((p-4)/2):-Math.PI*2;checks.forEach((g,i)=>{g.visible=p>=5+i*.4&&p<14;});const reveal=ease((p-6.3)/1.8)*(1-ease((p-13)/1.5));voucher.visible=reveal>.001;voucher.scale.copy(scale);voucher.scale.y*=Math.max(.001,reveal);voucher.position.copy(voucherRest);};
 out.userData.animate(0);return out;
}
