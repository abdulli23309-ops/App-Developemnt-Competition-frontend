# Competition Frontend (React + Vite)

Production-ready React + Vite frontend foundation for an application development competition.

## Architecture

- **Framework:** React 19 + Vite (JavaScript/JSX)
- **Routing:** React Router DOM (BrowserRouter)
- **HTTP Client:** Axios (centralized instance in `src/services/api.js`)
- **Icons:** Lucide React
- **Styling:** CSS (CSS variables in `src/styles/global.css`)
- **State:** Local React state only (no Redux or external state libraries)
- **Deployment:** Vercel (SPA static hosting)

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── assets/            # Static assets
│   ├── components/
│   │   ├── common/        # Shared UI components
│   │   └── layout/        # Layout components (Navbar, etc.)
│   ├── hooks/             # Reusable React hooks (useApi)
│   ├── pages/             # Page components (Home, NotFound)
│   ├── routes/            # Route configuration
│   ├── services/          # API service layer (api.js, endpoints.js)
│   ├── styles/            # Global CSS with design tokens
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Root component
│   └── main.jsx           # Entry point
├── .env.example           # Environment variable template
├── .gitignore
├── index.html
├── package.json
├── vercel.json            # Vercel SPA routing configuration
└── vite.config.js
```

## Prerequisites

- Node.js (LTS)
- npm

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and update the API base URL:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:5116/api
```

> **Important:** Vite environment variables prefixed with `VITE_` are embedded into the bundle at build time and are publicly visible. Never put secrets, passwords, or API keys in frontend environment variables.

### 3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5175` by default.

### 4. Run the linter

```bash
npm run lint
```

### 5. Production build

```bash
npm run build
```

Output goes to the `dist/` directory.

### 6. Preview production build locally

```bash
npm run preview
```

## How Frontend Connects to Backend

- `src/services/api.js` creates a configured Axios instance using `VITE_API_BASE_URL`.
- `src/services/endpoints.js` centralizes API path definitions (e.g., `/health`).
- `src/hooks/useApi.js` is a reusable hook for API calls with `loading`, `error`, and `data` states.
- API errors are handled centrally via an Axios response interceptor that logs errors without exposing sensitive details.
- No authentication or token handling is implemented yet.

## Vercel Deployment

### 1. Push to GitHub

Push this repository to GitHub.

### 2. Import in Vercel

- Go to [vercel.com](https://vercel.com) and import the GitHub repository.
- Vercel auto-detects Vite and uses the default build settings:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

### 3. Configure Environment Variables

In the Vercel project settings, add:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.railway.app/api` (your deployed backend URL) |

### 4. Deploy

Vercel will build and deploy on every push to the connected branch.

### SPA Routing

`vercel.json` is included to handle React Router's `BrowserRouter`. All unknown routes are served `index.html` so client-side routing works on refresh.

## API Endpoints (Backend)

The frontend expects these backend endpoints (configured in `src/services/endpoints.js`):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | API health check |
| GET | `/api/database/status` | Database connectivity check |

## Backend Repository

The ASP.NET Core backend is located at:
`E:\appdevcompetition\backend\CompetitionApi`

Deployed to Railway with SQL Server.

## Verification Checklist

- [ ] `npm install` completes without errors
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts and app loads at `http://localhost:5175`
- [ ] `npm run preview` serves the production build correctly
- [ ] `VITE_API_BASE_URL` is set in `.env` for local development
- [ ] `VITE_API_BASE_URL` is set in Vercel project settings for production