import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import WelcomePage from "./WelcomePage";
import NeuralMark from "./NeuralMark";
import TypingIndicator from "./TypingIndicator";
import Intro from "./Intro";
import Icon from "./Icon";

export default function ChatExperience(p) {
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem("ateelabo_intro_seen");
    } catch {
      return true;
    }
  });
  const [copied, setCopied] = useState(null);
  const copyTimer = useRef();
  const inputRef = useRef();
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  useEffect(() => {
    const shortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        p.setSidebarOpen(true);
        requestAnimationFrame(() =>
          document
            .querySelector('[aria-label="Search conversations"]')
            ?.focus(),
        );
      }
      if (e.key === "Escape") p.setSidebarOpen(false);
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, [p.setSidebarOpen]);
  const enter = () => {
    try {
      sessionStorage.setItem("ateelabo_intro_seen", "true");
    } catch {
      /* private mode */
    }
    setShowIntro(false);
    inputRef.current?.focus();
  };
  const messages = p.currentChat?.messages || [];
  const lastAI = messages.findLastIndex((m) => m.role === "ai");
  return (
    <>
      <div
        className="ai-workspace"
        inert={showIntro ? "" : undefined}
        onTouchStart={(e) => {
          if (e.touches[0].clientX < 28 || p.sidebarOpen) p.handleTouchStart(e);
        }}
        onTouchEnd={p.handleTouchEnd}
      >
        {p.sidebarOpen && (
          <button
            className="sidebar-scrim"
            aria-label="Close navigation"
            onClick={() => p.setSidebarOpen(false)}
          />
        )}
        <div
          style={{ "--sidebar-width": `${p.sidebarWidth}px` }}
          className={`workspace-sidebar ${p.sidebarOpen ? "is-open" : ""}`}
        >
          <Sidebar
            {...p}
            activeChat={p.activeChat}
            setActiveChat={(id) => {
              p.setActiveChat(id);
              p.setSidebarOpen(false);
            }}
            createNewChat={() => {
              p.createNewChat();
              p.setSidebarOpen(false);
            }}
            onClose={() => p.setSidebarOpen(false)}
          />
          <div
            className="sidebar-resize"
            role="separator"
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            aria-valuenow={p.sidebarWidth}
            aria-valuemin={220}
            aria-valuemax={500}
            tabIndex={0}
            onMouseDown={() => p.setIsResizing(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                p.setSidebarWidth((w) =>
                  Math.min(
                    500,
                    Math.max(220, w + (e.key === "ArrowRight" ? 10 : -10)),
                  ),
                );
              }
            }}
          />
        </div>
        <main className="workspace-main">
          <header className="workspace-header">
            <div className="header-left">
              <button
                className="icon-button mobile-menu"
                onClick={() => p.setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Icon name="menu" />
              </button>
              <span className="header-label">WORKSPACE</span>
              <span className="header-divider">/</span>
              <span className="header-chat-title">
                {messages.length ? p.currentChat.title : "New conversation"}
              </span>
            </div>
            <div className="header-right">
              <span className="provider-badge">
                <i />
                Automatic provider
              </span>
              {p.currentUser?.role === "admin" && (
                <Link to="/admin" className="header-admin">
                  Admin ↗
                </Link>
              )}
              <Link
                to="/settings"
                className="icon-button"
                aria-label="Settings"
              >
                ⚙
              </Link>
            </div>
          </header>
          <div
            className="conversation-scroll"
            role="region"
            aria-label="Conversation"
          >
            {!messages.length ? (
              <WelcomePage setInput={p.setInput} />
            ) : (
              <div className="message-list">
                {messages.map((msg, index) => (
                  <motion.article
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`conversation-message ${msg.role === "user" ? "user-message" : "assistant-message"} ${msg.isError ? "error-message" : ""}`}
                    key={index}
                  >
                    <div className="message-avatar">
                      {msg.role === "ai" ? (
                        <NeuralMark />
                      ) : (
                        <span>{p.currentUser?.name?.slice(0, 1) || "Y"}</span>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-heading">
                        <span>{msg.role === "ai" ? "ATEELABO AI" : "You"}</span>
                        {msg.role === "ai" && (
                          <small>INTELLIGENCE, AMPLIFIED</small>
                        )}
                        <time>{msg.time}</time>
                      </div>
                      {msg.fileName && (
                        <div className="message-attachment">
                          ▤ <span>{msg.fileName}</span>
                        </div>
                      )}
                      <div className="message-text">
                        {msg.text}
                        {msg.streaming && <span className="stream-cursor" />}
                      </div>
                      {msg.role === "ai" && !msg.streaming && (
                        <div className="message-actions">
                          <button
                            aria-label="Copy response"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(msg.text);
                                setCopied(index);
                                clearTimeout(copyTimer.current);
                                copyTimer.current = setTimeout(
                                  () => setCopied(null),
                                  1800,
                                );
                              } catch {
                                alert(
                                  "Unable to copy. Please select the text manually.",
                                );
                              }
                            }}
                          >
                            {copied === index ? (
                              "✓ Copied"
                            ) : (
                              <>
                                <Icon name="copy" size={12} /> Copy
                              </>
                            )}
                          </button>
                          {index === lastAI &&
                            index === messages.length - 1 && (
                              <button
                                disabled={p.loading}
                                aria-label="Regenerate response"
                                onClick={() => p.regenerate(index)}
                              >
                                ↻ Regenerate
                              </button>
                            )}
                          <button
                            aria-label="Read response aloud"
                            onClick={() => p.speakText(msg.text)}
                          >
                            ◖ Listen
                          </button>
                          <span className="action-spacer" />
                          <button
                            aria-label="Like response"
                            aria-pressed={msg.reaction === "like"}
                            onClick={() =>
                              p.reactToMessage(p.activeChat, index, "like")
                            }
                          >
                            ＋
                          </button>
                          <button
                            aria-label="Dislike response"
                            aria-pressed={msg.reaction === "dislike"}
                            onClick={() =>
                              p.reactToMessage(p.activeChat, index, "dislike")
                            }
                          >
                            −
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.article>
                ))}
                {p.loading && !messages.some((m) => m.streaming) && (
                  <TypingIndicator />
                )}
              </div>
            )}
            <div ref={p.messagesEndRef} />
          </div>
          <div className="composer-dock">
            <div className="composer-container">
              {p.uploadedFile && (
                <div className="attachment-preview">
                  <span>▤</span>
                  <div>
                    {p.uploadedFile.name}
                    <small>Ready to analyze · PDF / DOCX</small>
                  </div>
                  <button
                    className="icon-button"
                    aria-label="Remove uploaded file"
                    onClick={() => p.setUploadedFile(null)}
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="composer">
                <textarea
                  ref={inputRef}
                  aria-label="Message Ateelabo AI"
                  value={p.input}
                  placeholder="Where will your imagination take you?"
                  rows={1}
                  maxLength={10000}
                  onChange={(e) => p.setInput(e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 160) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing &&
                      localStorage.getItem("ateelabo_enter_to_send") !== "false"
                    ) {
                      e.preventDefault();
                      p.sendMessage();
                    }
                  }}
                />
                <div className="composer-toolbar">
                  <div className="composer-tools">
                    <label
                      className="icon-button attach-button"
                      title="Attach PDF or DOCX"
                    >
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        aria-label="Attach PDF or DOCX"
                        onChange={p.handleFileUpload}
                      />
                      <Icon name="plus" size={20} />
                    </label>
                    <span className="tool-divider" />
                    <button
                      className={`icon-button ${p.listening ? "is-listening" : ""}`}
                      aria-label={
                        p.listening ? "Stop listening" : "Start voice input"
                      }
                      disabled={!p.browserSupportsSpeechRecognition}
                      onClick={p.listening ? p.stopListening : p.startListening}
                      title={
                        p.browserSupportsSpeechRecognition
                          ? "Voice input"
                          : "Voice input is not supported in this browser"
                      }
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="9" y="3" width="6" height="12" rx="3" />
                        <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" />
                      </svg>
                    </button>
                    <span className="composer-context">
                      {p.currentChat?.fileContext
                        ? "Document context attached"
                        : "Ask. Create. Discover."}
                    </span>
                  </div>
                  {p.loading ? (
                    <button
                      className="send-button stop-button"
                      onClick={p.stopGeneration}
                      aria-label="Stop response"
                    >
                      ■
                    </button>
                  ) : (
                    <button
                      className="send-button"
                      onClick={() => p.sendMessage()}
                      disabled={!p.input.trim() && !p.uploadedFile}
                      aria-label="Send message"
                    >
                      ↑
                    </button>
                  )}
                </div>
              </div>
              <div className="composer-footer">
                <span>
                  <i /> ATEELABO AI
                </span>
                <p>
                  AI can make mistakes. Always verify important information.
                </p>
                <span className="keyboard-hint">↵ to send</span>
              </div>
            </div>
          </div>
        </main>
      </div>
      {showIntro && <Intro onEnter={enter} />}
    </>
  );
}
