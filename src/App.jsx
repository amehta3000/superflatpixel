import { useState, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import PixelCanvas from './components/PixelCanvas';
import WebcamCanvas from './components/WebcamCanvas';
import ControlPanel from './components/ControlPanel';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [webcamMode, setWebcamMode] = useState(false);
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
    setWebcamMode(false);
  };

  const handleImageRemove = () => setImage(null);
  const handleWebcamStart = () => setWebcamMode(true);
  const handleWebcamStop = () => setWebcamMode(false);

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

  const renderProps = {
    pixelSize, rotation, pixelShape, backgroundColor,
    blur, saturation, gridLines, gridColor, pixelSpacing, posterize,
  };

  const isActive = webcamMode || !!image;

  return (
    <div className="app">
      <div className="app-content">
        <div className="canvas-area">
          {webcamMode ? (
            <WebcamCanvas ref={canvasRef} {...renderProps} />
          ) : image ? (
            <PixelCanvas ref={canvasRef} image={image} {...renderProps} />
          ) : (
            <ImageUploader onImageUpload={handleImageUpload} onWebcamStart={handleWebcamStart} />
          )}
        </div>

        <ControlPanel
          {...renderProps}
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
          onWebcamStop={handleWebcamStop}
          onExport={handleExport}
          image={image}
          hasImage={isActive}
          webcamMode={webcamMode}
        />
      </div>
    </div>
  );
}

export default App;
