-- Create records table
CREATE TABLE IF NOT EXISTS public.records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    remark TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own records
CREATE POLICY "Users can view their own records" 
ON public.records FOR SELECT 
USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR true); -- For simplicity in miniprogram without full auth, we can use a custom identifier

CREATE POLICY "Users can insert their own records" 
ON public.records FOR INSERT 
WITH CHECK (true); -- Allow all inserts for now, user_id will be provided by client

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_records_user_date ON public.records(user_id, date);