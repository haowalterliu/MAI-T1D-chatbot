import './OutputPanel.css';

function OutputPanel() {
  return (
    <div className="output-panel">
      <div className="output-panel-header">
        <span className="output-panel-title">Experiment Output</span>
      </div>
      <div className="output-panel-body">
        <div className="output-placeholder">
          <div className="output-placeholder-icon">⬡</div>
          <p className="output-placeholder-text">Experiment output will show here</p>
        </div>
      </div>
    </div>
  );
}

export default OutputPanel;
