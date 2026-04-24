# Daily Email Summary — Project Notes

**Project:** Daily Email Summary
**Stack:** n8n + Claude API
**Dashboard Artifact:** `email_dashboard.html`
**Google Drive Account:** learnyourway.ai@gmail.com

---

## Pipeline Architecture

### Workflow 1 — Daily Email Writer (runs at 8am)

```
Schedule Trigger (daily 8am)
    ↓
Gmail Node × 5 accounts (read unread emails)
    ↓
Aggregate Node — field: snippet → allEmails
    ↓
Claude AI Node (claude-sonnet-4-5) — summarize all emails
    ↓
Code Node — build JSON from Claude output
    ↓
Google Drive Upload — save Email_Summary_YYYY-MM-DD.json
```

### Workflow 2 — Email Summary Server (webhook on demand)

```
Webhook Node (GET /email-summary)
    ↓
Google Drive Download — file by ID
    ↓
Respond to Webhook — Binary File (application/json)
```

---

## 5 Gmail Accounts

| # | Account |
|---|---------|
| 1 | learnyourway.ai@gmail.com |
| 2 | garg1969sanjeev@gmail.com |
| 3 | sis.sanjeev@gmail.com |
| 4 | vmanageeverything@gmail.com |
| 5 | automation.atwork69@gmail.com |

---

## n8n Node Configuration — Workflow 1

### Gmail Node
- Operation: Get Many Messages
- Filters: Unread only, last 24 hours
- One node per Gmail account (5 total)

### Aggregate Node (Combine Email Bodies)
- Aggregate: Individual Fields
- Input Field Name: `snippet` (plain text — NOT an expression, just the word)
- Rename Field: ON
- Output Field Name: `allEmails`

### Claude AI Node
- Credential: Anthropic account 3
- Model: `claude-sonnet-4-5` (set By ID)
- Resource: Text
- Operation: Message a Model
- Prompt:
  ```
  Please summarize the following emails from the last 24 hours:
  {{ $json.allEmails.join("\n\n---\n\n") }}
  ```
- Role: User
- Output field: `content[0].text`

### Code Node (Format JSON Report)
```javascript
const rawSummary = $input.item.json.content[0].text;
const date = new Date().toISOString().split('T')[0];

const sections = rawSummary.split('###').filter(s => s.trim());
const structured = sections.map(section => {
  const lines = section.trim().split('\n').filter(l => l.trim());
  const title = lines[0].replace(/^#+\s*/, '').trim();
  const items = lines.slice(1)
    .filter(l => l.startsWith('-') || l.startsWith('*') || l.startsWith('**'))
    .map(l => l.replace(/^[-*]+\s*/, '').trim());
  return { title, items };
});

const output = {
  generatedAt: date,
  accounts: [
    { email: "learnyourway.ai@gmail.com" },
    { email: "garg1969sanjeev@gmail.com" },
    { email: "sis.sanjeev@gmail.com" },
    { email: "vmanageeverything@gmail.com" },
    { email: "automation.atwork69@gmail.com" }
  ],
  summary: rawSummary,
  sections: structured
};

const jsonString = JSON.stringify(output, null, 2);

return [{
  json: {},
  binary: {
    data: await this.helpers.prepareBinaryData(
      Buffer.from(jsonString),
      `Email_Summary_${date}.json`,
      'application/json'
    )
  }
}];
```

### Google Drive Upload Node (now configured as Update)
- Credential: learnyourway.ai@gmail.com (Google Drive account 5)
- Operation: **Update** *(was Upload — changed to prevent duplicate files)*
- File to Update: By ID → `1b-LuKvJ1C5LD9aamvfoHRfZEReghovyS` (Email_Summary_Latest.json)
- Change File Content: ON
- Input Data Field Name: `data`

---

## n8n Node Configuration — Workflow 2

### Webhook Node
- Method: GET
- Path: `email-summary`
- Respond: Using Respond to Webhook Node
- Test URL: `https://automationaisanjeev.app.n8n.cloud/webhook-test/email-summary`
- Production URL: `https://automationaisanjeev.app.n8n.cloud/webhook/email-summary`

### Google Drive Download Node
- Credential: learnyourway.ai@gmail.com
- Operation: Download
- File: By ID → `1b-LuKvJ1C5LD9aamvfoHRfZEReghovyS` (Email_Summary_Latest.json — permanent file, always overwritten by Workflow 1)

### Respond to Webhook Node
- Respond With: Binary File
- Response Data Source: Choose Automatically From Input
- Response Headers:
  - Name: `Content-Type`
  - Value: `application/json`

---

## Key Fixes & Lessons Learned

| Issue | Fix |
|-------|-----|
| Aggregate node error: `textPlain not found` | Field name must be plain text `snippet`, not an expression |
| Claude output empty `{}` | Model was outdated; switched to `claude-sonnet-4-5` using "By ID" |
| Save to Disk failed (ENOENT) | n8n runs on n8n.cloud, not local machine — use Google Drive instead |
| Google Drive wrong account | n8n was saving to automation.atwork69 — switched to learnyourway.ai |
| Claude node output location | Response is at `content[0].text` in the output JSON |
| Google Drive Download wrong URL | Must use file ID not Drive homepage URL |
| Respond to Webhook not working | Nodes were not connected; Webhook Respond must be set to "Using Respond to Webhook Node" |
| HTML → JSON switch | Code node updated to output binary JSON using `prepareBinaryData()` |
| Duplicate Drive files + DATE showing `—` | Upload node changed to Update with fixed file ID `1b-LuKvJ1C5LD9aamvfoHRfZEReghovyS` — now always overwrites same file |
| Gmail headers not in payload.headers | n8n Gmail exposes From/Subject at top level: `msg.From`, `msg.Subject`, `msg.internalDate` |
| accountMap lost through Claude node | Fixed with `$('Code in JavaScript').first().json.accountMap` reference |
| btoa() fails on emoji in category names | Replaced with custom `safeid()` hash function |

---

## Dashboard: email_dashboard.html

- Dark theme, GitHub-inspired colour palette
- Self-fetching: calls production webhook on load, no manual refresh needed
- 5 account summary cards (email + count)
- 4 live metrics: Total, Deleted, Remaining, Active accounts
- 5-column email view — each email shows Date, From, Subject (full width), Body
- Per-email Delete + Undo buttons
- Per-account Delete All button
- Metrics update live as emails are deleted
- Claude's AI Summary rendered as formatted markdown
- Refresh button to reload latest data

---

## How to View Daily Summary

1. n8n Workflow 1 runs automatically at 8am daily
2. JSON file saved to Google Drive as `Email_Summary_Latest.json` (always overwrites same file ID `1b-LuKvJ1C5LD9aamvfoHRfZEReghovyS`)
3. Workflow 2 webhook serves the JSON on demand via production URL
4. Open `email_dashboard.html` — it auto-fetches and renders the dashboard

---

## Completed Tasks

- [x] Test full Workflow 1 end-to-end with JSON Code node
- [x] Activate Workflow 2 and get Production webhook URL
- [x] Build permanent self-fetching dashboard (email_dashboard.html)
- [x] Fix duplicate files — Upload node changed to Update with fixed file ID

---

## Future Improvements

- [ ] Replace `snippet` with full decoded body (`payload.parts[].body.data` base64 decoded)
- [ ] Investigate self-sent emails (sis.sanjeev → sis.sanjeev) not showing — Gmail may exclude Sent folder from INBOX unread filter
- [ ] Build a skill so Claude auto-fetches and renders on demand
- [ ] Add per-account AI digest in summary cards
- [ ] Add email categories filter in the dashboard
