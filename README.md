# Business Lead Tracker

> *"The name of the game... is getting them to say yes."*

![Belfort making his first call](https://vascopatricio.com/wp-content/uploads/2022/10/TheWolfOfWallStreet-00.19.45-Belfort-making-his-first-call.png)

---

## The Problem Statement

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

## Architecture

### High-Level Overview

```mermaid
flowchart TB
    subgraph Client
        Postman[Postman / API Client]
    end

    subgraph Docker["Docker Compose"]
        subgraph App["Node.js + Express"]
            Express[Express Server]
            Zod[Zod Validation]
            Prisma[Prisma ORM]
        end

        subgraph DB["PostgreSQL"]
            PG[(business_leads)]
        end
    end

    subgraph External
        Slack[Slack Webhook]
    end

    Postman -->|HTTP Request| Express
    Express -->|Validate| Zod
    Zod -->|Query/Mutate| Prisma
    Prisma -->|SQL| PG
    Express -->|Notify| Slack
    Express -->|HTTP Response| Postman
```

### Request Flow (File to File)

```mermaid
flowchart LR
    server.ts --> app.ts
    app.ts --> lead.route.ts
    lead.route.ts --> lead.controller.ts
    lead.controller.ts -->|1. Validate| lead.schema.ts
    lead.schema.ts -->|2. Validated data| lead.controller.ts
    lead.controller.ts -->|3. Business logic| lead.service.ts
    lead.service.ts <--> database.ts
    lead.service.ts <--> slack.ts
    database.ts <--> PostgreSQL[(PostgreSQL)]
    slack.ts --> SlackAPI[Slack API]
```

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

### Database & ORM

This project uses **PostgreSQL** with **Prisma ORM** and the `@prisma/adapter-pg` for data access.

**Why a relational database?**
- The data model is highly structured
- Constraints like unique email enforcement are important
- Strong consistency guarantees are required for lead state transitions and notifications

Currently, the app uses a single `Lead` table — sufficient for the domain without premature complexity. If it scales, we can normalize into additional tables (Companies, Contacts, Activities) later.

### Entity-Relationship Diagram

```mermaid
erDiagram
    business_leads {
        int id PK "Auto-increment"
        string companyName
        string contactName
        string email UK "Unique"
        Source source "LINKEDIN | INTRO | INBOUND | OTHER"
        Status status "NEW | CONTACTED | CALL_DONE | DEAL | LOST"
        NotificationState newLeadNotification "PENDING | SENT | FAILED"
        NotificationState dealClosedNotification "PENDING | SENT | FAILED"
        datetime createdAt "Auto-generated"
        datetime updatedAt "Auto-updated"
    }
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `INT` | `PRIMARY KEY`, Auto-increment | Unique identifier |
| `companyName` | `STRING` | Required | Company name |
| `contactName` | `STRING` | Required | Contact person's name |
| `email` | `STRING` | `UNIQUE`, Required | Contact email (prevents duplicates) |
| `source` | `ENUM` | Required | Lead source: `LINKEDIN`, `INTRO`, `INBOUND`, `OTHER` |
| `status` | `ENUM` | Default: `NEW` | Lead status: `NEW`, `CONTACTED`, `CALL_DONE`, `DEAL`, `LOST` |
| `newLeadNotification` | `ENUM` | Default: `PENDING` | Slack notification state for new lead |
| `dealClosedNotification` | `ENUM` | Default: `PENDING` | Slack notification state for deal closure |
| `createdAt` | `DATETIME` | Auto-generated | Record creation timestamp |
| `updatedAt` | `DATETIME` | Auto-updated | Last modification timestamp |

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

## Prerequisites

| Requirement | Installation |
|-------------|--------------|
| **Docker** | [docker.com/get-docker](https://www.docker.com/get-docker) |
| **Docker Compose** | Included with Docker Desktop (Mac/Windows). Linux: `sudo apt install docker-compose` |
| **Git** | [git-scm.com](https://git-scm.com/) |

Optional: [VS Code](https://code.visualstudio.com/) or any code editor to view/edit files.

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/arjunthazhath2001/lead-tracker.git
cd lead-tracker
```

### 2. Create `.env` file with your Slack webhook

**Mac / Linux:**
```bash
echo 'SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL' > .env
```

**Windows (PowerShell):**
```powershell
"SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL" | Out-File -Encoding utf8 .env
```

**Windows (CMD):**
```cmd
echo SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL > .env
```

Or just create a `.env` file manually and paste:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 3. Start the application

```bash
docker-compose up --build
```

### 4. Run migrations (first time only)

```bash
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

## Assumptions & Design Decisions

This backend service was built with the following assumptions in mind:

### Lead & Company Modeling

- A company may have multiple leads, each identified by a **unique email address**
- Email uniqueness is enforced at the database level
- Multiple contacts from the same company are supported as long as their emails differ

### State Transitions

- Lead status transitions are **flexible** — you can move back from `DEAL` to earlier states if business circumstances change
- Status updates are **idempotent** — re-submitting the same status doesn't create side effects unless needed for recovery

### Notification Handling

The core value of this app is **instant team notification**. A lead that nobody knows about is a lead that gets lost.

Most apps treat notifications as fire-and-forget. We don't. **Slack notifications are a critical business event**, so we persist their state:

| State | Meaning |
|-------|---------|
| `PENDING` | Lead created, notification not yet attempted |
| `SENT` | Slack notification delivered successfully |
| `FAILED` | Slack was down or unreachable — needs retry |

This means:
- If Slack fails, **the lead is still saved** (we don't lose business data)
- Failed notifications are explicitly tracked and can be retried
- The `PATCH /leads/:id` endpoint automatically retries failed notifications

**The database is the source of truth. Slack is the delivery mechanism.**

### Other Decisions

- **Single user, no auth** — Internal tool for small teams. Auth is a future enhancement.
- **Selective notifications** — Only for `NEW` leads and `DEAL` closures. No Slack spam.

---

## Future Improvements

- [ ] Multi-user auth via Clerk/Auth0
- [ ] Lead assignment to team members
- [ ] Activity history & audit log
- [ ] React/Next.js dashboard
- [ ] Analytics & conversion tracking

---

*Built for teams that don't let leads slip away.*
