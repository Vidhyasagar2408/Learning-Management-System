import { useEffect, useRef, useState } from 'react';
import apiClient from '../../lib/apiClient';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi, I am your LMS assistant. Ask me anything about your courses.' }
  ]);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  async function onSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    try {
      const history = nextMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }));
      const { data } = await apiClient.post('/chatbot/message', { message: text, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Chatbot is unavailable right now. Please try again.' }
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded border border-line px-3 py-1 text-sm"
      >
        AI Chat
      </button>

      {open ? (
        <div className="absolute right-0 top-10 z-30 w-[340px] overflow-hidden rounded-lg border border-line bg-white shadow-lg">
          <div className="border-b border-line px-3 py-2 text-sm font-medium">LMS Assistant</div>
          <div ref={listRef} className="max-h-80 space-y-2 overflow-y-auto p-3 text-sm">
            {messages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={`rounded px-2 py-1 ${
                  m.role === 'user' ? 'ml-8 bg-accent text-white' : 'mr-8 bg-slate-100 text-slate-800'
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
          <form onSubmit={onSend} className="flex gap-2 border-t border-line p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-w-0 flex-1 rounded border border-line px-2 py-1 text-sm outline-none focus:border-accent"
              placeholder="Ask something..."
              disabled={sending}
            />
            <button
              type="submit"
              className="rounded bg-accent px-3 py-1 text-sm text-white disabled:opacity-60"
              disabled={sending}
            >
              {sending ? '...' : 'Send'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
