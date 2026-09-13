# Email Scheduler

A production-grade email scheduling service. Schedule emails to go out at a specific time, track their status, and manage everything from a clean dashboard.

https://github.com/user-attachments/assets/92dbdcce-532b-4a24-a813-9e8b198d5ebc

---

## running it

**you'll need:** node 20+ and docker desktop.

**1. spin up infra**

```bash
docker compose up -d
```

starts postgres (`5433`), redis (`6379`), and elasticsearch (`9200`).

**2. backend**

```bash
cd backend
npm install
cp .env.example .env
# fill in GOOGLE_CLIENT_ID/SECRET and SLACK_CLIENT_ID/SECRET
npm run db:generate
npm run db:migrate
npm run dev
```

runs on `localhost:3001`. queue dashboard (bull board) is at `/admin/queues`.

**3. frontend**

```bash
cd frontend
npm install
npm run dev
```

runs on `localhost:5173`.

## how it's put together

one express server handles the api, runs the bullmq queue, and does the actual email sending, all in the same process. postgres holds everything persistent, redis backs the queue and rate limiting, and elasticsearch indexes sent emails so they're searchable.

```mermaid
graph TD
    A[react frontend] -->|REST API| B[express backend]
    B --> C[(postgres)]
    B --> D[(redis)]
    B --> E[bullmq queue]
    E --> F[email worker]
    F --> G[ethereal smtp]
    F --> C
    F --> H[elasticsearch]
    B --> I[slack api]
```

## how scheduling actually works

when you submit a campaign, the backend writes a campaign row plus one email row per recipient, then queues a delayed bullmq job for each one. the delay is staggered, `index * delaySeconds`, so a batch of 50 emails doesn't all fire in the same second.

each email's `idempotencyKey` doubles as the bullmq job id, so if a job somehow gets queued twice, bullmq just deduplicates it.

when a job fires, the worker checks the idempotency status, checks the rate limit, sends through ethereal, marks the row sent, and indexes it in elasticsearch.

## surviving a restart

redis has aof persistence turned on, so pending jobs survive a server restart, nothing gets lost. completed jobs stay completed (bullmq tracks that itself), and as a second layer of safety, the worker checks each email's `sent` status in the db before sending, so even a job that somehow fires twice won't double-send.

## rate limiting

- **concurrency**, `WORKER_CONCURRENCY` (default 5) controls how many jobs run in parallel. each job only touches its own row and uses atomic redis ops, so this is safe.
- **minimum gap**, after every send, the worker waits `MIN_DELAY_BETWEEN_SENDS_MS` (default 2000ms) to avoid bursts.
- **hourly cap**, each send does a redis `INCR` on a key like `rate:senderId:hourNumber`. the key expires after an hour, so the counter resets on its own. since `INCR` is atomic, this holds up even with multiple worker instances.

if a sender hits their hourly limit, the job isn't dropped, it gets pushed to the start of the next hour via `moveToDelayed`, and slack gets notified if it's connected. the hourly limit is set per campaign in the compose form, falling back to `MAX_EMAILS_PER_HOUR` if you don't specify one.

one honest trade-off: because rate-limited jobs get bumped to the next hour, they're not guaranteed to run in strict order relative to other campaigns from the same sender. a priority queue or sorted set would fix that, didn't seem worth the complexity here.

## environment variables

| variable | default | what it's for |
|---|---|---|
| `PORT` | `3001` | express port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/emailscheduler` | postgres connection |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` | redis connection |
| `ELASTICSEARCH_URL` | `http://localhost:9200` | es connection |
| `MAX_EMAILS_PER_HOUR` | `200` | global hourly cap per sender |
| `WORKER_CONCURRENCY` | `5` | parallel jobs per worker |
| `MIN_DELAY_BETWEEN_SENDS_MS` | `2000` | gap between sends |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | none | google oauth |
| `GOOGLE_CALLBACK_URL` | `http://localhost:3001/auth/google/callback` | oauth redirect |
| `SESSION_SECRET` | none | express session secret |
| `FRONTEND_URL` | `http://localhost:5173` | cors origin |
| `SLACK_CLIENT_ID` / `SLACK_CLIENT_SECRET` | none | slack oauth |
| `SLACK_REDIRECT_URI` | `http://localhost:3001/slack/callback` | slack oauth redirect |

## features

**backend:** delayed-job scheduling (no cron/polling), jobs survive restarts, multiple sender identities per user, per-campaign delay/rate settings, redis-backed rate limiting across workers, rate-limited jobs get rescheduled rather than dropped, idempotent sends, configurable concurrency, ethereal smtp for testing, elasticsearch search, real google oauth, real slack oauth with rate-limit alerts, bull board dashboard.

**frontend:** google login, scheduled/sent email list views with status badges and starring, full email detail view, compose page with csv upload for recipients, tiptap rich text editor, elasticsearch-powered search, slack connect/disconnect with live status, loading and empty states, toast error handling, protected routes.

## ethereal email

no account setup needed, nodemailer spins up a throwaway ethereal account on first send. check your backend terminal for something like:

```
ethereal account created: abc@ethereal.email
email sent. preview: https://ethereal.email/message/...
```

open that preview link to see the actual email. note the account resets every time the server restarts.

## known trade-offs

- the worker runs inside the same process as the api, this would be split in prod.
- a fresh ethereal account gets created on every boot instead of using a fixed provider.
- scheduling something like 10,000 recipients in one request would block the thread, a real version would fan that out to a background job.
- elasticsearch failures are swallowed silently; search just comes back empty if es is down, everything else keeps working.
- sessions are in-memory, so restarting the backend logs you out (emails still send correctly at their scheduled time, this only affects the ui session).
- no template variables, email bodies are sent as raw html, no `{{firstName}}`-style substitution.
- `/admin/queues` has no auth, put it behind `requireAuth` or a separate password before shipping this anywhere real.
- slack channel is locked to whatever was selected during oauth; changing it means disconnecting and reconnecting.
