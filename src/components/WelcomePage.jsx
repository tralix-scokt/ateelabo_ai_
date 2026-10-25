import NeuralMark from "./NeuralMark";
import Icon from "./Icon";
const prompts = [
  ["Help me with a project", "Help me plan a project, from the first idea to the next steps.", "chat"],
  ["Explain something", "Explain a complex concept to me in simple terms.", "search"],
  ["Give me ideas", "Help me brainstorm an original idea.", "plus"],
  ["Write or code", "Help me plan and write some code.", "copy"],
  ["Analyze a document", "Help me analyze a document.", "chat"],
];
export default function WelcomePage({ setInput }) {
  return (
    <section className="welcome-panel">
      <div className="hero-energy"><NeuralMark animated className="hero-mark" /></div>
      <h1 className="reference-wordmark">ATEELABO <span>AI</span></h1>
      <p className="welcome-description">Beyond Intelligence. <span>Beyond Imagination.</span></p>
      <div className="welcome-greeting">
        <h2>Hey there, I’m ATEELABO AI <span aria-hidden="true">✦</span></h2>
        <p>I’m your intelligent assistant, ready to help you think bigger, solve faster, and create more.</p>
        <p>What would you like to explore today?</p>
      </div>
      <div className="prompt-grid">
        {prompts.map(([title, prompt, icon]) => (
          <button key={title} onClick={() => {
            setInput(prompt);
            document.querySelector('[aria-label="Message Ateelabo AI"]')?.focus();
          }} className="prompt-card"><Icon name={icon} size={15}/><h2>{title}</h2></button>
        ))}
      </div>
      <div className="welcome-footnote"><span>YOUR MIND.</span><i/><span>MY INTELLIGENCE.</span><i/><span>INFINITE POSSIBILITIES.</span></div>
    </section>
  );
}
