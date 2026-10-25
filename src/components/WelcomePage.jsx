import NeuralMark from "./NeuralMark";
const prompts = [
  [
    "01",
    "Explore a concept",
    "Make the complex, clear.",
    "Explain a complex concept to me in simple terms.",
    "↗",
  ],
  [
    "02",
    "Build something",
    "From first idea to working code.",
    "Help me plan and write some code.",
    "⌘",
  ],
  [
    "03",
    "Analyze a document",
    "Find the insight in your PDF or DOCX.",
    "Help me analyze a document.",
    "▤",
  ],
  [
    "04",
    "Think beyond",
    "A fresh perspective starts here.",
    "Help me brainstorm an original idea.",
    "✧",
  ],
];
export default function WelcomePage({ setInput }) {
  return (
    <section className="welcome-panel">
      <div className="welcome-kicker">
        <span /> A SPACE FOR YOUR NEXT BIG IDEA
      </div>
      <div className="hero-energy">
        <div className="energy-orbit orbit-one" />
        <div className="energy-orbit orbit-two" />
        <NeuralMark animated className="hero-mark" />
        <span className="energy-coordinate coordinate-one">A / 01</span>
        <span className="energy-coordinate coordinate-two">∞ POSSIBILITY</span>
      </div>
      <h1>
        Beyond intelligence.
        <br />
        <span>Beyond imagination.</span>
      </h1>
      <p className="welcome-description">
        A clearer thought. A bolder idea. A new possibility.
        <br className="desktop-break" /> Make something extraordinary with
        ATEELABO AI.
      </p>
      <div className="prompt-grid">
        {prompts.map(([number, title, description, prompt, icon]) => (
          <button
            key={number}
            onClick={() => {
              setInput(prompt);
              document
                .querySelector('[aria-label="Message Ateelabo AI"]')
                ?.focus();
            }}
            className="prompt-card"
          >
            <div className="prompt-top">
              <span>{number} /</span>
              <b>{icon}</b>
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
            <span className="prompt-arrow">↗</span>
          </button>
        ))}
      </div>
      <div className="welcome-footnote">
        <span>THINK DEEPER</span>
        <i />
        <span>CREATE FREELY</span>
        <i />
        <span>GO FURTHER</span>
      </div>
    </section>
  );
}
