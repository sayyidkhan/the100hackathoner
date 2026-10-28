export const SOCAP_CYCLES={1:28,2:34};
const clamp=v=>Math.max(0,Math.min(1,v));
export const socapEase=v=>{v=clamp(v);return v*v*(3-2*v);};
export function socapMoment(time,version=1){
 const cycle=SOCAP_CYCLES[version],t=((time%cycle)+cycle)%cycle;
 if(version===1)return {t,version,phase:t<6?0:t<11?1:t<18?2:3,connected:Math.min(5,Math.floor(t/1.15)),outbound:socapEase((t-11)/6),sent:t>=17,review:t>=18,feedback:0,updated:false,fade:1-socapEase((t-25)/2)};
 return {t,version,phase:t<7?0:t<12?1:t<20?2:t<27?3:4,connected:Math.min(3,Math.floor(t/2)),outbound:socapEase((t-7)/4),sent:t>=11,review:t>=12,feedback:socapEase((t-20)/6),updated:t>=27,fade:1-socapEase((t-31)/2)};
}
