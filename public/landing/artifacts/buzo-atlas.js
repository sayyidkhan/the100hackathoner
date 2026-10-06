import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
  const { root, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  // Stacked contour-map sheets connect the cultural portfolio.
  const outline = new THREE.Shape();
  for(let i=0;i<=72;i++) {
    const t=i/72*Math.PI*2,r=3.05+.13*Math.sin(t*7)+.08*Math.cos(t*11);
    if(i)outline.lineTo(Math.cos(t)*r,Math.sin(t)*r*.85);else outline.moveTo(Math.cos(t)*r,Math.sin(t)*r*.85);
  }
  for(let i=0;i<4;i++) {
    const g=new THREE.ExtrudeGeometry(outline,{depth:.06,bevelEnabled:false});g.rotateX(-Math.PI/2);
    const m=mesh(g,i%2?'paper':'ivory');m.position.y=i*.065;m.scale.set(1-i*.015,1,1-i*.015);
  }
  // Blank ledger: a conceptual record of rights, obligations and decisions.
  for(const s of [-1,1]) {
    box(.89,.07,1.35,s*.46,.34,.32,'red');
    for(let j=0;j<9;j++){const p=box(.84,.025,1.26,s*.46,.40+j*.026,.32,j%2?'paper':'ivory');p.rotation.z=-s*.06;}
    for(let j=0;j<7;j++)box(.66,.006,.013,s*.46,.65,-.13+j*.13,'shade');
  }
  line([[0,.37,.88],[.08,.30,1.12],[.33,.29,1.26]],.045,'red');
  // Small stage, speaker stacks, folded curtain and truss.
  disk(.86,.16,-1.55,.34,-1.12,'paper');disk(.76,.08,-1.55,.46,-1.12);
  for(const x of [-2.2,-.9]) {
    box(.13,1.45,.14,x,1.20,-1.55);box(.28,.94,.27,x,.93,-.76);
    for(let j=0;j<3;j++){const cone=disk(.087,.018,x,.67+j*.26,-.613,'shade');cone.rotation.x=Math.PI/2;}
  }
  box(1.45,.13,.16,-1.55,1.90,-1.55);
  for(let j=0;j<12;j++) {const fold=mesh(new THREE.CylinderGeometry(.06,.06,1.24,12),'blue');fold.position.set(-2.12+j*.103,1.18,-1.57);}
  for(let j=0;j<4;j++) {line([[-2.1+j*.34,1.83,-1.52],[-2.1+j*.34,1.66,-1.38]],.022,'shade');ball(.065,-2.1+j*.34,1.62,-1.38);}
  // Framed artwork on its own island.
  disk(.68,.13,1.62,.34,-1.25,'paper');
  const art=new THREE.Group();root.add(art);art.position.set(1.62,.42,-1.25);art.rotation.y=-.18;
  box(1.0,1.5,.075,0,.75,0,'paper',art);
  for(const x of [-.54,.54])box(.09,1.65,.13,x,.77,.015,'red',art);
  for(const y of [-.02,1.56])box(1.17,.09,.13,0,y,.015,'red',art);
  box(.36,1.30,.02,-.23,.75,.055,'blue',art);
  const circle=disk(.25,.035,.18,1.07,.065,'blue',art);circle.rotation.x=Math.PI/2;
  const dot=disk(.13,.04,.18,1.07,.09,'ivory',art);dot.rotation.x=Math.PI/2;
  // Venue; doorway and pilasters represent a physical cultural asset.
  disk(.81,.12,1.65,.33,1.3,'paper');box(1.10,.82,.82,1.65,.85,1.25);
  box(1.25,.13,.98,1.65,1.32,1.25,'paper');
  box(.32,.61,.04,1.65,.77,1.68,'blue');
  for(const x of [1.2,2.1])box(.1,.82,.11,x,.88,1.71);
  for(let j=0;j<3;j++)box(.95-j*.08,.07,.32,1.65,.40+j*.07,1.98-j*.08);
  for(const [x,z] of [[-1.55,-.6],[1.35,-1.0],[1.25,1.3]])line([[x,.29,z],[x*.7,.29,z*.6],[0,.29,.3]],.043,'blue');
  for(const [x,z] of [[-2.35,1.0],[.0,-2.1],[2.5,-.2]]) {
    line([[x,.28,z],[x,.78,z]],.02,'shade');
    const flag=box(.22,.15,.025,x+.11,.70,z,'red');flag.rotation.y=-.25;
  }
  return finish(75);
}
