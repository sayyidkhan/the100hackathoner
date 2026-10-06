import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,disk,ball,line,finish}=sculpture(THREE);
 box(5.8,.2,3.8,0,.1,0,'paper');
 line([[-2,.24,.85],[-1.5,.24,.30],[0,.24,.10],[1.8,.24,.40]],.065,'blue');
 for(const x of [-1.8,0,1.8])disk(.56,.08,x,.24,-.56);
 disk(.65,.13,0,.34,-.56,'red');box(1.25,1.5,.1,0,1.05,-.94,'red');
 box(.84,1.1,.06,0,1.04,-.87);for(const x of [-.56,.56])box(.11,1.5,.16,x,1.05,-.90,'red');
 for(const x of [-.15,.18]){disk(.10,.04,x,.92,-.81,'blue').rotation.x=Math.PI/2;box(.035,.43,.04,x+.07,1.11,-.81,'blue');}box(.36,.04,.04,.085,1.32,-.81,'blue');
 disk(.30,.06,-1.8,.76,-.56);box(.06,.49,.06,-1.8,.49,-.56);for(const x of [-1.95,-1.65])disk(.06,.08,x,.83,-.56);
 box(.87,.70,.70,1.8,.63,-.56);box(.95,.07,.77,1.8,1.02,-.56);for(const x of [1.46,2.14])box(.18,.23,.26,x,1.17,-.6);
 const moon=mesh(new THREE.TorusGeometry(.22,.045,8,32,Math.PI*1.5),'red');moon.position.set(1.9,1.86,-.75);moon.rotation.z=.75;box(.025,.65,.025,1.9,1.39,-.75,'ink');
 box(.68,.52,.6,1.7,.46,1.18);box(.22,.36,.025,1.7,.42,1.49,'red');
 for(let i=0;i<8;i++)box(.08,.03,.025,.40+i*.16,.24,.44+i*.085,'blue');
 const bubble=ball(.46,-1.78,.85,1.05,'red');bubble.scale.set(1,.8,.22);for(let i=0;i<3;i++)ball(.045,-2+i*.22,.86,1.16);
 const tail=mesh(new THREE.ConeGeometry(.13,.32,3),'red');tail.position.set(-1.78,.50,1.05);tail.rotation.z=Math.PI;
 disk(.26,.06,-.9,.29,1.5).rotation.x=Math.PI/2;line([[-.9,.30,1.55],[-.9,.45,1.55]],.012,'wood');box(.7,.04,.37,0,.24,1.5);
 return finish(62);
}
