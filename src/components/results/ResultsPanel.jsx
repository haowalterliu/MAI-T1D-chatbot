import { useNavigate } from 'react-router-dom';
import { useExperiment } from '../../context/ExperimentContext';
import Breadcrumb from '../layout/Breadcrumb';
import SummaryCard from './SummaryCard';
import KeyFindings from './KeyFindings';
import Visualizations from './Visualizations';
import RawDataTable from './RawDataTable';
import ActionButtons from './ActionButtons';
import HistoryEntry from './HistoryEntry';
import './ResultsPanel.css';

function ResultsPanel() {
  const navigate = useNavigate();
  const { history, currentResultIndex, viewHistoryResult } = useExperiment();

  const currentResult = history[currentResultIndex];

  if (!currentResult) {
    return (
      <div className="results-panel">
        <Breadcrumb currentPage="results" showBackButton />
        <div className="results-panel-empty">
          No results to display. Run an experiment first.
        </div>
      </div>
    );
  }

  const handleReset = () => {
    navigate('/selection');
  };

  const handleSave = () => {
    const filename = 'MAI-T1D_Results_' + new Date().toISOString().split('T')[0] + '.pdf';
    alert(`PDF download simulation: ${filename}`);
  };

  return (
    <div className="results-panel">
      <Breadcrumb currentPage="results" showBackButton />

      <div className="results-panel-content">
        <SummaryCard result={currentResult} />
        <KeyFindings findings={currentResult.results.keyFindings} />
        <Visualizations charts={currentResult.results.visualizations} />
        <RawDataTable data={currentResult.results.rawData} />

        {history.length > 1 && (
          <div className="results-history">
            <h3 className="results-history-title">Run History</h3>
            <div className="results-history-list">
              {history.map((entry, index) => (
                <HistoryEntry
                  key={entry.id}
                  entry={entry}
                  index={index}
                  isActive={index === currentResultIndex}
                  onClick={() => viewHistoryResult(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ActionButtons onReset={handleReset} onSave={handleSave} />
    </div>
  );
}

export default ResultsPanel;
