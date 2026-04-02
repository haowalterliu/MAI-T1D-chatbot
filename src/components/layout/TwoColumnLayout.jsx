import { useState, useCallback, useRef, useEffect } from 'react';
import './TwoColumnLayout.css';

const MIN_PCT = 20;  // minimum panel width %
const MAX_PCT = 80;  // maximum panel width %
const DEFAULT_PCT = 40; // default left panel %

function TwoColumnLayout({ leftPanel, rightPanel }) {
  const [leftPct, setLeftPct] = useState(DEFAULT_PCT);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const startDrag = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setLeftPct(Math.min(MAX_PCT, Math.max(MIN_PCT, raw)));
  }, [isDragging]);

  const stopDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
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
  }, [isDragging, onMouseMove, stopDrag]);

  return (
    <div
      className={`layout-container ${isDragging ? 'is-dragging' : ''}`}
      ref={containerRef}
    >
      {/* Left panel */}
      <div
        className="left-panel"
        style={{ width: `${leftPct}%` }}
      >
        {leftPanel}
      </div>

      {/* Drag handle */}
      <div
        className="resize-handle"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        title="Drag to resize"
      >
        <div className="resize-handle-bar" />
      </div>

      {/* Right panel */}
      <div
        className="right-panel"
        style={{ width: `${100 - leftPct}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
}

export default TwoColumnLayout;
