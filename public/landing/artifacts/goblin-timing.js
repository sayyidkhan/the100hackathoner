export const GOBLIN_CYCLE=32;
const clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
// Two real devices, two outcomes. A result is never shown before inspection.
export function goblinMoment(time){
 const t=((time%GOBLIN_CYCLE)+GOBLIN_CYCLE)%GOBLIN_CYCLE;
 const devices=[0,14].map((delay,i)=>{const a=t-delay;return {age:a,visible:a>=0&&t<31,travel:smooth((a-2)/4),scan:clamp((a-6)/3),sort:smooth((a-9)/3),arrived:a>=12,route:i===0?'reuse':'recycle'};});
 const active=t<14?0:1,a=devices[active].age,phase=a<2?'collect':a<6?'move':a<9?'inspect':a<12?'sort':'complete';
 return {t,active,phase,devices,fade:1-smooth((t-29.5)/1.5),reuse:devices[0].arrived,recycle:devices[1].arrived};
}
