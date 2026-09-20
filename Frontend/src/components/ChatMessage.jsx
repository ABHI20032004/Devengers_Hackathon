export default function ChatMessage({
  role,
  content,
}) {

  const isUser =
    role === "user";

  return (
    <div
      className={`chat-message ${
        isUser ? "user" : "ai"
      }`}
    >

      <div className="chat-bubble">
        {content}
      </div>

    </div>
  );
}