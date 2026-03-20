# InterviewPro — AI Interview Frontend

A dark, premium Next.js frontend for your AI Interview FastAPI backend.

## Tech Stack

| Layer       | Choice                                       |
|-------------|----------------------------------------------|
| Framework   | Next.js 14 (App Router)                      |
| Language    | TypeScript 5                                 |
| Styling     | Tailwind CSS 3 + custom design tokens        |
| Fonts       | Syne (headings) · DM Sans (body) · JetBrains Mono (data) |
| Backend     | Your FastAPI (no changes required)           |

---

## Project Structure

```
ai-interview-app/
├── app/
│   ├── layout.tsx              ← root layout + metadata
│   ├── globals.css             ← design system (glass cards, buttons, animations)
│   ├── page.tsx                ← Home — hero + resume upload
│   ├── interview/
│   │   └── page.tsx            ← Live interview session
│   └── report/
│       └── page.tsx            ← Full performance report
├── components/
│   ├── ConnectionStatus.tsx    ← Live backend health indicator
│   ├── MetricBar.tsx           ← Animated glow metric bar
│   └── ScoreRing.tsx           ← Animated SVG score ring
├── lib/
│   └── api.ts                  ← All FastAPI calls
├── types/
│   └── index.ts                ← TypeScript types
├── .env.local                  ← Environment variables (ready to use)
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Quick Start

### 1. Install dependencies

```bash
cd ai-interview-app
npm install
```

### 2. Configure environment (optional)

The `.env.local` file is pre-configured for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAX_QUESTIONS=10
```

Change `NEXT_PUBLIC_API_URL` if your FastAPI runs on a different port or host.

### 3. Start your FastAPI backend

```bash
# In your backend directory
uvicorn main:app --reload
# → running at http://localhost:8000
```

### 4. Run the frontend

```bash
npm run dev
# → http://localhost:3000
```

---

## API Endpoints Expected

Your FastAPI backend must expose these endpoints under `/api/`:

| Method | Path                               | Description                              |
|--------|------------------------------------|------------------------------------------|
| GET    | `/api/health`                      | Health check — returns `{ status, version }` |
| POST   | `/api/start`                       | Start interview — multipart `file` upload |
| POST   | `/api/answer`                      | Submit answer — `{ session_id, answer }` |
| POST   | `/api/end`                         | End & generate report — `{ session_id }` |
| GET    | `/api/question/{session_id}/{num}` | Get question detail                      |

---

## Design System

### Colour Palette

| Token      | Value     | Usage                          |
|------------|-----------|--------------------------------|
| `ink-950`  | `#06070A` | Page background                |
| `ink-900`  | `#0D0F15` | Elevated surfaces              |
| `azure`    | `#3D7EFF` | Primary accent, buttons, rings |
| `electric` | `#60EFFF` | Glow gradient end              |
| `violet`   | `#A78BFA` | Knowledge metric               |
| `success`  | `#22D3A0` | Positive states, Grade A       |
| `warn`     | `#F59E0B` | Warnings, Grade C              |
| `danger`   | `#FF5757` | Errors, Grade F                |

### Key CSS Classes (in `globals.css`)

| Class          | Description                          |
|----------------|--------------------------------------|
| `.glass-card`  | Frosted glass card with glow on hover |
| `.btn-azure`   | Primary gradient button with glow    |
| `.btn-ghost`   | Subtle secondary button              |
| `.azure-text`  | Blue→cyan gradient text              |
| `.gradient-text` | White gradient text                |
| `.tag`         | Monospaced mini badge                |
| `.orb`         | Floating blurred ambient decoration  |
| `.divider`     | Horizontal gradient line             |
| `.grid-texture`| Subtle background grid pattern       |
| `.metric-fill` | Spring-physics animated bar fill     |
| `.drop-zone`   | Resume drag-and-drop target          |

---

## Production Build

```bash
npm run build
npm start
```

---

## Deployment

The app is a standard Next.js project. Deploy to:

- **Vercel** — `vercel deploy` (recommended, zero config)
- **Docker** — add a `Dockerfile` using `node:20-alpine`
- **PM2** — `npm run build && pm2 start npm -- start`

For production, set `NEXT_PUBLIC_API_URL` to your deployed FastAPI URL.
