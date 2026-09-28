-- ==============================================================================
-- VIRASATX PLATFORM: SUPABASE DATABASE INITIALIZATION
-- Safe to run multiple times
-- ==============================================================================

-- ==============================================================================
-- 1. ENABLE UUID EXTENSION
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ==============================================================================
-- TABLE 1: subscribers
-- Waitlist / Join Viraasat Community
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    interests TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Remove existing policies first
DROP POLICY IF EXISTS "Allow public inserts to subscribers"
ON public.subscribers;

DROP POLICY IF EXISTS "Allow select on subscribers"
ON public.subscribers;

-- Allow visitors to join the community
CREATE POLICY "Allow public inserts to subscribers"
ON public.subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to read subscribers
CREATE POLICY "Allow select on subscribers"
ON public.subscribers
FOR SELECT
TO authenticated
USING (true);


-- ==============================================================================
-- TABLE 2: yatra_passports
-- Digital Yatra Passports & Badges
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.yatra_passports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    site_id TEXT NOT NULL,
    site_name TEXT NOT NULL,
    stamp_badge_url TEXT,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.yatra_passports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anyone to read verified passport stamps"
ON public.yatra_passports;

DROP POLICY IF EXISTS "Allow users to log passport stamps"
ON public.yatra_passports;

-- Publicly readable passport stamps
CREATE POLICY "Allow anyone to read verified passport stamps"
ON public.yatra_passports
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow users to create passport entries
CREATE POLICY "Allow users to log passport stamps"
ON public.yatra_passports
FOR INSERT
TO anon, authenticated
WITH CHECK (true);


-- ==============================================================================
-- TABLE 3: quest_progress
-- Parampara Lore Quests
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.quest_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    quest_id TEXT NOT NULL,
    quest_title TEXT NOT NULL,
    step_completed INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 5,
    is_finished BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_user_quest
        UNIQUE (user_id, quest_id)
);

ALTER TABLE public.quest_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow reading quest progress"
ON public.quest_progress;

DROP POLICY IF EXISTS "Allow updating quest progress"
ON public.quest_progress;

-- Allow reading quest progress
CREATE POLICY "Allow reading quest progress"
ON public.quest_progress
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow creating/updating/deleting quest progress
CREATE POLICY "Allow updating quest progress"
ON public.quest_progress
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);


-- ==============================================================================
-- TABLE 4: kathakar_chat_history
-- Kathakar AI Guide Session Storage
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.kathakar_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_id TEXT,
    role TEXT NOT NULL
        CHECK (role IN ('user', 'ai')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.kathakar_chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read and write for chat sessions"
ON public.kathakar_chat_history;

-- Allow chat history operations
CREATE POLICY "Allow read and write for chat sessions"
ON public.kathakar_chat_history
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);


-- ==============================================================================
-- TABLE 5: monuments
-- The Archive of Monuments
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.monuments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    dynasty TEXT,
    location TEXT NOT NULL,
    height_or_span TEXT,
    material TEXT,
    verified_fact TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.monuments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-only access to monuments"
ON public.monuments;

-- Public can read monuments
CREATE POLICY "Allow public read-only access to monuments"
ON public.monuments
FOR SELECT
TO anon, authenticated
USING (true);


-- ==============================================================================
-- MONUMENT SEED DATA
-- ==============================================================================

INSERT INTO public.monuments (
    slug,
    name,
    dynasty,
    location,
    height_or_span,
    material,
    verified_fact,
    image_url
)
VALUES

(
    'hampi-chariot',
    'Stone Chariot, Hampi',
    'Vijayanagara Empire',
    'Vijayanagara, Karnataka',
    'Height: 15 ft',
    'Granite Blocks',
    'The Stone Chariot at Hampi is a famous monument associated with the Vijayanagara Empire and is dedicated to Garuda, the vahana of Lord Vishnu.',
    'images/hampi.png'
),

(
    'konark-sun-temple',
    'Konark Sun Temple',
    'Eastern Ganga Dynasty',
    'Puri, Odisha',
    'Height: 229 ft (Sanctum)',
    'Khondalite Rocks',
    'The Konark Sun Temple was designed as a colossal chariot of the Sun God with 24 carved wheels and 7 horses.',
    'images/konark.png'
),

(
    'brihadeeswarar-temple',
    'Brihadeeswarar Temple',
    'Chola Dynasty',
    'Thanjavur, Tamil Nadu',
    'Vimana: 216 ft',
    'Granite',
    'The Brihadeeswarar Temple was built during the Chola period and is one of the major examples of Chola architecture.',
    'images/brihadeeswarar.png'
),

(
    'taj-mahal',
    'Taj Mahal',
    'Mughal Empire',
    'Agra, Uttar Pradesh',
    'Height: 240 ft',
    'Makrana White Marble',
    'The Taj Mahal was commissioned by Mughal emperor Shah Jahan and is renowned for its symmetrical architectural design.',
    'images/taj.png'
),

(
    'st-philomena-church',
    'St. Philomena''s Church',
    'Wadiyar Dynasty / Neo-Gothic',
    'Mysuru, Karnataka',
    'Height: 175 ft (Twin Spires)',
    'Cut Stone & Stained Glass',
    'One of Asia''s tallest cathedrals, inspired by Germany''s Cologne Cathedral with twin 175-foot spires and French stained glass.',
    'images/taj.png'
),

(
    'humayuns-tomb',
    'Humayun''s Tomb',
    'Mughal Empire',
    'New Delhi, Delhi',
    'Height: 140 ft (Double Dome)',
    'Red Sandstone & White Marble',
    'The first grand garden-tomb on the Indian subcontinent, commissioned by Empress Bega Begum and the architectural precursor to the Taj Mahal.',
    'images/taj.png'
),

(
    'ellora-caves',
    'Ellora Caves (Kailasa Temple)',
    'Rashtrakuta Dynasty',
    'Chhatrapati Sambhaji Nagar, Maharashtra',
    'Height: 107 ft (Cave 16)',
    'Monolithic Basalt Cliff',
    'The world''s largest monolithic rock-cut structure, carved top-down from a single basalt cliff without scaffolding.',
    'images/ashoka_edict.png'
)

ON CONFLICT (slug)
DO UPDATE SET
    name = EXCLUDED.name,
    dynasty = EXCLUDED.dynasty,
    location = EXCLUDED.location,
    height_or_span = EXCLUDED.height_or_span,
    material = EXCLUDED.material,
    verified_fact = EXCLUDED.verified_fact,
    image_url = EXCLUDED.image_url;


-- ==============================================================================
-- OPTIONAL: UPDATED_AT FUNCTION FOR QUEST PROGRESS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_quest_progress_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS quest_progress_updated_at
ON public.quest_progress;


CREATE TRIGGER quest_progress_updated_at
BEFORE UPDATE ON public.quest_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_quest_progress_timestamp();


-- ==============================================================================
-- DONE
-- ==============================================================================

SELECT 'ViraasatX database initialization completed successfully!' AS status;
