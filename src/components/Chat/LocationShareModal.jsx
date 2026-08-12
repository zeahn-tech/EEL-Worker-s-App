import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Compass, AlertCircle, RefreshCw } from 'lucide-react';

export const LocationShareModal = ({ isOpen, onClose, onSendLocation }) => {
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default Freeport Monrovia GPS fallback if geolocation permission is denied
  const DEFAULT_MONROVIA_LOCATION = {
    latitude: 6.3156,
    longitude: -10.8074,
    address: 'Monrovia Freeport Port Terminal, Bushrod Island, Liberia',
    accuracy: 15
  };

  useEffect(() => {
    if (isOpen && !coords) {
      fetchCurrentLocation();
    }
  }, [isOpen]);

  const fetchCurrentLocation = () => {
    setLoadingLoc(true);
    setErrorMsg('');

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Using Monrovia Freeport depot coordinates.');
      setCoords(DEFAULT_MONROVIA_LOCATION);
      setAddress(DEFAULT_MONROVIA_LOCATION.address);
      setLoadingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 10);

        setCoords({
          latitude: lat,
          longitude: lng,
          accuracy
        });

        // Reverse geocoding lookup via OpenStreetMap Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.display_name) {
              setAddress(data.display_name);
            } else {
              setAddress(`GPS Pinpoint (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
            }
          })
          .catch(() => {
            setAddress(`GPS Dispatch Pinpoint (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
          })
          .finally(() => setLoadingLoc(false));
      },
      (err) => {
        console.warn('Geolocation warning:', err.message);
        setErrorMsg('Location permission restricted. Using EEL Monrovia Freeport Terminal default location.');
        setCoords(DEFAULT_MONROVIA_LOCATION);
        setAddress(DEFAULT_MONROVIA_LOCATION.address);
        setLoadingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = () => {
    if (!coords) return;

    onSendLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy || 10,
      address: address.trim() || `GPS Coordinates (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content amber-border" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={20} color="var(--amber-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Share Live Dispatch Location</h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Location Content */}
        <div style={{ padding: '20px' }}>
          {loadingLoc ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <RefreshCw size={36} color="var(--amber-primary)" className="glow-amber" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>Acquiring High-Precision GPS Coordinates...</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Communicating with device location sensors</p>
            </div>
          ) : (
            <div>
              {/* Map Preview Iframe Embed */}
              <div style={{
                height: '200px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-amber)',
                marginBottom: '16px',
                position: 'relative'
              }}>
                <iframe
                  title="Live Location Map Preview"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${(coords?.longitude || -10.8074) - 0.01}%2C${(coords?.latitude || 6.3156) - 0.01}%2C${(coords?.longitude || -10.8074) + 0.01}%2C${(coords?.latitude || 6.3156) + 0.01}&layer=mapnik&marker=${coords?.latitude || 6.3156}%2C${coords?.longitude || -10.8074}`}
                />
              </div>

              {/* Coordinates Badge */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--amber-primary)', fontWeight: 600 }}>
                    <Compass size={14} />
                    <span>GPS Telemetry</span>
                  </div>
                  <button onClick={fetchCurrentLocation} style={{ background: 'none', border: 'none', color: 'var(--amber-primary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={12} />
                    Recalibrate
                  </button>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Lat: {coords?.latitude.toFixed(6)}°, Lng: {coords?.longitude.toFixed(6)}°
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Precision Radius: ~{coords?.accuracy || 10} meters
                </div>
              </div>

              {/* Location Description Input */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Location Landmark / Dispatch Address
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. EEL Freeport Container Yard #2..."
                />
              </div>

              {errorMsg && (
                <div style={{ marginTop: '12px', color: '#F59E0B', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loadingLoc}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!coords || loadingLoc}>
            <Navigation size={16} />
            <span>Share Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
