import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './PixelCanvas.css';

const PixelCanvas = forwardRef(({ 
  image, 
  pixelSize, 
  rotation, 
  pixelShape, 
  backgroundColor,
  blur,
  saturation,
  gridLines,
  gridColor,
  pixelSpacing,
  posterize
}, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => canvasRef.current);

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
      b: Math.max(0, Math.min(255, gray + factor * (b - gray)))
    };
  };

  const drawPixelShape = (ctx, x, y, size, color, spacing) => {
    const effectiveSize = size - spacing;
    const offset = spacing / 2;
    const centerX = x + offset + effectiveSize / 2;
    const centerY = y + offset + effectiveSize / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
    
    ctx.fillStyle = color;
    
    switch(pixelShape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, effectiveSize/2, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 'hexagon':
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const hx = centerX + (effectiveSize/2) * Math.cos(angle);
          const hy = centerY + (effectiveSize/2) * Math.sin(angle);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        break;
      
      case 'rectangle':
        ctx.fillRect(x + offset, y + offset, effectiveSize * 1.5, effectiveSize * 0.75);
        break;
      
      case 'vertical-line':
        ctx.fillRect(centerX - 1, y + offset, 2, effectiveSize);
        break;
      
      case 'horizontal-line':
        ctx.fillRect(x + offset, centerY - 1, effectiveSize, 2);
        break;
      
      case 'slash':
        ctx.beginPath();
        ctx.moveTo(x + offset, y + offset + effectiveSize);
        ctx.lineTo(x + offset + effectiveSize, y + offset);
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
      
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(centerX, y + offset);
        ctx.lineTo(x + offset + effectiveSize, y + offset + effectiveSize);
        ctx.lineTo(x + offset, y + offset + effectiveSize);
        ctx.closePath();
        ctx.fill();
        break;
      
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(centerX, y + offset);
        ctx.lineTo(x + offset + effectiveSize, centerY);
        ctx.lineTo(centerX, y + offset + effectiveSize);
        ctx.lineTo(x + offset, centerY);
        ctx.closePath();
        ctx.fill();
        break;
      
      case 'star':
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const innerAngle = outerAngle + Math.PI / 5;
          const outerX = centerX + Math.cos(outerAngle) * effectiveSize / 2;
          const outerY = centerY + Math.sin(outerAngle) * effectiveSize / 2;
          const innerX = centerX + Math.cos(innerAngle) * effectiveSize / 4;
          const innerY = centerY + Math.sin(innerAngle) * effectiveSize / 4;
          if (i === 0) ctx.moveTo(outerX, outerY);
          else ctx.lineTo(outerX, outerY);
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        break;
      
      case 'plus':
        const thickness = effectiveSize * 0.3;
        ctx.fillRect(centerX - thickness/2, y + offset, thickness, effectiveSize);
        ctx.fillRect(x + offset, centerY - thickness/2, effectiveSize, thickness);
        break;
      
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
      
      case 'square':
      default:
        ctx.fillRect(x + offset, y + offset, effectiveSize, effectiveSize);
        break;
    }
    
    // Draw grid lines if enabled
    if (gridLines) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + offset, y + offset, effectiveSize, effectiveSize);
    }
    
    ctx.restore();
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Calculate dimensions to fit the container while maintaining aspect ratio
    const container = containerRef.current;
    const maxWidth = container.clientWidth - 40;
    const maxHeight = window.innerHeight - 300;

    let width = image.width;
    let height = image.height;

    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;

    // Clear canvas and fill with background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // If pixel size is 0, just draw the original image
    if (pixelSize === 0) {
      ctx.drawImage(image, 0, 0, width, height);
      return;
    }

    // Draw image scaled down
    const scaledWidth = Math.ceil(width / pixelSize);
    const scaledHeight = Math.ceil(height / pixelSize);

    // Create an offscreen canvas to get pixel colors
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = scaledWidth;
    offscreenCanvas.height = scaledHeight;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    
    // Apply blur effect if needed
    if (blur > 0) {
      offscreenCtx.filter = `blur(${blur}px)`;
    }
    
    // Draw image at reduced size
    offscreenCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    offscreenCtx.filter = 'none';

    // Get image data to extract pixel colors
    const imageData = offscreenCtx.getImageData(0, 0, scaledWidth, scaledHeight);
    const pixels = imageData.data;

    // Draw pixels with selected shape
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const index = (y * scaledWidth + x) * 4;
        let r = pixels[index];
        let g = pixels[index + 1];
        let b = pixels[index + 2];
        const a = pixels[index + 3] / 255;
        
        // Apply saturation
        if (saturation !== 100) {
          const saturated = applySaturation(r, g, b, saturation);
          r = saturated.r;
          g = saturated.g;
          b = saturated.b;
        }
        
        // Apply posterize
        if (posterize < 256) {
          r = applyPosterize(r, posterize);
          g = applyPosterize(g, posterize);
          b = applyPosterize(b, posterize);
        }
        
        if (a > 0) {
          const color = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
          const drawX = x * pixelSize;
          const drawY = y * pixelSize;
          drawPixelShape(ctx, drawX, drawY, pixelSize, color, pixelSpacing);
        }
      }
    }

  }, [image, pixelSize, rotation, pixelShape, backgroundColor, blur, saturation, gridLines, gridColor, pixelSpacing, posterize]);

  return (
    <div ref={containerRef} className="pixel-canvas-container">
      <canvas ref={canvasRef} className="pixel-canvas" />
    </div>
  );
});

PixelCanvas.displayName = 'PixelCanvas';

export default PixelCanvas;
