import { ATLAS_VENUE } from './buzo-atlas-paths.js';

// A miniature cultural palace: real recesses, glazing, masonry orders and a
// single continuous entrance terrace. All dimensions are in venue-local space.
export function buildAtlasVenue(THREE, {group,box,disk,ball,rod,path,torus,put,arch,lamp}) {
  const v=ATLAS_VENUE,TAU=Math.PI*2;
  const sphere=new THREE.SphereGeometry(1,16,10);
  const shaft=new THREE.CylinderGeometry(1,1,1,24);
  function column(x,y,z,h,r=.035){
    disk(r*1.7,.035,x,y+.018,z,'shadow');disk(r*1.55,.025,x,y+.047,z,'ivory');
    put(shaft,'ivory',x,y+h*.5,z,r,h-.12,r);
    for(let k=0;k<12;k++){
      const a=k/12*TAU;rod([x+Math.cos(a)*r,y+.09,z+Math.sin(a)*r],[x+Math.cos(a)*r,y+h-.08,z+Math.sin(a)*r],.0028,'edge');
    }
    disk(r*1.3,.025,x,y+h-.055,z,'ivory');
    box(r*3.5,.045,r*3.5,x,y+h-.02,z,'ivory');
    for(const side of [-1,1])ball(r*.43,x+side*r*1.3,y+h-.04,z+r*.7,'gold');
  }
  function glazing(x,y,z,w,h){
    // Dark inset and three stepped archivolts keep the lit panes recessed.
    put(arch(w+.10,h+.055,.024),'shadow',x,y-.025,z);
    put(arch(w,h,.012),'venueGlass',x,y,z+.025);
    put(arch(w+.10,h+.055,.035,.027),'ivory',x,y-.025,z+.043);
    put(arch(w+.055,h+.025,.022,.014),'gold',x,y-.012,z+.071);
    const r=w/2,spring=y+h-r;
    for(const dx of [-w*.25,0,w*.25]){
      const top=spring+Math.sqrt(r*r-dx*dx);
      box(.009,top-y,.016,x+dx,(top+y)/2,z+.052,'gold');
    }
    for(let yy=y+.13;yy<spring;yy+=.14)box(w,.009,.017,x,yy,z+.053,'gold');
    for(let i=0;i<7;i++){
      const a=i/6*Math.PI;
      rod([x,spring,z+.054],[x+Math.cos(a)*r,spring+Math.sin(a)*r,z+.054],.0045,'gold');
    }
    box(w+.14,.045,.12,x,y-.04,z+.035,'ivory');
    // Keystone at the crown, projecting beyond the surround.
    box(.06,.09,.065,x,y+h+.016,z+.085,'ivory');
  }
  function balustrade(a,b,y){
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.ceil(length/.09);
    for(let i=0;i<=count;i++){
      const u=i/count,x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u;
      disk(.013,.11,x,y+.055,z,'ivory');ball(.021,x,y+.055,z,'ivory',1,1.4,1);
    }
    rod([a[0],y+.12,a[1]],[b[0],y+.12,b[1]],.021,'ivory');
    rod([a[0],y,a[1]],[b[0],y,b[1]],.024,'ivory');
  }
  function urn(x,y,z){
    disk(.052,.035,x,y,z,'ivory');disk(.026,.06,x,y+.045,z,'ivory');
    put(sphere,'ivory',x,y+.10,z,.046,.055,.046);
    disk(.045,.018,x,y+.145,z,'gold');ball(.025,x,y+.18,z,'gold');
  }
  group(v.x,v.base,v.z,1,v.yaw,()=>{
    const floor=v.landing-v.base;
    box(1.55,.20,1.03,0,-.10,1.24,'stone');

    // Deep foundation and rusticated ground floor.
    box(2.12,.17,1.63,0,.13,0,'shadow');
    box(1.94,1.44,1.44,0,1.00,0,'stone');
    for(const y of [.24,.31,.79,1.65,1.72,1.79])box(2.04,y===1.72?.075:.035,1.54,0,y,0,'ivory');
    for(const side of [-1,1])for(let row=0;row<8;row++){
      const y=.39+row*.16;
      for(const z of [-.66,.66])box(.19,.13,.20,side*.91,y,z,'ivory');
    }
    // The central glazed hall rises above a distinct, human-scale entry storey.
    for(const x of [-.53,0,.53]){
      glazing(x,.86,.728,.34,.70);
      put(arch(.25,.37,.02),'ink',x,floor,.747);
      put(arch(.30,.40,.04,.025),'ivory',x,floor-.01,.764);
      box(.11,.28,.016,x-.06,floor+.14,.775,'burgundy');
      box(.11,.28,.016,x+.06,floor+.14,.775,'burgundy');
      box(.009,.28,.02,x,floor+.14,.789,'gold');
      for(const dx of [-.027,.027])ball(.009,x+dx,floor+.14,.80,'gold');
      box(.34,.035,.15,x,floor+.005,.79,'ivory');
    }
    for(const x of [-.79,-.265,.265,.79])column(x,.34,.83,1.30,.038);
    // Side galleries, with their own pilasters and tall divided windows.
    for(const side of [-1,1])group(side*.979,0,0,1,side*Math.PI/2,()=>{
      for(const x of [-.43,0,.43])glazing(x,.47,0,.27,1.03);
      for(const x of [-.65,-.215,.215,.65])column(x,.34,.06,1.30,.027);
    });
    // Long navy banners flank the front hall; small brass emblems are geometry.
    for(const side of [-1,1]){
      const x=side*.925;
      box(.13,.85,.018,x,1.09,.86,'navy');rod([x-.095,1.54,.87],[x+.095,1.54,.87],.011,'gold');
      path([[x-.066,.68,.876],[x,.63,.876],[x+.066,.68,.876]],.005,'gold');
      rod([x,.92,.88],[x,1.28,.88],.006,'gold');
      for(const yy of [1.00,1.10,1.20])for(const sign of [-1,1]){
        rod([x,yy,.88],[x+sign*.038,yy+.045,.88],.006,'gold');ball(.009,x+sign*.038,yy+.045,.88,'gold');
      }
    }
    // Dentil cornice, triangular frontispiece and relief medallion.
    for(let i=0;i<25;i++)box(.038,.052,.055,-.96+i*.08,1.68,.785,'ivory');
    for(const side of [-1,1])for(let i=0;i<17;i++)box(.055,.052,.038,side*1.01,1.68,-.64+i*.08,'ivory');
    const ped=new THREE.Shape();ped.moveTo(-.66,0);ped.lineTo(0,.29);ped.lineTo(.66,0);ped.closePath();
    put(new THREE.ExtrudeGeometry(ped,{depth:.11,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:1}),'ivory',0,1.73,.73);
    path([[-.66,1.73,.86],[0,2.02,.86],[.66,1.73,.86]],.018,'edge');
    put(new THREE.TorusGeometry(.066,.012,8,32),'gold',0,1.84,.859);
    ball(.047,0,1.84,.855,'stone',1,1,.25);
    for(const side of [-1,1])for(let i=0;i<4;i++)ball(.014,side*(.10+i*.045),1.82-i*.015,.86,'gold',1.5,.65,.4);
    // Roof terrace, balustrades and carved corner urns replace the toy turrets.
    box(1.96,.09,1.47,0,1.84,0,'shadow');
    balustrade([-.94,-.69],[.94,-.69],1.90);
    for(const side of [-1,1]){
      balustrade([side*.94,-.69],[side*.94,.69],1.90);
      balustrade([side*.94,.69],[side*.69,.69],1.90);
      for(const z of [-.69,.69]){box(.15,.16,.15,side*.94,1.96,z,'ivory');urn(side*.94,2.06,z);}
    }
    // Smooth ribbed dome on a drum with clerestory windows and a gilt lantern.
    disk(.70,.12,0,1.94,0,'ivory');disk(.66,.17,0,2.025,0,'navy');
    for(let i=0;i<24;i++){
      const a=i/24*TAU;
      group(Math.cos(a)*.665,1.97,Math.sin(a)*.665,1,Math.PI/2-a,()=>{
        box(.055,.095,.012,0,.04,0,'venueGlass');box(.012,.14,.025,.04,.04,.006,'ivory');
      });
    }
    torus(.69,.025,0,2.09,0,'gold');
    put(new THREE.SphereGeometry(.67,64,32,0,TAU,0,Math.PI/2),'navy',0,2.10,0,1,.73,1);
    for(let i=0;i<20;i++){
      const a=i/20*TAU;
      path(Array.from({length:25},(_,j)=>{const t=j/24*Math.PI/2;return [Math.cos(a)*.674*Math.sin(t),2.10+.493*Math.cos(t),Math.sin(a)*.674*Math.sin(t)];}),i%2?.004:.008,'gold',24);
    }
    disk(.105,.035,0,2.60,0,'gold');disk(.061,.13,0,2.68,0,'venueGlass');
    for(let i=0;i<8;i++){const a=i/8*TAU;rod([Math.cos(a)*.066,2.615,Math.sin(a)*.066],[Math.cos(a)*.066,2.76,Math.sin(a)*.066],.007,'gold');}
    put(new THREE.SphereGeometry(.085,24,12,0,TAU,0,Math.PI/2),'gold',0,2.755,0,1,.8,1);
    rod([0,2.80,0],[0,2.94,0],.012,'gold');ball(.027,0,2.93,0,'gold');
    // Broad upper landing receives the bridge from the side, never across stairs.
    box(2.13,floor,.39,0,floor/2,.955,'stone');
    box(2.16,.035,.42,0,floor-.0175,.955,'ivory');
    // Solid, equally spaced risers overlap their bases; every tread meets the next.
    const run=(v.stairBottom-v.stairTop)/v.steps,rise=floor/v.steps;
    for(let i=0;i<v.steps;i++){
      const height=(i+1)*rise,front=v.stairBottom-i*run;
      box(1.16,height,run+.006,0,height/2,front-run/2,'stone');
      box(1.18,.012,run+.012,0,height-.006,front-run/2+.002,'ivory');
    }
    // Lower arrival plaza is exactly flush with the garden promenade.
    box(1.73,.20,.34,0,-.10,1.75,'stone');box(1.76,.025,.36,0,-.0125,1.75,'ivory');
    for(const side of [-1,1]){
      // Solid sloped cheek walls define the stair edges and their transition.
      const cheek=new THREE.Shape();cheek.moveTo(v.stairTop,0);cheek.lineTo(v.stairBottom,0);
      cheek.lineTo(v.stairBottom,.10);cheek.lineTo(v.stairTop,floor+.10);cheek.closePath();
      group(side*.66,0,0,1,-Math.PI/2,()=>put(new THREE.ExtrudeGeometry(cheek,{depth:.09,bevelEnabled:false}),'ivory'));
      rod([side*.66,floor+.11,v.stairTop],[side*.66,.11,v.stairBottom],.022,'edge');
      box(.16,.15,.16,side*.69,.075,1.63,'ivory');urn(side*.69,.17,1.63);
      lamp(side*.90,floor,.89,.31);
    }
    // Quiet paving joints establish the entrance as a real place to arrive.
    for(const x of [-.6,-.3,0,.3,.6])box(.003,.002,.34,x,.002,1.75,'edge');
  });
}
