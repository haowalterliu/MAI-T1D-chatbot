import { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import ChatInterface from '../components/chat/ChatInterface';
import './MetadataComparison.css';

function MetadataComparison() {
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (text) => {
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a demo response for metadata comparison. In production, this would analyze dataset compatibility and donor overlap.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 500);
  };

  const leftPanel = (
    <div className="output-placeholder">
      <div className="output-placeholder-icon">📊</div>
      <p className="output-placeholder-text">
        Comparison results will appear here
      </p>
    </div>
  );

  const rightPanel = (
    <ChatInterface
      messages={messages}
      onSendMessage={handleSendMessage}
      placeholder="Ask me about metadata compatibility, donor overlap, or modality combinations..."
    />
  );

  return <PageLayout leftPanel={leftPanel} rightPanel={rightPanel} />;
}

export default MetadataComparison;
