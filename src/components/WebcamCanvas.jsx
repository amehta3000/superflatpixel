import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import './PixelCanvas.css';

const WebcamCanvas = forwardRef(({
  pixelSize, rotation, pixelShape, backgroundColor, blur, saturation,
  gridLines, gridColor, pixelSpacing, posterize
}, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const propsRef = useRef({});
  const [error, setError] = useState(null);

  useImperativeHandle(ref, () => canvasRef.current);

  propsRef.current = { pixelSize, rotation, pixelShape, backgroundColor, blur, saturation, gridLines, gridColor, pixelSpacing, posterize };

  useEffect(() => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;

    const offscreen = document.createElement('canvas');

    const applyPosterize = (value, levels) => {
      const step = 256 / levels;
      return Math.floor(value / step) * step;
    };

    const applySaturation = (r, g, b, saturationValue) => {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const factor = saturationValue / 100;
      return {
        r: Math.max(0, Math.min(255, gray + factor * (r - gray))),
        g: Math.max(0, Math.min(255, gray + factor * (g - gray))),
        b: Math.max(0, Math.min(255, gray + factor * (b - gray))),
      };
    };

    const render = () => {
      rafRef.current = requestAnimationFrame(render);

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || video.readyState < 2) return;

      const {
        pixelSize, rotation, pixelShape, backgroundColor, blur,
        saturation, gridLines, gridColor, pixelSpacing, posterize
      } = propsRef.current;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      const maxWidth = container.clientWidth - 40;
      const maxHeight = window.innerHeight - 300;

      let width = vw;
      let height = vh;
      if (width > maxWidth) { height = (maxWidth / width) * height; width = maxWidth; }
      if (height > maxHeight) { width = (maxHeight / height) * width; height = maxHeight; }
      width = Math.round(width);
      height = Math.round(height);

      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      if (pixelSize === 0) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -width, 0, width, height);
        ctx.restore();
        return;
      }

      const scaledW = Math.ceil(width / pixelSize);
      const scaledH = Math.ceil(height / pixelSize);
      offscreen.width = scaledW;
      offscreen.height = scaledH;

      const offCtx = offscreen.getContext('2d');
      if (blur > 0) offCtx.filter = `blur(${blur}px)`;
      offCtx.save();
      offCtx.scale(-1, 1);
      offCtx.drawImage(video, -scaledW, 0, scaledW, scaledH);
      offCtx.restore();
      offCtx.filter = 'none';

      const imageData = offCtx.getImageData(0, 0, scaledW, scaledH);
      const pixels = imageData.data;

      const drawShape = (x, y, size, color, spacing) => {
        const effectiveSize = size - spacing;
        const offset = spacing / 2;
        const cx = x + offset + effectiveSize / 2;
        const cy = y + offset + effectiveSize / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
        ctx.fillStyle = color;

        switch (pixelShape) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(cx, cy, effectiveSize / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'hexagon':
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const a = (Math.PI / 3) * i;
              const hx = cx + (effectiveSize / 2) * Math.cos(a);
              const hy = cy + (effectiveSize / 2) * Math.sin(a);
              if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.fill();
            break;
          case 'rectangle':
            ctx.fillRect(x + offset, y + offset, effectiveSize * 1.5, effectiveSize * 0.75);
            break;
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(cx, y + offset);
            ctx.lineTo(x + offset + effectiveSize, y + offset + effectiveSize);
            ctx.lineTo(x + offset, y + offset + effectiveSize);
            ctx.closePath();
            ctx.fill();
            break;
          case 'diamond':
            ctx.beginPath();
            ctx.moveTo(cx, y + offset);
            ctx.lineTo(x + offset + effectiveSize, cy);
            ctx.lineTo(cx, y + offset + effectiveSize);
            ctx.lineTo(x + offset, cy);
            ctx.closePath();
            ctx.fill();
            break;
          case 'star':
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const outerA = (Math.PI * 2 * i) / 5 - Math.PI / 2;
              const innerA = outerA + Math.PI / 5;
              if (i === 0) ctx.moveTo(cx + Math.cos(outerA) * effectiveSize / 2, cy + Math.sin(outerA) * effectiveSize / 2);
              else ctx.lineTo(cx + Math.cos(outerA) * effectiveSize / 2, cy + Math.sin(outerA) * effectiveSize / 2);
              ctx.lineTo(cx + Math.cos(innerA) * effectiveSize / 4, cy + Math.sin(innerA) * effectiveSize / 4);
            }
            ctx.closePath();
            ctx.fill();
            break;
          case 'plus': {
            const t = effectiveSize * 0.3;
            ctx.fillRect(cx - t / 2, y + offset, t, effectiveSize);
            ctx.fillRect(x + offset, cy - t / 2, effectiveSize, t);
            break;
          }
          case 'cross':
            ctx.beginPath();
            ctx.moveTo(x + offset, y + offset);
            ctx.lineTo(x + offset + effectiveSize, y + offset + effectiveSize);
            ctx.moveTo(x + offset + effectiveSize, y + offset);
            ctx.lineTo(x + offset, y + offset + effectiveSize);
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.stroke();
            break;
          case 'backslash':
            ctx.beginPath();
            ctx.moveTo(x + offset, y + offset);
            ctx.lineTo(x + offset + effectiveSize, y + offset + effectiveSize);
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.stroke();
            break;
          case 'slash':
            ctx.beginPath();
            ctx.moveTo(x + offset, y + offset + effectiveSize);
            ctx.lineTo(x + offset + effectiveSize, y + offset);
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.stroke();
            break;
          case 'square':
          default:
            ctx.fillRect(x + offset, y + offset, effectiveSize, effectiveSize);
            break;
        }

        if (gridLines) {
          ctx.strokeStyle = gridColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + offset, y + offset, effectiveSize, effectiveSize);
        }

        ctx.restore();
      };

      for (let py = 0; py < scaledH; py++) {
        for (let px = 0; px < scaledW; px++) {
          const i = (py * scaledW + px) * 4;
          let r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
          const a = pixels[i + 3] / 255;

          if (saturation !== 100) {
            const s = applySaturation(r, g, b, saturation);
            r = s.r; g = s.g; b = s.b;
          }
          if (posterize < 256) {
            r = applyPosterize(r, posterize);
            g = applyPosterize(g, posterize);
            b = applyPosterize(b, posterize);
          }
          if (a > 0) {
            drawShape(px * pixelSize, py * pixelSize, pixelSize, `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`, pixelSpacing);
          }
        }
      }
    };

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        streamRef.current = stream;
        video.srcObject = stream;
        return video.play();
      })
      .then(() => {
        rafRef.current = requestAnimationFrame(render);
      })
      .catch(() => {
        setError('Camera access denied. Please allow camera permissions and try again.');
      });

    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  if (error) {
    return (
      <div className="pixel-canvas-container" style={{ flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '3rem' }}>📷</div>
        <p style={{ color: '#b0b0b0', textAlign: 'center', maxWidth: '300px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pixel-canvas-container">
      <canvas ref={canvasRef} className="pixel-canvas" />
    </div>
  );
});

WebcamCanvas.displayName = 'WebcamCanvas';
export default WebcamCanvas;
