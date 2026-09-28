# SCOPE DIVISION FOR VIRASAT (FRONTEND & GEMINI API)

This document outlines the clear division of tasks and scope boundaries for the Virasat project, ensuring seamless collaboration without overlapping or breaking dependencies.

## Mayank's Scope (No DB/Supabase, Frontend + Gemini)
Mayank is exclusively responsible for the frontend architecture, multi-language UI, cinematic animations, and Gemini API integrations. 
**Crucial Requirement:** All implementations in this scope must remain 100% functional locally without throwing missing environment errors for unauthorized databases.

Specific responsibilities include:
- Cinematic 3D scroll engine & responsive layout.
- Multi-language localization engine (English, Hindi, Kannada, Punjabi, Haryanvi).
- Chapters Modal overlay (all 8 chapters displayed).
- Chapter 02 (Kathakar AI Guide) direct Gemini API client integration.
- Client-side interactive features:
  - Lipika Lens
  - Tirth-Yatra Crowd Forecast
  - Vyanjan Scanner

## Team Scope (Backend / Supabase)
The rest of the team will handle the backend infrastructure and Supabase-dependent modules. These are treated as modular components.

Specific responsibilities include:
- Blockchain Yatra Passports
- Parampara Lore Quests
- Kala-Kriti AR Try-On persistence

---
*Note: Any integration points between the frontend and the database must use resilient failure modes on the client-side to ensure the UI does not crash if the database connection is absent.*
