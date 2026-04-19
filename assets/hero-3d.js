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
  const frameInterval = 1000 / 30;
  const maxRenderPixels = 900000;

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

  const drawBackdrop = (isSmall, horizon, centerX, columns, spacing) => {
    const glowWash = context.createLinearGradient(0, 0, width, height);
    glowWash.addColorStop(0, "rgba(86, 172, 190, 0.2)");
    glowWash.addColorStop(0.34, "rgba(22, 40, 57, 0.02)");
    glowWash.addColorStop(0.78, "rgba(32, 72, 92, 0.18)");
    glowWash.addColorStop(1, "rgba(233, 193, 118, 0.1)");
    context.fillStyle = glowWash;
    context.fillRect(0, 0, width, height);

    context.save();
    context.globalCompositeOperation = "screen";
    context.lineWidth = 1;
    context.font = "10px Inter, Arial, sans-serif";
    context.textBaseline = "middle";

    const topMargin = height * (isSmall ? 0.06 : 0.05);
    const matrixRows = isSmall ? 7 : 9;
    const matrixColumns = columns + (isSmall ? 2 : 4);
    const rows = [];

    for (let row = 0; row < matrixRows; row += 1) {
      const depth = row / (matrixRows - 1);
      const y = horizon - Math.pow(depth, 1.42) * (horizon - topMargin);
      const rowHalfWidth = spacing * columns * (0.13 + depth * (isSmall ? 0.26 : 0.34));
      const drift = Math.sin(time * 0.48 + row * 0.8) * (2 + depth * 12);
      const rowPoints = [];

      for (let column = 0; column < matrixColumns; column += 1) {
        const offset = (column - (matrixColumns - 1) / 2) / ((matrixColumns - 1) / 2);
        const x = centerX + offset * rowHalfWidth + drift * offset;

        rowPoints.push({ x, y, depth, column });
      }

      rows.push(rowPoints);
    }

    const horizonGlow = context.createLinearGradient(0, horizon - 70, 0, horizon + 26);
    horizonGlow.addColorStop(0, "rgba(86, 172, 190, 0)");
    horizonGlow.addColorStop(0.66, "rgba(181, 218, 229, 0.2)");
    horizonGlow.addColorStop(1, "rgba(233, 193, 118, 0.08)");
    context.fillStyle = horizonGlow;
    context.fillRect(0, horizon - 70, width, 96);

    context.shadowBlur = 0;

    for (let row = 0; row < rows.length; row += 1) {
      for (let column = 0; column < rows[row].length; column += 1) {
        const point = rows[row][column];
        const alpha = 0.04 + point.depth * 0.13;

        if (column < rows[row].length - 1) {
          drawLine(point, rows[row][column + 1], alpha, "cool");
        }

        if (row < rows.length - 1) {
          drawLine(point, rows[row + 1][column], alpha * 0.78, "cool");
        }

        if ((row + column) % 5 === 0) {
          context.fillStyle = `rgba(252, 249, 248, ${0.12 + point.depth * 0.16})`;
          context.fillRect(point.x - 0.8, point.y - 0.8, 1.6, 1.6);
        }

        if ((row * 3 + column) % 17 === 0 && row > 1) {
          const digit = (row + column + Math.floor(time * 2)) % 2 === 0 ? "1" : "0";
          context.fillStyle = `rgba(181, 218, 229, ${0.1 + point.depth * 0.18})`;
          context.fillText(digit, point.x + 4, point.y - 7);
        }
      }
    }

    context.shadowBlur = 0;

    for (let column = 0; column < matrixColumns; column += 5) {
      const anchor = rows[0][column];
      const top = rows[rows.length - 1][column];
      const streamLength = 2 + (column % 2);

      for (let stream = 0; stream < streamLength; stream += 1) {
        const fall = (time * 0.28 + stream * 0.2 + column * 0.07) % 1;
        const x = top.x + (anchor.x - top.x) * fall;
        const y = top.y + (anchor.y - top.y) * fall;
        const digit = (column + stream + Math.floor(time * 3)) % 2 === 0 ? "1" : "0";

        context.fillStyle = `rgba(233, 193, 118, ${0.08 + fall * 0.16})`;
        context.fillText(digit, x + 2, y);
      }
    }

    context.restore();
  };

  const drawPointerWake = () => {
    if (!pointer.active || pointer.velocity < 0.03) {
      return;
    }

    context.save();
    context.globalCompositeOperation = "screen";
    context.lineWidth = 0.8 + pointer.velocity * 0.5;

    for (let ring = 0; ring < 2; ring += 1) {
      const radius = 22 + ring * 18 + Math.sin(time * 2.4 + ring) * 3 + pointer.velocity * 8;
      const alpha = (0.08 - ring * 0.018) * pointer.velocity;

      context.beginPath();
      context.arc(pointer.canvasX, pointer.canvasY, radius, -0.7 + ring * 0.42, 1.1 + ring * 0.35);
      context.strokeStyle = `rgba(181, 218, 229, ${alpha})`;
      context.stroke();

      context.beginPath();
      context.arc(pointer.canvasX, pointer.canvasY, radius * 0.72, 2.3 + ring * 0.3, 3.2 + ring * 0.2);
      context.strokeStyle = `rgba(233, 193, 118, ${alpha * 0.78})`;
      context.stroke();
    }

    for (let trail = 0; trail < 3; trail += 1) {
      const angle = time * 1.1 + trail * 1.04;
      const distance = 18 + trail * 9 + pointer.velocity * 10;
      const x = pointer.canvasX + Math.cos(angle) * distance;
      const y = pointer.canvasY + Math.sin(angle) * distance * 0.62;

      context.beginPath();
      context.moveTo(x - 5, y);
      context.lineTo(x + 5, y);
      context.strokeStyle = `rgba(252, 249, 248, ${0.06 + pointer.velocity * 0.08})`;
      context.stroke();
    }

    context.restore();
  };

  const draw = () => {
    const isSmall = width < 760;
    const spacing = isSmall ? 36 : 44;
    const columns = isSmall ? 18 : 28;
    const rows = isSmall ? 15 : 20;
    const horizon = height * (isSmall ? 0.28 : 0.24);
    const centerX = width * (isSmall ? 0.5 : 0.64);
    const floorHeight = height * 0.92;
    const waveStrength = isSmall ? 38 : 64;
    const points = [];

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#142638";
    context.fillRect(0, 0, width, height);
    drawBackdrop(isSmall, horizon, centerX, columns, spacing);

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
        const velocityBoost = pointer.velocity * pointerInfluence * 0.28;
        const localTime = time * (1 + velocityBoost * 0.7) + velocityBoost * 1.2;
        const waveA = Math.sin(column * 0.58 + localTime * 1.8);
        const waveB = Math.cos(row * 0.72 - localTime * 1.35);
        const pulse = Math.sin(distance * 0.5 - localTime * 2.2);
        const wake = Math.sin(pointerDistance * 6.4 - localTime * 2.8) * velocityBoost * waveStrength * 0.22;
        const lift = ((waveA * 0.8 + waveB * 0.55 + pulse * 0.46) * waveStrength + wake) * (1 + velocityBoost * 0.2);
        const screenX = centerX + (baseX + rowDrift) * perspective + pointer.x * 14 * depth;
        const projectedY = screenY - lift * (0.3 + depth * 0.72) - pointer.y * 5 * depth * pointer.velocity;

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
    context.shadowBlur = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const point = points[row][column];
        const alpha = 0.05 + point.depth * 0.28 + point.boost * 0.08;
        const tone = point.boost > 0.08 || (row + column) % 9 === 0 ? "warm" : "cool";

        if (column < columns - 1) {
          drawLine(point, points[row][column + 1], alpha, tone);
        }

        if (row < rows - 1) {
          drawLine(point, points[row + 1][column], alpha * 0.68, tone);
        }
      }
    }

    context.shadowBlur = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const point = points[row][column];
        const glow = 0.13 + point.depth * 0.54 + point.boost * 0.12;
        const radius = 0.6 + point.depth * 1.8 + point.boost * 0.5;

        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(252, 249, 248, ${glow})`;
        context.fill();

        if ((row + column) % 17 === 0 && point.depth > 0.26) {
          context.fillStyle = `rgba(181, 218, 229, ${0.14 + point.depth * 0.26 + point.boost * 0.08})`;
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

  const animate = (timestamp = 0) => {
    if (timestamp - lastFrameTime < frameInterval) {
      frameId = window.requestAnimationFrame(animate);
      return;
    }

    const frameStep = lastFrameTime ? clamp((timestamp - lastFrameTime) / frameInterval, 0.6, 1.8) : 1;
    lastFrameTime = timestamp;

    pointer.velocity += (pointer.targetVelocity - pointer.velocity) * 0.12;
    pointer.targetVelocity *= 0.82;

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
    pointer.targetVelocity = isInside ? Math.max(pointer.targetVelocity, clamp(speed / 3.6, 0, 0.38)) : 0;
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
