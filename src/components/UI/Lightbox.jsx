import React from 'react';
import { X, Download } from 'lucide-react';

export const Lightbox = ({ imageUrl, fileName, onClose }) => {
  if (!imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = fileName || 'eel-dispatch-photo.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="modal-overlay animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }} onClick={onClose}>
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: '12px', zIndex: 1010 }}>
        <button 
          onClick={handleDownload} 
          className="btn btn-primary"
          style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0 }}
          title="Download Image"
        >
          <Download size={20} />
        </button>
        <button 
          onClick={onClose} 
          className="btn btn-secondary"
          style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0 }}
          title="Close Lightbox"
        >
          <X size={20} />
        </button>
      </div>

      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img 
          src={imageUrl} 
          alt={fileName || 'Shared Dispatch Photo'} 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '80vh', 
            borderRadius: '12px', 
            objectFit: 'contain',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
            border: '1px solid rgba(245, 158, 11, 0.4)'
          }} 
        />
        {fileName && (
          <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
            {fileName}
          </p>
        )}
      </div>
    </div>
  );
};
