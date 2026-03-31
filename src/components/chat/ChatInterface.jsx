import { useRef, useEffect } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import DatasetRecommendation from './DatasetRecommendation';
import './ChatInterface.css';

function ChatInterface({ page }) {
  const { messages, addMessage, config } = useExperiment();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text) => {
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    setTimeout(() => {
      addMessage(generateAIResponse(text, page, config.hypothesis));
    }, 500);
  };

  const placeholder = page === 'selection'
    ? 'Ask me which datasets to use, what modalities mean, or how to choose a model...'
    : 'Ask me to explain the results, why certain features are important...';

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty-state">{placeholder}</div>
        )}
        {messages.map(msg => {
          if (msg.recommendations) {
            return (
              <div key={msg.id}>
                <ChatMessage message={msg} />
                {msg.recommendations.map(rec => (
                  <DatasetRecommendation key={rec.id} recommendation={rec} />
                ))}
              </div>
            );
          }
          return <ChatMessage key={msg.id} message={msg} />;
        })}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}

function generateAIResponse(userMessage, page, hypothesis) {
  const lowerMsg = userMessage.toLowerCase();
  const hypothesisText = hypothesis?.trim()
    ? hypothesis.trim()
    : 'your research focus';

  if (page === 'selection') {
    if (lowerMsg.includes('dataset') || lowerMsg.includes('data') || lowerMsg.includes('recommend')) {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on ${hypothesisText}, I recommend the following datasets:`,
        recommendations: [
          { id: 'hpap', reason: 'Best for beta cell analysis with comprehensive multi-omics modalities' },
          { id: 'teddy', reason: 'Longitudinal data ideal for tracking T1D disease progression' },
        ],
        timestamp: new Date(),
      };
    }
    if (lowerMsg.includes('model')) {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `For ${hypothesisText}, I recommend Single Cell FM if you're studying cellular heterogeneity, Genomic FM for genome-wide association patterns, or Spatial FM when tissue architecture matters.`,
        timestamp: new Date(),
      };
    }
  }

  if (page === 'results') {
    if (lowerMsg.includes('explain') || lowerMsg.includes('result') || lowerMsg.includes('finding')) {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `INS (insulin gene) has the highest feature importance (0.23), expected in T1D research. PDX1 and MAFA are key transcription factors for beta cell identity — their high importance suggests beta cell dysfunction is a primary driver in your selected datasets.`,
        timestamp: new Date(),
      };
    }
  }

  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: 'This is a demo assistant. In production, responses are powered by the Claude API.',
    timestamp: new Date(),
  };
}

export default ChatInterface;
