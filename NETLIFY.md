# Netlify deployment and email

## Deploy

Connect this GitHub repository to Netlify. Netlify will use `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Enable email

1. Create a Resend account and verify the domain you want to send from.
2. Create a Resend API key.
3. In Netlify, open Site configuration → Environment variables and add:
   - `RESEND_API_KEY`: the Resend API key
   - `EMAIL_FROM`: for example `Sonia Studio <notifications@yourdomain.com>`
4. Make sure the variables are available to Functions, then trigger a new deploy.

The app sends to the email stored on each student profile. The API key is used only by the Netlify Function and is never bundled into the browser app.

## Enable Telegram

1. Create a bot with `@BotFather` and copy its token.
2. Add `TELEGRAM_BOT_TOKEN` in Netlify Site configuration → Environment variables.
3. Ask each tutor or student to start a chat with the bot.
4. Save the resulting Telegram chat ID in their profile. A username is not a substitute for a chat ID.

Telegram messages are sent by `netlify/functions/send-telegram.mjs` using the Bot API.
