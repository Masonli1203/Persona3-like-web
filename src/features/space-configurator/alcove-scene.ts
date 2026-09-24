import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildAlcove, FINISHES, type AlcoveConfig, type Part } from './alcove-config';
import { createAlcoveMaterials } from './alcove-materials';

export type View = 'perspective' | 'front' | 'plan';
export type SceneController = {
  update: (config: AlcoveConfig) => void;
  view: (view: View) => void;
  rotate: (direction: number) => void;
  zoom: (direction: number) => void;
  dispose: () => void;
};

/** Imported only when the configurator is visible. One renderer; no animation loop. */
export function createAlcoveScene(
  host: HTMLElement,
  initial: AlcoveConfig,
  onError: () => void,
): SceneController {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute(
    'aria-label',
    'Interactive Alcove model. Drag horizontally to orbit, or use the view controls below.',
  );
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 80);
  const ambient = new THREE.HemisphereLight('#f7f3eb', '#8f958b', 2.5);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight('#fff3dd', 3.6);
  sun.position.set(-3, 7, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 18 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#e4edf3', 1.6);
  fill.position.set(4, 3, -4);
  scene.add(fill);
  const lamp = new THREE.PointLight('#ffcf83', 0, 6, 2);
  scene.add(lamp);
  const heaterGlow = new THREE.PointLight('#ff8b4a', 0, 2.5, 2);
  scene.add(heaterGlow);

  const geometries = {
    box: new THREE.BoxGeometry(1, 1, 1),
    softBox: new RoundedBoxGeometry(1, 1, 1, 2, 0.12),
    cylinder: new THREE.CylinderGeometry(0.5, 0.44, 1, 20),
    sphere: new THREE.SphereGeometry(0.5, 12, 8),
    pot: new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.31, -0.5),
        new THREE.Vector2(0.38, -0.48),
        new THREE.Vector2(0.46, -0.25),
        new THREE.Vector2(0.49, 0.35),
        new THREE.Vector2(0.48, 0.5),
        new THREE.Vector2(0.43, 0.5),
        new THREE.Vector2(0.42, 0.39),
        new THREE.Vector2(0.35, -0.37),
        new THREE.Vector2(0, -0.38),
      ],
      24,
    ),
    torus: new THREE.TorusGeometry(0.38, 0.12, 6, 16),
  };
  const surfaces = createAlcoveMaterials(initial.finish, renderer.capabilities.getMaxAnisotropy());
  const { materials } = surfaces;

  const pools = new Map<string, THREE.InstancedMesh>();
  const matrix = new THREE.Object3D();
  const groundGeometry = new THREE.PlaneGeometry(200, 200);
  const groundMaterial = new THREE.ShadowMaterial({ color: '#485147', opacity: 0.2 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.005;
  ground.receiveShadow = true;
  scene.add(ground);

  let config = initial;
  let yaw = 0.66,
    pitch = 0.32,
    zoom = 1;
  let frame = 0,
    disposed = false,
    visible = true,
    renderCount = 0;
  let lastWidth = 0,
    lastHeight = 0;
  const updateCamera = () => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    if (width !== lastWidth || height !== lastHeight) {
      renderer.setSize(width, height, false);
      lastWidth = width;
      lastHeight = height;
    }
    camera.aspect = width / height;
    const radius = Math.hypot(config.width + 0.25, config.depth + 0.25, config.height) / 2;
    const verticalFov = THREE.MathUtils.degToRad(camera.fov);
    const effectiveFov = Math.min(
      verticalFov,
      2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect),
    );
    const distance = (radius / Math.sin(effectiveFov / 2)) * 0.91 * zoom;
    const target = new THREE.Vector3(0, config.height * 0.46, 0);
    camera.position.set(
      Math.sin(yaw) * Math.cos(pitch) * distance,
      target.y + Math.sin(pitch) * distance,
      Math.cos(yaw) * Math.cos(pitch) * distance,
    );
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  };
  const render = () => {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    updateCamera();
    renderer.render(scene, camera);
    host.dataset.renderCount = String(++renderCount);
    host.dataset.drawCalls = String(renderer.info.render.calls);
    host.dataset.triangles = String(renderer.info.render.triangles);
  };
  const invalidate = () => {
    if (!disposed && !frame && visible && !document.hidden) frame = requestAnimationFrame(render);
  };

  const update = (next: AlcoveConfig) => {
    config = next;
    const parts = buildAlcove(next);
    const buckets = new Map<string, Part[]>();
    for (const part of parts) {
      const key = `${part.shape}:${part.material}`;
      const bucket = buckets.get(key) ?? [];
      bucket.push(part);
      buckets.set(key, bucket);
    }
    pools.forEach((pool) => {
      pool.count = 0;
      pool.visible = false;
    });
    buckets.forEach((bucket, key) => {
      const first = bucket[0];
      let pool = pools.get(key);
      if (!pool) {
        pool = new THREE.InstancedMesh(geometries[first.shape], materials[first.material], 128);
        pool.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        pool.castShadow = first.material !== 'light' && first.material !== 'heat';
        pool.receiveShadow = true;
        scene.add(pool);
        pools.set(key, pool);
      }
      pool.visible = true;
      pool.count = bucket.length;
      bucket.forEach((part, i) => {
        matrix.position.set(...part.position);
        matrix.scale.set(...part.size);
        matrix.rotation.set(...(part.rotation ?? [0, 0, 0]));
        matrix.updateMatrix();
        pool!.setMatrixAt(i, matrix.matrix);
      });
      pool.instanceMatrix.needsUpdate = true;
      pool.computeBoundingSphere();
    });
    materials.frame.color.set(FINISHES[next.finish].color);
    lamp.position.set(0, next.height - 0.45, next.depth / 2 - 0.25);
    lamp.intensity = next.light ? 28 : 0;
    ambient.intensity = next.light ? 1.3 : 2.5;
    sun.intensity = next.light ? 1.1 : 3.6;
    fill.intensity = next.light ? 0.6 : 1.6;
    heaterGlow.position.set(next.width / 2 - 0.4, next.height - 0.65, 0);
    heaterGlow.intensity = next.heater ? 3 : 0;
    renderer.shadowMap.needsUpdate = true;
    host.dataset.partCount = String(parts.length);
    invalidate();
  };

  let drag: { x: number; y: number; id: number; touch: boolean } | null = null;
  const down = (event: PointerEvent) => {
    if (event.button !== 0) return;
    drag = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
      touch: event.pointerType === 'touch',
    };
    canvas.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return;
    yaw -= (event.clientX - drag.x) * 0.007;
    if (!drag.touch)
      pitch = THREE.MathUtils.clamp(pitch + (event.clientY - drag.y) * 0.005, 0.12, 1.5);
    drag.x = event.clientX;
    drag.y = event.clientY;
    invalidate();
  };
  const up = () => {
    drag = null;
  };
  const keydown = (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-', '='].includes(event.key))
      return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') yaw -= 0.15;
    if (event.key === 'ArrowRight') yaw += 0.15;
    if (event.key === 'ArrowUp') pitch = Math.min(1.5, pitch + 0.12);
    if (event.key === 'ArrowDown') pitch = Math.max(0.12, pitch - 0.12);
    if (event.key === '+' || event.key === '=') zoom = Math.max(0.7, zoom - 0.1);
    if (event.key === '-') zoom = Math.min(1.5, zoom + 0.1);
    invalidate();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    onError();
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', keydown);
  canvas.addEventListener('webglcontextlost', contextLost);
  const resizeObserver = new ResizeObserver(invalidate);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) invalidate();
  });
  intersectionObserver.observe(host);
  document.addEventListener('visibilitychange', invalidate);
  update(initial);

  return {
    update,
    view: (view) => {
      yaw = view === 'perspective' ? 0.66 : 0;
      pitch = view === 'plan' ? Math.PI / 2 - 0.001 : view === 'front' ? 0.02 : 0.32;
      zoom = 1;
      invalidate();
    },
    rotate: (direction) => {
      yaw += direction * 0.3;
      invalidate();
    },
    zoom: (direction) => {
      zoom = THREE.MathUtils.clamp(zoom + direction * 0.1, 0.7, 1.5);
      invalidate();
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', invalidate);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('keydown', keydown);
      canvas.removeEventListener('webglcontextlost', contextLost);
      pools.forEach((pool) => pool.dispose());
      Object.values(geometries).forEach((geometry) => geometry.dispose());
      surfaces.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      sun.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
