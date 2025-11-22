import { useRef } from 'react';
import './ControlPanel.css';

function ControlPanel({ 
  pixelSize, 
  rotation, 
  pixelShape,
  backgroundColor,
  blur,
  saturation,
  gridLines,
  gridColor,
  pixelSpacing,
  posterize,
  onPixelSizeChange, 
  onRotationChange, 
  onPixelShapeChange,
  onBackgroundColorChange,
  onBlurChange,
  onSaturationChange,
  onGridLinesChange,
  onGridColorChange,
  onPixelSpacingChange,
  onPosterizeChange,
  onRemoveImage, 
  onExport,
  image,
  hasImage
}) {
  const canvasRef = useRef(null);

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

  const drawPixelShape = (ctx, x, y, size, color, spacing = 0, showGrid = false, gridColorValue = '#000000', shapeRotation = 0) => {
    const effectiveSize = size - spacing;
    const offset = spacing / 2;
    const centerX = x + offset + effectiveSize / 2;
    const centerY = y + offset + effectiveSize / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((shapeRotation * Math.PI) / 180);
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
    
    if (showGrid) {
      ctx.strokeStyle = gridColorValue;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + offset, y + offset, effectiveSize, effectiveSize);
    }
    
    ctx.restore();
  };

  const handleExport = () => {
    if (!image) return;

    // Create a temporary canvas for export
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = image.width;
    canvas.height = image.height;

    // Fill background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, image.width, image.height);

    // If pixel size is 0, just draw the original image
    if (pixelSize === 0) {
      ctx.drawImage(image, 0, 0, image.width, image.height);
      
      // Export
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'superflat-image.jpg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95);
      return;
    }

    // Calculate scaled dimensions
    const scaledWidth = Math.ceil(image.width / pixelSize);
    const scaledHeight = Math.ceil(image.height / pixelSize);

    // Create offscreen canvas to get pixel colors
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = scaledWidth;
    offscreenCanvas.height = scaledHeight;
    const offscreenCtx = offscreenCanvas.getContext('2d');

    // Apply blur effect if needed
    if (blur > 0) {
      offscreenCtx.filter = `blur(${blur}px)`;
    }

    // Draw at reduced size
    offscreenCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    offscreenCtx.filter = 'none';

    // Get image data
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
          drawPixelShape(ctx, drawX, drawY, pixelSize, color, pixelSpacing, gridLines, gridColor, rotation);
        }
      }
    }

    // Export
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'superflat-image.jpg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="control-panel">
      <h3 className="panel-title">SuperFlat</h3>
      
      <div className="control-group">
        <label>
          <span>Pixel Size: {pixelSize}px</span>
          <input
            type="range"
            min="0"
            max="50"
            value={pixelSize}
            onChange={(e) => onPixelSizeChange(Number(e.target.value))}
            className="slider"
            disabled={!hasImage}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          <span>Rotation: {rotation}°</span>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => onRotationChange(Number(e.target.value))}
            className="slider"
            disabled={!hasImage}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          <span>Pixel Shape</span>
          <div className="shape-selector-grid">
            <button className={`shape-btn ${pixelShape === 'square' ? 'active' : ''}`} onClick={() => onPixelShapeChange('square')} title="Square" disabled={!hasImage}>⬛</button>
            <button className={`shape-btn ${pixelShape === 'circle' ? 'active' : ''}`} onClick={() => onPixelShapeChange('circle')} title="Circle" disabled={!hasImage}>⚫</button>
            <button className={`shape-btn ${pixelShape === 'hexagon' ? 'active' : ''}`} onClick={() => onPixelShapeChange('hexagon')} title="Hexagon" disabled={!hasImage}>⬢</button>
            <button className={`shape-btn ${pixelShape === 'rectangle' ? 'active' : ''}`} onClick={() => onPixelShapeChange('rectangle')} title="Rectangle" disabled={!hasImage}>▬</button>
            <button className={`shape-btn ${pixelShape === 'triangle' ? 'active' : ''}`} onClick={() => onPixelShapeChange('triangle')} title="Triangle" disabled={!hasImage}>▲</button>
            <button className={`shape-btn ${pixelShape === 'diamond' ? 'active' : ''}`} onClick={() => onPixelShapeChange('diamond')} title="Diamond" disabled={!hasImage}>◆</button>
            <button className={`shape-btn ${pixelShape === 'star' ? 'active' : ''}`} onClick={() => onPixelShapeChange('star')} title="Star" disabled={!hasImage}>★</button>
            <button className={`shape-btn ${pixelShape === 'plus' ? 'active' : ''}`} onClick={() => onPixelShapeChange('plus')} title="Plus" disabled={!hasImage}>+</button>
            <button className={`shape-btn ${pixelShape === 'cross' ? 'active' : ''}`} onClick={() => onPixelShapeChange('cross')} title="Cross" disabled={!hasImage}>✕</button>
            <button className={`shape-btn ${pixelShape === 'backslash' ? 'active' : ''}`} onClick={() => onPixelShapeChange('backslash')} title="Backslash" disabled={!hasImage}>\</button>
          </div>
        </label>
      </div>

      <div className="control-group">
        <label>
          <span>Background Color</span>
          <div className="color-picker-wrapper">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="color-picker"
            />
            <span className="color-value">{backgroundColor}</span>
          </div>
        </label>
      </div>

      <div className="control-group">
        <label>
          <span>Blur: {blur}px</span>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={blur}
            onChange={(e) => onBlurChange(Number(e.target.value))}
            className="slider"
            disabled={!hasImage}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          <span>Saturation: {saturation}%</span>
          <input
            type="range"
            min="0"
            max="200"
            value={saturation}
            onChange={(e) => onSaturationChange(Number(e.target.value))}
            className="slider"
            disabled={!hasImage}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          <span>Posterize: {posterize} levels</span>
          <input
            type="range"
            min="2"
            max="256"
            value={posterize}
            onChange={(e) => onPosterizeChange(Number(e.target.value))}
            className="slider"
            disabled={!hasImage}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          <span>Pixel Spacing: {pixelSpacing}px</span>
          <input
            type="range"
            min="0"
            max="10"
            value={pixelSpacing}
            onChange={(e) => onPixelSpacingChange(Number(e.target.value))}
            className="slider"
            disabled={!hasImage}
          />
        </label>
      </div>

      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={gridLines}
            onChange={(e) => onGridLinesChange(e.target.checked)}
            disabled={!hasImage}
          />
          <span>Show Grid Lines</span>
        </label>
      </div>

      {gridLines && (
        <div className="control-group">
          <label>
            <span>Grid Color</span>
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={gridColor}
                onChange={(e) => onGridColorChange(e.target.value)}
                className="color-picker"
                disabled={!hasImage}
              />
              <span className="color-value">{gridColor}</span>
            </div>
          </label>
        </div>
      )}

      <div className="control-buttons">
        <button onClick={handleExport} className="btn btn-primary" disabled={!hasImage}>
          💾 Export as JPG
        </button>
        <button onClick={onRemoveImage} className="btn btn-secondary" disabled={!hasImage}>
          🗑️ Remove Image
        </button>
      </div>
    </div>
  );
}

export default ControlPanel;
