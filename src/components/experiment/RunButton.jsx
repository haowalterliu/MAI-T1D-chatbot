import './RunButton.css';

function RunButton({ disabled, onClick }) {
  return (
    <button
      className="run-button"
      disabled={disabled}
      onClick={onClick}
    >
      Run Experiment
    </button>
  );
}

export default RunButton;
