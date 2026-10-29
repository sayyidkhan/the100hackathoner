export const WARRIORS_CYCLE=34;
export const WARRIORS_SHARES=[.30,.40,.10,.10,.10];
export const WARRIORS_LABELS=['Food','Entertainment','Utilities','Transport','Savings'];
const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
// A $500 example from the prototype. Planning an allocation does not earn a real achievement.
export function warriorsMoment(time){
 const t=((time%WARRIORS_CYCLE)+WARRIORS_CYCLE)%WARRIORS_CYCLE;
 const fills=WARRIORS_SHARES.map((_,i)=>ease((t-8-i*2.8)/2.4));
 const amounts=fills.map((v,i)=>v*WARRIORS_SHARES[i]*500);
 return {t,phase:t<4?0:t<8?1:t<22?2:t<28?3:4,selected:t>=3,selection:ease((t-3)/1),
  fills,amounts,pending:500-amounts.reduce((a,b)=>a+b,0),ready:t>=22,
  lid:ease((t-18)/1.1),fade:1-ease((t-31)/2),progress:ease((t-22)/1.5)};
}
