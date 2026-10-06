import { sculpture } from './sculpture.js';
export function createArtifact(THREE) {
 const {mesh,box,ball,line,person,finish}=sculpture(THREE);
 box(5.5,.18,3.5,0,.09,0,'paper');for(let i=0;i<4;i++)box(.94,.07,2.9,-.6+i*.8,.29,0).rotation.z=i%2?.10:-.10;
 for(let i=0;i<4;i++)line([[-2.4,.31,-1.5+i*.75],[-2.2,.68,-1.3+i*.75],[-1.8,.81,-1.4+i*.75],[-1.7,.54,-1.5+i*.75]],.1,'blue');
 const pin=mesh(new THREE.TorusGeometry(.34,.11,10,40),'red');pin.position.set(-.9,1.38,-.55);const tip=mesh(new THREE.ConeGeometry(.31,.58,3),'red');tip.position.set(-.9,.86,-.55);tip.rotation.z=Math.PI;
 box(.8,.61,.56,.02,.60,-.77);for(const x of [-.37,.37])box(.04,.71,.04,x,1.15,-.56);box(.94,.13,.81,0,1.48,-.65,'red');
 for(const x of [.86,2.06]){box(.72,1,.06,x,.91,-.6);box(.6,.66,.035,x,.99,-.55,'blue');const mountain=mesh(new THREE.ConeGeometry(.27,.46,3));mountain.position.set(x,.93,-.48);}
 line([[-.9,.36,-.3],[-.1,.36,.05],[.85,.36,-.05],[1.8,.36,.32],[1.2,.36,1.13]],.037,'blue');person(1.85,.3,1.1,.87);
 box(.95,.52,.12,.3,.86,.99);ball(.085,.04,.86,1.09,'blue');ball(.085,.3,.86,1.09,'blue');ball(.085,.56,.86,1.09,'blue');box(.11,.32,.10,.07,.6,.99).rotation.z=-.4;
 line([[-2.6,1.46,-1],[-2.15,1.68,-1],[-1.76,1.61,-1]],.05);return finish(35);
}
