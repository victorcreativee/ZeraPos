import { Link } from "react-router-dom";
import zeraLogo from "../../assets/brand/zera-logo.png";

function AppHeader({
  title = "zeraPOS",
  subtitle = "",
  showBackToDashboard = false,
}) {
  const user = JSON.parse(localStorage.getItem("zera_user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("zera_token");
    localStorage.removeItem("zera_user");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#07111c]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-2xl p-2">
            <img
              src={zeraLogo}
              alt="ZERA"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div>
            <h1 className="text-2xl font-black">{title}</h1>
            <p className="text-sm text-slate-400">
              {subtitle || `${user.name || "User"} · ${user.role || ""}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showBackToDashboard && (
            <Link
              to="/dashboard"
              className="bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-2xl font-bold"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-2xl font-bold"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
