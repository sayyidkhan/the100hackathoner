export const INSTA_CYCLE=40;
const ramp=(t,a,b)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);};
export function instaMoment(time){const t=((time%INSTA_CYCLE)+INSTA_CYCLE)%INSTA_CYCLE;return {t,phase:t<5?0:t<10?1:t<27?2:3,ingest:ramp(t,1,5),process:ramp(t,5,10),cards:Array.from({length:10},(_,i)=>ramp(t,10+i*.7,10.65+i*.7)),index:Math.min(9,Math.max(0,Math.floor((t-17)/1))),video:ramp(t,27,36),fade:1-ramp(t,38,40)};}
