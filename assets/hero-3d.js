const canvas = document.querySelector("#hero3d");

if (canvas) {
  initHeroScene(canvas);
}

async function initHeroScene(canvasElement) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let THREE;

  try {
    THREE = await import("https://unpkg.com/three@0.164.1/build/three.module.js");
  } catch {
    canvasElement.classList.add("is-fallback");
    return;
  }

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    canvasElement.classList.add("is-fallback");
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const group = new THREE.Group();
  const pointer = new THREE.Vector2(0, 0);
  const clock = new THREE.Clock();

  camera.position.set(0, 0.3, 8);
  scene.add(group);
  scene.add(new THREE.AmbientLight(0xffffff, 1.7));

  const keyLight = new THREE.DirectionalLight(0xe9c176, 2.1);
  keyLight.position.set(4, 6, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xb5c8df, 1.2);
  fillLight.position.set(-5, -2, 4);
  scene.add(fillLight);

  const panelGeometry = new THREE.BoxGeometry(1.05, 0.48, 0.035);
  const nodeGeometry = new THREE.BoxGeometry(0.075, 0.075, 0.075);
  const panelMaterials = [
    new THREE.MeshStandardMaterial({ color: 0xfcf9f8, roughness: 0.62, metalness: 0.02 }),
    new THREE.MeshStandardMaterial({ color: 0xe9c176, roughness: 0.7, metalness: 0.12 }),
    new THREE.MeshStandardMaterial({ color: 0xb5c8df, roughness: 0.68, metalness: 0.08 }),
    new THREE.MeshStandardMaterial({ color: 0xdce6df, roughness: 0.68, metalness: 0.05 }),
  ];
  const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.52, metalness: 0.08 });
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xe9c176, transparent: true, opacity: 0.34 });
  const points = [];

  for (let index = 0; index < 34; index += 1) {
    const angle = index * 0.74;
    const radius = 1.65 + (index % 7) * 0.34;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle * 0.83) * 1.55;
    const z = -2.8 + (index % 9) * 0.55;
    const material = panelMaterials[index % panelMaterials.length];
    const panel = new THREE.Mesh(panelGeometry, material);

    panel.position.set(x, y, z);
    panel.rotation.set(0.2 * Math.sin(index), angle * 0.12, 0.22 * Math.cos(index * 0.7));
    panel.scale.setScalar(0.58 + (index % 4) * 0.08);
    group.add(panel);

    if (index % 2 === 0) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(panel.position);
      node.position.x += 0.72;
      node.position.y += 0.2;
      group.add(node);
      points.push(node.position.clone());
    }
  }

  for (let index = 1; index < points.length; index += 1) {
    const geometry = new THREE.BufferGeometry().setFromPoints([points[index - 1], points[index]]);
    group.add(new THREE.Line(geometry, lineMaterial));
  }

  const resize = () => {
    const rect = canvasElement.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const onPointerMove = (event) => {
    const rect = canvasElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  const render = () => {
    const elapsed = clock.getElapsedTime();
    group.rotation.y = elapsed * 0.055 + pointer.x * 0.12;
    group.rotation.x = -0.16 + pointer.y * 0.06;
    group.position.x = pointer.x * 0.18;
    group.position.y = -pointer.y * 0.12;
    renderer.render(scene, camera);
  };

  const animate = () => {
    render();
    if (!prefersReducedMotion.matches) {
      window.requestAnimationFrame(animate);
    }
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  resize();
  animate();
}
