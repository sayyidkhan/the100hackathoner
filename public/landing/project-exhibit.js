for (const exhibit of document.querySelectorAll('[data-project-exhibit]')) {
  const artwork = exhibit.querySelector('[data-art]');
  const stage = exhibit.querySelector('[data-scene]');
  const controls = exhibit.querySelector('[data-controls]');
  const status = exhibit.querySelector('[data-status]');
  const modes = [...exhibit.querySelectorAll('[data-mode]')];
  const pause = exhibit.querySelector('[data-pause]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let scene;
  let loading;
  let requested = 'artwork';
  let paused = reduced.matches;
  let failed = false;
  const theme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
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
          artifactFactory: artifact.createArtifact, onError: fallback,
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
  pause.addEventListener('click', () => { paused = !paused; pauseLabel(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; pauseLabel(); });
  document.addEventListener('site:theme-change', applyTheme);
  window.addEventListener('pagehide', () => scene?.setActive(false));
  window.addEventListener('pageshow', () => scene?.setActive(requested === '3d'));
  applyTheme();
  pauseLabel();
}
