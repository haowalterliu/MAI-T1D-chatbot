import TwoColumnLayout from '../components/layout/TwoColumnLayout';
import ResultsPanel from '../components/results/ResultsPanel';
import ChatInterface from '../components/chat/ChatInterface';

function ResultsPage() {
  return (
    <TwoColumnLayout
      leftPanel={<ResultsPanel />}
      rightPanel={<ChatInterface page="results" />}
      showHistorySidebar={true}
    />
  );
}

export default ResultsPage;
