# Website Design Recreation
## Workflow
Input: reference image (+ optional styles)
1. Generate single `index.html` using Tailwind CDN (inline only).

2. Screenshot via Puppeteer (`npx puppeteer screenshot index.html --fullpage`). Capture sections if needed.

3. Compare with reference. Check:
   - spacing/padding (px)
   - fonts (size/weight/line-height)
   - colors (hex)
   - alignment/position
   - borders/shadows
   - responsiveness
   - images/icons
4. Fix all mismatches.
5. Re-screenshot + compare.
6. Repeat until ~2–3px accuracy.

Min 2 iterations. Stop only when no visible differences or user confirms.
## Defaults
- Tailwind CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Use https://placehold.co/ if images missing
- Mobile-first
- Single `index.html`
