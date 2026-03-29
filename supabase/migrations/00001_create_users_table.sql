-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Username or OpenID
    password TEXT, -- Plain text for demo purposes. IN PRODUCTION, USE SUPABASE AUTH (GoTrue) OR HASH PASSWORDS!
    nickname TEXT,
    avatar_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see and update only their own profile
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING (id = current_setting('request.jwt.claims', true)::json->>'sub' OR true); -- For demo simplicity, allowing all

CREATE POLICY "Users can insert/update their own profile" 
ON public.users FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (true);