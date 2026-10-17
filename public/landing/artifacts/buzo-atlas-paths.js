// Streets follow the paper; short bridges connect the book to its landmarks.
// Pedestrians and rendered decks share this exact surface and centreline.
export const ATLAS_WALKWAY_WIDTH = .28;
export const ATLAS_BOOK = { x: -.4, z: .05, scale: 1.08, yaw: -.11 };
// One entrance contract for architecture, bridge and garden promenade.
export const ATLAS_VENUE = { x:3.02, z:1.9, yaw:-.10, base:1.02, landing:1.42,
  stairTop:1.08, stairBottom:1.60, steps:8 };
export function atlasVenuePoint(x,z,y=ATLAS_VENUE.landing){
  const v=ATLAS_VENUE;
  return [v.x+Math.cos(v.yaw)*x+Math.sin(v.yaw)*z,y,
    v.z-Math.sin(v.yaw)*x+Math.cos(v.yaw)*z];
}


export function atlasPageHeight(x) {
  return 1.18 + .25 * Math.sin(Math.min(1, Math.abs(x) / 2.07) * Math.PI * .85) + .06 * Math.abs(x);
}
export function atlasBookCoordinates(x,z) {
  const b=ATLAS_BOOK,dx=x-b.x,dz=z-b.z;
  return {x:(Math.cos(b.yaw)*dx-Math.sin(b.yaw)*dz)/b.scale,
    z:(Math.sin(b.yaw)*dx+Math.cos(b.yaw)*dz)/b.scale};
}
export function atlasBookMargin(x,z) {
  const p=atlasBookCoordinates(x,z);
  return Math.min(2.06-Math.abs(p.x),1.44-Math.abs(p.z))*ATLAS_BOOK.scale;
}
export function atlasSurfaceHeight(x,z) {
  const p=atlasBookCoordinates(x,z);
  return atlasBookMargin(x,z)>=0 ? atlasPageHeight(p.x)*ATLAS_BOOK.scale : .84;
}
export function atlasDeckHeight(x,z,bridgeHeight) {
  const margin=atlasBookMargin(x,z),p=atlasBookCoordinates(x,z);
  const blend=Math.max(0,Math.min(1,1+margin/.38));
  const smooth=blend*blend*(3-2*blend);
  const paper=atlasPageHeight(Math.min(2.06,Math.abs(p.x)))*ATLAS_BOOK.scale+.025;
  return bridgeHeight+(paper-bridgeHeight)*smooth;
}
export function createAtlasRoutes(THREE) {
  const bookPoint=(x,z)=>{
    const b=ATLAS_BOOK;
    return [b.x+b.scale*(Math.cos(b.yaw)*x+Math.sin(b.yaw)*z),1.55,
      b.z+b.scale*(-Math.sin(b.yaw)*x+Math.cos(b.yaw)*z)];
  };
  const junction=bookPoint(0,.06);
  const definitions=[
    [junction,bookPoint(-.65,.22),bookPoint(-1.55,.15),bookPoint(-2.22,-.35),[-2.79,1.73,-.95]],
    [junction,bookPoint(.70,.12),bookPoint(1.62,.15),[2.05,1.59,-.57],[2.70,1.68,-1.62]],
    [junction,bookPoint(.35,.68),bookPoint(1.10,1.17),[1.28,1.46,1.98],atlasVenuePoint(-1.40,.95),atlasVenuePoint(-.90,.95)],
    // One continuous garden promenade: theatre, gazebo, fountain, venue stairs.
    // The southern arc clears the basin and follows the island's planted rim.
    [[-3.5,1.60,-.48],[-3.98,1.26,.55],[-3.96,1.14,1.72],[-3.20,1.10,2.60],
      [-2.15,.96,2.92],[-1.25,.91,3.18],[-.55,.92,3.53],[.12,.92,3.55],
      [.82,.92,3.32],[1.45,.96,3.26],[1.88,1.02,3.52],atlasVenuePoint(-.60,1.76,ATLAS_VENUE.base)],
  ];
  return definitions.map(points=>{
    const base=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    class PaperStreet extends THREE.Curve {
      getPoint(t,target=new THREE.Vector3()) {
        base.getPoint(t,target);
        target.y=atlasDeckHeight(target.x,target.z,target.y);
        return target;
      }
    }
    const curve=new PaperStreet();curve.arcLengthDivisions=1024;return curve;
  });
}
export function createWalkwayClearance(routes) {
  const samples=routes.flatMap(curve=>curve.getSpacedPoints(180));
  return (x,z,radius=0)=>{
    // Keep the full palace forecourt and stair approaches clear of planting.
    const v=ATLAS_VENUE,dx=x-v.x,dz=z-v.z;
    const localX=Math.cos(v.yaw)*dx-Math.sin(v.yaw)*dz;
    const localZ=Math.sin(v.yaw)*dx+Math.cos(v.yaw)*dz;
    if(Math.abs(localX)<1.12+radius&&localZ>.72-radius&&localZ<2.12+radius)return false;
    return samples.every(p=>Math.hypot(p.x-x,p.z-z)>ATLAS_WALKWAY_WIDTH/2+.025+radius);
  };
}
