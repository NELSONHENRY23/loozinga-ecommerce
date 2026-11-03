-- Loozinga Variant Tables Security
-- RLS and permission restrictions for product variants and sizes.
--
-- Run once in the Supabase SQL Editor after reviewing.
-- Keep this file in Git for future environments.

BEGIN;

-- Enable Row Level Security
ALTER TABLE public.product_variants
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.product_variant_sizes
ENABLE ROW LEVEL SECURITY;

-- Deny direct database access to public API roles
REVOKE ALL PRIVILEGES ON TABLE
    public.product_variants,
    public.product_variant_sizes
FROM anon, authenticated;

COMMIT;