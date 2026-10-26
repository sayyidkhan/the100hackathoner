// Cutaway home: full-height rear architecture, open frontage and clear circulation.
export function buildDustbinHouse(T,k){
 const {root,mesh,box,disk,ball,line,group,rounded,slab,ring,m}=k;
 function rod(a,b,r,color,parent=root){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),o=mesh(new T.CylinderGeometry(r,r,d.length(),12),color,parent);o.position.copy(new T.Vector3(...a).addScaledVector(d,.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
 function soft(w,h,d,x,y,z,c,parent=root){const g=new T.SphereGeometry(1,32,20),p=g.attributes.position,f=v=>Math.sign(v)*Math.pow(Math.abs(v),.48);for(let i=0;i<p.count;i++)p.setXYZ(i,f(p.getX(i))*w,f(p.getY(i))*h,f(p.getZ(i))*d);g.computeVertexNormals();const o=mesh(g,c,parent);o.position.set(x,y,z);return o;}
 function plant(x,y,z,s=1,parent=root){const p=group(x,y,z,parent);p.scale.setScalar(s);const pot=mesh(new T.CylinderGeometry(.19,.14,.28,32),'cream',p);pot.position.y=.14;disk(.165,.015,0,.285,0,'walnut',p);for(let i=0;i<11;i++){const a=i*2.4,h=.4+(i%4)*.12,dx=Math.cos(a)*.22,dz=Math.sin(a)*.22;rod([0,.28,0],[dx,h,dz],.009,'green',p);const l=ball(1,dx,h,dz,'sage',p);l.scale.set(.075,.16,.025);l.rotation.set(.4,a,-.5*Math.cos(a));}return p;}
 function book(x,y,z,w,c,parent=root){slab(w,.35,.055,x,y,z,c,parent,.008);slab(w-.02,.33,.035,x,y+.04,z,'page',parent,.005);slab(w,.35,.012,x,y+.066,z,c,parent,.005);}
 function chair(x,z,angle){const p=group(x,.26,z);p.rotation.y=angle;for(const sx of [-1,1])for(const sz of [-1,1])rod([sx*.24,0,sz*.23],[sx*.20,.47,sz*.19],.025,'walnut',p);soft(.29,.07,.27,0,.49,0,'linen',p);soft(.29,.33,.06,0,.80,-.25,'sage',p);return p;}
 const obstacles=[];const obstacle=(name,x0,x1,z0,z1)=>obstacles.push({name,minX:x0,maxX:x1,minZ:z0,maxZ:z1});
 slab(10.7,10.6,.23,0,.10,1.35,'stone',root,.16);
 // Staggered boards with restrained seams, a thin walnut fascia and brass reveal.
 box(10.50,.14,.05,0,.16,6.57,'walnut');box(10.50,.016,.04,0,.23,6.59,'brass');
 for(let j=0;j<35;j++)for(let i=0;i<11;i++){const start=-5.245+i*1.05-(j%2)*.525,left=Math.max(-5.245,start),right=Math.min(5.245,start+1.05),z=-3.75+j*.30;if(right>left)box(right-left-.008,.035,.294,(left+right)/2,.244,z,'oak');}
 // Rear wall has real openings: garden window on the left and a paneled entry door.
 box(10.45,.72,.19,0,.62,-3.70,'cream');box(10.45,.40,.19,0,3.07,-3.70,'cream');
 for(const [x,w] of [[-4.88,.68],[1.925,6.55]])box(w,1.90,.19,x,1.91,-3.70,'cream');
 // Living-room bay window, recessed dark frames and soft curtains.
 rounded(3.20,1.88,.07,-2.95,1.91,-3.62,'walnut',root,.035);
 rounded(3.03,1.70,.028,-2.95,1.91,-3.57,'window',root,.02);
 for(const x of [-3.94,-2.95,-1.96])box(.035,1.69,.04,x,1.91,-3.52,'cream');box(3.03,.035,.04,-2.95,1.91,-3.52,'cream');
 slab(3.35,.35,.09,-2.95,1.02,-3.51,'stone');rod([-4.72,2.93,-3.36],[-1.18,2.93,-3.36],.026,'brass');
 for(const side of [-1,1])for(let i=0;i<8;i++){const x=-2.95+side*(1.38+i*.047);const c=mesh(new T.CylinderGeometry(.041,.052,1.90,12),'linen');c.position.set(x,1.92,-3.34+Math.sin(i)*.018);}
 // Front door and transom, with individual recessed panels and brass hardware.
 rounded(1.16,2.55,.075,.35,1.54,-3.56,'sage',root,.02);
 for(const y of [.95,2.02]){rounded(.91,.83,.035,.35,y,-3.50,'sage');rounded(.76,.68,.018,.35,y,-3.47,'sageDark');}
 rod([.76,1.30,-3.41],[.76,1.44,-3.41],.021,'brass');disk(.028,.04,.76,1.50,-3.42,'brass').rotation.x=Math.PI/2;
 box(1.30,.10,.24,.35,.30,-3.49,'walnut');slab(1.45,.58,.016,.35,.274,-3.0,'linen',root,.08);
 // Side walls are cut down toward the open front; vertical battens finish the cut.
 box(.18,2.96,2.70,-5.12,1.75,-2.40,'cream');box(.18,2.96,2.70,5.12,1.75,-2.40,'cream');
 for(const x of [-5.01,5.01]){box(.04,.14,2.72,x,.34,-2.4,'stone');box(.07,2.99,.10,x,1.75,-1.04,'oak');}
 box(10.25,.13,.04,0,.34,-3.57,'stone');box(10.45,.10,.26,0,3.28,-3.70,'stone');
 obstacle('rear wall',-5.3,5.3,-3.82,-3.47);obstacle('left wall',-5.3,-4.98,-3.8,-1.04);obstacle('right wall',4.98,5.3,-3.8,-1.04);
 // Sofa, three seat cushions, piping, throws and a woven rug.
 const sofa=group(-3.10,.265,-2.25);
 for(const x of [-1.1,1.1])for(const z of [-.42,.42])rod([x,0,z],[x,.23,z],.034,'walnut',sofa);
 soft(1.38,.18,.58,0,.28,0,'sage',sofa);soft(1.34,.43,.13,0,.85,-.49,'sage',sofa);
 for(let i=-1;i<=1;i++){soft(.40,.12,.44,i*.85,.54,.06,'linen',sofa);soft(.39,.31,.09,i*.85,.86,-.34,'linen',sofa);}
 for(const x of [-1.34,1.34])soft(.13,.29,.54,x,.67,0,'sage',sofa);
 const pillow=soft(.22,.24,.09,-.84,.87,-.16,'coral',sofa);pillow.rotation.z=-.18;
 slab(3.45,2.10,.012,-3.05,.273,-1.93,'rug',root,.13);
 for(let i=0;i<55;i++)for(const s of [-1,1])line([[-4.70+i*.06,.282,-1.93+s*1.03],[-4.70+i*.06,.282,-1.93+s*1.10]],.005,'linen');
 obstacle('sofa',-4.6,-1.6,-2.86,-1.62);
 // Coffee table stays at the left of the resident's collection space.
 slab(1.06,.65,.07,-4.15,.73,-.80,'walnut',root,.24);for(const x of [-4.49,-3.81])for(const z of [-1.0,-.60])rod([x,.27,z],[x,.71,z],.023,'walnut');
 book(-4.22,.78,-.79,.38,'coral');disk(.09,.014,-3.88,.78,-.78,'cream');
 obstacle('coffee table',-4.72,-3.57,-1.16,-.44);
 // Floor lamp with a lit linen shade, houseplant and framed art.
 disk(.23,.045,-4.66,.29,-1.10,'brass');rod([-4.66,.3,-1.10],[-4.66,2.02,-1.10],.022,'brass');const shade=mesh(new T.CylinderGeometry(.19,.31,.37,48,1,true),'linen');shade.position.set(-4.66,2.08,-1.1);ball(.10,-4.66,1.95,-1.1,'warmLight');
 plant(-4.66,.27,-3.04,1.4);
 // Study nook faces into the room, with a real writing desk and laptop.
 slab(1.85,2.30,.012,-3.94,.273,2.03,'rug',root,.12);
 const desk=group(-4.00,.265,2.0);desk.rotation.y=Math.PI/2;
 slab(1.65,.73,.085,0,.80,-.25,'walnut',desk,.05);for(const x of [-.68,.68])for(const z of [-.53,.02])rod([x,0,z],[x,.78,z],.028,'walnut',desk);
 rounded(.43,.22,.48,.52,.64,-.25,'oak',desk,.025);ball(.025,.52,.66,.005,'brass',desk);
 slab(.57,.39,.024,-.19,.857,-.25,'silver',desk,.02);const laptop=rounded(.57,.36,.022,-.19,1.04,-.43,'black',desk,.022);laptop.rotation.x=-.12;
 rounded(.52,.31,.008,-.19,1.043,-.411,'screen',desk,.012);for(let i=0;i<7;i++)box(.29-(i%3)*.05,.009,.004,-.24,1.14-i*.031,-.402,'sage',desk);
 book(.48,.86,-.27,.36,'blue',desk);plant(-.67,.85,-.40,.55,desk);
 chair(-3.70,2.0,Math.PI/2);obstacle('study desk',-4.62,-3.84,1.13,2.87);
 // Right-hand kitchen: terracotta tile floor, cabinets, backsplash, appliances.
 slab(2.18,4.55,.012,4.0,.269,-1.35,'tile',root,.03);
 for(let i=0;i<6;i++)for(let j=0;j<12;j++)box(.003,.004,.375,2.97+i*.36,.279,-3.42+j*.375,'cream');
 const kitchen=group(4.51,.265,-1.46);kitchen.rotation.y=-Math.PI/2;
 box(3.45,.82,.84,0,.49,0,'sage',kitchen);box(3.45,.12,.72,0,.10,0,'walnut',kitchen);
 for(let i=0;i<5;i++){const x=-1.38+i*.69;rounded(.65,.76,.035,x,.49,.439,'sage',kitchen,.02);rounded(.53,.62,.012,x,.49,.46,'sageDark',kitchen,.008);rod([x-.11,.72,.49],[x+.11,.72,.49],.012,'brass',kitchen);}
 slab(3.60,.97,.08,0,.94,0,'stone',kitchen,.025);
 slab(.93,.61,.016,-.25,.992,0,'silver',kitchen,.06);slab(.81,.49,.018,-.25,1.001,0,'dark',kitchen,.09);slab(.69,.38,.012,-.25,1.008,0,'silver',kitchen,.07);
 line([[-.25,1.0,-.32],[-.25,1.34,-.32],[-.25,1.42,-.20],[-.25,1.34,.01]],.018,'silver',kitchen);
 slab(.69,.64,.015,.99,.995,0,'black',kitchen,.018);for(const x of [.80,1.19])for(const z of [-.16,.16]){const burner=ring(.11,.009,x,1.01,z,'silver',kitchen);burner.rotation.x=-Math.PI/2;}
 disk(.15,.18,1.18,1.12,-.16,'coral',kitchen);disk(.16,.018,1.18,1.22,-.16,'brass',kitchen);ball(.027,1.18,1.25,-.16,'walnut',kitchen);
 plant(-1.40,1.0,0,.7,kitchen);const board=slab(.45,.33,.035,-.97,1.01,.02,'oak',kitchen,.06);for(let i=0;i<3;i++)ball(.055,-1.03+i*.08,1.07,.02,'coral',kitchen);
 for(let i=0;i<9;i++)for(let j=0;j<4;j++)box(.37,.19,.025,-1.58+i*.39,1.15+j*.21,-.46,'tile',kitchen);
 // Floating shelves with stacked plates, mugs and pantry jars.
 for(const y of [1.95,2.54]){slab(3.20,.37,.07,0,y,-.33,'oak',kitchen,.01);for(const x of [-1.2,1.2])rod([x,y-.16,-.45],[x,y,-.18],.014,'brass',kitchen);}
 for(let i=0;i<6;i++)disk(.19,.022,-1.0,2.01+i*.024,-.28,'cream',kitchen);
 for(let i=0;i<4;i++){disk(.09,.20,-.35+i*.25,2.09,-.28,'sage',kitchen);ring(.06,.012,-.25+i*.25,2.09,-.28,'brass',kitchen);}
 for(let i=0;i<5;i++){disk(.11,.26,-1.06+i*.5,2.71,-.29,i%2?'kraft':'cream',kitchen);disk(.12,.03,-1.06+i*.5,2.85,-.29,'walnut',kitchen);}
 obstacle('kitchen',4.02,5.02,-3.28,.35);
 // Tall refrigerator at the back makes the kitchen read as a room.
 rounded(1.10,2.52,.78,2.96,1.53,-3.10,'cream',root,.07);rounded(1.0,1.38,.035,2.96,1.98,-2.687,'cream');rounded(1.0,.94,.035,2.96,.78,-2.687,'cream');
 for(const y of [1.9,.89])rod([2.56,y-.17,-2.63],[2.56,y+.17,-2.63],.017,'silver');
 obstacle('refrigerator',2.36,3.56,-3.53,-2.64);
 // Back-wall gallery and practical details.
 for(const [x,y,w,h] of [[1.40,2.17,.52,.72],[-.83,2.15,.42,.57]]){rounded(w,h,.04,x,y,-3.56,'walnut');rounded(w-.06,h-.06,.02,x,y,-3.53,'page');const art=ball(.13,x,y,-3.51,'coral');art.scale.set(.8,1,.05);}
 plant(4.49,.27,.80,1.6);plant(-4.75,.27,3.18,1.35);
 // Small charging station at the front, with a single subtle status light.
 slab(1.31,.82,.025,0,.28,4.97,'sageDark',root,.18);box(.90,.17,.12,0,.36,5.30,'walnut');ball(.023,.31,.38,5.37,'light');
 return {obstacles,rod,soft,plant,chair};
}
