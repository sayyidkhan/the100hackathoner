// Source-grounded sequence, seekable so pause, replay and manual steps agree.
export const PUNISHER_CYCLE=32;
export const PUNISHER_STARTS=[0,7,15,23];
export const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const pulse=(t,a,b,c,d)=>smooth((t-a)/(b-a))*(1-smooth((t-c)/(d-c)));
export function punisherMoment(time){
 const t=((time%PUNISHER_CYCLE)+PUNISHER_CYCLE)%PUNISHER_CYCLE;
 const index=t<7?0:t<15?1:t<23?2:3;
 const drops=[0,1,2].map(i=>smooth((t-16-i*1.3)/1.2));
 return {t,index,step:`0${index+1} / 04`,title:['Play for your roles','Sign your shared agreement','Bring the groceries home','Your partner confirms it'][index],detail:['Rock, paper, scissors. The winner chooses Angel or Devil first.','Both partners agree on tasks, consequences and a one-week time limit.','Bread, fruit and greens arrive before the grocery task is marked complete.','Request approval first. Your partner reviews and confirms the completed task.'][index],tone:index===3?'complete':'thinking',
 select:pulse(t,.2,1,5.8,6.7),winner:t>=3.5&&t<6.7,
 agree:pulse(t,7.2,8.2,13.7,14.8),sign:smooth((t-9)/3),
 drops,done:t>=20,request:t>=23,approved:t>=27,
 deliver:smooth((t-16)/4),approve:pulse(t,25,26.4,29.5,31),
 seal:pulse(t,27,27.8,30.5,32),reset:smooth((t-31)/1)};
}
