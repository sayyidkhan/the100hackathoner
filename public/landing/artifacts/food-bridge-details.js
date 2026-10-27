// Local material maps and small construction details for the food-court exhibit.
export function foodCourtSurfaces(T,m){
 const n=512;let seed=1402;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 function map(data,srgb=true){const t=new T.DataTexture(data,n,n);t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.generateMipmaps=true;t.anisotropy=8;t.needsUpdate=true;return t;}
 const wood=new Uint8Array(n*n*4),stone=new Uint8Array(n*n*4),height=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const i=(y*n+x)*4,g=Math.sin(x*.18+Math.sin(y*.016)*3)+.3*Math.sin(x*.63+Math.sin(y*.031)*2),grain=g*8+rnd()*5,v=238+rnd()*12;
  wood.set([112+grain,77+grain*.8,46+grain*.5,255],i);stone.set([v,v-5,v-15,255],i);height.set([126+grain,126+grain,126+grain,255],i);
 }
 for(let j=0;j<1500;j++){const x=rnd()*n,y=rnd()*n,r=.4+rnd()*2.4,t=rnd();for(let yy=Math.floor(y-r);yy<=y+r;yy++)for(let xx=Math.floor(x-r);xx<=x+r;xx++){if(((xx-x)/r)**2+((yy-y)/(r*.7))**2>1)continue;const i=(((yy+n)%n)*n+(xx+n)%n)*4;stone.set(t<.3?[141,127,101,255]:t<.6?[196,174,137,255]:[218,210,189,255],i);}}
 m.wood.map=map(wood);m.wood.color.setHex(0xffffff);m.wood.bumpMap=map(height,false);m.wood.bumpScale=.006;m.wood.roughness=.55;
 m.stone.map=map(stone);m.stone.color.setHex(0xffffff);m.stone.bumpScale=.002;m.stone.roughness=.65;
 m.tile.roughness=.34;m.tile.metalness=.03;
 m.glow.color.setHex(0x28694e);m.glow.emissive.setHex(0x28694e);m.glow.emissiveIntensity=.18;
 m.brass.color.setHex(0xb18d51);m.brass.roughness=.32;
 m.tofu.map=m.wood.map;m.tofu.color.setHex(0xffe1a8);m.tofu.roughness=.72;
 m.tomato.roughness=.36;m.cucumber.roughness=.40;
}
export function foodCourtDetails(T,k,g,index){
 const {box,disk,mesh,tube,ell,slab}=k;
 // Layered cornice and roof perimeter, soft counter edge, framed serving hatch.
 for(const y of [1.48,1.83])box(1.73,.035,.12,0,y,-.13,'brass',g);
 box(1.73,.055,1.12,0,1.82,-.04,'wood',g);
 for(const x of [-.79,.79]){box(.035,1.03,.04,x,.95,-.43,'brass',g);box(.032,.60,.025,x*.95,.41,.621,'brass',g);}
 box(1.51,.018,.018,0,.16,.63,'brass',g);box(1.51,.018,.018,0,.68,.63,'brass',g);
 // Under-canopy rail, serving trays and recognisable cooking equipment.
 box(1.45,.023,.025,0,1.34,-.38,'metal',g);
 for(let j=0;j<3;j++){const x=.08+j*.22;disk(.07,.013,x,.80,-.10,'metal',g);disk(.072,.11,x,.858,-.10,index===0?'wood':'metal',g);disk(.076,.018,x,.922,-.10,'brass',g);ell(x,.94,-.10,.016,.015,.016,'wood',g);}
 if(index===0){for(let j=0;j<3;j++){disk(.145,.075,.42,.82+j*.085,.25,'wood',g);const rim=mesh(new T.TorusGeometry(.147,.007,8,32),'brass',g);rim.position.set(.42,.86+j*.085,.25);rim.rotation.x=Math.PI/2;for(let n=0;n<7;n++)box(.19,.004,.006,.42,.866+j*.085,.19+n*.02,'cream',g);}}
 if(index===1){for(let j=0;j<3;j++){slab(.18,.20,.016,-.34+j*.24,.80,.29,'metal',g,.02);for(let n=0;n<5;n++)ell(-.39+j*.24+n*.023,.84,.30,.025,.035,.035,j===0?'tomato':j===1?'tofu':'leaf',g);}}
 if(index===2){slab(.49,.30,.025,.34,.80,.29,'metal',g,.02);for(let n=0;n<8;n++)box(.38,.012,.010,.34,.84,.17+n*.034,'ink',g);ell(.34,.88,.27,.13,.022,.048,'tofu',g);}
 // Stacked crockery and condiment bottles give every stall a working counter.
 for(let j=0;j<5;j++)disk(.07,.014,-.61,.81+j*.018,.28,'ceramic',g);
 for(let j=0;j<2;j++){disk(.025,.10,-.10+j*.09,.85,.49,j?'coral':'ink',g);disk(.018,.025,-.10+j*.09,.913,.49,'metal',g);}
 // Round cafe table outside the two outer stalls; the selected walkway remains open.
 if(index!==1){disk(.29,.045,0,.48,.97,'wood',g);disk(.035,.40,0,.26,.97,'metal',g);disk(.16,.024,0,.07,.97,'metal',g);disk(.035,.06,0,.535,.97,'metal',g);for(let j=0;j<3;j++)tube([[-.017+j*.017,.55,.97],[-.022+j*.022,.66,.97]],.003,'wood',g);}
}
