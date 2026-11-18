'use strict';

// The stars are fixed on the paper. The curved pencil marks open as the reader scrolls.
const sky = document.querySelector('#sky-paper');
const pencil = sky.getContext('2d');
const still = window.matchMedia('(prefers-reduced-motion: reduce)');
let drawingQueued = false;
let onPage = false;

function drawNightPage() {
  drawingQueued = false;
  const bounds = sky.getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  if (!width || !height) return;
  if (sky.width !== Math.round(width * scale) || sky.height !== Math.round(height * scale)) {
    sky.width = Math.round(width * scale);
    sky.height = Math.round(height * scale);
  }
  pencil.setTransform(scale, 0, 0, scale, 0, 0);
  pencil.clearRect(0, 0, width, height);
  const progress = still.matches ? 0.65 : Math.min(1, Math.max(0, (innerHeight - bounds.top) / (height + innerHeight)));
  pencil.strokeStyle = '#dfc9aa';
  for (let i = 0; i < 220; i++) {
    const x = width * ((i * 0.61803399) % 1);
    const y = height * ((i * i * 0.41421 + 0.17) % 1);
    pencil.globalAlpha = 0.17 + (i % 6) / 17;
    pencil.beginPath();
    pencil.moveTo(x, y);
    pencil.lineTo(x + Math.sin(i) * 2 + 1, y - 1.4);
    pencil.stroke();
  }
  for (const side of [-1, 1]) {
    pencil.save();
    pencil.translate(side < 0 ? width * 0.03 : width * 0.97, height * (side < 0 ? 0.33 : 0.78));
    for (let ring = 1; ring <= 8; ring++) {
      pencil.globalAlpha = 0.21 - ring * 0.013;
      pencil.beginPath();
      const radius = width * 0.018 * ring + 13;
      pencil.ellipse(0, 0, radius, radius * 0.7, side * 0.44, 0, Math.PI * (0.95 + progress));
      pencil.stroke();
    }
    pencil.restore();
  }
  pencil.globalAlpha = 1;
}

function scheduleDrawing() {
  if (onPage && !drawingQueued && pencil) {
    drawingQueued = true;
    requestAnimationFrame(drawNightPage);
  }
}

new IntersectionObserver(([entry]) => {
  onPage = entry.isIntersecting;
  scheduleDrawing();
}).observe(sky);
window.addEventListener('resize', scheduleDrawing);
window.addEventListener('scroll', scheduleDrawing, { passive:true });
still.addEventListener('change', scheduleDrawing);
