import { Link } from "react-router-dom";
import zeraLogo from "../../assets/brand/zera-logo.png";
import { clearAuthSession, getAuthUser } from "../../utils/authSession";
import { getBusinessSettings } from "../../utils/businessSettings";

function AppHeader({
  title = "Waiter Workspace",
  showBackToDashboard = false,
}) {
  const user = getAuthUser();

  const settings = getBusinessSettings();
  const businessName = settings.business_name || "ZERA POS";

  function getDashboardPath() {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "manager") return "/manager";
    if (user?.role === "cashier") return "/counter";
    if (user?.role === "server") return "/pos";
    if (user?.role === "kitchen") return "/kitchen";
    if (user?.role === "bar") return "/bar";
    return "/dashboard";
  }

  function handleLogout() {
    clearAuthSession();
    window.location.href = "/login";
  }

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="h-20 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-24 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shrink-0">
            <img
              src={zeraLogo}
              alt="Zera"
              className="h-7 w-auto object-contain"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-black text-slate-900 leading-tight truncate">
              {businessName}
            </h1>
            <p className="text-sm font-semibold text-slate-500">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase leading-tight">
                {user?.role || "staff"}
              </p>
            </div>
          </div>

          {showBackToDashboard && (
            <Link
              to={getDashboardPath()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-3 rounded-2xl text-sm font-black"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl text-sm font-black"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
