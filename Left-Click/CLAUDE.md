# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website project intended for deployment on Netlify. Current files are empty placeholders awaiting implementation:

- `index.html` — main landing page
- `contact.html` — contact page
- `netify.toml` — Netlify deployment configuration (note: filename has a typo; correct is `netlify.toml`)
- `message.md` — purpose TBD

## Deployment

Intended deployment target is Netlify. The `netify.toml` config file should be renamed to `netlify.toml` and configured with build settings before deploying.

## Development

No build tooling is set up yet. To serve locally, use any static file server, for example:

```bash
npx serve .
# or
python3 -m http.server
```
