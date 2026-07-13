-- Migration initiale : sync auth → users + RLS de base
-- À exécuter dans Supabase SQL Editor après `prisma db push`

-- Sync Supabase Auth vers la table users (rôle dans app_metadata)
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role "UserRole";
  meta_role TEXT;
BEGIN
  meta_role := NEW.raw_app_meta_data ->> 'role';

  IF meta_role IN ('OWNER', 'ARTIST', 'CUSTOMER') THEN
    user_role := meta_role::"UserRole";
  ELSE
    user_role := 'CUSTOMER';
  END IF;

  INSERT INTO public.users (id, email, "displayName", role, "isActive", "createdAt", "updatedAt")
  VALUES (
    NEW.id::uuid,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    user_role,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    "displayName" = EXCLUDED."displayName",
    role = EXCLUDED.role,
    "updatedAt" = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();

-- RLS : activer sur toutes les tables publiques
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Œuvres publiées visibles par tous
CREATE POLICY "artworks_public_read" ON public.artworks
  FOR SELECT USING (status = 'PUBLISHED');

-- Admin (OWNER/ARTIST) gère les œuvres
CREATE POLICY "artworks_admin_all" ON public.artworks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::uuid
        AND u.role IN ('OWNER', 'ARTIST')
        AND u."isActive" = true
    )
  );

-- Images des œuvres publiées
CREATE POLICY "artwork_images_public_read" ON public.artwork_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.artworks a
      WHERE a.id = "artworkId" AND a.status = 'PUBLISHED'
    )
  );

CREATE POLICY "artwork_images_admin_all" ON public.artwork_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::uuid
        AND u.role IN ('OWNER', 'ARTIST')
    )
  );

-- Commandes : admin seulement
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::uuid
        AND u.role IN ('OWNER', 'ARTIST')
    )
  );

-- Paramètres : OWNER uniquement
CREATE POLICY "settings_owner_all" ON public.settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::uuid AND u.role = 'OWNER'
    )
  );

-- Profil utilisateur : lecture de son propre enregistrement
CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid()::uuid = id);
