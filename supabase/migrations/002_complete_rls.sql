-- Phase 9 : compléter RLS sur toutes les tables sensibles
-- À exécuter après 001_auth_sync_and_rls.sql

-- Helpers réutilisables
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()::uuid
      AND u.role IN ('OWNER', 'ARTIST')
      AND u."isActive" = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()::uuid
      AND u.role = 'OWNER'
      AND u."isActive" = true
  );
$$;

-- Activer RLS sur les tables manquantes
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Policies manquantes sur tables déjà protégées
DROP POLICY IF EXISTS "shipments_admin_all" ON public.shipments;
CREATE POLICY "shipments_admin_all" ON public.shipments
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "contact_messages_admin_all" ON public.contact_messages;
CREATE POLICY "contact_messages_admin_all" ON public.contact_messages
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- Données clients / commandes : admin uniquement (accès via Prisma service role côté serveur)
DROP POLICY IF EXISTS "customers_admin_all" ON public.customers;
CREATE POLICY "customers_admin_all" ON public.customers
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "addresses_admin_all" ON public.addresses;
CREATE POLICY "addresses_admin_all" ON public.addresses
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "reservations_admin_all" ON public.reservations;
CREATE POLICY "reservations_admin_all" ON public.reservations
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "shipment_events_admin_all" ON public.shipment_events;
CREATE POLICY "shipment_events_admin_all" ON public.shipment_events
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "packing_checklists_admin_all" ON public.packing_checklists;
CREATE POLICY "packing_checklists_admin_all" ON public.packing_checklists
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "packing_photos_admin_all" ON public.packing_photos;
CREATE POLICY "packing_photos_admin_all" ON public.packing_photos
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- Webhooks : OWNER uniquement (données techniques sensibles)
DROP POLICY IF EXISTS "webhook_events_owner_all" ON public.webhook_events;
CREATE POLICY "webhook_events_owner_all" ON public.webhook_events
  FOR ALL USING (public.is_active_owner())
  WITH CHECK (public.is_active_owner());

-- Renforcer policies existantes avec les helpers (idempotent)
DROP POLICY IF EXISTS "artworks_admin_all" ON public.artworks;
CREATE POLICY "artworks_admin_all" ON public.artworks
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "artwork_images_admin_all" ON public.artwork_images;
CREATE POLICY "artwork_images_admin_all" ON public.artwork_images
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "settings_owner_all" ON public.settings;
CREATE POLICY "settings_owner_all" ON public.settings
  FOR ALL USING (public.is_active_owner())
  WITH CHECK (public.is_active_owner());

-- Admin peut lire les profils users (OWNER/ARTIST)
DROP POLICY IF EXISTS "users_admin_read" ON public.users;
CREATE POLICY "users_admin_read" ON public.users
  FOR SELECT USING (public.is_active_admin());
