import { useRef, useEffect, useState } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { sendMessage } from '../../services/chatService';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import DatasetRecommendation from './DatasetRecommendation';
import ModelRecommendation from './ModelRecommendation';
import DatasetUpdateCard from './DatasetUpdateCard';
import './ChatInterface.css';

function ChatInterface({ page }) {
  const { messages, addMessage, config, addTableOp } = useExperiment();
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text) => {
    // Add user message immediately
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    setIsLoading(true);

    try {
      // Build conversation history for Claude (only role + content)
      const claudeMessages = messages
        .map(m => ({ role: m.role, content: m.content }))
        .concat({ role: 'user', content: text });

      const response = await sendMessage(claudeMessages);

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        recommendations: response.recommendations,
        modelRecommendations: response.modelRecommendations,
        tableOps: response.tableOps || null,
        timestamp: new Date(),
      });

      // Push table operations to context for workspace to consume
      if (response.tableOps) {
        for (const op of response.tableOps) {
          addTableOp(op);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const placeholder = page === 'selection'
    ? 'Ask me which datasets to use, what modalities mean, or how to choose a model...'
    : 'Ask me to explain the results, why certain features are important...';

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="chat-empty-state">{placeholder}</div>
        )}
        {messages.map(msg => {
          const hasRecs = msg.recommendations && msg.recommendations.length > 0;
          const hasModels = msg.modelRecommendations && msg.modelRecommendations.length > 0;
          const hasTableOps = msg.tableOps && msg.tableOps.length > 0;

          if (hasRecs || hasModels || hasTableOps) {
            return (
              <div key={msg.id}>
                <ChatMessage message={msg} />
                {hasRecs && msg.recommendations.map(rec => (
                  <DatasetRecommendation key={rec.id} recommendation={rec} />
                ))}
                {hasModels && msg.modelRecommendations.map(rec => (
                  <ModelRecommendation key={rec.id} recommendation={rec} />
                ))}
                {hasTableOps && msg.tableOps.map((op, i) => (
                  <DatasetUpdateCard key={`${msg.id}-op-${i}`} op={op} messageId={msg.id} />
                ))}
              </div>
            );
          }
          return <ChatMessage key={msg.id} message={msg} />;
        })}
        {isLoading && (
          <div className="chat-typing-indicator">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}

export default ChatInterface;
