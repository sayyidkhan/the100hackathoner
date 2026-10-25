// Conceptual location analysis display. Counts describe the exhibit's sample
// scenario, never live or retrieved pedestrian measurements.
export function createGymScreen(T) {
  const canvas = typeof document === 'undefined' ? null : document.createElement('canvas');
  if (canvas) { canvas.width = 1024; canvas.height = 1608; }
  const ctx = canvas?.getContext('2d');
  const texture = ctx ? new T.CanvasTexture(canvas) : null;
  if (texture) {
    texture.colorSpace = T.SRGBColorSpace;
    texture.anisotropy = 4;
  }
  const material = new T.MeshBasicMaterial({
    color: texture ? 0xffffff : 0x101e27,
    map: texture,
    toneMapped: false,
  });
  const mesh = new T.Mesh(new T.PlaneGeometry(2.1, 3.3), material);
  mesh.name = 'mynextgym-app-screen';
  mesh.userData.noShadow = true;
  const palette = {
    background: '#101e27', white: '#f3efe5', ink: '#f3efe5', muted: '#9fb9b6',
    line: '#314953', teal: '#246b63', mint: '#b9dfcc', coral: '#ed987e',
    pale: '#1b303b', row: '#192d38', track: '#314650', amber: '#bfa077', barTeal: '#76bfad',
  };
  const totals = [12, 36, 20];
  const phases = new Set(['footfall', 'compare', 'selected', 'reveal', 'review']);
  let previousKey;

  function rounded(x, y, w, h, r, fill, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); }
  }
  function text(value, x, y, size, color = palette.ink, weight = 500, align = 'left') {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
    ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(value, x, y);
  }
  function line(points, color, width = 3) {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  }
  function dot(x, y, radius, fill) {
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  }
  function candidate(index, count, comparison, winner) {
    const x = 64, y = 444 + index * 175, width = 896;
    const active = comparison === index && !winner;
    const selected = winner && index === 1;
    const strong = active || selected;
    rounded(x, y, width, 153, 22, strong ? palette.teal : palette.row, strong ? null : palette.line);
    if (selected) rounded(x, y + 19, 7, 115, 3, palette.coral);
    rounded(87, y + 26, 76, 76, 17, strong ? '#39746a' : palette.pale);
    text(['A', 'B', 'C'][index], 125, y + 82, 51, strong ? palette.white : palette.ink, 700, 'center');
    text(`Location ${['A', 'B', 'C'][index]}`, 190, y + 62, 38, strong ? palette.white : palette.ink, 600);
    text(String(count).padStart(2, '0'), 918, y + 97, 92, strong ? palette.white : palette.ink, 650, 'right');
    rounded(191, y + 91, 505, 24, 12, strong ? '#3c8277' : palette.track);
    const fillWidth = 505 * count / 36;
    if (fillWidth > 0) rounded(191, y + 91, fillWidth, 24, Math.min(12, fillWidth / 2), selected ? palette.coral : index === 1 ? palette.barTeal : palette.amber);
  }
  function update(state = {}) {
    const phase = phases.has(state.phase) ? state.phase : 'footfall';
    const counts = totals.map((limit, i) => {
      const value = state.counts?.[i];
      return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(limit, Math.round(value))) : 0;
    });
    const comparison = [-1, 0, 1, 2].includes(state.comparison) ? state.comparison : -1;
    const winner = phase === 'selected' || phase === 'reveal' || phase === 'review';
    // Continuous selection/reveal/fade remain the scene's responsibility.
    // Integer counts and discrete states bound texture uploads during playback.
    const key = `${phase}|${counts.join(',')}|${comparison}`;
    mesh.userData.phase = phase;
    mesh.userData.counts = [...counts];
    mesh.userData.comparison = comparison;
    mesh.userData.winner = winner ? 'B' : null;
    if (key === previousKey) return;
    previousKey = key;
    if (!ctx) return;

    ctx.fillStyle = palette.background; ctx.fillRect(0, 0, 1024, 1608);
    // Small brand marker, large purpose, then the actual evidence.
    rounded(64, 68, 58, 58, 15, palette.teal);
    line([[78, 104], [88, 94], [97, 100], [110, 83]], palette.mint, 5);
    text('MyNextGym', 143, 114, 52, palette.ink, 700);
    line([[64, 169], [960, 169]], palette.line, 2);
    text('Where to open?', 64, 276, 82, palette.ink, 650);
    text('Sample footfall', 64, 355, 43, palette.muted, 500);
    text('PEOPLE', 918, 404, 25, palette.muted, 650, 'right');
    counts.forEach((count, index) => candidate(index, count, comparison, winner));

    if (winner) {
      rounded(64, 1013, 896, 350, 27, palette.teal);
      rounded(95, 1045, 167, 43, 20, palette.coral);
      text('SELECTED', 178, 1076, 25, '#23362e', 750, 'center');
      text('OPEN AT B', 104, 1196, 103, palette.white, 750);
      text('Highest footfall', 104, 1262, 48, palette.mint, 600);
      text('Transit · Offices · Homes', 104, 1320, 36, palette.white, 500);
    } else {
      rounded(64, 1013, 896, 350, 27, palette.pale);
      dot(111, 1072, 10, palette.barTeal);
      text(phase === 'compare' ? 'COMPARING' : 'OBSERVING', 139, 1083, 32, palette.barTeal, 700);
      text(phase === 'compare' ? 'Compare' : 'Observing', 104, 1182, 76, palette.ink, 600);
      text(phase === 'compare' ? 'locations' : 'footfall', 104, 1268, 76, palette.ink, 600);
    }
    text('Illustrative scenario', 512, 1485, 31, palette.muted, 500, 'center');
    rounded(372, 1558, 280, 7, 3, '#9baaa0');
    texture.needsUpdate = true;
  }
  update();
  return {
    mesh, update,
    dispose() { texture?.dispose(); material.dispose(); mesh.geometry.dispose(); },
  };
}
