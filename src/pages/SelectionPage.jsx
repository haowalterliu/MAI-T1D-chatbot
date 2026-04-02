import { useState } from 'react';
import TwoColumnLayout from '../components/layout/TwoColumnLayout';
import ThreeColumnLayout from '../components/layout/ThreeColumnLayout';
import ChatInterface from '../components/chat/ChatInterface';
import DatasetWorkspace from '../components/workspace/DatasetWorkspace';
import OutputPanel from '../components/output/OutputPanel';

function SelectionPage() {
  const [showOutput, setShowOutput] = useState(false);

  const handleExperimentStart = () => {
    setShowOutput(true);
  };

  if (showOutput) {
    return (
      <ThreeColumnLayout
        leftPanel={<ChatInterface page="selection" />}
        midPanel={<DatasetWorkspace onExperimentStart={handleExperimentStart} />}
        rightPanel={<OutputPanel />}
      />
    );
  }

  return (
    <TwoColumnLayout
      leftPanel={<ChatInterface page="selection" />}
      rightPanel={<DatasetWorkspace onExperimentStart={handleExperimentStart} />}
    />
  );
}

export default SelectionPage;
