import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,person,finish}=sculpture(THREE);
 box(5.6,.2,2.8,0,.1,0,'paper');disk(.85,.16,-1.85,.28,.3);disk(.85,.4,1.8,.40,.25);
 person(-2.02,.37,.15,1.55);box(.65,.65,.12,-2.02,.69,-.05);disk(.29,.07,-1.45,.93,.35);box(.07,.52,.07,-1.45,.64,.35);
 disk(.12,.05,-1.45,1,.35,'red');box(.04,.20,.04,-1.45,1.12,.35,'red');const mic=ball(.11,-1.45,1.35,.35,'red');mic.scale.y=1.6;
 box(1.25,2.1,.10,0,1.3,-.48,'paper');box(1.09,1.89,.04,0,1.28,-.40);box(.5,.16,.08,0,2.33,-.39,'blue');
 for(let i=0;i<7;i++)box(.77,.034,.023,0,.69+i*.20,-.36,'blue');
 for(let i=0;i<3;i++)line([[-1.28,1.24+i*.10,.35],[-.9,1.49+i*.10,.16],[-.65,1.51+i*.10,-.36]],.028,'blue');
 box(1.05,.11,.66,1.8,1.10,.15);for(const x of [1.35,2.25])box(.1,.51,.6,x,.85,.15);person(1.9,.6,-.17,1.55);
 const lens=mesh(new THREE.TorusGeometry(.25,.04,8,40),'red');lens.position.set(1.29,1.62,.32);line([[1.29,1.39,.32],[1.43,1.14,.32]],.035,'wood');
 for(let i=0;i<9;i++)box(.28,.075+i*.045,.39,-1.12+i*.27,.238+i*.0225,.88,'red');
 return finish(57);
}
