import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,ball,line,finish}=sculpture(THREE);
 box(5.4,.17,3,0,.085,0,'paper');box(1.5,.47,.98,0,.405,.17);for(let i=0;i<13;i++)box(1.28,.46,.035,0,.57,-.25+i*.065);
 box(1.1,.64,.055,0,1.24,-.10,'red');for(let i=0;i<4;i++)box(.79,.027,.02,0,1.05+i*.12,-.06,'paper');
 const nodes=[[-2,1.13,.12],[-1.62,2,-.55],[-.7,2.48,-.88],[.35,2.28,-.92],[1.39,2.03,-.55],[2,1.25,.03],[-1.2,1.12,-.17],[1.2,1.24,-.10]];
 nodes.forEach((p,i)=>{ball(.085,...p,'blue');box(.018,p[1]-.2,.018,p[0],p[1]/2,p[2],'blue');if(i<6){box(.44,.45,.05,p[0],p[1]+.20,p[2]+.03);for(let j=0;j<2;j++)box(.29,.025,.02,p[0],p[1]+.17+j*.12,p[2]+.066,'shade');}if(i>0)line([nodes[i-1],[p[0]-.16,p[1]+.13,p[2]],p],.018,'blue');});
 for(let i=0;i<4;i++)line([nodes[i],nodes[i+4]],.018,'blue');line([nodes[1],[0,1.9,-.15],nodes[5]],.024,'red');
 for(const x of [-.28,.28])box(.55,.08,.58,x,.24,1.05);const lens=mesh(new THREE.TorusGeometry(.22,.034,8,40),'blue');lens.position.set(.55,.52,1.04);line([[.72,.35,1.04],[.93,.22,1.04]],.045,'blue');
 return finish(39);
}
