# LeadEnforce Clone - Social Automation & Lead Generation Framework

A comprehensive SaaS platform for automating lead generation, outreach, and engagement across **LinkedIn**, **Instagram**, and **Facebook** with advanced anti-ban protection and human-like behavior emulation.

## ⚠️ Legal Disclaimer

**IMPORTANT**: This system automates interactions on social platforms which may violate their Terms of Service. Use at your own risk. The creators are not responsible for:
- Account suspensions or bans
- Legal consequences
- Data loss or security breaches

Always inform users of risks and obtain proper consent.

## 🚀 Features

### Phase 1 (MVP - LinkedIn)
- ✅ **Authentication System** - JWT-based user authentication
- ✅ **Campaign Management** - Create and manage automation campaigns
- ✅ **LinkedIn Automation**
  - Connection requests with personalized notes
  - Sales Navigator profile scraping
  - Human-like behavior emulation
  - Account warm-up routine (14-day gradual increase)
- ✅ **Analytics Dashboard** - Real-time metrics and conversion rates
- ✅ **Anti-Ban Framework**
  - Random delays (30-120s)
  - Human typing with typos
  - Natural scrolling patterns
  - Warmup scheduler

### Phase 2 (Safety Layer)
- 🔄 Proxy rotation system
- 🔄 Browser fingerprint randomization
- 🔄 Captcha detection
- 🔄 Cooldown logic

### Phase 3 (Multi-Platform)
- 📅 Instagram automation
- 📅 Facebook automation

### Phase 4 (SaaS Features)
- 📅 Billing integration (Stripe)
- 📅 Team management
- 📅 Centralized inbox

## 🏗️ Architecture

```
leadenforce-clone/
├── frontend/          # Next.js 14 dashboard
├── backend/           # Node.js/Express API
├── workers/           # Python automation workers
│   ├── linkedin/      # LinkedIn automation
│   ├── instagram/     # Instagram automation (future)
│   ├── facebook/      # Facebook automation (future)
│   └── shared/        # Shared utilities
├── database/          # PostgreSQL schema
└── docker-compose.yml # Multi-container setup
```

### Tech Stack

**Frontend**
- Next.js 14 (React)
- TypeScript
- Tailwind CSS (Glassmorphism design)
- Recharts (Analytics)
- Lucide Icons

**Backend**
- Node.js + Express
- PostgreSQL (User data, campaigns, leads)
- MongoDB (Scraped data, logs)
- Redis + BullMQ (Job queue)
- JWT Authentication

**Workers**
- Python 3.11
- Playwright (Browser automation)
- psycopg2 (PostgreSQL)
- Cryptography (Encryption)

## 📦 Installation

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+

### Quick Start with Docker

1. **Clone the repository**
```bash
cd D:/CODE/leadenforce-clone
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379

### Manual Setup (Development)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Workers
```bash
cd workers
pip install -r requirements.txt
playwright install chromium
python linkedin/linkedin_worker.py
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/leadenforce
MONGODB_URL=mongodb://admin:password@localhost:27017/leadenforce
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Proxy (Required for production)
PROXY_PROVIDER=luminati
PROXY_API_KEY=your_api_key

# Platform Limits
LINKEDIN_MAX_CONNECTS_PER_DAY=30
LINKEDIN_MAX_VISITS_PER_DAY=100
```

### Proxy Setup (Critical)

**You MUST use residential proxies to avoid IP bans.**

Recommended providers:
- Luminati (Bright Data)
- Smartproxy
- Oxylabs

**Do NOT use datacenter proxies** - they will trigger instant bans.

## 📊 Database Schema

The system uses PostgreSQL for structured data:

- `users` - User accounts
- `social_accounts` - Connected LinkedIn/Instagram/Facebook accounts
- `campaigns` - Automation campaigns
- `leads` - Scraped prospects
- `action_logs` - Automation action history
- `messages` - Inbox messages

See `database/schema.sql` for full schema.

## 🤖 How It Works

### LinkedIn Automation Flow

1. **User creates campaign** via dashboard
2. **Backend enqueues job** to Redis with delay
3. **Worker picks up job** from queue
4. **Worker initializes browser** with proxy and anti-detection
5. **Worker logs in** to LinkedIn with saved credentials
6. **Worker scrapes profiles** from Sales Navigator
7. **Worker sends connection requests** with random delays
8. **Results stored** in database
9. **Dashboard updates** with real-time stats

### Anti-Ban Measures

```python
# Random delays (Gaussian distribution)
await HumanEmulator.random_delay(30, 120)

# Human-like typing with typos
await HumanEmulator.human_type(page, selector, text)

# Natural scrolling
await HumanEmulator.random_scroll(page)

# Warmup schedule (Day 1-14)
limits = WarmupScheduler.get_daily_limits(warmup_day)
```

## 🎯 Usage

### 1. Create Account
Navigate to http://localhost:3000 and sign up.

### 2. Add Social Account
Go to Settings → Add Account → Enter LinkedIn credentials.

### 3. Create Campaign
- Name: "Tech Founders Outreach"
- Platform: LinkedIn
- Target: Sales Navigator URL
- Daily Limit: 30 connects
- Message Template: "Hi {name}, I noticed you're at {company}..."

### 4. Monitor Progress
Dashboard shows:
- Total leads contacted
- Connection acceptance rate
- Reply rate
- Conversion rate

## 🔒 Security Best Practices

1. **Encrypt credentials** - All passwords encrypted with AES
2. **Use HTTPS** in production
3. **Rotate proxies** - Change IP per account
4. **Monitor for captchas** - Auto-pause on detection
5. **Gradual warmup** - Start with 5 actions/day
6. **Rate limiting** - Enforce strict daily limits

## 🚨 Common Issues

### Account Banned
- **Cause**: Too many actions too fast
- **Solution**: Reduce daily limits, increase delays, use better proxies

### Captcha Detected
- **Cause**: Suspicious activity pattern
- **Solution**: System auto-pauses. Wait 24-48 hours before resuming.

### Login Failed
- **Cause**: LinkedIn security challenge
- **Solution**: Login manually once, save cookies

## 📈 Roadmap

- [x] Phase 1: LinkedIn MVP
- [ ] Phase 2: Safety & Anti-Ban Layer
- [ ] Phase 3: Instagram & Facebook
- [ ] Phase 4: SaaS Features (Billing, Teams)
- [ ] Phase 5: Mobile App

## 🤝 Contributing

This is a private project. Contributions are not currently accepted.

## 📄 License

Proprietary - All rights reserved.

## 🆘 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for ethical lead generation automation**
