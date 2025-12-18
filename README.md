Telegram Scraper
Lightweight real-time scraper for public Telegram channels.
Built with Node.js, TypeScript and GramJS (MTProto user client – not a bot).
Listens to multiple public channels and forwards every new message to your webhook URL instantly.
Features

Real-time message listening (event-driven)
Multiple channels support
In-memory queue with retry (3 attempts)
Duplicate protection via Telegram message ID
Max 100 pending messages (memory-safe)
No Redis or external services required
Docker-ready
Configured via .env

Security Warning
This tool uses your personal Telegram account.
The SESSION_STRING gives full access to your account.
Never share or commit your .env file.
Requirements

Node.js ≥ 20
Telegram account
API credentials from https://my.telegram.org/apps

Setup
Clone & install
textgit clone https://github.com/yourusername/telegram-scraper.git
cd telegram-scraper
npm install   # or yarn install
Create .env
textcp .env.example .env
Fill .env (get API_ID & API_HASH from https://my.telegram.org/apps)
textAPI_ID=your_id
API_HASH=your_hash
PHONE_NUMBER=+1234567890
SESSION_STRING=
CHANNELS=@channel1,@channel2
WEBHOOK_URL=http://localhost:3000/webhook
Join the channels with your Telegram account (required to receive messages).
Run
textnpm run dev   # or yarn dev

First run: enter verification code (and 2FA if enabled)
Copy printed SESSION_STRING → add to .env
Restart → auto-login

Test Webhook (optional)
Quick local test server:
textnpx express-generator test --no-view
cd test && npm install
# add in app.js:
app.post('/webhook', (req, res) => {
  console.log('Message:', req.body);
  res.sendStatus(200);
});
npm start
Docker
textdocker build -t telegram-scraper .
docker run -d --name scraper --restart always --env-file .env telegram-scraper
License
MIT
Use responsibly and respect Telegram's ToS.