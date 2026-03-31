import AppHeader from './AppHeader';
import './TwoColumnLayout.css';

function TwoColumnLayout({ leftPanel, rightPanel, showHistorySidebar = false }) {
  return (
    <div className="layout-container">
      <AppHeader showHistory={showHistorySidebar} />
      <div className="layout-content">
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

export default TwoColumnLayout;
