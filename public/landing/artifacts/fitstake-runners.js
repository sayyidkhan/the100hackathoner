import { medivoiceStudio } from './medivoice-studio.js';

// Articulated, smooth collectible athletes. Each rigid bone is batched separately,
// so details travel with the gait without adding a draw call for every finger/lace.
export function createFitStakeRunners(T, root) {
  const kit = medivoiceStudio(T);
  const jersey = kit.texture('cloth'); jersey.repeat.set(3, 3);
  const mat = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: .62, ...extra });
  const shared = {
    white: mat(0xf7f1e5), sole: mat(0xd9d7d0), ink: mat(0x17212c),
    eye: mat(0x281e1c, { roughness: .24 }), glint: mat(0xffffff),
    screen: mat(0x204b56, { roughness: .2, metalness: .2 }),
    red: mat(0xba283f, { bumpMap: jersey, bumpScale: .0018 }),
    blue: mat(0x2456a5, { bumpMap: jersey, bumpScale: .0018 }),
    redDark: mat(0x702535, { bumpMap: jersey, bumpScale: .0014 }),
    blueDark: mat(0x1b324f, { bumpMap: jersey, bumpScale: .0014 }),
  };
  function group(parent, x=0, y=0, z=0) { const g=new T.Group(); g.position.set(x,y,z); parent.add(g); return g; }
  function mesh(geometry, material, parent) { const o=new T.Mesh(geometry, material); o.castShadow=o.receiveShadow=true; parent.add(o); return o; }
  function ellipsoid(parent, material, x,y,z, sx,sy,sz) {
    const o=mesh(new T.SphereGeometry(1,28,20),material,parent);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;
  }
  function thread(parent, material, points, radius=.004) {
    return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(8,points.length*5),radius,6,false),material,parent);
  }
  // Smooth elliptical cross sections, sampled along a spline rather than a stack
  // of cylinders. End sections close inside adjoining anatomy/clothing.
  function form(parent, material, sections) {
    const curve=new T.CatmullRomCurve3(sections.map(([y,w,d])=>new T.Vector3(w,y,d)),false,'centripetal');
    const p=[], uv=[], ix=[], rows=32, around=32;
    for(let j=0;j<=rows;j++) {
      const v=curve.getPoint(j/rows);
      for(let i=0;i<=around;i++){const a=i/around*Math.PI*2;p.push(Math.max(.001,v.x)*Math.cos(a),v.y,Math.max(.001,v.z)*Math.sin(a));uv.push(i/around,j/rows);}
    }
    for(let j=0;j<rows;j++)for(let i=0;i<around;i++){const a=j*(around+1)+i,b=a+around+1;ix.push(a,b,a+1,b,b+1,a+1);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();return mesh(geo,material,parent);
  }
  function runner(x, color, phase, female) {
    const skin=mat(female?0xd6a17d:0xb8825f,{roughness:.69});
    const lip=mat(female?0xa76760:0x885347), hair=mat(female?0x342524:0x241f20,{roughness:.48});
    const hairLine=mat(female?0x543a30:0x3a2c27,{roughness:.54});
    const cloth=shared[color], dark=shared[`${color}Dark`];
    const g=group(root,x,.34,.56);g.name=`fitstake-athlete-${color}`;g.scale.setScalar(1.22);
    const body=group(g,0,1.02,0);body.name='torso';body.rotation.x=.10;
    // Pelvis, shaped technical jersey, shoulder seams and bound neckline.
    form(body,dark,[[-.14,.08,.08],[-.10,.18,.12],[.04,.20,.13],[.12,.17,.11]]);
    form(body,cloth,[[0,.177,.122],[.08,.18,.126],[.22,female?.163:.18,.116],[.40,female?.221:.24,.137],[.52,female?.241:.257,.13],[.58,.18,.108],[.62,.082,.076],[.625,.077,.071]]);
    form(body,skin,[[.57,.072,.066],[.65,.067,.062],[.73,.073,.064]]);
    const collar=mesh(new T.TorusGeometry(.079,.009,8,40),dark,body);collar.rotation.x=Math.PI/2;collar.position.y=.622;collar.scale.y=.91;
    thread(body,dark,[[-.164,.055,.078],[0,.048,.126],[.164,.055,.078]],.004);
    for(const side of [-1,1]){
      thread(body,dark,[[side*.20,.51,.093],[side*.195,.42,.108],[side*.16,.23,.083],[side*.173,.08,.065]],.003);
      thread(body,shared.white,[[side*.22,.54,.072],[side*.17,.57,.096],[side*.10,.59,.084]],.006);
    }
    // Small unbranded performance crest and chest stitching.
    thread(body,shared.white,[[.09,.46,.132],[.112,.435,.137],[.145,.475,.126]],.006);
    const head=group(body,0,.876,.012);head.name='head';
    form(head,skin,[[-.18,.035,.045],[-.163,female?.070:.080,.07],[-.125,female?.105:.118,.103],[-.06,.139,.125],[.025,.151,.137],[.11,.143,.131],[.178,.10,.093],[.204,.025,.024],[.206,.001,.001]]);
    // Subtle cheeks, ears, bridge/tip/nostrils, eyelids, brows and a relaxed mouth.
    for(const side of [-1,1]){
      ellipsoid(head,skin,side*.148,-.012,-.005,.027,.047,.024);
      ellipsoid(head,lip,side*.164,-.013,.009,.008,.025,.008);
      const eye=ellipsoid(head,shared.white,side*.057,.032,.131,.029,.012,.008);eye.rotation.z=side*.06;
      ellipsoid(head,shared.eye,side*.055,.032,.138,.011,.010,.005);
      ellipsoid(head,shared.glint,side*.055-.003,.036,.143,.0028,.0028,.002);
      thread(head,hair,[[side*.03,.043,.134],[side*.057,.047,.138],[side*.083,.038,.125]],.0035);
      thread(head,hair,[[side*.028,.078,.133],[side*.056,.086,.134],[side*.086,.077,.117]],female?.005:.007);
      ellipsoid(head,skin,side*.018,-.034,.147,.017,.012,.016);
      ellipsoid(head,lip,side*.014,-.041,.157,.005,.0027,.004);
    }
    ellipsoid(head,skin,0,.003,.141,.014,.042,.019);
    ellipsoid(head,skin,0,-.029,.163,.021,.015,.022);
    thread(head,lip,[[-.033,-.091,.113],[-.014,-.096,.125],[0,-.098,.128],[.014,-.096,.125],[.033,-.091,.113]],.0038);
    ellipsoid(head,lip,0,-.104,.121,.024,.004,.005);
    // Continuous scalp shell with a sculpted hairline; no exposed crown or helmet rim.
    const hp=[],hu=[],hi=[], rows=24, segments=48;
    function hairPoint(u,v,offset=0){
      const phi=u*Math.PI*2,front=Math.sin(phi),theta=v*(1.62-.46*front+.045*Math.sin(phi*3));
      const sweep=female?0:.025*Math.exp(-(((theta-.65)/.5)**2))*Math.max(0,front);
      return [(.174+offset)*Math.sin(theta)*Math.cos(phi),.019+(.216+offset)*Math.cos(theta)+sweep,(.166+offset)*Math.sin(theta)*Math.sin(phi)+sweep*.4];
    }
    for(let j=0;j<=rows;j++)for(let i=0;i<=segments;i++){hp.push(...hairPoint(i/segments,j/rows));hu.push(i/segments,j/rows);}
    for(let j=0;j<rows;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;hi.push(a,a+1,b,a+1,b+1,b);}
    const hg=new T.BufferGeometry();hg.setAttribute('position',new T.Float32BufferAttribute(hp,3));hg.setAttribute('uv',new T.Float32BufferAttribute(hu,2));hg.setIndex(hi);hg.computeVertexNormals();mesh(hg,hair,head);
    for(let k=0;k<16;k++)thread(head,hairLine,Array.from({length:9},(_,i)=>hairPoint(k/16+.018*Math.sin(i*.3),.20+i*.095,.0015)),.0015);
    if(female){
      const tail=group(head,0,.035,-.137);tail.name='ponytail';
      thread(tail,hair,[[0,.01,0],[0,-.01,-.10],[.02,-.12,-.18],[.04,-.27,-.19],[.025,-.36,-.17]],.052);
      ellipsoid(tail,hair,.025,-.35,-.17,.037,.061,.035);
      const tie=mesh(new T.TorusGeometry(.05,.008,8,24),cloth,tail);tie.position.set(0,-.005,-.055);
    }
    const arms=[], elbows=[], legs=[];
    for(const side of [-1,1]){
      const arm=group(body,side*(female?.229:.249),.515,0);arm.name=`arm-${side}`;
      form(arm,skin,[[-.335,.045,.044],[-.27,.052,.052],[-.15,.067,.065],[-.065,.079,.074],[.014,.068,.063],[.04,.025,.028]]);
      form(arm,cloth,[[-.115,.073,.073],[-.095,.082,.08],[-.035,.086,.083],[.015,.071,.068],[.045,.03,.03]]);
      thread(arm,dark,[[-.069,-.111,.03],[0,-.117,.075],[.069,-.111,.03]],.004);
      const elbow=group(arm,0,-.31,0);elbow.name='elbow';elbow.rotation.x=-.12;
      form(elbow,skin,[[-.306,.033,.033],[-.25,.037,.037],[-.13,.055,.05],[-.045,.058,.054],[.015,.049,.047],[.04,.023,.023]]);
      // A relaxed runner's hand: palm, four softly curled fingers and opposing thumb.
      const hand=group(elbow,0,-.31,0);hand.name='hand';hand.rotation.z=side*.12;hand.rotation.y=-side*Math.PI/2;
      ellipsoid(hand,skin,0,-.034,.004,.041,.057,.026);
      for(let f=0;f<4;f++){
        const fx=-.028+f*.018;
        thread(hand,skin,[[fx,-.055,.005],[fx,-.087,.010],[fx,-.089,.032],[fx,-.068,.043]],.010);
      }
      thread(hand,skin,[[side*.034,-.018,.005],[side*.052,-.044,.021],[side*.033,-.058,.041]],.014);
      if(side===-1){
        form(elbow,shared.ink,[[-.264,.04,.043],[-.221,.045,.046]]);
        const face=ellipsoid(elbow,shared.ink,0,-.242,.045,.039,.029,.010);
        ellipsoid(elbow,shared.screen,0,-.241,.053,.029,.020,.004);
        thread(elbow,shared.white,[[-.017,-.242,.058],[-.006,-.242,.058],[0,-.231,.058],[.007,-.249,.058],[.017,-.242,.058]],.0017);
      }
      arms.push(arm);
      elbows.push(elbow);
      const hip=group(g,side*.133,1.05,0);hip.name=`hip-${side}`;
      form(hip,skin,[[-.46,.055,.058],[-.39,.064,.070],[-.27,.087,.083],[-.13,.106,.101],[.005,.106,.100],[.065,.063,.065]]);
      form(hip,dark,[[-.22,.095,.096],[-.18,.104,.108],[-.07,.117,.115],[.04,.110,.108],[.095,.043,.052]]);
      thread(hip,cloth,[[side*.106,.02,.018],[side*.115,-.10,.02],[side*.099,-.21,.025]],.009);
      thread(hip,cloth,[[-.081,-.214,.042],[0,-.222,.096],[.081,-.214,.042]],.004);
      const knee=group(hip,0,-.43,0);knee.name='knee';
      form(knee,skin,[[-.445,.036,.042],[-.36,.039,.044],[-.23,.057,.061],[-.14,.069,.070],[-.045,.062,.062],[.025,.052,.052],[.06,.025,.025]]);
      form(knee,shared.white,[[-.45,.046,.050],[-.36,.045,.049],[-.31,.048,.050]]);
      const sock=mesh(new T.TorusGeometry(.049,.004,6,28),cloth,knee);sock.rotation.x=Math.PI/2;sock.position.y=-.324;
      // Sculpted heel/toe, layered midsole, heel tab and individual lace runs.
      const shoe=group(knee,0,-.465,.061);shoe.name='trainer';
      ellipsoid(shoe,shared.sole,0,-.033,.035,.085,.035,.166);
      ellipsoid(shoe,shared.white,0,-.017,.035,.087,.034,.167);
      ellipsoid(shoe,cloth,0,.012,.051,.080,.058,.140);
      ellipsoid(shoe,dark,0,.030,-.055,.072,.069,.061);
      ellipsoid(shoe,cloth,0,.058,-.017,.052,.055,.065);
      for(let j=0;j<4;j++)thread(shoe,shared.white,[[-.042,.071-j*.005,-.003+j*.023],[0,.079-j*.006,.005+j*.023],[.042,.071-j*.005,-.003+j*.023]],.0035);
      for(const edge of [-1,1])thread(shoe,shared.white,[[edge*.072,.026,-.048],[edge*.081,.020,.018],[edge*.065,.015,.09]],.006);
      legs.push({hip,knee});
    }
    g.rotation.y=x<0?.38:-.32;
    kit.batch(g);
    // Ground the planted trainer from its curved outsole, not from a body bob.
    // Work in the rig's local frame so orbiting the exhibit cannot move its feet.
    const contact=new T.Vector3();
    function ground(){
      let low=Infinity;
      for(const {hip,knee} of legs){
        hip.updateMatrix();knee.updateMatrix();
        for(let i=0;i<32;i++){
          const a=i*Math.PI/16;
          contact.set(0,-.498+.035*Math.cos(a),.096+.166*Math.sin(a));
          contact.applyMatrix4(knee.matrix).applyMatrix4(hip.matrix);
          low=Math.min(low,contact.y);
        }
      }
      g.position.y=.312-low*g.scale.y;
    }
    return {g,body,arms,elbows,legs,head,ponytail:head.getObjectByName('ponytail'),ground,phase};
  }
  const runners=[runner(-2.14,'red',.8,true),runner(2.14,'blue',Math.PI+.8,false)];
  // Only the batching/texture helpers are used from the shared modeling kit.
  Object.values(kit.materials).forEach(m=>m.dispose());
  return runners;
}
