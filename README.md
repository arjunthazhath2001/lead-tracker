# Business Lead Tracker

> *"The name of the game... is getting them to say yes."*

![Belfort making his first call](https://vascopatricio.com/wp-content/uploads/2022/10/TheWolfOfWallStreet-00.19.45-Belfort-making-his-first-call.png)

---

## The Problem

A lead comes in. It sits in someone's inbox. By the time your team finds out, the prospect signed with a competitor.

**This tool fixes that.** New lead? Slack notification. Deal closed? Slack notification. Your team stays in sync. No lead falls through the cracks.

---

## How It Works

1. **Add a lead** → Team gets notified instantly on Slack
2. **Track progress**: `NEW` → `CONTACTED` → `CALL_DONE` → `DEAL` or `LOST`
3. **Close the deal** → Team gets notified → Customer exits the sales funnel

### Slack Notification

![Slack notification](https://i.ibb.co/SX94C5z0/Screenshot-2026-02-02-101654.png)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 22 + TypeScript |
| Framework | Express 5 |
| Database | PostgreSQL 15 + Prisma 7 |
| Validation | Zod 4 |
| Notifications | Slack Webhooks |
| Containerization | Docker Compose |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/leads` | Create a new lead |
| `GET` | `/leads` | Get all leads (optionally filter by `?status=NEW`) |
| `PATCH` | `/leads/:id` | Update lead status |

### API Testing with Postman

This repository includes a comprehensive Postman collection that demonstrates:

- Happy path API usage
- Input validation errors
- Domain and resource errors (duplicate email, lead not found)
- System failure scenarios (Slack webhook failure)
- Retry behavior after system recovery

**How to use:**

1. Start the application (`docker-compose up --build`)
2. Open Postman → Click **Import**
3. Select `postman/Business Lead tracker API.postman_collection.json`
4. Set base URL to `http://localhost:3001`
5. Execute requests to explore system behavior

The collection serves as both documentation and an executable test suite.

---

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/arjunthazhath2001/lead-tracker.git
cd lead-tracker

# 2. Add your Slack webhook (see setup below)
echo 'SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL' > .env

# 3. Start everything
docker-compose up --build

# 4. Run migrations (first time only)
docker exec -it lead-tracker-app npx prisma migrate deploy
```

API runs at `http://localhost:3001`

---

## Slack Webhook Setup

To receive notifications, you need a Slack Incoming Webhook URL. Here's how to get one:

1. **Create a Slack App** — Go to [api.slack.com/apps](https://api.slack.com/apps) → Click **Create New App** → Choose **From scratch** → Name it and select your workspace

2. **Enable Incoming Webhooks** — In your app settings, go to **Incoming Webhooks** → Toggle **Activate Incoming Webhooks** to **On**

3. **Create a Webhook** — Click **Add New Webhook to Workspace** → Select the channel where you want notifications → Click **Authorize**

4. **Copy the URL** — You'll get a URL like:
   ```
   https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
   ```

5. **Add to `.env`** — Paste it in your `.env` file:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
   ```

📚 [Official Slack Webhook Documentation](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/)

---

## Design Decisions

### Why We Track Notification State

The core value of this app is **instant team notification**. A lead that nobody knows about is a lead that gets lost.

Most apps treat notifications as fire-and-forget: send it and hope it works. We don't. **Slack notifications are a critical business event**, so we persist their state in the database:

| State | Meaning |
|-------|---------|
| `PENDING` | Lead created, notification not yet attempted |
| `SENT` | Slack notification delivered successfully |
| `FAILED` | Slack was down or unreachable — needs retry |

This means:
- If Slack fails, **the lead is still saved** (we don't lose business data)
- We know exactly which notifications failed and can retry them
- The `PATCH /leads/:id` endpoint automatically retries failed notifications when you update a lead

**The database is the source of truth. Slack is the delivery mechanism.**

### Other Decisions

- **Single user, no auth** — Internal tool for small teams. Auth is a future enhancement.
- **Reversible statuses** — Deals fall through. Lost leads come back. Reality isn't linear.
- **Selective notifications** — Only for `NEW` leads and `DEAL` closures. No Slack spam.
- **Unique emails** — Duplicates return `409 Conflict`.

---

## Future Improvements

- [ ] Multi-user auth via Clerk/Auth0
- [ ] Lead assignment to team members
- [ ] Activity history & audit log
- [ ] React/Next.js dashboard
- [ ] Analytics & conversion tracking

---

*Built for teams that don't let leads slip away.*
