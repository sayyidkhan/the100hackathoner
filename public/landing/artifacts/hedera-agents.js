import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {box,disk,ball,line,person,finish}=sculpture(THREE);
 box(5,.18,3.3,0,.09,0,'paper');disk(.74,.10,0,.76,.20);disk(.19,.53,0,.445,.2);
 for(const [x,z] of [[-1.12,.4],[1.12,.4],[0,-.57]]){
  box(.47,.5,.40,x,.58,z);box(.51,.43,.44,x,1.07,z);for(const dx of [-.11,.11])ball(.04,x+dx,1.09,z+.23,'ink');
  const cx=x*1.45;box(.61,.80,.06,cx,1.9,z-.5);person(cx,1.72,z-.45,.43,'shade');line([[cx,1.5,z-.5],[cx*.70,1.42,-.9],[0,1.65,-1.1]],.035,'blue');
 }
 disk(.34,1.8,0,1.13,-1.1,'red');for(let i=0;i<3;i++)box(.16,.23,.035,0,1+i*.3,-.745);
 box(.30,.40,.035,-.76,.86,.52,'red');box(.19,.36,.055,.15,.93,-.36,'shade');
 for(const x of [-1.56,-1.06]){box(.49,.07,.58,x,.24,1.08);for(let i=0;i<4;i++)box(.31,.013,.017,x,.282,.91+i*.09,'shade');}
 line([[-.8,.23,1.08],[1.88,.23,1.08]],.025,'blue');for(let i=0;i<3;i++)box(.43,.06,.51,-.40+i*.61,.27,1.08);box(.5,.07,.4,1.51,.27,1.08,'blue');ball(.07,1.51,.33,1.08,'shade');
 return finish(46);
}
