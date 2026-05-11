import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";

const setupCards = [
  {
    title: "Restaurant / Bar Profile",
    description:
      "Set business name, type, logo, contact, address, and currency.",
    path: "/admin/business-profile",
    tag: "Core Setup",
  },
  {
    title: "Branches",
    description:
      "Manage main branch, bar branch, lounge, or multiple locations.",
    path: "/admin/branches",
    tag: "Business",
  },
  {
    title: "Tables & Areas",
    description:
      "Create halls, VIP areas, terrace, bar counter, and table layout.",
    path: "/admin/tables",
    tag: "Floor Setup",
  },
  {
    title: "Users & Roles",
    description: "Manage admins, managers, cashiers, waiters, and bartenders.",
    path: "/users",
    tag: "Access",
  },
  {
    title: "Menu Setup",
    description:
      "Configure food, drinks, categories, prices, and availability.",
    path: "/admin/menu",
    tag: "Operations",
  },
  {
    title: "Payment Settings",
    description: "Enable cash, mobile money, card, split payments, and tips.",
    path: "/admin/payments",
    tag: "Finance",
  },
  {
    title: "Receipt Settings",
    description:
      "Customize receipt logo, footer, tax number, and printer format.",
    path: "/admin/receipts",
    tag: "Printing",
  },
  {
    title: "Backup & Sync",
    description:
      "Manage offline database backup, cloud sync, and device status.",
    path: "/admin/backup-sync",
    tag: "System",
  },
];

function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#07111c] text-white">
      <AppHeader
        title="System Admin"
        subtitle="Configure restaurant, bar, users, tables, menu, payments, and system settings"
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <section className="rounded-[2rem] bg-gradient-to-br from-purple-700/30 via-[#111827] to-[#07111c] border border-purple-500/20 p-8">
          <p className="text-purple-300 font-bold">ZERA POS Control Center</p>
          <h1 className="text-4xl font-black mt-3">
            Restaurant & Bar System Setup
          </h1>
          <p className="text-slate-300 mt-4 max-w-3xl">
            Manage the foundation of your POS: business profile, branches, floor
            layout, staff access, menu, payments, receipts, and backups.
          </p>

          <div className="grid md:grid-cols-4 gap-4 mt-8">
            <MiniCard label="Business Type" value="Restaurant & Bar" />
            <MiniCard label="Mode" value="Offline First" />
            <MiniCard label="Access" value="Admin Only" />
            <MiniCard label="Status" value="Active" accent="text-green-400" />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black">Setup Modules</h2>
              <p className="text-slate-400">
                Use these sections to configure the full restaurant/bar system.
              </p>
            </div>

            <Link
              to="/manager"
              className="bg-[#111827] border border-slate-800 hover:border-purple-500 rounded-2xl px-5 py-3 text-sm font-bold"
            >
              Back to Manager
            </Link>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {setupCards.map((card) => (
              <Link
                key={card.title}
                to={card.path}
                className="group bg-[#111827] border border-slate-800 hover:border-purple-500 rounded-3xl p-6 transition"
              >
                <span className="text-xs bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full">
                  {card.tag}
                </span>

                <h3 className="text-xl font-black mt-5 group-hover:text-purple-300">
                  {card.title}
                </h3>

                <p className="text-slate-400 text-sm mt-3 leading-6">
                  {card.description}
                </p>

                <div className="mt-6 text-slate-500 group-hover:text-white">
                  Open →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function MiniCard({ label, value, accent = "text-white" }) {
  return (
    <div className="bg-[#07111c]/70 border border-white/10 rounded-2xl p-4">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`font-black mt-2 ${accent}`}>{value}</p>
    </div>
  );
}

export default AdminDashboardPage;
