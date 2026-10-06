import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {box,disk,ball,line,finish}=sculpture(THREE);
 box(5.2,.15,3.2,0,.075,0,'paper');box(3.7,.10,2.1,-.45,.2,.4);
 box(1.75,.17,.47,-1.17,.35,-.27,'wood');for(let i=0;i<5;i++)box(.21,.09,.27,-1.86+i*.34,.47,-.27,'wood');
 box(1.72,.24,.88,-1.1,.39,.85,'wood');for(const x of [-1.57,-.75]){disk(.32,.04,x,.53,.85,'shade');disk(.11,.06,x,.57,.85,'wood');for(let j=0;j<6;j++){const a=j*Math.PI/3;const blade=box(.23,.04,.085,x+Math.cos(a)*.16,.57,.85+Math.sin(a)*.16,'wood');blade.rotation.y=-a;}}
 box(1.35,.15,1.5,.57,.33,.55,'wood');box(.46,.13,.47,.50,.47,.44,'wood');for(let i=0;i<4;i++)box(.06,.16,.78,1.02-i*.12,.49,.59,'wood');
 for(let i=0;i<46;i++){const x=-1.94+(i%10)*.15,z=.53+Math.floor(i/10)*.14;const bean=ball(.036,x,.527,z,'paper');bean.scale.y=.4;}
 box(1.6,.11,.76,.2,.23,-1.02,'red');for(const z of [-1.36,-.67])box(1.6,.66,.08,.2,.58,z,'red');for(const x of [-.56,.96])box(.08,.66,.72,x,.58,-1.02,'red');box(.91,.38,.018,.2,.59,-.62);
 const lid=box(1.65,.07,.8,.2,1.12,-1.36,'red');lid.rotation.x=-1.1;
 box(.77,1.18,.055,1.83,.76,-.64);box(.28,.10,.07,1.83,1.34,-.58,'wood');for(let i=0;i<5;i++)box(.51,.028,.019,1.81,.39+i*.16,-.60,'shade');
 disk(.20,.08,2,.25,.69,'blue');line([[2,.25,.69],[2.47,.26,.61]],.05,'blue');for(let i=0;i<4;i++)ball(.046,1.89+i*.06,.31,.69,'wood');
 return finish(47);
}
