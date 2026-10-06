import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
  const { root, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  const base=disk(3.35,.16,0,.08,0,'paper'); base.scale.z=.77;
  for(const side of [-1,1]) {
    const cover=box(2.35,.1,3.25,side*1.17,.25,0,'red'); cover.rotation.z=side*.025;
    for(let layer=0;layer<10;layer++) {
      const geometry=new THREE.PlaneGeometry(2.26,3.12,24,8);
      const p=geometry.attributes.position;
      for(let i=0;i<p.count;i++) {
        const x=(p.getX(i)+1.13)*side;
        const z=p.getY(i);
        p.setXYZ(i,x,.34+layer*.025+Math.sin(Math.abs(x)/2.26*Math.PI)*.12,z);
      }
      geometry.computeVertexNormals(); mesh(geometry,layer%2?'ivory':'paper');
    }
  }
  // Upright photo walls hold abstract relief landscapes, never real personal photos.
  function photo(x,z,angle,w=1.45,h=1.65,variant=0) {
    const group=new THREE.Group(); root.add(group); group.position.set(x,.62,z); group.rotation.y=angle;
    box(w,h,.07,0,h/2,0,'ivory',group);
    box(w-.19,h-.28,.04,0,h/2,.055,'paper',group);
    box(w-.24,.45,.02,0,.45,.082,'blue',group);
    for(let i=0;i<3;i++) {
      const cone=mesh(new THREE.ConeGeometry(.27+i*.04,.45+i*.12,3),'blue',group);
      cone.scale.z=.14; cone.position.set((i-1)*.32,.86+i*.04,.10); cone.rotation.y=Math.PI;
    }
    const sun=disk(.11,.025,.4,1.37,.1,'shade',group); sun.rotation.x=Math.PI/2;
    if(variant) box(.22,.4,.06,-.35,h-.02,.09,'red',group);
    for(const dx of [-w/2+.05,w/2-.05]) box(.065,h,.08,dx,h/2,.045,'ivory',group);
    return group;
  }
  photo(-1.8,-.65,.6,1.35,1.9,1);
  photo(0,-1.15,0,1.7,1.95);
  photo(1.8,-.6,-.65,1.35,1.85,1);
  photo(-1.6,.95,-.23,1.28,1.45);
  disk(.53,.07,.1,.68,.65,'paper');
  for(const x of [-.13,.25]) { const body=ball(.20,x,.93,.65); body.scale.set(.8,1.35,.8); ball(.12,x,1.28,.65); }
  line([[-2,.83,-.5],[-1.1,1.2,-.3],[0,1.02,0],[.7,.82,.5],[1.7,1.12,.6],[2,1.45,-.6]],.065,'blue');
  const voice=new THREE.Group(); root.add(voice); voice.position.set(1.0,1.05,.42); voice.rotation.y=-.1;
  box(1.2,.43,.04,0,.2,0,'ivory',voice);
  for(let i=0;i<17;i++) box(.027,.07+Math.abs(Math.sin(i*1.73))*.22,.025,(i-8)*.057,.20,.03,'shade',voice);
  for(let i=0;i<4;i++){const card=box(.8,.04,1.0,2.5,.23+i*.05,.9,'ivory');card.rotation.y=.1+i*.09;}
  box(.64,.02,.7,2.5,.45,.85,'blue');
  return finish(77);
}
