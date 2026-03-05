const { env } = require('../../config/env');

const CHAT_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';

async function sendMessage({ message, history }) {
  if (!env.HF_TOKEN) {
    const err = new Error('Chatbot is not configured on server');
    err.status = 503;
    throw err;
  }

  const clippedHistory = (history || []).slice(-10);
  const messages = [
    {
      role: 'system',
      content:
        'You are an LMS assistant. Give concise, practical answers about courses, progress, and learning guidance.'
    },
    ...clippedHistory,
    { role: 'user', content: message }
  ];

  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.HF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.HF_MODEL,
      messages,
      max_tokens: 300,
      temperature: 0.4
    })
  });

  if (!response.ok) {
    const text = await response.text();
    const err = new Error(`Chatbot provider error: ${text}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    const err = new Error('Empty chatbot response');
    err.status = 502;
    throw err;
  }

  return { reply };
}

module.exports = { sendMessage };
