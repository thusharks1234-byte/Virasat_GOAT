import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Monument } from '../data/monuments';
import { MONUMENTS } from '../data/monuments';

interface HeritageMapProps {
  selectedMonument: Monument | null;
  onSelectMonument: (monument: Monument) => void;
  onExplore3D: (monument: Monument) => void;
}

const INDIA_CENTER: [number, number] = [22.5937, 78.9629];
const INDIA_ZOOM = 5;

export const HeritageMap: React.FC<HeritageMapProps> = ({
  selectedMonument,
  onSelectMonument,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const onSelectMonumentRef = useRef(onSelectMonument);
  useEffect(() => {
    onSelectMonumentRef.current = onSelectMonument;
  }, [onSelectMonument]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: INDIA_CENTER,
        zoom: INDIA_ZOOM,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: true,
      });

      // Add zoom control at bottom left
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      // OpenStreetMap standard tile layer
      const osmTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        className: 'dark-heritage-tiles',
        maxZoom: 19,
      });

      osmTileLayer.on('tileerror', () => {
        // Tile error fallback handling
      });

      osmTileLayer.addTo(map);
      mapInstanceRef.current = map;

      // Add Custom Markers
      MONUMENTS.forEach((monument) => {
        const customIcon = L.divIcon({
          className: 'heritage-custom-marker',
          html: `
            <div class="marker-pin-wrapper" id="marker-${monument.id}">
              <div class="marker-pulse-ring"></div>
              <div class="marker-head">
                <span class="marker-inner-icon">🏛</span>
              </div>
              <div class="marker-label-badge">${monument.name}</div>
            </div>
          `,
          iconSize: [40, 48],
          iconAnchor: [20, 48],
          tooltipAnchor: [0, -48],
        });

        const marker = L.marker([monument.latitude, monument.longitude], {
          icon: customIcon,
          riseOnHover: true,
        }).addTo(map);

        // Hover tooltip
        marker.bindTooltip(
          `<strong>${monument.name}</strong><br><span style="color: #ffaa33;">${monument.state}</span>`,
          {
            className: 'heritage-tooltip',
            direction: 'top',
            offset: [0, -42],
            opacity: 0.95,
          }
        );

        // Click handler
        marker.on('click', () => {
          onSelectMonumentRef.current(monument);
          map.flyTo([monument.latitude, monument.longitude], 12, {
            duration: 1.4,
            easeLinearity: 0.25,
          });
        });

        markersRef.current.set(monument.id, marker);
      });

      // Fix size after mount
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } catch (err: unknown) {
      console.error('Failed to initialize Leaflet Map:', err);
      setTimeout(() => {
        setMapError('Map temporarily unavailable. You can still explore the monument archive below.');
      }, 0);
    }

    const markers = markersRef.current;
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markers.clear();
      }
    };
  }, []);

  // Update active marker styling when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach((_marker, id) => {
      const isSelected = selectedMonument?.id === id;
      const el = document.getElementById(`marker-${id}`);
      if (el) {
        if (isSelected) {
          el.classList.add('is-selected');
        } else {
          el.classList.remove('is-selected');
        }
      }
    });

    if (selectedMonument) {
      mapInstanceRef.current.flyTo(
        [selectedMonument.latitude, selectedMonument.longitude],
        12,
        { duration: 1.2 }
      );
    }
  }, [selectedMonument]);

  const handleResetIndiaView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(INDIA_CENTER, INDIA_ZOOM, {
        duration: 1.2,
      });
    }
  };

  const handleSelectSearchResult = (monument: Monument) => {
    onSelectMonument(monument);
    setSearchQuery('');
    setIsSearchFocused(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([monument.latitude, monument.longitude], 12, {
        duration: 1.4,
      });
    }
  };

  const filteredMonuments = MONUMENTS.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.architecturalStyle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="archive-map-pane" role="region" aria-label="Interactive India Heritage Map">
      {/* Floating Search & Reset Controls */}
      <div className="map-floating-controls">
        <div className="archive-search-container">
          <span className="archive-search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="archive-search-input"
            placeholder="Search monuments or states..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            aria-label="Search monuments"
          />

          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="archive-search-dropdown" role="listbox">
              {filteredMonuments.length > 0 ? (
                filteredMonuments.map((m) => (
                  <button
                    key={m.id}
                    className="search-dropdown-item"
                    onClick={() => handleSelectSearchResult(m)}
                    role="option"
                    aria-selected={selectedMonument?.id === m.id}
                  >
                    <span className="search-dropdown-name">{m.name}</span>
                    <span className="search-dropdown-state">{m.state}</span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--vx-paper-muted)' }}>
                  No monuments found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="map-reset-btn"
          onClick={handleResetIndiaView}
          aria-label="Reset map to center of India"
        >
          <span aria-hidden="true">🇮🇳</span> Reset India View
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="leaflet-container" />

      {/* Fallback Display if Map fails */}
      {mapError && (
        <div className="viewer-status-banner">
          <div className="status-title">{mapError}</div>
          <p className="status-desc">Select a monument from the list to explore:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {MONUMENTS.map((m) => (
              <button
                key={m.id}
                className="viewer-back-btn"
                onClick={() => onSelectMonument(m)}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
