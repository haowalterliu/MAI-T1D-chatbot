import TwoColumnLayout from '../components/layout/TwoColumnLayout';
import ResultsPanel from '../components/results/ResultsPanel';
import ChatInterface from '../components/chat/ChatInterface';

function ResultsPage() {
  return (
    <TwoColumnLayout
      leftPanel={<ChatInterface page="results" />}
      rightPanel={<ResultsPanel />}
    />
  );
}

export default ResultsPage;
