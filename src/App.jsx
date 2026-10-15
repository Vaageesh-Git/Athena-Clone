import { useState, useRef } from 'react';
import './App.css';

function App() {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  const cameraVideoRef = useRef(null);

  const allChecksReady = cameraEnabled && screenShareEnabled && fullScreen;

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

  return (
    <div className="page">
      <header className="page-header">
        <h1>Exam readiness check</h1>
        <p>Camera, screen sharing, and full screen all need to be on before the exam can begin.</p>
      </header>

      <div className="checklist">
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
              <button className="btn btn-primary" onClick={() => setScreenShareEnabled(true)}>
                Share your screen
              </button>
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
              <button className="btn btn-primary" onClick={() => setFullScreen(true)}>
                Switch to full screen
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="start-area">
        <button className="btn btn-begin" disabled={!allChecksReady}>
          Begin exam
        </button>
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
