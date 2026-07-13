import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Tableau de bord</h1>
      <p className="mt-3 text-stone-600">
        Bienvenue dans votre espace de gestion.
      </p>
      <div className="mt-10">
        <AdminDashboard />
      </div>
    </div>
  );
}
