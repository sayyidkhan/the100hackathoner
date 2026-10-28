export const SAYWHAT_CYCLE=28;
export const SAYWHAT_HITS=[{time:'03:12',u:192/2100,title:'Introducing a persona'},{time:'14:28',u:868/2100,title:'From interviews to a persona'},{time:'27:45',u:1665/2100,title:'Using personas in design'}];
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export function saywhatMoment(time){
 const t=((time%SAYWHAT_CYCLE)+SAYWHAT_CYCLE)%SAYWHAT_CYCLE;
 const phase=t<6?0:t<11?1:t<16?2:3;
 const capture=clamp(t/5.5),query='persona'.slice(0,Math.floor(clamp((t-7)/2.2)*7));
 const matches=phase>=2?SAYWHAT_HITS.filter((_,i)=>t>=11+i*.9).length:0;
 const playback=clamp((t-18)/7),seek=ease((t-16)/1.7);
 const cursor=phase===0?capture:phase===1?1:phase===2?1:1-(1-SAYWHAT_HITS[1].u)*seek+playback*7/2100;
 return {t,phase,capture,query,matches,seek,playback,cursor,playing:t>=18&&t<25,fade:1-ease((t-26)/1.5)};
}
