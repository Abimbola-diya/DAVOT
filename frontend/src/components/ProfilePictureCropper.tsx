import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { ZoomIn, ZoomOut, RotateCw, RefreshCw } from 'lucide-react';

interface ProfilePictureCropperProps {
  imageSrc: string;
  onCropSave: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export const ProfilePictureCropper: React.FC<ProfilePictureCropperProps> = ({
  imageSrc,
  onCropSave,
  onCancel,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Load image object
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw viewport preview onto canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Center of canvas
    ctx.translate(width / 2 + offset.x, height / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate scaling to cover crop box initially
    const minDim = Math.min(img.width, img.height);
    const scale = width / minDim;
    const drawW = img.width * scale;
    const drawH = img.height * scale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [imageLoaded, zoom, rotation, offset]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Handle Drag Start
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleSaveCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    // Create high-res target canvas for output avatar (300x300)
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 300;
    exportCanvas.height = 300;
    const ctx = exportCanvas.getContext('2d');

    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    // Center in export canvas
    ctx.translate(150 + (offset.x * (300 / 280)), 150 + (offset.y * (300 / 280)));
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const minDim = Math.min(img.width, img.height);
    const scale = 300 / minDim;
    const drawW = img.width * scale;
    const drawH = img.height * scale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Export as clean JPEG data url
    const croppedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.92);
    onCropSave(croppedDataUrl);
  };

  return (
    <div className="cropper-modal-overlay">
      <div className="cropper-card-container">
        {/* Header */}
        <div className="cropper-header">
          <button
            type="button"
            className="settings-back-btn"
            onClick={onCancel}
            aria-label="Cancel edit"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#1e293b" />
          </button>
          <h3 className="cropper-title">Crop Profile Picture</h3>
          <button
            type="button"
            className="cropper-reset-btn"
            onClick={handleReset}
            title="Reset position and zoom"
          >
            <RefreshCw size={16} color="#64748b" />
          </button>
        </div>

        {/* Viewport & Canvas Area */}
        <div className="cropper-viewport-wrap">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className={`cropper-canvas ${isDragging ? 'is-dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          {/* Circular Overlay Grid Frame */}
          <div className="cropper-circle-mask" />
          <div className="cropper-drag-hint">Drag image to adjust position</div>
        </div>

        {/* Controls Bar */}
        <div className="cropper-controls-panel">
          {/* Zoom Slider */}
          <div className="cropper-control-row">
            <button
              type="button"
              className="cropper-icon-btn"
              onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.1).toFixed(2)))}
              disabled={zoom <= 1}
              aria-label="Zoom out"
            >
              <ZoomOut size={18} color={zoom <= 1 ? '#cbd5e1' : '#475569'} />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="cropper-zoom-range"
              aria-label="Zoom slider"
            />
            <button
              type="button"
              className="cropper-icon-btn"
              onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.1).toFixed(2)))}
              disabled={zoom >= 3}
              aria-label="Zoom in"
            >
              <ZoomIn size={18} color={zoom >= 3 ? '#cbd5e1' : '#475569'} />
            </button>

            {/* Rotate Button */}
            <button
              type="button"
              className="cropper-icon-btn rotate-btn"
              onClick={handleRotate}
              title="Rotate 90°"
              aria-label="Rotate image"
            >
              <RotateCw size={18} color="#475569" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="cropper-actions-bar">
          <button type="button" className="davot-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="davot-submit-btn" onClick={handleSaveCrop}>
            <HugeiconsIcon icon={Tick02Icon} size={18} color="#ffffff" />
            <span>Save Picture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
