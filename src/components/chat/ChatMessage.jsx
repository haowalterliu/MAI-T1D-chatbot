import { useState } from 'react';
import { renderMarkdown } from '../../utils/renderMarkdown.jsx';
import './ChatMessage.css';

function ChatMessage({ message }) {
  const { role, content } = message;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fall through silently
    }
  };

  return (
    <div className={`chat-message chat-message-${role}`}>
      <div className="chat-message-col">
        <div className="chat-message-content">
          {role === 'assistant' ? renderMarkdown(content) : content}
        </div>
        {role === 'user' && (
          <button
            type="button"
            className="chat-message-copy"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy prompt'}
            aria-label="Copy prompt"
          >
            {copied ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
