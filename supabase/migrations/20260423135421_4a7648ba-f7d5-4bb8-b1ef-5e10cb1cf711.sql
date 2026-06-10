COMMENT ON TABLE public."Reviews" IS 'Customer product reviews';
COMMENT ON COLUMN public."Reviews".description IS 'Review body text';
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');
DELETE FROM public."Reviews" WHERE "FullName" = 'Test User';