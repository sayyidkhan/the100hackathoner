// A roof-off apartment plan. Interior walls are cut down for viewing, while
// door frames retain their height and every opening is a real gap in the mesh.
export function buildDustbinRooms(T,k,house){
 const {root,m,box,disk,ball,mesh,line,group,rounded,slab,ring}=k;
 const {soft,rod,plant,obstacles}=house;
 m.bathTile=new T.MeshStandardMaterial({color:0xa8c3c4,roughness:.64});
 m.ceramic=new T.MeshStandardMaterial({color:0xf8f5ec,roughness:.20});
 m.duvet=new T.MeshStandardMaterial({color:0xb76950,roughness:.94,bumpMap:m.linen.bumpMap,bumpScale:.012});
 m.mirror=new T.MeshStandardMaterial({color:0xb5d1d5,roughness:.14,metalness:.35});
 m.showerGlass=new T.MeshPhysicalMaterial({color:0xb6d8da,transparent:true,opacity:.18,roughness:.12,depthWrite:false,side:T.DoubleSide});
 const doors=[];
 function wall(name,axis,at,start,end,h=1.25){
  const length=end-start,center=(start+end)/2,x=axis==='x'?at:center,z=axis==='x'?center:at;
  box(axis==='x'?.16:length,h,axis==='x'?length:.16,x,.265+h/2,z,'cream');
  box(axis==='x'?.19:length,.045,axis==='x'?length:.19,x,.29+h,z,'stone');
  for(const side of [-1,1])box(axis==='x'?.025:length,.11,axis==='x'?length:.025,x+(axis==='x'?side*.095:0),.33,z+(axis==='x'?0:side*.095),'stone');
  obstacles.push({name,minX:axis==='x'?at-.10:start,maxX:axis==='x'?at+.10:end,minZ:axis==='x'?start:at-.10,maxZ:axis==='x'?end:at+.10});
 }
 function doorway(name,axis,at,start,end,{leaf=false}={}){
  const c=(start+end)/2,w=end-start;
  const g=group(axis==='x'?at:c,.265,axis==='x'?c:at);if(axis==='x')g.rotation.y=Math.PI/2;
  for(const side of [-1,1])box(.07,2.25,.20,side*(w/2-.015),1.125,0,'oak',g);
  box(w+.05,.10,.20,0,2.30,0,'oak',g);slab(w,.23,.012,0,.006,0,'stone',g,.01);
  if(leaf){
   // Open leaf lies along its own wall, clear of the passage.
   const d=group(-w/2,0,0,g);d.rotation.y=-Math.PI/2;
   rounded(w-.14,2.16,.055,(w-.14)/2,1.10,0,'sage',d,.015);
   rounded(w-.34,1.82,.014,(w-.14)/2,1.10,.036,'sageDark',d,.008);
   rod([w-.34,1.02,.065],[w-.21,1.02,.065],.015,'brass',d);
  }
  doors.push({name,axis,at,start,end,height:2.25});
 }
 // Corridor from the back entry to the bedroom/bathroom at the front.
 wall('living partition north','x',-1.10,-3.57,-1.85,1.55);
 doorway('living room doorway','x',-1.10,-1.85,.20);
 wall('living partition south','x',-1.10,.20,1.15);
 doorway('bedroom doorway','x',-1.10,1.15,3.30);
 wall('bedroom corridor wall','x',-1.10,3.30,6.43);
 wall('kitchen partition north','x',1.15,-3.57,-1.75,1.55);
 doorway('kitchen doorway','x',1.15,-1.75,1.20);
 wall('bathroom corridor wall north','x',1.15,1.20,3.95);
 doorway('bathroom doorway','x',1.15,3.95,5.10,{leaf:true});
 wall('bathroom corridor wall south','x',1.15,5.10,6.43);
 // Each private room has its own hall entrance. No through-route across the bedroom.
 wall('bedroom rear partition','z',.45,-5.03,-1.10);
 wall('bathroom rear partition','z',1.43,1.15,5.03,1.35);
 // Cutaway exterior returns make the enclosed footprint unambiguous.
 for(const x of [-5.12,5.12])wall('outer side wall','x',x,-1.02,6.43,.88);
 wall('bedroom front cutaway','z',6.43,-5.12,-1.10,.50);
 wall('bathroom front cutaway','z',6.43,1.15,5.12,.50);
 wall('hall front cutaway','z',6.43,-1.10,1.15,.50);
 // Bedroom: bed, padded headboard, linen pillows, folded throw and bedside tables.
 const bed=group(-3.12,.265,4.82);bed.name='dustbin-bedroom-bed';
 for(const x of [-.90,.90])for(const z of [-1.13,1.13])box(.10,.22,.10,x,.11,z,'walnut',bed);
 slab(2.22,2.82,.22,0,.28,0,'oak',bed,.10);soft(1.06,.16,1.35,0,.51,0,'linen',bed);
 soft(1.02,.12,.91,0,.69,.40,'duvet',bed);
 rounded(2.25,1.20,.13,0,.76,-1.35,'walnut',bed,.08);soft(1.05,.44,.06,0,.88,-1.25,'sage',bed);
 for(const x of [-.51,.51]){const pillow=soft(.43,.12,.29,x,.77,-.83,'cream',bed);pillow.rotation.x=.10;}
 soft(1.04,.035,.26,0,.83,1.04,'linen',bed);
 for(let i=0;i<20;i++)line([[-.97+i*.103,.81,1.28],[-.97+i*.103,.74,1.35]],.007,'linen',bed);
 obstacles.push({name:'bed',minX:-4.26,maxX:-1.98,minZ:3.39,maxZ:6.25});
 for(const x of [-4.63,-1.60]){
  rounded(.48,.48,.48,x,.54,3.79,'walnut',root,.03);rounded(.41,.18,.02,x,.60,4.045,'oak');ball(.021,x,.61,4.07,'brass');
  disk(.11,.025,x,.81,3.80,'brass');rod([x,.82,3.80],[x,1.11,3.80],.015,'brass');const shade=mesh(new T.CylinderGeometry(.12,.18,.22,32),'linen');shade.position.set(x,1.14,3.80);
  obstacles.push({name:'bedside table',minX:x-.27,maxX:x+.27,minZ:3.52,maxZ:4.08});
 }
 // A compact wardrobe alongside the study area, outside the robot's turning space.
 rounded(.66,1.75,1.0,-4.68,1.16,5.40,'oak',root,.03);
 for(const z of [5.16,5.64]){box(.028,1.60,.43,-4.326,1.16,z,'walnut');rod([-4.29,1.02,z],[-4.29,1.28,z],.014,'brass');}
 obstacles.push({name:'wardrobe',minX:-5.03,maxX:-4.27,minZ:4.90,maxZ:5.90});
 // Bathroom is an enclosed tiled room with recognisable sanitary fixtures.
 slab(3.69,4.79,.016,3.10,.273,3.91,'bathTile',root,.02);
 for(let i=0;i<10;i++)for(let j=0;j<13;j++){
  const x=1.30+i*.37,z=1.55+j*.37;
  box(.355,.006,.355,x,.287,z,(i+j)%2?'bathTile':'tile');
 }
 // Toilet: cistern, pedestal, hollow bowl and an oval seat, facing the front.
 const wc=group(4.25,.29,2.08);wc.name='dustbin-bathroom-toilet';
 soft(.24,.25,.28,0,.25,.02,'ceramic',wc);
 const bowl=mesh(new T.LatheGeometry([new T.Vector2(.12,.15),new T.Vector2(.23,.25),new T.Vector2(.31,.48),new T.Vector2(.30,.52),new T.Vector2(.24,.52),new T.Vector2(.18,.37),new T.Vector2(.08,.32)],48),'ceramic',wc);bowl.scale.z=1.28;bowl.position.z=.20;
 const seat=ring(.277,.032,0,.535,.20,'ceramic',wc);seat.rotation.x=-Math.PI/2;seat.scale.y=1.28;
 disk(.12,.008,0,.33,.20,'window',wc);
 rounded(.53,.68,.25,0,.59,-.26,'ceramic',wc,.05);slab(.58,.30,.055,0,.95,-.26,'ceramic',wc,.035);disk(.035,.005,.13,.986,-.26,'silver',wc);
 // Paper holder and folded towels are mounted on the partition.
 rod([3.60,.91,1.56],[3.60,.91,1.78],.015,'brass');const paper=disk(.075,.16,3.60,.91,1.78,'page');paper.rotation.z=Math.PI/2;
 obstacles.push({name:'toilet',minX:3.90,maxX:4.61,minZ:1.67,maxZ:2.72});
 // Vanity and basin against the rear partition, with a large mirror above it.
 rounded(1.29,.66,.52,2.18,.67,1.85,'sage',root,.035);for(const x of [1.86,2.50]){rounded(.57,.53,.025,x,.67,2.13,'sageDark');ball(.023,x,.82,2.16,'brass');}
 slab(1.40,.67,.07,2.18,1.04,1.89,'stone',root,.04);
 const basin=mesh(new T.LatheGeometry([new T.Vector2(.13,0),new T.Vector2(.27,.08),new T.Vector2(.28,.14),new T.Vector2(.245,.14),new T.Vector2(.17,.045),new T.Vector2(0,.035)],48),'ceramic');basin.position.set(2.18,1.08,1.92);basin.scale.z=.76;
 line([[2.18,1.09,1.65],[2.18,1.43,1.65],[2.18,1.46,1.82],[2.18,1.35,1.87]],.015,'silver');
 box(1.45,2.12,.16,2.18,1.325,1.43,'bathTile');
 rounded(1.21,.87,.03,2.18,1.92,1.54,'brass',root,.10);rounded(1.14,.80,.012,2.18,1.92,1.56,'mirror',root,.09);
 line([[1.81,1.75,1.572],[2.10,2.15,1.572]],.006,'cream');line([[2.25,1.68,1.572],[2.54,2.08,1.572]],.006,'cream');
 obstacles.push({name:'vanity',minX:1.45,maxX:2.90,minZ:1.50,maxZ:2.25});
 // Walk-in shower tray, tiled wet wall, clear glass screen and brass shower set.
 slab(1.64,2.08,.07,4.08,.31,5.17,'ceramic',root,.05);
 disk(.065,.006,4.52,.352,5.82,'silver');
 box(.065,2.06,2.05,4.89,1.34,5.17,'bathTile');
 for(let j=0;j<7;j++)box(.014,.012,1.99,4.85,.45+j*.28,5.17,'cream');
 rod([4.78,1.18,5.78],[4.78,2.21,5.78],.017,'brass');rod([4.78,2.21,5.78],[4.38,2.21,5.78],.017,'brass');disk(.16,.026,4.38,2.19,5.78,'brass');
 disk(.055,.03,4.78,1.07,5.78,'brass').rotation.z=Math.PI/2;
 const glass=box(.025,1.95,1.22,3.27,1.34,5.60,'showerGlass');glass.castShadow=false;
 for(const z of [4.99,6.21])rod([3.27,.36,z],[3.27,2.32,z],.012,'brass');rod([3.27,2.32,4.99],[3.27,2.32,6.21],.012,'brass');
 obstacles.push({name:'shower',minX:3.20,maxX:4.96,minZ:4.08,maxZ:6.24});
 slab(1.06,.68,.012,2.53,.30,4.88,'linen',root,.09);
 // Laundry hamper, towel rail and a small plant complete the dry area.
 rounded(.48,.57,.48,1.65,.59,6.0,'linen',root,.05);slab(.50,.50,.04,1.65,.90,6.0,'oak',root,.03);
 rod([1.32,1.20,3.05],[1.32,1.20,3.65],.014,'brass');box(.035,.43,.40,1.35,.99,3.34,'linen');plant(2.72,1.09,1.85,.45);
 // Discreet room names on the floor keep the roof-off plan readable.
 function label(value,w,x,z){const g=k.text(value,w,x,.303,z,root,'#52625b');g.rotation.x=-Math.PI/2;}
 label('LIVING',1.15,-2.85,-.15);label('BEDROOM',1.48,-2.85,3.02);label('KITCHEN',1.25,3.02,.94);label('BATHROOM',1.48,3.06,3.32);label('HALL',.80,.03,5.90);
 return {doors,rooms:[{name:'living',minX:-5.03,maxX:-1.2,minZ:-3.55,maxZ:.35},{name:'bedroom',minX:-5.03,maxX:-1.2,minZ:.55,maxZ:6.33},{name:'kitchen',minX:1.25,maxX:5.03,minZ:-3.55,maxZ:1.33},{name:'bathroom',minX:1.25,maxX:5.03,minZ:1.53,maxZ:6.33}]};
}
