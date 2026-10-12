// Camera constraints need the miniature's silhouette, not the empty upper
// corners of the oval plinth's bounding box. Run once after finish() and after
// installing animate(); the caller should restore animate(0) before rendering.
export function setBuzoFraming(THREE, model) {
  const bands = new Map();
  const bandHeight = .20;
  const cellSize = .035;
  const padding = .025;
  const point = new THREE.Vector3();
  const matrix = new THREE.Matrix4();
  const inverse = new THREE.Matrix4();
  const instance = new THREE.Matrix4();
  const localBounds = new WeakMap();

  function addPoint(x, y, z) {
    if (![x, y, z].every(Number.isFinite)) return;
    const level = Math.floor(y / bandHeight);
    if (!bands.has(level)) bands.set(level, { minY: y, maxY: y, cells: new Map() });
    const band = bands.get(level);
    band.minY = Math.min(band.minY, y);
    band.maxY = Math.max(band.maxY, y);
    const ix = Math.floor(x / cellSize), iz = Math.floor(z / cellSize);
    band.cells.set(`${ix},${iz}`, [ix, iz]);
  }

  function ancestors(object, test) {
    for (let current = object; current && current !== model; current = current.parent) {
      if (test(current)) return true;
    }
    return false;
  }

  function excluded(object) {
    return ancestors(object, part => part.userData.excludeFromFraming === true || /beam/i.test(part.name));
  }

  function boundsFor(geometry) {
    if (!localBounds.has(geometry)) {
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      localBounds.set(geometry, geometry.boundingBox?.clone());
    }
    return localBounds.get(geometry);
  }

  function addBox(bounds, transform, beacon = false, pulse = false) {
    if (!bounds || bounds.isEmpty()) return;
    // Rings scale about their mesh origin. A further 10% reserve keeps a
    // selection pulse safe even when its peak falls between sampled poses.
    const scale = pulse ? 1.1 : 1;
    for (const x of [bounds.min.x, bounds.max.x]) {
      for (const y of [bounds.min.y, bounds.max.y]) {
        for (const z of [bounds.min.z, bounds.max.z]) {
          point.set(x * scale, y * scale, z * scale).applyMatrix4(transform);
          const motionMargin = beacon ? .12 : .035;
          for (const dx of [-.035, .035]) {
            for (const dy of [-motionMargin, motionMargin]) {
              for (const dz of [-.035, .035]) addPoint(point.x + dx, point.y + dy, point.z + dz);
            }
          }
        }
      }
    }
  }

  const staticMeshes = [], movingMeshes = [];
  model.traverse(object => {
    if (!object.isMesh || excluded(object)) return;
    // finish() batches fixed geometry by material directly under the model.
    // Those batches span several venues, so read their vertices once instead
    // of letting a large material-level box put empty space back into the fit.
    (object.parent === model && !object.isInstancedMesh ? staticMeshes : movingMeshes).push(object);
  });
  model.updateWorldMatrix(true, true);
  inverse.copy(model.matrixWorld).invert();
  for (const object of staticMeshes) {
    matrix.multiplyMatrices(inverse, object.matrixWorld);
    const positions = object.geometry.getAttribute('position');
    if (!positions) continue;
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(matrix);
      addPoint(point.x, point.y, point.z);
    }
  }

  const ticket = model.getObjectByName('saved-night-plan');
  let ticketRadius = 0;
  if (ticket && !excluded(ticket)) {
    const toTicket = new THREE.Matrix4().copy(ticket.matrixWorld).invert();
    ticket.traverse(object => {
      if (!object.isMesh || excluded(object)) return;
      const bounds = boundsFor(object.geometry);
      if (!bounds || bounds.isEmpty()) return;
      matrix.multiplyMatrices(toTicket, object.matrixWorld);
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) {
            point.set(x, y, z).applyMatrix4(matrix);
            ticketRadius = Math.max(ticketRadius, point.length());
          }
        }
      }
    });
  }

  const duration = Number.isFinite(model.userData.animationDuration) && model.userData.animationDuration > 0
    ? model.userData.animationDuration : 18;
  const samples = typeof model.userData.animate === 'function' ? 9 : 1;
  for (let sample = 0; sample < samples; sample++) {
    model.userData.animate?.(duration * sample / samples);
    model.updateWorldMatrix(true, true);
    inverse.copy(model.matrixWorld).invert();
    for (const object of movingMeshes) {
      const bounds = boundsFor(object.geometry);
      const beacon = ancestors(object, part => part.name === 'venue-beacons');
      const pulse = ancestors(object, part => /pulse|halo/i.test(part.name));
      matrix.multiplyMatrices(inverse, object.matrixWorld);
      if (object.isInstancedMesh) {
        for (let i = 0; i < object.count; i++) {
          object.getMatrixAt(i, instance);
          instance.premultiply(matrix);
          addBox(bounds, instance, beacon, pulse);
        }
      } else {
        addBox(bounds, matrix, beacon, pulse);
      }
    }
    if (ticketRadius) {
      matrix.multiplyMatrices(inverse, ticket.matrixWorld);
      const center = new THREE.Vector3().setFromMatrixPosition(matrix);
      // A local enclosing sphere remains valid throughout the ticket's yaw
      // sweep (-.2 to .28), tilt, 1.2x scale and additional .12-unit rise.
      const radius = ticketRadius * Math.max(1.2, matrix.getMaxScaleOnAxis());
      for (const x of [-radius, radius]) {
        for (const y of [-radius - .12, radius + .12]) {
          for (const z of [-radius, radius]) addPoint(center.x + x, center.y + y, center.z + z);
        }
      }
    }
  }

  function hull(points) {
    points.sort((a, b) => a.x - b.x || a.z - b.z);
    const cross = (a, b, c) => (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
    const lower = [], upper = [];
    for (const p of points) {
      while (lower.length > 1 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop();
      lower.push(p);
    }
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i];
      while (upper.length > 1 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop();
      upper.push(p);
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }

  const framingPoints = [];
  for (const band of bands.values()) {
    const corners = new Map();
    for (const [ix, iz] of band.cells.values()) {
      for (const x of [ix * cellSize - padding, (ix + 1) * cellSize + padding]) {
        for (const z of [iz * cellSize - padding, (iz + 1) * cellSize + padding]) corners.set(`${x},${z}`, { x, z });
      }
    }
    // Every input vertex lies inside its padded cell. Taking the horizontal
    // convex hull and both height extremes therefore encloses all vertices
    // and triangles, while emitting only the silhouette of each height band.
    for (const vertex of hull([...corners.values()])) {
      framingPoints.push(new THREE.Vector3(vertex.x, band.minY - padding, vertex.z));
      framingPoints.push(new THREE.Vector3(vertex.x, band.maxY + padding, vertex.z));
    }
  }
  if (framingPoints.length) {
    model.userData.framingPoints = framingPoints;
    model.userData.framingBounds = new THREE.Box3().setFromPoints(framingPoints);
  }
  return framingPoints;
}
