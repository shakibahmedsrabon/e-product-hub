
ALTER TABLE public."Terms of Service" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public."Terms of Service"
  FOR SELECT TO anon, authenticated USING (true);
