import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const FilePickerModal = ({ isOpen, onClose, onSendFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 25MB limit check
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds maximum limit of 25MB.');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('File size exceeds maximum limit of 25MB.');
        return;
      }
      setErrorMsg('');
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = {
        fileName: selectedFile.name,
        fileSize: formatBytes(selectedFile.size),
        fileType: selectedFile.type || 'application/octet-stream',
        fileUrl: event.target.result // Base64 dataURL for instant persistent offline storage
      };

      onSendFile(fileData);
      setIsUploading(false);
      setSelectedFile(null);
      onClose();
    };

    reader.readAsDataURL(selectedFile);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content amber-border" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--amber-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Attach Dispatch Document</h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Drop Zone */}
        <div style={{ padding: '20px' }}>
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-amber)',
              borderRadius: 'var(--radius-md)',
              padding: '30px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(15, 23, 42, 0.4)',
              transition: 'background 0.2s'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />

            <UploadCloud size={40} color="var(--amber-primary)" style={{ margin: '0 auto 12px' }} />
            
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Click or drag file to attach
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Supports PDF, DOCX, XLSX, ZIP, TXT (Max 25MB)
            </p>
          </div>

          {errorMsg && (
            <div style={{ marginTop: '12px', color: '#EF4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {selectedFile && (
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              background: 'var(--amber-light)',
              border: '1px solid var(--amber-primary)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="var(--amber-primary)" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {formatBytes(selectedFile.size)}
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!selectedFile || isUploading}>
            {isUploading ? 'Attaching...' : 'Send File'}
          </button>
        </div>
      </div>
    </div>
  );
};
