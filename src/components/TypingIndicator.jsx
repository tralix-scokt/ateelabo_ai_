export default function TypingIndicator() {
  return (
    <div className="typing-indicator" role="status">
      <span className="typing-label">ATEELABO is thinking</span>
      <span className="typing-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
