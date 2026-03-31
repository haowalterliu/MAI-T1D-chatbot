import ThreeColumnLayout from '../components/layout/ThreeColumnLayout';
import ChatInterface from '../components/chat/ChatInterface';
import SelectionPanel from '../components/selection/SelectionPanel';
import OutputPanel from '../components/output/OutputPanel';

function SelectionPage() {
  return (
    <ThreeColumnLayout
      leftPanel={<ChatInterface page="selection" />}
      midPanel={<SelectionPanel />}
      rightPanel={<OutputPanel />}
    />
  );
}

export default SelectionPage;
