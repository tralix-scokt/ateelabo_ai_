import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NeuralMark from "./NeuralMark";
import Icon from "./Icon";
export default function Sidebar({
  chats,
  activeChat,
  setActiveChat,
  createNewChat,
  deleteChat,
  renameChat,
  togglePin,
  search,
  setSearch,
  currentUser,
  handleLogout,
  onClose,
}) {
  const [menu, setMenu] = useState(null);
  useEffect(() => {
    const dismiss = (e) => {
      if (e.type === "keydown") {
        if (e.key === "Escape") setMenu(null);
      } else if (
        !e.target.closest(".chat-menu") &&
        !e.target.closest(".chat-menu-button")
      )
        setMenu(null);
    };
    document.addEventListener("click", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("click", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, []);
  return (
    <aside className="sidebar-inner">
      <Link to="/" className="brand">
        <NeuralMark />
        <div>
          ATEELABO <b>AI</b>
          <small>BEYOND THE ORDINARY</small>
        </div>
      </Link>
      <button
        className="sidebar-close icon-button"
        aria-label="Close sidebar"
        onClick={onClose}
      >
        ×
      </button>
      <button className="new-chat-button" onClick={createNewChat}>
        <Icon name="plus" /> New chat <kbd>↗</kbd>
      </button>
      <label className="chat-search">
        <Icon name="search" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
        />
        <kbd>⌘ K</kbd>
      </label>
      <div className="sidebar-section-label">
        YOUR CONVERSATIONS{" "}
        <span>{chats.length.toString().padStart(2, "0")}</span>
      </div>
      <nav className="chat-list" aria-label="Conversations">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-list-item ${chat.id === activeChat ? "active" : ""}`}
          >
            <button
              className="chat-select"
              onClick={() => setActiveChat(chat.id)}
            >
              <span>{chat.pinned ? "◇" : <Icon name="chat" size={13} />}</span>
              <span>{chat.title}</span>
            </button>
            <button
              className="chat-menu-button"
              aria-label={`Options for ${chat.title}`}
              aria-expanded={menu === chat.id}
              onClick={() => setMenu(menu === chat.id ? null : chat.id)}
            >
              ···
            </button>
            {menu === chat.id && (
              <div className="chat-menu">
                <button
                  onClick={() => {
                    togglePin(chat.id);
                    setMenu(null);
                  }}
                >
                  {chat.pinned ? "Unpin" : "Pin"} conversation
                </button>
                <button
                  onClick={() => {
                    const name = window.prompt(
                      "Rename conversation",
                      chat.title,
                    );
                    if (name?.trim()) renameChat(chat.id, name.trim());
                    setMenu(null);
                  }}
                >
                  Rename
                </button>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        chat.messages
                          .map((m) => `${m.role}: ${m.text}`)
                          .join("\n\n"),
                      );
                    } catch {
                      alert("Unable to copy this conversation.");
                    }
                    setMenu(null);
                  }}
                >
                  Copy conversation
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    deleteChat(chat.id);
                    setMenu(null);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
        {!chats.length && <p className="no-chats">No conversations found.</p>}
      </nav>
      <div className="sidebar-bottom">
        <div className="private-note">
          <span>◇</span>
          <div>
            Your space. Your ideas.<small>History saved on this device.</small>
          </div>
        </div>
        <Link className="sidebar-settings" to="/settings">
          <span>⚙</span> Settings <span>↗</span>
        </Link>
        <div className="account-row">
          <Link
            to={currentUser ? "/profile" : "/login"}
            className="account-profile"
          >
            <span className="account-avatar">
              {currentUser?.name?.slice(0, 1) || "A"}
            </span>
            <span>
              {currentUser?.name || "Your workspace"}
              <small>
                {currentUser ? "Personal account" : "Sign in to your account"}
              </small>
            </span>
          </Link>
          {currentUser && (
            <button
              className="icon-button"
              onClick={handleLogout}
              aria-label="Log out"
            >
              ⇥
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
