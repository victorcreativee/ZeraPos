import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import {
  isKitchenScreenEnabled,
  isBarScreenEnabled,
} from "../utils/businessSettings";

function AdminDashboardPage() {
  const kitchenScreenEnabled = isKitchenScreenEnabled();
  const barScreenEnabled = isBarScreenEnabled();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AppHeader
        title="System Admin"
        subtitle="Manage setup, staff access, settings, and operational screens"
      />

      <main className="mx-auto max-w-7xl p-5 space-y-5">
        <section className="border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">
            Admin Control
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Restaurant System Setup
          </h1>

          <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-500">
            Configure the business, staff, menu, tables, receipts, payments, and
            the screens used by kitchen and bar teams.
          </p>
        </section>

        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
          <div className="space-y-5">
            <AdminSection
              title="Setup & Settings"
              subtitle="Core business configuration"
            >
              <ActionRow
                title="Business Settings"
                description="Business profile, receipts, operations, and payment methods."
                path="/settings"
                action="Open Settings"
              />

              <ActionRow
                title="Menu Setup"
                description="Create categories, food items, drinks, prices, and kitchen/bar routing."
                path="/admin/setup?module=menu"
                action="Manage Menu"
              />

              <ActionRow
                title="Tables & Areas"
                description="Create tables, VIP rooms, bar counter, terrace, and service areas."
                path="/admin/setup?module=tables"
                action="Manage Tables"
              />
            </AdminSection>

            <AdminSection
              title="Staff & Access"
              subtitle="Control who can use each part of the system"
            >
              <ActionRow
                title="Users & Roles"
                description="Create admin, manager, cashier, waiter, kitchen, and bar users."
                path="/users"
                action="Manage Staff"
              />
            </AdminSection>
          </div>

          <div className="space-y-5">
            <AdminSection
              title="Operations Screens"
              subtitle="Open live workspaces for monitoring"
            >
              <ScreenRow
                title="Kitchen Screen"
                description={
                  kitchenScreenEnabled
                    ? "Kitchen display is enabled."
                    : "Kitchen display is currently disabled in settings."
                }
                path="/kitchen"
                enabled={kitchenScreenEnabled}
              />

              <ScreenRow
                title="Bar Screen"
                description={
                  barScreenEnabled
                    ? "Bar display is enabled."
                    : "Bar display is currently disabled in settings."
                }
                path="/bar"
                enabled={barScreenEnabled}
              />

              <ActionRow
                title="Cashier Counter"
                description="Open bills, receive payments, and reprint paid receipts."
                path="/counter"
                action="Open Counter"
              />

              <ActionRow
                title="Manager Dashboard"
                description="View sales, open bills, payments, and restaurant performance."
                path="/manager"
                action="Open Manager"
              />
            </AdminSection>

            <AdminSection
              title="System Maintenance"
              subtitle="Backup and device setup"
            >
              <ActionRow
                title="Backup & Sync"
                description="Prepare database backup, offline device sync, and recovery tools."
                path="/admin/setup?module=backup"
                action="Open"
              />
            </AdminSection>
          </div>
        </section>
      </main>
    </div>
  );
}

function AdminSection({ title, subtitle, children }) {
  return (
    <section className="border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
      </div>

      <div className="divide-y divide-slate-100">{children}</div>
    </section>
  );
}

function ActionRow({ title, description, path, action }) {
  return (
    <Link
      to={path}
      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
    >
      <div>
        <h3 className="font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {description}
        </p>
      </div>

      <span className="shrink-0 bg-slate-950 px-4 py-2 text-xs font-black text-white">
        {action}
      </span>
    </Link>
  );
}

function ScreenRow({ title, description, path, enabled }) {
  return (
    <Link
      to={path}
      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
    >
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-black text-slate-950">{title}</h3>

          <span
            className={`px-2 py-1 text-[10px] font-black uppercase ${
              enabled
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {enabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          {description}
        </p>
      </div>

      <span className="shrink-0 bg-slate-950 px-4 py-2 text-xs font-black text-white">
        Open
      </span>
    </Link>
  );
}

export default AdminDashboardPage;
