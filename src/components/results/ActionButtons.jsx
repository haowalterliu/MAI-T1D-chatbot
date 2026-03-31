import './ActionButtons.css';

function ActionButtons({ onReset, onSave }) {
  return (
    <div className="action-buttons">
      <button className="reset-button" onClick={onReset}>
        🔄 Reset & Re-run
      </button>
      <button className="save-button" onClick={onSave}>
        💾 Save PDF
      </button>
    </div>
  );
}

export default ActionButtons;
