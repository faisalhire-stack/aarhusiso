import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** A self-contained product-like pipe study. No models, textures or requests leave the page. */
export function initPipeScene() {
  const canvas = document.getElementById('pipe-canvas');
  const stage = document.getElementById('pipe-stage');
  if (!canvas || !stage) return () => {};

  const modeOutput = document.getElementById('scene-mode');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controls = [...document.querySelectorAll('[data-material], [data-rotate], [data-reset-view]')];
  const listeners = [];
  const on = (element, type, callback, options) => {
    element.addEventListener(type, callback, options);
    listeners.push(() => element.removeEventListener(type, callback, options));
  };
  let renderer;
  let frame = 0;
  let disposed = false;
  let inView = true;
  let reducedMotion = motionPreference.matches;

  function fallback() {
    stage.dataset.renderer = 'fallback';
    stage.classList.remove('is-ready');
    stage.classList.add('is-fallback');
    canvas.hidden = true;
    if (modeOutput) modeOutput.textContent = 'Materiale & form';
    controls.forEach((button) => { button.disabled = true; });
    cancelAnimationFrame(frame);
  }

  try {
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!context) {
      fallback();
      return () => { disposed = true; listeners.forEach((remove) => remove()); };
    }
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    fallback();
    return () => { disposed = true; listeners.forEach((remove) => remove()); };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.3));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.transmissionResolutionScale = 0.5;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new RoomEnvironment();
  const environment = pmrem.fromScene(studio, 0.04);
  scene.environment = environment.texture;
  studio.dispose();
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xf8f6ff, 0x89958e, 1.15));
  const key = new THREE.DirectionalLight(0xfffcf3, 2.8);
  key.position.set(-3, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd8d1ff, 1.7);
  rim.position.set(4, 1, -4);
  scene.add(rim);
  const greenBounce = new THREE.DirectionalLight(0xd5f8e4, 0.5);
  greenBounce.position.set(-4, -1, 2);
  scene.add(greenBounce);

  // A continuous engineered route: horizontal duct, 90° downward bend, then a front-facing elbow.
  const route = new THREE.CurvePath();
  route.add(new THREE.LineCurve3(new THREE.Vector3(-1.85, 1.5, 0), new THREE.Vector3(-0.65, 1.5, 0)));
  route.add(new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.65, 1.5, 0), new THREE.Vector3(0.013, 1.5, 0),
    new THREE.Vector3(0.55, 0.963, 0), new THREE.Vector3(0.55, 0.3, 0),
  ));
  route.add(new THREE.LineCurve3(new THREE.Vector3(0.55, 0.3, 0), new THREE.Vector3(0.55, -0.65, 0)));
  route.add(new THREE.CubicBezierCurve3(
    new THREE.Vector3(0.55, -0.65, 0), new THREE.Vector3(0.55, -1.175, 0),
    new THREE.Vector3(0.55, -1.6, 0.425), new THREE.Vector3(0.55, -1.6, 0.95),
  ));
  route.add(new THREE.LineCurve3(new THREE.Vector3(0.55, -1.6, 0.95), new THREE.Vector3(0.55, -1.6, 1.52)));

  const assembly = new THREE.Group();
  scene.add(assembly);
  const segments = 96;
  const radialSegments = 48;
  const frames = route.computeFrenetFrames(segments, false);

  function tubeSector(radius, start = 0, length = Math.PI * 2) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const point = new THREE.Vector3();
    const normal = new THREE.Vector3();
    for (let i = 0; i <= segments; i++) {
      route.getPointAt(i / segments, point);
      for (let j = 0; j <= radialSegments; j++) {
        const angle = start + j / radialSegments * length;
        normal.copy(frames.normals[i]).multiplyScalar(Math.cos(angle));
        normal.addScaledVector(frames.binormals[i], Math.sin(angle));
        positions.push(point.x + radius * normal.x, point.y + radius * normal.y, point.z + radius * normal.z);
        normals.push(normal.x, normal.y, normal.z);
        uvs.push(i / segments, j / radialSegments);
        if (i < segments && j < radialSegments) {
          const a = i * (radialSegments + 1) + j;
          const b = (i + 1) * (radialSegments + 1) + j;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    return geometry;
  }

  // Fine anisotropic machining variation, generated locally instead of loading a texture.
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = textureCanvas.height = 256;
  const context = textureCanvas.getContext('2d');
  let brushedTexture;
  if (context) {
    const pixels = context.createImageData(256, 256);
    let seed = 19;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let y = 0; y < 256; y++) {
      const stripe = 188 + random() * 40;
      for (let x = 0; x < 256; x++) {
        const index = (y * 256 + x) * 4;
        const value = stripe + random() * 8;
        pixels.data[index] = pixels.data[index + 1] = pixels.data[index + 2] = value;
        pixels.data[index + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
    brushedTexture = new THREE.CanvasTexture(textureCanvas);
    brushedTexture.wrapS = brushedTexture.wrapT = THREE.RepeatWrapping;
    brushedTexture.repeat.set(4, 3);
  }

  const aluminium = new THREE.MeshPhysicalMaterial({
    color: 0xd5dadb, metalness: 0.96, roughness: 0.29, roughnessMap: brushedTexture,
    clearcoat: 0.32, clearcoatRoughness: 0.24, envMapIntensity: 1.15, side: THREE.DoubleSide,
  });
  const clearShell = new THREE.MeshPhysicalMaterial({
    color: 0xecf5f3, metalness: 0.05, roughness: 0.085,
    transmission: 0.82, thickness: 0.2, ior: 1.42,
    transparent: true, opacity: 0.67, envMapIntensity: 1.6, side: THREE.DoubleSide,
    clearcoat: 1, clearcoatRoughness: 0.05,
  });
  const seamMaterial = new THREE.MeshStandardMaterial({ color: 0x737c7a, metalness: 1, roughness: 0.3 });
  const silverEdge = new THREE.MeshStandardMaterial({ color: 0xe1e4df, metalness: 0.94, roughness: 0.21 });
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x364341, metalness: 0.88, roughness: 0.31, side: THREE.DoubleSide });
  const greenLayer = new THREE.MeshStandardMaterial({ color: 0x12773b, metalness: 0.1, roughness: 0.6, side: THREE.DoubleSide });
  const purpleLayer = new THREE.MeshStandardMaterial({ color: 0x783b95, metalness: 0.1, roughness: 0.6, side: THREE.DoubleSide });
  const orangeLayer = new THREE.MeshStandardMaterial({ color: 0xd47d24, metalness: 0.1, roughness: 0.6, side: THREE.DoubleSide });
  const fullShell = new THREE.Mesh(tubeSector(0.535), aluminium);
  const cutShell = new THREE.Mesh(tubeSector(0.535, Math.PI * 1.35, Math.PI * 1.3), aluminium);
  cutShell.visible = false;
  assembly.add(fullShell, cutShell);
  const innerLayers = [
    new THREE.Mesh(tubeSector(0.498, Math.PI * 1.3, Math.PI * 1.45), greenLayer),
    new THREE.Mesh(tubeSector(0.428, Math.PI * 1.22, Math.PI * 1.62), purpleLayer),
    new THREE.Mesh(tubeSector(0.355, Math.PI * 1.12, Math.PI * 1.82), orangeLayer),
    new THREE.Mesh(tubeSector(0.273), darkSteel),
  ];
  assembly.add(...innerLayers);

  const endpoint = route.getPointAt(1);
  const startpoint = route.getPointAt(0);
  const endTangent = route.getTangentAt(1).normalize();
  const startTangent = route.getTangentAt(0).normalize().negate();
  const zAxis = new THREE.Vector3(0, 0, 1);
  function endRing(inner, outer, material, position, normal) {
    const mesh = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 80), material);
    mesh.position.copy(position);
    mesh.quaternion.setFromUnitVectors(zAxis, normal);
    assembly.add(mesh);
    return mesh;
  }
  const endLayers = [[0.498, 0.535, silverEdge], [0.428, 0.498, greenLayer], [0.355, 0.428, purpleLayer], [0.273, 0.355, orangeLayer], [0.245, 0.273, silverEdge]];
  for (const [inner, outer, material] of endLayers) {
    endRing(inner, outer, material, endpoint, endTangent);
    endRing(inner, outer, material, startpoint, startTangent);
  }
  const throat = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.7, 64, 1, true), darkSteel);
  throat.rotation.x = Math.PI / 2;
  throat.position.copy(endpoint).addScaledVector(endTangent, -0.35);
  assembly.add(throat);
  const darkness = new THREE.Mesh(new THREE.CircleGeometry(0.245, 64), new THREE.MeshBasicMaterial({ color: 0x142521, side: THREE.DoubleSide }));
  darkness.position.copy(endpoint).addScaledVector(endTangent, -0.69);
  assembly.add(darkness);

  // Thin raised bands and small rivets make the otherwise abstract form read as precise metalwork.
  const rivetGeometry = new THREE.SphereGeometry(0.012, 7, 5);
  const collars = new THREE.Group();
  assembly.add(collars);
  for (const t of [0.07, 0.22, 0.34, 0.49, 0.65, 0.79, 0.94]) {
    const centre = route.getPointAt(t);
    const tangent = route.getTangentAt(t).normalize();
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.537, 0.008, 6, 72), silverEdge);
    collar.position.copy(centre);
    collar.quaternion.setFromUnitVectors(zAxis, tangent);
    collars.add(collar);
    const frameIndex = Math.round(t * segments);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      const normal = frames.normals[frameIndex].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[frameIndex], Math.sin(a));
      const rivet = new THREE.Mesh(rivetGeometry, seamMaterial);
      rivet.position.copy(centre).addScaledVector(normal, 0.54);
      collars.add(rivet);
    }
  }
  for (const end of [endpoint, startpoint]) {
    const roll = new THREE.Mesh(new THREE.TorusGeometry(0.535, 0.012, 8, 80), silverEdge);
    roll.position.copy(end);
    roll.quaternion.setFromUnitVectors(zAxis, end === endpoint ? endTangent : startTangent);
    assembly.add(roll);
  }
  assembly.position.y = 0.1;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let dragging = false;
  let pointerId = null;
  let previousX = 0;
  let previousY = 0;
  let dragDistance = 0;
  const baseRotation = new THREE.Vector3(-0.06, -0.36, -0.12);

  canvas.style.touchAction = 'pan-y pinch-zoom';
  canvas.style.cursor = 'grab';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Interaktiv model af isolerede rør. Træk for at dreje, eller brug piletasterne. Home nulstiller visningen.');

  function setMode(mode) {
    const actualMode = ['silver', 'glass', 'cutaway'].includes(mode) ? mode : 'silver';
    fullShell.visible = actualMode !== 'cutaway';
    fullShell.material = actualMode === 'glass' ? clearShell : aluminium;
    cutShell.visible = actualMode === 'cutaway';
    collars.visible = actualMode !== 'glass';
    stage.dataset.mode = actualMode;
    const names = { silver: 'Børstet aluminium', glass: 'Et kig gennem overfladen', cutaway: 'Isoleringens lag' };
    if (modeOutput) modeOutput.textContent = names[actualMode];
    controls.filter((button) => button.dataset.material).forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.material === actualMode)));
    requestRender();
  }
  controls.forEach((button) => {
    if (button.dataset.material) on(button, 'click', () => setMode(button.dataset.material));
    else if (button.hasAttribute('data-reset-view')) on(button, 'click', () => { targetX = targetY = pointerX = pointerY = 0; requestRender(); });
    else if (button.dataset.rotate) on(button, 'click', () => { targetY += button.dataset.rotate === 'left' ? -0.4 : 0.4; requestRender(); });
  });
  on(canvas, 'pointerdown', (event) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    dragging = true;
    pointerId = event.pointerId;
    previousX = event.clientX;
    previousY = event.clientY;
    dragDistance = 0;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
    requestRender();
  });
  on(canvas, 'pointermove', (event) => {
    const bounds = canvas.getBoundingClientRect();
    if (!reducedMotion) {
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    }
    if (dragging && event.pointerId === pointerId) {
      const dx = event.clientX - previousX;
      const dy = event.clientY - previousY;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      if (event.pointerType === 'touch' && dragDistance < 25 && Math.abs(dy) > Math.abs(dx) * 1.4) {
        dragging = false;
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      } else {
        targetY += dx * 0.008;
        targetX = THREE.MathUtils.clamp(targetX + dy * 0.004, -0.5, 0.5);
      }
      previousX = event.clientX;
      previousY = event.clientY;
    }
    requestRender();
  });
  const finishDrag = () => { dragging = false; pointerId = null; canvas.style.cursor = 'grab'; };
  on(canvas, 'pointerup', finishDrag);
  on(canvas, 'pointercancel', finishDrag);
  on(canvas, 'lostpointercapture', finishDrag);
  on(canvas, 'pointerleave', () => { pointerX = pointerY = 0; requestRender(); });
  on(canvas, 'keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') targetY -= 0.2;
    if (event.key === 'ArrowRight') targetY += 0.2;
    if (event.key === 'ArrowUp') targetX = Math.max(-0.5, targetX - 0.1);
    if (event.key === 'ArrowDown') targetX = Math.min(0.5, targetX + 0.1);
    if (event.key === 'Home') targetX = targetY = pointerX = pointerY = 0;
    requestRender();
  });
  on(canvas, 'webglcontextlost', (event) => { event.preventDefault(); fallback(); });

  let lastTime = 0;
  let started = false;
  function render(time = 0) {
    frame = 0;
    if (disposed || !inView || document.hidden || stage.dataset.renderer === 'fallback') return;
    const delta = Math.min((time - lastTime) / 1000 || 1 / 60, 0.06);
    lastTime = time;
    const easing = 1 - Math.exp(-delta * 14);
    const goalX = targetX + (reducedMotion ? 0 : pointerY * 0.045);
    const goalY = targetY + (reducedMotion ? 0 : pointerX * 0.075);
    currentX = reducedMotion ? goalX : THREE.MathUtils.lerp(currentX, goalX, easing);
    currentY = reducedMotion ? goalY : THREE.MathUtils.lerp(currentY, goalY, easing);
    assembly.rotation.set(baseRotation.x + currentX, baseRotation.y + currentY, baseRotation.z);
    renderer.render(scene, camera);
    if (!started) {
      started = true;
      stage.dataset.renderer = 'ready';
      stage.classList.add('is-ready');
      stage.classList.remove('is-fallback');
      canvas.hidden = false;
    }
    const moving = Math.abs(currentX - goalX) + Math.abs(currentY - goalY) > 0.001;
    if (!reducedMotion && moving) frame = requestAnimationFrame(render);
  }
  function requestRender() { if (!disposed && inView && !frame) frame = requestAnimationFrame(render); }
  function resize() {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const distance = height < 500 || camera.aspect < 0.85 ? 1.4 : 1.25;
    camera.position.set(4.2 * distance, 2.25 * distance, 6.1 * distance);
    camera.lookAt(-0.12, -0.2, 0.38);
    camera.updateProjectionMatrix();
    requestRender();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  const visibilityObserver = new IntersectionObserver((entries) => {
    inView = entries[0]?.isIntersecting ?? true;
    if (inView) { lastTime = performance.now(); requestRender(); }
    else { cancelAnimationFrame(frame); frame = 0; }
  }, { rootMargin: '80px' });
  visibilityObserver.observe(stage);
  on(motionPreference, 'change', (event) => { reducedMotion = event.matches; pointerX = pointerY = 0; requestRender(); });
  on(document, 'visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else requestRender();
  });
  setMode('silver');
  resize();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    listeners.forEach((remove) => remove());
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    const geometries = new Set();
    const materials = new Set();
    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => materials.add(material));
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.add(aluminium);
    materials.add(clearShell);
    materials.forEach((material) => material.dispose());
    brushedTexture?.dispose();
    environment.dispose();
    renderer.dispose();
  };
}
