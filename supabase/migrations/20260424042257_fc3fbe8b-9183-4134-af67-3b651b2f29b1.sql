ALTER TABLE public."Site config" ADD COLUMN IF NOT EXISTS show_review boolean DEFAULT true;
ALTER TABLE public."Site config" ADD COLUMN IF NOT EXISTS "og-image" text;
ALTER TABLE public."Reviews" ADD COLUMN IF NOT EXISTS product_id bigint;
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public."Reviews"(product_id);