import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import type { Monument } from '../data/monuments';
import { MONUMENTS } from '../data/monuments';
import { MonumentInfo } from './MonumentInfo';
import '../styles/archive.css';

const HeritageMap = lazy(() =>
  import('./HeritageMap').then(({ HeritageMap: Map }) => ({ default: Map }))
);
const MonumentViewer3D = lazy(() =>
  import('./MonumentViewer3D').then(({ MonumentViewer3D: Viewer }) => ({ default: Viewer }))
);

interface ArchiveOfMonumentsProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewState = 'map' | 'transitioning' | '3d';

export const ArchiveOfMonuments: React.FC<ArchiveOfMonumentsProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(MONUMENTS[0]);
  const [viewState, setViewState] = useState<ViewState>('map');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    setViewState('map');
    onClose();
  }, [onClose]);

  // Keyboard accessibility: ESC key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewState === '3d') {
          setViewState('map');
        } else if (isOpen) {
          handleClose();
        }
      }
    },
    [viewState, isOpen, handleClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Cinematic Transition: Map -> 3D
  const handleExplore3D = (monument: Monument) => {
    setSelectedMonument(monument);
    setIsTransitioning(true);
    setViewState('transitioning');

    // 800ms cinematic transition sequence
    setTimeout(() => {
      setViewState('3d');
      setIsTransitioning(false);
    }, 800);
  };

  const handleBackToMap = () => {
    setViewState('map');
  };

  if (!isOpen) return null;

  return (
    <div
      className={`archive-fullscreen-container is-active`}
      role="dialog"
      aria-modal="true"
      aria-label="The Archive of Monuments"
    >
      {/* Top Header Bar */}
      <header className="archive-top-bar">
        <div className="archive-title-group">
          <span className="archive-tag">CHAPTER 01 MODULE</span>
          <h1 className="archive-heading">THE ARCHIVE OF MONUMENTS</h1>
          <p className="archive-subheading">
            Explore India's architectural heritage through geography, history and interactive 3D reconstruction.
          </p>
        </div>

        <div className="archive-top-actions">
          <button
            className="archive-close-btn"
            onClick={handleClose}
            aria-label="Close Archive of Monuments"
            title="Close (Esc)"
          >
            ×
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main
        className="archive-workspace"
        style={{
          filter: isTransitioning ? 'brightness(0.3) blur(4px)' : 'none',
          transition: 'filter 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Left/Main Heritage OpenStreetMap */}
        <Suspense fallback={<div className="archive-loading" role="status">Loading the heritage map…</div>}>
          <HeritageMap
            selectedMonument={selectedMonument}
            onSelectMonument={(m) => setSelectedMonument(m)}
            onExplore3D={handleExplore3D}
          />
        </Suspense>

        {/* Right Selected Monument Information Overlay */}
        {selectedMonument && viewState !== '3d' && (
          <MonumentInfo
            monument={selectedMonument}
            onExplore3D={handleExplore3D}
          />
        )}
      </main>

      {/* 3D Monument Viewer Fullscreen Canvas */}
      {viewState === '3d' && selectedMonument && (
        <Suspense fallback={<div className="archive-loading" role="status">Loading the 3D monument…</div>}>
          <MonumentViewer3D
            monument={selectedMonument}
            onBack={handleBackToMap}
          />
        </Suspense>
      )}
    </div>
  );
};
