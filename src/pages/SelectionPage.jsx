import TwoColumnLayout from '../components/layout/TwoColumnLayout';
import SelectionPanel from '../components/selection/SelectionPanel';
import ChatInterface from '../components/chat/ChatInterface';

function SelectionPage() {
  return (
    <TwoColumnLayout
      leftPanel={<SelectionPanel />}
      rightPanel={<ChatInterface page="selection" />}
    />
  );
}

export default SelectionPage;
