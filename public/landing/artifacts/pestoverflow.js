import {earlyStudio,ease} from './early-exhibit-studio.js';
import {pestMouse} from './pestoverflow-mouse.js';
export function createArtifact(T){
 const k=earlyStudio(T),{root,m,mesh,box,disk,ball,line,group,rounded,slab,ring,ellipsoid,text,base,finish}=k;
 m.enamel=new T.MeshStandardMaterial({color:0xd4c4a8,roughness:.48,bumpMap:k.texture('stone'),bumpScale:.006});
 m.pir=new T.MeshStandardMaterial({color:0xf5efdf,roughness:.38,flatShading:true});
 m.lens=new T.MeshPhysicalMaterial({color:0x151f30,roughness:.12,metalness:.2,clearcoat:1,clearcoatRoughness:.06});
 base('PestOverflow');
 // Staggered floor joints and wall footing seat the installation in a utility room.
 for(let i=0;i<7;i++)box(.009,.003,2.35,-3+i*.56,.294,-.40,'mortar');
 for(let i=0;i<4;i++)box(3.7,.003,.009,-1.3,.294,-1.38+i*.58,'mortar');
 rounded(2.75,.13,.18,-1.79,.35,-1.09,'stone');
 // Cutaway utility wall and pipework frame a real sensor prototype.
 box(2.6,2.65,.12,-1.8,1.61,-1.22,'mortar');
 for(let row=0;row<9;row++)for(let col=0;col<5;col++)rounded(.49,.255,.12,-2.83+col*.52+(row%2)*.12,.42+row*.29,-1.12,'brick',root,.023);
 line([[-2.79,.35,-.90],[-2.79,2.8,-.90]],.075,'brass');
 line([[-2.79,1.25,-.90],[-2.4,1.25,-.90],[-2.35,1.04,-.82],[-.93,1.04,-.82]],.065,'brass');
 for(let i=0;i<7;i++){const c=ring(.095,.019,-2.79,.5+i*.34,-.9,'brass');c.rotation.x=Math.PI/2;}
 ring(.16,.033,-2.79,1.4,-.71,'copper');line([[-2.95,1.4,-.71],[-2.63,1.4,-.71]],.018,'copper');
 rounded(.87,.83,.1,-1.7,2.25,-1,'silver');rounded(.73,.69,.08,-1.7,2.25,-.92,'black');
 for(let i=0;i<9;i++)box(.014,.64,.014,-2.02+i*.08,2.25,-.865,'brass');
 for(let i=0;i<8;i++)box(.68,.014,.014,-1.7,1.95+i*.085,-.86,'brass');
 // Open enclosure: deep recess, bezel and individually modelled electronics.
 // A genuine open shell: rear pan, four thick walls and a raised front gasket.
 rounded(2.05,2.66,.13,.02,1.68,-.60,'enamel',root,.17);
 rounded(1.81,2.39,.035,.02,1.68,-.513,'dark',root,.12);
 for(const x of [-.92,.96])rounded(.18,2.57,.68,x,1.68,-.24,'enamel',root,.07);
 for(const y of [.43,2.93])rounded(1.83,.18,.68,.02,y,-.24,'enamel',root,.065);
 for(const x of [-.80,.84])rounded(.025,2.27,.035,x,1.68,.115,'mortar',root,.01);
 for(const y of [.54,2.82])rounded(1.62,.025,.035,.02,y,.115,'mortar',root,.01);
 // Mounting standoffs leave an observable gap behind the electronics.
 for(const x of [-.63,.62])for(const y of [.63,1.53]){const stand=disk(.05,.26,x,y,-.30,'brass');stand.rotation.x=Math.PI/2;}
 for(const y of [1.03,2.39]){rounded(.13,.30,.12,-1.05,y,-.12,'brass',root,.03);line([[-1.05,y-.15,-.04],[-1.05,y+.15,-.04]],.03,'silver');}
 for(const x of [-.68,.72])slab(.24,.50,.045,x,.313,-.25,'brass');
 for(const y of [.69,.88,1.07,1.26])box(.012,.08,.29,1.058,y,-.27,'dark');
 for(const x of [-.87,.91])for(const y of [.51,2.85]){const screw=disk(.052,.025,x,y,.113,'brass');screw.rotation.x=Math.PI/2;box(.062,.008,.01,x,y,.13,'black');}
 rounded(1.43,1.03,.065,0,1.07,-.17,'green');
 rounded(.4,.4,.08,-.14,1.09,-.105,'black',root,.018);
 // GPIO header pins and solder lands, not decorative spheres.
 rounded(1.24,.13,.07,-.02,1.48,-.10,'black',root,.01);
 for(let row=0;row<2;row++)for(let i=0;i<18;i++){box(.013,.013,.11,-.60+i*.069,1.455+row*.055,-.025,'gold');}
 for(const x of [-.63,.62])for(const y of [.63,1.53]){ring(.036,.009,x,y,-.125,'gold');}
 for(let i=0;i<8;i++){box(.026,.014,.015,-.34+i*.054,.853,-.052,'silver');box(.014,.026,.015,-.367,.88+i*.052,-.052,'silver');}
 for(let i=0;i<3;i++){const cap=disk(.032,.08,-.54+i*.14,1.26,-.06,'silver');cap.rotation.x=Math.PI/2;ring(.025,.005,-.54+i*.14,1.26,-.012,'black');}
 text('PIR  /  GPIO 23',.64,-.24,1.67,-.10,root,'#d7c79c');
 for(let i=0;i<3;i++){rounded(.30,.23,.19,.58,1.38-i*.28,-.08,'silver',root,.025);rounded(.21,.13,.025,.58,1.38-i*.28,.027,'black',root,.01);}
 for(let i=0;i<12;i++){const x=-.61+(i%4)*.14,y=.73+Math.floor(i/4)*.17;box(.08,.045,.03,x,y,-.105,'silver');}
 for(let i=0;i<9;i++)line([[-.5+i*.09,.66,-.127],[-.5+i*.09,.85,-.127],[-.38+i*.06,.92,-.127]],.006,'gold');
 rounded(.83,.83,.08,-.38,2.23,-.13,'cream');
 const dome=mesh(new T.IcosahedronGeometry(.38,3),'pir');dome.position.set(-.38,2.23,-.04);dome.scale.z=.58;
 rounded(.50,.51,.12,.48,2.24,-.12,'brass');rounded(.43,.44,.1,.48,2.24,-.038,'black');ring(.15,.04,.48,2.24,.03,'silver');ellipsoid(.48,2.24,.045,.118,.118,.055,'lens');ring(.085,.012,.48,2.24,.098,'green');ring(.054,.006,.48,2.24,.10,'silver');
 line([[-.7,1.6,-.13],[-.8,1.8,-.13],[-.8,2.5,-.13],[-.42,2.68,-.13]],.025,'copper');
 line([[.7,1.6,-.12],[.82,1.8,-.12],[.62,1.98,-.12]],.025,'black');
 // A floor-mounted aperture observes the mouse's path.
 rounded(.33,.41,.16,-1.1,.53,.45,'black');ring(.09,.024,-1.1,.53,.545,'silver');
 const animal=pestMouse(T,k),mouse=animal.group;mouse.position.set(-2.5,.294,.75);
 // SMS phone and map relief; no implied computer-vision implementation.
 const phone=group(2.18,.30,.02);phone.rotation.y=-.10;
 slab(1.23,.8,.12,0,.06,0,'brass',phone);rounded(1.22,2.54,.16,0,1.42,0,'brass',phone,.16);rounded(1.13,2.45,.14,0,1.42,.09,'black',phone,.14);
 box(.27,.025,.02,0,2.52,.172,'silver',phone);rounded(.94,.75,.025,0,1.57,.18,'cream',phone);
 for(let i=0;i<4;i++){const road=box(.025,.64,.015,-.34+i*.23,1.57,.201,'mortar',phone);road.rotation.z=.4;}
 for(let i=0;i<3;i++)box(.82,.026,.016,0,1.35+i*.20,.204,'mortar',phone);
 const alert=group(0,2.15,.195,phone);ring(.13,.035,0,0,0,'coral',alert);box(.024,.13,.025,0,.015,.01,'cream',alert);ball(.017,0,-.085,.02,'cream',alert);
 const message=group(0,.81,.19,phone);rounded(.94,.46,.025,0,0,0,'cream',message);
 text('SENSOR LINK',.83,0,2.32,.212,phone,'#c8bca6');
 const pin=group(0,1.60,.23,phone);ring(.07,.027,0,.04,0,'coral',pin);const tip=mesh(new T.ConeGeometry(.055,.12,3),'coral',pin);tip.position.y=-.05;tip.rotation.z=Math.PI;
 const curve=new T.CatmullRomCurve3([new T.Vector3(.96,2.57,-.39),new T.Vector3(1.25,2.5,-.30),new T.Vector3(1.38,1.72,-.08),new T.Vector3(1.59,1.65,.03)]);
 mesh(new T.TubeGeometry(curve,48,.035,10,false),'brass');
 const pulse=ball(.07,0,0,0,'coral');const led=ball(.045,.75,1.72,-.15,'coral');
 // The SMS content appears with the notification, rather than announcing a pest at rest.
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#303b34';ctx.font='bold 37px sans-serif';ctx.textAlign='center';ctx.fillText('Pest detected',256,46);ctx.font='27px sans-serif';ctx.fillText('Utility room · Sensor 01',256,96);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const label=new T.Mesh(new T.PlaneGeometry(.84,.21),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));label.position.set(0,0,.035);message.add(label);
 }
 const out=finish(23,[mouse,alert,message,pin,pulse,led]);
 out.userData.initialYaw=-.10;out.userData.initialElevation=.23;
 const start=mouse.position.clone(),pulseOffset=pulse.position.clone(),messageRest=message.position.clone();
 out.userData.animate=t=>{const p=((t%14)+14)%14;const travel=p<3?ease(p/3):p<9.7?1:1-ease((p-9.7)/3);mouse.position.copy(start);mouse.position.x+=travel*.83;animal.animate(p,p<3?Math.sin(Math.PI*p/3):p>=9.7&&p<12.7?Math.sin(Math.PI*(p-9.7)/3):0);mouse.rotation.y=p<9?0:p<9.7?Math.PI*ease((p-9)/.7):p<12.7?Math.PI:Math.PI*(1-ease((p-12.7)/.7));alert.visible=p>=3&&p<10;const notification=ease((p-5)/.45)*(1-ease((p-9.5)/.5));message.visible=notification>.001;message.position.copy(messageRest);message.position.y-=(1-notification)*.10;message.scale.setScalar(Math.max(.001,notification));pin.visible=p>=5&&p<10;led.scale.setScalar(p>=3&&p<5?1.3: .65);pulse.visible=p>=3.7&&p<5;const q=curve.getPointAt(Math.max(0,Math.min(1,(p-3.7)/1.3)));pulse.position.copy(q).add(pulseOffset);};
 out.userData.animate(0);return out;
}
