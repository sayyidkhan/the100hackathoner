import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {box,ball,line,finish}=sculpture(THREE);
 box(5.8,.18,3.1,0,.09,0,'paper');box(2.1,1.65,.12,-.55,1.005,-.72);
 for(const x of [-1.30,-.62,.06]){box(.12,.70,.35,x,.55,-.28,'red');line([[x,1.15,-.59],[x-.13,1.62,-.5]],.05,'red');ball(.12,x-.13,1.68,-.5,'red');}
 const points=[[-3,1.2,-.33],[-2.65,1.65,-.33],[-2.3,.85,-.33],[-1.95,1.55,-.33],[-1.58,.66,-.33],[-.5,.65,-.33],[.3,.50,-.33],[1,.49,-.33],[1.6,.51,-.33],[2.2,.5,-.33]];
 for(let i=0;i<points.length-1;i++)line([points[i],points[i+1]],.09,'blue');
 for(const z of [-.72,.16]){box(1.9,.06,.04,1.24,.64,z);for(let i=0;i<4;i++)box(.06,.44,.06,.4+i*.55,.43,z);}
 box(.65,.9,.65,2.32,.63,-.33);for(let i=0;i<4;i++)box(.46,.03,.015,2.32,.40+i*.17,.003,'shade');
 for(const x of [-1.6,-.97]){box(.62,.075,.70,x,.25,.95);for(let i=0;i<5;i++)box(.43,.01,.02,x,.295,.69+i*.11,'shade');}
 for(let i=0;i<5;i++)box(.74,.055,.48,.06,.24+i*.07,.97);box(.22,.055,.16,.28,.52,1.16,'blue');
 box(.64,.12,.56,1.6,.26,.98);box(.12,.40,.12,1.6,.5,.98,'red');box(.67,.14,.14,1.6,.74,.98,'red');
 return finish(50);
}
