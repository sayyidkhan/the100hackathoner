import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
  const { box, disk, ball, line, person, finish } = sculpture(THREE);
  disk(.7,.12,-1.95,.88,.25);for(const x of [-2.35,-1.55])box(.09,.82,.09,x,.41,.25,'wood');
  person(-2.60,0,.58,1.65);disk(.18,.07,-1.95,.975,.25,'red');box(.055,.35,.055,-1.95,1.17,.25,'red');
  const mic=ball(.16,-1.95,1.51,.25,'red');mic.scale.y=1.5;
  box(1.35,1.85,.10,-.34,1.18,-.30,'red');for(const x of [-.87,.20])box(.08,.6,.09,x,.3,-.3,'wood');
  for(let i=0;i<3;i++){const y=.61+i*.55;box(1.06,.40,.05,-.34,y,-.21);disk(.08,.03,-.72,y,-.16,'blue').rotation.x=Math.PI/2;for(let j=0;j<2;j++)box(.52,.022,.02,-.26,y+.065-j*.13,-.17,'shade');}
  line([[-2.17,1.64,.45],[-1.45,1.81,.22],[-.5,2.13,-.22]],.09,'blue');
  box(1.9,.12,1.0,1.70,.91,0);for(const x of [.83,2.57])for(const z of [-.42,.42])box(.1,.85,.1,x,.425,z);
  box(1.35,1.3,.08,1.35,1.62,-.28);for(let i=0;i<3;i++)ball(.05,.85+i*.17,2.16,-.21,i===0?'red':'blue');
  box(.55,.75,.1,1.05,1.58,-.17,'paper');box(.49,.49,.1,1.63,1.45,-.17,'paper');
  disk(.24,.12,2.40,1.03,.08,'blue');
  const joints=[[2.4,1.1,.08],[2.68,1.82,.08],[2.12,2.45,.08],[1.75,2.28,.08]];
  for(let i=0;i<joints.length-1;i++)line([joints[i],joints[i+1]],.095,'blue');for(const p of joints)ball(.14,...p,'blue');
  box(.36,.36,.18,1.75,2.07,.08,'blue');
  for(let i=0;i<3;i++)ball(.10,-.46+i*.78,2.43+Math.sin(i)*.15,-.28,'blue');
  return finish(65);
}
