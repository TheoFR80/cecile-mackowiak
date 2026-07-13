/**
 * Script one-shot : création des comptes OWNER et ARTIST dans Supabase Auth.
 * Usage : node scripts/seed-admin-users.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts = [
  {
    email: "artiste@cecile-mackowiak.fr",
    password: "Cecile2026!",
    role: "ARTIST",
    displayName: "Cécile Mackowiak",
  },
  {
    email: "admin@cecile-mackowiak.fr",
    password: "Admin2026!",
    role: "OWNER",
    displayName: "Administrateur",
  },
];

for (const account of accounts) {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === account.email);

  if (found) {
    const { error } = await supabase.auth.admin.updateUserById(found.id, {
      password: account.password,
      app_metadata: { role: account.role },
      user_metadata: { display_name: account.displayName },
    });
    if (error) {
      console.error(`Erreur mise à jour ${account.email}:`, error.message);
    } else {
      console.log(`Mis à jour : ${account.email} (${account.role})`);
    }
    continue;
  }

  const { error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    app_metadata: { role: account.role },
    user_metadata: { display_name: account.displayName },
  });

  if (error) {
    console.error(`Erreur création ${account.email}:`, error.message);
  } else {
    console.log(`Créé : ${account.email} (${account.role})`);
  }
}

console.log("\nComptes prêts :");
for (const account of accounts) {
  console.log(`  ${account.role.padEnd(6)} → ${account.email} / ${account.password}`);
}
