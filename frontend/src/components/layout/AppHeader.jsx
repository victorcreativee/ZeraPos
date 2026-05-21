import { Link } from "react-router-dom";
import zeraLogo from "../../assets/brand/zera-logo.png";
import { clearAuthSession, getAuthUser } from "../../utils/authSession";

const BUSINESS_NAME = "Demo Bar & Restaurant";

function AppHeader({
  title = "Waiter Workspace",
  showBackToDashboard = false,
}) {
  const user = getAuthUser();
  function getDashboardPath() {
    if (user.role === "admin") return "/admin";
    if (user.role === "manager") return "/manager";
    if (user.role === "cashier") return "/counter";
    if (user.role === "kitchen") return "/kitchen";
    if (user.role === "bar") return "/bar";
    return "/dashboard";
  }

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/login";
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#06101d]">
      <div className="mx-auto max-w-[1800px] px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="bg-white rounded-2xl px-5 py-3 shadow-lg">
            <img src={zeraLogo} alt="ZERA" className="h-7 w-auto" />
          </div>

          <div className="h-12 w-px bg-slate-700" />

          <div>
            <h1 className="text-3xl font-black tracking-tight leading-tight">
              {BUSINESS_NAME}
            </h1>
            <p className="text-lg text-slate-400 leading-tight">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 border border-slate-700 rounded-2xl px-4 py-2 bg-[#091421]">
            <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-xl font-black">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div>
              <p className="text-base font-black leading-tight">{user.name}</p>
              <p className="text-sm text-purple-300 uppercase font-bold leading-tight">
                {user.role}
              </p>
            </div>
          </div>

          {showBackToDashboard && (
            <Link
              to={getDashboardPath()}
              className="bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-2xl text-base font-black"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-2xl text-base font-black"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
