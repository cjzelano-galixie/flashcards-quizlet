import React, { useState, useEffect } from "react";
import "./App.css";

const FLASHCARDS = [
  {
    id: 1,
    topic: "CONFIG / FAIL-FAST",
    question:
      "Why prefer required() over optional() with default fallbacks for critical env vars?",
    answer:
      "required() checks for missing or empty values and throws early during boot up, stopping misconfigured environments immediately rather than running with unexpected default states.",
  },
  {
    id: 2,
    topic: "ENV PIPELINE",
    question:
      "Why doesn't running a migration CLI tool automatically pick up dotenv variables from your Express app?",
    answer:
      "CLI migration tools execute as separate Node processes. They bypass your Express application entrypoint (src/config/index.js), so dotenv must be loaded via CLI flags or script wrappers.",
  },
  {
    id: 3,
    topic: "DOCKER PERSISTENCE",
    question:
      "Why don't POSTGRES_* environment variables update an existing database in a Docker volume?",
    answer:
      "POSTGRES_* variables are entrypoint initialization flags used only when constructing a fresh data directory. Once the volume exists, Postgres boots straight from the existing pgdata folder.",
  },
  {
    id: 4,
    topic: "QUERY SAFETY",
    question:
      "Why can't SQL parameterization ($1, $2) be used for table or column names?",
    answer:
      "Parameters bind literal values during query execution. Identifiers like table or column names alter the AST/query structure and must be validated or safely constructed before preparation.",
  },
  {
    id: 5,
    topic: "SCRIPT LIFECYCLE",
    question:
      "What happens when calling process.exit(1) inside an async catch block before pool release?",
    answer:
      "process.exit(1) abruptly kills the Node event loop, skipping pending cleanup routines or asynchronous finally blocks and leaving open database connection pool sockets.",
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
