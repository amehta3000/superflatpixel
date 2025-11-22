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
        <button onClick={onExport} className="btn btn-primary" disabled={!hasImage}>
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
