export const STRUCTUR_CYCLE=40;
const ease=(t,a,b)=>{const v=Math.max(0,Math.min(1,(t-a)/(b-a)));return v*v*(3-2*v);};
export function structurMoment(time){
 const t=((time%STRUCTUR_CYCLE)+STRUCTUR_CYCLE)%STRUCTUR_CYCLE;
 return {t,phase:t<8?'Design':t<11?'Approve':t<19?'Deploy':t<37?'Live':'Restart',
 blocks:[ease(t,1,3),ease(t,3,5),ease(t,5,7)],approved:t>=10,
 inbound:ease(t,11,14),deploy:ease(t,14,17),outbound:ease(t,17,19),
 live:t>=19&&t<37,fade:1-ease(t,37,39),reveal:ease(t,19,21)};
}
