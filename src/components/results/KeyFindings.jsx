import './KeyFindings.css';

function KeyFindings({ findings }) {
  return (
    <div className="key-findings">
      <h3 className="key-findings-title">Key Findings</h3>
      <ul className="key-findings-list">
        {findings.map((finding, index) => (
          <li key={index} className="key-findings-item">
            {finding}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default KeyFindings;
