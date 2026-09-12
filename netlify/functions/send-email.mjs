const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const escapeHtml = (value = '') =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);

export default async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Only POST requests are supported.' }, 405);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return json({
      error: 'Email is not configured. Add RESEND_API_KEY and EMAIL_FROM in Netlify.',
    }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON request.' }, 400);
  }

  const { to, recipientName, title, message } = payload || {};
  if (!to || !title || !message) {
    return json({ error: 'Recipient, subject, and message are required.' }, 400);
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: title,
      text: `Hi ${recipientName || 'there'},\n\n${message}`,
      html: `<p>Hi ${escapeHtml(recipientName || 'there')},</p><p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error('Resend request failed:', details);
    return json({ error: 'The email provider rejected the message.' }, 502);
  }

  return json({ sent: true });
};
