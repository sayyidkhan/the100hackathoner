// Close-up architectural details for the Buzo event district.
export function addBuzoDetails(T, kit) {
  const {root,materials,mesh,box,disk,ball,line,slab,rod,group,ring,person,plant,mapHeight,k,s,g,p}=kit;
  const motion=[];
  // Golden inlay around the display, with a finer engraved edge.
  for(const r of [3.43,3.47]){const edge=ring(r,.008,0,.217,0,'wood');edge.rotation.x=Math.PI/2;edge.scale.y=.85;}
  for(let i=0;i<100;i++){
    const a=i*Math.PI*2/100;
    const mark=box(.010,.026,.006,Math.sin(a)*3.49,.078,Math.cos(a)*2.966,'stone');mark.rotation.y=a;
  }
  // Woven canopy edge and warmer joinery at the concierge counter.
  for(let i=0;i<40;i++){
    const a=i*Math.PI*2/40;
    ball(.021,Math.sin(a)*.67,1.36,Math.cos(a)*.67,'wood',k);
  }
  for(const x of [-.52,.52])for(const y of [.67,1.28])disk(.045,.025,x,y,.13,'wood',k);
  const serving=slab(.25,.015,.17,.29,.645,.22,'wood',k);serving.rotation.y=.15;
  disk(.036,.055,.29,.68,.23,'ivory',k);ring(.021,.006,.329,.69,.23,'wood',k);
  // An open guestbook with pages and a pencil.
  const book=slab(.20,.015,.15,-.27,.665,.30,'ivory',k);book.rotation.y=-.15;
  for(let i=0;i<4;i++)rod([-.33,.677,.25+i*.023],[-.23,.677,.25+i*.023],.002,'stone',k);
  rod([-.17,.684,.24],[-.12,.684,.37],.006,'wood',k);
  plant(-.54,.62,-.05,k);

  // A marquee, footlights and theatre seats create a complete venue.
  const pelmet=ring(.78,.075,0,1.37,-.39,'red',s,Math.PI);pelmet.scale.y=.29;
  for(let i=0;i<12;i++){
    const a=Math.PI*i/11;
    ball(.023,Math.cos(a)*.79,1.36+Math.sin(a)*.28,-.30,'lamp',s);
  }
  for(const x of [-.68,-.34,0,.34,.68]){
    disk(.028,.015,x,.215,.52,'wood',s);ball(.018,x,.229,.52,'lamp',s);
  }
  // Hanging velvet valances and tiebacks, rather than a flat red rectangle.
  for(let i=0;i<5;i++){
    const valance=ball(.16,-.60+i*.30,1.29,-.32,'curtain',s);valance.scale.set(1,.42,.35);
    line([[-.74+i*.30,1.30,-.25],[-.60+i*.30,1.22,-.25],[-.46+i*.30,1.30,-.25]],.009,'wood',s);
  }
  for(const side of [-1,1])for(let row=0;row<2;row++){
    const x=side*.64,z=.87+row*.24;
    slab(.20,.055,.16,x,.15,z,'red',s);slab(.20,.19,.035,x,.25,z-.07,'red',s);
    for(const dx of [-.07,.07])rod([x+dx,.03,z],[x+dx,.13,z],.012,'wood',s);
  }
  const musician=group('performer-motion',s.position.x-.28,s.position.y+.20,s.position.z-.04,true);
  const singer=person(0,0,0,.75,0,musician);
  // A small brass saxophone silhouette beside the microphone.
  line([[.08,.35,.13],[.14,.25,.16],[.16,.17,.17],[.23,.20,.17]],.018,'wood',singer);
  const bell=mesh(new T.ConeGeometry(.044,.07,16,1,true),'wood',singer);bell.position.set(.23,.23,.17);
  motion.push(t=>{musician.rotation.z=Math.sin(t*1.9)*.045;});

  // Gallery cornices, artwork labels, side glazing and a sculpture plinth.
  for(const y of [.16,1.28])slab(1.61,.035,.15,0,y,-.51,'stone',g);
  for(const x of [-.45,.18]){
    slab(.19,.047,.012,x,.34,-.397,'ivory',g);
    for(let i=0;i<2;i++)box(.11,.003,.002,x,.347-i*.012,-.389,'stone',g);
  }
  const sculpture=group('gallery-sculpture',.50,.13,.18,false,g);
  slab(.16,.20,.16,0,.10,0,'stone',sculpture);
  const loop=ring(.115,.026,0,.34,0,'wood',sculpture);loop.rotation.y=.4;loop.rotation.z=.25;
  ring(.072,.02,.015,.36,.01,'red',sculpture).rotation.y=-.4;
  // Small books and a leafy planter give the museum a lived-in entrance.
  for(let i=0;i<3;i++)slab(.12,.014,.10,.13,.34+i*.017,.30,i===1?'red':'paper',g);
  plant(-.68,.12,.40,g);
  const galleryGuest=group('gallery-guest-motion',g.position.x-.42,g.position.y+.11,g.position.z+.35,true);
  person(0,0,0,.61,.5,galleryGuest);
  motion.push(t=>{galleryGuest.rotation.y=.10+Math.sin(t*.5)*.12;});

  // Copper roof ribs, bunting, balustrades and garden beds around the pavilion.
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4,b=a+Math.PI/4;
    if(i===0||i===7)continue; // Keep the front entrance open.
    const start=[Math.sin(a)*.67,.54,Math.cos(a)*.67],end=[Math.sin(b)*.67,.54,Math.cos(b)*.67];
    rod(start,end,.018,'wood',p);
    for(let j=1;j<=3;j++){const f=j/4,x=start[0]+(end[0]-start[0])*f,z=start[2]+(end[2]-start[2])*f;rod([x,.16,z],[x,.53,z],.011,'ivory',p);}
  }
  // Festoon lights hang from the roof instead of floating in open space.
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4,b=a+Math.PI/4;
    const points=[[Math.sin(a)*.64,1.10,Math.cos(a)*.64],[Math.sin(a+.3927)*.64,.98,Math.cos(a+.3927)*.64],[Math.sin(b)*.64,1.10,Math.cos(b)*.64]];
    line(points,.005,'wood',p);
    ball(.020,points[1][0],.96,points[1][2],'lamp',p);
  }
  for(const side of [-1,1]){
    slab(.31,.11,.20,side*.73,.16,.34,'stone',p);
    for(let i=0;i<5;i++)ball(.064,side*.73+(i%3-1)*.075,.26+(i%2)*.035,.34+(i>2?.035:-.035),'foliage',p);
  }

  // Cypresses and layered tree canopies break up the skyline's repeated boxes.
  [[-2.70,-1.57,.95],[-2.62,.35,.75],[2.64,-.65,.95],[.90,-2.08,1.05],[2.40,1.55,.7]].forEach(([x,z,h])=>{
    rod([x,.28,z],[x,.28+h*.6,z],.022,'trunk');
    const crown=ball(.115,x,.28+h*.62,z,'foliage');crown.scale.set(.75,h*3,.8);
    for(let i=0;i<9;i++){const a=i*2.4,r=.075*(1-i/15);const tuft=ball(.06,x+Math.sin(a)*r,.48+i*h*.06,z+Math.cos(a)*r,i%3?'foliage':'leafLight');tuft.scale.y=1.2;}
  });
  // Terraced skyline with pitched roofs, arched portals and inset windows.
  const skyline=[[-2.49,-1.79,.34,.9],[-.27,-2.15,.31,.74],[.21,-2.18,.31,1.07],[.62,-2.08,.27,.72],[2.51,-1.62,.29,.8],[2.76,-.97,.30,.96]];
  skyline.forEach(([x,z,w,h],i)=>{
    const house=group('city-house',x,.27,z);
    slab(w,h,w*.83,0,h/2,0,'paper',house);
    const roof=mesh(new T.ConeGeometry(w*.78,.18,4),'stone',house);roof.rotation.y=Math.PI/4;roof.scale.z=.85;roof.position.y=h+.08;
    for(let row=0;row<Math.floor(h/.19);row++)for(const dx of [-w*.23,w*.23]){
      slab(.065,.11,.018,dx,.15+row*.18,w*.43,'stone',house);
      box(.038,.081,.006,dx,.15+row*.18,w*.442,'lamp',house);
      box(.004,.085,.009,dx,.15+row*.18,w*.45,'ivory',house);
    }
    if(i%2===0){slab(w+.055,.025,.10,0,h*.65,w*.45,'ivory',house);for(let n=0;n<5;n++)rod([-w*.48+n*w*.24,h*.65,w*.49],[-w*.48+n*w*.24,h*.65+.10,w*.49],.006,'wood',house);rod([-w*.48,h*.65+.10,w*.49],[w*.48,h*.65+.10,w*.49],.008,'wood',house);}
  });
  // A taller folded peak behind the compass echoes the paper-map reference.
  const fold=new T.BufferGeometry();
  fold.setAttribute('position',new T.Float32BufferAttribute([-.37,.5,-1.95,.30,1.22,-1.65,.72,.5,-1.75, -.37,.5,-1.95,-.40,.5,-.88,.30,1.22,-1.65, .30,1.22,-1.65,-.40,.5,-.88,.72,.5,-1.75],3));fold.computeVertexNormals();
  const paper=materials.paper.clone();paper.side=T.DoubleSide;
  const mountain=new T.Mesh(fold,paper);root.add(mountain);
  // Low meadow planting and scattered cobbles connect the separate buildings.
  const beds=[[-2.22,-.52],[-2.47,1.73],[2.49,.25],[1.10,1.98],[-.52,2.12],[.87,-1.75]];
  beds.forEach(([x,z],n)=>{
    slab(.36,.035,.22,x,.295,z,'stone');
    for(let i=0;i<12;i++){
      const a=i*2.399,r=.035*Math.sqrt(i);
      const stem=ball(.028,x+Math.cos(a)*r,.34+(i%3)*.025,z+Math.sin(a)*r*.65,i%4?'foliage':'leafLight');stem.scale.y=1.8;
      if(i%3===0)ball(.018,x+Math.cos(a)*r,.40+(i%3)*.025,z+Math.sin(a)*r*.65,n%2?'ivory':'red');
    }
  });
  // Small brass street lamps make routes legible in the evening.
  [[-.50,1.38],[.62,.82],[1.16,-.44],[-1.66,-.50],[2.27,.72]].forEach(([x,z])=>{
    const y=mapHeight(x)+.06;
    disk(.055,.025,x,y,z,'wood');rod([x,y,z],[x,y+.37,z],.013,'wood');
    disk(.061,.018,x,y+.44,z,'wood');
    ball(.036,x,y+.40,z,'lamp');
  });
  // Bring a little walking life to the open promenade.
  const walkerRoot=group('promenade-walkers',0,0,0,true);
  const walkers=[person(0,0,0,.46,0,walkerRoot),person(0,0,0,.43,0,walkerRoot)];
  const route=new T.CatmullRomCurve3([[-.70,2.12],[-.25,1.70],[.48,1.67],[.90,1.84]].map(([x,z])=>new T.Vector3(x,mapHeight(x)+.07,z)));
  walkers.forEach((w,i)=>w.position.copy(route.getPointAt(i*.45)));
  motion.push(t=>walkers.forEach((w,i)=>{
    const phase=(t/16+i*.45)%2,f=phase<=1?phase:2-phase;
    w.position.copy(route.getPointAt(f));w.position.y+=Math.abs(Math.sin(t*5+i))*.008;
    const tangent=route.getTangentAt(f);w.rotation.y=Math.atan2(tangent.x,tangent.z)+(phase>1?Math.PI:0);
  }));
  return t=>motion.forEach(update=>update(t));
}
