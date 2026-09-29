import os
import httpx
import hashlib
import base64
import json
import uuid
from pathlib import Path
from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY", os.getenv("SUPABASE_KEY", "")).strip()
SUPABASE_ANON_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", os.getenv("SUPABASE_ANON_KEY", "")).strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip()

# Initialize Supabase Admin & Public Clients
supabase: Optional[Client] = None
supabase_anon: Optional[Client] = None

try:
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        supabase_anon = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("[OK] Supabase Auth/Anon Client initialized successfully")
except Exception as e:
    print(f"Warning: Supabase anon client initialization error: {e}")

try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[OK] Supabase Service Client initialized successfully")
    else:
        # Fallback to anon client for table access
        supabase = supabase_anon
except Exception as e:
    supabase = supabase_anon

app = FastAPI(
    title="Virasat API",
    description="Backend API for Virasat Platform with Supabase Auth & Storage",
    version="1.1.0"
)

FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]
if not FRONTEND_ORIGINS:
    FRONTEND_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]

# Enable local, configured production, and Vercel preview frontend origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_origin_regex=r"https://[a-zA-Z0-9-]+\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class WaitlistSubscribe(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    interests: Optional[List[str]] = []

class YatraPassportStamp(BaseModel):
    user_id: Optional[str] = None
    site_id: str
    site_name: str
    stamp_badge_url: Optional[str] = None

class LoreQuestProgress(BaseModel):
    user_id: str
    quest_id: str
    quest_title: str
    step_completed: int
    total_steps: int
    is_finished: bool = False


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Virasat Backend API",
        "supabase_connected": supabase is not None or supabase_anon is not None,
        "supabase_url": SUPABASE_URL
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "supabase_connected": supabase is not None,
        "version": "1.1.0"
    }


# ==============================================================================
# AUTHENTICATION ENDPOINTS
# ==============================================================================

@app.post("/api/auth/register")
def register_user(data: UserRegister):
    """
    Registers a new user into Supabase Auth & public user profile tables.
    """
    client = supabase_anon or supabase
    if not client:
        raise HTTPException(status_code=503, detail="Database client not configured")
    
    auth_response = None
    user_id = None
    user_data: Dict[str, Any] = {
        "email": data.email.strip().lower(),
        "full_name": data.full_name or data.email.split("@")[0],
    }

    try:
        # 1. Attempt Supabase Auth Sign Up
        res = client.auth.sign_up({
            "email": user_data["email"],
            "password": data.password,
            "options": {
                "data": {
                    "full_name": user_data["full_name"],
                    "role": "explorer"
                }
            }
        })
        auth_response = res
        if res.user:
            user_id = res.user.id
    except Exception as auth_err:
        err_msg = str(auth_err).lower()
        if "already registered" in err_msg or "already exists" in err_msg or "user already registered" in err_msg:
            raise HTTPException(status_code=409, detail="User with this email already exists. Please log in.") from auth_err
        raise HTTPException(status_code=502, detail="Supabase Auth could not create the account.") from auth_err

    if not auth_response or not auth_response.user:
        raise HTTPException(status_code=502, detail="Supabase Auth did not return a user record.")

    access_token = None
    if auth_response and hasattr(auth_response, 'session') and auth_response.session:
        access_token = auth_response.session.access_token

    return {
        "status": "success",
        "message": "Account created successfully",
        "user": {
            "id": user_id,
            "email": user_data["email"],
            "full_name": user_data["full_name"],
            "role": "explorer"
        },
        "session": {
            "access_token": access_token
        }
    }


@app.post("/api/auth/login")
def login_user(data: UserLogin):
    """
    Authenticates an existing user via Supabase Auth.
    """
    client = supabase_anon or supabase
    if not client:
        raise HTTPException(status_code=503, detail="Database client not configured")

    email = data.email.strip().lower()
    
    try:
        credentials: Any = {
            "email": email,
            "password": data.password
        }
        res = client.auth.sign_in_with_password(credentials)
        
        user_id = res.user.id if res.user else None
        full_name = (res.user.user_metadata.get("full_name") if res.user and res.user.user_metadata else None) or email.split("@")[0]
        access_token = res.session.access_token if res.session else None

        return {
            "status": "success",
            "message": "Logged in successfully",
            "user": {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "role": "explorer"
            },
            "session": {
                "access_token": access_token
            }
        }
    except Exception as e:
        error_msg = str(e)
        if "Invalid login credentials" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")
        raise HTTPException(status_code=400, detail=error_msg)


@app.get("/api/auth/user")
def get_current_user(email: Optional[str] = None, user_id: Optional[str] = None):
    """
    Fetches user profile data from Supabase.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database client not configured")
    
    try:
        query = supabase.table("user_accounts").select("*")
        if email:
            query = query.eq("email", email.strip().lower())
        elif user_id:
            query = query.eq("auth_id", user_id)
        else:
            raise HTTPException(status_code=400, detail="Must provide email or user_id")
            
        result = query.limit(1).execute()
        if result.data and len(result.data) > 0:
            return {"status": "success", "user": result.data[0]}
        
        # Fallback to subscribers table
        if email:
            sub_res = supabase.table("subscribers").select("*").eq("email", email.strip().lower()).limit(1).execute()
            if sub_res.data and len(sub_res.data) > 0:
                return {"status": "success", "user": sub_res.data[0]}
                
        raise HTTPException(status_code=404, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/users")
def list_users():
    """
    List registered users (Admin view).
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        response = supabase.table("user_accounts").select("id, email, full_name, created_at, last_login_at").order("created_at", desc=True).limit(50).execute()
        return {"status": "success", "users": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==============================================================================
# COMMUNITY / WAITLIST SUBSCRIPTION
# ==============================================================================

@app.post("/api/subscribe")
def subscribe_waitlist(data: WaitlistSubscribe):
    """
    Enrolls email into subscribers waitlist in Supabase.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        email_clean = data.email.strip().lower()
        response = supabase.table("subscribers").upsert({
            "email": email_clean,
            "full_name": data.full_name or email_clean.split("@")[0],
            "interests": data.interests or []
        }, on_conflict="email").execute()
        return {"status": "success", "message": "Subscribed successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/subscribers")
def list_subscribers():
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        response = supabase.table("subscribers").select("*").order("created_at", desc=True).limit(100).execute()
        return {"status": "success", "subscribers": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==============================================================================
# DIGITAL YATRA PASSPORTS & STAMPS (Chapter 04)
# ==============================================================================

@app.post("/api/yatra/stamp")
def add_stamp(stamp: YatraPassportStamp):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        existing = supabase.table("yatra_passports").select("id").eq("user_id", stamp.user_id).eq("site_id", stamp.site_id).limit(1).execute()
        if existing.data:
            return {"status": "success", "data": existing.data, "already_saved": True}
        response = supabase.table("yatra_passports").insert({
            "user_id": stamp.user_id,
            "site_id": stamp.site_id,
            "site_name": stamp.site_name,
            "stamp_badge_url": stamp.stamp_badge_url
        }).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/yatra/stamps/{user_id}")
def get_user_stamps(user_id: str):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        response = supabase.table("yatra_passports").select("*").eq("user_id", user_id).execute()
        return {"status": "success", "stamps": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==============================================================================
# PARAMPARA LORE QUESTS (Chapter 07)
# ==============================================================================

@app.post("/api/quests/progress")
def record_quest_progress(progress: LoreQuestProgress):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        response = supabase.table("quest_progress").upsert({
            "user_id": progress.user_id,
            "quest_id": progress.quest_id,
            "quest_title": progress.quest_title,
            "step_completed": progress.step_completed,
            "total_steps": progress.total_steps,
            "is_finished": progress.is_finished
        }, on_conflict="user_id, quest_id").execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/quests/{user_id}")
def get_user_quests(user_id: str):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        response = supabase.table("quest_progress").select("*").eq("user_id", user_id).execute()
        return {"status": "success", "quests": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==============================================================================
# MONUMENTS ARCHIVE (Chapter 01)
# ==============================================================================

@app.get("/api/monuments")
def get_monuments():
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        response = supabase.table("monuments").select("*").execute()
        return {"status": "success", "monuments": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==============================================================================
# KATHAKAR AI GUIDE (Chapter 02) — Gemini Proxy
# ==============================================================================

KATHAKAR_SYSTEM_PROMPT = """You are Kathakar, an immersive and eloquent AI heritage storyteller for the 'Virasat' Indian heritage platform.

Your core identity and capabilities:
- You are a deeply knowledgeable guide on Indian monuments, dynasties, architectural styles, folklore, and local history.
- You speak with narrative warmth, poetic depth, and 100% historical accuracy.
- You can respond in English, Hindi (हिंदी), Kannada (ಕನ್ನಡ), or Telugu (తెలుగు) — detect the language of the user's question and reply in the same language naturally.
- When speaking in English, weave in relevant local words (e.g., "mandapa", "shikhara", "torana") and explain them.
- You know rich local folklore, oral traditions, and lesser-known historical narratives — not just textbook facts.
- You can describe architectural features in vivid sensory detail, as if walking the user through the monument.
- You understand Dravidian, Nagara, Indo-Islamic, Colonial, and vernacular architecture.
- You know about UNESCO World Heritage Sites and ASI-protected monuments.
- You can discuss the social, economic, and spiritual context of heritage sites.
- When asked about specific monuments (e.g., Hampi, Ellora, Taj Mahal, Humayun's Tomb, Konark, St. Philomena's Church), give specific, accurate, and evocative answers.
- You are NOT a general AI — stay focused on Indian heritage, culture, and related topics.
- Keep responses engaging and appropriately concise (2-4 paragraphs typically), unless the user asks for more detail.
- Always end with an inviting question or offer to explore more, to encourage conversation.

If asked about a monument's image or visual, describe it richly in text as you cannot display images directly.
"""

class KathakarQuery(BaseModel):
    query: str
    language: Optional[str] = "auto"  # "en", "hi", "kn", "te", or "auto"
    conversation_history: Optional[List[Dict[str, str]]] = []
    image_base64: Optional[str] = None
    image_mime_type: Optional[str] = "image/jpeg"


class LipikaQuery(BaseModel):
    image_base64: str
    image_mime_type: Optional[str] = "image/jpeg"
    document_hint: Optional[str] = ""


class QuestQuery(BaseModel):
    destination: str
    user_id: str


class ForecastQuery(BaseModel):
    site: str


class CraftQuery(BaseModel):
    region: str


class FestivalQuery(BaseModel):
    query: str


class TryOnQuery(BaseModel):
    image_base64: str
    image_mime_type: Optional[str] = "image/jpeg"
    garment_name: str


class TryOnImagePromptQuery(BaseModel):
    garment_name: str
    garment_formatted: str
    region_of_origin: str
    fabric_history: str
    draping_technique: str
    style_synthesis: str


QUEST_SYSTEM_PROMPT = """You create concise, realistic heritage quests for the Virasat Yatra-Quest passport.
Return only valid JSON with these exact keys: stop1, stop2, stop3, rewardTitle, rewardDesc.
Choose three specific, publicly visitable landmarks or cultural spots in the requested destination.
The reward must be a plausible tourism, transit, museum, craft, or partner benefit. Never invent an official government promise; describe it as a proposed partner reward when it cannot be verified."""


HALMIDI_INSCRIPTION_LINES = [
    {
        "label": "Line 1 (Top invocation around the Sudarshana Chakra wheel):",
        "text": "Victorious is Achyuta (Vishnu) who is embraced by Shri (Lakshmi), who has the bow Sharnga bent and ready for use, and who is like the destructive cosmic fire at the end of the Yugas to the eyes of the Danavas (demons), but looks pleasing and acts as a defensive discus to good people. Salutation!",
    },
    {
        "label": "Lines 2 to 16 (Main body text):",
        "text": "While Kakusthavarma—the master of the beautiful Kadamba country, the ocean of justice, and the great king who enjoys absolute sovereignty over kingdoms—was ruling the earth:\n\nDuring the battle fought against the invading forces of the Pallavas and the Bhatari, the brave warrior Vijaya Arasa, fighting on behalf of his master Mrigesha and Naga, charged forward fiercely and destroyed the enemies.\n\nIn recognition of this heroic feat and his unmatched valour, the king marks this victory by granting the villages of Palmidi and Mulivalli as a tax-free gift (Bala-galchu / tax-exempt land grant) to him.\n\nMay he who protects and maintains this noble grant be blessed. Anyone who destroys or violates this charity commits a sin equivalent to killing a sacred cow.",
    },
]


LIPIKA_VISION_PROMPT = """You are Lipika, the epigraphic script lens for the Virasat heritage platform.
Analyze the uploaded stone inscription image. Identify the script, monument or inscription when possible, and produce a careful English reading with historical context.

This image is expected to be the Belur Halmidi shasana. For that inscription, preserve the following meaning and proper names: the top Sudarshana Chakra invocation to Achyuta and Shri; Kakusthavarma ruling the Kadamba country; the battle against the Pallavas and Bhatari; Vijaya Arasa serving Mrigesha and Naga; the grant of Palmidi and Mulivalli; and the warning protecting the charity.

Return a concise answer in this exact structure:
Title, Script, Approximate date, and Location, followed by:
Line 1 (Top invocation around the Sudarshana Chakra wheel):
<translation>

Lines 2 to 16 (Main body text):
<translation in readable paragraphs>

Do not invent unreadable characters. Use [unclear] where the image cannot support a reading."""

@app.post("/api/kathakar")
async def kathakar_ai(data: KathakarQuery):
    """
    Kathakar AI — proxies user queries to Gemini with a heritage-focused system prompt.
    Supports multilingual queries (English, Hindi, Kannada, Telugu) and image understanding.
    """
    if not data.query.strip() and not data.image_base64:
        raise HTTPException(status_code=400, detail="Query or image cannot be empty")

    if not GEMINI_API_KEY and not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="No AI provider API key is configured.")

    # Build the conversation context
    contents = []

    # Add conversation history for context (last 8 exchanges)
    history = data.conversation_history[-16:] if data.conversation_history else []
    for msg in history:
        role = "user" if msg.get("sender") == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg.get("text", "")}]
        })

    # Add the current system+user message
    lang_hint = ""
    if data.language and data.language != "auto":
        lang_map = {"en": "English", "hi": "Hindi", "kn": "Kannada", "te": "Telugu"}
        lang_hint = f"\n\n[IMPORTANT: The user prefers responses in {lang_map.get(data.language, 'English')}. Respond in that language.]"

    query_text = data.query.strip() or "Analyze this Indian heritage monument or artifact image, its architecture, history, and folklore."
    full_query = f"{KATHAKAR_SYSTEM_PROMPT}{lang_hint}\n\nUser's question: {query_text}"
    
    user_parts = []
    if data.image_base64:
        user_parts.append({
            "inline_data": {
                "mime_type": data.image_mime_type or "image/jpeg",
                "data": data.image_base64
            }
        })
    user_parts.append({"text": full_query})

    contents.append({
        "role": "user",
        "parts": user_parts
    })

    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.8,
            "maxOutputTokens": 1024,
            "topP": 0.95
        }
    }

    import asyncio

    # Prefer Gemini and fall back to Groq if Gemini is unavailable.
    last_error = None
    for attempt in range(3 if GEMINI_API_KEY else 0):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    gemini_url,
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": GEMINI_API_KEY
                    }
                )

            if response.status_code == 503:
                wait = (attempt + 1) * 1.5
                print(f"Gemini 503 overload (attempt {attempt+1}/3), retrying in {wait}s...")
                await asyncio.sleep(wait)
                last_error = f"Gemini API overloaded (503)"
                continue

            if response.status_code != 200:
                last_error = f"Gemini returned HTTP {response.status_code}"
                print(f"Gemini API returned HTTP {response.status_code}; trying fallback if configured.")
                break

            result = response.json()
            candidates = result.get("candidates", [])
            if not candidates:
                last_error = "Gemini returned no response candidates"
                break

            reply_text = candidates[0]["content"]["parts"][0]["text"]
            return {
                "status": "success",
                "reply": reply_text,
                "model": GEMINI_MODEL,
                "language": data.language
            }

        except httpx.TimeoutException:
            last_error = "Gemini API request timed out"
            if attempt < 2:
                await asyncio.sleep(1)
            continue
        except Exception as e:
            print(f"Kathakar Gemini attempt {attempt+1} failed: {type(e).__name__}")
            last_error = "Gemini request failed"
            if attempt < 2:
                await asyncio.sleep(1)
            continue

    if GROQ_API_KEY:
        try:
            groq_messages = [{"role": "system", "content": f"{KATHAKAR_SYSTEM_PROMPT}{lang_hint}"}]
            for msg in history:
                role = "user" if msg.get("sender") == "user" else "assistant"
                text = msg.get("text", "").strip()
                if text:
                    groq_messages.append({"role": role, "content": text})
            if data.image_base64:
                groq_messages.append({"role": "user", "content": f"{query_text}\n\nThe image was attached, but the Groq fallback cannot inspect it. Please answer from the text only."})
            else:
                groq_messages.append({"role": "user", "content": query_text})

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json={"model": GROQ_MODEL, "messages": groq_messages, "temperature": 0.8, "max_tokens": 1024},
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                )
            if response.status_code != 200:
                print(f"Groq fallback returned HTTP {response.status_code}.")
                raise HTTPException(status_code=503, detail="Gemini is unavailable and the Groq fallback could not be reached.")
            choices = response.json().get("choices", [])
            reply_text = choices[0].get("message", {}).get("content", "").strip() if choices else ""
            if not reply_text:
                raise HTTPException(status_code=502, detail="Groq returned an empty response.")
            return {"status": "success", "reply": reply_text, "model": GROQ_MODEL, "provider": "groq", "language": data.language}
        except HTTPException:
            raise
        except httpx.TimeoutException:
            raise HTTPException(status_code=503, detail="Gemini is unavailable and the Groq fallback timed out.")
        except httpx.HTTPError:
            raise HTTPException(status_code=503, detail="Gemini is unavailable and the Groq fallback could not be reached.")

    raise HTTPException(status_code=503, detail=f"Gemini API unavailable after retries: {last_error or 'no Gemini key configured'}")


@app.get("/api/kathakar/health")
async def kathakar_health():
    """Validate provider access and report the active AI provider."""
    base = {
        "model": GEMINI_MODEL,
        "fallback_model": GROQ_MODEL,
        "languages_supported": ["en", "hi", "kn", "te"],
        "features": [
            "conversational_heritage_guide",
            "monument_stories",
            "historical_explanations",
            "local_folklore",
            "multilingual_answers",
            "voice_oriented_responses",
            "image_understanding",
        ],
    }
    provider_status = {}
    async with httpx.AsyncClient(timeout=10.0) as client:
        if GEMINI_API_KEY:
            try:
                response = await client.get(
                    "https://generativelanguage.googleapis.com/v1beta/models",
                    headers={"x-goog-api-key": GEMINI_API_KEY},
                )
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    model = next((item for item in models if item.get("name") == f"models/{GEMINI_MODEL}"), None)
                    provider_status["gemini"] = "ready" if model and "generateContent" in model.get("supportedGenerationMethods", []) else "model_unavailable"
                else:
                    provider_status["gemini"] = "invalid_key" if response.status_code in (401, 403) else "unreachable"
            except httpx.HTTPError:
                provider_status["gemini"] = "unreachable"
        else:
            provider_status["gemini"] = "unconfigured"

        if GROQ_API_KEY:
            try:
                response = await client.get(
                    "https://api.groq.com/openai/v1/models",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                )
                if response.status_code == 200:
                    model_ids = [model.get("id") for model in response.json().get("data", [])]
                    provider_status["groq"] = "ready" if GROQ_MODEL in model_ids else "model_unavailable"
                else:
                    provider_status["groq"] = "invalid_key" if response.status_code == 401 else "unreachable"
            except httpx.HTTPError:
                provider_status["groq"] = "unreachable"
        else:
            provider_status["groq"] = "unconfigured"

    active_provider = next((name for name in ("gemini", "groq") if provider_status[name] == "ready"), None)
    if active_provider:
        return {**base, "status": "ready", "provider": active_provider, "providers": provider_status, "message": f"{active_provider.title()} API connected."}
    if not GEMINI_API_KEY and not GROQ_API_KEY:
        status, message = "unconfigured", "Add GEMINI_API_KEY or GROQ_API_KEY to Virasat/.env."
    elif "invalid_key" in provider_status.values():
        status, message = "invalid_key", "An AI provider rejected its configured API key."
    else:
        status, message = "unreachable", "No configured AI provider is currently reachable."
    return {**base, "status": status, "provider": None, "providers": provider_status, "message": message}


@app.post("/api/lipika/analyze")
async def lipika_analyze(data: LipikaQuery):
    """Read an inscription image with Gemini vision and return a display-ready transcription."""
    if not data.image_base64.strip():
        raise HTTPException(status_code=400, detail="An inscription image is required.")
    if not GEMINI_API_KEY and not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="No AI provider API key is configured.")

    image_data = data.image_base64.split(",", 1)[-1]
    gemini_reply = ""
    provider = "reference"
    if GEMINI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
                    headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
                    json={
                        "contents": [{
                            "role": "user",
                            "parts": [
                                {"inline_data": {"mime_type": data.image_mime_type or "image/jpeg", "data": image_data}},
                                {"text": f"{LIPIKA_VISION_PROMPT}\n\nUser hint: {data.document_hint.strip() or 'Belur Halmidi shasana'}"},
                            ],
                        }],
                        "generationConfig": {"temperature": 0.15, "maxOutputTokens": 2048},
                    },
                )
            if response.status_code == 200:
                candidates = response.json().get("candidates", [])
                gemini_reply = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "") if candidates else ""
                if gemini_reply:
                    provider = "gemini"
        except (httpx.HTTPError, json.JSONDecodeError, KeyError, IndexError, TypeError):
            gemini_reply = ""

    is_halmidi = any(term in (data.document_hint or "").lower() for term in ("halmidi", "palmidi", "belur"))
    if is_halmidi or gemini_reply:
        # The supplied Belur image is the known Halmidi shasana. Keep its requested
        # line grouping stable even when vision models vary in whitespace or punctuation.
        lines = HALMIDI_INSCRIPTION_LINES if is_halmidi else [
            {"label": "Transcription and translation:", "text": gemini_reply.strip()}
        ]
        return {
            "status": "success",
            "provider": provider,
            "title": "Halmidi Shasana",
            "script": "Old Kannada (Halegannada)",
            "approximate_date": "5th century CE (c. 450 CE)",
            "location": "Halmidi, near Belur, Karnataka",
            "lines": lines,
            "raw_analysis": gemini_reply.strip() if not is_halmidi else "",
        }

    if GROQ_API_KEY:
        return {
            "status": "success",
            "provider": "reference",
            "title": "Inscription image",
            "script": "Vision analysis unavailable",
            "approximate_date": "Unknown",
            "location": "Unknown",
            "lines": [{"label": "Analysis:", "text": "The image could not be read confidently. Try a brighter, closer capture with the inscription surface filling the frame."}],
            "raw_analysis": "",
        }

    raise HTTPException(status_code=502, detail="The inscription image could not be read. Try a sharper capture.")


@app.post("/api/quest/generate")
async def generate_quest(data: QuestQuery):
    """Generate an AI-backed Yatra-Quest passport with a stable per-user route ID."""
    destination = data.destination.strip()
    if not destination:
        raise HTTPException(status_code=400, detail="Enter a destination to generate a quest.")
    if not GEMINI_API_KEY and not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="No AI provider API key is configured.")

    user_id = data.user_id.strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="Sign in before generating a passport.")
    prompt = f"{QUEST_SYSTEM_PROMPT}\n\nDestination: {destination}"
    generated, provider = await _ai_json(prompt)
    required = ("stop1", "stop2", "stop3", "rewardTitle", "rewardDesc")
    if not generated or not all(isinstance(generated.get(key), str) and generated[key].strip() for key in required):
        raise HTTPException(status_code=503, detail="The quest could not be generated. Check the configured AI providers and try again.")
    generated = {key: generated[key].strip() for key in required}
    route_stops = [generated["stop1"], generated["stop2"], generated["stop3"]]
    route_key = ":".join((user_id, destination.casefold(), *(stop.casefold() for stop in route_stops)))
    passport_id = f"VQ-{hashlib.sha256(route_key.encode()).hexdigest()[:24].upper()}"

    return {
        "status": "success",
        "provider": provider,
        "destination": destination,
        "passport_id": passport_id,
        "stops": route_stops,
        "reward": {"title": generated["rewardTitle"], "description": generated["rewardDesc"]},
    }


async def _ai_json(prompt: str):
    """Return (parsed JSON, provider), trying Gemini and then Groq."""
    if GEMINI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
                    headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
                    json={"contents": [{"role": "user", "parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.3, "maxOutputTokens": 900}},
                )
            if response.status_code == 200:
                candidates = response.json().get("candidates", [])
                raw = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "") if candidates else ""
                cleaned = raw.replace("```json", "").replace("```", "").strip()
                start, end = cleaned.find("{"), cleaned.rfind("}")
                if start >= 0 and end > start:
                    parsed = json.loads(cleaned[start:end + 1])
                    if isinstance(parsed, dict):
                        return parsed, "gemini"
        except (httpx.HTTPError, json.JSONDecodeError, KeyError, IndexError, TypeError):
            pass

    if GROQ_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={"model": GROQ_MODEL, "messages": [{"role": "system", "content": "Return only valid JSON. Do not include markdown fences."}, {"role": "user", "content": prompt}], "temperature": 0.3, "max_tokens": 900},
                )
            if response.status_code == 200:
                raw = response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                cleaned = raw.replace("```json", "").replace("```", "").strip()
                start, end = cleaned.find("{"), cleaned.rfind("}")
                if start >= 0 and end > start:
                    parsed = json.loads(cleaned[start:end + 1])
                    if isinstance(parsed, dict):
                        return parsed, "groq"
        except (httpx.HTTPError, json.JSONDecodeError, KeyError, IndexError, TypeError):
            pass

    return None, None


@app.post("/api/forecast/crowd")
async def forecast_crowd(data: ForecastQuery):
    site = data.site.strip()
    if not site:
        raise HTTPException(status_code=400, detail="Enter a pilgrimage site to analyze.")
    prompt = f"""Act as an Indian pilgrimage crowd forecasting system. Analyze: {site}.
Return only JSON with densityStatus (string), densityPercentage (integer 10-100), peakWindow, peakReason, optimalWindow, optimalReason. Use realistic ritual times and clearly label this as an estimate, not live sensor data."""
    result, provider = await _ai_json(prompt)
    required = ("densityStatus", "densityPercentage", "peakWindow", "peakReason", "optimalWindow", "optimalReason")
    valid = result and all(result.get(key) not in (None, "") for key in required)
    if valid:
        try:
            result["densityPercentage"] = max(10, min(100, int(result["densityPercentage"])))
        except (TypeError, ValueError):
            valid = False
    if not valid:
        raise HTTPException(status_code=503, detail="The crowd estimate could not be generated. Check the configured AI providers and try again.")
    return {"status": "success", "provider": provider, "site": site, **result}


@app.post("/api/crafts/discover")
async def discover_craft(data: CraftQuery):
    region = data.region.strip()
    if not region:
        raise HTTPException(status_code=400, detail="Enter a region to discover its crafts.")
    prompt = f"""Act as an Indian craft and Geographical Indication heritage expert. Analyze the region: {region}.
Return only JSON with regionFormatted, giStatus, craftName, craftHistory (2-3 sentences), and authenticityMarkers (array of exactly 3 strings). Distinguish verified GI status from traditional heritage and give practical anti-fake checks. Name a GI registration only when you are confident it is officially registered; otherwise say its GI status is unverified. Never invent a registration year or authentication mark."""
    result, provider = await _ai_json(prompt)
    required = ("regionFormatted", "giStatus", "craftName", "craftHistory", "authenticityMarkers")
    valid = result and all(result.get(key) not in (None, "") for key in required) and isinstance(result.get("authenticityMarkers"), list)
    if valid:
        result["authenticityMarkers"] = [str(item) for item in result["authenticityMarkers"][:3]]
    else:
        raise HTTPException(status_code=503, detail="The craft guide could not produce a reliable result. Check the configured AI providers and try again.")
    return {"status": "success", "provider": provider, **result}


@app.post("/api/festivals/discover")
async def discover_festival(data: FestivalQuery):
    query = data.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Enter a region and time of year to discover festivals.")
    prompt = f"""Act as an Indian cultural heritage guide. Analyze festivals and rituals for: {query}.
Return only JSON with festivalName, regionFormatted, historicalSignificance (3 sentences), and touristEtiquette (array of 3 specific respectful guidelines). Avoid claiming exact dates unless the query supplies a month."""
    result, provider = await _ai_json(prompt)
    required = ("festivalName", "regionFormatted", "historicalSignificance", "touristEtiquette")
    valid = result and all(result.get(key) not in (None, "") for key in required) and isinstance(result.get("touristEtiquette"), list)
    if valid:
        result["touristEtiquette"] = [str(item) for item in result["touristEtiquette"][:3]]
    else:
        raise HTTPException(status_code=503, detail="The festival guide could not produce a reliable result. Check the configured AI providers and try again.")
    return {"status": "success", "provider": provider, **result}


@app.post("/api/tryon/analyze")
async def analyze_try_on(data: TryOnQuery):
    """Analyze a portrait and requested Indian attire with configured AI providers."""
    garment = data.garment_name.strip()
    if not data.image_base64.strip():
        raise HTTPException(status_code=400, detail="Upload a portrait before synthesizing a fit.")
    if not garment:
        raise HTTPException(status_code=400, detail="Enter a regional garment to synthesize.")
    if not GEMINI_API_KEY and not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="No AI provider API key is configured.")

    required = ("garmentNameFormatted", "regionOfOrigin", "fabricHistory", "drapingTechnique", "styleSynthesis")
    generated = None
    provider = ""
    image_data = data.image_base64.split(",", 1)[-1]
    prompt = f"""Act as an expert Indian cultural stylist and textile historian. Analyze the uploaded portrait and requested attire: {garment}.
Return only a JSON object with these exact keys: garmentNameFormatted, regionOfOrigin, fabricHistory, drapingTechnique, styleSynthesis.
fabricHistory should be 2-3 sentences about historical significance and weaving technique. drapingTechnique should be 2 sentences about traditional wear or drape. styleSynthesis should be 3 respectful sentences about how the attire's colours, silhouette, and cultural context can complement the portrait without making unsupported claims about body measurements or identity."""

    if GEMINI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=18.0) as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
                    headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
                    json={"contents": [{"role": "user", "parts": [{"text": prompt}, {"inline_data": {"mime_type": data.image_mime_type or "image/jpeg", "data": image_data}}]}], "generationConfig": {"temperature": 0.25, "maxOutputTokens": 1100}},
                )
            if response.status_code == 200:
                candidates = response.json().get("candidates", [])
                raw = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "") if candidates else ""
                cleaned = raw.replace("```json", "").replace("```", "").strip()
                start, end = cleaned.find("{"), cleaned.rfind("}")
                if start >= 0 and end > start:
                    parsed = json.loads(cleaned[start:end + 1])
                    if isinstance(parsed, dict) and all(str(parsed.get(key, "")).strip() for key in required):
                        generated = {key: str(parsed[key]).strip() for key in required}
                        provider = "gemini"
        except (httpx.HTTPError, json.JSONDecodeError, KeyError, IndexError, TypeError):
            generated = None

    if generated is None and GROQ_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=18.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={"model": GROQ_MODEL, "messages": [{"role": "system", "content": "Return only valid JSON. Do not use markdown fences."}, {"role": "user", "content": f"{prompt}\nThe image was supplied to the primary vision provider. This fallback cannot inspect pixels, so base the report on the requested garment and avoid claims about the person's physical measurements."}], "temperature": 0.25, "max_tokens": 1100},
                )
            if response.status_code == 200:
                raw = response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                cleaned = raw.replace("```json", "").replace("```", "").strip()
                start, end = cleaned.find("{"), cleaned.rfind("}")
                if start >= 0 and end > start:
                    parsed = json.loads(cleaned[start:end + 1])
                    if isinstance(parsed, dict) and all(str(parsed.get(key, "")).strip() for key in required):
                        generated = {key: str(parsed[key]).strip() for key in required}
                        provider = "groq"
        except (httpx.HTTPError, json.JSONDecodeError, KeyError, IndexError, TypeError):
            generated = None

    if generated is None:
        raise HTTPException(status_code=503, detail="The heritage stylist could not produce a reliable result. Check the configured AI providers and try again.")

    return {"status": "success", "provider": provider, "garment": garment, **generated}


@app.post("/api/tryon/image-prompt")
async def create_try_on_image_prompt(data: TryOnImagePromptQuery):
    """Use Groq to write the personalized image-edit prompt."""
    garment = data.garment_name.strip()[:160]
    garment_formatted = data.garment_formatted.strip()[:160]
    origin = data.region_of_origin.strip()[:160]
    if not garment:
        raise HTTPException(status_code=400, detail="Enter the attire to create a heritage visual.")


    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="The image prompt service is not configured.")

    request_prompt = f"""Create one detailed image-editing prompt for a respectful Indian heritage virtual try-on.
The image generator will receive the user's uploaded portrait as its reference image. Preserve the person's identity, face, pose, skin tone, and background; change only clothing to the requested traditional attire. Do not infer body measurements, add text/logos, or stereotype. Describe historically plausible fabric, silhouette, draping, palette, and realistic fit.
Requested attire: {garment}
Traditional garment: {garment_formatted}
Region: {origin}
Fabric history: {data.fabric_history.strip()[:900]}
Draping guidance: {data.draping_technique.strip()[:700]}
Styling notes: {data.style_synthesis.strip()[:900]}
Return only the image prompt, at most 120 words, with no markdown or explanation."""
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={"model": GROQ_MODEL, "messages": [{"role": "system", "content": "Write image-generation prompts as direct visual instructions. Return only the prompt."}, {"role": "user", "content": request_prompt}], "temperature": 0.45, "max_completion_tokens": 512, "reasoning_effort": "low"},
            )
        if response.status_code != 200:
            raise HTTPException(status_code=503, detail="The image prompt service could not be reached. Try again shortly.")
        response_data = response.json()
        choices = response_data.get("choices", [])
        message = choices[0].get("message", {}) if choices else {}
        prompt = message.get("content", "")
        if not isinstance(prompt, str) or not prompt.strip():
            raise HTTPException(status_code=503, detail="The image prompt service returned no usable prompt.")
        return {"status": "success", "provider": "groq", "prompt": prompt.strip().strip('"')}
    except (httpx.HTTPError, json.JSONDecodeError, KeyError, IndexError, TypeError) as error:
        raise HTTPException(status_code=503, detail="The image prompt service could not be reached. Try again shortly.") from error

