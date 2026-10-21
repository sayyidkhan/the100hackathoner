// A deterministic 24-second consultation. Every pose is derived from scene time:
// pause, seeking, manual chapters and reduced motion share the same scene state.
export function animateCare(T,model,parts) {
  const {people,voiceBars,listening,summaryRows,ribbonCurves,ribbonMeshes,particles,cert,sealGroup,check,signature,monitor,glass}=parts;
  const duration=24,chapterDuration=6;
  const chapters=[
    {title:'Tell your story',detail:'The patient speaks; the voice assistant listens and asks follow-up questions.',tone:'flowing'},
    {title:'Turn speech into a case',detail:'Symptoms, context and history settle into a structured summary.',tone:'thinking'},
    {title:'A clinician reviews',detail:'The doctor checks the case and adds their notes before deciding.',tone:'thinking'},
    {title:'Approved, then delivered',detail:'The digital MC appears only after clinician approval.',tone:'complete'},
  ];
  const baseCert=cert.position.clone(),baseRows=summaryRows.map(g=>g.position.clone());
  const matrix=new T.Matrix4(),position=new T.Vector3(),rotation=new T.Quaternion(),scale=new T.Vector3();
  const clamp=(x)=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const envelope=(t,start,end,ramp=.7)=>ease((t-start)/ramp)*(1-ease((t-end)/ramp));
  const shots=[
    {x:-.80,y:.10,z:.08,distance:.88,yaw:-.04},
    {x:-.12,y:.20,z:.08,distance:.91,yaw:0},
    {x:.85,y:-.04,z:.16,distance:.87,yaw:.045},
    {x:1.05,y:-.14,z:.28,distance:.85,yaw:-.025},
  ];
  let manual=null,epoch=0;
  const checkCount=check.geometry.index?.count??check.geometry.attributes.position.count;
  const signatureCount=signature.geometry.index?.count??signature.geometry.attributes.position.count;
  function animate(seconds) {
    const elapsed=Math.max(0,seconds-epoch);
    const t=manual===null?elapsed%duration:manual*chapterDuration+Math.min(elapsed,5.1);
    const index=Math.min(3,Math.floor(t/chapterDuration));
    const motionTime=manual===null?t:elapsed;
    const talking=envelope(t,0,6),summarising=envelope(t,5.1,12),reviewing=envelope(t,11.8,18.3);
    const settle=ease((t-22.9)/1.1),approval=ease((t-18.4)/1.5)*(1-settle);
    // Audible rhythm is communicated visually; no microphone access or audio.
    voiceBars.forEach((bar,i)=>{
      const emphasis=Math.exp(-Math.pow((i-17)/12,2));
      bar.scale.y=.10+emphasis*(.18+talking*(.5+.38*Math.sin(motionTime*8+i*.71)+.15*Math.sin(motionTime*13-i*.38)));
    });
    listening.scale.setScalar(1+talking*.14*Math.sin(motionTime*3.5));
    // Body gestures stay small and grounded; heads follow the conversation.
    people.patient.head.rotation.x=-.04+talking*.04*Math.sin(motionTime*2.4);
    people.patient.head.rotation.y=-.10+talking*.065*Math.sin(motionTime*.8);
    people.patient.arms[1].rotation.x=-talking*(.11+.065*Math.sin(motionTime*2.2));
    people.patient.arms[1].rotation.z=-talking*.09;
    people.doctor.head.rotation.x=reviewing*(.12+.04*Math.sin(motionTime*1.4));
    people.doctor.head.rotation.y=-.14+reviewing*.06*Math.sin(motionTime*.9);
    people.doctor.arms[1].rotation.x=-reviewing*.055;
    people.doctor.arms[1].rotation.y=reviewing*.06*Math.sin(motionTime*5.5);
    people.doctor.arms[1].rotation.z=reviewing*.025*Math.sin(motionTime*8);
    // Voice ribbons breathe locally, while luminous packets actually travel.
    glass.opacity=.30+talking*.38+summarising*.15;
    ribbonMeshes.forEach((ribbon,j)=>{
      const a=ribbon.geometry.attributes.position,b=ribbon.userData.basePositions;
      for(let i=0;i<a.count;i++){
        const u=Math.floor(i/2)/64,wave=Math.sin(u*Math.PI)*Math.sin(motionTime*2.7-u*9+j)*.028*talking;
        a.setXYZ(i,b[i*3],b[i*3+1]+wave,b[i*3+2]+wave*.5);
      }
      a.needsUpdate=true;
    });
    for(let i=0;i<24;i++) {
      const lane=Math.floor(i/8),u=(motionTime*.32+(i%8)/8)%1;
      ribbonCurves[lane].getPoint(u,position);
      const pulse=(talking+summarising*.5)*Math.sin(u*Math.PI);
      scale.setScalar(Math.max(.0001,pulse*(i%8===0?1.7:1)));
      matrix.compose(position,rotation,scale);particles.setMatrixAt(i,matrix);
    }
    particles.instanceMatrix.needsUpdate=true;
    // Information is written in staggered rows, with a short settling lift.
    summaryRows.forEach((row,i)=>{
      const progress=ease((t-6.2-i*.8)/1.0)*(1-settle);
      row.visible=progress>.01;
      row.scale.setScalar(.82+.18*progress);
      row.position.copy(baseRows[i]);row.position.y+=(1-progress)*.055;
    });
    monitor.emissiveIntensity=.12+reviewing*.7;
    cert.visible=approval>.001;
    cert.scale.setScalar(.75+.25*approval);
    cert.position.copy(baseCert);cert.position.y+=approval*.29*(1-settle*.45);
    cert.rotation.y=-.13-approval*.10+approval*.025*Math.sin(motionTime*1.4);
    cert.rotation.x=-.13+approval*.065;
    // The seal lands after review; the signature traces onto the paper.
    const sealProgress=ease((t-19.1)/.8)*(1-settle);
    sealGroup.scale.setScalar(Math.max(.001,sealProgress));
    sealGroup.position.z=.09+(1-sealProgress)*.18;
    check.geometry.setDrawRange(0,Math.floor(checkCount*ease((t-19.6)/.65)*(1-settle)/3)*3);
    signature.geometry.setDrawRange(0,Math.floor(signatureCount*ease((t-18.6)/1.2)*(1-settle)/3)*3);
    // One continuous camera tour; dragging or keyboard orbit takes control.
    const previous=shots[Math.max(0,index-1)],next=shots[index],blend=ease((t-index*6)/1.3),enter=ease(t/1.4)*(1-settle);
    const cue={};
    for(const key of ['x','y','z','yaw'])cue[key]=T.MathUtils.lerp(previous[key],next[key],blend)*enter;
    cue.distance=1+(T.MathUtils.lerp(previous.distance,next.distance,blend)-1)*enter;
    model.userData.cameraCue=cue;
    model.userData.story={...chapters[index],index,step:`0${index+1} / 04`};
    model.userData.animationPhase=index;
    model.userData.animationTime=t;
  }
  model.userData.animate=animate;
  model.userData.animationDuration=duration;
  model.userData.setStep=(index,seconds=0)=>{
    manual=Number.isInteger(index)?Math.max(0,Math.min(3,index)):null;epoch=seconds;
    // On a paused/reduced-motion screen, chapter controls still show its result.
    if(manual!==null)epoch=seconds-3.4;
    animate(seconds);
  };
  animate(0);
}
