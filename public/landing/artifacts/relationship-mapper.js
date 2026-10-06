import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
  const { box, disk, ball, line, person, finish } = sculpture(THREE);
  box(6,.17,2.7,0,.085,0,'paper');
  box(3.0,.18,2.55,-1.45,.26,0);box(1.82,.18,2.55,2.03,.26,0);
  line([[.3,.185,1.25],[.65,.185,.2],[.40,.185,-1.25]],.24,'blue');
  box(.96,.17,.45,-2.35,.43,.45,'red');box(.88,1.8,.075,-2.35,1.40,.44);
  person(-2.35,1.60,.50,.62,'shade');for(let i=0;i<5;i++)box(.66,.024,.016,-2.35,.80+i*.14,.49,'shade');
  for(let i=0;i<3;i++) {const h=.52+i*.36,x=-1.55+i*.63;box(.52,h,.72,x,.35+h/2,-.18);const badge=disk(.13,.02,x,.35+h*.70,.196,'paper');badge.rotation.x=Math.PI/2;}
  box(.50,.40,.16,-.29,1.80,-.18,'blue');box(.14,.06,.025,-.29,1.78,-.088,'paper');
  line([[-.41,2.0,-.18],[-.41,2.13,-.18],[-.17,2.13,-.18],[-.17,2.0,-.18]],.03,'blue');
  // Selected opportunity leads across the research channel to people worth approaching.
  for(const z of [-.47,.08]) {
    line([[-.03,1.38,z],[.55,1.46,z],[1.2,1.13,z],[1.5,.75,z]],.065,'red');
    line([[-.03,1.74,z],[.55,1.82,z],[1.2,1.49,z],[1.5,1.11,z]],.031,'red');
    for(const [x,y] of [[0,1.38],[.54,1.46],[1.07,1.22],[1.5,.75]]){line([[x,y,z],[x,y+.45,z]],.028,'red');ball(.045,x,y+.46,z,'red');}
  }
  for(let i=0;i<14;i++) {const t=i/13,x=t*1.5,y=1.38+.20*Math.sin(t*Math.PI)-.63*t;box(.115,.06,.57,x,y,-.195,'red');}
  disk(.65,.14,1.86,.43,.22);
  for(const [x,z,s] of [[1.58,.42,.73],[2.14,.42,.73],[1.86,-.14,.94]]) {
    const body=ball(.16*s,x,.69+s*.15,z);body.scale.y=1.65;ball(.16*s,x,.73+s*.52,z);
  }
  box(.50,.36,.08,2.55,.57,.72);line([[2.3,.75,.77],[2.55,.55,.77],[2.80,.75,.77]],.012,'shade');
  return finish(70);
}
