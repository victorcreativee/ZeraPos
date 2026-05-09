import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithPassword, loginWithPin } from "../api/authApi";

function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("pin");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("admin@zerapos.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNumberClick = (number) => {
    if (pin.length < 6) {
      setPin((prev) => prev + number);
    }
  };

  const handleClear = () => {
    setPin("");
    setError("");
  };

  const saveLogin = (data) => {
    localStorage.setItem("zera_token", data.token);
    localStorage.setItem("zera_user", JSON.stringify(data.user));
    navigate("/dashboard");
  };

  const handlePinLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await loginWithPin(pin);

      saveLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "PIN login failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await loginWithPassword(email, password);

      saveLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Password login failed");
    } finally {
      setLoading(false);
    }
  };

  const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl font-black mb-4">
            Z
          </div>

          <h1 className="text-3xl font-bold">zeraPOS</h1>
          <p className="text-slate-400 mt-2">Fast business operating system</p>
        </div>

        <div className="grid grid-cols-2 bg-slate-800 rounded-2xl p-1 mb-6">
          <button
            onClick={() => setMode("pin")}
            className={`py-3 rounded-xl font-semibold ${
              mode === "pin" ? "bg-emerald-500 text-white" : "text-slate-300"
            }`}
          >
            PIN Login
          </button>

          <button
            onClick={() => setMode("password")}
            className={`py-3 rounded-xl font-semibold ${
              mode === "password"
                ? "bg-emerald-500 text-white"
                : "text-slate-300"
            }`}
          >
            Admin Login
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {mode === "pin" ? (
          <div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl h-16 flex items-center justify-center text-3xl tracking-[12px] font-bold mb-5">
              {pin ? "•".repeat(pin.length) : ""}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {keypad.slice(0, 9).map((number) => (
                <button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className="h-16 bg-slate-800 hover:bg-slate-700 rounded-2xl text-2xl font-bold"
                >
                  {number}
                </button>
              ))}

              <button
                onClick={handleClear}
                className="h-16 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-2xl font-bold"
              >
                Clear
              </button>

              <button
                onClick={() => handleNumberClick("0")}
                className="h-16 bg-slate-800 hover:bg-slate-700 rounded-2xl text-2xl font-bold"
              >
                0
              </button>

              <button
                onClick={handlePinLogin}
                disabled={loading || pin.length < 4}
                className="h-16 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-2xl font-bold"
              >
                {loading ? "..." : "Enter"}
              </button>
            </div>

            <p className="text-center text-slate-500 text-sm">
              Default admin PIN: 1234
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 outline-none focus:border-emerald-500"
                placeholder="admin@zerapos.com"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 outline-none focus:border-emerald-500"
                placeholder="Password"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-2xl py-4 font-bold"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
