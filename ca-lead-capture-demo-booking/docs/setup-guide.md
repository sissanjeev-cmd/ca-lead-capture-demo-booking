# Setup Guide — Recreate from Scratch

Use this guide to rebuild the entire lead capture and demo booking pipeline on a fresh account. Estimated time: **~45 minutes**.

---

## Prerequisites

- A Google account (used for Typeform, Calendly, Google Calendar, Zoom)
- Free accounts on: Typeform, Calendly, Zoom

---

## Step 1 — Create the Typeform (15 min)

1. Sign in to [typeform.com](https://typeform.com)
2. Click **Create new form** → start from scratch
3. Add a **Welcome screen**:
   - Title: `Welcome to *From Spreadsheets To Smart Workflows*`
   - Description: `Tell us about your CA firm and book a free 45-minute live demo in under 3 minutes.`
   - Button: `Let's get started →`

4. Add a **Statement block** (section header):
   - Text: `Section 1 of 5 — Basic Firm Information`

5. Add fields for Section 1 (see [`typeform-structure.md`](typeform-structure.md)):
   - Short text → firm name (required)
   - Short text → contact person name (required)
   - Dropdown → role (optional)
   - Email → email address (required)
   - Phone → mobile number (required)

6. Add Statement + fields for Sections 2–5 following [`typeform-structure.md`](typeform-structure.md)

7. Click on **Endings** in the left sidebar → edit the thank-you screen:
   - Title: `Thank you! Your information has been received.`
   - Body: `Click below to book your free 45-minute live demo.`
   - Add a **Button** → text: `Book Your Free 45-Minute Live Demo`
   - Button URL: *(your Calendly event URL from Step 3)*

8. Click **Publish**

---

## Step 2 — Create the Calendly Event (10 min)

1. Sign in to [calendly.com](https://calendly.com)
2. Go to **Scheduling** → **Event types** → **Create new event type**
3. Choose **One-on-One** → **Next**
4. Fill in:
   - Event name: `CA Firm Live Demo — 45 Minutes`
   - Duration: `45 min`
   - Location: *(leave blank for now — set Zoom in Step 4)*
5. Click **Next** → set availability:
   - Days: Mon–Fri
   - Hours: 9:00 am – 5:00 pm
6. Under **Advanced** settings:
   - Date range: `60 days`
   - Minimum notice: `4 hours`
7. Click **Save**

---

## Step 3 — Connect Google Calendar (5 min)

1. In Calendly, go to **Availability** → **Calendar settings**
   (URL: `https://calendly.com/app/availability/calendar_settings`)
2. Under **Calendars to check for conflicts**, click **Connect calendar account**
3. Select **Google Calendar**
4. Choose your Google account and click **Continue** twice
5. Confirm `automation.atwork69@gmail.com` appears as connected

---

## Step 4 — Connect Zoom (5 min)

1. In Calendly, go to **Integrations & apps** → search **Zoom** → **Connect**
2. Authorise with your Zoom account
3. Go back to your event type → click the **settings gear** → **Edit**
4. In the quick editor, click **Location** → **Zoom Meeting**
5. Click **Save**

---

## Step 5 — Update Typeform Button URL (2 min)

1. Go back to your Typeform editor
2. Click on **Endings** in the sidebar → select the thank-you block
3. In the right panel, update the **Button link** to your Calendly event URL:
   `https://calendly.com/{your-username}/new-meeting`
4. Click **Publish**

---

## Step 6 — Test the Full Flow (5 min)

1. Open the Typeform: `https://form.typeform.com/to/{your-form-id}`
2. Fill in all 5 sections with test data
3. Submit → click **Book Your Free Demo**
4. On Calendly, pick an available slot
5. Enter a test name + email → **Schedule Event**
6. Check:
   - ✅ Booking confirmation email received (with Zoom link)
   - ✅ Host notification email received
   - ✅ Google Calendar invite created
   - ✅ Zoom meeting created

---

## Troubleshooting

### "Web conferencing details provided upon confirmation" but no Zoom link in email
→ Zoom may have disconnected. Go to Calendly → Integrations → Zoom → Reconnect.

### Calendly showing too many available slots (ignoring existing calendar events)
→ Google Calendar may have disconnected. Go to Calendar Settings → Reconnect.

### Typeform button not redirecting to Calendly
→ Check the button URL in the Endings block. Must be the full URL including `https://`.

### No host notification email
→ Calendly sends host notifications to the account email by default. Check spam folder.

---

## Cost Breakdown

| Platform | Plan | Cost |
|----------|------|------|
| Typeform | Free | 10 responses/month free; paid from ₹1,500/mo |
| Calendly | Free | 1 event type free; paid from ₹750/mo |
| Zoom | Free | 40-min limit on free; paid from ₹1,300/mo |
| Google Calendar | Free | Unlimited |

> For production use, upgrade Typeform (unlimited responses) and Calendly (more event types + workflows).
