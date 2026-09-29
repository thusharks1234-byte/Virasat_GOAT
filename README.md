# Virasat (विरासत)

A modern, immersive platform preserving and celebrating India's rich cultural, architectural, and historical heritage.

## Architecture

This repository is structured as a monorepo containing:
- **`VirasatX/`**: Frontend web application built with **React 19**, **Vite**, **TypeScript**, **Leaflet** (OpenStreetMap heritage mapping), and **Three.js** (interactive 3D monument reconstruction).
- **`Virasat/`**: Backend REST API built with **FastAPI**, **Supabase** (authentication, PostgreSQL, and storage), and **AI integrations** (Gemini & Groq).

```
api/index.py                    # Shared Vercel API entrypoint
VirasatX/                       # Frontend Vite + React SPA
Virasat/backend/main.py         # FastAPI routes and AI integrations
Virasat/backend/supabase_schema.sql
requirements.txt                # Python dependencies for Vercel
vercel.json                     # Single-project frontend and API deployment
```

---

## Local Development

### 1. Frontend Setup
```bash
# From the repository root:
npm install --prefix VirasatX
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
- **Supabase Auth profiles**: Run `Virasat/backend/supabase_schema.sql` in the Supabase SQL Editor. Its Auth trigger creates/updates `public.user_accounts` records when users sign up and records last sign-in times. Passwords are handled by Supabase Auth and are never stored in `user_accounts`.

---

## Vercel Deployment

Deploy this repository as one Vercel project with the **Root Directory** set to `./`. The build publishes the Vite app and a Python FastAPI function under `/api/*`, so leave `VITE_BACKEND_API_URL` empty to use the same domain. Set these server-side Vercel environment variables for AI and saved passport stamps:

- `GEMINI_API_KEY` and/or `GROQ_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (or `SUPABASE_PUBLISHABLE_KEY`) for backend database requests under Row Level Security
- `SUPABASE_SECRET_KEY` (or `SUPABASE_KEY`) only if you later enable a server-side secret key and enforce backend authorization
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel's frontend build environment for browser sign-in

For a separate backend deployment, set `VITE_BACKEND_API_URL` to its origin and configure `FRONTEND_ORIGINS` on the backend. Never put provider or Supabase secret keys in a `VITE_*` variable.
