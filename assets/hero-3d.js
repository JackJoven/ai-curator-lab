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
  const pointer = { x: 0, y: 0 };
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let time = 0;
  let frameId = 0;

  const resize = () => {
    const rect = canvasElement.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.7);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvasElement.width = Math.floor(width * pixelRatio);
    canvasElement.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const drawLine = (start, end, alpha) => {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = `rgba(233, 193, 118, ${alpha})`;
    context.stroke();
  };

  const draw = () => {
    const isSmall = width < 760;
    const spacing = isSmall ? 36 : 44;
    const columns = isSmall ? 20 : 32;
    const rows = isSmall ? 18 : 26;
    const horizon = height * (isSmall ? 0.28 : 0.24);
    const centerX = width * (isSmall ? 0.5 : 0.64);
    const floorHeight = height * 0.92;
    const waveStrength = isSmall ? 46 : 82;
    const points = [];

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#162839";
    context.fillRect(0, 0, width, height);

    const backgroundFade = context.createLinearGradient(0, 0, width, height);
    backgroundFade.addColorStop(0, "rgba(252, 249, 248, 0.05)");
    backgroundFade.addColorStop(0.54, "rgba(22, 40, 57, 0)");
    backgroundFade.addColorStop(1, "rgba(233, 193, 118, 0.08)");
    context.fillStyle = backgroundFade;
    context.fillRect(0, 0, width, height);

    for (let row = 0; row < rows; row += 1) {
      const rowPoints = [];
      const depth = row / (rows - 1);
      const perspective = 0.23 + depth * 1.34;
      const screenY = horizon + Math.pow(depth, 1.72) * floorHeight;
      const rowDrift = Math.sin(depth * Math.PI + time * 0.7) * 34;

      for (let column = 0; column < columns; column += 1) {
        const baseX = (column - (columns - 1) / 2) * spacing;
        const distance = Math.hypot(column - columns * 0.55, row - rows * 0.5);
        const waveA = Math.sin(column * 0.58 + time * 1.8);
        const waveB = Math.cos(row * 0.72 - time * 1.35);
        const pulse = Math.sin(distance * 0.5 - time * 2.2);
        const lift = (waveA * 0.9 + waveB * 0.65 + pulse * 0.55) * waveStrength;
        const screenX = centerX + (baseX + rowDrift) * perspective + pointer.x * 46 * depth;
        const projectedY = screenY - lift * (0.35 + depth * 0.92) - pointer.y * 34 * depth;

        rowPoints.push({
          x: screenX,
          y: projectedY,
          depth,
          lift,
          scale: perspective,
        });
      }

      points.push(rowPoints);
    }

    context.lineWidth = 1.15;
    context.font = "10px Inter, Arial, sans-serif";
    context.textBaseline = "middle";

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const point = points[row][column];
        const alpha = 0.06 + point.depth * 0.34;

        if (column < columns - 1) {
          drawLine(point, points[row][column + 1], alpha);
        }

        if (row < rows - 1) {
          drawLine(point, points[row + 1][column], alpha * 0.72);
        }
      }
    }

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const point = points[row][column];
        const glow = 0.18 + point.depth * 0.74;
        const radius = 0.7 + point.depth * 2.25;

        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(252, 249, 248, ${glow})`;
        context.fill();

        if ((row + column) % 7 === 0 && point.depth > 0.22) {
          context.fillStyle = `rgba(181, 200, 223, ${0.16 + point.depth * 0.34})`;
          context.fillText("01", point.x + 5, point.y - 5);
        }
      }
    }

    const leftShade = context.createLinearGradient(0, 0, width * 0.72, 0);
    leftShade.addColorStop(0, "rgba(22, 40, 57, 0.64)");
    leftShade.addColorStop(0.68, "rgba(22, 40, 57, 0.28)");
    leftShade.addColorStop(1, "rgba(22, 40, 57, 0)");
    context.fillStyle = leftShade;
    context.fillRect(0, 0, width * 0.72, height);
  };

  const animate = () => {
    time += prefersReducedMotion.matches ? 0 : 0.018;
    draw();
    frameId = window.requestAnimationFrame(animate);
  };

  const onPointerMove = (event) => {
    const rect = canvasElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(frameId), { once: true });
  resize();
  animate();
}
