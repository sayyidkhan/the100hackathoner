import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,finish}=sculpture(THREE);
 disk(2.3,.12,0,.06,0,'paper').scale.z=.7;disk(1.14,.10,-.88,.17,-.1);
 const body=ball(.50,-.98,.58,-.18);body.scale.set(1.35,.8,.88);ball(.32,-.39,.48,.01);ball(.15,-1.61,.40,-.2);
 for(const z of [-.20,.23]){const ear=ball(.20,-.67,.62,z);ear.scale.set(1.8,.26,.5);ear.rotation.z=.32;const paw=ball(.16,-.41,.27,z);paw.scale.set(1.4,.5,.7);}
 line([[-.22,.54,.237],[-.16,.51,.25],[-.09,.53,.235]],.012,'ink');ball(.035,-.075,.41,.08,'shade');
 const pond=disk(.68,.025,.53,.145,.72,'blue');pond.scale.x=1.4;
 for(const r of [.22,.39,.56]){const ring=mesh(new THREE.TorusGeometry(r,.009,6,48),'paper');ring.rotation.x=Math.PI/2;ring.position.set(.53,.162,.72);ring.scale.x=1.4;}
 const palm=ball(.38,1.14,.30,-.18);palm.scale.set(1.45,.35,.82);box(.55,.18,.48,1.67,.28,-.18);
 for(let i=0;i<4;i++)line([[1.02,.32,-.44+i*.17],[.62,.29,-.44+i*.17],[.44,.42,-.44+i*.17]],.065);
 line([[1.30,.32,-.47],[1.04,.46,-.68],[.83,.49,-.67]],.085);
 for(const [x,y,z] of [[-1.5,1.8,-.65],[1.3,1.49,-.70]]){box(.025,y-.15,.025,x,y/2,z,'wood');for(let i=0;i<3;i++){const cloud=ball(.21,x+(i-1)*.24,y+(i===1?.08:0),z);cloud.scale.z=.2;}}
 box(.025,.42,.025,-1.64,.36,.52,'wood');for(let i=0;i<5;i++){const a=i*Math.PI*2/5,petal=ball(.07,-1.64+Math.cos(a)*.09,.59+Math.sin(a)*.09,.52,'red');petal.scale.z=.22;}
 return finish(49);
}
