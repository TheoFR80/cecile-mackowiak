-- Révoquer l'exécution RPC publique des fonctions internes (linter Supabase)
REVOKE EXECUTE ON FUNCTION public.is_active_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_active_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_auth_user_sync() FROM PUBLIC, anon, authenticated;
