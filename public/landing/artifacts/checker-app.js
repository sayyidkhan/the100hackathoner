import { medivoiceStudio } from './medivoice-studio.js';
import { planningExhibitSurfaces } from './planning-exhibit-surfaces.js';
import { checkerSurfaces } from './checker-surfaces.js';

// A physical editorial workbench. The original app used keyword lists and a
// fixed sample rewrite, not AI generation or automatic candidate screening.
export function createArtifact(T) {
  const {root,materials:m,mesh,box,disk,ball,line,finish,texture}=medivoiceStudio(T);
  const surfaces=checkerSurfaces(T),preserved=[];
  const material=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  Object.assign(m,{
    stone:material(0xd5c6aa,.88),paper:material(0xf1e7d2,.82),edge:material(0xbfae8b,.8),
    brass:material(0xb99855,.3,.72),gold:material(0xe0c58a,.26,.76),darkBrass:material(0x6e532d,.43,.58),
    teal:material(0x173b39,.47),leather:material(0x24403c,.78),ink:material(0x4d5147,.75),
    wood:material(0xffffff,.65),coral:material(0xc46c58,.62),amber:material(0xd5b25e,.64),
    glass:new T.MeshPhysicalMaterial({color:0xe3ede3,roughness:.04,metalness:.02,transparent:true,opacity:.08,depthWrite:false,side:T.DoubleSide}),
  });
  m.stone.map=planningExhibitSurfaces(T).stone;m.stone.bumpMap=m.stone.map;m.stone.bumpScale=.022;
  m.paper.map=surfaces.paper;m.paper.bumpMap=texture('stone');m.paper.bumpScale=.004;
  m.leather.bumpMap=texture('cloth');m.leather.bumpScale=.006;m.brass.bumpMap=texture('wood');m.brass.bumpScale=.0015;
  m.wood.map=surfaces.wood;
  const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
  function rounded(w,h,d,x,y,z,color,parent=root,r=.045){
    r=Math.min(r,w/2-.001,h/2-.001);const s=new T.Shape();
    s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
    s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);
    s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:12}),color,parent);o.position.set(x,y,z);return o;
  }
  const ring=(r,t,x,y,z,color,parent=root)=>{const o=mesh(new T.TorusGeometry(r,t,12,96),color,parent);o.position.set(x,y,z);return o;};
  const coin=(r,h,x,y,z,color,parent=root)=>{const o=disk(r,h,x,y,z,color,parent);o.rotation.x=Math.PI/2;return o;};
  function face(map,w,h,x,y,z,parent,opacity=1){
    const material=new T.MeshStandardMaterial({map,color:map?0xffffff:0xece3cd,roughness:.78,bumpMap:texture('stone'),bumpScale:.006,transparent:opacity<1,opacity,depthWrite:opacity===1});
    const o=new T.Mesh(new T.PlaneGeometry(w,h,1,1),material);o.position.set(x,y,z);o.receiveShadow=true;parent.add(o);return o;
  }
  function text(value,w,x,y,z,parent=root,color='#e6d8b9'){
    const g=group(x,y,z,parent);g.name=`checker-label-${value}`;
    if(typeof document!=='undefined'){
      const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=150;const c=canvas.getContext('2d');
      c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font='500 90px Georgia';c.fillText(value,600,75,1160);
      const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
      const o=new T.Mesh(new T.PlaneGeometry(w,w*.125),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));g.add(o);
    }
    preserved.push(g);return g;
  }
  function screw(x,y,z,parent){coin(.033,.02,x,y,z,'gold',parent);const slot=box(.037,.006,.004,x,y,z+.014,'darkBrass',parent);slot.rotation.z=.4;}
  function paper(w,h,parent,x=0,y=0,z=0){
    const sheet=rounded(w,h,.013,x,y,z,'paper',parent,.045);
    // Raised deckled corner and a fine shadow seam, rather than a slab of white.
    line([[x+w*.30,y+h*.5-.012,z+.03],[x+w*.43,y+h*.5-.004,z+.033],[x+w*.49,y+h*.5-.014,z+.07]],.006,'edge',parent);
    return sheet;
  }
  function between(a,b,r,color,parent){
    const o=mesh(new T.CylinderGeometry(r,r,1,24),'brass',parent);o.material=m[color];
    const set=(aa,bb)=>{const v=new T.Vector3().subVectors(bb,aa);o.position.copy(aa).add(bb).multiplyScalar(.5);o.scale.y=v.length();o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());};set(a,b);return {object:o,set};
  }
  // Limestone floated over a walnut reveal, with a smaller inset leather desk pad.
  const plinth=rounded(6.55,3.25,.22,0,.08,0,'stone',root,.30);plinth.rotation.x=-Math.PI/2;
  const reveal=rounded(6.39,3.10,.065,0,.012,0,'wood',root,.26);reveal.rotation.x=-Math.PI/2;
  const pad=rounded(5.91,2.74,.018,0,.327,-.03,'leather',root,.19);pad.rotation.x=-Math.PI/2;
  for(const z of [-1.32,1.26])for(let i=0;i<69;i++)box(.028,.003,.008,-2.76+i*.081,.355,z,'edge');
  rounded(2.28,.30,.035,0,.17,1.642,'brass',root,.04);
  rounded(2.16,.218,.014,0,.17,1.69,'teal',root,.03);text('C H E C K E R',1.65,0,.17,1.72);
  for(const x of [-1.01,1.01])screw(x,.17,1.724,root);
  // The source document is now an actual readable proof, on a stitched teal folio.
  const board=group(-1.52,.38,-.35);board.rotation.x=-.10;board.rotation.y=.055;
  rounded(2.81,3.64,.10,0,1.84,-.10,'teal',board,.13);
  rounded(2.72,3.55,.022,0,1.84,.016,'brass',board,.10);
  rounded(2.65,3.48,.02,0,1.84,.055,'leather',board,.08);
  for(let i=0;i<8;i++)paper(2.54-i*.008,3.35-i*.004,board,Math.sin(i*2)*.012,1.84+i*.003,.09+i*.012);
  const draftFace=face(surfaces.draft,2.49,3.30,0,1.862,.205,board);preserved.push(draftFace);
  // Bent clip, folded lip, pin, spring barrel and slotted screws.
  rounded(1.27,.29,.085,0,3.48,.20,'brass',board,.05);
  rounded(1.18,.057,.08,0,3.335,.22,'gold',board,.02);
  rounded(.39,.39,.06,0,3.70,.16,'brass',board,.14);ring(.082,.025,0,3.76,.24,'gold',board);
  for(const x of [-.50,.50])screw(x,3.48,.30,board);
  for(let i=0;i<22;i++){const coil=ring(.045,.008,-.21+i*.02,3.63,.20,'darkBrass',board);coil.rotation.y=Math.PI/2;}
  rounded(2.91,.12,.60,0,.02,-.06,'brass',board,.05);
  const easel=between(new T.Vector3(0,.04,-.30),new T.Vector3(0,2.45,-.70),.055,'brass',board);
  // Source-row overlays stay on the paper; only marked words get colour.
  const highlights=[];
  for(const [name,w,x,y,color] of [['omit',.46,-.78,2.02,'coral'],['improve',1.31,-.36,1.58,'amber']]){
    const g=group(x,y,.214,board);g.name=`checker-${name}-highlight`;
    const plate=rounded(w,.142,.003,0,0,0,color,g,.013);plate.material=m[color].clone();plate.material.transparent=true;plate.material.opacity=.35;plate.material.depthWrite=false;
    preserved.push(g);highlights.push(g);
  }
  // A mounted magnifier with an actual enlarged view of the same document UVs.
  // Its two articulated brass links meet the moving lens throughout the scan.
  const inspection=group(0,0,0,board);inspection.name='checker-inspection-rig';preserved.push(inspection);
  coin(.11,.07,1.17,.38,.30,'brass',inspection);coin(.065,.02,1.17,.38,.35,'gold',inspection);
  const pivot=new T.Vector3(1.17,.38,.32),elbow=new T.Vector3(1.19,1.15,.33);
  const upper=between(pivot,elbow,.038,'brass',inspection),lower=between(elbow,new T.Vector3(-.30,1.7,.34),.03,'gold',inspection);
  const joint=ball(.064,elbow.x,elbow.y,elbow.z,'gold',inspection);
  const lens=group(-.56,2.10,.43,inspection);lens.name='checker-inspection-lens';
  ring(.594,.038,0,0,-.016,'brass',lens);
  // Open metal shell with an enlarged view of the same underlying paper.
  const lensMap=surfaces.draft?.clone();if(lensMap){lensMap.needsUpdate=true;lensMap.repeat.set(1.14/2.49/1.3,1.14/3.30/1.3);}
  const sampled=new T.Mesh(new T.CircleGeometry(.565,96),new T.MeshStandardMaterial({map:lensMap??null,color:lensMap?0xffffff:0xeee2c9,roughness:.64}));sampled.position.z=.040;sampled.userData.noShadow=true;lens.add(sampled);
  ring(.594,.025,0,0,.056,'gold',lens);ring(.565,.009,0,0,.065,'darkBrass',lens);
  const glint=mesh(new T.TorusGeometry(.54,.007,8,40,Math.PI*.33),'gold',lens);glint.position.z=.072;glint.rotation.z=.63;
  const glass=mesh(new T.CircleGeometry(.566,96),'glass',lens);glass.position.z=.067;glass.castShadow=false;glass.userData.noShadow=true;
  const grip=group(.43,-.43,.0,lens);grip.rotation.z=Math.PI/4;
  disk(.072,.16,0,-.06,0,'gold',grip);disk(.091,.49,0,-.38,0,'teal',grip);disk(.093,.055,0,-.65,0,'gold',grip);
  for(let i=0;i<6;i++)disk(.094,.008,0,-.20-i*.055,0,'darkBrass',grip);
  // The rewritten page is nearly equal in scale, creating an editorial before/after.
  const result=group(1.64,.38,-.27);result.rotation.x=-.11;result.rotation.y=-.07;
  rounded(2.34,3.17,.073,0,1.61,-.045,'wood',result,.09);
  rounded(2.26,3.09,.016,0,1.61,.04,'brass',result,.065);
  for(let i=0;i<6;i++)paper(2.18-i*.006,2.99-i*.006,result,i*.006,1.62+i*.002,.07+i*.015);
  const resultFace=face(surfaces.revised,2.13,2.94,.015,1.645,.18,result);preserved.push(resultFace);
  const rewriteCover=group(.015,1.40,.19,result);rewriteCover.name='checker-rewrite-reveal';
  paper(2.06,1.64,rewriteCover);rewriteCover.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.82;o.material.depthWrite=false;}});preserved.push(rewriteCover);
  rounded(2.46,.13,.55,0,.02,-.04,'brass',result,.045);
  for(const x of [-1.05,1.05]){rounded(.065,.28,.06,x,.15,.17,'gold',result,.025);}
  // Two annotation cards, not anonymous trays: the flag categories remain readable.
  const noteGroups=[];
  for(const [i,map,color] of [[0,surfaces.omit,'coral'],[1,surfaces.improve,'amber']]){
    const g=group(-.87+i*1.77,.39,1.04);g.rotation.x=-.72;
    rounded(1.61,.83,.035,0,.37,-.02,'brass',g,.065);
    paper(1.52,.75,g,0,.38,.03);
    const note=face(map,1.48,.71,0,.39,.063,g);preserved.push(note);
    const tab=rounded(.15,.28,.025,-.65,.70,.08,color,g,.025);
    const cover=group(0,.29,.083,g);cover.name=`checker-${i===0?'omit':'improve'}-note-cover`;paper(1.48,.42,cover);preserved.push(cover);noteGroups.push(cover);
    const clip=ring(.055,.009,.58,.72,.095,'gold',g);clip.scale.y=2.4;
  }
  // Editor's pencil and eraser add scale, tool detail and a grounded desk setting.
  const pencil=group(2.57,.48,.75);pencil.rotation.z=-Math.PI/2;pencil.rotation.x=.2;
  const shaft=mesh(new T.CylinderGeometry(.045,.045,1.06,6),'teal',pencil);shaft.position.y=.10;
  const tip=mesh(new T.ConeGeometry(.045,.17,16),'edge',pencil);tip.position.y=-.515;tip.rotation.x=Math.PI;
  const lead=mesh(new T.ConeGeometry(.013,.053,12),'ink',pencil);lead.position.y=-.617;lead.rotation.x=Math.PI;
  disk(.047,.12,0,.69,0,'brass',pencil);disk(.046,.105,0,.79,0,'coral',pencil);
  // All texture planes and animation groups survive the static material batching.
  root.updateMatrixWorld(true);preserved.forEach(o=>root.attach(o));
  const model=finish(18,preserved);
  const coverHomes=[rewriteCover,...noteGroups].map(o=>({p:o.position.clone(),s:o.scale.clone()}));
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10);};
  const phases=[
    ['Read the first draft','A sample job description includes wording that deserves a closer look.'],
    ['Check specific phrases','The original app compares wording against predefined keyword lists.'],
    ['Omit or improve','“female” is flagged for omission; “Pleasant personality” for more specific wording.'],
    ['Read the sample rewrite','The 2018 demo shows a fixed example: relevant duties and clearer requirements.'],
    ['Return to the draft','The tools settle before the next review.'],
  ];
  Object.assign(model.userData,{displayBase:false,groundLevel:0,studioProfile:'lrnmate',contactFootprint:false,initialYaw:-.12,initialElevation:.23,autoOrbit:false,realTimeAnimation:true,cycleDuration:20});
  let selectedTime=null,playbackOffset=0;
  model.userData.setStep=(index,elapsed=0)=>{
    if(index==null){if(selectedTime!==null)playbackOffset=elapsed-selectedTime;selectedTime=null;}
    else selectedTime=[0,4,9,14,18][Math.max(0,Math.min(4,Math.round(index)))];
  };
  model.userData.animate=time=>{
    const clock=selectedTime??(time-playbackOffset);
    const t=((clock%20)+20)%20,phase=t<2?0:t<7?1:t<11?2:t<16?3:4;
    const scan=t<2?0:t<7?smooth((t-2)/5):t<16?1:1-smooth((t-16)/3);
    lens.position.set(-.65+.42*scan,2.13-.50*scan,.43);
    const endpoint=new T.Vector3(lens.position.x+.40,lens.position.y-.40,.34);
    elbow.set(.89+.15*scan,1.08-.12*scan,.33);upper.set(pivot,elbow);lower.set(elbow,endpoint);joint.position.copy(elbow);
    if(lensMap){const rx=lensMap.repeat.x,ry=lensMap.repeat.y;lensMap.offset.set(.5+lens.position.x/2.49-rx/2,.5+(lens.position.y-1.862)/3.30-ry/2);}
    const omit=t>=3&&t<18,improve=t>=6&&t<18;highlights[0].visible=omit;highlights[1].visible=improve;
    const reveal=t<11?0:t<12.4?smooth((t-11)/1.4):t<17?1:1-smooth((t-17)/1.5);
    [reveal,omit?smooth((t-3)/.7):0,improve?smooth((t-6)/.7):0].forEach((amount,i)=>{
      const o=[rewriteCover,...noteGroups][i],home=coverHomes[i];o.position.copy(home.p);o.scale.copy(home.s);o.visible=amount<.999;
      // Slide a paper mask downward, exposing text naturally instead of stretching it.
      o.scale.y=home.s.y*Math.max(.001,1-amount);
      o.position.y-=amount*(i===0?.82:.21)*Math.cos(i===0?.11:.72);
      o.position.z+=amount*(i===0?.82:.21)*Math.sin(i===0?.11:.72);
    });
    model.userData.story={index:phase,step:`0${phase+1} / 05`,title:phases[phase][0],detail:phases[phase][1],tone:'neutral'};
  };
  model.userData.animate(0);return model;
}
