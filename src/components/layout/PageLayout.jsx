import Breadcrumb from './Breadcrumb';
import './PageLayout.css';

function PageLayout({ leftPanel, rightPanel }) {
  return (
    <div className="page-container">
      <Breadcrumb />
      <div className="page-content">
        <div className="left-panel">
          {leftPanel}
        </div>
        <div className="right-panel">
          {rightPanel}
        </div>
      </div>
    </div>
  );
}

export default PageLayout;
