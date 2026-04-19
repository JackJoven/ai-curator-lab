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

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const resize = () => {
    const rect = canvasElement.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.7);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvasElement.width = Math.floor(width * pixelRatio);
    canvasElement.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (!pointer.active) {
      pointer.canvasX = width * 0.62;
      pointer.canvasY = height * 0.46;
    }
  };

  const drawLine = (start, end, alpha, tone = "cool") => {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle =
      tone === "warm" ? `rgba(233, 193, 118, ${alpha})` : `rgba(181, 218, 229, ${alpha})`;
    context.stroke();
  };

  const drawBackdrop = (isSmall) => {
    const glowWash = context.createLinearGradient(0, 0, width, height);
    glowWash.addColorStop(0, "rgba(86, 172, 190, 0.24)");
    glowWash.addColorStop(0.35, "rgba(22, 40, 57, 0.02)");
    glowWash.addColorStop(0.7, "rgba(33, 73, 92, 0.16)");
    glowWash.addColorStop(1, "rgba(233, 193, 118, 0.12)");
    context.fillStyle = glowWash;
    context.fillRect(0, 0, width, height);

    context.save();
    context.globalCompositeOperation = "screen";

    for (let y = 12; y < height; y += isSmall ? 24 : 20) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y + Math.sin(time * 0.4 + y * 0.02) * 3);
      context.strokeStyle = "rgba(181, 218, 229, 0.045)";
      context.lineWidth = 1;
      context.stroke();
    }

    for (let band = 0; band < 4; band += 1) {
      const y = height * (0.1 + band * 0.18) + Math.sin(time * 0.42 + band * 1.6) * 18;
      const ribbon = context.createLinearGradient(0, y - 70, width, y + 70);
      ribbon.addColorStop(0, "rgba(86, 172, 190, 0)");
      ribbon.addColorStop(0.45, `rgba(${band % 2 === 0 ? "86, 172, 190" : "233, 193, 118"}, 0.24)`);
      ribbon.addColorStop(1, "rgba(86, 172, 190, 0)");

      context.beginPath();
      context.moveTo(-width * 0.08, y + band * 8);
      context.bezierCurveTo(
        width * 0.22,
        y - 58 + band * 7,
        width * 0.58,
        y + 42 - band * 10,
        width * 1.08,
        y - 26,
      );
      context.lineWidth = isSmall ? 36 + band * 8 : 58 + band * 11;
      context.strokeStyle = ribbon;
      context.stroke();
    }

    for (let rail = 0; rail < 9; rail += 1) {
      const x = width * (0.08 + rail * 0.12) + Math.sin(time * 0.28 + rail) * 18;
      const y = height * (0.04 + (rail % 4) * 0.15);
      const railLength = width * (0.16 + (rail % 3) * 0.05);

      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + railLength, y + height * 0.13);
      context.lineTo(x + railLength + width * 0.05, y + height * 0.13);
      context.strokeStyle = rail % 3 === 0 ? "rgba(233, 193, 118, 0.18)" : "rgba(181, 218, 229, 0.14)";
      context.lineWidth = rail % 3 === 0 ? 1.4 : 1;
      context.stroke();
    }

    for (let dot = 0; dot < (isSmall ? 44 : 76); dot += 1) {
      const seed = dot * 73.41;
      const x = (seed * 5.7 + Math.sin(time * 0.32 + dot) * 14) % width;
      const y = (height * (0.08 + ((dot * 11) % 74) / 100) + Math.cos(time * 0.26 + dot) * 10) % height;
      const size = dot % 7 === 0 ? 2 : 1;

      context.fillStyle = dot % 6 === 0 ? "rgba(233, 193, 118, 0.34)" : "rgba(252, 249, 248, 0.24)";
      context.fillRect(x, y, size, size);
    }

    context.restore();
  };

  const drawPointerWake = () => {
    if (!pointer.active || pointer.velocity < 0.03) {
      return;
    }

    context.save();
    context.globalCompositeOperation = "screen";
    context.lineWidth = 1 + pointer.velocity * 1.8;

    for (let ring = 0; ring < 4; ring += 1) {
      const radius = 34 + ring * 28 + Math.sin(time * 2.4 + ring) * 7 + pointer.velocity * 26;
      const alpha = (0.22 - ring * 0.035) * pointer.velocity;

      context.beginPath();
      context.arc(pointer.canvasX, pointer.canvasY, radius, -0.7 + ring * 0.42, 1.6 + ring * 0.35);
      context.strokeStyle = `rgba(181, 218, 229, ${alpha})`;
      context.stroke();

      context.beginPath();
      context.arc(pointer.canvasX, pointer.canvasY, radius * 0.72, 2.3 + ring * 0.3, 3.9 + ring * 0.2);
      context.strokeStyle = `rgba(233, 193, 118, ${alpha * 0.78})`;
      context.stroke();
    }

    for (let trail = 0; trail < 6; trail += 1) {
      const angle = time * 1.1 + trail * 1.04;
      const distance = 26 + trail * 12 + pointer.velocity * 26;
      const x = pointer.canvasX + Math.cos(angle) * distance;
      const y = pointer.canvasY + Math.sin(angle) * distance * 0.62;

      context.beginPath();
      context.moveTo(x - 8, y);
      context.lineTo(x + 8, y);
      context.strokeStyle = `rgba(252, 249, 248, ${0.1 + pointer.velocity * 0.18})`;
      context.stroke();
    }

    context.restore();
  };

  const draw = () => {
    const isSmall = width < 760;
    const spacing = isSmall ? 36 : 44;
    const columns = isSmall ? 20 : 32;
    const rows = isSmall ? 18 : 26;
    const horizon = height * (isSmall ? 0.28 : 0.24);
    const centerX = width * (isSmall ? 0.5 : 0.64);
    const floorHeight = height * 0.92;
    const waveStrength = isSmall ? 38 : 64;
    const points = [];

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#142638";
    context.fillRect(0, 0, width, height);
    drawBackdrop(isSmall);

    for (let row = 0; row < rows; row += 1) {
      const rowPoints = [];
      const depth = row / (rows - 1);
      const perspective = 0.23 + depth * 1.34;
      const screenY = horizon + Math.pow(depth, 1.72) * floorHeight;
      const rowDrift = Math.sin(depth * Math.PI + time * 0.7) * 24;

      for (let column = 0; column < columns; column += 1) {
        const baseX = (column - (columns - 1) / 2) * spacing;
        const distance = Math.hypot(column - columns * 0.55, row - rows * 0.5);
        const baseScreenX = centerX + (baseX + rowDrift) * perspective + pointer.x * 24 * depth;
        const pointerDistance = Math.hypot(
          (baseScreenX - pointer.canvasX) / (isSmall ? 150 : 240),
          (screenY - pointer.canvasY) / (isSmall ? 130 : 190),
        );
        const pointerInfluence = pointer.active ? Math.exp(-pointerDistance * pointerDistance) : 0;
        const velocityBoost = pointer.velocity * pointerInfluence;
        const localTime = time * (1 + velocityBoost * 2.9) + velocityBoost * 4.8;
        const waveA = Math.sin(column * 0.58 + localTime * 1.8);
        const waveB = Math.cos(row * 0.72 - localTime * 1.35);
        const pulse = Math.sin(distance * 0.5 - localTime * 2.2);
        const wake = Math.sin(pointerDistance * 6.4 - localTime * 2.8) * velocityBoost * waveStrength * 0.82;
        const lift = ((waveA * 0.8 + waveB * 0.55 + pulse * 0.46) * waveStrength + wake) * (1 + velocityBoost * 1.45);
        const screenX = centerX + (baseX + rowDrift) * perspective + pointer.x * 28 * depth;
        const projectedY = screenY - lift * (0.3 + depth * 0.72) - pointer.y * 18 * depth * (0.4 + pointer.velocity);

        rowPoints.push({
          x: screenX,
          y: projectedY,
          depth,
          lift,
          scale: perspective,
          boost: velocityBoost,
        });
      }

      points.push(rowPoints);
    }

    context.lineWidth = 1.15;
    context.font = "10px Inter, Arial, sans-serif";
    context.textBaseline = "middle";
    context.shadowBlur = 12;
    context.shadowColor = "rgba(181, 218, 229, 0.18)";

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const point = points[row][column];
        const alpha = 0.05 + point.depth * 0.28 + point.boost * 0.24;
        const tone = point.boost > 0.18 || (row + column) % 9 === 0 ? "warm" : "cool";

        if (column < columns - 1) {
          drawLine(point, points[row][column + 1], alpha, tone);
        }

        if (row < rows - 1) {
          drawLine(point, points[row + 1][column], alpha * 0.68, tone);
        }
      }
    }

    context.shadowBlur = 9;
    context.shadowColor = "rgba(252, 249, 248, 0.2)";

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const point = points[row][column];
        const glow = 0.13 + point.depth * 0.54 + point.boost * 0.34;
        const radius = 0.6 + point.depth * 1.8 + point.boost * 2.2;

        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(252, 249, 248, ${glow})`;
        context.fill();

        if ((row + column) % 11 === 0 && point.depth > 0.26) {
          context.fillStyle = `rgba(181, 218, 229, ${0.14 + point.depth * 0.26 + point.boost * 0.2})`;
          context.fillText("01", point.x + 5, point.y - 5);
        }
      }
    }

    drawPointerWake();

    context.shadowBlur = 0;

    const leftShade = context.createLinearGradient(0, 0, width * 0.72, 0);
    leftShade.addColorStop(0, "rgba(22, 40, 57, 0.56)");
    leftShade.addColorStop(0.68, "rgba(22, 40, 57, 0.22)");
    leftShade.addColorStop(1, "rgba(22, 40, 57, 0)");
    context.fillStyle = leftShade;
    context.fillRect(0, 0, width * 0.72, height);
  };

  const animate = () => {
    pointer.velocity += (pointer.targetVelocity - pointer.velocity) * 0.16;
    pointer.targetVelocity *= 0.86;

    if (pointer.targetVelocity < 0.01) {
      pointer.targetVelocity = 0;
    }

    time += prefersReducedMotion.matches ? 0 : 0.018;
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
    pointer.targetVelocity = isInside ? Math.max(pointer.targetVelocity, clamp(speed / 1.2, 0, 1)) : 0;
    pointer.lastClientX = event.clientX;
    pointer.lastClientY = event.clientY;
    pointer.lastTime = now;
    pointer.active = isInside;
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(frameId), { once: true });
  resize();
  animate();
}
