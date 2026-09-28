const projects=await fetch('./hackathons.json').then(r=>{if(!r.ok)throw Error('Collection unavailable');return r.json();});
const $=s=>document.querySelector(s);
const list=$('#project-list'),dialog=$('#project-dialog');
const featuredCopy={
  81:{title:'The Next 8 Seconds',category:'SOCIAL GOOD / ANTI-DRUG JAM 2026',description:'Draw your way through peer pressure. Find your way home.'},
  80:{title:"Itachi’s Crow",category:'GENERATIVE AI / GPT-6 ASTRA HACKATHON',description:'Explore a 3D city with a flying crow. Imagine yourself there.'},
  79:{title:'Long Taa Borneo Eco Stay',category:'CULTURE × AI / SINGAPORE × SARAWAK',description:'A bilingual visitor experience for a Sebup longhouse village.'}
};
document.querySelectorAll('[data-feature]').forEach(button=>button.addEventListener('click',()=>{
  const number=button.dataset.feature,copy=featuredCopy[number];
  document.querySelectorAll('[data-feature]').forEach(tab=>{tab.classList.toggle('selected',tab===button);tab.setAttribute('aria-pressed',String(tab===button));});
  document.querySelectorAll('[data-scene]').forEach(scene=>{scene.hidden=scene.dataset.scene!==number;});
  $('#featured-number').textContent=String(number).padStart(3,'0');
  $('.exhibit-number').textContent=String(number).padStart(3,'0');
  $('#featured-title').textContent=copy.title;
  $('#featured-category').textContent=copy.category;
  $('#featured-description').textContent=copy.description;
  $('#featured-object').dataset.project=number;
  $('#featured-object').setAttribute('aria-label',`Explore ${copy.title}`);
}));
let mode='all',visible=6;
$('#all-count').textContent=projects.length;
$('#award-count').textContent=projects.filter(p=>p.award).length;
function openProject(number){const p=projects.find(x=>x.number===Number(number));if(!p)return;$('#dialog-number').textContent=`EXHIBIT ${String(p.number).padStart(3,'0')} / ${p.dateLabel}`;$('#dialog-title').textContent=p.title;$('#dialog-event').textContent=`${p.event} · ${p.country}`;$('#dialog-solution').textContent=p.solution||'A project from the collection.';$('#dialog-tags').replaceChildren(...(p.categories||[]).map(t=>{const span=document.createElement('span');span.textContent=t;return span;}));$('#dialog-award').textContent=p.award?`Recognition: ${p.award}`:'Every attempt is part of the journey. This one is no exception.';const link=$('#dialog-link');link.href=p.githubUrl||p.eventUrl||'http://127.0.0.1:18481/#journey';link.textContent=p.githubUrl?'View the project on GitHub ↗':p.eventUrl?'Visit the event ↗':'Explore the full journey ↗';dialog.showModal();}
function render(){const term=$('#search').value.toLowerCase().trim();const selected=projects.filter(p=>(mode!=='awarded'||p.award)&&[p.title,p.event,p.startDate,...(p.tags||[]),...(p.categories||[])].join(' ').toLowerCase().includes(term));list.replaceChildren();for(const p of selected.slice(0,visible)){const row=document.createElement('button');row.className='project-row';row.setAttribute('aria-label',`Explore attempt ${p.number}: ${p.title}`);const num=document.createElement('span');num.className='number';num.textContent=String(p.number).padStart(3,'0');const info=document.createElement('div'),title=document.createElement('h3'),event=document.createElement('p');title.textContent=p.title;event.textContent=p.event;info.append(title,event);const meta=document.createElement('div');meta.className='project-meta';meta.textContent=p.dateLabel;if(p.award){const badge=document.createElement('span');badge.className='award-label';badge.textContent='↗ Awarded';meta.append(badge);}const arrow=document.createElement('span');arrow.className='project-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');row.append(num,info,meta,arrow);row.addEventListener('click',()=>openProject(p.number));list.append(row);}$('#result-status').textContent=selected.length?`${Math.min(visible,selected.length)} of ${selected.length} attempts on display`:'No attempts found. Try a different search.';$('#load-more').hidden=visible>=selected.length;}
document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>openProject(b.dataset.project)));
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.filter;visible=6;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});render();}));
$('#search').addEventListener('input',()=>{visible=6;render();});
$('#load-more').addEventListener('click',()=>{visible+=12;render();});
$('#surprise').addEventListener('click',()=>openProject(projects[Math.floor(Math.random()*projects.length)].number));
$('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
render();
