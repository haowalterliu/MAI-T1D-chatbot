import { useState, useRef, useEffect } from 'react';
import { demoDatasets } from '../../data/demoDatasets';
import './ChatInput.css';

const EXAMPLE_PROMPTS = [
  'Show me all T1D donors from HPAP',
  'Give me male and female donor lists from HPAP',
  'Find T1D donors from HPAP who have both scRNA-seq and CODEX data',
];

function ChatInput({ onSend, disabled, showExamples }) {
  const [input, setInput] = useState('');
  const [showDatasetPicker, setShowDatasetPicker] = useState(false);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const handlePickDataset = (dataset) => {
    // Insert dataset name into the input so user can compose a message about it
    const prefix = input ? input.trimEnd() + ' ' : '';
    setInput(prefix + dataset.title + ' ');
    setShowDatasetPicker(false);
    inputRef.current?.focus();
  };

  // Auto-resize textarea to fit content (up to a max of ~6 lines)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 160; // ~6-7 lines
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
  }, [input]);

  // Close picker on outside click
  useEffect(() => {
    if (!showDatasetPicker) return;
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowDatasetPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDatasetPicker]);

  const handleExampleClick = (prompt) => {
    if (disabled) return;
    onSend(prompt);
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      {showExamples && (
        <div className="chat-input-examples">
          {EXAMPLE_PROMPTS.map(p => (
            <button
              key={p}
              type="button"
              className="chat-example-chip"
              onClick={() => handleExampleClick(p)}
              disabled={disabled}
            >
              <svg className="chat-example-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 3v5a2 2 0 0 0 2 2h7" />
                <path d="M10 7l3 3-3 3" />
              </svg>
              <span>{p}</span>
            </button>
          ))}
        </div>
      )}
      <div className="chat-input-wrapper" ref={pickerRef}>
        <textarea
          ref={inputRef}
          rows={1}
          className="chat-input-field"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="chat-input-actions">
          <button
            type="button"
            className={`chat-input-icon-btn ${showDatasetPicker ? 'active' : ''}`}
            onClick={() => setShowDatasetPicker(prev => !prev)}
            title="Select dataset"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="12" height="12" rx="2" />
              <path d="M2 6.5h12M6.5 2v12" />
            </svg>
          </button>
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!input.trim() || disabled}
          >
            Send
          </button>
        </div>
        {showDatasetPicker && (
          <div className="dataset-picker-popup">
            <div className="dataset-picker-title">Datasets</div>
            {demoDatasets.map(ds => (
              <button
                key={ds.id}
                type="button"
                className="dataset-picker-item"
                onClick={() => handlePickDataset(ds)}
              >
                <div className="dataset-picker-icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" />
                    <path d="M1.5 5.5h11M5.5 1.5v11" />
                  </svg>
                </div>
                <div className="dataset-picker-info">
                  <span className="dataset-picker-name">{ds.title}</span>
                  <span className="dataset-picker-meta">{ds.donorCount} donors · {ds.cellType}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}

export default ChatInput;
