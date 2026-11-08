/* =================================================================
   LWH — THE LONG WAY HOME (portfolio port)
   Verbatim port of the story's main.js, adapted:
   - three.js + GSAP/ScrollTrigger/Lenis come from npm (already in deps)
   - DOM is rendered by React; mount(container, opts) drives it
   - everything is tearable: mount returns a dispose function
   ================================================================= */
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------- */
/* 1. CAPABILITY DETECTION                                            */
/* ----------------------------------------------------------------- */
const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch =
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);
const isSmall =
  typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;

function detectWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") ||
        c.getContext("webgl") ||
        c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/* Performance tier decides shader octaves, particle counts, post-fx. */
function detectTier() {
  if (isSmall || isTouch) return "low";
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  if (cores <= 4 || mem <= 4) return "mid";
  return "high";
}
const TIER = detectTier();

const TIER_CFG = {
  high: { octaves: 5, warp: 1, stars: [6000, 3600, 1800], dpr: 2.0, bloom: true, fxaa: false },
  mid: { octaves: 4, warp: 1, stars: [4000, 2400, 1100], dpr: 1.75, bloom: true, fxaa: false },
  low: { octaves: 3, warp: 0, stars: [2200, 1300, 600], dpr: 1.6, bloom: false, fxaa: false },
}[TIER];

/* ----------------------------------------------------------------- */
/* Small maths helpers                                                */
/* ----------------------------------------------------------------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smootherstep = (t) => {
  t = clamp(t, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/* Colours, authored to look correct on-screen as-is (no tone mapping,
   no OutputPass) so the desktop (composer) and mobile (direct) paths
   render identical hues. */
const COL = {
  bg: new THREE.Color("#04050A"),
  core: new THREE.Color("#1B1E3C"),
  ember: new THREE.Color("#C2724A"),
  thread: new THREE.Color("#2FB9A6"),
  violet: new THREE.Color("#9C6BFF"),
  cold: new THREE.Color("#8FB8E0"),
  warm: new THREE.Color("#FFB36B"),
  star: new THREE.Color("#EAF0FF"),
};

/* ----------------------------------------------------------------- */
/* GLSL — shared noise (Ashima simplex 3D)                            */
/* ----------------------------------------------------------------- */
const GLSL_NOISE = /* glsl */ `
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - 0.5;
    i = mod(i, 289.0);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    vec4 j = p - 49.0 * floor(p * (1.0/7.0) * (1.0/7.0));
    vec4 x_ = floor(j * (1.0/7.0));
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * (2.0/7.0) + 0.5/7.0 - 1.0;
    vec4 y = y_ * (2.0/7.0) + 0.5/7.0 - 1.0;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 g0 = vec3(a0.xy, h.x);
    vec3 g1 = vec3(a0.zw, h.y);
    vec3 g2 = vec3(a1.xy, h.z);
    vec3 g3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(g0,g0), dot(g1,g1), dot(g2,g2), dot(g3,g3)));
    g0 *= norm.x; g1 *= norm.y; g2 *= norm.z; g3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(g0,x0), dot(g1,x1), dot(g2,x2), dot(g3,x3)));
  }
`;

/* ----------------------------------------------------------------- */
/* 2. SPACE SCENE                                                     */
/* ----------------------------------------------------------------- */
class SpaceScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.firstFrame = false;
    this.time = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, TIER_CFG.dpr);

    this.state = {
      px: 0, py: -4, pz: 140, rx: 0.26, ry: 0, rz: 0, fov: 72,
      nebula: 0.05, horizon: 1.0, bloom: 0.35,
      warm: 1.0, wx: 6, wy: -10, wz: 60, arc: 0,
    };
    this.velTarget = 0;
    this.vel = 0;
    this.brighten = false;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    this._initRenderer();
    this._initScene();
    this._initNebula();
    this._initStars();
    this._initPlanets();
    this._initSignature();
    this._initPost();
    this.resize();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
    });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setClearColor(COL.bg, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(COL.bg, 0.00055);
    this.camera = new THREE.PerspectiveCamera(72, 1, 0.1, 4000);
    this.fovScale = 1;
  }

  /* Nebula — huge inverted sphere following the camera. */
  _initNebula() {
    const frag = /* glsl */ `
      precision highp float;
      varying vec3 vDir;
      uniform float uTime, uTravel, uNebula, uHorizon;
      uniform vec3 uBg, uCore, uViolet, uEmber, uThread, uCold, uWarm;
      ${GLSL_NOISE}
      float fbm(vec3 p){
        float v = 0.0, a = 0.5;
        for(int i=0;i<${TIER_CFG.octaves};i++){ v += a*snoise(p); p*=2.02; a*=0.5; }
        return v*0.5+0.5;
      }
      void main(){
        vec3 dir = normalize(vDir);
        vec3 col = uBg;

        // ---- domain-warped nebula ----
        vec3 p = dir * 2.3;
        p.z += uTravel;
        float w = fbm(p*0.55 + vec3(0.0,0.0,uTime*0.018));
        #if ${TIER_CFG.warp}
          float w2 = fbm(p*1.1 + vec3(w*1.6) + vec3(uTime*0.01));
          float n = fbm(p + 2.1*vec3(w) + 0.9*vec3(w2) + vec3(0.0,0.0,uTime*0.012));
        #else
          float n = fbm(p + 2.1*vec3(w) + vec3(0.0,0.0,uTime*0.012));
        #endif

        float density = smoothstep(0.34, 0.96, n);
        vec3 neb = mix(uCore, uViolet, smoothstep(0.0, 0.62, density));
        neb = mix(neb, uEmber, smoothstep(0.6, 0.95, density) * 0.65);
        float thread = smoothstep(0.46,0.52,n) * (1.0-smoothstep(0.52,0.6,n));
        neb += uThread * thread * 0.5;
        col += neb * density * uNebula;

        // ---- Earth horizon + atmosphere (beats 0–1) ----
        float below = smoothstep(0.12, -0.6, dir.y);
        float band  = smoothstep(0.22, 0.0, abs(dir.y + 0.04));
        col += (uCold * band * 0.55 + uWarm * below * 0.4) * uHorizon;

        gl_FragColor = vec4(max(col, 0.0), 1.0);
      }
    `;
    const vert = /* glsl */ `
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    this.nebulaUniforms = {
      uTime: { value: 0 },
      uTravel: { value: 0 },
      uNebula: { value: this.state.nebula },
      uHorizon: { value: this.state.horizon },
      uBg: { value: COL.bg },
      uCore: { value: COL.core },
      uViolet: { value: COL.violet },
      uEmber: { value: COL.ember },
      uThread: { value: COL.thread },
      uCold: { value: COL.cold },
      uWarm: { value: COL.warm },
    };
    const geo = new THREE.SphereGeometry(8, 64, 48);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.nebulaUniforms,
      vertexShader: vert,
      fragmentShader: frag,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      fog: false,
    });
    this.nebula = new THREE.Mesh(geo, mat);
    this.nebula.renderOrder = -1;
    this.nebula.frustumCulled = false;
    this.scene.add(this.nebula);
  }

  /* Three parallax star layers with warp-stretch glow. */
  _initStars() {
    this.starUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: this.dpr },
      uVelocity: { value: 0 },
    };
    const vert = /* glsl */ `
      attribute float aSize;
      attribute float aSeed;
      attribute vec3 aColor;
      uniform float uTime, uPixelRatio, uVelocity;
      varying float vTw;
      varying vec2 vNdc;
      varying vec3 vCol;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec4 clip = projectionMatrix * mv;
        vNdc = clip.xy / max(clip.w, 0.0001);
        vTw = 0.55 + 0.45 * sin(uTime * (0.4 + aSeed) + aSeed * 6.2831);
        vCol = aColor;
        gl_Position = clip;
        gl_PointSize = aSize * uPixelRatio * (320.0 / max(-mv.z, 1.0)) * (1.0 + uVelocity * 2.2);
      }
    `;
    const frag = /* glsl */ `
      precision highp float;
      uniform float uVelocity;
      varying float vTw;
      varying vec2 vNdc;
      varying vec3 vCol;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        vec2 dir = normalize(vNdc + vec2(0.0001));
        float r = dot(uv, dir);
        float t = dot(uv, vec2(-dir.y, dir.x));
        float stretch = 1.0 + uVelocity * 7.0;
        float d = length(vec2(r / stretch, t));
        float a = smoothstep(0.5, 0.0, d) * vTw;
        if (a < 0.01) discard;
        gl_FragColor = vec4(vCol, a);
      }
    `;

    this.starLayers = [];
    const ranges = [
      { depth: [-1700, 150], spread: 700, size: [0.7, 1.6], tint: 0.15 },
      { depth: [-1500, 120], spread: 460, size: [1.1, 2.4], tint: 0.35 },
      { depth: [-1300, 100], spread: 300, size: [1.8, 3.6], tint: 0.6 },
    ];
    TIER_CFG.stars.forEach((count, li) => {
      const r = ranges[li];
      const pos = new Float32Array(count * 3);
      const size = new Float32Array(count);
      const seed = new Float32Array(count);
      const color = new Float32Array(count * 3);
      const cWarm = COL.warm,
        cCold = COL.cold,
        cWhite = COL.star;
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * r.spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * r.spread;
        pos[i * 3 + 2] = lerp(r.depth[0], r.depth[1], Math.random());
        size[i] = lerp(r.size[0], r.size[1], Math.random());
        seed[i] = Math.random();
        const k = Math.random();
        const base = k < 0.12 ? cWarm : k < 0.28 ? cCold : cWhite;
        const m = r.tint * Math.random();
        color[i * 3] = lerp(cWhite.r, base.r, m);
        color[i * 3 + 1] = lerp(cWhite.g, base.g, m);
        color[i * 3 + 2] = lerp(cWhite.b, base.b, m);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
      const mat = new THREE.ShaderMaterial({
        uniforms: this.starUniforms,
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      });
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      pts.renderOrder = 1;
      this.scene.add(pts);
      this.starLayers.push(pts);
    });
  }

  /* Two planets — never centred. */
  _initPlanets() {
    const vert = /* glsl */ `
      varying vec3 vN; varying vec3 vPos; varying vec3 vViewPos;
      void main(){
        vPos = position;
        vN = normalize((modelViewMatrix * vec4(normal, 0.0)).xyz);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `;
    const frag = /* glsl */ `
      precision highp float;
      varying vec3 vN; varying vec3 vPos; varying vec3 vViewPos;
      uniform vec3 uColor; uniform vec3 uRim; uniform vec3 uLightDir; uniform float uTime; uniform float uReveal;
      ${GLSL_NOISE}
      float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<3;i++){ v+=a*snoise(p); p*=2.1; a*=0.5;} return v*0.5+0.5; }
      void main(){
        vec3 N = normalize(vN);
        vec3 V = normalize(vViewPos);
        float ndl = dot(N, normalize(uLightDir));
        float lit = smoothstep(-0.05, 0.35, ndl);
        float bands = fbm(vPos * 2.4 + vec3(0.0, uTime*0.02, 0.0));
        vec3 surf = uColor * (0.32 + bands * 0.5);
        vec3 col = surf * (0.06 + lit * 0.95);
        float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
        col += uRim * fres * (0.5 + lit * 0.5);
        col *= uReveal;
        gl_FragColor = vec4(col, 1.0);
      }
    `;
    const mkPlanet = (radius, color, rim, pos, light) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uRim: { value: new THREE.Color(rim) },
          uLightDir: { value: light },
          uTime: { value: 0 },
          uReveal: { value: 0 },
        },
        vertexShader: vert,
        fragmentShader: frag,
        fog: false,
      });
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 5), mat);
      m.position.set(pos.x, pos.y, pos.z);
      m.renderOrder = 0;
      this.scene.add(m);
      return m;
    };
    this.planets = [
      mkPlanet(40, "#C9C9C4", "#8FB8E0", { x: -92, y: 26, z: -300 }, new THREE.Vector3(0.6, 0.4, 0.7)),
      mkPlanet(78, "#B8895A", "#FFB36B", { x: 86, y: -34, z: -760 }, new THREE.Vector3(-0.5, 0.3, 0.6)),
    ];
  }

  /* The signature porch light + trail arc. */
  _initSignature() {
    const frag = /* glsl */ `
      precision mediump float;
      varying vec2 vUv;
      uniform mediump vec3 uColor; uniform mediump float uOpacity;
      void main(){
        float d = length(vUv - 0.5) * 2.0;
        float core = smoothstep(1.0, 0.0, d);
        float halo = smoothstep(1.0, 0.0, d);
        float a = pow(core, 2.2) * uOpacity;
        a += pow(halo, 6.0) * uOpacity * 0.6;
        vec3 c = mix(uColor, vec3(1.0), pow(core, 8.0) * 0.6);
        gl_FragColor = vec4(c, a);
      }
    `;
    const vert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
    this.sigUniforms = { uColor: { value: COL.warm }, uOpacity: { value: this.state.warm } };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.sigUniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    this.signature = new THREE.Mesh(new THREE.PlaneGeometry(48, 48), mat);
    this.signature.renderOrder = 3;
    this.signature.frustumCulled = false;
    this.scene.add(this.signature);

    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(new THREE.Vector3(Math.sin(t * Math.PI) * 26, 3 + t * 8, lerp(-1320, -300, t)));
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
    this.arcMat = new THREE.LineBasicMaterial({
      color: COL.warm,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.arc = new THREE.Line(arcGeo, this.arcMat);
    this.arc.renderOrder = 2;
    this.arc.frustumCulled = false;
    this.scene.add(this.arc);
  }

  _initPost() {
    this.useComposer = false;
    if (!TIER_CFG.bloom || reducedMotion) return;
    this.postReady = (async () => {
      try {
        const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }] = await Promise.all([
          import("three/examples/jsm/postprocessing/EffectComposer.js"),
          import("three/examples/jsm/postprocessing/RenderPass.js"),
          import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
        ]);
        const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
        this.composer = new EffectComposer(this.renderer);
        this.composer.setPixelRatio(this.dpr);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.35, 0.72, 0.62);
        this.composer.addPass(this.bloom);

        if (TIER_CFG.fxaa) {
          const { ShaderPass } = await import("three/examples/jsm/postprocessing/ShaderPass.js");
          const { FXAAShader } = await import("three/examples/jsm/shaders/FXAAShader.js");
          this.fxaa = new ShaderPass(FXAAShader);
          this.composer.addPass(this.fxaa);
        }
        this.useComposer = true;
        this.resize();
      } catch (e) {
        console.warn("[post] bloom unavailable, falling back to direct render", e);
        this.useComposer = false;
      }
    })();
  }

  apply(s) {
    Object.assign(this.state, s);
    this.nebulaUniforms.uNebula.value = s.nebula;
    this.nebulaUniforms.uHorizon.value = s.horizon;
    this.sigUniforms.uOpacity.value = s.warm;
    if (this.arcMat) this.arcMat.opacity = s.arc;
    if (this.planets && s.pl != null)
      for (const p of this.planets) {
        p.material.uniforms.uReveal.value = s.pl;
        p.visible = s.pl > 0.02;
      }
  }

  setVelocityTarget(v) {
    this.velTarget = Math.max(this.velTarget, v);
  }

  resize() {
    const w = window.innerWidth,
      h = window.innerHeight;
    const aspect = w / h;
    this.camera.aspect = aspect;
    this.fovScale = aspect < 1 ? clamp((1 / aspect) * 0.92, 1, 1.45) : 1;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    if (this.useComposer && this.composer) {
      this.composer.setSize(w, h);
      const px = this.dpr;
      if (this.fxaa) this.fxaa.material.uniforms["resolution"].value.set(1 / (w * px), 1 / (h * px));
    }
  }

  render(dt) {
    const s = this.state;
    const animate = !reducedMotion;
    if (animate) this.time += dt;

    this.velTarget *= 0.9;
    this.vel = lerp(this.vel, this.velTarget, 0.12);

    let bx = 0, by = 0, brx = 0, pxr = 0, pyr = 0;
    if (animate) {
      bx = Math.sin(this.time * 0.3) * 1.2;
      by = Math.cos(this.time * 0.24) * 0.9;
      brx = Math.sin(this.time * 0.21) * 0.004;
      this.pointer.x = lerp(this.pointer.x, this.pointer.tx, 0.05);
      this.pointer.y = lerp(this.pointer.y, this.pointer.ty, 0.05);
      pxr = this.pointer.x;
      pyr = this.pointer.y;
    }

    this.camera.position.set(s.px + bx + pxr * 3, s.py + by + pyr * 2, s.pz);
    this.camera.rotation.set(s.rx + brx - pyr * 0.02, s.ry + pxr * 0.02, s.rz);
    const targetFov = s.fov * this.fovScale;
    if (Math.abs(this.camera.fov - targetFov) > 0.01) {
      this.camera.fov = targetFov;
      this.camera.updateProjectionMatrix();
    }

    this.nebula.position.copy(this.camera.position);
    this.nebulaUniforms.uTime.value = this.time;
    this.nebulaUniforms.uTravel.value = -s.pz * 0.0025;

    this.starUniforms.uTime.value = this.time;
    this.starUniforms.uVelocity.value = this.vel;

    if (animate)
      for (const p of this.planets) {
        p.rotation.y += dt * 0.03;
        p.material.uniforms.uTime.value = this.time;
      }

    this.signature.position.set(s.wx, s.wy, s.wz);
    this.signature.quaternion.copy(this.camera.quaternion);
    const sc = 1 + (this.brighten ? 0.5 : 0) + Math.sin(this.time * 1.05) * (animate ? 0.06 : 0);
    this.signature.scale.setScalar(sc);
    if (this.brighten) this.sigUniforms.uOpacity.value = Math.min(1.6, s.warm * 1.6);

    if (this.useComposer && this.composer) {
      this.bloom.strength = s.bloom + (this.brighten ? 0.25 : 0);
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    this.firstFrame = true;
  }

  dispose() {
    try {
      this.renderer.dispose();
      this.renderer.forceContextLoss?.();
    } catch {
      /* noop */
    }
  }
}

/* ----------------------------------------------------------------- */
/* 3. SPLIT TEXT                                                      */
/* ----------------------------------------------------------------- */
function splitText(el, mode) {
  const nodes = Array.from(el.childNodes);
  el.innerHTML = "";
  const inners = [];
  nodes.forEach((node) => {
    if (node.nodeName === "BR") {
      el.appendChild(document.createElement("br"));
      return;
    }
    const text = node.textContent;
    if (mode === "words") {
      text.split(/(\s+)/).forEach((part) => {
        if (part.trim() === "") {
          if (part) el.appendChild(document.createTextNode(part));
          return;
        }
        const w = document.createElement("span");
        w.className = "word";
        const inner = document.createElement("span");
        inner.className = "word__inner";
        inner.textContent = part;
        w.appendChild(inner);
        el.appendChild(w);
        inners.push(inner);
      });
    } else {
      text.split(/(\s+)/).forEach((part) => {
        if (part === "") return;
        if (/^\s+$/.test(part)) {
          el.appendChild(document.createTextNode(part));
          return;
        }
        const wrap = document.createElement("span");
        wrap.className = "char-word";
        Array.from(part).forEach((ch) => {
          const c = document.createElement("span");
          c.className = "char";
          const inner = document.createElement("span");
          inner.className = "char__inner";
          inner.textContent = ch;
          c.appendChild(inner);
          wrap.appendChild(c);
          inners.push(inner);
        });
        el.appendChild(wrap);
      });
    }
  });
  return inners;
}

/* ----------------------------------------------------------------- */
/* 4. MOUNT / BOOT                                                    */
/* ----------------------------------------------------------------- */
export function mountLWH(root, { onExitUniverse = () => {} } = {}) {
  const disposes = [];
  const createdTriggers = [];

  /* Camera + scene keyframes for the six movements. */
  const KF = [
    { px: 0, py: -4, pz: 140, rx: 0.26, ry: 0, rz: 0, fov: 72, nebula: 0.05, horizon: 1.0, bloom: 0.35, warm: 1.0, wx: 6, wy: -10, wz: 60, arc: 0, pl: 0.0 },
    { px: 0, py: 10, pz: 95, rx: 0.05, ry: 0, rz: 0, fov: 66, nebula: 0.12, horizon: 0.25, bloom: 0.4, warm: 0.0, wx: 6, wy: -10, wz: 60, arc: 0, pl: 0.15 },
    { px: 0, py: 0, pz: -140, rx: 0, ry: 0, rz: 0.05, fov: 60, nebula: 0.2, horizon: 0.0, bloom: 0.42, warm: 0.0, wx: 0, wy: 52, wz: -1320, arc: 0, pl: 1.0 },
    { px: 6, py: 5, pz: -560, rx: 0.0, ry: 0.05, rz: -0.03, fov: 70, nebula: 1.0, horizon: 0.0, bloom: 1.05, warm: 0.0, wx: 0, wy: 52, wz: -1320, arc: 0, pl: 1.0 },
    { px: 0, py: 0, pz: -980, rx: 0, ry: 0, rz: 0, fov: 56, nebula: 0.22, horizon: 0.0, bloom: 0.7, warm: 1.0, wx: 0, wy: 52, wz: -1320, arc: 0.06, pl: 0.25 },
    { px: 0, py: 0, pz: -1140, rx: 0, ry: 0, rz: 0, fov: 52, nebula: 0.15, horizon: 0.0, bloom: 0.62, warm: 1.0, wx: 0, wy: 52, wz: -1320, arc: 0.18, pl: 0.1 },
  ];
  const KEYS = Object.keys(KF[0]);

  let scene = null;
  let beatT = KF.map((_, i) => i / (KF.length - 1));
  let activeBeat = -1;

  const dom = {
    body: document.body,
    preloader: root.querySelector("#preloader"),
    plNum: root.querySelector("#plNum"),
    plFill: root.querySelector("#plFill"),
    plLabel: root.querySelector("[data-pl-label]"),
    plTitle: root.querySelector("[data-pl-title]"),
    cursor: root.querySelector("#cursor"),
    railFill: root.querySelector("#railFill"),
    telemetry: root.querySelector("#telemetryText"),
    scrollcue: root.querySelector("#scrollcue"),
    content: root.querySelector("#content"),
    webgl: root.querySelector("#webgl"),
    beats: Array.from(root.querySelectorAll(".beat")),
  };

  /* Map global scroll progress → eased, interpolated scene state. */
  function applyProgress(p) {
    let i = 0;
    while (i < beatT.length - 2 && p > beatT[i + 1]) i++;
    const a = beatT[i],
      b = beatT[i + 1];
    const u = b > a ? smootherstep((p - a) / (b - a)) : 0;
    const s = {};
    for (const k of KEYS) s[k] = lerp(KF[i][k], KF[i + 1][k], u);
    if (scene) scene.apply(s);

    if (dom.railFill) dom.railFill.style.height = (p * 100).toFixed(2) + "%";

    const idx = u < 0.5 ? i : i + 1;
    if (idx !== activeBeat) {
      activeBeat = idx;
      const el = dom.beats[idx];
      if (el) {
        if (dom.railFill) dom.railFill.style.background = el.dataset.rail;
        if (dom.telemetry && el.dataset.alt) {
          if (reducedMotion) {
            dom.telemetry.textContent = el.dataset.alt;
          } else {
            dom.telemetry.style.opacity = "0";
            setTimeout(() => {
              dom.telemetry.textContent = el.dataset.alt;
              dom.telemetry.style.opacity = "1";
            }, 220);
          }
        }
      }
    }
  }

  function measureBeats() {
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    beatT = dom.beats.map((el) => {
      const center = el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2;
      return clamp(center / total, 0, 1);
    });
    beatT[0] = 0;
    beatT[beatT.length - 1] = 1;
    for (let i = 1; i < beatT.length; i++) beatT[i] = Math.max(beatT[i], beatT[i - 1] + 0.0001);
  }

  function setupReveals() {
    return dom.beats.map((section) => {
      const headline = section.querySelector("[data-split]");
      let inners = [];
      if (headline) inners = splitText(headline, headline.dataset.split);
      const fades = Array.from(section.querySelectorAll("[data-reveal]"));

      const playIn = () => {
        if (inners.length) {
          gsap.fromTo(
            inners,
            { yPercent: 110, y: 0, opacity: 0 },
            {
              yPercent: 0,
              y: 0,
              opacity: 1,
              duration: 1.05,
              ease: "expo.out",
              stagger: headline.dataset.split === "chars" ? 0.024 : 0.05,
              overwrite: true,
            }
          );
        }
        fades.forEach((f, k) => {
          gsap.fromTo(
            f,
            { y: 26, opacity: 0 },
            {
              y: 0,
              opacity: f.classList.contains("sub")
                ? 0.82
                : f.classList.contains("drift")
                  ? 0.55
                  : 1,
              duration: 1.1,
              ease: "expo.out",
              delay: 0.25 + k * 0.08,
            }
          );
        });
      };
      const reset = () => {
        if (inners.length) gsap.set(inners, { yPercent: 110, y: 0, opacity: 0 });
        fades.forEach((f) => gsap.set(f, { y: 26, opacity: 0 }));
      };

      createdTriggers.push(
        ScrollTrigger.create({ trigger: section, start: "top 72%", onEnter: playIn, onLeaveBack: reset })
      );

      const inner = section.querySelector(".beat__inner");
      if (inner) {
        gsap.to(inner, {
          yPercent: -10,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
      return { playIn, reset, section };
    });
  }

  /* Custom cursor (fine pointers only). */
  function setupCursor() {
    if (isTouch || reducedMotion) return () => {};
    dom.body.classList.add("has-cursor");
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const tgt = { ...pos };
    const onMove = (e) => {
      tgt.x = e.clientX;
      tgt.y = e.clientY;
      if (scene) {
        scene.pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        scene.pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const hoverEls = Array.from(root.querySelectorAll("[data-hover], a, button"));
    const enter = () => dom.body.classList.add("cursor-hover");
    const leave = () => dom.body.classList.remove("cursor-hover");
    hoverEls.forEach((el) => {
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
    });
    disposes.push(() => {
      window.removeEventListener("pointermove", onMove);
      hoverEls.forEach((el) => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      });
    });
    return () => {
      pos.x = lerp(pos.x, tgt.x, 0.18);
      pos.y = lerp(pos.y, tgt.y, 0.18);
      dom.cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    };
  }

  /* Smooth scroll + the single scroll journey. */
  function startJourney() {
    let lenis = null;
    if (!reducedMotion) {
      try {
        /* Reuse the app's Lenis (wired to gsap.ticker by the root provider);
           only create one if it's absent. Never two instances — they fight. */
        lenis = window.__lenis || new Lenis({ lerp: isSmall ? 0.1 : 0.085, wheelMultiplier: 1, smoothWheel: true });
        const onScroll = (e) => {
          ScrollTrigger.update();
          if (scene) scene.setVelocityTarget(clamp(Math.abs(e.velocity) / 55, 0, 1));
          if (e.animatedScroll > 40) dom.body.classList.add("scrolled");
        };
        lenis.on("scroll", onScroll);
        window.__lwh = lenis;
        if (!window.__lenis) {
          gsap.ticker.add((t) => lenis.raf(t * 1000));
          gsap.ticker.lagSmoothing(0);
        }
        disposes.push(() => {
          lenis.off("scroll", onScroll);
          window.__lwh = null;
        });
      } catch (e) {
        console.warn("[lenis] init failed — falling back to native scroll", e);
        lenis = null;
      }
    }
    if (!lenis) {
      const onScroll = () => {
        if (window.scrollY > 40) dom.body.classList.add("scrolled");
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      disposes.push(() => window.removeEventListener("scroll", onScroll));
    }

    measureBeats();
    createdTriggers.push(
      ScrollTrigger.create({
        trigger: dom.content,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => applyProgress(self.progress),
        onRefresh: (self) => {
          measureBeats();
          applyProgress(self.progress);
        },
      })
    );

    let reveals = [];
    if (!reducedMotion) reveals = setupReveals();

    /* THE DIVE — when the viewer reaches the nebula (movement iv), the film
       hands itself over to the universe page. A short beat lets the masked
       reveal of the invitation line land before the crossing. */
    const diveBeat = dom.beats[dom.beats.length - 1];
    let diveTimer = 0;
    createdTriggers.push(
      ScrollTrigger.create({
        trigger: diveBeat,
        start: "top 40%",
        once: true,
        onEnter: () => {
          diveTimer = setTimeout(() => onExitUniverse(), 1800);
          disposes.push(() => clearTimeout(diveTimer));
        },
      })
    );

    ScrollTrigger.refresh();
    applyProgress(0);
    if (reveals[0]) reveals[0].playIn();
  }

  /* Preloader → dramatic reveal. */
  function runPreloader(onReady) {
    const load = { v: 0 };
    let assetsReady = false;
    const started = performance.now();
    const setNum = () => {
      const n = Math.round(load.v);
      dom.plNum.textContent = n;
      dom.plFill.style.width = n + "%";
    };

    gsap.to(load, { v: 92, duration: 1.9, ease: "power1.inOut", onUpdate: setNum });

    const finish = () => {
      gsap.to(load, {
        v: 100,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: setNum,
        onComplete: () => reveal(),
      });
    };

    const tryFinish = () => {
      const elapsed = performance.now() - started;
      if (assetsReady && elapsed > 2000) finish();
      else if (assetsReady) setTimeout(finish, 2000 - elapsed);
    };

    const ready = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise((res) => {
        let tries = 0;
        const check = () => {
          if (!scene || scene.firstFrame || ++tries > 240) res();
          else requestAnimationFrame(check);
        };
        check();
      }),
    ]);
    ready.then(() => {
      assetsReady = true;
      tryFinish();
    });
    setTimeout(() => {
      assetsReady = true;
      tryFinish();
    }, 5000);

    function reveal() {
      const tl = gsap.timeline();
      tl.to(
        [dom.plLabel, dom.plNum.parentElement, dom.plFill.parentElement],
        { opacity: 0, y: -18, duration: 0.6, ease: "power2.in", stagger: 0.05 }
      )
        .to(dom.plTitle, { opacity: 0, duration: 0.5 }, "<")
        .add(() => {
          dom.body.classList.remove("is-loading");
          dom.body.classList.add("is-ready");
        }, ">-0.1")
        .add(() => onReady(), "<")
        .to(
          dom.preloader,
          {
            opacity: 0,
            duration: 1.0,
            ease: "power2.inOut",
            filter: "blur(8px)",
            onComplete: () => {
              dom.preloader.style.display = "none";
            },
          },
          ">-0.2"
        );
    }
  }

  /* ---------------------------------------------------------------- */
  /* MAIN                                                              */
  /* ---------------------------------------------------------------- */
  document.body.classList.toggle("reduced", reducedMotion);
  document.body.classList.add("is-loading");

  const hasWebGL = detectWebGL();
  if (!hasWebGL) {
    document.body.classList.add("no-webgl");
  } else {
    try {
      scene = new SpaceScene(dom.webgl);
    } catch (e) {
      console.error("[webgl] init failed", e);
      document.body.classList.add("no-webgl");
      scene = null;
    }
  }

  let tickCursor = () => {};

  let last = performance.now();
  let hidden = false;
  const onVis = () => {
    hidden = document.hidden;
    if (!hidden) last = performance.now();
  };
  document.addEventListener("visibilitychange", onVis);
  disposes.push(() => document.removeEventListener("visibilitychange", onVis));

  const loop = (now) => {
    rafId = requestAnimationFrame(loop);
    if (hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (scene) scene.render(dt);
    tickCursor();
  };
  let rafId = requestAnimationFrame(loop);
  disposes.push(() => cancelAnimationFrame(rafId));

  let resizeRaf = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      if (scene) scene.resize();
      ScrollTrigger.refresh();
    });
  };
  window.addEventListener("resize", onResize);
  disposes.push(() => {
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(resizeRaf);
  });

  tickCursor = setupCursor();
  disposes.push(() => {
    document.body.classList.remove(
      "has-cursor", "cursor-hover", "cursor-held", "scrolled",
      "is-ready", "is-loading", "no-webgl", "reduced", "lwh-done"
    );
    if (scene) scene.dispose();
  });

  if (reducedMotion) {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    if (dom.preloader) dom.preloader.style.display = "none";
    startJourney();
  } else {
    runPreloader(() => {
      startJourney();
    });
  }

  /* ---------------------------------------------------------------- */
  /* CLEANUP — tear everything down on route leave                      */
  /* ---------------------------------------------------------------- */
  return function disposeLWH() {
    for (let i = disposes.length - 1; i >= 0; i--) {
      try {
        disposes[i]();
      } catch {
        /* noop */
      }
    }
    createdTriggers.forEach((t) => t.kill());
  };
}

/* ----------------------------------------------------------------- */
/* 5. FINALE BACKGROUND — the film continues on the universe page      */
/*    The camera keeps flying exactly like the old movements iv → v    */
/*    → vi: on arrival it glides from the nebula frame to the          */
/*    "one light" frame (the same translation the film used), then     */
/*    scrolling the universe page drives the journey down toward the   */
/*    finale frame.                                                    */
/* ----------------------------------------------------------------- */
export function mountFinaleBackground(container) {
  const hasWebGL = detectWebGL();
  if (!hasWebGL) return () => {};

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
  });
  container.appendChild(canvas);

  let scene = null;
  try {
    scene = new SpaceScene(canvas);
  } catch (e) {
    console.error("[webgl] finale background init failed", e);
    canvas.remove();
    return () => {};
  }

  /* The three frames of the continuing journey (from the film's KF):
     [0] nebula peak — where the film handed over (old movement iv)
     [1] the one light (old movement v)
     [2] the finale — lone star + trail arc (old movement vi)        */
  const FRAMES = [
    { px: 6, py: 5, pz: -560, rx: 0.0, ry: 0.05, rz: -0.03, fov: 70, nebula: 1.0, horizon: 0.0, bloom: 1.05, warm: 0.0, wx: 0, wy: 52, wz: -1320, arc: 0, pl: 1.0 },
    { px: 0, py: 0, pz: -980, rx: 0, ry: 0, rz: 0, fov: 56, nebula: 0.22, horizon: 0.0, bloom: 0.7, warm: 1.0, wx: 0, wy: 52, wz: -1320, arc: 0.06, pl: 0.25 },
    { px: 0, py: 0, pz: -1140, rx: 0, ry: 0, rz: 0, fov: 52, nebula: 0.15, horizon: 0.0, bloom: 0.62, warm: 1.0, wx: 0, wy: 52, wz: -1320, arc: 0.18, pl: 0.1 },
  ];
  const FRAME_KEYS = Object.keys(FRAMES[0]);
  const frameAt = (t) => {
    const i = t <= 1 ? 0 : 1;
    const u = smootherstep(clamp(t - i, 0, 1));
    const a = FRAMES[i], b = FRAMES[i + 1];
    const s = {};
    for (const k of FRAME_KEYS) s[k] = lerp(a[k], b[k], u);
    return s;
  };

  /* prog 0 → 1 plays the arrival (old iv → v translation); 1 → 2 is
     driven by how far the visitor scrolls the universe page (old v → vi). */
  let prog = 0;
  let target = 1;

  const readScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    target = 1 + clamp(window.scrollY / max, 0, 1);
  };
  window.addEventListener("scroll", readScroll, { passive: true });
  readScroll();

  let rafId = 0;
  let last = performance.now();
  let hidden = false;
  const onVis = () => {
    hidden = document.hidden;
    if (!hidden) last = performance.now();
  };
  document.addEventListener("visibilitychange", onVis);

  const loop = (now) => {
    rafId = requestAnimationFrame(loop);
    if (hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    /* The same eased glide feel as the film's smootherstep translations. */
    prog += (target - prog) * Math.min(1, dt * 2.2);
    scene.apply(frameAt(prog));
    scene.render(dt);
  };
  rafId = requestAnimationFrame(loop);

  const onResize = () => scene.resize();
  window.addEventListener("resize", onResize);

  /* Gentle pointer parallax, same mapping the film's cursor uses. */
  const onPointer = (e) => {
    scene.pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    scene.pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  return function disposeFinaleBackground() {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", readScroll);
    window.removeEventListener("pointermove", onPointer);
    document.removeEventListener("visibilitychange", onVis);
    scene.dispose();
    canvas.remove();
  };
}
