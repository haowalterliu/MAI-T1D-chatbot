import { useState, useCallback, useRef, useEffect } from 'react';
import './ThreeColumnLayout.css';

const MIN_PCT = 15;
const DEFAULT_LEFT = 35;
const DEFAULT_MID = 35;

function ThreeColumnLayout({ leftPanel, midPanel, rightPanel }) {
  const [leftPct, setLeftPct] = useState(DEFAULT_LEFT);
  const [midPct, setMidPct] = useState(DEFAULT_MID);
  const [dragging, setDragging] = useState(null); // 'left' | 'right' | null
  const containerRef = useRef(null);

  const startDrag = useCallback((handle) => (e) => {
    e.preventDefault();
    setDragging(handle);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = ((clientX - rect.left) / rect.width) * 100;

    if (dragging === 'left') {
      const newLeft = Math.min(Math.max(pct, MIN_PCT), 100 - midPct - MIN_PCT);
      setLeftPct(newLeft);
    } else {
      const newMid = Math.min(Math.max(pct - leftPct, MIN_PCT), 100 - leftPct - MIN_PCT);
      setMidPct(newMid);
    }
  }, [dragging, leftPct, midPct]);

  const stopDrag = useCallback(() => setDragging(null), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', onMouseMove, { passive: false });
      window.addEventListener('touchend', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [dragging, onMouseMove, stopDrag]);

  const rightPct = 100 - leftPct - midPct;

  return (
    <div
      className={`three-col-container ${dragging ? 'is-dragging' : ''}`}
      ref={containerRef}
    >
      <div className="col-panel col-panel-left" style={{ width: `${leftPct}%` }}>
        {leftPanel}
      </div>

      <div className="resize-handle" onMouseDown={startDrag('left')} onTouchStart={startDrag('left')}>
        <div className="resize-handle-bar" />
      </div>

      <div className="col-panel col-panel-mid" style={{ width: `${midPct}%` }}>
        {midPanel}
      </div>

      <div className="resize-handle" onMouseDown={startDrag('right')} onTouchStart={startDrag('right')}>
        <div className="resize-handle-bar" />
      </div>

      <div className="col-panel col-panel-right" style={{ width: `${rightPct}%` }}>
        {rightPanel}
      </div>
    </div>
  );
}

export default ThreeColumnLayout;
