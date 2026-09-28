import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Monument } from '../data/monuments';

interface MonumentViewer3DProps {
  monument: Monument;
  onBack: () => void;
}

export const MonumentViewer3D: React.FC<MonumentViewer3DProps> = ({
  monument,
  onBack,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'fallback'>('loading');
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [activeTimelineTab, setActiveTimelineTab] = useState<number>(1);

  const [viewMode, setViewMode] = useState<'360' | '3d'>(monument.virtualTourUrl ? '360' : '3d');
  const [prevMonumentId, setPrevMonumentId] = useState(monument.id);
  if (monument.id !== prevMonumentId) {
    setPrevMonumentId(monument.id);
    setViewMode(monument.virtualTourUrl ? '360' : '3d');
  }

  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const initialCameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.5, 6.5));
  const isAutoRotateRef = useRef(isAutoRotate);
  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  useEffect(() => {
    const container = containerRef.current;
    if (viewMode !== '3d' || !container) return;

    let isMounted = true;
    let animationFrameId: number;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a100f);
    scene.fog = new THREE.FogExp2(0x0a100f, 0.04);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.copy(initialCameraPosRef.current);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below ground
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.autoRotate = isAutoRotateRef.current;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    // 5. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffecd2, 1.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x0b1110, 0.9);
    scene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff5ea, 2.8);
    dirLight1.position.set(8, 14, 10);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd4722c, 1.6);
    dirLight2.position.set(-8, 6, -6);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffaa33, 2.5, 30);
    pointLight.position.set(0, 6, 0);
    scene.add(pointLight);

    // 6. Ground Pedestal / Heritage Grid
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0e1715,
      roughness: 0.85,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle decorative concentric heritage rings on ground
    const ringGeo = new THREE.RingGeometry(2.8, 2.85, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4722c, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    const outerRingGeo = new THREE.RingGeometry(5.2, 5.25, 64);
    const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.01;
    scene.add(outerRing);

    // 7. Group for Monument Model
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Helper: Create Gorgeous Procedural Architectural Reconstruction (when GLB is not present)
    const createProceduralPlaceholder = () => {
      const placeholderGroup = new THREE.Group();

      // Multi-tiered stepped temple plinth (Adhishthana)
      const base1 = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.4, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x8b6540, roughness: 0.7, metalness: 0.15 })
      );
      base1.position.y = 0.2;
      placeholderGroup.add(base1);

      const base2 = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.35, 3.6),
        new THREE.MeshStandardMaterial({ color: 0xa67c52, roughness: 0.65, metalness: 0.2 })
      );
      base2.position.y = 0.55;
      placeholderGroup.add(base2);

      // Sanctuary / Mandapa pillars
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0xd49b6a, roughness: 0.5, metalness: 0.3 });
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.0, 16);

      const pillarPositions = [
        [-1.4, 1.6, -1.4], [1.4, 1.6, -1.4],
        [-1.4, 1.6, 1.4], [1.4, 1.6, 1.4],
        [0, 1.6, -1.4], [0, 1.6, 1.4],
        [-1.4, 1.6, 0], [1.4, 1.6, 0]
      ];

      pillarPositions.forEach(([x, y, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, y, z);
        pillar.castShadow = true;
        placeholderGroup.add(pillar);
      });

      // Sanctum Wall / Inner Core
      const coreGeo = new THREE.BoxGeometry(2.2, 2.0, 2.2);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xc28d58,
        roughness: 0.6,
        metalness: 0.2,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 1.6;
      core.castShadow = true;
      placeholderGroup.add(core);

      // Superstructure / Tiered Shikhara Tower
      const tiers = 6;
      for (let i = 0; i < tiers; i++) {
        const factor = 1 - (i / tiers) * 0.75;
        const tierGeo = new THREE.BoxGeometry(2.4 * factor, 0.35, 2.4 * factor);
        const tierMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xb8834f : 0xdba26f,
          roughness: 0.6,
          metalness: 0.25,
        });
        const tierMesh = new THREE.Mesh(tierGeo, tierMat);
        tierMesh.position.y = 2.65 + i * 0.35;
        tierMesh.castShadow = true;
        placeholderGroup.add(tierMesh);
      }

      // Kalasha / Finial Crown at Apex
      const amalakaGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.25, 24);
      const amalakaMat = new THREE.MeshStandardMaterial({ color: 0xffaa33, metalness: 0.6, roughness: 0.3 });
      const amalaka = new THREE.Mesh(amalakaGeo, amalakaMat);
      amalaka.position.y = 4.85;
      placeholderGroup.add(amalaka);

      const kalashaGeo = new THREE.ConeGeometry(0.28, 0.7, 16);
      const kalasha = new THREE.Mesh(kalashaGeo, amalakaMat);
      kalasha.position.y = 5.3;
      placeholderGroup.add(kalasha);

      // Holographic Archival Telemetry Rings
      const holoRingMat = new THREE.MeshBasicMaterial({
        color: 0xffaa33,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const holoSphere = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 12), holoRingMat);
      holoSphere.position.y = 2.5;
      placeholderGroup.add(holoSphere);

      return placeholderGroup;
    };

    // 8. Load GLTF / GLB model with graceful fallback
    const loader = new GLTFLoader();
    const modelUrl = `/${monument.modelPath}`;

    setLoadingState('loading');

    loader.load(
      modelUrl,
      (gltf) => {
        if (!isMounted) return;
        const loadedModel = gltf.scene;

        // Calculate bounding box and center
        const box = new THREE.Box3().setFromObject(loadedModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4.0 / (maxDim || 1);
        loadedModel.scale.set(scale, scale, scale);

        // Center on base
        loadedModel.position.x = -center.x * scale;
        loadedModel.position.y = -box.min.y * scale;
        loadedModel.position.z = -center.z * scale;

        // Enhance materials
        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.max(mat.roughness, 0.4);
            }
          }
        });

        // Cinematic Entrance animation (scale from 0.85 -> 1.0)
        modelGroup.scale.set(0.85, 0.85, 0.85);
        let startScale = 0.85;
        const animateScale = () => {
          if (startScale < 1.0) {
            startScale += 0.015;
            modelGroup.scale.set(startScale, startScale, startScale);
            requestAnimationFrame(animateScale);
          }
        };
        animateScale();

        modelGroup.add(loadedModel);
        setLoadingState('loaded');
      },
      undefined,
      (err) => {
        if (!isMounted) return;
        console.warn(`GLB model not found at ${modelUrl}, loading architectural archival twin:`, err);
        const placeholder = createProceduralPlaceholder();

        // Scale animation
        placeholder.scale.set(0.85, 0.85, 0.85);
        let startScale = 0.85;
        const animateScale = () => {
          if (startScale < 1.0) {
            startScale += 0.015;
            placeholder.scale.set(startScale, startScale, startScale);
            requestAnimationFrame(animateScale);
          }
        };
        animateScale();

        modelGroup.add(placeholder);
        setLoadingState('fallback');
      }
    );

    // 9. Render Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Subtle float animation for ground rings
      ring.rotation.z += delta * 0.15;
      outerRing.rotation.z -= delta * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    // 10. Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 11. Cleanup & Memory Management
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose Three.js scene recursively
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });

      controls.dispose();
      renderer.dispose();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [monument, viewMode]);

  // Handle auto-rotate toggle
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

  // Handle wireframe toggle
  useEffect(() => {
    if (!modelGroupRef.current) return;
    modelGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              if ('wireframe' in m) {
                (m as THREE.MeshStandardMaterial).wireframe = isWireframe;
              }
            });
          } else if ('wireframe' in mesh.material) {
            (mesh.material as THREE.MeshStandardMaterial).wireframe = isWireframe;
          }
        }
      }
    });
  }, [isWireframe]);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="monument-3d-viewer-root is-visible" role="region" aria-label={`3D Viewer for ${monument.name}`}>
      {/* 360 Virtual Tour Embedded Viewer Mode */}
      {viewMode === '360' && monument.virtualTourUrl ? (
        <div className="monument-360-container">
          <iframe
            src={monument.virtualTourUrl}
            title={`360 Virtual Tour - ${monument.name}`}
            className="monument-360-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; xr-spatial-tracking; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        /* Three.js Canvas Container */
        <div ref={containerRef} className="three-canvas-container" />
      )}

      {/* Top Header HUD */}
      <header className="viewer-3d-header">
        <button
          className="viewer-back-btn"
          onClick={onBack}
          aria-label="Back to Archive Map"
        >
          <span aria-hidden="true">←</span> BACK TO ARCHIVE
        </button>

        <div className="viewer-title-center">
          <h1 className="viewer-monument-name">{monument.name}</h1>
          <span className="reconstruction-badge">
            <span aria-hidden="true">✦</span> {viewMode === '360' ? '360° Immersive Virtual Tour' : 'Historical 3D Reconstruction'}
          </span>
        </div>

        <div className="viewer-controls-toolbar">
          {monument.virtualTourUrl && (
            <a
              href={monument.virtualTourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="viewer-tool-btn"
              title="Open Virtual Tour directly in new tab"
              style={{
                width: 'auto',
                padding: '0 14px',
                fontSize: '0.8rem',
                textDecoration: 'none',
                gap: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                color: 'var(--vx-gold-bright)',
                borderColor: 'var(--vx-gold)',
                background: 'rgba(212, 114, 44, 0.25)',
              }}
            >
              <span>🌐 OPEN IN TAB</span>
              <span>↗</span>
            </a>
          )}

          {monument.virtualTourUrl && (
            <button
              className={`viewer-tool-btn ${viewMode === '360' ? 'is-active' : ''}`}
              onClick={() => setViewMode(viewMode === '360' ? '3d' : '360')}
              title={viewMode === '360' ? 'Switch to 3D Architecture Model' : 'Switch to 360° Virtual Tour'}
              aria-label="Toggle View Mode"
              style={{ width: 'auto', padding: '0 12px', fontSize: '0.82rem', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            >
              <span>{viewMode === '360' ? '📐 3D MODEL' : '🌐 360° TOUR'}</span>
            </button>
          )}

          {viewMode === '3d' && (
            <>
              <button
                className={`viewer-tool-btn ${isAutoRotate ? 'is-active' : ''}`}
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                title="Toggle Auto-Rotation"
                aria-label="Toggle Auto-Rotation"
              >
                🔄
              </button>
              <button
                className={`viewer-tool-btn ${isWireframe ? 'is-active' : ''}`}
                onClick={() => setIsWireframe(!isWireframe)}
                title="Toggle Wireframe Blueprint"
                aria-label="Toggle Wireframe Blueprint"
              >
                📐
              </button>
              <button
                className="viewer-tool-btn"
                onClick={handleResetCamera}
                title="Reset Camera View"
                aria-label="Reset Camera View"
              >
                🎯
              </button>
            </>
          )}
        </div>
      </header>

      {/* Left/Bottom Telemetry HUD Card */}
      <div className="viewer-side-telemetry">
        <div className="telemetry-row">
          <span className="telemetry-label">Location & State</span>
          <span className="telemetry-value">{monument.state}, India ({monument.latitude.toFixed(4)}° N, {monument.longitude.toFixed(4)}° E)</span>
        </div>

        <div className="telemetry-row">
          <span className="telemetry-label">Historical Period</span>
          <span className="telemetry-value">{monument.historicalPeriod}</span>
        </div>

        <div className="telemetry-row">
          <span className="telemetry-label">Architectural Style</span>
          <span className="telemetry-value">{monument.architecturalStyle}</span>
        </div>

        <div className="telemetry-row">
          <span className="telemetry-label">Archival Notes</span>
          <span className="telemetry-value" style={{ fontSize: '0.86rem', color: 'var(--vx-paper-muted)' }}>
            {monument.shortDescription}
          </span>
        </div>
      </div>

      {/* Right/Bottom Historical Timeline HUD */}
      {monument.timeline && monument.timeline.length > 0 && (
        <div className="viewer-timeline-container">
          <div className="timeline-header-title">
            <span>⏳</span> HISTORICAL TIMELINE
          </div>

          <div className="timeline-flow-list">
            {monument.timeline.map((item, idx) => (
              <div
                key={idx}
                className="timeline-node-item"
                style={{ opacity: activeTimelineTab === idx ? 1 : 0.75, cursor: 'pointer' }}
                onClick={() => setActiveTimelineTab(idx)}
              >
                <div
                  className="timeline-node-dot"
                  style={{
                    background: activeTimelineTab === idx ? 'var(--vx-gold-bright)' : 'rgba(253,241,225,0.4)',
                    boxShadow: activeTimelineTab === idx ? '0 0 10px var(--vx-gold)' : 'none',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="timeline-node-era">{item.era}</span>
                  <span className="timeline-node-year">{item.year}</span>
                </div>
                <p className="timeline-node-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interaction Guide when in 3D */}
      {viewMode === '3d' && (
        <div className="viewer-interaction-hint">
          <span>🖱 DRAG TO ROTATE</span>
          <span>•</span>
          <span>📜 SCROLL TO ZOOM</span>
          <span>•</span>
          <span>👆 TOUCH FRIENDLY</span>
        </div>
      )}

      {/* Fallback Banner when GLB is loading or in procedural mode */}
      {viewMode === '3d' && loadingState === 'loading' && (
        <div className="viewer-status-banner">
          <div className="status-spinner" />
          <div className="status-title">Loading 3D Reconstruction...</div>
          <p className="status-desc">Fetching architectural geometries and texture telemetry</p>
        </div>
      )}

      {viewMode === '3d' && loadingState === 'fallback' && (
        <div
          className="viewer-status-banner"
          style={{
            top: '84px',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            background: 'rgba(212, 114, 44, 0.15)',
            borderColor: 'rgba(212, 114, 44, 0.4)',
          }}
        >
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--vx-gold-bright)' }}>
            ✦ 3D reconstruction coming soon
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--vx-paper-muted)' }}>
            Displaying interactive structural telemetry and geometrical twin
          </p>
        </div>
      )}
    </div>
  );
};
