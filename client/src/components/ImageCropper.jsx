import { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspectRatio = 1 }) => {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    aspect: aspectRatio,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;

    const cropWidth = Math.min(80, (height / width) * 100 * aspectRatio);
    const cropHeight = cropWidth / aspectRatio;

    const newCrop = {
      unit: '%',
      width: cropWidth,
      height: cropHeight,
      x: (100 - cropWidth) / 2,
      y: (100 - cropHeight) / 2,
    };

    setCrop(newCrop);

    // Also set completedCrop with pixel values so Apply works immediately
    const pixelCrop = {
      x: (newCrop.x / 100) * width,
      y: (newCrop.y / 100) * height,
      width: (newCrop.width / 100) * width,
      height: (newCrop.height / 100) * height,
      unit: 'px',
    };
    setCompletedCrop(pixelCrop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async () => {
    const image = imgRef.current;

    if (!image) {
      console.error('No image reference found');
      return null;
    }

    // If no completedCrop, use the current crop state
    const cropToUse = completedCrop || crop;

    if (!cropToUse || !cropToUse.width || !cropToUse.height) {
      console.error('No valid crop data found');
      return null;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Convert percentage crop to pixels if needed
    let cropX, cropY, cropWidth, cropHeight;

    if (cropToUse.unit === '%') {
      cropX = (cropToUse.x / 100) * image.width * scaleX;
      cropY = (cropToUse.y / 100) * image.height * scaleY;
      cropWidth = (cropToUse.width / 100) * image.width * scaleX;
      cropHeight = (cropToUse.height / 100) * image.height * scaleY;
    } else {
      cropX = cropToUse.x * scaleX;
      cropY = cropToUse.y * scaleY;
      cropWidth = cropToUse.width * scaleX;
      cropHeight = cropToUse.height * scaleY;
    }

    // Set canvas size to desired output size (max 500px for profile pictures)
    const outputSize = Math.min(500, cropWidth);
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.imageSmoothingQuality = 'high';

    // Handle rotation
    const TO_RADIANS = Math.PI / 180;

    if (rotation !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotation * TO_RADIANS);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    if (rotation !== 0) {
      ctx.restore();
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  }, [completedCrop, crop, rotation, scale]);

  const handleCropComplete = async () => {
    try {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      } else {
        console.error('Failed to create cropped image');
        alert('Failed to crop image. Please try again.');
      }
    } catch (error) {
      console.error('Error during crop:', error);
      alert('Error cropping image. Please try again.');
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Crop Profile Picture</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-4 bg-gray-100">
          <div className="max-h-[50vh] overflow-auto flex items-center justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  maxHeight: '50vh',
                  maxWidth: '100%',
                }}
                className="transition-transform duration-200"
              />
            </ReactCrop>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-500 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={handleRotate}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="px-4 pb-4 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            Drag to reposition. Use controls to zoom and rotate.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
