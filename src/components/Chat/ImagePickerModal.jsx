import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, UploadCloud, AlertCircle } from 'lucide-react';

export const ImagePickerModal = ({ isOpen, onClose, onSendImage }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const imageInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Image size exceeds maximum limit of 15MB.');
      return;
    }

    setErrorMsg('');
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!previewUrl) return;

    onSendImage({
      imageUrl: previewUrl,
      fileName: selectedImage ? selectedImage.name : 'photo.jpg'
    }, caption);

    // Reset modal state
    setSelectedImage(null);
    setPreviewUrl('');
    setCaption('');
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content amber-border" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ImageIcon size={20} color="var(--amber-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Share Dispatch Photo</h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px' }}>
          {!previewUrl ? (
            <div 
              onClick={() => imageInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-amber)',
                borderRadius: 'var(--radius-md)',
                padding: '35px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(15, 23, 42, 0.4)'
              }}
            >
              <input 
                type="file" 
                ref={imageInputRef} 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
              <UploadCloud size={44} color="var(--amber-primary)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Select Cargo or Dispatch Photo
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                PNG, JPG, WEBP or GIF (Max 15MB)
              </p>
            </div>
          ) : (
            <div>
              <div style={{
                position: 'relative',
                maxHeight: '260px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-amber)',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ maxHeight: '250px', width: '100%', objectFit: 'contain' }} 
                />
                <button 
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedImage(null);
                  }}
                  className="btn btn-secondary"
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    padding: 0
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Photo Caption / Dispatch Notes (Optional)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Container bill of lading inspection completed at gate 4..." 
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ marginTop: '12px', color: '#EF4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!previewUrl}>
            Send Image
          </button>
        </div>
      </div>
    </div>
  );
};
