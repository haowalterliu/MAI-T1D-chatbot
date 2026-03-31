import './HypothesisInput.css';

function HypothesisInput({ value, onChange }) {
  return (
    <div className="hypothesis-input-container">
      <label className="hypothesis-label">
        Research Hypothesis
      </label>
      <textarea
        className="hypothesis-textarea"
        placeholder="Describe your research hypothesis or question..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    </div>
  );
}

export default HypothesisInput;
