import { useNavigate } from 'react-router-dom';
import './Breadcrumb.css';

function Breadcrumb({ currentPage, showBackButton = false }) {
  const navigate = useNavigate();

  return (
    <nav className="breadcrumb">
      {showBackButton && (
        <button
          className="back-button"
          onClick={() => navigate('/selection')}
        >
          ← Back
        </button>
      )}

      <button
        className={currentPage === 'selection' ? 'breadcrumb-item active' : 'breadcrumb-item'}
        onClick={() => navigate('/selection')}
      >
        Data & Model Selection
      </button>

      {currentPage === 'results' && (
        <>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">Results</span>
        </>
      )}
    </nav>
  );
}

export default Breadcrumb;
