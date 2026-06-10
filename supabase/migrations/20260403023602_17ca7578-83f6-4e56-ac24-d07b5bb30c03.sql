
CREATE POLICY "No public writes" ON "Products" FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No public writes update" ON "Products" FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public writes delete" ON "Products" FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "No public writes" ON "FAQ" FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No public writes update" ON "FAQ" FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public writes delete" ON "FAQ" FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "No public writes" ON "Terms of Service" FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No public writes update" ON "Terms of Service" FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public writes delete" ON "Terms of Service" FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "No public writes" ON "Refund and exchange policy" FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No public writes update" ON "Refund and exchange policy" FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public writes delete" ON "Refund and exchange policy" FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "No public writes" ON "Site config" FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No public writes update" ON "Site config" FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public writes delete" ON "Site config" FOR DELETE TO anon, authenticated USING (false);
