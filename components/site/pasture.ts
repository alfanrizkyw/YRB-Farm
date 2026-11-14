import type * as THREE_NS from "three";

type Options = { lite: boolean };

const PALETTE = {
  fog: 0xe3dcc9,
  ground: 0x95a67e,
  hillFar: 0x7a8d6b,
  hillNear: 0x657a5b,
  wool: 0xefe6d2,
  skin: 0x322f28,
  horn: 0xa98e68,
  grass: 0x5c7051,
  sun: 0xf1d492,
};

const SHEEP: Array<{ x: number; z: number; s: number; r: number; ram: boolean }> = [
  { x: -1.5, z: -1.2, s: 1.18, r: -0.55, ram: false },
  { x: 0.4, z: -2.1, s: 1.32, r: 2.5, ram: true },
  { x: 1.8, z: -1.15, s: 1.05, r: 3.3, ram: false },
  { x: -0.7, z: -3.4, s: 1.2, r: -0.15, ram: false },
  { x: 1.4, z: -3.9, s: 1.02, r: 0.7, ram: false },
  { x: -2.05, z: -2.85, s: 1.02, r: 2.95, ram: true },
  { x: 0.95, z: -4.9, s: 0.96, r: -0.35, ram: false },
  { x: -2.5, z: -4.4, s: 0.9, r: 0.9, ram: false },
  { x: 2.35, z: -4.5, s: 0.86, r: 2.2, ram: false },
  { x: -3.3, z: -3.6, s: 0.82, r: 1.4, ram: false },
  { x: 2.7, z: -2.7, s: 0.8, r: -2.4, ram: false },
  { x: -0.1, z: -5.6, s: 0.72, r: 0.2, ram: false },
];

function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildPasture(
  THREE: typeof import("three"),
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  opts: Options,
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !opts.lite,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PALETTE.fog, 10.5, 27);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
  camera.position.set(0, 2.55, 9.2);

  const pixelRatio = () => Math.min(window.devicePixelRatio || 1, opts.lite ? 1 : 1.8);
  renderer.setPixelRatio(pixelRatio());

  /* ---------- terrain ---------- */

  const groundGeo = new THREE.PlaneGeometry(26, 17, opts.lite ? 26 : 46, opts.lite ? 18 : 32);
  groundGeo.rotateX(-Math.PI / 2);
  const positions = groundGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    let y = Math.sin(x * 0.58) * 0.065 + Math.cos(z * 0.82) * 0.05;
    y += Math.max(0, -z - 3) * 0.1;
    positions.setY(i, y);
  }
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshStandardMaterial({
    color: PALETTE.ground,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.z = -1.5;
  scene.add(ground);

  const hillMatFar = new THREE.MeshStandardMaterial({
    color: PALETTE.hillFar,
    roughness: 1,
    flatShading: true,
  });
  const hillMatNear = new THREE.MeshStandardMaterial({
    color: PALETTE.hillNear,
    roughness: 1,
    flatShading: true,
  });
  const hillGeo = new THREE.IcosahedronGeometry(1, 1);

  const hills: Array<[number, number, number, number, number, number, number]> = [
    [-4.2, 0.1, -8.4, 3.6, 1.35, 2.2, 0],
    [0.4, 0.0, -9.2, 4.4, 1.6, 2.4, 0],
    [4.3, 0.15, -8.6, 3.2, 1.25, 2.1, 0],
    [-2.1, -0.1, -7.4, 2.8, 1.0, 1.8, 1],
    [2.6, -0.05, -7.6, 2.5, 0.95, 1.7, 1],
  ];
  for (const [x, y, z, sx, sy, sz, near] of hills) {
    const hill = new THREE.Mesh(hillGeo, near ? hillMatNear : hillMatFar);
    hill.position.set(x, y, z);
    hill.scale.set(sx, sy, sz);
    hill.rotation.y = x * 0.3;
    scene.add(hill);
  }

  /* ---------- sun ---------- */

  const sunMat = new THREE.MeshBasicMaterial({ color: PALETTE.sun, fog: false });
  const sun = new THREE.Mesh(new THREE.CircleGeometry(1.05, 40), sunMat);
  sun.position.set(-2.15, 3.0, -9.4);
  scene.add(sun);

  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 128;
  const gctx = glowCanvas.getContext("2d");
  if (gctx) {
    const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(244, 218, 152, 0.55)");
    grad.addColorStop(0.5, "rgba(244, 218, 152, 0.18)");
    grad.addColorStop(1, "rgba(244, 218, 152, 0)");
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 128, 128);
  }
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, fog: false }),
  );
  glow.position.set(-2.15, 3.0, -9.3);
  glow.scale.set(6.5, 6.5, 1);
  scene.add(glow);

  /* ---------- lights ---------- */

  const hemi = new THREE.HemisphereLight(0xf7ecd6, 0x46543d, 1.25);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffe4b8, 1.55);
  dir.position.set(4.5, 7, 5.5);
  scene.add(dir);
  const fill = new THREE.AmbientLight(0xffffff, 0.18);
  scene.add(fill);

  /* ---------- grass ---------- */

  const rand = mulberry(4212);
  const tuftCount = opts.lite ? 44 : 110;
  const tuftGeo = new THREE.ConeGeometry(0.05, 0.3, 4);
  tuftGeo.translate(0, 0.15, 0);
  const tuftMat = new THREE.MeshStandardMaterial({
    color: PALETTE.grass,
    roughness: 1,
    flatShading: true,
  });
  const tufts = new THREE.InstancedMesh(tuftGeo, tuftMat, tuftCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < tuftCount; i++) {
    const x = (rand() - 0.5) * 8.4;
    const z = -1.5 + (rand() - 0.5) * 9;
    const scale = 0.6 + rand() * 1.3;
    dummy.position.set(x, 0.02, z);
    dummy.rotation.set(0, rand() * Math.PI, (rand() - 0.5) * 0.25);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    tufts.setMatrixAt(i, dummy.matrix);
  }
  tufts.instanceMatrix.needsUpdate = true;
  scene.add(tufts);

  /* ---------- sheep ---------- */

  const woolMat = new THREE.MeshStandardMaterial({
    color: PALETTE.wool,
    roughness: 0.96,
    flatShading: true,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: PALETTE.skin,
    roughness: 0.9,
    flatShading: true,
  });
  const hornMat = new THREE.MeshStandardMaterial({
    color: PALETTE.horn,
    roughness: 0.85,
    flatShading: true,
  });

  const bodyGeo = new THREE.IcosahedronGeometry(0.5, 1);
  const headGeo = new THREE.IcosahedronGeometry(0.235, 0);
  const earGeo = new THREE.ConeGeometry(0.06, 0.18, 5);
  const legGeo = new THREE.CylinderGeometry(0.036, 0.045, 0.46, 5);
  const tailGeo = new THREE.IcosahedronGeometry(0.075, 0);
  const hornGeo = new THREE.TorusGeometry(0.15, 0.034, 5, 12, Math.PI * 1.4);

  type SheepRef = { group: THREE_NS.Group; head: THREE_NS.Object3D; phase: number; baseY: number };
  const sheepRefs: SheepRef[] = [];
  const flock = opts.lite ? SHEEP.slice(0, 7) : SHEEP;

  for (const item of flock) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(bodyGeo, woolMat);
    body.scale.set(1.5, 0.98, 1.05);
    body.position.y = 0.78;
    group.add(body);

    const head = new THREE.Mesh(headGeo, skinMat);
    head.scale.set(1.28, 0.98, 1);
    head.position.set(0.72, 0.97, 0);
    group.add(head);

    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(earGeo, skinMat);
      ear.position.set(0.62, 1.06, side * 0.2);
      ear.rotation.set(side * 0.55, 0, -0.9);
      group.add(ear);
    }

    for (const lx of [-0.42, 0.42]) {
      for (const lz of [-0.2, 0.2]) {
        const leg = new THREE.Mesh(legGeo, skinMat);
        leg.position.set(lx, 0.27, lz);
        group.add(leg);
      }
    }

    const tail = new THREE.Mesh(tailGeo, woolMat);
    tail.position.set(-0.76, 0.88, 0);
    group.add(tail);

    if (item.ram) {
      for (const side of [-1, 1]) {
        const horn = new THREE.Mesh(hornGeo, hornMat);
        horn.position.set(0.7, 1.01, side * 0.17);
        horn.rotation.set(Math.PI / 2 + 0.35, side * 0.55, 0.4);
        group.add(horn);
      }
    }

    group.position.set(item.x, 0, item.z);
    group.rotation.y = item.r;
    group.scale.setScalar(item.s);
    scene.add(group);

    sheepRefs.push({
      group,
      head,
      phase: rand() * Math.PI * 2,
      baseY: 0,
    });
  }

  /* ---------- dust ---------- */

  let dust: THREE_NS.Points | null = null;
  let dustSpeeds: Float32Array | null = null;
  if (!opts.lite) {
    const count = 90;
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    dustSpeeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 7;
      arr[i * 3 + 1] = 0.35 + rand() * 2.6;
      arr[i * 3 + 2] = -1.5 + (rand() - 0.5) * 9;
      dustSpeeds[i] = 0.05 + rand() * 0.14;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = spriteCanvas.height = 32;
    const sctx = spriteCanvas.getContext("2d");
    if (sctx) {
      const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255, 248, 228, 0.85)");
      grad.addColorStop(1, "rgba(255, 248, 228, 0)");
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 32, 32);
    }
    const tex = new THREE.CanvasTexture(spriteCanvas);
    const mat = new THREE.PointsMaterial({
      size: 0.09,
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    dust = new THREE.Points(geo, mat);
    scene.add(dust);
  }

  /* ---------- interaction ---------- */

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointerMove = (e: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    pointer.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.ty = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  };
  const onPointerLeave = () => {
    pointer.tx = 0;
    pointer.ty = 0;
  };
  host.addEventListener("pointermove", onPointerMove, { passive: true });
  host.addEventListener("pointerleave", onPointerLeave);

  /* ---------- resize ---------- */

  const resize = () => {
    const rect = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  /* ---------- loop ---------- */

  let raf = 0;
  let running = false;
  let visible = true;
  let t = 0;
  let last = performance.now();
  let frames = 0;
  let sampleStart = last;
  let degraded = false;

  const degrade = () => {
    if (degraded) return;
    degraded = true;
    renderer.setPixelRatio(1);
    if (dust) {
      dust.visible = false;
    }
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    frames += 1;
    if (now - sampleStart > 1200) {
      const fps = (frames * 1000) / (now - sampleStart);
      if (fps < 42 && !opts.lite) degrade();
      frames = 0;
      sampleStart = now;
    }

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    camera.position.x = pointer.x * 0.42 + Math.sin(t * 0.16) * 0.1;
    camera.position.y = 2.55 - pointer.y * 0.16;
    camera.lookAt(0, 0.78, -1.2);

    for (const ref of sheepRefs) {
      ref.group.position.y = Math.sin(t * 0.9 + ref.phase) * 0.016;
      ref.head.rotation.z = Math.sin(t * 0.55 + ref.phase) * 0.06 - 0.05;
      ref.head.rotation.y = Math.sin(t * 0.3 + ref.phase) * 0.12;
    }

    if (dust && dustSpeeds) {
      const attr = dust.geometry.attributes.position as THREE_NS.BufferAttribute;
      for (let i = 0; i < dustSpeeds.length; i++) {
        let y = attr.getY(i) + dustSpeeds[i] * dt;
        if (y > 3.2) y = 0.3;
        attr.setY(i, y);
        attr.setX(i, attr.getX(i) + Math.sin(t * 0.3 + i) * dt * 0.02);
      }
      attr.needsUpdate = true;
    }

    renderer.render(scene, camera);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    sampleStart = last;
    frames = 0;
    raf = requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible && !document.hidden) start();
      else stop();
    },
    { threshold: 0.01 },
  );
  io.observe(host);

  const onVisibility = () => {
    if (document.hidden) stop();
    else if (visible) start();
  };
  document.addEventListener("visibilitychange", onVisibility);

  const dispose = () => {
    stop();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    host.removeEventListener("pointermove", onPointerMove);
    host.removeEventListener("pointerleave", onPointerLeave);

    scene.traverse((obj) => {
      const mesh = obj as THREE_NS.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE_NS.Material | THREE_NS.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    glowTex.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };

  return { start, dispose };
}
