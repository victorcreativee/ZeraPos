import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithPassword, loginWithPin } from "../api/authApi";
import { saveAuthSession } from "../utils/authSession";

function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("pin");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("admin@zerapos.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goToRolePage = (data) => {
    saveAuthSession(data);

    const role = data.user?.role;

    if (role === "admin") navigate("/admin");
    else if (role === "manager") navigate("/manager");
    else if (role === "cashier") navigate("/counter");
    else if (role === "kitchen") navigate("/kitchen");
    else if (role === "bar") navigate("/bar");
    else navigate("/pos");
  };

  const handleNumberClick = (number) => {
    setError("");
    if (pin.length < 6) setPin((prev) => prev + number);
  };

  const handlePinLogin = async () => {
    if (pin.length < 4) return;

    try {
      setLoading(true);
      setError("");

      const response = await loginWithPin(pin);
      goToRolePage(response.data);
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
      goToRolePage(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Password login failed");
    } finally {
      setLoading(false);
    }
  };

  const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="min-h-screen bg-[#f5f2ea] text-slate-950">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-[#15110d] text-white">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-xl">
              Z
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Zera POS</h1>
              <p className="text-sm text-white/55">
                Restaurant operating system
              </p>
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300 mb-5">
              Built for real restaurant flow
            </p>

            <h2 className="text-5xl xl:text-6xl font-black leading-[1.02] tracking-tight">
              Run tables, orders, kitchen, bar, cashier and reports from one
              clean system.
            </h2>

            <p className="mt-6 text-lg text-white/65 leading-8 max-w-xl">
              Designed for fast service: waiters send orders, kitchen and bar
              prepare tickets, cashier confirms payments, and managers track the
              business clearly.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-10">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-2xl font-black">01</p>
                <p className="text-sm text-white/55 mt-2">Select table</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-2xl font-black">02</p>
                <p className="text-sm text-white/55 mt-2">Send order</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-2xl font-black">03</p>
                <p className="text-sm text-white/55 mt-2">Print receipt</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-white/45">
            <span>Offline-first restaurant POS</span>
            <span>Minimal • Fast • Professional</span>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="h-11 w-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl">
                Z
              </div>
              <div>
                <h1 className="text-xl font-black">Zera POS</h1>
                <p className="text-sm text-slate-500">
                  Restaurant operating system
                </p>
              </div>
            </div>

            <div className="bg-white border border-black/5 rounded-[2rem] shadow-xl shadow-black/5 p-6 sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-semibold text-emerald-700 mb-2">
                  Welcome back
                </p>
                <h2 className="text-3xl font-black tracking-tight">
                  Sign in to continue
                </h2>
                <p className="text-slate-500 mt-2">
                  Use staff PIN for daily operations or admin login for setup.
                </p>
              </div>

              <div className="grid grid-cols-2 bg-slate-100 rounded-2xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode("pin");
                    setError("");
                  }}
                  className={`py-3 rounded-xl font-bold transition ${
                    mode === "pin"
                      ? "bg-slate-950 text-white shadow"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Staff PIN
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setError("");
                  }}
                  className={`py-3 rounded-xl font-bold transition ${
                    mode === "password"
                      ? "bg-slate-950 text-white shadow"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Admin
                </button>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {mode === "pin" ? (
                <div>
                  <div className="h-16 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-3xl tracking-[12px] font-black mb-5">
                    {pin ? (
                      "•".repeat(pin.length)
                    ) : (
                      <span className="text-base tracking-normal text-slate-400">
                        Enter staff PIN
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {keypad.map((number) => (
                      <button
                        key={number}
                        type="button"
                        onClick={() => handleNumberClick(number)}
                        className="h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-2xl font-black transition"
                      >
                        {number}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setPin("");
                        setError("");
                      }}
                      className="h-16 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-black transition"
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNumberClick("0")}
                      className="h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-2xl font-black transition"
                    >
                      0
                    </button>

                    <button
                      type="button"
                      onClick={handlePinLogin}
                      disabled={loading || pin.length < 4}
                      className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-black transition"
                    >
                      {loading ? "..." : "Enter"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:border-emerald-500 focus:bg-white"
                      placeholder="admin@zerapos.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:border-emerald-500 focus:bg-white"
                      placeholder="Password"
                    />
                  </div>

                  <button
                    disabled={loading}
                    className="w-full rounded-2xl bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white py-4 font-black transition"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>
              )}
            </div>

            <p className="text-center text-xs text-slate-400 mt-5">
              Zera POS keeps restaurant operations simple, fast and controlled.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
