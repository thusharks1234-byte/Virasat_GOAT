# Virasat (विरासत)

A modern, immersive platform preserving and celebrating India's rich cultural, architectural, and historical heritage.

## Architecture

This repository is structured as a monorepo containing:
- **`VirasatX/`**: Frontend web application built with **React 19**, **Vite**, **TypeScript**, **Leaflet** (OpenStreetMap heritage mapping), and **Three.js** (interactive 3D monument reconstruction).
- **`Virasat/`**: Backend REST API built with **FastAPI**, **Supabase** (authentication, PostgreSQL, and storage), and **AI integrations** (Gemini & Groq).

```
Virasat/
├── vercel.json                 # Vercel deployment configuration for root monorepo
├── package.json                # Root workspace configuration with npm scripts
├── VirasatX/                   # Frontend Vite + React SPA
│   ├── vercel.json             # Vercel SPA routing rules for frontend
│   ├── package.json            # React + Vite dependencies
│   ├── vite.config.ts          # Vite configuration with local API proxy
│   └── src/                    # Components, state, Three.js 3D viewer, Leaflet map
└── Virasat/                    # Backend FastAPI API
    ├── vercel.json             # Vercel Serverless Function configuration
    ├── index.py                # Serverless entrypoint exporting FastAPI app
    ├── requirements.txt        # Python backend dependencies
    └── backend/
        ├── main.py             # FastAPI routes (Auth, Quests, 3D, AI, Yatra)
        └── supabase_schema.sql # Database schema
```

---

## Local Development

### 1. Frontend Setup
```bash
# From the root directory:
npm install
npm run dev
```
Or directly within `VirasatX`:
```bash
cd VirasatX
npm install
npm run dev
```
The website will start at `http://localhost:5173`. In local development, `/api` requests are automatically proxied to `http://127.0.0.1:8000`.

### 2. Backend Setup
```bash
cd Virasat/backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Backend API interactive docs will be available at `http://127.0.0.1:8000/docs`.

### 3. Environment Variables
- **Backend**: Copy `Virasat/.env.example` to `Virasat/.env` and fill in your Supabase, Gemini, and Groq API keys.
- **Frontend**: Copy `VirasatX/.env.example` to `VirasatX/.env.local` to configure `VITE_BACKEND_API_URL` and Supabase keys.

---

## Vercel Deployment

This repository is optimized for seamless Vercel deployment:

### Option A: Standard Single-Project Frontend Deployment (Recommended)
1. Import `https://github.com/thusharks1234-byte/Virasat_GOAT.git` into Vercel.
2. Leave the **Root Directory** as default (`./`).
3. Vercel automatically detects `vercel.json`, installs dependencies, builds the Vite production bundle, and serves the application with full client-side SPA routing.
4. Set the environment variable `VITE_BACKEND_API_URL` to point to your deployed backend API URL (if connecting to the live API).

### Option B: Two-Project Full Stack Deployment (Frontend + FastAPI Backend)

#### 1. Website Project (Frontend)
- **Root Directory**: `VirasatX` (or `./`)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_BACKEND_API_URL`: URL of the deployed API project (e.g. `https://virasat-api.vercel.app`)
  - `VITE_SUPABASE_URL`: (Optional) Your Supabase project URL for direct client auth
  - `VITE_SUPABASE_PUBLISHABLE_KEY`: (Optional) Your Supabase anon/publishable key

#### 2. API Project (Backend)
- **Root Directory**: `Virasat`
- **Framework Preset**: Other
- Vercel automatically detects `index.py` and installs `requirements.txt`.
- **Environment Variables**:
  - `SUPABASE_URL`: Your Supabase URL
  - `SUPABASE_SECRET_KEY`: Supabase service role key (or `SUPABASE_KEY`)
  - `SUPABASE_PUBLISHABLE_KEY`: Supabase anon key (or `SUPABASE_ANON_KEY`)
  - `GEMINI_API_KEY`: Google Gemini API key
  - `GROQ_API_KEY`: Groq API key
  - `FRONTEND_ORIGINS`: Comma-separated list of allowed origins (e.g. `https://virasat.vercel.app`)

---

## Production Checks
- **TypeScript**: Passes with zero type errors (`tsc -b`)
- **Linter**: Passes with zero errors/warnings (`oxlint`)
- **Vite Build**: Generates optimized production assets in `dist/`
