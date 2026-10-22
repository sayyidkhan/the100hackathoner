// One shared lesson cycle. Every motion is seekable and returns to rest at the seam.
export const LRNMATE_CYCLE=18;
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10);};
const envelope=(t,start,inEnd,outStart,end)=>smooth((t-start)/(inEnd-start))*(1-smooth((t-outStart)/(end-outStart)));
export function lessonMoment(time){
 const t=((time%LRNMATE_CYCLE)+LRNMATE_CYCLE)%LRNMATE_CYCLE;
 return {
  phase:t<5?'explain':t<10?'respond':t<14?'feedback':'rest',
  explain:envelope(t,.5,1.8,3.7,5),
  respond:envelope(t,5,6,8.8,10),
  acknowledge:envelope(t,9.2,9.7,10.3,10.9),
  feedback:Math.max(0,Math.min(1,(t-10.5)/3)),
  feedbackVisible:t>=10.5&&t<13.5,
  feedbackScale:envelope(t,10.5,10.8,13.2,13.5),
  stroke:Math.sin((t-5)*Math.PI*2*1.3)*envelope(t,5,6,8.8,10),
 };
}
