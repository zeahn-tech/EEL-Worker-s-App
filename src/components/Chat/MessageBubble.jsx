import React from 'react';
import { 
  FileText, 
  Download, 
  MapPin, 
  ExternalLink, 
  CheckCheck, 
  Check, 
  Image as ImageIcon 
} from 'lucide-react';

export const MessageBubble = ({ message, isMe, onOpenLightbox }) => {
  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isMe ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
      maxWidth: '100%'
    }}>
      {/* Sender Name for incoming messages */}
      {!isMe && (
        <span style={{ 
          fontSize: '11px', 
          color: 'var(--amber-primary)', 
          fontWeight: 600, 
          marginBottom: '4px',
          paddingLeft: '4px'
        }}>
          {message.senderName}
        </span>
      )}

      {/* Bubble Container */}
      <div style={{
        maxWidth: '75%',
        background: isMe ? 'var(--amber-primary)' : 'var(--bg-secondary)',
        color: isMe ? 'var(--navy-dark)' : 'var(--text-main)',
        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
        padding: '12px 16px',
        boxShadow: isMe ? '0 4px 14px rgba(245, 158, 11, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
        border: isMe ? 'none' : '1px solid var(--border-subtle)',
        position: 'relative'
      }}>
        {/* TEXT MESSAGE */}
        {message.type === 'text' && (
          <p style={{ 
            fontSize: '14px', 
            lineHeight: 1.5, 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            fontWeight: isMe ? 500 : 400
          }}>
            {message.content}
          </p>
        )}

        {/* FILE ATTACHMENT MESSAGE */}
        {message.type === 'file' && message.fileData && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isMe ? 'rgba(15, 23, 42, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              border: isMe ? '1px solid rgba(15, 23, 42, 0.2)' : '1px solid var(--border-amber)',
              borderRadius: '10px',
              padding: '10px 14px'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: isMe ? 'var(--navy-dark)' : 'var(--amber-light)',
                color: isMe ? 'var(--amber-primary)' : 'var(--amber-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={20} />
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  whiteSpace: 'nowrap', 
                  textOverflow: 'ellipsis', 
                  overflow: 'hidden',
                  color: isMe ? 'var(--navy-dark)' : 'var(--text-main)'
                }}>
                  {message.fileData.fileName}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>
                  {message.fileData.fileSize}
                </div>
              </div>

              <a
                href={message.fileData.fileUrl}
                download={message.fileData.fileName}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isMe ? 'var(--navy-dark)' : 'var(--amber-primary)',
                  color: isMe ? 'var(--amber-primary)' : 'var(--navy-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
                title="Download Attachment"
              >
                <Download size={16} />
              </a>
            </div>
            {message.content && message.content !== `Attached File: ${message.fileData.fileName}` && (
              <p style={{ marginTop: '8px', fontSize: '13px' }}>{message.content}</p>
            )}
          </div>
        )}

        {/* IMAGE ATTACHMENT MESSAGE */}
        {message.type === 'image' && message.imageData && (
          <div>
            <div 
              onClick={() => onOpenLightbox(message.imageData.imageUrl, message.imageData.fileName)}
              style={{
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                maxHeight: '220px',
                background: '#000'
              }}
            >
              <img 
                src={message.imageData.imageUrl} 
                alt="Shared cargo photo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
              />
              <div style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                background: 'rgba(15, 23, 42, 0.75)',
                color: 'white',
                borderRadius: 'full',
                padding: '4px 8px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ImageIcon size={12} />
                <span>Click to expand</span>
              </div>
            </div>
            {message.content && message.content !== 'Shared an image' && (
              <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 500 }}>{message.content}</p>
            )}
          </div>
        )}

        {/* LOCATION MESSAGE */}
        {message.type === 'location' && message.location && (
          <div style={{ width: '280px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '6px',
              color: isMe ? 'var(--navy-dark)' : 'var(--amber-primary)'
            }}>
              <MapPin size={16} />
              <span>Live GPS Dispatch Pinpoint</span>
            </div>

            {/* Static Leaflet Embed */}
            <div style={{
              height: '130px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.2)',
              marginBottom: '8px',
              position: 'relative'
            }}>
              <iframe
                title="Message location map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${message.location.longitude - 0.005}%2C${message.location.latitude - 0.005}%2C${message.location.longitude + 0.005}%2C${message.location.latitude + 0.005}&layer=mapnik&marker=${message.location.latitude}%2C${message.location.longitude}`}
              />
            </div>

            <p style={{ fontSize: '12px', lineHeight: 1.3, marginBottom: '8px', fontWeight: 500 }}>
              {message.location.address}
            </p>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${message.location.latitude},${message.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                width: '100%',
                fontSize: '11px',
                padding: '6px 10px',
                background: isMe ? 'var(--navy-dark)' : 'var(--amber-primary)',
                color: isMe ? 'var(--amber-primary)' : 'var(--navy-dark)',
                fontWeight: 700
              }}
            >
              <ExternalLink size={12} />
              <span>Open in Google Maps</span>
            </a>
          </div>
        )}

        {/* Footer Meta (Timestamp + Status Ticks) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '4px',
          marginTop: '4px',
          fontSize: '10px',
          opacity: 0.8
        }}>
          <span>{formatTime(message.timestamp)}</span>
          {isMe && (
            <span>
              {message.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
