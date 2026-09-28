import React from 'react';
import type { Monument } from '../data/monuments';

interface MonumentInfoProps {
  monument: Monument;
  onExplore3D: (monument: Monument) => void;
  onClose?: () => void;
}

export const MonumentInfo: React.FC<MonumentInfoProps> = ({
  monument,
  onExplore3D,
  onClose,
}) => {
  return (
    <aside className="monument-info-overlay" aria-label={`Information about ${monument.name}`}>
      <div className="info-scroll-body">
        {/* Hero Visual Banner */}
        <div className="monument-hero-media">
          <img
            src={`/${monument.imagePath}`}
            alt={monument.name}
            onError={(e) => {
              // Fallback to placeholder image if specific image path is missing
              const target = e.currentTarget;
              target.src = '/images/taj.png';
            }}
          />
          {monument.unescoYear && (
            <span className="unesco-badge">
              🏛 UNESCO {monument.unescoYear}
            </span>
          )}
        </div>

        {/* Title & Location Header */}
        <div className="info-header-block">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="info-location-tag">
              <span aria-hidden="true">📍</span> {monument.state}, India
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="archive-close-btn"
                style={{ width: '32px', height: '32px', fontSize: '18px' }}
                aria-label="Close monument details"
              >
                ×
              </button>
            )}
          </div>
          <h2 className="info-monument-title">{monument.name}</h2>
        </div>

        {/* Metadata Specification Grid */}
        <div className="meta-spec-grid">
          <div className="spec-item">
            <span className="spec-label">Historical Period</span>
            <span className="spec-value">{monument.historicalPeriod}</span>
          </div>

          <div className="spec-item">
            <span className="spec-label">Architectural Style</span>
            <span className="spec-value">{monument.architecturalStyle}</span>
          </div>

          {monument.patron && (
            <div className="spec-item">
              <span className="spec-label">Dynastic Patron</span>
              <span className="spec-value">{monument.patron}</span>
            </div>
          )}
        </div>

        {/* Short Description */}
        <div>
          <span className="spec-label" style={{ marginBottom: '6px' }}>Archival Overview</span>
          <p className="monument-desc-text">{monument.shortDescription}</p>
        </div>

        {/* Key Architectural Highlights */}
        {monument.keyFeatures && monument.keyFeatures.length > 0 && (
          <div>
            <span className="spec-label" style={{ marginBottom: '8px' }}>Architectural Marvels</span>
            <ul className="key-highlights-list">
              {monument.keyFeatures.map((feat, idx) => (
                <li key={idx}>{feat}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 360 Virtual Tour Direct Notice */}
        {monument.virtualTourUrl && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(212, 114, 44, 0.12)',
              border: '1px solid rgba(212, 114, 44, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vx-gold-bright)', fontWeight: 600, fontSize: '0.85rem' }}>
              <span>🌐</span> 360° Virtual Tour Available
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--vx-paper-muted)', lineHeight: '1.4' }}>
              Experience high-resolution spherical 360° views and panoramic walk-throughs of this architectural marvel.
            </p>
          </div>
        )}
      </div>

      {/* Explore in 3D Action Footer */}
      <div className="info-footer-action" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className="explore-3d-btn"
          onClick={() => onExplore3D(monument)}
          aria-label={monument.virtualTourUrl ? `Explore 360 virtual tour of ${monument.name}` : `Explore 3D reconstruction of ${monument.name}`}
        >
          <span>{monument.virtualTourUrl ? 'EXPLORE 360° VIRTUAL TOUR' : 'EXPLORE IN 3D'}</span>
          <span aria-hidden="true">{monument.virtualTourUrl ? '🌐' : '→'}</span>
        </button>

        {monument.virtualTourUrl && (
          <a
            href={monument.virtualTourUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="explore-3d-btn"
            style={{
              background: 'rgba(253, 241, 225, 0.08)',
              border: '1px solid rgba(253, 241, 225, 0.2)',
              color: 'var(--vx-paper)',
              textDecoration: 'none',
              fontSize: '0.82rem',
              padding: '10px 16px',
              justifyContent: 'center',
            }}
            aria-label={`Open 360 virtual tour of ${monument.name} directly in new tab`}
          >
            <span>OPEN 360° TOUR IN NEW TAB</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </aside>
  );
};
