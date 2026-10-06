import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {box,disk,ball,line,person,finish}=sculpture(THREE);
 box(5.4,.17,3.7,0,.085,0,'paper');disk(1.62,.17,0,.25,-.67);
 for(let i=0;i<17;i++)disk(.105,1.8,-1.6+i*.20,1.23,-1.5,'red');box(3.5,.15,.20,0,2.14,-1.5);
 box(2.1,1.35,.08,0,1.05,-.90,'red');
 for(let i=0;i<3;i++){const x=-.68+i*.68;box(.56,1.14,.06,x,1.02,-.82);for(let j=0;j<3;j++){box(.085,.13+j*.09,.02,x-.15+j*.14,1.34+j*.045,-.77,i===0?'red':'blue');box(.33,.024,.02,x,.65+j*.14,-.77,'shade');}}
 box(.95,.07,.75,0,.27,-.05);for(const x of [-.49,.49])box(.07,.22,.75,x,.37,-.05);
 for(const [x,z,c] of [[-1.95,.75,'red'],[0,1.37,'blue'],[1.95,.75,'blue']]){
  disk(.32,.07,x,.215,z);person(x,.25,z,.95);const bubble=ball(.4,x-.35,1.14,z-.14,c);bubble.scale.set(1,.75,.13);
  line([[x,.20,z-.23],[x*.65,.20,.32],[0,.28,-.03]],.06,'blue');
  box(.39,.03,.22,x+.42,.20,z,'red');box(.34,.01,.18,x+.42,.22,z);disk(.09,.04,x+.33,.21,z+.28);
 }
 return finish(56);
}
