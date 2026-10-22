// The river's navigable centre lines and its wider, open-ended landform.
// Keeping these separate lets boats stay on the model while mouths reach its edge.
export function createRiverLandform(T, noise) {
  const waterY=.43,rx=3.72,rz=2.55;
  const V=(x,y,z)=>new T.Vector3(x,y,z);
  const curve=points=>new T.CatmullRomCurve3(points.map(([x,z])=>V(x,waterY,z)));
  const routes=[
    curve([[-2.95,-1.22],[-2.15,-1.38],[-1.35,-.62],[-1.12,.27],[-.35,.91],[.05,1.23]]),
    curve([[2.85,-1.12],[2.02,-1.32],[1.25,-.64],[1.05,.35],[.55,.85],[.05,1.23]]),
    curve([[.05,1.23],[.1,1.65],[-.15,2.1],[-.22,2.48]])
  ];
  const channels=[
    curve([[-4.3,-1.38],[-2.95,-1.22],[-2.15,-1.38],[-1.35,-.62],[-1.12,.27],[-.35,.91],[.05,1.23]]),
    curve([[4.3,-1.28],[2.85,-1.12],[2.02,-1.32],[1.25,-.64],[1.05,.35],[.55,.85],[.05,1.23]]),
    curve([[.05,1.05],[.1,1.65],[-.12,2.25],[-.2,3.5]])
  ];
  const smooth=(a,b,x)=>{const t=T.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  const channelWidth=(branch,p)=>branch===2
    ? .62+1.15*smooth(1.15,2.7,p.z)
    : .43+.44*smooth(2.25,3.7,Math.abs(p.x));
  const samples=channels.flatMap((path,branch)=>Array.from({length:110},(_,i)=>{
    const p=path.getPoint(i/109);return {p,width:channelWidth(branch,p)};
  }));
  function bankDistance(x,z){let d=100;for(const {p,width} of samples)d=Math.min(d,Math.hypot(x-p.x,z-p.z)-width);return d;}
  function height(x,z){
    const d=bankDistance(x,z),hill=.25*Math.exp(-((x+.2)**2+(z+.65)**2)*2.3);
    // A shallow sand shelf rolls into higher planted banks. Small irregularities
    // sit above the waterline so they cannot obstruct the widened entrances.
    return .31+smooth(-.16,.19,d)*(.255+hill+.045*noise(x*5,z*5)+.022*noise(x*17,z*17));
  }
  const perimeter=a=>1+.012*Math.sin(a*17)+.009*Math.sin(a*31);
  return {waterY,rx,rz,routes,channels,samples,channelWidth,bankDistance,height,perimeter,smooth};
}
