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
    glowWash.addColorStop(0, "rgba(181, 218, 229, 0.12)");
    glowWash.addColorStop(0.42, "rgba(22, 40, 57, 0)");
    glowWash.addColorStop(1, "rgba(233, 193, 118, 0.09)");
    context.fillStyle = glowWash;
    context.fillRect(0, 0, width, height);

    context.save();
    context.globalCompositeOperation = "screen";

    for (let band = 0; band < 3; band += 1) {
      const y = height * (0.16 + band * 0.21) + Math.sin(time * 0.22 + band * 1.7) * 16;
      const ribbon = context.createLinearGradient(0, y - 80, width, y + 80);
      ribbon.addColorStop(0, "rgba(94, 169, 186, 0)");
      ribbon.addColorStop(0.5, `rgba(${band === 1 ? "233, 193, 118" : "181, 218, 229"}, 0.12)`);
      ribbon.addColorStop(1, "rgba(94, 169, 186, 0)");

      context.beginPath();
      context.moveTo(-width * 0.05, y);
      context.bezierCurveTo(
        width * 0.24,
        y - 38 - band * 10,
        width * 0.58,
        y + 34 + band * 8,
        width * 1.05,
        y - 16,
      );
      context.lineWidth = isSmall ? 28 + band * 8 : 42 + band * 12;
      context.strokeStyle = ribbon;
      context.stroke();
    }

    context.restore();
    context.save();
    context.lineWidth = 1;

    for (let line = 0; line < 8; line += 1) {
      const x = ((line / 7) * width + Math.sin(time * 0.18 + line) * 16) % width;
      const y = height * (0.05 + line * 0.11);

      context.beginPath();
      context.moveTo(x - width * 0.18, y);
      context.lineTo(x + width * 0.28, y + height * 0.22);
      context.strokeStyle = "rgba(181, 218, 229, 0.07)";
      context.stroke();
    }

    for (let dot = 0; dot < (isSmall ? 28 : 46); dot += 1) {
      const seed = dot * 73.41;
      const x = (seed * 5.7 + Math.sin(time * 0.2 + dot) * 10) % width;
      const y = (height * (0.1 + ((dot * 11) % 68) / 100) + Math.cos(time * 0.16 + dot) * 8) % height;
      const size = dot % 5 === 0 ? 2 : 1;

      context.fillStyle = dot % 6 === 0 ? "rgba(233, 193, 118, 0.24)" : "rgba(252, 249, 248, 0.16)";
      context.fillRect(x, y, size, size);
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
    const waveStrength = isSmall ? 32 : 52;
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
      const rowDrift = Math.sin(depth * Math.PI + time * 0.32) * 16;

      for (let column = 0; column < columns; column += 1) {
        const baseX = (column - (columns - 1) / 2) * spacing;
        const distance = Math.hypot(column - columns * 0.55, row - rows * 0.5);
        const waveA = Math.sin(column * 0.45 + time * 0.78);
        const waveB = Math.cos(row * 0.48 - time * 0.62);
        const pulse = Math.sin(distance * 0.34 - time * 0.9);
        const lift = (waveA * 0.62 + waveB * 0.38 + pulse * 0.28) * waveStrength;
        const screenX = centerX + (baseX + rowDrift) * perspective + pointer.x * 28 * depth;
        const projectedY = screenY - lift * (0.28 + depth * 0.58) - pointer.y * 20 * depth;

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
    context.shadowBlur = 12;
    context.shadowColor = "rgba(181, 218, 229, 0.18)";

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const point = points[row][column];
        const alpha = 0.04 + point.depth * 0.24;
        const tone = (row + column) % 9 === 0 ? "warm" : "cool";

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
        const glow = 0.12 + point.depth * 0.5;
        const radius = 0.55 + point.depth * 1.7;

        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(252, 249, 248, ${glow})`;
        context.fill();

        if ((row + column) % 11 === 0 && point.depth > 0.26) {
          context.fillStyle = `rgba(181, 218, 229, ${0.12 + point.depth * 0.24})`;
          context.fillText("01", point.x + 5, point.y - 5);
        }
      }
    }

    context.shadowBlur = 0;

    const leftShade = context.createLinearGradient(0, 0, width * 0.72, 0);
    leftShade.addColorStop(0, "rgba(22, 40, 57, 0.56)");
    leftShade.addColorStop(0.68, "rgba(22, 40, 57, 0.22)");
    leftShade.addColorStop(1, "rgba(22, 40, 57, 0)");
    context.fillStyle = leftShade;
    context.fillRect(0, 0, width * 0.72, height);
  };

  const animate = () => {
    time += prefersReducedMotion.matches ? 0 : 0.009;
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
