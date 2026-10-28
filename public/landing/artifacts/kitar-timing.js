export const KITAR_CYCLE=30;
const clamp=v=>Math.max(0,Math.min(1,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
// Arrival precedes recognition; points only follow a completed deposit.
export function kitarMoment(time){
 const t=((time%KITAR_CYCLE)+KITAR_CYCLE)%KITAR_CYCLE;
 return {t,phase:t<4?0:t<11?1:t<15?2:t<19?3:4,route:ease((t-4)/7),arrived:t>=11,detected:t>=13,drop:ease((t-16)/3),reward:t>=19,reveal:ease((t-19)/1.4),fade:1-ease((t-27)/2)};
}
