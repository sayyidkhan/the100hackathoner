import { medivoiceStudio } from './medivoice-studio.js';
import { planningExhibitSurfaces } from './planning-exhibit-surfaces.js';

// The 2018 prototype highlights two keyword lists and shows a fixed sample rewrite.
// This editorial sculpture tells that process without suggesting AI or a hiring score.
export function createArtifact(T) {
  const kit = medivoiceStudio(T);
  const { root, materials: m, mesh, box, disk, ball, line, finish, texture } = kit;
  const mat = (color, roughness = .65, metalness = 0) => new T.MeshStandardMaterial({color, roughness, metalness});
  Object.assign(m, {
    stone: mat(0xd8c5a1,.86), paper: mat(0xf1e6cc,.85), paperEdge: mat(0xbdae91,.78),
    brass: mat(0xaf8444,.3,.72), gold: mat(0xd1ac63,.24,.78), ink: mat(0x8e897a,.85),
    teal: mat(0x193f43,.31), coral: mat(0xc8624e,.6), amber: mat(0xd9a42f,.54),
    dark: mat(0x4c4130,.7), glass: new T.MeshPhysicalMaterial({color:0xd5e5e0,roughness:.08,transparent:true,opacity:.10,metalness:.05,side:T.DoubleSide,depthWrite:false}),
  });
  for(const key of ['stone','paper','paperEdge']) { m[key].bumpMap=texture('stone'); m[key].bumpScale=key==='stone'?.025:.008; }
  m.brass.bumpMap=texture('cloth');m.brass.bumpScale=.002;
  m.stone.map=planningExhibitSurfaces(T).stone;m.stone.bumpMap=m.stone.map;m.stone.bumpScale=.028;
  const preserved=[];
  const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
  const rounded=(w,h,d,x,y,z,color,parent=root,r=.07)=>{
    r=Math.min(r,w/2-.001,h/2-.001);const s=new T.Shape();
    s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
    s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);
    s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:3,curveSegments:12}),color,parent);o.position.set(x,y,z);return o;
  };
  const ring=(r,t,x,y,z,color,parent=root)=>{const o=mesh(new T.TorusGeometry(r,t,12,96),color,parent);o.position.set(x,y,z);return o;};
  const coin=(r,h,x,y,z,color,parent=root)=>{const o=disk(r,h,x,y,z,color,parent);o.rotation.x=Math.PI/2;return o;};
  function label(value,width,x,y,z,parent=root,color='#635336') {
    const g=group(x,y,z,parent);g.name=`checker-label-${value}`;preserved.push(g);
    if(typeof document!=='undefined'){
      const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;const ctx=canvas.getContext('2d');
      ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 96px Georgia';ctx.fillText(value,512,80,1000);
      const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
      const o=new T.Mesh(new T.PlaneGeometry(width,width*160/1024),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));g.add(o);
    }return g;
  }
  const base=rounded(6.55,3.10,.24,0,.02,0,'stone',root,.38);base.rotation.x=-Math.PI/2;
  const plaque=rounded(2.15,.39,.055,0,.14,1.56,'brass',root,.07);
  rounded(2.03,.29,.013,0,.14,1.626,'teal');
  label('C H E C K E R',1.54,0,.14,1.68,root,'#e8d6aa');
  for(const x of [-.94,.94]){ball(.04,x,.14,1.66,'gold');}
  // Clipboard with separate leaves and a real folded metal clip.
  const board=group(-1.88,.30,-.25);board.rotation.x=-.12;board.rotation.y=.045;
  rounded(2.31,3.2,.09,0,1.63,-.08,'brass',board,.075);
  for(let i=0;i<7;i++)rounded(2.23-i*.012,3.13-i*.008,.012,0,1.65,i*.017,'paper',board,.055);
  rounded(1.25,.27,.08,0,3.13,.14,'brass',board,.06);
  rounded(.37,.42,.07,0,3.37,.13,'brass',board,.14);
  ring(.082,.026,0,3.43,.232,'gold',board);
  for(const x of [-.50,.50]){coin(.045,.025,x,3.14,.235,'gold',board);box(.04,.006,.004,x,3.14,.25,'dark',board);}
  label('JOB AD',.77,-.55,2.82,.137,board);
  const widths=[1.31,1.77,1.5,1.7,1.72,1.48,1.70,1.44,1.74,1.61,1.58,1.40,1.65,1.24];
  widths.forEach((w,i)=>box(w,.04,.009,-.88+w/2,2.57-i*.16,.14,'ink',board));
  const marks=[];
  [['coral',1.93,.78,-.05],['amber',1.29,.66,-.48]].forEach(([c,y,w,x])=>{
    const g=group(x,y,.15,board);rounded(w,.095,.022,0,0,0,c,g,.025);preserved.push(g);marks.push(g);
  });
  // Easel support seen when the object is rotated.
  const support=box(.09,2.62,.10,0,1.35,-.50,'brass',board);support.rotation.x=-.28;
  rounded(2.42,.12,.58,0,.02,-.08,'brass',board);
  // Magnifier: a double machined rim, subtle glass, pivot and leather-like grip.
  disk(.36,.075,-.36,.34,.33,'brass');disk(.29,.025,-.36,.40,.33,'gold');
  disk(.075,.48,-.36,.66,.33,'brass');
  const mast=disk(.047,1,-.36,.90,.33,'gold');mast.name='checker-telescoping-stand';preserved.push(mast);
  const lens=group(-.48,2.05,.42);lens.name='checker-inspection-lens';
  ring(.75,.043,0,0,0,'brass',lens);ring(.716,.012,0,0,.045,'gold',lens);ring(.786,.013,0,0,-.025,'gold',lens);
  const glass=mesh(new T.CircleGeometry(.713,96),'glass',lens);glass.position.z=.018;glass.castShadow=false;
  const handle=group(.53,-.56,0,lens);handle.rotation.z=Math.PI/4;
  disk(.085,.18,0,-.07,0,'gold',handle);disk(.105,.75,0,-.52,0,'teal',handle);disk(.108,.09,0,-.91,0,'brass',handle);
  for(let i=0;i<14;i++)disk(.107,.008,0,-.2-i*.045,0,'teal',handle);
  ball(.09,.12,-.69,-.09,'gold',lens);preserved.push(lens);
  // Two categories in the original checker, represented by physical review trays.
  const trays=[];
  ['coral','amber'].forEach((c,i)=>{
    const g=group(-.68+i*1.37,.29,.94);trays.push(g);
    const floor=rounded(1.19,.83,.04,0,.015,0,'brass',g,.07);floor.rotation.x=-Math.PI/2;
    const lining=rounded(1.06,.71,.012,0,.064,0,c,g,.04);lining.rotation.x=-Math.PI/2;
    for(const x of [-.59,.59])rounded(.035,.16,.84,x,.11,-.41,'brass',g,.01);
    rounded(1.20,.18,.03,0,.12,-.42,'brass',g,.03);rounded(1.20,.105,.03,0,.075,.39,'brass',g,.03);
    for(let j=0;j<4;j++){
      const paper=rounded(.74,.48,.009,0,.10+j*.012,.02,'paper',g,.012);paper.rotation.x=-Math.PI/2;
    }
    const stripe=rounded(.54,.065,.008,0,.158,-.01,c,g,.01);stripe.rotation.x=-Math.PI/2;
  });
  // Smaller reviewed document: illustrative wording, never a candidate score.
  const review=group(2.13,.34,-.22);review.rotation.x=-.10;review.rotation.y=-.10;
  rounded(1.63,.13,.51,0,.03,-.05,'brass',review,.06);
  for(let j=0;j<5;j++)rounded(1.50,2.25,.014,j*.009,1.20,j*.018,'paper',review,.055);
  label('REVIEW',.90,0,2.06,.126,review);
  const output=group(0,0,.098,review);output.name='checker-reviewed-wording';preserved.push(output);
  [1.1,.65,1.01,1.06,.94,1.0,.61,.53].forEach((w,i)=>box(w,.041,.012,-.55+w/2,1.78-i*.145,0,'ink',output));
  const seal=group(.44,.51,.12,review);seal.name='checker-review-seal';
  coin(.24,.035,0,0,0,'brass',seal);coin(.211,.022,0,0,.027,'teal',seal);
  line([[-.12,0,.05],[-.035,-.08,.05],[.13,.105,.05]],.019,'gold',seal);preserved.push(seal);
  const connector=new T.CatmullRomCurve3([new T.Vector3(.28,2.0,-.18),new T.Vector3(.87,2.40,-.26),new T.Vector3(1.43,2.25,-.26)]);
  mesh(new T.TubeGeometry(connector,60,.016,8,false),'brass');
  const bead=ball(.065,0,0,0,'gold');bead.name='checker-edit-transfer';preserved.push(bead);
  // Every moving or transparent object is detached before the static meshes batch.
  root.updateMatrixWorld(true);preserved.forEach(g=>root.attach(g));
  const model=finish(18,preserved);
  const lensHome=lens.position.clone();const mastBaseY=mast.position.y-.5;const outputScale=output.scale.clone();const beadOffset=bead.position.clone();
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const phaseInfo=[
    ['Enter a job description','Start with the wording of a job advertisement.'],
    ['Inspect the wording','The prototype checks the text against predefined keyword lists.'],
    ['Two kinds of review','Coral flags wording to omit; amber flags wording to improve.'],
    ['Review the sample rewrite','The original demo displays an illustrative, fixed rewrite.'],
    ['Ready for another draft','A brief pause before the editing sequence repeats.'],
  ];
  Object.assign(model.userData,{displayBase:false,groundLevel:0,studioProfile:'lrnmate',contactFootprint:false,initialYaw:-.14,initialElevation:.25,autoOrbit:false,realTimeAnimation:true,cycleDuration:16});
  model.userData.animate=time=>{
    const t=((time%16)+16)%16;const phase=t<2?0:t<6?1:t<9?2:t<13?3:4;
    // Lens follows the text once, pauses for the flags, then quietly returns.
    const scan=t<2?0:t<6?smooth((t-2)/4):t<13?1:1-smooth((t-13)/2);
    lens.position.copy(lensHome);lens.position.y+=.34-.68*scan;
    const mastHeight=lens.position.y-.69-mastBaseY;
    mast.scale.y=mastHeight;mast.position.y=mastBaseY+mastHeight/2;
    marks[0].visible=t>=3.7&&t<15;marks[1].visible=t>=5&&t<15;
    const reveal=t<9?0:t<10?smooth(t-9):t<14?1:1-smooth(t-14);
    output.scale.copy(outputScale);output.scale.y=Math.max(.001,reveal);
    seal.scale.setScalar(Math.max(.001,reveal));seal.visible=reveal>0;
    bead.visible=t>=9&&t<10.5;bead.position.copy(connector.getPoint(smooth((t-9)/1.5))).add(beadOffset);
    model.userData.story={index:phase,step:`0${phase+1} / 05`,title:phaseInfo[phase][0],detail:phaseInfo[phase][1],tone:'neutral'};
  };
  model.userData.animate(0);return model;
}
