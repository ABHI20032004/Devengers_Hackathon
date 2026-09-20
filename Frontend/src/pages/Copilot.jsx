import {
  Bot,
  Copy,
  FileText,
  Plus,
  Send,
  Sparkles,
  User,
  Code2,
  Check,
  Loader2,
  Trash2,
  Paperclip,
  X,
  Image as ImageIcon,
  Image,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { sendChatMessage } from "../services/api";


// =====================================================
// FORMAT INLINE TEXT
// =====================================================

function formatInline(text) {
  const parts = text.split(
    /(\*\*.*?\*\*|`.*?`)/g
  );

  return parts.map((part, index) => {

    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (
      part.startsWith("`") &&
      part.endsWith("`")
    ) {
      return (
        <code
          key={index}
          className="inline-code"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return (
      <span key={index}>
        {part}
      </span>
    );
  });
}


// =====================================================
// CODE BLOCK
// =====================================================

function CodeBlock({ code, language }) {

  const [copied, setCopied] =
    useState(false);

  async function copyCode() {

    try {

      await navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="code-block">

      <div className="code-header">

        <div className="code-language">
          <Code2 size={14} />
          {language || "code"}
        </div>

        <button
          className="code-copy"
          onClick={copyCode}
        >
          {copied ? (
            <>
              <Check size={13} />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} />
              Copy
            </>
          )}
        </button>

      </div>

      <pre>
        <code>{code}</code>
      </pre>

    </div>
  );
}


// =====================================================
// MARKDOWN / AI ANSWER
// =====================================================

function FormattedAnswer({ text }) {

  if (!text) {
    return null;
  }

  const lines = text.split("\n");

  const elements = [];

  let insideCode = false;
  let codeLines = [];
  let language = "";

  function finishCode() {

    if (!codeLines.length) {
      return;
    }

    elements.push(
      <CodeBlock
        key={`code-${elements.length}`}
        code={codeLines.join("\n")}
        language={language}
      />
    );

    codeLines = [];
    language = "";
  }

  lines.forEach((line, index) => {

    // -----------------------------------------------
    // CODE BLOCK
    // -----------------------------------------------

    if (line.trim().startsWith("```")) {

      if (!insideCode) {

        insideCode = true;

        language =
          line
            .trim()
            .replace("```", "")
            .trim();

      } else {

        insideCode = false;

        finishCode();
      }

      return;
    }

    if (insideCode) {

      codeLines.push(line);

      return;
    }


    // -----------------------------------------------
    // EMPTY LINE
    // -----------------------------------------------

    if (!line.trim()) {

      elements.push(
        <div
          key={`space-${index}`}
          className="answer-space"
        />
      );

      return;
    }


    // -----------------------------------------------
    // HEADINGS
    // -----------------------------------------------

    if (line.startsWith("### ")) {

      elements.push(
        <h4
          key={index}
          className="answer-heading-small"
        >
          {formatInline(
            line.substring(4)
          )}
        </h4>
      );

      return;
    }

    if (line.startsWith("## ")) {

      elements.push(
        <h3
          key={index}
          className="answer-heading"
        >
          {formatInline(
            line.substring(3)
          )}
        </h3>
      );

      return;
    }

    if (line.startsWith("# ")) {

      elements.push(
        <h2
          key={index}
          className="answer-heading-large"
        >
          {formatInline(
            line.substring(2)
          )}
        </h2>
      );

      return;
    }


    // -----------------------------------------------
    // BULLETS
    // -----------------------------------------------

    if (line.trim().startsWith("- ")) {

      elements.push(
        <div
          key={index}
          className="answer-bullet"
        >

          <span>•</span>

          <span>
            {formatInline(
              line.trim().substring(2)
            )}
          </span>

        </div>
      );

      return;
    }


    // -----------------------------------------------
    // NUMBERED LIST
    // -----------------------------------------------

    const numbered =
      line
        .trim()
        .match(/^(\d+)\.\s(.*)$/);

    if (numbered) {

      elements.push(
        <div
          key={index}
          className="answer-number"
        >

          <span>
            {numbered[1]}.
          </span>

          <span>
            {formatInline(
              numbered[2]
            )}
          </span>

        </div>
      );

      return;
    }


    // -----------------------------------------------
    // NORMAL PARAGRAPH
    // -----------------------------------------------

    elements.push(
      <p
        key={index}
        className="answer-paragraph"
      >
        {formatInline(line)}
      </p>
    );

  });

  if (insideCode) {
    finishCode();
  }

  return (
    <div className="formatted-answer">
      {elements}
    </div>
  );
}


// =====================================================
// MESSAGE
// =====================================================

function MessageBubble({ message }) {

  const [copied, setCopied] =
    useState(false);

  const isUser =
    message.role === "user";


  async function copyMessage() {

    try {

      await navigator.clipboard.writeText(
        message.content
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);

    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div
      className={
        isUser
          ? "copilot-message user-message"
          : "copilot-message assistant-message"
      }
    >

      <div
        className={
          isUser
            ? "message-avatar user-avatar"
            : "message-avatar ai-avatar"
        }
      >

        {isUser ? (
          <User size={17} />
        ) : (
          <Bot size={18} />
        )}

      </div>


      <div className="message-content">

        <div className="message-name">

          {isUser
            ? "You"
            : "NSpectAI"}


          {/* AUTOMATIC MODEL INFO */}

          {!isUser &&
            message.model && (

            <span className="model-badge">

              {message.type === "code" && (
                <Code2 size={10} />
              )}

              {message.type === "pdf" && (
                <FileText size={10} />
              )}

              {message.type === "general" && (
                <Sparkles size={10} />
              )}

              {message.model}

            </span>

          )}

        </div>


        <div className="message-text">

  {message.image && (
    <div className="uploaded-chat-image">

      <img
        src={message.image}
        alt={message.imageName || "Uploaded image"}
      />

      {message.imageName && (
        <div className="uploaded-image-name">
          {message.imageName}
        </div>
      )}

    </div>
  )}

  <FormattedAnswer
    text={message.content}
  />
  {!isUser &&
  message.type === "pdf" &&
  message.sources &&
  message.sources.length > 0 && (
    <div className="message-sources">

      <div className="sources-title">
        <FileText size={14} />
        <span>PDF Sources</span>
      </div>

      <div className="sources-list">

        {message.sources.map((source, index) => (
          <div
            key={`${source.filename}-${source.page_number}-${index}`}
            className="source-item"
          >

            <FileText size={13} />

            <span className="source-filename">
              {source.filename}
            </span>

            <span className="source-page">
              Page {source.page_number}
            </span>

          </div>
        ))}

      </div>

    </div>
)}

</div>


        {!isUser && (

          <button
            className="message-copy"
            onClick={copyMessage}
          >

            {copied ? (
              <>
                <Check size={13} />
                Copied
              </>
            ) : (
              <>
                <Copy size={13} />
                Copy
              </>
            )}

          </button>

        )}

      </div>

    </div>
  );
}


// =====================================================
// MAIN COPILOT
// =====================================================

export default function Copilot() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const imageInputRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // ===================================================
  // IMAGE UPLOAD
  // ===================================================

  function handleImageSelect(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");

    // Reset input so the same image can be selected again later
    event.target.value = "";
  }

  function removeSelectedImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  // ===================================================
  // AUTO SCROLL
  // ===================================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ===================================================
  // NEW CHAT
  // ===================================================

  function newChat() {
    setMessages([]);
    setInput("");
    setError("");

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }

  // ===================================================
  // SEND
  // ===================================================

  async function handleSend() {

    const question =
      input.trim();

    if (!question || loading) {
      return;
    }


const userMessage = {
  id: Date.now(),
  role: "user",
  content: question,
  image: selectedImage
    ? URL.createObjectURL(selectedImage)
    : null,
  imageName: selectedImage
    ? selectedImage.name
    : null,
};


    setMessages(current => [
      ...current,
      userMessage,
    ]);

    setInput("");

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);

    setError("");

    setLoading(true);


    try {

      /*
       * IMPORTANT:
       *
       * We no longer send mode/use_pdf.
       *
       * Backend decides automatically:
       *
       * General → llama3.1:8b
       * Code    → qwen2.5-coder:7b
       * PDF     → RAG + llama3.1:8b
       */

      const response =
  await sendChatMessage({

    message: question,

    image: selectedImage,

  });


      const assistantMessage = {

        id: Date.now() + 1,

        role: "assistant",

        content:
          response.answer ||
          "I couldn't generate an answer.",

        model:
          response.model,

        type:
          response.type,

        sources:
          response.sources || [],

      };


      setMessages(current => [
        ...current,
        assistantMessage,
      ]);


    } catch (error) {

      console.error(
        "NSpectAI error:",
        error
      );

      setError(
        error.message ||
        "Unable to connect to NSpectAI."
      );

    } finally {

      setLoading(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);

    }
  }


  // ===================================================
  // ENTER
  // ===================================================

  function handleKeyDown(event) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSend();
    }
  }


  // ===================================================
  // QUICK QUESTIONS
  // ===================================================

  function setQuickQuestion(question) {

    setInput(question);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }


  return (
    <div className="copilot-page">


      {/* ================================================
          HEADER
      ================================================= */}

      <div className="copilot-header">

        <div className="copilot-title">

          <div className="copilot-logo">
            <Sparkles size={29} />
          </div>

          <div>

            <h1>
              InSpect AI
            </h1>

            <p>
              Offline Industrial Inspection Assistant
            </p>

          </div>

        </div>


        <button
          className="new-chat-button"
          onClick={newChat}
        >

          <Plus size={16} />

          New Chat

        </button>

      </div>


      {/* ================================================
          AUTOMATIC ROUTING STATUS
      ================================================= */}

      <div className="copilot-status-bar">

        <div className="status-dot" />

        <span>
          Automatic AI routing enabled
        </span>

        <span className="status-divider">
          •
        </span>

        <span>
          Local models
        </span>

        <span className="status-divider">
          •
        </span>

        <span>
          No cloud AI required
        </span>

      </div>


      {/* ================================================
          CHAT
      ================================================= */}

      <div className="copilot-chat">

        {messages.length === 0 ? (

          <div className="copilot-empty">

            <div className="empty-ai-icon">
              <Bot size={30} />
            </div>


            <h2>
              How can I help you?
            </h2>


            <p>
              Ask a question and NSpectAI
              automatically selects the right AI model.
            </p>


            {/* QUICK QUESTIONS */}

            <div className="suggestion-grid">

              <button
                onClick={() =>
                  setQuickQuestion(
                    "Explain the importance of industrial safety inspections."
                  )
                }
              >

                <Sparkles size={16} />

                <span>
                  Explain industrial safety
                </span>

              </button>


              <button
                onClick={() =>
                  setQuickQuestion(
                    "Debug this Python code and explain the error."
                  )
                }
              >

                <Code2 size={16} />

                <span>
                  Debug my code
                </span>

              </button>


              <button
                onClick={() =>
                  setQuickQuestion(
                    "What hazards were identified in the uploaded inspection report?"
                  )
                }
              >

                <FileText size={16} />

                <span>
                  Ask about inspection PDFs
                </span>

              </button>

            </div>


            {/* MODEL CARDS */}

            <div className="model-info">

              <div>

                <Sparkles size={24} />

                <span>
                  General
                </span>

                <small>
                  Llama 3.1 8B
                </small>

              </div>


              <div>

                <Code2 size={24} />

                <span>
                  Code
                </span>

                <small>
                  Qwen Coder 7B
                </small>

              </div>

              <div>

                <Image size={24} />

                <span>
                  Image
                </span>

                <small>
                  Tesseract OCR
                </small>

              </div>


              <div>

                <FileText size={24} />

                <span>
                  Documents
                </span>

                <small>
                  ChromaDB + RAG
                </small>

              </div>

            </div>

          </div>

        ) : (

          <div className="message-list">

            {messages.map(message => (

              <MessageBubble
                key={message.id}
                message={message}
              />

            ))}


            {loading && (

              <div className="copilot-message assistant-message">

                <div className="message-avatar ai-avatar">
                  <Bot size={18} />
                </div>


                <div className="message-content">

                  <div className="message-name">
                    InSpect AI
                  </div>


                  <div className="typing-indicator">

                    <Loader2
                      size={16}
                      className="spin"
                    />

                    Selecting model and thinking...

                  </div>

                </div>

              </div>

            )}


            <div ref={bottomRef} />

          </div>

        )}

      </div>


      {/* ================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="copilot-error">

          <span>
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* ================================================
          INPUT
      ================================================= */}

<div className="copilot-input-area">

  {/* Uploaded image preview */}
  {selectedImage && imagePreview && (
    <div className="selected-image-preview">

      <img
        src={imagePreview}
        alt="Selected upload"
        className="selected-image-preview-img"
      />

      <div className="selected-image-info">
        <span>{selectedImage.name}</span>
      </div>

      <button
        type="button"
        onClick={removeSelectedImage}
        disabled={loading}
        title="Remove image"
        className="remove-selected-image"
      >
        <X size={14} />
      </button>

    </div>
  )}

  <div className="copilot-input-box">

    <input
      ref={imageInputRef}
      type="file"
      accept="image/*"
      onChange={handleImageSelect}
      style={{ display: "none" }}
    />

    <button
      type="button"
      className="image-upload-button"
      onClick={() =>
        imageInputRef.current?.click()
      }
      disabled={loading}
      title="Upload image for OCR"
    >
      <Paperclip size={18} />
    </button>

    <textarea
      ref={textareaRef}
      value={input}
      onChange={event =>
        setInput(event.target.value)
      }
      onKeyDown={handleKeyDown}
      placeholder="Ask NSpectAI anything..."
      rows={1}
      disabled={loading}
    />

    <button
      className="send-button"
      onClick={handleSend}
      disabled={
        !input.trim() ||
        loading
      }
    >

      {loading ? (
        <Loader2
          size={18}
          className="spin"
        />
      ) : (
        <Send size={18} />
      )}

    </button>

  </div>

  <div className="copilot-input-footer">

    <span>
    InSpectAI automatically selects the best local model
    </span>

    <span>
      Enter to send • Shift + Enter for new line
    </span>

  </div>

</div>


 {selectedImage && imagePreview && (
  <div className="selected-image-preview">

    <img
      src={imagePreview}
      alt={selectedImage.name}
      className="selected-image-preview-img"
    />

    <span>
      {selectedImage.name}
    </span>

    <button
      type="button"
      onClick={removeSelectedImage}
      disabled={loading}
    >
      <X size={14} />
    </button>

  </div>
)}


      {/* ================================================
          CLEAR
      ================================================= */}

      {messages.length > 0 && !loading && (

        <button
          className="clear-chat-button"
          onClick={newChat}
        >

          <Trash2 size={14} />

          Clear

        </button>

      )}

    </div>
  );
}