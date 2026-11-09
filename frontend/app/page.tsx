"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "coach"; text: string };

const STARTERS = [
  "I'm feeling stressed about work",
  "Help me build a morning habit",
  "How do I stay motivated?",
  "I'm nervous about a presentation",
];

export default function Home() {
  // The backend is stateless (it only sees the latest message), so the
  // conversation shown on screen lives entirely in this component.
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Let the textarea grow with its content, up to the CSS max-height.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        // FastAPI puts HTTPException messages in `detail`.
        throw new Error(data?.detail ?? `Request failed (${res.status})`);
      }
      setMessages((prev) => [...prev, { role: "coach", text: data.reply }]);
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "Couldn't reach the backend. Is it running on port 8000?"
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  // Enter sends; Shift+Enter adds a new line.
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <main className="shell">
      <header className="header">
        <div className="logo" aria-hidden>
          🌱
        </div>
        <div>
          <h1>Mental Coach</h1>
          <p className="subtitle">Stress, motivation, habits, and confidence</p>
        </div>
        {messages.length > 0 && (
          <button
            className="ghost"
            type="button"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
          >
            New chat
          </button>
        )}
      </header>

      <section className="chat" aria-live="polite">
        {messages.length === 0 ? (
          <div className="empty">
            <h2>What's on your mind today?</h2>
            <p>Share anything. Pick a starter below or type your own.</p>
            <div className="starters">
              {STARTERS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              <span className="sr-only">{m.role === "user" ? "You: " : "Coach: "}</span>
              {m.text}
            </div>
          ))
        )}
        {loading && (
          <div className="bubble coach typing" aria-label="Coach is typing">
            <span />
            <span />
            <span />
          </div>
        )}
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <div ref={endRef} />
      </section>

      <form className="composer" onSubmit={onSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message… (Shift+Enter for a new line)"
          rows={1}
          aria-label="Message"
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </main>
  );
}
