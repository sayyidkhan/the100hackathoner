import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,person,finish}=sculpture(THREE);
 box(5.8,.18,2.7,0,.09,0,'paper');for(let i=0;i<11;i++)box(1.05,.065,.91,-2,.25+i*.1,-.35,i%3?'ivory':'shade');box(.27,1.12,.83,-1.38,.75,-.31,'red');box(.15,.5,.02,-1.38,.88,.12);
 line([[-1.7,1.24,-.3],[-.9,1.64,-.3],[.2,1.21,-.3],[1.5,1.09,-.3]],.17,'blue');
 for(let i=0;i<3;i++)box(.72,.77,.07,-.86+i*.9,1.17,-.02);
 for(let i=0;i<4;i++)box(.48,.03,.02,-.86,1.38-i*.13,.025,'shade');
 const tri=new THREE.Shape();tri.moveTo(-.13,-.19);tri.lineTo(.19,0);tri.lineTo(-.13,.19);tri.closePath();const play=mesh(new THREE.ExtrudeGeometry(tri,{depth:.035,bevelEnabled:false}),'red');play.position.set(.04,1.18,.025);
 for(let i=0;i<3;i++)box(.12,.13,.024,.69+i*.22,1.03,.03,i===0?'blue':'shade');box(.52,.03,.024,.94,1.35,.03,'shade');
 disk(.52,.1,1.96,.75,.44);disk(.24,.5,1.96,.45,.44);for(const x of [1.76,2.16])box(.39,.065,.43,x,.86,.44).rotation.z=x<2?.09:-.09;
 person(1.44,.18,-.02,.9);person(2.55,.18,.3,1.15);
 for(let i=0;i<18;i++){const t=i/17;ball(.045,-1.93+t*4.32,1.8+Math.sin(t*Math.PI)*.53,-.71,'blue');}
 return finish(34);
}
