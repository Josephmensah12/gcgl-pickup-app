import React, { useState, useRef, useEffect } from 'react';
import { compressImage } from '../utils/helpers';
import './PhotoCapture.css';

export default function PhotoCapture({ photos = [], onChange, max = 3 }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const openCamera = async () => {
    setShowMenu(false);
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError('Unable to access camera.');
      setShowCamera(false);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const raw = canvas.toDataURL('image/jpeg', 0.8);
    const compressed = await compressImage(raw);
    onChange([...photos, compressed]);
    closeCamera();
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleGallery = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result);
      onChange([...photos, compressed]);
    };
    reader.readAsDataURL(file);
    setShowMenu(false);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    onChange(photos.filter((_, i) => i !== idx));
  };

  const canAdd = photos.length < max;

  return (
    <div className="photo-capture">
      <div className="photo-grid">
        {photos.map((p, idx) => (
          <div key={idx} className="photo-item">
            <img src={p} alt={`Item ${idx + 1}`} />
            <button className="photo-remove" onClick={() => removePhoto(idx)}>×</button>
          </div>
        ))}
        {canAdd && (
          <button className="photo-add-btn" onClick={() => setShowMenu(!showMenu)}>
            {photos.length === 0 ? '📷 Add Photo' : '+'}
          </button>
        )}
      </div>

      {cameraError && <div className="camera-error">{cameraError}</div>}

      {showMenu && (
        <div className="photo-menu">
          <button className="photo-menu-option" onClick={openCamera}>📸 Take Photo</button>
          <button className="photo-menu-option" onClick={() => { galleryRef.current.click(); setShowMenu(false); }}>🖼️ Choose from Gallery</button>
          <button className="photo-menu-cancel" onClick={() => setShowMenu(false)}>Cancel</button>
        </div>
      )}

      <input ref={galleryRef} type="file" accept="image/*" onChange={handleGallery} hidden />

      {showCamera && (
        <div className="camera-overlay">
          <div className="camera-viewfinder">
            <video ref={videoRef} autoPlay playsInline className="camera-video" />
            <div className="camera-controls">
              <button type="button" className="camera-cancel-btn" onClick={closeCamera}>Cancel</button>
              <button type="button" className="camera-capture-btn" onClick={capturePhoto}>
                <span className="capture-circle" />
              </button>
              <div className="camera-spacer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
