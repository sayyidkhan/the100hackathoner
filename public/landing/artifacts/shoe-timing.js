export const TRIBUTES=Object.freeze([
 {name:'MoMo',years:'2010 — 2018',type:'Nike Air Max',quote:'Resting in God’s Garden',color:0x713b35,story:'A rainstorm and a torn toe ended years of exams, sports days and everyday memories.'},
 {name:'ZuZu',years:'2012 — 2016',type:'Nike Air Max',quote:'Resting in Shoe Heaven',color:0x626c52,story:'ZuZu’s original tribute: “Resting in Shoe Heaven.” Remembered by Zack.'},
 {name:'BuBu',years:'2007 — 2010',type:'Nike Air Jordan',quote:'Resting in Basketball Heaven',color:0x263c4c,story:'BuBu’s original tribute: “Resting in Basketball Heaven.” Remembered by Zack.'}
]);
export const SHOE_CYCLE=30;
export const SHOE_STARTS=Object.freeze([2,9,16]);
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function shoeMoment(time,selected=null){
 const t=((time%SHOE_CYCLE)+SHOE_CYCLE)%SHOE_CYCLE,overview=selected===3;
 const closing=selected===null&&t>=24,waiting=selected===null&&t<2;
 const index=selected===null?(waiting||closing?-1:t<9?0:t<16?1:2):overview?3:selected;
 const openness=SHOE_STARTS.map((start,i)=>overview?1:selected!==null?(i===selected?ease(time/2):0):ease((t-start)/2)*(1-ease((t-24)/3)));
 const tribute=TRIBUTES[Math.max(0,Math.min(index,2))];
 return {t,index,overview,openness,phase:overview?'overview':waiting?'closed':closing?(t<27?'closing':'closed'): 'tribute',
 step:waiting?'00 / 03':closing?'03 / 03':overview?'03 / 03':`0${index+1} / 03`,
 title:waiting?'Every pair has a story':closing?'Forever remembered':overview?'Every shoe has a story':`${tribute.name} · ${tribute.years}`,
 detail:waiting?'Three pairs. Three memories.':closing?'A farewell for the shoes, a place to keep their stories.':overview?'MoMo, ZuZu and BuBu: all three tributes from Zack’s original collection.':tribute.story,
 tone:closing?'complete':'thinking'};
}
