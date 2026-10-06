import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,finish}=sculpture(THREE);
 box(6.6,.24,2.9,0,.12,0,'paper');
 line([[-2.8,.265,-.5],[-1.8,.265,.4],[-.5,.265,.2],[.8,.265,.7],[2.8,.265,-.4]],.20,'blue');
 for(const [x,c] of [[-2.8,'blue'],[2.8,'red']]){
  box(.85,1.1,.75,x,.8,-.55);for(let i=0;i<4;i++)box(.61,.07,.025,x,.48+i*.23,-.16,c);
  for(const dx of [-.36,.36])box(.12,1.25,.12,x+dx,.88,-.17);
  box(.04,.6,.04,x,1.62,-.55,c);box(.32,.23,.025,x+.15,1.82,-.55,c);
 }
 for(let i=0;i<5;i++){
  const x=-1.7+i*.83,z=-.47;disk(.31,.13,x,.32,z);disk(.22,.12,x,.45,z,'shade');
  if(i===0){const barrel=disk(.11,.55,x,.75,z,'ink');barrel.rotation.z=-.8;ball(.17,x,.60,z,'blue');}
  if(i===1||i===2){for(let j=0;j<(i===1?1:3);j++){const crystal=mesh(new THREE.ConeGeometry(.13,.7,5),'blue');crystal.position.set(x+(j-1)*.15,.81,z);}}
  if(i===3){box(.055,.60,.055,x,.76,z,'blue');for(let j=0;j<4;j++)disk(.16,.05,x,.56+j*.15,z,'blue');ball(.15,x,1.10,z,'wood');}
  if(i===4){const missile=mesh(new THREE.ConeGeometry(.15,.55,8),'red');missile.position.set(x,.85,z);missile.rotation.z=.65;}
 }
 for(let i=0;i<10;i++){const x=-2.2+i*.48,z=.55+Math.sin(i)*.20;ball(.10,x,.53,z);disk(.08,.14,x,.36,z);}
 disk(.37,.09,-1.4,.045,2.0,'red');box(.07,.5,.07,-1.4,.34,2,'red');const mic=ball(.28,-1.4,.90,2,'red');mic.scale.y=1.5;
 for(let i=0;i<2;i++)line([[-.94+i*.25,.62,1.90],[-.80+i*.25,.94,1.90],[-.94+i*.25,1.28,1.90]],.04,'blue');
 return finish(64);
}
