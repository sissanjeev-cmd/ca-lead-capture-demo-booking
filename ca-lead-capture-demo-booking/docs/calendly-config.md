# Calendly — Event Configuration & Integrations

**Profile username:** `learnyourway-ai`  
**Profile name:** Learn Yourway  
**Admin URL:** https://calendly.com/app/scheduling/meeting_types/user/me  

---

## Event Type: CA Firm Live Demo

| Setting | Value |
|---------|-------|
| Name | CA Firm Live Demo — 45 Minutes |
| Slug | `new-meeting` |
| Public URL | https://calendly.com/learnyourway-ai/new-meeting |
| Type | One-on-One |
| Duration | 45 minutes |
| Location | Zoom Meeting (auto-generated link) |
| Color | Purple (#8247f5) |

---

## Availability

| Setting | Value |
|---------|-------|
| Schedule | Weekdays (Mon–Fri) |
| Hours | 9:00 am – 5:00 pm |
| Time zone | America/New_York |
| Date range | 60 days into the future |
| Minimum notice | 4 hours before start |
| Buffer time | None |
| Max events per day | Unlimited |

---

## Notifications

### Basic (Built-in)

| Notification | Recipient | Trigger | Status |
|-------------|-----------|---------|--------|
| Email confirmation | Invitee (prospect) | Immediately after booking | ✅ On |
| Email confirmation | Host | Immediately after booking | ✅ On (automatic) |
| Email cancellation | Both | If event is cancelled | ✅ On |
| Email reminders | — | — | Off |
| Text reminders | — | — | Off |
| Email follow-up | — | — | Off |

> **Host notification** goes to: `automation.atwork69@gmail.com`

### Workflows (Advanced)
Currently none configured. Can be added via:  
Calendly → Workflows → Create workflow → for this event type

---

## Zoom Integration

**Status:** ✅ Connected  
**Account:** automation.atwork69@gmail.com (Zoom)  
**Admin URL:** https://calendly.com/app/integrations/zoom  

### How Zoom Works with Calendly
1. Prospect books a slot on the Calendly page
2. Calendly calls Zoom API → creates a unique meeting
3. Zoom meeting link is embedded in the confirmation email to the invitee
4. The meeting link also appears in the host's calendar invite

### To Reconnect Zoom
1. Go to https://calendly.com/app/integrations/zoom
2. Click **Connect** → Authorise via Zoom OAuth
3. Open the event editor → Location → **Zoom Meeting**
4. Save

---

## Google Calendar Integration

**Status:** ✅ Connected  
**Account:** automation.atwork69@gmail.com  
**Admin URL:** https://calendly.com/app/availability/calendar_settings  

### Permissions Granted
| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/calendar` | Read availability + write new events |

### What Google Calendar Does
- **Conflict check:** Calendly reads your calendar to hide slots where you're already busy
- **Event creation:** After booking, Calendly adds the meeting to your Google Calendar
- **Invite:** Google Calendar invite is sent to the invitee's email

### Calendar Settings
| Setting | Value |
|---------|-------|
| Calendar checked for conflicts | automation.atwork69@gmail.com (primary) |
| Calendar events are added to | automation.atwork69@gmail.com (primary) |
| Include buffers | Off |
| Auto sync changes | On |

### To Reconnect Google Calendar
1. Go to https://calendly.com/app/availability/calendar_settings
2. Click **Connect** under Google Calendar
3. Select `automation.atwork69@gmail.com`
4. Click **Continue** on Google's sign-in screen
5. Click **Continue** again on the permissions consent screen

---

## Booking Page (What the Prospect Sees)

```
┌─────────────────────────────────────────────┐
│  Learn Yourway                              │
│  CA Firm Live Demo — 45 Minutes            │
│  45 min  |  Web conferencing (Zoom)        │
├─────────────────────────────────────────────┤
│  Select a Date & Time                      │
│                                             │
│  [Calendar — Mon to Fri available]         │
│                                             │
│  Time zone: India Standard Time            │
└─────────────────────────────────────────────┘
```

After selecting a slot, the prospect fills in:
- Name
- Email

Then clicks **Schedule Event** → booking confirmed, Zoom link sent.
