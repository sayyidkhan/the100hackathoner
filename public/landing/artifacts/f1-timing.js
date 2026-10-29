export const F1_CYCLE=32;
const clamp=(x)=>Math.max(0,Math.min(1,x));
// Illustrative prices, not predictions or live market data. Negative times give
// the comparison view a short pre-race history without showing future outcomes.
const DRIVERS=[
 {id:'07',color:'#50ecd4',offset:-.75,prices:[[-6,.88],[0,1],[8,1],[14,1.15],[18,1.51],[24,1.30],[27,1.34]]},
 {id:'16',color:'#ff786b',offset:0,prices:[[-6,1.08],[0,1.18],[8,1.18],[14,1.32],[18,1.02],[24,1.12],[27,1.06]]},
 {id:'44',color:'#eac16b',offset:-1.50,prices:[[-6,.98],[0,.92],[8,.92],[14,.85],[18,.91],[24,.83],[27,.86]]},
];
export function driverPrice(index,time){const points=DRIVERS[index].prices;if(time<=points[0][0])return points[0][1];for(let j=1;j<points.length;j++){const [t,b]=points[j],[aT,a]=points[j-1];if(time<=t)return a+(b-a)*clamp((time-aT)/(t-aT));}return points.at(-1)[1];}
export function raceDrivers(time){const t=((time%32)+32)%32,progress=clamp((t-8)/19),overtake=clamp((t-14)/4);const drivers=DRIVERS.map((d,i)=>({...d,price:driverPrice(i,t),change:(driverPrice(i,t)/driverPrice(i,0)-1)*100,travel:Math.PI*.5+progress*Math.PI*6+d.offset+(i===0?overtake*1.2:0),lane:.88-(i===0?.29*Math.sin(Math.PI*clamp((t-13)/6)):0),selected:i===0&&t>=4}));const ranked=[...drivers].sort((a,b)=>b.travel-a.travel);drivers.forEach(d=>d.position=ranked.indexOf(d)+1);return drivers;}
export function raceMoment(time){const t=((time%32)+32)%32;return {t,phase:t<4?0:t<8?1:t<18?2:t<24?3:4,running:t>=8&&t<27,progress:clamp((t-8)/19),sold:t>=24,price:driverPrice(0,Math.min(t,24)),drivers:raceDrivers(t)};}
