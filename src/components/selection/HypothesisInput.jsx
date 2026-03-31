import './HypothesisInput.css';

function HypothesisInput({ value, onChange }) {
  return (
    <div className="hypothesis-input-container">
      <label className="hypothesis-label">Research Hypothesis</label>
      <textarea
        className="hypothesis-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe your research hypothesis or question (e.g., 'How does beta cell dysfunction relate to immune infiltration in T1D progression?')"
        rows={4}
      />
    </div>
  );
}

export default HypothesisInput;
