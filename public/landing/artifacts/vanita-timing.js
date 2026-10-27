export const VANITA_CYCLE=28;
const clamp=v=>Math.max(0,Math.min(1,v));
export function vanitaMoment(time){
 const t=((time%VANITA_CYCLE)+VANITA_CYCLE)%VANITA_CYCLE;
 const travel=clamp((t-5)/12),handoff=clamp((t-17.5)/1.5);
 return {t,phase:t<3?0:t<5?1:t<17?2:t<19?3:4,travel,handoff,walking:t>=5&&t<17,carrying:t>=4.5&&t<18.5,delivered:t>=18.5,opacity:Math.min(clamp(t/.7),clamp((27-t)/2))};
}
