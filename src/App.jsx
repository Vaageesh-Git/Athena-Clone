import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [storagePath, setStoragePath] = useState('');
  const [examStarted, setExamStarted] = useState(false);
  const [timer, setTimer] = useState(0);

  const cameraVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  const allChecksReady = cameraEnabled && screenShareEnabled && fullScreen;

  useEffect(() => {
    if (window.athena?.getStorageDirectory) {
      window.athena.getStorageDirectory().then((dir) => {
        setStoragePath(dir);
      });
    }

    if (window.athena?.registerListenerForTimerTickFromMain) {
      const removeTimerListener = window.athena.registerListenerForTimerTickFromMain((seconds) => {
        setTimer(seconds);
      });
      return () => removeTimerListener();
    }
  }, []);

  async function handleSelectFolder() {
    if (window.athena?.selectStorageDirectory) {
      const selected = await window.athena.selectStorageDirectory();
      if (selected) {
        setStoragePath(selected);
      }
    }
  }

  async function getCameraAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
    } catch (err) {
      alert("Unable to access camera. Please allow webcam permissions and try again.");
    }
  }

  async function getScreenShareAccess() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }
      setScreenShareEnabled(true);
    } catch (err) {
      alert("Unable to share screen. Please allow display capture and try again.");
    }
  }

  async function enableFullScreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setFullScreen(true);
    } catch (err) {
      alert("Cannot switch to full screen mode.");
    }
  }

  async function startExam() {
    try {
      if (window.athena?.startTimerOnMain) {
        await window.athena.startTimerOnMain();
      }
      setExamStarted(true);
    } catch (err) {
      console.error("Failed to start exam timer:", err);
    }
  }

  function formatElapsed(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds || 0));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Exam readiness check</h1>
        <p>Configure storage and verify your camera, screen, and full screen before beginning.</p>
      </header>

      <div className="checklist">
        {/* Storage directory selection */}
        <div className="check-row">
          <div className="check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="check-body">
            <h3>Snapshot storage directory</h3>
            <p>Folder where camera and screen snapshots are automatically saved.</p>
            {storagePath && <div className="storage-path">{storagePath}</div>}
            <div className="check-action">
              <button className="btn btn-secondary" onClick={handleSelectFolder} disabled={examStarted}>
                Choose storage folder
              </button>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Check 1: Camera */}
        <div className="check-row">
          <div className="check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 8l4.553-2.276A1 1 0 0 1 21 6.618v10.764a1 1 0 0 1-1.447.894L15 16" />
              <rect x="3" y="6" width="12" height="12" rx="2" />
            </svg>
          </div>
          <div className="check-body">
            <h3>Camera</h3>
            <p>Used to verify candidate identity during the exam.</p>
            <div className="check-action">
              {cameraEnabled ? (
                <span className="check-status">
                  <CheckmarkIcon /> Camera connected
                </span>
              ) : (
                <button className="btn btn-primary" onClick={getCameraAccess}>
                  Allow camera access
                </button>
              )}
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className={`preview ${cameraEnabled ? '' : 'is-hidden'}`}
              />
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Check 2: Screen Share */}
        <div className="check-row">
          <div className="check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="4.5" width="19" height="13" rx="1.5" />
              <path d="M8 21h8M12 17.5V21" />
            </svg>
          </div>
          <div className="check-body">
            <h3>Screen sharing</h3>
            <p>Lets the proctor monitor desktop activity throughout the session.</p>
            <div className="check-action">
              {screenShareEnabled ? (
                <span className="check-status">
                  <CheckmarkIcon /> Screen sharing active
                </span>
              ) : (
                <button className="btn btn-primary" onClick={getScreenShareAccess}>
                  Share your screen
                </button>
              )}
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                className={`preview ${screenShareEnabled ? '' : 'is-hidden'}`}
              />
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Check 3: Full screen */}
        <div className="check-row">
          <div className="check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H3v6M15 3h6v6M21 15v6h-6M3 15v6h6" />
            </svg>
          </div>
          <div className="check-body">
            <h3>Full screen</h3>
            <p>Locks the browser into full screen mode during the exam.</p>
            <div className="check-action">
              {fullScreen ? (
                <span className="check-status">
                  <CheckmarkIcon /> Full screen enabled
                </span>
              ) : (
                <button className="btn btn-primary" onClick={enableFullScreen}>
                  Switch to full screen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="start-area">
        <button className="btn btn-begin" disabled={!allChecksReady || examStarted} onClick={startExam}>
          {examStarted ? 'Exam in progress' : 'Begin exam'}
        </button>

        {examStarted && (
          <div className="elapsed" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600 }}>{formatElapsed(timer)}</span>
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>elapsed</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default App;
