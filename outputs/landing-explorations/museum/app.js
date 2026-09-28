const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const response = await fetch('./hackathons.json');
if (!response.ok) throw new Error('Collection unavailable');
const projects = await response.json();
const list = $('#project-list');
const dialog = $('#project-dialog');
const stage = $('#exhibition-stage');
const exhibitOrder = [81, 80, 79];
const featuredCopy = {
  81: {
    title: 'What if a drawing could change a choice?',
    category: 'ANTI-DRUG JAM 2026 / SINGAPORE',
    description: 'An illustrated adventure through peer pressure. Sketch a solution. Find your way home.'
  },
  80: {
    title: 'What if you could see a city through a crow?',
    category: 'GPT-6 ASTRA HACKATHON / SINGAPORE',
    description: 'Fly through a real 3D city, then imagine yourself there with AI-generated travel scenes.'
  },
  79: {
    title: 'What if technology brought a place closer?',
    category: 'SINGAPORE × SARAWAK / AI BUSINESS DESIGN',
    description: 'A bilingual visitor experience connecting travelers with a Sebup longhouse village in Borneo.'
  }
};
let currentExhibit = 0;
let mode = 'all';
let visible = 6;
let pointerStart = null;
let suppressClickUntil = 0;

function selectExhibit(index) {
  currentExhibit = (index + exhibitOrder.length) % exhibitOrder.length;
  const number = exhibitOrder[currentExhibit];
  const copy = featuredCopy[number];
  $$('[data-object]').forEach(object => {
    const objectIndex = exhibitOrder.indexOf(Number(object.dataset.object));
    const offset = (objectIndex - currentExhibit + exhibitOrder.length) % exhibitOrder.length;
    object.classList.toggle('is-active', offset === 0);
    object.classList.toggle('is-after', offset === 1);
    object.classList.toggle('is-before', offset === 2);
    const project = projects.find(item => item.number === Number(object.dataset.object));
    object.setAttribute('aria-label', `${offset === 0 ? 'Open' : 'Select'} exhibit ${project.number}, ${project.title}`);
  });
  $$('[data-feature]').forEach(button => {
    const selected = Number(button.dataset.feature) === number;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('#featured-number').textContent = String(number).padStart(3, '0');
  $('#featured-title').textContent = copy.title;
  $('#featured-category').textContent = copy.category;
  $('#featured-description').textContent = copy.description;
  $('#featured-object').dataset.project = number;
}

function openProject(number) {
  const project = projects.find(item => item.number === Number(number));
  if (!project) return;
  $('#dialog-number').textContent = `EXHIBIT ${String(project.number).padStart(3, '0')} / ${project.dateLabel}`;
  $('#dialog-title').textContent = project.title;
  $('#dialog-event').textContent = `${project.event} · ${project.country}`;
  $('#dialog-solution').textContent = project.solution || 'A project from the collection.';
  $('#dialog-tags').replaceChildren(...(project.categories || []).map(category => {
    const tag = document.createElement('span');
    tag.textContent = category;
    return tag;
  }));
  $('#dialog-award').textContent = project.award
    ? `Recognition: ${project.award}`
    : 'Every attempt is part of the journey. This one is no exception.';
  const link = $('#dialog-link');
  link.href = project.githubUrl || project.eventUrl || 'http://127.0.0.1:18481/#journey';
  link.textContent = project.githubUrl
    ? 'View the project on GitHub ↗'
    : project.eventUrl ? 'Visit the event ↗' : 'Explore the full journey ↗';
  dialog.showModal();
}

function renderCollection() {
  const term = $('#search').value.toLowerCase().trim();
  const selected = projects.filter(project => {
    const searchable = [
      project.title, project.event, project.startDate,
      ...(project.tags || []), ...(project.categories || [])
    ].join(' ').toLowerCase();
    return (mode !== 'awarded' || project.award) && searchable.includes(term);
  });
  list.replaceChildren();
  for (const project of selected.slice(0, visible)) {
    const row = document.createElement('button');
    row.className = 'project-row';
    row.setAttribute('aria-label', `Explore attempt ${project.number}: ${project.title}`);
    const number = document.createElement('span');
    number.className = 'number';
    number.textContent = String(project.number).padStart(3, '0');
    const info = document.createElement('div');
    const title = document.createElement('h3');
    const event = document.createElement('p');
    title.textContent = project.title;
    event.textContent = project.event;
    info.append(title, event);
    const meta = document.createElement('div');
    meta.className = 'project-meta';
    meta.textContent = project.dateLabel;
    if (project.award) {
      const badge = document.createElement('span');
      badge.className = 'award-label';
      badge.textContent = '↗ Awarded';
      meta.append(badge);
    }
    const arrow = document.createElement('span');
    arrow.className = 'project-arrow';
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');
    row.append(number, info, meta, arrow);
    row.addEventListener('click', () => openProject(project.number));
    list.append(row);
  }
  $('#result-status').textContent = selected.length
    ? `${Math.min(visible, selected.length)} of ${selected.length} attempts on display`
    : 'No attempts found. Try a different search.';
  $('#load-more').hidden = visible >= selected.length;
}

$('#all-count').textContent = projects.length;
$('#award-count').textContent = projects.filter(project => project.award).length;
$('#previous-exhibit').addEventListener('click', () => selectExhibit(currentExhibit - 1));
$('#next-exhibit').addEventListener('click', () => selectExhibit(currentExhibit + 1));
$$('[data-feature]').forEach(button => button.addEventListener('click', () => {
  selectExhibit(exhibitOrder.indexOf(Number(button.dataset.feature)));
}));
$$('[data-object]').forEach(object => object.addEventListener('click', () => {
  if (Date.now() < suppressClickUntil) return;
  const index = exhibitOrder.indexOf(Number(object.dataset.object));
  if (index === currentExhibit) openProject(object.dataset.object);
  else selectExhibit(index);
}));
$('#featured-object').addEventListener('click', event => {
  openProject(event.currentTarget.dataset.project);
});

// Horizontal dragging changes the curated exhibit. Vertical touch scroll remains native.
stage.addEventListener('pointerdown', event => {
  if (event.button !== 0 || event.target.closest('.gallery-arrow')) return;
  pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
});
stage.addEventListener('pointermove', event => {
  if (!pointerStart || event.pointerId !== pointerStart.id) return;
  if (event.pointerType === 'mouse' && event.buttons === 0) {
    pointerStart = null;
    stage.classList.remove('is-dragging');
    return;
  }
  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  if (Math.abs(deltaX) > 12 && Math.abs(deltaX) > Math.abs(deltaY)) {
    stage.classList.add('is-dragging');
    stage.setPointerCapture(event.pointerId);
  }
});
function endDrag(event) {
  if (!pointerStart || event.pointerId !== pointerStart.id) return;
  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
    selectExhibit(currentExhibit + (deltaX < 0 ? 1 : -1));
    suppressClickUntil = Date.now() + 400;
  }
  pointerStart = null;
  stage.classList.remove('is-dragging');
}
stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', () => {
  pointerStart = null;
  stage.classList.remove('is-dragging');
});
stage.addEventListener('pointerleave', () => {
  if (!stage.classList.contains('is-dragging')) pointerStart = null;
});
stage.addEventListener('lostpointercapture', () => {
  pointerStart = null;
  stage.classList.remove('is-dragging');
});
stage.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  selectExhibit(currentExhibit + (event.key === 'ArrowRight' ? 1 : -1));
});

$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.filter;
  visible = 6;
  $$('[data-filter]').forEach(filter => {
    filter.classList.toggle('active', filter === button);
    filter.setAttribute('aria-pressed', String(filter === button));
  });
  renderCollection();
}));
$('#search').addEventListener('input', () => { visible = 6; renderCollection(); });
$('#load-more').addEventListener('click', () => { visible += 12; renderCollection(); });
$('#surprise').addEventListener('click', () => {
  openProject(projects[Math.floor(Math.random() * projects.length)].number);
});
$('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

selectExhibit(0);
renderCollection();
