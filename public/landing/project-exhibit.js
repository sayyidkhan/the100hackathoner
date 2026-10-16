for (const exhibit of document.querySelectorAll('[data-project-exhibit]')) {
  const artwork = exhibit.querySelector('[data-art]');
  const stage = exhibit.querySelector('[data-scene]');
  const controls = exhibit.querySelector('[data-controls]');
  const status = exhibit.querySelector('[data-status]');
  const story = exhibit.querySelector('[data-story]');
  const storyStep = story?.querySelector('[data-story-step]');
  const storyTitle = story?.querySelector('[data-story-title]');
  const storyDetail = story?.querySelector('[data-story-detail]');
  const modes = [...exhibit.querySelectorAll('[data-mode]')];
  const walkthrough = exhibit.querySelector('[data-walkthrough]');
  const stepButtons = [...exhibit.querySelectorAll('[data-story-select]')];
  const autoSteps = exhibit.querySelector('[data-story-auto]');
  const pause = exhibit.querySelector('[data-pause]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let scene;
  let loading;
  let requested = 'artwork';
  let paused = reduced.matches;
  let failed = false;
  const labelsToggle = exhibit.querySelector('[data-toggle-labels]');
  const labelSurfaces = [...exhibit.querySelectorAll('.division-labels, .division-key')];
  let labelsVisible = true;
  labelsToggle?.addEventListener('click', () => {
    labelsVisible = !labelsVisible;
    labelSurfaces.forEach(surface => { surface.hidden = !labelsVisible; });
    labelsToggle.textContent = labelsVisible ? 'Hide labels' : 'Show labels';
    labelsToggle.setAttribute('aria-expanded', String(labelsVisible));
    // Reproject using the restored label dimensions even when motion is paused.
    scene?.setPaused(paused);
  });
  const theme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  function showStory(value) {
    if (!story) return;
    story.hidden = !value;
    if (!value) return;
    story.dataset.tone = value.tone;
    storyStep.textContent = value.step;
    storyTitle.textContent = value.title;
    storyDetail.textContent = value.detail;
    stepButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.storySelect) === value.index)));
  }
  const divisionLabels = new Map([...stage.querySelectorAll('[data-division]')].map(label => [label.dataset.division, label]));
  function placeDivisions(points) {
    const width = stage.clientWidth, height = stage.clientHeight;
    if (!width || !height) return;
    const placed = [];
    for (const point of points) {
      const label = divisionLabels.get(point.id);
      if (!label) continue;
      label.hidden = !point.visible;
      const halfW = label.offsetWidth / 2 + 5, halfH = label.offsetHeight / 2 + 5;
      let x = Math.max(halfW, Math.min(width - halfW, point.x * width / 100));
      let y = Math.max(halfH, Math.min(height - halfH, point.y * height / 100));
      for (const previous of placed) {
        if (Math.abs(x - previous.x) < halfW + previous.halfW && Math.abs(y - previous.y) < halfH + previous.halfH) {
          y = previous.y + previous.halfH + halfH;
        }
      }
      y = Math.min(height - halfH, y);
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
      placed.push({ x, y, halfW, halfH });
    }
  }
  function applyTheme() {
    exhibit.querySelector('[data-dark-art]').media = theme() === 'dark' ? 'all' : 'not all';
    scene?.setTheme(theme());
  }
  function pauseLabel() {
    pause.disabled = reduced.matches;
    pause.textContent = reduced.matches ? 'Reduced motion on' : paused ? 'Resume motion' : 'Pause motion';
    pause.setAttribute('aria-pressed', String(paused));
    scene?.setPaused(paused);
  }
  function display(mode) {
    artwork.hidden = mode !== 'artwork';
    stage.hidden = mode !== '3d';
    controls.hidden = mode !== '3d';
    if (walkthrough) walkthrough.hidden = mode !== '3d';
    modes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    scene?.setActive(mode === '3d');
  }
  function fallback() {
    failed = true;
    requested = 'artwork';
    const focused = stage.contains(document.activeElement);
    display('artwork');
    scene?.dispose();
    scene = undefined;
    status.textContent = '3D is unavailable in this browser. You can still explore the artwork.';
    if (focused) modes[0].focus();
  }
  modes.forEach(button => button.addEventListener('click', async () => {
    requested = button.dataset.mode;
    if (requested === 'artwork') { display('artwork'); return; }
    if (failed) { fallback(); return; }
    if (!scene) {
      status.textContent = 'Opening the 3D exhibit…';
      button.setAttribute('aria-busy', 'true');
      try {
        loading ??= Promise.all([import('./scene.js'), import(exhibit.dataset.model)]).then(([renderer, artifact]) => renderer.createGalleryScene({
          canvas: stage.querySelector('canvas'), container: stage, theme: theme(),
          initialProject: Number(exhibit.dataset.number), projectIds: new Set([Number(exhibit.dataset.number)]),
          artifactFactory: artifact.createArtifact, onError: fallback, onStoryChange: showStory, onAnnotations: placeDivisions,
        }));
        scene = await loading;
        if (failed) { scene.dispose(); scene = undefined; return; }
        applyTheme();
        pauseLabel();
        status.textContent = '';
      } catch { fallback(); return; }
      finally { button.removeAttribute('aria-busy'); }
    }
    display(requested);
  }));
  exhibit.querySelector('[data-reset]').addEventListener('click', () => scene?.resetView());
  stepButtons.forEach(button => button.addEventListener('click', () => {
    scene?.setStoryStep(Number(button.dataset.storySelect));
    autoSteps?.setAttribute('aria-pressed', 'false');
  }));
  autoSteps?.addEventListener('click', () => {
    const enabled = autoSteps.getAttribute('aria-pressed') !== 'true';
    scene?.setStoryStep(enabled ? null : Number(stepButtons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.storySelect ?? 0));
    autoSteps.setAttribute('aria-pressed', String(enabled));
  });
  pause.addEventListener('click', () => { paused = !paused; pauseLabel(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; pauseLabel(); });
  document.addEventListener('site:theme-change', applyTheme);
  window.addEventListener('pagehide', () => scene?.setActive(false));
  window.addEventListener('pageshow', () => scene?.setActive(requested === '3d'));
  applyTheme();
  pauseLabel();
}
