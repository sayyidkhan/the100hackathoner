import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {box,disk,ball,line,person,finish}=sculpture(THREE);
 disk(2.2,.17,0,.085,0,'paper');
 for(const x of [-.95,.65])box(.15,2.3,.18,x,1.32,-.4,'red');
 line([[-.95,2.45,-.4],[-.6,2.86,-.4],[-.15,3.05,-.4],[.3,2.86,-.4],[.65,2.45,-.4]],.11,'red');
 person(-.15,.22,-.34,2.5);disk(.23,.05,-.15,1.07,-.12,'red').rotation.x=Math.PI/2;
 disk(.34,.24,-1.78,.29,.2);disk(.15,.05,-1.78,.44,.2);box(.04,.30,.04,-1.78,.59,.2);const mic=ball(.13,-1.78,.86,.2);mic.scale.y=1.65;
 line([[-1.56,.84,.2],[-.7,1.05,.2],[-.1,1.12,.2]],.07,'blue');
 for(const [y,c] of [[.64,'red'],[1.17,'ivory']]){line([[.28,1.1,.15],[.85,y,.15],[1.5,y,.15]],.06,c);disk(.22,.07,1.65,y,.15,c).rotation.x=Math.PI/2;}
 line([[1.51,1.16,.20],[1.63,1.06,.20],[1.80,1.31,.20]],.025,'wood');
 for(const r of [-.7,.7]){const x=box(.3,.035,.025,1.65,.64,.20);x.rotation.z=r;}
 for(let i=0;i<6;i++)box(.28,.22+i*.24,.40,.55+i*.27,.28+i*.12,-.64,'blue');
 disk(.34,.15,2.2,1.64,-.64);person(2.2,1.72,-.64,.9);
 for(const x of [-.40,.13]){const page=box(.51,.07,.68,x,.27,.72);page.rotation.z=x<0?-.1:.1;for(let i=0;i<5;i++)box(.36,.015,.015,x,.32,.47+i*.10,'shade');}
 return finish(60);
}
