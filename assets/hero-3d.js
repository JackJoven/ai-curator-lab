const canvas = document.querySelector("#hero3d");

if (canvas) {
  initMatrixWave(canvas);
}

function initMatrixWave(canvasElement) {
  const context = canvasElement.getContext("2d");

  if (!context) {
    canvasElement.classList.add("is-fallback");
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = {
    x: 0,
    y: 0,
    canvasX: 0,
    canvasY: 0,
    lastClientX: 0,
    lastClientY: 0,
    lastTime: 0,
    velocity: 0,
    targetVelocity: 0,
    active: false,
  };
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let time = 0;
  let frameId = 0;
  let lastFrameTime = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const maxRenderPixels = 900000;

  const waveColor = (phase, depth, alpha, boost = 0, energy = 0) => {
    const coolHue = 172 + Math.sin(phase + time * 0.72) * 24;
    const warmHue = 42 + Math.sin(phase * 0.6 - time * 0.5) * 10;
    const coralHue = 13 + Math.sin(phase * 0.9 + time * 0.36) * 8;
    const accent = Math.sin(phase * 1.4 - time * 0.9);
    const hue = accent > 0.76 ? warmHue : accent < -0.82 ? coralHue : coolHue;
    const saturation = 76 + depth * 10 + boost * 18 + energy * 14;
    const lightness = 48 + depth * 18 + boost * 8 + energy * 24;

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  };

  const resize = () => {
    const rect = canvasElement.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1);

    if (width * height * pixelRatio * pixelRatio > maxRenderPixels) {
      pixelRatio = Math.sqrt(maxRenderPixels / (width * height));
    }

    canvasElement.width = Math.floor(width * pixelRatio);
    canvasElement.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (!pointer.active) {
      pointer.canvasX = width * 0.5;
      pointer.canvasY = height * 0.58;
    }
  };

  const drawLine = (start, end, alpha, phase) => {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.lineWidth = 0.7 + start.depth * 0.5 + start.boost * 0.45 + start.energy * 0.45;
    context.strokeStyle = waveColor(phase, start.depth, alpha, start.boost, start.energy);
    context.stroke();
  };

  const draw = () => {
    const isSmall = width < 760;
    const columns = clamp(Math.round(width / (isSmall ? 24 : 32)) + 18, isSmall ? 26 : 34, isSmall ? 34 : 50);
    const rows = isSmall ? 16 : 22;
    const horizon = height * (isSmall ? 0.28 : 0.24);
    const floorHeight = height * 0.9;
    const waveStrength = isSmall ? 34 : 54;
    const points = [];

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#142638";
    context.fillRect(0, 0, width, height);

    for (let row = 0; row < rows; row += 1) {
      const rowPoints = [];
      const depth = row / (rows - 1);
      const screenY = horizon + Math.pow(depth, 1.68) * floorHeight;
      const span = width * (1.08 + depth * 0.4);
      const rowDrift = Math.sin(depth * Math.PI + time * 0.58) * (8 + depth * 18);

      for (let column = 0; column < columns; column += 1) {
        const progress = column / (columns - 1);
        const normalX = progress * 2 - 1;
        const baseX = width * 0.5 + normalX * span * 0.5 + rowDrift;
        const pointerDistance = Math.hypot(
          (baseX - pointer.canvasX) / (width * (isSmall ? 0.24 : 0.2)),
          (screenY - pointer.canvasY) / (height * 0.24),
        );
        const pointerInfluence = pointer.active ? Math.exp(-pointerDistance * pointerDistance) : 0;
        const velocityBoost = pointer.velocity * pointerInfluence * 0.16;
        const localTime = time + velocityBoost * 1.1;
        const distance = Math.hypot(normalX * 2.4, row - rows * 0.45);
        const transverse = Math.sin(normalX * 5.4 + localTime * 1.62);
        const longitudinal = Math.sin(row * 0.82 + normalX * 1.7 - localTime * 1.18);
        const cross = Math.cos(row * 0.62 - localTime * 1.05 + normalX * 1.1);
        const pulse = Math.sin(distance * 1.18 - localTime * 1.45);
        const wake = Math.sin(pointerDistance * 7.2 - localTime * 4.4) * velocityBoost * waveStrength * 0.32;
        const lift = (transverse * 0.68 + cross * 0.42 + pulse * 0.28) * waveStrength + wake;
        const longitudinalShift = longitudinal * (4 + depth * 20) + Math.sin(normalX * 3.2 - localTime * 0.86) * depth * 7;
        const crestEnergy = clamp((lift / (waveStrength * 1.38) + 1) * 0.5, 0, 1);
        const screenX = baseX + longitudinalShift + pointer.x * 6 * depth * pointer.velocity;
        const projectedY = screenY - lift * (0.22 + depth * 0.64) - pointer.y * 4 * depth * pointer.velocity;

        rowPoints.push({
          x: screenX,
          y: projectedY,
          depth,
          boost: velocityBoost,
          energy: crestEnergy,
        });
      }

      points.push(rowPoints);
    }

    context.save();
    context.globalCompositeOperation = "lighter";

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const point = points[row][column];
        const alpha = 0.04 + point.depth * 0.28 + point.energy * 0.2 + point.boost * 0.08;
        const phase = column * 0.36 + row * 0.72 + point.depth * 2.4;

        if (column < columns - 1) {
          drawLine(point, points[row][column + 1], alpha, phase);
        }

        if (row < rows - 1) {
          drawLine(point, points[row + 1][column], alpha * 0.62, phase + 1.1);
        }
      }
    }

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const point = points[row][column];
        const phase = column * 0.4 + row * 0.8;
        const glow = 0.08 + point.depth * 0.34 + point.energy * 0.42 + point.boost * 0.1;
        const radius = 0.45 + point.depth * 1.3 + point.energy * 0.85 + point.boost * 0.35;

        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = waveColor(phase, point.depth, glow, point.boost, point.energy);
        context.fill();
      }
    }

    context.restore();
  };

  const animate = (timestamp = 0) => {
    const elapsed = lastFrameTime ? timestamp - lastFrameTime : 16.67;
    const frameStep = clamp(elapsed / 16.67, 0.5, 2);
    lastFrameTime = timestamp;

    pointer.velocity += (pointer.targetVelocity - pointer.velocity) * 0.14;
    pointer.targetVelocity *= 0.84;

    if (pointer.targetVelocity < 0.01) {
      pointer.targetVelocity = 0;
    }

    time += prefersReducedMotion.matches ? 0 : 0.018 * frameStep;
    draw();
    frameId = window.requestAnimationFrame(animate);
  };

  const onPointerMove = (event) => {
    const rect = canvasElement.getBoundingClientRect();
    const now = performance.now();
    const elapsed = pointer.lastTime ? now - pointer.lastTime : 16;
    const movement = pointer.active ? Math.hypot(event.clientX - pointer.lastClientX, event.clientY - pointer.lastClientY) : 0;
    const speed = movement / Math.max(elapsed, 16);
    const rectWidth = Math.max(rect.width, 1);
    const rectHeight = Math.max(rect.height, 1);
    const normalX = (event.clientX - rect.left) / rectWidth;
    const normalY = (event.clientY - rect.top) / rectHeight;
    const isInside = normalX >= 0 && normalX <= 1 && normalY >= 0 && normalY <= 1;

    pointer.x = (clamp(normalX, 0, 1) - 0.5) * 2;
    pointer.y = (clamp(normalY, 0, 1) - 0.5) * 2;
    pointer.canvasX = clamp(normalX, 0, 1) * width;
    pointer.canvasY = clamp(normalY, 0, 1) * height;
    pointer.targetVelocity = isInside ? Math.max(pointer.targetVelocity, clamp(speed / 4.8, 0, 0.18)) : 0;
    pointer.lastClientX = event.clientX;
    pointer.lastClientY = event.clientY;
    pointer.lastTime = now;
    pointer.active = isInside;
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(frameId), { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frameId);
      return;
    }

    lastFrameTime = 0;
    frameId = window.requestAnimationFrame(animate);
  });
  resize();
  animate();
}
