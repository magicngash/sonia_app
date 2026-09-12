const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Only GET requests are supported.' }, 405);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return json({ error: 'Telegram is not configured. Add TELEGRAM_BOT_TOKEN in Netlify.' }, 503);
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=20`);
  if (!response.ok) return json({ error: `Telegram updates could not be read (HTTP ${response.status}).` }, 502);

  const payload = await response.json();
  if (!payload.ok) {
    return json({ error: payload.description || 'Telegram rejected the bot request.' }, 502);
  }
  const updates = Array.isArray(payload.result) ? payload.result : [];
  const latestMessage = [...updates].reverse().find(update => update.message?.chat?.id);

  if (!latestMessage) {
    return json({ error: 'No Telegram chat found. Start a conversation with the bot first.' }, 404);
  }

  return json({
    chatId: String(latestMessage.message.chat.id),
    name: latestMessage.message.from?.first_name || latestMessage.message.chat.title || 'Telegram user',
  });
};
