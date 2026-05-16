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
      <div className="mx-auto max-w-[1800px] px-12 py-7 flex items-center justify-between">
        <div className="flex items-center gap-7">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-xl">
            <img src={zeraLogo} alt="ZERA" className="h-12 w-auto" />
          </div>

          <div className="h-16 w-px bg-slate-700" />

          <div>
            <h1 className="text-4xl font-black tracking-tight">
              {BUSINESS_NAME}
            </h1>
            <p className="text-2xl text-slate-400 mt-2">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-7">
          <div className="flex items-center gap-4 border border-slate-700 rounded-2xl px-6 py-4 bg-[#091421]">
            <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center text-2xl font-black">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div>
              <p className="text-xl font-black">{user.name}</p>
              <p className="text-lg text-purple-300 uppercase font-bold">
                {user.role}
              </p>
            </div>
          </div>

          {showBackToDashboard && (
            <Link
              to={getDashboardPath()}
              className="bg-slate-800 hover:bg-slate-700 px-8 py-5 rounded-2xl text-xl font-black"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-9 py-5 rounded-2xl text-xl font-black"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
