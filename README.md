# Email Scheduler

A production-grade email scheduling service. Schedule emails to go out at a specific time, track their status, and manage everything from a clean dashboard.

---


Tracking:

commit 63a72b0
- made the skeleton of the project
- made the compose yaml file for redis and docker
- made the schema with three tables, emails senders users campaign

commit 6d37a74
- added Redis client via ioredis
- set up BullMQ email queue with 3 retry attempts and exponential backoff
- built campaign service: creates a campaign row, fans out individual email rows per recipient with staggered scheduled times based on delaySeconds, and enqueues a BullMQ delayed job per email using the idempotencyKey as the jobId to prevent duplicates
- POST /api/campaigns — schedule a new campaign
- GET /api/campaigns?userId= — list campaigns for a user
- GET /api/campaigns/:id — campaign detail with all emails
- GET /api/emails?userId=&status= — list emails with optional status filter
- PATCH /api/emails/:id/star — toggle starred on an email
- Bull Board mounted at /admin/queues for live queue visibility

commit [M3]
- added Ethereal Email SMTP integration via nodemailer — creates a test account on first send, logs preview URL to console so you can inspect sent emails at ethereal.email
- built BullMQ email worker with configurable concurrency (WORKER_CONCURRENCY env var)
- worker checks idempotency before processing — skips if email already marked sent
- rate limiting enforced per sender per hour window using Redis counters (key: rate:{senderId}:{hourWindow}) — safe across multiple worker instances
- when hourly limit is hit, job is rescheduled to the start of the next hour window rather than dropped
- minimum delay between sends enforced after each successful send (MIN_DELAY_BETWEEN_SENDS_MS env var, default 2000ms)
- email status updated to sent/failed in DB after each job
- campaign sentCount incremented atomically after each send, campaign marked completed when sentCount reaches totalCount
- worker started automatically alongside the Express server
