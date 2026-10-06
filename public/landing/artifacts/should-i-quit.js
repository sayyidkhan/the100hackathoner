import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {box,disk,line,person,finish}=sculpture(THREE);
 box(5.7,.18,3.1,0,.09,0,'paper');person(0,.2,.05,1.65);
 for(const [x,c] of [[-2.2,'ivory'],[2.2,'red']]){
  for(const dx of [-.45,.45])box(.13,1.75,.15,x+dx,1.055,-.83,c);box(1.03,.13,.15,x,1.88,-.83,c);
  line([[0,.21,.92],[0,.21,.28],[x,.21,-.73]],.15,'blue');
 }
 box(.7,.07,.4,-2.2,.85,-1);box(.07,.63,.07,-2.2,.50,-1);
 const door=box(.67,1.57,.06,2.65,.99,-.53,'red');door.rotation.y=-.85;
 for(let i=0;i<8;i++){const a=Math.PI*.10+i*Math.PI*.80/7,x=Math.cos(a)*1.45,y=1.27+Math.sin(a)*1.12;box(.42,.48,.05,x,y,-.90);line([[x*.7,.72,-.95],[x,y-.2,-.92]],.016,'wood');if(i%2===0)person(x,y-.16,-.85,.4,'blue');else for(let j=0;j<3;j++)box(.26,.024,.018,x,y-.10+j*.09,-.86,'blue');}
 box(1.55,.065,.08,0,.55,.81,'red');box(.12,.31,.12,0,.39,.81,'red');for(const x of [-.72,.72])disk(.23,.05,x,.61,.81,'red');
 for(const x of [-.26,.26])box(.51,.075,.51,x,.26,1.15);line([[-.5,.3,1.15],[-1,.3,.9],[-1,.3,1.6],[.4,.3,1.6],[.7,.3,1.2]],.025,'blue');
 return finish(51);
}
