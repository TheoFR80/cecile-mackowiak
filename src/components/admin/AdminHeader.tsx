import { logoutAction } from "@/lib/auth/actions";
import { ROLE_LABELS } from "@/lib/auth/types";
import type { UserRole } from "@/lib/auth/types";
import Link from "next/link";

type AdminHeaderProps = {
  displayName: string;
  role: UserRole;
};

export function AdminHeader({ displayName, role }: AdminHeaderProps) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <div>
          <p className="text-sm text-stone-500">Administration</p>
          <p className="font-serif text-xl text-ink">{displayName}</p>
          <p className="text-sm text-stone-500">{ROLE_LABELS[role]}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tableaux"
            className="hidden min-h-[44px] items-center rounded-xl border border-stone-300 px-4 text-sm text-ink sm:flex"
          >
            Mes tableaux
          </Link>
          <Link
            href="/admin/commandes"
            className="hidden min-h-[44px] items-center rounded-xl border border-stone-300 px-4 text-sm text-ink sm:flex"
          >
            Commandes
          </Link>
          <Link
            href="/admin/expeditions"
            className="hidden min-h-[44px] items-center rounded-xl border border-stone-300 px-4 text-sm text-ink sm:flex"
          >
            Colis
          </Link>
          <Link
            href="/"
            className="hidden min-h-[44px] items-center rounded-xl border border-stone-300 px-4 text-sm text-ink sm:flex"
          >
            Voir le site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl border border-stone-300 px-4 text-sm text-stone-600 hover:border-ink hover:text-ink"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
