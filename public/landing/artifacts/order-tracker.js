import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
  const { box, disk, ball, line, person, finish } = sculpture(THREE);
  box(5.8,.20,3.1,0,.10,0,'paper');
  box(2.35,1.10,.86,-1.35,.75,-.30);box(2.60,.12,1.12,-1.35,1.36,-.30);
  for(const x of [-2.43,-.27])box(.12,2.65,.12,x,1.53,-.72,'wood');
  for(let i=0;i<7;i++) {
    const x=-2.47+i*.38,roof=box(.38,.08,1.42,x,2.82,-.36,i%2?'ivory':'red');roof.rotation.x=.20;
    box(.38,.28,.06,x,2.55,.32,i%2?'ivory':'red');
  }
  for(let i=0;i<3;i++){disk(.21,.04,-2+i*.53,1.44,-.05);disk(.15,.09,-2+i*.53,1.50,-.05,'wood');}
  disk(.14,.42,-.53,1.63,-.05,'blue');line([[-.53,1.80,-.05],[-.53,2.0,-.05]],.025,'ivory');
  box(1.30,1.93,.09,.71,1.18,-.52);box(1.10,.09,.09,.71,1.98,-.43,'red');
  for(let i=0;i<3;i++){box(.28,.77,.04,.31+i*.40,1.48,-.42,'paper');box(.06,.20,.06,.31+i*.40,1.90,-.37,'wood');}
  person(2.01,.24,-.47,1.8);box(.63,.72,.07,2.01,.91,-.31,'red');
  box(.74,.79,.055,2.01,1.20,-.20);ball(.13,1.60,1.10,-.11);ball(.13,2.42,1.10,-.11);
  person(-2.15,.20,1.12,1.45,'blue');box(.44,.55,.07,-2.15,.59,1.23,'red');
  for(const [x,s,c] of [[.40,.65,'red'],[1.10,.44,'blue']]){box(s,s,s,x,.20+s/2,.72,'paper');box(s+.015,.04,s+.015,x,.20+s*.60,.72,c);box(.045,s+.016,s+.015,x,.20+s/2,.72,c);}
  for(let i=0;i<2;i++){const token=disk(.22,.06,1.67+i*.59,.44,1.10,'blue');token.rotation.x=Math.PI/2;disk(.06,.075,1.67+i*.59,.46,1.15).rotation.x=Math.PI/2;}
  return finish(69);
}
