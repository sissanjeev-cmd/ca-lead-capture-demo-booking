# CA Firm — Lead Capture & Demo Booking System

A fully automated pipeline that captures CA firm leads via a structured Typeform and instantly lets them book a 45-minute live demo on Calendly — with Zoom meeting auto-created and Google Calendar invite sent to both parties.

---

## Live URLs

| Resource | URL |
|----------|-----|
| 📋 Lead Capture Form | https://form.typeform.com/to/YApdU9tW |
| 📅 Demo Booking Page | https://calendly.com/learnyourway-ai/new-meeting |

---

## How It Works

```
Prospect fills Typeform (5 sections)
        ↓
Thank-you screen → "Book Your Free Demo" button
        ↓
Lands on Calendly booking page
        ↓
Picks a date & time (Mon–Fri, 9am–5pm)
        ↓
Zoom meeting auto-created → link in confirmation email
        ↓
Google Calendar invite sent to both prospect and host
        ↓
Host gets notification email at automation.atwork69@gmail.com
```

---

## System Components

| Component | Platform | Purpose |
|-----------|----------|---------|
| Lead capture form | Typeform | 5-section structured data collection |
| Demo booking | Calendly | Self-serve slot booking |
| Video meeting | Zoom | Auto-generated meeting link on booking |
| Calendar sync | Google Calendar | Availability check + event creation |
| Notifications | Calendly (built-in) | Email confirmation to invitee + host |

---

## Repository Structure

```
ca-lead-capture-demo-booking/
├── README.md                  ← You are here
├── docs/
│   ├── setup-guide.md         ← Complete step-by-step setup from scratch
│   ├── typeform-structure.md  ← All form fields, sections, logic
│   └── calendly-config.md     ← Event type, availability, integrations
└── scripts/
    └── create_github_repo.sh  ← One-command script to push this repo to GitHub
```

---

## Accounts

All services are connected under a single Google account for easy management:

| Service | Account |
|---------|---------|
| Typeform | automation.atwork69@gmail.com |
| Calendly | automation.atwork69@gmail.com |
| Google Calendar | automation.atwork69@gmail.com |
| Zoom | automation.atwork69@gmail.com |

---

## Quick Setup (Recreate from Scratch)

If you need to rebuild this on a different account, see [`docs/setup-guide.md`](docs/setup-guide.md) for the full step-by-step guide.

**Time to set up:** ~45 minutes  
**Cost:** Free tier on all platforms

---

## Related Project

The demo booking pipeline feeds into the **CA Automation Suite** — a full-stack tool that automates GST filing, bank reconciliation, tax computation, and more for CA firms.

Repo: [sissanjeev-cmd/ca-automation](https://github.com/sissanjeev-cmd/ca-automation)
