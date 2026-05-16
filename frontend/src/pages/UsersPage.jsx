import { useEffect, useState } from "react";
import { createUser, getUsers } from "../api/usersApi";
import { clearAuthSession, getAuthUser } from "../utils/authSession";

function UsersPage() {
  const currentUser = getAuthUser();

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "server",
    pin: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoadingUsers(true);
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await createUser(formData);

      setMessage("User created successfully");

      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "server",
        pin: "",
        password: "",
      });

      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  }
  function handleLogout() {
    clearAuthSession();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <header className="border-b border-slate-800 bg-[#07111c] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">ZERA POS</h1>
            <p className="text-sm text-slate-400">Staff and user management</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{currentUser.name}</p>
              <p className="text-xs text-purple-400 uppercase">
                {currentUser.role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1 bg-[#111827] border border-slate-800 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-1">Create Staff User</h2>
          <p className="text-slate-400 text-sm mb-6">
            Add waiters, cashiers, managers, or system admins.
          </p>

          {message && (
            <div className="mb-4 bg-green-500/10 border border-green-500 text-green-300 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500 text-red-300 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
                placeholder="Example: John Waiter"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
                placeholder="0700000000"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
              >
                <option value="server">Waiter / Server</option>
                <option value="cashier">Cashier / Counter</option>
                <option value="manager">Manager</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">PIN</label>
              <input
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                className="w-full bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
                placeholder="Example: 2222"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
                placeholder="Optional for waiters"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-2xl py-4 font-bold"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </form>
        </section>

        <section className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Staff Users</h2>
              <p className="text-slate-400 text-sm">
                All users registered in this local zeraPOS system.
              </p>
            </div>

            <button
              onClick={loadUsers}
              className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl font-semibold"
            >
              Refresh
            </button>
          </div>

          {loadingUsers ? (
            <p className="text-slate-400">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-sm">
                    <th className="py-3">Name</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Phone</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/40"
                    >
                      <td className="py-4 font-semibold">{user.name}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs uppercase">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 text-slate-300">
                        {user.phone || "-"}
                      </td>
                      <td className="py-4 text-slate-300">
                        {user.email || "-"}
                      </td>
                      <td className="py-4">
                        {user.is_active ? (
                          <span className="text-green-400">Active</span>
                        ) : (
                          <span className="text-red-400">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <p className="text-slate-400 py-6">No users found.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default UsersPage;
