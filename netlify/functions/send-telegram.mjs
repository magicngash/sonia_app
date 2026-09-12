const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Only POST requests are supported.' }, 405);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return json({ error: 'Telegram is not configured. Add TELEGRAM_BOT_TOKEN in Netlify.' }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON request.' }, 400);
  }

  const { chatId, message } = payload || {};
  if (!chatId || !message) {
    return json({ error: 'Telegram chat ID and message are required.' }, 400);
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
  });

  if (!response.ok) {
    console.error('Telegram request failed:', await response.text());
    return json({ error: 'Telegram rejected the message.' }, 502);
  }

  return json({ sent: true });
};
