// The lights of Rua Avanhandava: strings of coloured glass bulbs crossing the
// street in depth, as on the trattoria's facade. A small dedicated WebGL
// renderer (no 3D library): bulbs are sphere impostors with glass shading and
// depth of field, wires are catenaries, every bulb is a damped pendulum moved
// by a slow breeze and by the pointer. Without WebGL the same scene is drawn
// once with Canvas 2D; with reduced motion it renders a single still frame.

const PALETTE = [
  [1.0, 0.71, 0.23],   // amber
  [1.0, 0.42, 0.62],   // rose
  [0.29, 0.45, 1.0],   // cobalt
  [0.2, 0.76, 0.48],   // emerald
  [1.0, 0.48, 0.18],   // tangerine
  [1.0, 0.94, 0.82],   // warm white
];

const FOV = (38 * Math.PI) / 180;
const TAN = Math.tan(FOV / 2);
const CAMERA_Z = 6;
const FOCUS_DIST = 7.5;

// Deterministic randomness so the composition is the same on every visit.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** String layouts in screen terms: ends at ndc y, depth z, sag in world units. */
function layoutFor(aspect, wide) {
  const portrait = aspect < 0.9;
  const lift = portrait ? 0.18 : 0;
  const strings = [
    { from: { side: -1, y: 0.95 + lift, z: 1.6 }, to: { side: 1, y: 0.7 + lift, z: -5.5 }, sag: 0.5 },
    { from: { side: 1, y: 1.08 + lift, z: 0.8 }, to: { side: -1, y: 0.66 + lift, z: -7.5 }, sag: 0.7 },
  ];
  if (wide) strings.push({ from: { side: -1, y: 0.84, z: -11 }, to: { side: 1, y: 0.9, z: -11 }, sag: 1.2 });
  return strings;
}

export function createFestoon(canvas, { still = false, onReady } = {}) {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  const renderer = gl ? createGLRenderer(gl) : null;
  const ctx2d = renderer ? null : canvas.getContext('2d');
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  const state = {
    width: 1,
    height: 1,
    dpr: 1,
    aspect: 1,
    strings: [],
    bulbs: [],
    camera: { x: 0, y: 0, z: CAMERA_Z },
    pointer: { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, active: false },
    progress: 0,
    lit: still ? Infinity : 0,  // seconds since the lights were switched on
    lighting: false,
    time: 0,
    running: false,
    visible: true,
    raf: 0,
  };

  function project(x, y, z) {
    const c = state.camera;
    const dz = c.z - z;
    return {
      x: (((x - c.x) / (dz * TAN * state.aspect)) + 1) * 0.5 * state.width,
      y: (1 - ((y - c.y) / (dz * TAN))) * 0.5 * state.height,
      scale: (0.5 * state.height) / (dz * TAN),
      dz,
    };
  }

  function build() {
    const random = rng(1980);
    const wide = state.width > 900;
    const baseGap = wide ? 0.42 : 0.48;
    state.strings = [];
    state.bulbs = [];
    let colourIndex = 0;

    layoutFor(state.aspect, wide).forEach((def, si) => {
      const end = (e) => {
        const dz = CAMERA_Z - e.z;
        const halfH = dz * TAN;
        return { x: e.side * (halfH * state.aspect + 0.6), y: e.y * halfH, z: e.z };
      };
      const a = end(def.from);
      const b = end(def.to);
      const point = (s) => ({
        x: a.x + (b.x - a.x) * s,
        y: a.y + (b.y - a.y) * s - def.sag * 4 * s * (1 - s),
        z: a.z + (b.z - a.z) * s,
      });
      const samples = 96;
      const points = [];
      for (let i = 0; i <= samples; i++) points.push(point(i / samples));
      state.strings.push(points);

      // Bulbs evenly spaced along the arc.
      let carried = baseGap * 0.5;
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const len = Math.hypot(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
        carried += len;
        // Distant bulbs are spaced wider so the far strings stay quiet.
        const gap = baseGap * (1 + Math.max(0, -p1.z) / 9);
        if (carried < gap) continue;
        carried -= gap;
        let colour = Math.floor(random() * PALETTE.length);
        if (colour === colourIndex) colour = (colour + 1) % PALETTE.length;
        colourIndex = colour;
        state.bulbs.push({
          ax: p1.x, ay: p1.y, az: p1.z,
          drop: 0.12 + random() * 0.1,
          radius: 0.068 + random() * 0.018,
          colour: PALETTE[colour],
          thetaX: 0, thetaZ: 0, velX: 0, velZ: 0,
          phase: random() * Math.PI * 2,
          order: si * 0.35 + (i / samples),
          x: 0, y: 0, z: 0, intensity: still ? 1 : 0,
        });
      }
    });
    positionBulbs();
  }

  function positionBulbs() {
    for (const b of state.bulbs) {
      b.x = b.ax + Math.sin(b.thetaX) * b.drop;
      b.y = b.ay - Math.cos(b.thetaX) * Math.cos(b.thetaZ) * b.drop;
      b.z = b.az + Math.sin(b.thetaZ) * b.drop;
    }
  }

  function step(dt) {
    state.time += dt;
    const t = state.time;
    const p = state.pointer;

    // Pointer: eased parallax and a velocity that brushes nearby bulbs.
    p.x += (p.tx - p.x) * Math.min(1, dt * 4);
    p.y += (p.ty - p.y) * Math.min(1, dt * 4);
    p.vx *= Math.exp(-dt * 6);
    p.vy *= Math.exp(-dt * 6);

    const c = state.camera;
    const pr = state.progress;
    c.x = p.x * 0.28;
    c.y = p.y * 0.16 - pr * 0.35;
    c.z = CAMERA_Z - pr * 3.2;

    if (state.lighting) state.lit += dt;

    for (const b of state.bulbs) {
      const g = 9.8 / (b.drop * 6);
      const wind = 0.5 * Math.sin(t * 0.55 + b.ax * 0.45 + b.phase * 0.2) + 0.25 * Math.sin(t * 1.3 + b.ax * 1.1);
      let pushX = wind * 0.9;
      let pushZ = Math.sin(t * 0.4 + b.phase) * 0.35;

      if (p.active) {
        const s = project(b.x, b.y, b.z);
        const px = ((p.tx + 1) * 0.5) * state.width;
        const py = ((1 - p.ty) * 0.5) * state.height;
        const d = Math.hypot(s.x - px, s.y - py);
        const reach = 140 * (state.dpr || 1);
        if (d < reach) {
          const f = (1 - d / reach) ** 2;
          pushX += p.vx * f * 160;
          pushZ += p.vy * f * 80;
        }
      }

      b.velX += (-g * b.thetaX + pushX - 1.6 * b.velX) * dt;
      b.velZ += (-g * b.thetaZ + pushZ - 1.6 * b.velZ) * dt;
      b.thetaX = Math.max(-0.9, Math.min(0.9, b.thetaX + b.velX * dt));
      b.thetaZ = Math.max(-0.7, Math.min(0.7, b.thetaZ + b.velZ * dt));

      // Switch-on: a tungsten warm-up with a small overshoot, left to right.
      const since = state.lit - (0.1 + b.order * 1.1);
      if (since <= 0) b.intensity = 0;
      else if (since < 0.25) b.intensity = (since / 0.25) * 1.18;
      else b.intensity = 1 + 0.18 * Math.exp(-(since - 0.25) * 6) + 0.035 * Math.sin(t * 2.1 + b.phase);
    }
    positionBulbs();
  }

  function draw() {
    if (renderer) renderer.draw(state);
    else if (ctx2d) draw2d(ctx2d, state, project);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dprCap = coarse ? 1.5 : 1.75;
    state.dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    state.width = Math.max(1, Math.round(rect.width * state.dpr));
    state.height = Math.max(1, Math.round(rect.height * state.dpr));
    state.aspect = state.width / state.height;
    canvas.width = state.width;
    canvas.height = state.height;
    renderer?.resize(state.width, state.height);
    build();
    draw();
  }

  let last = 0;
  function frame(now) {
    state.raf = 0;
    if (!state.running || !state.visible) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    step(dt);
    draw();
    state.raf = requestAnimationFrame(frame);
  }

  function start() {
    if (still || !renderer) return;
    state.running = true;
    if (!state.raf && state.visible) {
      last = 0;
      state.raf = requestAnimationFrame(frame);
    }
  }

  function stop() {
    state.running = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
  }

  // Pause when the hero is off screen or the tab is hidden.
  const io = new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting && !document.hidden;
    if (state.visible) start(); else if (state.raf) { cancelAnimationFrame(state.raf); state.raf = 0; }
  });
  io.observe(canvas);
  const onVisibility = () => {
    state.visible = !document.hidden;
    if (state.visible) start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const onPointer = (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    const p = state.pointer;
    p.vx = nx - p.tx;
    p.vy = ny - p.ty;
    p.tx = nx;
    p.ty = ny;
    p.active = true;
  };
  const onLeave = () => { state.pointer.active = false; state.pointer.tx = 0; state.pointer.ty = 0; };
  if (!still && !coarse) {
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  resize();
  onReady?.(renderer ? 'webgl' : '2d');

  return {
    mode: renderer ? 'webgl' : '2d',
    /** Switch the lights on, string by string (the entrance). */
    lightUp() {
      if (still || !renderer) { state.bulbs.forEach((b) => { b.intensity = 1; }); draw(); return; }
      state.lighting = true;
      start();
    },
    /** 0 at the top of the hero, 1 when it has scrolled away. */
    setProgress(p) {
      state.progress = Math.max(0, Math.min(1, p));
      if (still || !renderer) return;
      start();
    },
    destroy() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    },
  };
}

/* ---------- WebGL renderer ---------- */

const PROJECT_GLSL = `
uniform vec3 uCam;
uniform float uTan;
uniform float uAspect;
vec4 project(vec3 p, vec2 offset) {
  float dz = uCam.z - p.z;
  vec2 rel = p.xy - uCam.xy + offset;
  return vec4(rel.x / (uTan * uAspect), rel.y / uTan, 0.0, dz);
}`;

const WIRE_VS = `
attribute vec3 aPos;
${PROJECT_GLSL}
varying float vFade;
void main() {
  gl_Position = project(aPos, vec2(0.0));
  float dz = uCam.z - aPos.z;
  vFade = clamp(1.25 - dz / 22.0, 0.25, 1.0);
}`;

const WIRE_FS = `
precision mediump float;
varying float vFade;
void main() {
  gl_FragColor = vec4(vec3(0.34, 0.29, 0.25) * vFade, vFade);
}`;

const BULB_VS = `
attribute vec3 aCenter;
attribute vec2 aCorner;
attribute float aRadius;
attribute vec3 aColour;
attribute float aIntensity;
${PROJECT_GLSL}
uniform float uFocus;
uniform float uSpread;
varying vec2 vCorner;
varying vec3 vColour;
varying float vIntensity;
varying float vBlur;
void main() {
  float dz = uCam.z - aCenter.z;
  vBlur = clamp(abs(dz - uFocus) / 9.0, 0.0, 1.0);
  vCorner = aCorner * uSpread;
  vColour = aColour;
  vIntensity = aIntensity;
  gl_Position = project(aCenter, aCorner * uSpread * aRadius);
}`;

const BULB_FS = `
precision mediump float;
varying vec2 vCorner;
varying vec3 vColour;
varying float vIntensity;
varying float vBlur;
void main() {
  vec2 p = vCorner;
  float r2 = dot(p, p);
  float edge = mix(0.04, 0.55, vBlur);

  // Metal socket above the glass.
  if (r2 > 1.0) {
    float cap = step(abs(p.x), 0.32) * step(0.78, p.y) * step(p.y, 1.28);
    if (cap < 0.5) discard;
    gl_FragColor = vec4(vec3(0.16, 0.13, 0.11) * (1.0 - vBlur * 0.6), 1.0 - vBlur * 0.7);
    return;
  }

  vec3 n = vec3(p, sqrt(1.0 - r2));
  float rim = pow(1.0 - n.z, 2.0);
  float core = exp(-r2 * 2.4);
  float I = vIntensity;
  vec3 glass = vColour;

  vec3 col = glass * (0.1 + 1.35 * core * I) + glass * rim * (0.18 + 0.6 * I);
  col += vec3(1.0, 0.93, 0.8) * pow(core, 7.0) * 0.75 * I;
  float spec = pow(max(dot(n, normalize(vec3(-0.45, 0.6, 0.66))), 0.0), 48.0);
  col += vec3(1.0) * spec * (0.55 - vBlur * 0.4);
  col = 1.0 - exp(-col * 1.35);

  float alpha = 1.0 - smoothstep(1.0 - edge, 1.0, sqrt(r2));
  alpha *= 1.0 - vBlur * 0.35;
  gl_FragColor = vec4(col * alpha, alpha);
}`;

const HALO_FS = `
precision mediump float;
varying vec2 vCorner;
varying vec3 vColour;
varying float vIntensity;
varying float vBlur;
void main() {
  float d = length(vCorner) / 7.0;
  float glow = exp(-d * d * 9.0) * 0.55 + exp(-d * 3.2) * 0.12;
  vec3 col = vColour * glow * vIntensity * (0.85 - vBlur * 0.3);
  gl_FragColor = vec4(col, 0.0);
}`;

function createGLRenderer(gl) {
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const program = (vs, fs) => {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  };

  let wire, bulb, halo;
  try {
    wire = program(WIRE_VS, WIRE_FS);
    bulb = program(BULB_VS, BULB_FS);
    halo = program(BULB_VS, HALO_FS);
  } catch (err) {
    console.warn('Festoon: WebGL shaders unavailable, using 2D fallback.', err);
    return null;
  }

  const wireBuf = gl.createBuffer();
  const quadBuf = gl.createBuffer();
  const indexBuf = gl.createBuffer();
  const FLOATS_PER_VERT = 3 + 2 + 1 + 3 + 1;
  let quadData = new Float32Array(0);
  let indexCount = 0;
  const corners = [[-1, -1], [1, -1], [1, 1.3], [-1, 1.3]];

  const uniforms = (p) => ({
    cam: gl.getUniformLocation(p, 'uCam'),
    tan: gl.getUniformLocation(p, 'uTan'),
    aspect: gl.getUniformLocation(p, 'uAspect'),
    focus: gl.getUniformLocation(p, 'uFocus'),
    spread: gl.getUniformLocation(p, 'uSpread'),
  });
  const u = { wire: uniforms(wire), bulb: uniforms(bulb), halo: uniforms(halo) };

  const setCamera = (loc, state) => {
    gl.uniform3f(loc.cam, state.camera.x, state.camera.y, state.camera.z);
    gl.uniform1f(loc.tan, TAN);
    gl.uniform1f(loc.aspect, state.aspect);
    if (loc.focus) gl.uniform1f(loc.focus, FOCUS_DIST - state.progress * 2.5);
  };

  const bindQuadAttribs = (p) => {
    const stride = FLOATS_PER_VERT * 4;
    const attr = (name, size, offset) => {
      const loc = gl.getAttribLocation(p, name);
      if (loc < 0) return;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset * 4);
    };
    attr('aCenter', 3, 0);
    attr('aCorner', 2, 3);
    attr('aRadius', 1, 5);
    attr('aColour', 3, 6);
    attr('aIntensity', 1, 9);
  };

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);

  return {
    resize(w, h) { gl.viewport(0, 0, w, h); },
    draw(state) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Wires: main strings plus the short drops to each socket.
      const lines = [];
      for (const points of state.strings) {
        for (let i = 1; i < points.length; i++) {
          const a = points[i - 1];
          const b = points[i];
          lines.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
      for (const b of state.bulbs) {
        lines.push(b.ax, b.ay, b.az, b.x, b.y + b.radius * 1.25, b.z);
      }
      gl.useProgram(wire);
      setCamera(u.wire, state);
      gl.bindBuffer(gl.ARRAY_BUFFER, wireBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.DYNAMIC_DRAW);
      const posLoc = gl.getAttribLocation(wire, 'aPos');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.LINES, 0, lines.length / 3);
      gl.disableVertexAttribArray(posLoc);

      // Bulbs, far to near.
      const sorted = state.bulbs.slice().sort((a, b) => a.z - b.z);
      const needed = sorted.length * 4 * FLOATS_PER_VERT;
      if (quadData.length !== needed) {
        quadData = new Float32Array(needed);
        const indices = new Uint16Array(sorted.length * 6);
        for (let i = 0; i < sorted.length; i++) {
          indices.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        indexCount = indices.length;
      }
      let o = 0;
      for (const b of sorted) {
        for (const [cx, cy] of corners) {
          quadData[o++] = b.x; quadData[o++] = b.y; quadData[o++] = b.z;
          quadData[o++] = cx; quadData[o++] = cy;
          quadData[o++] = b.radius;
          quadData[o++] = b.colour[0]; quadData[o++] = b.colour[1]; quadData[o++] = b.colour[2];
          quadData[o++] = b.intensity;
        }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.bufferData(gl.ARRAY_BUFFER, quadData, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);

      // Halos first (additive light), then the glass on top.
      gl.useProgram(halo);
      setCamera(u.halo, state);
      gl.uniform1f(u.halo.spread, 7.0);
      bindQuadAttribs(halo);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);

      gl.useProgram(bulb);
      setCamera(u.bulb, state);
      gl.uniform1f(u.bulb.spread, 1.0);
      bindQuadAttribs(bulb);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
    },
  };
}

/* ---------- Canvas 2D fallback (one still frame) ---------- */

function draw2d(ctx, state, project) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.lineWidth = Math.max(1, state.dpr * 0.8);
  ctx.strokeStyle = 'rgba(87, 74, 64, 0.85)';
  for (const points of state.strings) {
    ctx.beginPath();
    points.forEach((p, i) => {
      const s = project(p.x, p.y, p.z);
      if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
    });
    ctx.stroke();
  }
  const sorted = state.bulbs.slice().sort((a, b) => a.z - b.z);
  for (const b of sorted) {
    const s = project(b.x, b.y, b.z);
    const a = project(b.ax, b.ay, b.az);
    const r = b.radius * s.scale;
    const [cr, cg, cb] = b.colour.map((c) => Math.round(c * 255));
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(s.x, s.y - r);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 7);
    halo.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.45)`);
    halo.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
    ctx.fillStyle = halo;
    ctx.fillRect(s.x - r * 7, s.y - r * 7, r * 14, r * 14);
    ctx.globalCompositeOperation = 'source-over';
    const glass = ctx.createRadialGradient(s.x - r * 0.3, s.y - r * 0.35, r * 0.05, s.x, s.y, r);
    glass.addColorStop(0, 'rgba(255, 248, 230, 1)');
    glass.addColorStop(0.35, `rgb(${cr}, ${cg}, ${cb})`);
    glass.addColorStop(1, `rgba(${Math.round(cr * 0.55)}, ${Math.round(cg * 0.55)}, ${Math.round(cb * 0.55)}, 1)`);
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}
