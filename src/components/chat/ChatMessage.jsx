import './ChatMessage.css';

function ChatMessage({ message }) {
  const { role, content } = message;

  return (
    <div className={`chat-message chat-message-${role}`}>
      <div className="chat-message-content">
        {content}
      </div>
    </div>
  );
}

export default ChatMessage;
