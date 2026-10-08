// src/components/portfolio/StarField.tsx
import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const DEFAULT_STAR_COUNT = 200;
const STAR_SIZE = 2.0;
const REPEL_RADIUS = 180;
const MAX_OFFSET = 90;
const PARALLAX_DEPTH = 250;
const BLOOM_STRENGTH = 0.25;
const BLOOM_RADIUS = 0.18;
const BLOOM_THRESHOLD = 0.08;

const DRIFT_SPEED = 0.12;
const DRIFT_CHANGE_INTERVAL = 80;
const SPRING_STIFFNESS = 0.03;
const SPRING_DAMPING = 0.92;
const UNDERWATER_AMPLITUDE = 1.5;
const UNDERWATER_SPEED = 0.003;

const TRAIL_MAX_STARS = 40;
const TRAIL_SIZE = 2.5;
const TRAIL_FADE_SPEED = 0.003;
const TRAIL_INTERVAL = 1;

const BURST_COUNT = 30;
const BURST_SPEED = 4;

const starColors = [
  new THREE.Color(0xffffff),
  new THREE.Color(0xfff5eb),
  new THREE.Color(0xebebff),
  new THREE.Color(0xffebf5),
  new THREE.Color(0xd7ebff),
  new THREE.Color(0xfff0dc),
  new THREE.Color(0xffdd44),
  new THREE.Color(0xffcc33),
  new THREE.Color(0xffee66),
  new THREE.Color(0xcc88ff),
  new THREE.Color(0xaa66ff),
  new THREE.Color(0xbb77ee),
  new THREE.Color(0xff66aa),
  new THREE.Color(0xff88bb),
  new THREE.Color(0xff77aa),
  new THREE.Color(0xffaa44),
  new THREE.Color(0xffbb55),
];

type TrailStar = {
  mesh: THREE.Sprite;
  life: number;
  maxLife: number;
  floatPhase: number;
  originalScale: number;
  exactX: number;
  exactY: number;
};

type BurstStar = {
  mesh: THREE.Sprite;
  life: number;
  maxLife: number;
  velocityX: number;
  velocityY: number;
  isPermanent: boolean;
  targetX: number;
  targetY: number;
  floatPhase: number;
  orbitPhase: number;
  orbitRadius: number;
  driftX: number;
  driftY: number;
};

type BackgroundStarData = {
  positions: Float32Array;
  originalPositions: Float32Array;
  offsets: Float32Array;
  velocities: Float32Array;
  sizes: Float32Array;
  floatPhases: Float32Array;
  floatSpeeds: Float32Array;
  floatAmplitudes: Float32Array;
  colors: Float32Array;
  driftVX: Float32Array;
  driftVY: Float32Array;
  driftCounter: Float32Array;
};

export type StarFieldProps = { count?: number };

export function StarField({ count = DEFAULT_STAR_COUNT }: StarFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const starMeshRef = useRef<THREE.Points | null>(null);

  const trailStarsRef = useRef<TrailStar[]>([]);
  const burstStarsRef = useRef<BurstStar[]>([]);
  const starDataRef = useRef<BackgroundStarData | null>(null);

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const rafId = useRef<number | null>(null);
  const timeRef = useRef(0);
  const trailCounter = useRef(0);

  const spriteTexturesRef = useRef<Map<string, THREE.CanvasTexture>>(new Map());

  const starFieldTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 64, 64);

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.15, "rgba(255,255,255,0.7)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.3)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(30, 0, 4, 64);
    ctx.fillRect(0, 30, 64, 4);

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(64, 64);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.lineTo(0, 64);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }, []);

  const getSpriteTexture = (color: THREE.Color, opacity: number) => {
    const key = `${color.getHexString()}_${opacity.toFixed(2)}`;
    const cache = spriteTexturesRef.current;
    const existing = cache.get(key);
    if (existing) return existing;

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 32, 32);

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(
      0,
      `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${opacity})`
    );
    gradient.addColorStop(
      0.3,
      `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${opacity * 0.5})`
    );
    gradient.addColorStop(
      1,
      `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0)`
    );
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.12})`;
    ctx.fillRect(14, 0, 3, 32);
    ctx.fillRect(0, 14, 32, 3);

    const texture = new THREE.CanvasTexture(canvas);
    cache.set(key, texture);
    return texture;
  };

  const createSprite = (color: THREE.Color, size: number, opacity = 1) => {
    const material = new THREE.SpriteMaterial({
      map: getSpriteTexture(color, opacity),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size, size, 1);
    return sprite;
  };

  const starData = useMemo(() => {
    const n = count;
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const floatPhases = new Float32Array(n);
    const floatSpeeds = new Float32Array(n);
    const floatAmplitudes = new Float32Array(n);
    const driftVX = new Float32Array(n);
    const driftVY = new Float32Array(n);
    const driftCounter = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      const radius = Math.random() * 550 + 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z =
        radius * Math.cos(phi) * 0.3 +
        (Math.random() - 0.5) * PARALLAX_DEPTH;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const color = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 1.2 + 0.4;
      floatPhases[i] = Math.random() * Math.PI * 2;
      floatSpeeds[i] = 0.5 + Math.random() * 1.5;
      floatAmplitudes[i] = 0.5 + Math.random() * 1.0;

      const angle = Math.random() * Math.PI * 2;
      const speed = DRIFT_SPEED * (0.3 + Math.random() * 0.7);
      driftVX[i] = Math.cos(angle) * speed;
      driftVY[i] = Math.sin(angle) * speed;
      driftCounter[i] = Math.random() * DRIFT_CHANGE_INTERVAL;
    }

    return {
      positions,
      colors,
      sizes,
      floatPhases,
      floatSpeeds,
      floatAmplitudes,
      driftVX,
      driftVY,
      driftCounter,
    };
  }, [count]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      2000
    );
    camera.position.z = 400;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      BLOOM_STRENGTH,
      BLOOM_RADIUS,
      BLOOM_THRESHOLD
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    composerRef.current = composer;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starData.positions);
    const colors = new Float32Array(starData.colors);
    const sizes = new Float32Array(starData.sizes);

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    starDataRef.current = {
      positions,
      originalPositions: new Float32Array(positions),
      offsets: new Float32Array(positions.length),
      velocities: new Float32Array(positions.length),
      sizes,
      floatPhases: new Float32Array(starData.floatPhases),
      floatSpeeds: new Float32Array(starData.floatSpeeds),
      floatAmplitudes: new Float32Array(starData.floatAmplitudes),
      colors,
      driftVX: new Float32Array(starData.driftVX),
      driftVY: new Float32Array(starData.driftVY),
      driftCounter: new Float32Array(starData.driftCounter),
    };

    const material = new THREE.PointsMaterial({
      size: STAR_SIZE,
      map: starFieldTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      sizeAttenuation: true,
    });

    const starMesh = new THREE.Points(geometry, material);
    scene.add(starMesh);
    starMeshRef.current = starMesh;

    const handleResize = () => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      composer.dispose();
      geometry.dispose();
      material.dispose();
      starFieldTexture.dispose();
      spriteTexturesRef.current.forEach((tex) => tex.dispose());
      spriteTexturesRef.current.clear();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [starData, starFieldTexture]);

  // Window-level listeners so the container never blocks page pointer events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;

      trailCounter.current += 1;
      if (trailCounter.current % TRAIL_INTERVAL !== 0 || !sceneRef.current)
        return;

      const color = starColors[Math.floor(Math.random() * starColors.length)];
      const trailSize = Math.random() * TRAIL_SIZE + 0.5;
      const sprite = createSprite(color, trailSize, 0.9);

      const fov = (45 * Math.PI) / 180;
      const visibleHeight = 2 * 400 * Math.tan(fov / 2);
      const visibleWidth =
        visibleHeight * (rect.width / Math.max(rect.height, 1));
      const posX = (x * visibleWidth) / 2;
      const posY = (y * visibleHeight) / 2;
      sprite.position.set(posX, posY, 0);
      sceneRef.current.add(sprite);

      trailStarsRef.current.push({
        mesh: sprite,
        life: 1,
        maxLife: 2 + Math.random() * 1,
        floatPhase: Math.random() * Math.PI * 2,
        originalScale: trailSize,
        exactX: posX,
        exactY: posY,
      });

      if (trailStarsRef.current.length > TRAIL_MAX_STARS) {
        const oldest = trailStarsRef.current.shift();
        if (oldest && sceneRef.current) {
          sceneRef.current.remove(oldest.mesh);
          oldest.mesh.material.dispose();
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    const handleClick = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const fov = (45 * Math.PI) / 180;
      const visibleHeight = 2 * 400 * Math.tan(fov / 2);
      const visibleWidth =
        visibleHeight * (rect.width / Math.max(rect.height, 1));
      const posX = (x * visibleWidth) / 2;
      const posY = (y * visibleHeight) / 2;

      for (let i = 0; i < BURST_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * BURST_SPEED + 1;
        const color =
          starColors[Math.floor(Math.random() * starColors.length)];
        const size = Math.random() * 1.5 + 0.5;
        const sprite = createSprite(color, size, 1);

        const burstX = posX + (Math.random() - 0.5) * 10;
        const burstY = posY + (Math.random() - 0.5) * 10;
        sprite.position.set(burstX, burstY, 0);
        sceneRef.current?.add(sprite);

        burstStarsRef.current.push({
          mesh: sprite,
          life: 1,
          maxLife: 0.6 + Math.random() * 0.4,
          velocityX: Math.cos(angle) * speed * (0.5 + Math.random() * 0.5),
          velocityY: Math.sin(angle) * speed * (0.5 + Math.random() * 0.5),
          isPermanent: false,
          targetX: 0,
          targetY: 0,
          floatPhase: Math.random() * Math.PI * 2,
          orbitPhase: Math.random() * Math.PI * 2,
          orbitRadius: Math.random() * 4 + 1,
          driftX: (Math.random() - 0.5) * DRIFT_SPEED * 0.5,
          driftY: (Math.random() - 0.5) * DRIFT_SPEED * 0.5,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animate = () => {
      timeRef.current += 0.01;
      mouseRef.current.x +=
        (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y +=
        (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const camera = cameraRef.current;
      const starMesh = starMeshRef.current;
      const composer = composerRef.current;
      const data = starDataRef.current;
      const scene = sceneRef.current;

      if (camera && starMesh && data) {
        camera.position.x +=
          (mouseRef.current.x * 30 - camera.position.x) * 0.03;
        camera.position.y +=
          (mouseRef.current.y * 20 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);

        starMesh.rotation.x +=
          (mouseRef.current.y * 0.012 - starMesh.rotation.x) * 0.02;
        starMesh.rotation.y +=
          (mouseRef.current.x * 0.012 - starMesh.rotation.y) * 0.02;

        const {
          positions,
          originalPositions,
          offsets,
          velocities,
          floatPhases,
          floatSpeeds,
          floatAmplitudes,
          driftVX,
          driftVY,
          driftCounter,
        } = data;

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const fov = (45 * Math.PI) / 180;
          const visibleHeight = 2 * 400 * Math.tan(fov / 2);
          const visibleWidth =
            visibleHeight * (rect.width / Math.max(rect.height, 1));
          const mouseX = (mouseRef.current.x * visibleWidth) / 2;
          const mouseY = (mouseRef.current.y * visibleHeight) / 2;

          for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;

            driftCounter[i] += 1;
            if (driftCounter[i] > DRIFT_CHANGE_INTERVAL + Math.random() * 60) {
              const angle = Math.random() * Math.PI * 2;
              const speed = DRIFT_SPEED * (0.3 + Math.random() * 0.7);
              driftVX[i] = Math.cos(angle) * speed;
              driftVY[i] = Math.sin(angle) * speed;
              driftCounter[i] = 0;
            }

            const wave1 = Math.sin(
              timeRef.current * UNDERWATER_SPEED * floatSpeeds[i] +
                floatPhases[i]
            );
            const wave2 = Math.cos(
              timeRef.current * UNDERWATER_SPEED * floatSpeeds[i] * 0.7 +
                floatPhases[i] * 1.3
            );
            const floatX =
              wave1 * UNDERWATER_AMPLITUDE * floatAmplitudes[i] * 0.3;
            const floatY =
              wave2 * UNDERWATER_AMPLITUDE * floatAmplitudes[i] * 0.25;

            const dx = positions[i3] - mouseX;
            const dy = positions[i3 + 1] - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let targetOffsetX = 0;
            let targetOffsetY = 0;

            if (dist < REPEL_RADIUS && dist > 0.001) {
              const strength = (1 - dist / REPEL_RADIUS) * MAX_OFFSET;
              const waveFactor =
                1 + Math.sin(dist / 30 + timeRef.current * 0.5) * 0.25;
              targetOffsetX = (dx / dist) * strength * waveFactor;
              targetOffsetY = (dy / dist) * strength * waveFactor;
            }

            const combinedTargetX = targetOffsetX + floatX + driftVX[i];
            const combinedTargetY = targetOffsetY + floatY + driftVY[i];

            velocities[i3] +=
              (combinedTargetX - offsets[i3]) * SPRING_STIFFNESS;
            velocities[i3 + 1] +=
              (combinedTargetY - offsets[i3 + 1]) * SPRING_STIFFNESS;

            velocities[i3] *= SPRING_DAMPING;
            velocities[i3 + 1] *= SPRING_DAMPING;
            velocities[i3] *= 0.998;
            velocities[i3 + 1] *= 0.998;

            offsets[i3] += velocities[i3];
            offsets[i3 + 1] += velocities[i3 + 1];

            originalPositions[i3] += driftVX[i] * 0.06;
            originalPositions[i3 + 1] += driftVY[i] * 0.06;

            positions[i3] = originalPositions[i3] + offsets[i3];
            positions[i3 + 1] = originalPositions[i3 + 1] + offsets[i3 + 1];
          }

          starMesh.geometry.attributes.position.needsUpdate = true;
        }

        const material = starMesh.material as THREE.PointsMaterial;
        const twinkle = Math.sin(timeRef.current * 0.5) * 0.06 + 0.94;
        material.size = STAR_SIZE * twinkle;
        material.opacity = 0.85 + Math.sin(timeRef.current * 0.3) * 0.08;

        const { sizes } = data;
        const sizeAttr = starMesh.geometry.attributes.size;
        if (sizeAttr) {
          for (let i = 0; i < sizes.length; i++) {
            const twinkleFactor =
              Math.sin(timeRef.current * (0.5 + i * 0.001) + i) * 0.2 + 0.8;
            sizeAttr.array[i] = sizes[i] * twinkleFactor;
          }
          sizeAttr.needsUpdate = true;
        }
      }

      for (let i = trailStarsRef.current.length - 1; i >= 0; i--) {
        const trail = trailStarsRef.current[i];
        trail.life -= TRAIL_FADE_SPEED;
        trail.mesh.material.opacity = Math.max(0, trail.life * 0.9);

        const floatX =
          Math.sin(timeRef.current * 0.001 + trail.floatPhase) * 0.2;
        const floatY =
          Math.cos(timeRef.current * 0.001 * 0.7 + trail.floatPhase * 1.3) *
          0.15;
        trail.mesh.position.x = trail.exactX + floatX;
        trail.mesh.position.y = trail.exactY + floatY;

        const scalePulse = 1 + Math.sin(timeRef.current * 0.5 + i) * 0.08;
        const currentScale =
          trail.originalScale * (0.5 + trail.life * 0.5) * scalePulse;
        trail.mesh.scale.set(currentScale, currentScale, 1);

        if (trail.life <= 0) {
          if (scene) scene.remove(trail.mesh);
          trail.mesh.material.dispose();
          trailStarsRef.current.splice(i, 1);
        }
      }

      for (let i = burstStarsRef.current.length - 1; i >= 0; i--) {
        const burst = burstStarsRef.current[i];

        if (!burst.isPermanent) {
          burst.mesh.position.x += burst.velocityX;
          burst.mesh.position.y += burst.velocityY;
          burst.velocityX *= 0.98;
          burst.velocityY *= 0.98;
          burst.life -= 0.012;
          burst.mesh.material.opacity = Math.max(0, burst.life);

          if (burst.life <= 0) {
            burst.isPermanent = true;
            burst.mesh.material.opacity = 0.5 + Math.random() * 0.4;
            burst.targetX = burst.mesh.position.x;
            burst.targetY = burst.mesh.position.y;
            const scale = burst.mesh.scale.x * 0.5;
            burst.mesh.scale.set(scale, scale, 1);
          }
        } else {
          burst.floatPhase += 0.01;
          burst.orbitPhase += 0.005;

          const orbitX = Math.cos(burst.orbitPhase) * burst.orbitRadius;
          const orbitY =
            Math.sin(burst.orbitPhase * 0.7) * burst.orbitRadius * 0.6;

          const floatX =
            Math.sin(
              timeRef.current * UNDERWATER_SPEED * 0.8 + burst.floatPhase
            ) *
            UNDERWATER_AMPLITUDE *
            0.3;
          const floatY =
            Math.cos(
              timeRef.current * UNDERWATER_SPEED * 0.6 +
                burst.floatPhase * 1.3
            ) *
            UNDERWATER_AMPLITUDE *
            0.25;

          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const fov = (45 * Math.PI) / 180;
            const visibleHeight = 2 * 400 * Math.tan(fov / 2);
            const visibleWidth =
              visibleHeight * (rect.width / Math.max(rect.height, 1));
            const mouseX = (mouseRef.current.x * visibleWidth) / 2;
            const mouseY = (mouseRef.current.y * visibleHeight) / 2;

            const dx = burst.targetX - mouseX;
            const dy = burst.targetY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let offsetX = 0;
            let offsetY = 0;
            if (dist < REPEL_RADIUS && dist > 0.001) {
              const strength = (1 - dist / REPEL_RADIUS) * MAX_OFFSET * 0.5;
              offsetX = (dx / dist) * strength;
              offsetY = (dy / dist) * strength;
            }

            const targetX =
              burst.targetX + offsetX + floatX + orbitX + burst.driftX;
            const targetY =
              burst.targetY + offsetY + floatY + orbitY + burst.driftY;
            burst.mesh.position.x +=
              (targetX - burst.mesh.position.x) * 0.06;
            burst.mesh.position.y +=
              (targetY - burst.mesh.position.y) * 0.06;

            burst.targetX += burst.driftX * 0.06;
            burst.targetY += burst.driftY * 0.06;
          }

          const twinkle = Math.sin(timeRef.current * 0.5 + i) * 0.2 + 0.8;
          const baseScale = burst.mesh.scale.x / twinkle;
          burst.mesh.scale.set(baseScale * twinkle, baseScale * twinkle, 1);
        }
      }

      composer?.render();
      rafId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "none", background: "transparent" }}
      aria-hidden="true"
    />
  );
}