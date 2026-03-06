import { useEffect, useRef, useState } from 'react';
import apiClient from '../lib/apiClient';

export default function ChatbotPage() {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi, I am your LMS assistant. Ask me anything about your courses.' }
  ]);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

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
      const suffix = data?.mode === 'fallback' ? '\n\n(Using local assistant fallback)' : '';
      setMessages((prev) => [...prev, { role: 'assistant', content: `${data.reply || ''}${suffix}` }]);
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: apiMessage || 'Chatbot is unavailable right now. Please try again.' }
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-semibold">LMS Chatbot</h1>
      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div ref={listRef} className="max-h-[60vh] space-y-2 overflow-y-auto p-4 text-sm">
          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${idx}`}
              className={`rounded px-3 py-2 ${
                m.role === 'user' ? 'ml-12 bg-accent text-white' : 'mr-12 bg-slate-100 text-slate-800'
              }`}
            >
              {m.content}
            </div>
          ))}
        </div>
        <form onSubmit={onSend} className="flex gap-2 border-t border-line p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-w-0 flex-1 rounded border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="Ask about courses, progress, or learning plan..."
            disabled={sending}
          />
          <button
            type="submit"
            className="rounded bg-accent px-4 py-2 text-sm text-white disabled:opacity-60"
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </section>
  );
}
