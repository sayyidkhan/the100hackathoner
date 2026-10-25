// Locally generated, seamless architectural material tiles. No DOM or remote assets.
// All maps are 512². Color is authored in sRGB; height/roughness remain linear data.
// Use material.color=white, roughness=1, metalness=0. Suggested bumpScale:
// oak .009, stone .012, plaster .006 (scene uses metres-like miniature units).
// Oak fibres run along V: use normalized 0–1 UVs per cabinet door, or repeat
// (1.4, .65) on world-space ExtrudeGeometry UVs. Stone: (.8,.8), plaster: (.7,.7).
// Change repeat/rotation identically on map, bumpMap and roughnessMap.
export function pestSurfaces(T) {
  const size = 512, tau = Math.PI * 2;
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const smooth = v => { const x = clamp(v); return x*x*(3-2*x); };
  const fract = x => x - Math.floor(x);
  const mix = (a, b, t) => a + (b-a)*t;

  function randomSequence(seed) {
    let state = seed;
    return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
  }
  // Periodic anisotropic value noise. Rectangular lattices retain long timber
  // fibres, unlike isotropic speckle which makes wood look like dyed plastic.
  function noise(nx, ny, seed) {
    const random = randomSequence(seed), values = new Float32Array(nx * ny);
    for (let i = 0; i < values.length; i++) values[i] = random();
    return (u, v) => {
      const x = fract(u)*nx, y = fract(v)*ny, ix = Math.floor(x), iy = Math.floor(y);
      const a = smooth(x-ix), b = smooth(y-iy), x1 = (ix+1)%nx, y1 = (iy+1)%ny;
      return mix(mix(values[iy*nx+ix],values[iy*nx+x1],a),mix(values[y1*nx+ix],values[y1*nx+x1],a),b);
    };
  }
  const coarse = noise(4,4,2301), cloud = noise(12,12,2302), mid = noise(37,37,2303);
  const grit = noise(123,123,2304), powder = noise(251,251,2305);
  const woodFlow = noise(7,3,2311), woodBands = noise(39,4,2312);
  const fibre = noise(237,7,2313), microFibre = noise(373,31,2314);
  const poreBreaks = noise(127,41,2315), stoneBands = noise(3,41,2320);

  // Stamp irregular pits into a tile with wrapped bounds, not uniform white noise.
  function pits(count, seed, length = 1) {
    const output = new Float32Array(size*size), random = randomSequence(seed);
    for (let n = 0; n < count; n++) {
      const cx = random()*size, cy = random()*size;
      const rx = .65 + Math.pow(random(),3)*4.3, ry = (.55 + random()*1.7)*length;
      const depth = .28 + random()*.72, phase = random()*tau;
      for (let y = Math.floor(cy-ry-1); y <= Math.ceil(cy+ry+1); y++) {
        for (let x = Math.floor(cx-rx-1); x <= Math.ceil(cx+rx+1); x++) {
          const dx = (x-cx)/rx, dy = (y-cy)/ry;
          const r = Math.sqrt(dx*dx+dy*dy)*(1+.14*Math.sin(Math.atan2(dy,dx)*5+phase));
          if (r >= 1) continue;
          const i = ((y%size+size)%size)*size+((x%size+size)%size);
          output[i] = Math.max(output[i], smooth((1-r)*2.6)*depth);
        }
      }
    }
    return output;
  }
  const stonePits = pits(680,2331), plasterPits = pits(1100,2332,.55);

  function texture(data, color, name) {
    const result = new T.DataTexture(data,size,size,T.RGBAFormat,T.UnsignedByteType);
    result.name = `pestoverflow-${name}`;
    result.colorSpace = color ? T.SRGBColorSpace : T.NoColorSpace;
    result.wrapS = result.wrapT = T.RepeatWrapping;
    result.magFilter = T.LinearFilter; result.minFilter = T.LinearMipmapLinearFilter;
    result.generateMipmaps = true; result.anisotropy = 4; result.needsUpdate = true;
    return result;
  }
  function make(kind, sample) {
    const color = new Uint8Array(size*size*4), height = new Uint8Array(color.length), rough = new Uint8Array(color.length);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const p = y*size+x, i = p*4, value = sample(x/size,y/size,p);
      for (let c = 0; c < 3; c++) {
        color[i+c] = Math.round(clamp(value[c],0,255));
        height[i+c] = Math.round(clamp(value[3])*255);
        rough[i+c] = Math.round(clamp(value[4])*255);
      }
      color[i+3] = height[i+3] = rough[i+3] = 255;
    }
    return {map:texture(color,true,`${kind}-color`),bumpMap:texture(height,false,`${kind}-height`),roughnessMap:texture(rough,false,`${kind}-roughness`)};
  }

  const oak = make('oak',(u,v) => {
    // Curved annual growth bands, with two broad cathedral sweeps and finely
    // interrupted latewood. A continuous domain warp keeps edges tileable.
    const bend = .044*Math.sin(tau*v) + .020*Math.sin(tau*(2*v)+1.2);
    const flow = u+bend+(woodFlow(u,v)-.5)*.041;
    const grain = .5+.5*Math.sin(tau*(flow*17 + .20*Math.sin(tau*v)));
    const latewood = Math.pow(grain,12)*(.55+.45*woodBands(flow,v));
    const growth = woodBands(flow,v), strands = fibre(flow,v), fine = microFibre(flow,v);
    // Elongated open pores are concentrated within dark latewood; they are
    // sparse, tapered and subtly raised at the edge in the height channel.
    const pores = smooth((strands-.72)*6.3)*smooth((poreBreaks(flow,v)-.47)*5.5);
    const ray = Math.pow(.5+.5*Math.sin(tau*(v*73+woodFlow(u,v)*.8)),28)*smooth((growth-.58)*4)*.18;
    const figure = (coarse(u,v)-.5)*15+(growth-.5)*13;
    const shade = figure-latewood*25-pores*31+(strands-.5)*9+(fine-.5)*6+ray*20;
    // Medium honey oak, gently browned rather than orange varnish.
    return [153+shade,112+shade*.84,74+shade*.68,
      .55+(strands-.5)*.14+(fine-.5)*.07-latewood*.10-pores*.25+ray*.06,
      .45+(growth-.5)*.09+latewood*.08+pores*.18+(fine-.5)*.035];
  });

  const stone = make('travertine',(u,v,p) => {
    const broad = coarse(u,v), cloudiness = cloud(u,v), minerals = mid(u,v), grain = grit(u,v);
    const strataV = v + (coarse(u+.31,v)-.5)*.075 + .014*Math.sin(tau*u*2);
    const strata = stoneBands(u,strataV), darkBand = smooth((strata-.60)*3.8);
    const pit = stonePits[p]*(.55+.45*cloudiness);
    // Sparse honey mineral inclusions blend into layered cream stone, avoiding
    // the high-frequency grey flecks of granite or a uniformly beige slab.
    const inclusion = smooth((minerals-.68)*4)*smooth((cloudiness-.52)*4);
    const shade = (broad-.5)*18+(cloudiness-.5)*13+(grain-.5)*5-darkBand*11-pit*37-inclusion*16;
    return [223+shade,208+shade*.95,182+shade*.84,
      .59+(minerals-.5)*.045+(grain-.5)*.065-darkBand*.025-pit*.40,
      .74+(cloudiness-.5)*.08+pit*.18+inclusion*.05-darkBand*.025];
  });

  const plaster = make('plaster',(u,v,p) => {
    const broad = coarse(u+.35,v+.17), cloudiness = cloud(u+.19,v+.29), grain = grit(u,v), dust = powder(u,v);
    // Low-frequency limewash/trowel marks remain tonal, not drawn-on swirls.
    const trowel = mid(u,v), lap = smooth((cloudiness-.48)*2.6);
    const pinhole = plasterPits[p];
    const shade=(broad-.5)*12+(cloudiness-.5)*10+(trowel-.5)*3+(grain-.5)*3+(dust-.5)*2-pinhole*9;
    return [217+shade,202+shade*.94,178+shade*.87,
      .54+(grain-.5)*.12+(dust-.5)*.08+(trowel-.5)*.035+lap*.025-pinhole*.15,
      .91+(cloudiness-.5)*.035+(dust-.5)*.025+pinhole*.045];
  });
  return { oak, stone, plaster };
}
