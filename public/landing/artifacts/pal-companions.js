import { sculptFace } from './pal-faces.js';
import { buildHost } from './pal-host.js';
export function buildCompanions(w, emblem) {
  const {THREE,root,mesh,box,ball,disk,line,ring}=w;
  const cast=[buildHost(w)];
  function joint(parent,name,x,y,z){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
  function figure(x,z,color,role) {
    const g=joint(root,role,x,.28,z);
    g.rotation.y=Math.atan2(-x,-z);
    if(role==='writer')g.rotation.y=.65;
    if(role==='healer')g.rotation.y=-.55;
    if(role==='messenger')g.rotation.y=.50;
    if(role==='guardian')g.rotation.y=-.65;
    if(role==='reviewer')g.rotation.y=1.05;
    if(role==='strategist')g.rotation.y=-1.05;
    const cloth=color;
    // Boots stay articulated separately from all the rigid clothing details.
    for(const side of [-1,1]) {
      const foot=joint(g,side===1?'right-foot':'left-foot',side*.12,.095,.04);
      const boot=ball(.105,0,0,.04,'darkwood',foot);boot.scale.set(.85,.65,1.6);
      const arm=joint(g,side===1?'right-arm':'left-arm',side*.245,.61,.02);
      const sleeve=ball(.108,side*.015,-.10,0,cloth,arm,'cloth');sleeve.scale.set(1,1.65,1);
      ring(.075,.012,side*.018,-.22,.025,'cream',arm,'cloth');
      const hand=ball(.073,side*.018,-.25,.055,'skin',arm);hand.scale.set(.85,1.05,.8);
      ball(.032,-side*.038,-.23,.075,'skin',arm);
      for(let j=0;j<3;j++)line([[side*.018-.03+j*.022,-.27,.109],[side*.018-.03+j*.022,-.30,.103]],.004,'rose',arm);
    }
    const body=mesh(new THREE.CylinderGeometry(.18,.255,.45,32,5),cloth,g,'cloth');body.position.y=.39;
    const p=body.geometry.attributes.position;
    for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),f=1+Math.cos(a*12)*.025;p.setX(i,p.getX(i)*f);p.setZ(i,p.getZ(i)*f);}body.geometry.computeVertexNormals();
    ring(.247,.013,0,.17,0,'honey',g,'cloth');
    {
      const vest=mesh(new THREE.CylinderGeometry(.195,.228,.27,24,1,true,.48,Math.PI*2-.96),role==='guardian'?'navy':'wood',g,'cloth');vest.position.y=.47;
      ring(.22,.023,0,.36,0,'darkwood',g,'wood');box(.067,.057,.018,0,.36,.227,'gold',g,'metal');
      const pouch=ball(.09,-.21,.29,.12,'honey',g,'wood');pouch.scale.set(.7,1,1);ball(.015,-.21,.32,.20,'gold',g,'metal',8);
    }
    for(let i=0;i<4;i++)ball(.012,0,.55-i*.075,.20,'honey',g,'metal',8);
    const head=joint(g,'head',0,.67,0);
    sculptFace(w,head,role);
    if(role==='guardian') {
      const helmet=mesh(new THREE.SphereGeometry(.225,24,12,0,Math.PI*2,0,Math.PI/2),'steel',head,'metal');helmet.position.y=.24;
      ring(.23,.022,0,.24,0,'steel',head,'metal');
      line([[0,.24,.226],[0,.40,.14],[0,.465,0],[0,.40,-.14]],.014,'gold',head,'metal');
      for(const side of [-1,1])box(.055,.13,.07,side*.21,.19,.01,'steel',head,'metal');
    } else if(role==='healer') {
      const cap=mesh(new THREE.SphereGeometry(.23,32,20),'cream',head,'cloth');cap.position.y=.32;cap.scale.y=.62;
      ring(.21,.025,0,.26,0,'cream',head,'cloth');
      box(.039,.12,.018,0,.33,.232,'red',head,'cloth');box(.11,.038,.018,0,.33,.232,'red',head,'cloth');
    } else {
      const hatColor=role==='writer'?'navy':role==='strategist'?'green':role==='builder'?'darkwood':role==='reviewer'?'honey':'red';
      const brim=disk(role==='reviewer'?.31:.26,.045,0,.27,0,hatColor,head,'cloth',32);brim.rotation.z=role==='writer'?-.16:.08;
      const profiles=role==='messenger'?[[.21,0],[.19,.10],[.13,.23],[.08,.33],[.015,.39]]
        :role==='writer'?[[.20,0],[.22,.10],[.16,.18],[.03,.19]]
        :role==='builder'?[[.19,0],[.23,.09],[.15,.16],[.02,.17]]
        :[[.20,0],[.17,.13],[.10,.23],[.01,.26]];
      profiles.push([0,profiles.at(-1)[1]+.003]);
      const profileCurve=new THREE.SplineCurve(profiles.map(v=>new THREE.Vector2(...v)));
      const geo=new THREE.LatheGeometry(profileCurve.getPoints(24),40),p=geo.attributes.position;
      for(let i=0;i<p.count;i++)p.setX(i,p.getX(i)+p.getY(i)**2*(role==='messenger'?-1.8:.4));geo.computeVertexNormals();
      const cap=mesh(geo,hatColor,head,'cloth');cap.position.y=.28;
      ring(.205,.014,0,.31,0,role==='writer'?'gold':'wood',head,'cloth');
      if(role==='writer'||role==='strategist') {
        line([[-.18,.30,0],[-.23,.59,-.02]],.008,'honey',head);
        const feather=ball(.07,-.22,.49,-.02,'cream',head,'cloth');feather.scale.set(.5,1.8,.13);feather.rotation.z=.28;
      }
    }
    cast.push(g);return g;
  }
  const roles=['messenger','writer','reviewer','builder','strategist','guardian','healer'];
  const colors=['red','navy','cream','cream','green','navy','cream'];
  const angles=[-2.20,-1.42,-.72,0,.72,1.42,2.20];
  roles.forEach((role,i)=>{
    const a=angles[i],x=Math.sin(a)*1.62,z=Math.cos(a)*1.48,g=figure(x,z,colors[i],role);
    // Low stools and visible legs anchor the council to the paved courtyard.
    disk(.24,.065,x,.35,z,'honey',root,'wood',24);
    for(const side of [-1,1])for(const end of [-1,1])box(.045,.19,.045,x+side*.14,.28,z+end*.13,'wood',root,'wood');
    const tool=joint(g,'working-tool',0,.5,.25);
    if(role==='messenger') {
      line([[.26,-.06,-.08],[.28,.46,-.08]],.018,'wood',tool,'wood');
      const bubble=ball(.14,.28,.49,-.08,'cream',tool);bubble.scale.set(1,1,.22);
      for(let j=0;j<3;j++)ball(.012,.23+j*.05,.49,-.045,'gold',tool,'metal',8);
    } else if(role==='writer') {
      for(const side of [-1,1]) {
        const page=box(.18,.035,.24,side*.09,.04,.07,'cream',tool,'cloth');page.rotation.z=side*.16;
        for(let j=0;j<4;j++)line([[side*.025,.066,.00+j*.035],[side*.15,.085,.00+j*.035]],.003,'mortar',tool);
      }
      line([[.24,-.03,.05],[.31,.35,.02]],.012,'wood',tool,'wood');
      const quill=ball(.07,.31,.30,.02,'cream',tool,'cloth');quill.scale.set(.5,1.8,.15);quill.rotation.z=-.3;
    } else if(role==='reviewer') {
      line([[.24,-.12,.02],[.28,.18,.03]],.022,'darkwood',tool,'wood');
      const lens=ring(.11,.018,.28,.29,.03,'gold',tool);lens.rotation.x=0;
      line([[.22,.32,.031],[.24,.36,.031],[.28,.37,.031]],.006,'cream',tool);
    } else if(role==='builder') {
      box(.04,.37,.04,.25,.11,0,'honey',tool,'wood');box(.25,.12,.12,.25,.30,0,'steel',tool,'metal');
      for(const side of [-1,1])box(.027,.13,.13,.25+side*.11,.30,0,'darkwood',tool,'wood');
    } else if(role==='strategist') {
      box(.39,.29,.015,0,.03,.08,'cream',tool,'cloth',.005);
      for(let j=0;j<4;j++)line([[-.16,-.07+j*.055,.09],[.16,-.07+j*.055,.09]],.0025,'mortar',tool);
      line([[-.15,-.06,.095],[-.04,.08,.095],[.07,.01,.095],[.15,.12,.095]],.008,'navy',tool);
      ring(.10,.016,-.2,.03,.08,'cream',tool,'cloth').rotation.x=0;
    } else if(role==='guardian') {
      function shield(scale,color,z) {
        const s=new THREE.Shape();s.moveTo(-.18*scale,.18*scale);s.lineTo(.18*scale,.18*scale);s.lineTo(.16*scale,-.08*scale);s.quadraticCurveTo(.10*scale,-.20*scale,0,-.25*scale);s.quadraticCurveTo(-.10*scale,-.20*scale,-.16*scale,-.08*scale);s.closePath();
        const m=mesh(new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelThickness:.007,bevelSize:.008,bevelSegments:1,steps:1,curveSegments:5}),color,tool,color==='steel'?'metal':'cloth');m.position.set(.10,.04,z);
      }
      shield(1.1,'steel',.04);shield(.91,'navy',.075);emblem(.10,.015,.115,.105,tool);
    } else {
      box(.31,.22,.17,.15,-.08,.04,'honey',tool,'wood');
      line([[.05,.03,.04],[.05,.12,.04],[.25,.12,.04],[.25,.03,.04]],.018,'darkwood',tool,'wood');
      for(let j=0;j<5;j++){const x=.04+j*.045;line([[x,.02,.05],[x-.03,.28,.05]],.007,'leaf',tool);for(let k=0;k<3;k++){const leaf=ball(.035,x-.015,.10+k*.055,.05,'olive',tool);leaf.scale.set(.7,1.5,.3);leaf.rotation.z=k%2?.6:-.6;}}
    }
  });
  return cast;
}
