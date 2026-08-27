# Portfolio Starter

A one-page personal portfolio: hero, a filterable timeline of work and projects, links block.
Responsive to 320px, accessible, deployed as static files. Built during Rewriting the Code's
**"How RTC Builds Real Software with AI"** workshop. Clone it, make it yours, keep it.

```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # lint + typecheck + tests + build
npm run deploy       # build and push to Netlify production
```

Edit **`src/content/profile.ts`**. That is the only file you touch for content; its shape is
enforced by `src/content/schema.ts`, and `npm test` tells you if you get it wrong.

**Pushing to `main` runs lint, types, and tests. The deploy only starts if all three pass.**

New here, start with [`docs/SETUP.md`](docs/SETUP.md). Doing it on your own,
[`docs/WALKTHROUGH.md`](docs/WALKTHROUGH.md). Why it is built this way, [`docs/adr/`](docs/adr/).
How it is hardened, and how to run the audit yourself, [`SECURITY.md`](SECURITY.md).

Node 24, or 22.13+. MIT licensed - see [LICENSE](LICENSE).
