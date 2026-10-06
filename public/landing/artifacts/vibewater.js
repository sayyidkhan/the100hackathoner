import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,ball,line,finish}=sculpture(THREE);
 box(5.1,.17,2.5,0,.085,0,'paper');box(2,1.75,.09,-1.18,1.12,-.36);box(2,1.45,.09,1.2,1.4,-.50);
 for(const [x,y] of [[-1.2,1.77],[-1.2,1.25],[-1.72,.7],[-.61,.7]])box(.42,.28,.10,x,y,-.26);
 for(const x of [-1.72,-.61])line([[-1.2,1.6,-.25],[-1.2,1.13,-.25],[x,1.0,-.25],[x,.8,-.25]],.026,'blue');
 const bubble=ball(.42,-1.63,2.12,-.30,'red');bubble.scale.set(1,.72,.14);for(let i=0;i<3;i++)ball(.038,-1.85+i*.2,2.12,-.23);
 const chart=[[.31,1.35],[.55,1.72],[.77,1.34],[1,1.55],[1.22,.95],[1.45,1.21],[1.71,1.48],[2.02,1.38]].map(([x,y])=>[x,y,-.44]);for(let i=0;i<chart.length-1;i++)line([chart[i],chart[i+1]],.02,'blue');ball(.05,1.22,.95,-.41,'red');
 for(let i=0;i<4;i++){const x=.45+i*.45;box(.35,.36,.05,x,.52,-.13);box(.29,.07,.06,x,.70,-.10,i===2?'red':'blue');for(let j=0;j<6;j++)box(.025,.025,.01,x-.09+(j%3)*.09,.46+Math.floor(j/3)*.1,-.09,'shade');}
 const lens=mesh(new THREE.TorusGeometry(.4,.06,8,48),'blue');lens.position.set(1.85,1.39,-.32);line([[2.07,1.05,-.32],[2.34,.66,-.32]],.07,'blue');
 box(1.8,.37,.50,-1.1,.36,.70);for(let i=0;i<3;i++){box(.50,.46,.045,-1.68+i*.57,.51,.73);box(.19,.09,.05,-1.55+i*.57,.77,.73,i===1?'red':'blue');}
 return finish(44);
}
