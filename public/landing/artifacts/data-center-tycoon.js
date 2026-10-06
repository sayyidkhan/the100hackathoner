import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {box,disk,ball,line,finish}=sculpture(THREE);
 for(let x=0;x<8;x++)for(let z=0;z<6;z++)box(.63,.17,.63,(x-3.5)*.65,.085,(z-2.5)*.65,'paper');
 for(let i=0;i<3;i++){const x=-.8+i*.7;box(.55,1.65,.6,x,.995,-.80);for(let j=0;j<6;j++){box(.43,.14,.02,x,.38+j*.25,-.489,'shade');box(.20,.04,.02,x-.05,.38+j*.25,-.47,'blue');}box(.40,.18,.40,x,1.9,-.8,'blue');}
 for(const z of [-.8,.25]){box(.07,.55,.07,-1.96,.44,z);const p=box(.83,.09,.80,-1.96,.79,z,'blue');p.rotation.x=.5;}
 box(.8,.9,.20,1.45,.76,-.95,'red');disk(.33,.04,1.45,.76,-.83,'ink').rotation.x=Math.PI/2;
 for(let i=0;i<4;i++){const blade=box(.36,.14,.05,1.45+Math.cos(i*Math.PI/2)*.14,.76+Math.sin(i*Math.PI/2)*.14,-.79,'red');blade.rotation.z=i*Math.PI/2;}
 box(.54,.72,.54,2.0,.53,.3);disk(.13,.10,2,.94,.3,'red');
 box(.47,.14,.47,.78,.28,.24,'blue');for(let i=0;i<4;i++)box(.04,.08,.68,.62+i*.1,.22,.24,'blue');
 line([[-1.95,.20,.25],[-.8,.20,.45],[.1,.20,.15],[.8,.20,.25],[2,.20,.3]],.025,'blue');
 box(.5,.12,.5,0,.23,1.35,'red');box(.10,.65,.10,0,.61,1.35,'red');box(1.96,.08,.08,0,.91,1.35,'red');ball(.12,0,1.05,1.35,'red');
 for(const x of [-.91,.91])disk(.32,.06,x,.95,1.35,'red');box(.30,.47,.28,-.91,1.21,1.35);
 const leaf=ball(.25,.91,1.2,1.35);leaf.scale.set(.55,1,.15);leaf.rotation.z=-.55;
 return finish(63);
}
