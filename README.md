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

### Postman Collection

Import `postman/Business Lead tracker API.postman_collection.json` to test all endpoints.

---

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/arjunthazhath2001/lead-tracker.git
cd lead-tracker

# 2. Add your Slack webhook
echo 'SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL' > .env

# 3. Start everything
docker-compose up --build

# 4. Run migrations (first time only)
docker exec -it lead-tracker-app npx prisma migrate deploy
```

API runs at `http://localhost:3001`

---

## Design Decisions

- **Single user, no auth** — Internal tool for small teams. Auth is a future enhancement.
- **Reversible statuses** — Deals fall through. Lost leads come back. Reality isn't linear.
- **Selective notifications** — Only for `NEW` leads and `DEAL` closures. No Slack spam.
- **Notification failures don't block saves** — Database is the source of truth. Slack is best-effort.
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
