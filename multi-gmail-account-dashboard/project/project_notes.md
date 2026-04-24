# Daily Email Summary — Project Notes

**Project:** Daily Email Summary
**Stack:** n8n + Claude API
**Dashboard Artifact:** `email_dashboard.html`
**Google Drive Account:** learnyourway.ai@gmail.com

---

## Pipeline Architecture

```
Schedule Trigger (daily 8am)
    ↓
Gmail Node × 5 accounts (read unread emails)
    ↓
Aggregate Node — field: snippet → allEmails
    ↓
Claude AI Node (claude-sonnet-4-5) — summarize all emails
    ↓
Code Node — build HTML from Claude output
    ↓
Google Drive Upload — save Email_Summary_YYYY-MM-DD.html
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

## n8n Node Configuration

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

### Code Node (Format HTML Report)
```javascript
const summary = $input.item.json.content[0].text;
const date = new Date().toDateString();

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Summary - ${date}</title>
  ...
</head>
<body>
  <h1>Daily Email Summary</h1>
  <p>${date}</p>
  <div>${summary}</div>
</body>
</html>`;

return [{ json: { htmlContent: html } }];
```

### Google Drive Upload Node
- Credential: learnyourway.ai@gmail.com (Google Drive)
- Operation: Upload File
- File Name: `Email_Summary_{{$now.format('yyyy-MM-dd')}}.html`
- Input Field: `htmlContent`

---

## Key Fixes & Lessons Learned

| Issue | Fix |
|-------|-----|
| Aggregate node error: `textPlain not found` | Field name must be plain text `snippet`, not an expression |
| Claude output empty `{}` | Model was outdated; switched to `claude-sonnet-4-5` using "By ID" |
| Save to Disk failed (ENOENT) | n8n runs on n8n.cloud, not local machine — use Google Drive instead |
| Google Drive wrong account | n8n was saving to automation.atwork69 — switched to learnyourway.ai |
| Claude node output location | Response is at `content[0].text` in the output JSON |

---

## Dashboard: email_dashboard.html

- Dark theme, GitHub-inspired colour palette
- 5 account summary cards (email + count, no circles/names)
- 4 live metrics: Total, Deleted, Remaining, Active accounts
- 5-column email view — each email shows Date, From, Subject, Body
- Per-email Delete + Undo buttons
- Per-account Delete All button
- Metrics update live as emails are deleted

---

## How to View Daily Summary

1. n8n runs automatically at 8am daily
2. File saved to Google Drive (learnyourway.ai@gmail.com) as `Email_Summary_YYYY-MM-DD.html`
3. Ask Claude: *"Show me my email summary"* → Claude fetches from Drive and renders it
4. Or open `email_dashboard.html` directly from this project folder

---

## Future Improvements

- [ ] Replace `snippet` with full decoded body (`payload.parts[].body.data` base64 decoded)
- [ ] Build a skill so Claude auto-fetches and renders on demand
- [ ] Add per-account AI digest in summary cards
- [ ] Add email categories filter in the dashboard
