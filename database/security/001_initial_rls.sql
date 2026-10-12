
-- Loozinga Initial Database Security
-- RLS and permission restrictions
--
-- Already applied to the existing Supabase database.
-- Keep this file for documentation and future environments.
-- Do not execute again merely to record it in GitHub.

BEGIN;

-- Enable Row Level Security
ALTER TABLE public.profiles
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.orders
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.order_items
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.products
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.product_images
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.categories
ENABLE ROW LEVEL SECURITY;

-- Deny direct database access to public API roles
REVOKE ALL PRIVILEGES ON TABLE
    public.profiles,
    public.orders,
    public.order_items,
    public.products,
    public.product_images,
    public.categories
FROM anon, authenticated;

-- Remove sequence privileges
REVOKE ALL PRIVILEGES ON ALL SEQUENCES
IN SCHEMA public
FROM anon, authenticated;

COMMIT;
