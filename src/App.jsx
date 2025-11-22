import { useState, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import PixelCanvas from './components/PixelCanvas';
import ControlPanel from './components/ControlPanel';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [pixelSize, setPixelSize] = useState(20);
  const [rotation, setRotation] = useState(0);
  const [pixelShape, setPixelShape] = useState('square');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [blur, setBlur] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [gridLines, setGridLines] = useState(false);
  const [gridColor, setGridColor] = useState('#000000');
  const [pixelSpacing, setPixelSpacing] = useState(0);
  const [posterize, setPosterize] = useState(256);
  const canvasRef = useRef(null);

  const handleImageUpload = (uploadedImage) => {
    setImage(uploadedImage);
  };

  const handleImageRemove = () => {
    setImage(null);
  };

  const handleExport = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'superflat-image.jpg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="app">
      <div className="app-content">
        <div className="canvas-area">
          {!image ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <PixelCanvas 
              ref={canvasRef}
              image={image} 
              pixelSize={pixelSize} 
              rotation={rotation}
              pixelShape={pixelShape}
              backgroundColor={backgroundColor}
              blur={blur}
              saturation={saturation}
              gridLines={gridLines}
              gridColor={gridColor}
              pixelSpacing={pixelSpacing}
              posterize={posterize}
            />
          )}
        </div>
        
        <ControlPanel
          pixelSize={pixelSize}
          rotation={rotation}
          pixelShape={pixelShape}
          backgroundColor={backgroundColor}
          blur={blur}
          saturation={saturation}
          gridLines={gridLines}
          gridColor={gridColor}
          pixelSpacing={pixelSpacing}
          posterize={posterize}
          onPixelSizeChange={setPixelSize}
          onRotationChange={setRotation}
          onPixelShapeChange={setPixelShape}
          onBackgroundColorChange={setBackgroundColor}
          onBlurChange={setBlur}
          onSaturationChange={setSaturation}
          onGridLinesChange={setGridLines}
          onGridColorChange={setGridColor}
          onPixelSpacingChange={setPixelSpacing}
          onPosterizeChange={setPosterize}
          onRemoveImage={handleImageRemove}
          onExport={handleExport}
          image={image}
          hasImage={!!image}
        />
      </div>
    </div>
  );
}

export default App;
