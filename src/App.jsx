import React, { useState, useEffect } from "react";
import "./App.css";

const FLASHCARDS = [
  {
    id: 1,
    topic: "CONFIG / FAIL-FAST",
    question:
      ".env has DATABASE_URL= and PORT= (both empty). What does the config module do with each?",
    answer:
      'DATABASE_URL throws at startup (required rejects ""). PORT falls back to 3000 (optional uses ||, and "" is falsy).',
  },
  {
    id: 2,
    topic: "ENV PIPELINE",
    question: "npm run dev works but migrate:up can't connect. Likely cause?",
    answer:
      "dotenv is only loaded inside the config module, which the migration CLI never imports. Fix: dotenv -- (dotenv-cli) in the script.",
  },
  {
    id: 3,
    topic: "DOCKER PERSISTENCE",
    question:
      "You change POSTGRES_PASSWORD and restart with down / up -d. Auth fails. Why?",
    answer:
      "POSTGRES_* variables only apply when initializing an empty data directory. The pgdata volume kept the old cluster. Fix: ALTER USER (keeps data) or down -v (wipes data).",
  },
  {
    id: 4,
    topic: "DOCKER HEALTH",
    question:
      "A container is Up (unhealthy) and restart: unless-stopped is set. Does Docker restart it?",
    answer:
      "No. Restart policies react to process exit. Health status only reports state.",
  },
  {
    id: 5,
    topic: "PROCESS LIFECYCLE",
    question: "process.exit(1) on a pool error is only safe if...?",
    answer:
      "Something outside the process (process manager or orchestrator) restarts the app. Otherwise one dropped connection becomes a permanent outage.",
  },
  {
    id: 6,
    topic: "QUERY SAFETY",
    question: "Can ORDER BY $1 take a column name as a parameter?",
    answer:
      "No. Parameters bind values, not identifiers. It's injection-safe but won't sort by that column. Validate against an allowlist.",
  },
  {
    id: 7,
    topic: "ARCHITECTURE / LEDGER",
    question:
      '"Summing the ledger will be slow." Should you add a balance column?',
    answer:
      "Keep the ledger as the source of truth. If needed, add a derived, rebuildable cache that can be reconciled against the ledger. Never a second independent source of truth.",
  },
  {
    id: 8,
    topic: "MIGRATIONS / IMMUTABILITY",
    question:
      "You edit an already-applied migration and teammates' migrate:up does nothing. Why?",
    answer:
      "pgmigrations already records it by name, so it's skipped. Applied migrations are immutable; write a new one.",
  },
  {
    id: 9,
    topic: "GIT / SECRETS",
    question:
      "You committed .env, then ran git rm --cached .env. Are you safe?",
    answer:
      "No. The secret is still in earlier commits. Rotate the credentials. .gitignore only affects untracked files.",
  },
  {
    id: 10,
    topic: "POOL LIFECYCLE",
    question:
      "What does pool.end() in seed.js do, and what happens without it?",
    answer:
      "It closes pooled connections. Without it the script hangs after seeding (open sockets keep Node alive). On the error path, process.exit(1) skips finally.",
  },
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = FLASHCARDS[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % FLASHCARDS.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + FLASHCARDS.length) % FLASHCARDS.length,
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <span className="badge">WEEK 1 // REINFORCEMENT</span>
        <h1>Functional Apex Flashcards</h1>
        <p className="subtitle">Project Setup & Environment Discipline</p>
      </header>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${((currentIndex + 1) / FLASHCARDS.length) * 100}%`,
          }}
        />
      </div>

      <div className="card-stage">
        <div
          className={`flashcard ${isFlipped ? "flipped" : ""}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="card-face card-front">
            <div className="card-header">
              <span className="topic-tag">{card.topic}</span>
              <span className="card-number">
                {card.id} / {FLASHCARDS.length}
              </span>
            </div>
            <p className="prompt">{card.question}</p>
            <span className="hint">[ Click or Space to Flip ]</span>
          </div>

          <div className="card-face card-back">
            <div className="card-header">
              <span className="topic-tag accent">EXPLANATION</span>
              <span className="card-number">
                {card.id} / {FLASHCARDS.length}
              </span>
            </div>
            <p className="answer">{card.answer}</p>
            <span className="hint">[ Click or Space to Flip ]</span>
          </div>
        </div>
      </div>

      <div className="controls">
        <button onClick={handlePrev} className="btn">
          ← Previous
        </button>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="btn btn-primary"
        >
          {isFlipped ? "Show Prompt" : "Reveal Answer"}
        </button>
        <button onClick={handleNext} className="btn">
          Next →
        </button>
      </div>

      <footer className="footer-keys">
        <span>
          Shortcuts: <strong>←</strong> Prev | <strong>Space</strong> Flip |{" "}
          <strong>→</strong> Next
        </span>
      </footer>
    </div>
  );
}
