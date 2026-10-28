export const SWAG_CYCLE=34;
const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
// An illustrative portfolio, not current Singapore prices or a financial recommendation.
export function swagMoment(time){
 const t=((time%SWAG_CYCLE)+SWAG_CYCLE)%SWAG_CYCLE;
 const balance=ease((t-11)/5),fade=1-ease((t-31)/2);
 return {t,phase:t<5?0:t<10?1:t<17?2:t<24?3:4,selected:t>=10,
  pin:ease((t-10)/1.1),balance,allocations:[.65-.20*balance,.15+.10*balance,.10+.10*balance,.10],
  home:ease((t-7)/3),food:ease((t-17)/3.5),leisure:ease((t-21)/3.5),matched:t>=25,fade};
}
