import React from 'react';
import { Paperclip, Image as ImageIcon, MapPin, Mic, X } from 'lucide-react';

// Small popup triggered by the composer's "+" button. Keeps the four attachment
// actions (document, image, location, voice note) out of the input bar itself so the
// message field gets its full width back instead of squeezing next to four separate
// icon buttons.
export const AttachmentMenu = ({ isOpen, onClose, onFile, onImage, onLocation, onVoice, voiceDisabled }) => {
  if (!isOpen) return null;

  const options = [
    { key: 'file', label: 'Document', icon: Paperclip, onClick: onFile },
    { key: 'image', label: 'Image', icon: ImageIcon, onClick: onImage },
    { key: 'location', label: 'Location', icon: MapPin, onClick: onLocation },
    { key: 'voice', label: 'Voice Note', icon: Mic, onClick: onVoice, disabled: voiceDisabled }
  ];

  const handlePick = (opt) => {
    if (opt.disabled) return;
    onClose();
    opt.onClick();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content amber-border" onClick={e => e.stopPropagation()} style={{ maxWidth: 340 }}>
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
        }}>
          <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>
            Attach
          </span>
          <button className="btn btn-secondary btn-icon" onClick={onClose}
            style={{ width: 30, height: 30, minHeight: 30 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {options.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => handlePick(opt)}
                disabled={opt.disabled}
                title={opt.disabled ? 'Select a chat first' : opt.label}
                className="btn btn-secondary"
                style={{
                  flexDirection: 'column', gap: 8, padding: '18px 10px', minHeight: 88,
                  opacity: opt.disabled ? 0.5 : 1, cursor: opt.disabled ? 'not-allowed' : 'pointer'
                }}
              >
                <Icon size={22} color="var(--amber-primary)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
