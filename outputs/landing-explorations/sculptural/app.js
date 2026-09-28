const projectsElement=document.querySelector('#projects');
const dialog=document.querySelector('#project-dialog');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let records=[];
function el(tag,text,className){const node=document.createElement(tag);if(text!=null)node.textContent=text;if(className)node.className=className;return node;}
function openProject(project){document.querySelector('#dialog-meta').textContent=`ATTEMPT ${String(project.number).padStart(3,'0')} / ${project.dateLabel}`;document.querySelector('#dialog-title').textContent=project.title;document.querySelector('#dialog-description').textContent=project.solution;const facts=document.querySelector('#dialog-facts');facts.replaceChildren();for(const [label,value]of [['Event',project.event],['Location',project.location||project.country],['Recognition',project.award]]){if(value)facts.append(el('dt',label),el('dd',value));}const links=document.querySelector('#dialog-links');links.replaceChildren();for(const[label,url]of[['Explore the code ↗',project.githubUrl],['Event ↗',project.eventUrl]]){if(url){const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);}}dialog.showModal();}
function renderProjects(items) {
  projectsElement.replaceChildren();
  items.forEach(project => {
    const button = el('button', null, 'project');
    button.type = 'button';
    button.setAttribute('aria-label', `Read about ${project.title}`);
    const number = el('span', String(project.number).padStart(3, '0'), 'record-number');
    const content = el('div', null, 'record-content');
    content.append(
      el('p', `${project.dateLabel} / ${project.event}`, 'record-meta'),
      el('h3', project.title),
      el('p', project.solution, 'record-description')
    );
    button.append(number, content, el('span', '↗', 'record-arrow'));
    button.addEventListener('click', () => openProject(project));
    projectsElement.append(button);
  });
}
document.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
async function loadProjects(){try{const response=await fetch('./hackathons.json');if(!response.ok)throw new Error('Could not load projects');records=(await response.json()).sort((a,b)=>b.number-a.number);document.querySelector('#work-count').textContent=records.length;renderProjects([records[0],records[1],records[records.length-1]]);document.querySelector('#shuffle').addEventListener('click',()=>{const first=Math.floor(Math.random()*records.length);renderProjects([records[first],records[(first+1)%records.length],records[(first+2)%records.length]]);});}catch(error){projectsElement.textContent='Projects are temporarily unavailable. Please refresh to try again.';document.querySelector('#shuffle').disabled=true;console.error(error);}}
loadProjects().then(()=>{window.hackathonRecords=records;document.querySelector('#sculpture').dispatchEvent(new Event('records-ready'));});
document.querySelector('#sculpture').addEventListener('open-attempt',event=>{const project=records.find(record=>record.number===event.detail);if(project)openProject(project);});
// The artwork fails independently: all content and navigation work without WebGL.
import('./sculpture.js').then(({createSculpture})=>createSculpture(document.querySelector('#sculpture'),reduced)).catch(error=>{console.warn('Using the lightweight sculpture fallback.',error);document.querySelector('#scene-status').textContent='Interactive artwork unavailable. Explore the real builds below.';});
