# 📡 Telegram Scraper – Lightweight Real-time MTProto Listener

A lightweight real-time scraper for public Telegram channels.
Built using Node.js + TypeScript + GramJS (MTProto user client — not a bot).
Listens to multiple channels and forwards new messages instantly to your webhook URL.

---

## ✨ Features

- Real-time message listening (event-driven)
- Multiple public channels supported
- In-memory message queue
- Retry system (3 attempts)
- Duplicate message protection (via Telegram message ID)
- Memory-safe queue limit (max 100 pending)
- No Redis / no external services required
- Docker-ready container
- Fully configurable via `.env`

---

## ⚠ Security Warning

This tool uses your personal Telegram account session.

Your `.env` contains:

```
SESSION_STRING
```

This grants full control of your Telegram account, including messages and contacts.

Never commit `.env` to git.
Never share it with anyone.
Store safely in your deployment environment.

---

## 📦 Requirements

- Node.js ≥ 20
- Telegram API credentials from https://my.telegram.org/apps

---

## 🚀 Installation

```bash
git clone https://github.com/yourusername/telegram-scraper.git
cd telegram-scraper
npm install
```

---

## ⚙ Configuration

```bash
cp .env.example .env
```

Edit `.env`:

```env
API_ID=your_id
API_HASH=your_hash
PHONE_NUMBER=+1234567890
SESSION_STRING=

CHANNELS=@channel1,@channel2
WEBHOOK_URL=http://localhost:3000/webhook
```

Ensure your Telegram account joined each channel.

---

## ▶ First Run

```bash
npm run dev
```

The CLI will ask for:

- login verification code
- 2FA password if enabled

Copy printed `SESSION_STRING` and paste into `.env`.
Restart:

```bash
npm run dev
```

---

## 🧪 Optional Webhook Test Server

```bash
npx express-generator test --no-view
cd test && npm install
```

Inside `app.js` add:

```js
app.post('/webhook', (req, res) => {
  console.log('Message received:', req.body);
  res.sendStatus(200);
});
```

Start server:

```bash
npm start
```

---

## 🐳 Docker Deployment

Build image:

```bash
docker build -t telegram-scraper .
```

Run container:

```bash
docker run -d \
  --name scraper \
  --restart always \
  --env-file .env \
  telegram-scraper
```

---

## 📜 License

MIT License. Use responsibly and comply with Telegram Terms of Service.
