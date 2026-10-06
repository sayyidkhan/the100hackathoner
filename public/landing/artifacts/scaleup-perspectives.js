import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {box,disk,ball,line,person,finish}=sculpture(THREE);
 disk(2.5,.18,0,.09,0,'paper');box(1.35,1.1,1,0,.73,0);box(.95,.76,.03,0,.56,.52,'shade');
 box(1.55,.16,.75,0,1.20,.47,'red').rotation.x=.20;box(.07,.8,.04,0,.59,.55);
 for(const x of [-1.85,0,1.85])box(1.45,1.85,.09,x,1.34,-1.14);
 for(let i=0;i<4;i++)box(.17,.32+i*.23,.035,-2.31+i*.29,.63+(.32+i*.23)/2,-1.07,'blue');
 for(let i=0;i<3;i++){box(1.1,.35,.055,0,.75+i*.5,-1.07);ball(.08,-.4,.75+i*.5,-1,'blue');box(.63,.025,.018,.12,.75+i*.5,-1.03,'shade');}
 line([[1.31,.75,-1.06],[1.65,.92,-1.06],[2.01,1.29,-1.06],[2.37,1.85,-1.06]],.029,'blue');
 for(const x of [-1.85,0,1.85])line([[x,.23,-1.08],[x,.25,.30],[0,.24,.95]],.036,'blue');
 person(-1.45,.18,1.3,1);person(.85,.18,1.65,.8,'blue');disk(.3,.08,.38,.63,.83);box(.065,.4,.065,.38,.4,.83);box(.3,.3,.32,-.1,.34,.85,'red');
 return finish(38);
}
