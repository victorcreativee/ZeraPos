import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  changeUserPin,
  createUser,
  getUsers,
  updateUser,
} from "../api/usersApi";
import { clearAuthSession, getAuthUser } from "../utils/authSession";
const roleOptions = [
  {
    value: "admin",
    label: "System Admin",
    color: "bg-purple-500/10 text-purple-300",
  },
  {
    value: "manager",
    label: "Manager",
    color: "bg-blue-500/10 text-blue-300",
  },
  {
    value: "cashier",
    label: "Cashier",
    color: "bg-green-500/10 text-green-300",
  },
  {
    value: "server",
    label: "Waiter / Server",
    color: "bg-amber-500/10 text-amber-300",
  },
  {
    value: "kitchen",
    label: "Kitchen Staff",
    color: "bg-orange-500/10 text-orange-300",
  },
  {
    value: "bar",
    label: "Bar Staff",
    color: "bg-pink-500/10 text-pink-300",
  },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "server",
  pin: "",
  password: "",
  is_active: 1,
};

function UsersPage() {
  const currentUser = getAuthUser();

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState(null);
  const [pinUser, setPinUser] = useState(null);
  const [newPin, setNewPin] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const roleCounts = useMemo(() => {
    return roleOptions.reduce((acc, role) => {
      acc[role.value] = users.filter((user) => user.role === role.value).length;
      return acc;
    }, {});
  }, [users]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingUser(null);
  }

  function startEdit(user) {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "server",
      pin: "",
      password: "",
      is_active: Number(user.is_active) === 1 ? 1 : 0,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (editingUser) {
        await updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          is_active: Number(formData.is_active),
        });

        setMessage("Staff user updated successfully");
      } else {
        await createUser(formData);
        setMessage("Staff user created successfully");
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePin(e) {
    e.preventDefault();

    if (!pinUser) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await changeUserPin(pinUser.id, newPin);

      setMessage(`PIN updated for ${pinUser.name}`);
      setPinUser(null);
      setNewPin("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update PIN");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAuthSession();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#07111c] text-white">
      <header className="border-b border-slate-800 bg-[#07111c] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="text-sm text-slate-400 hover:text-white"
            >
              ← Back to System Admin
            </Link>
            <h1 className="text-3xl font-black mt-2">Users & Roles</h1>
            <p className="text-sm text-slate-400">
              Manage staff access for cashier, waiter, manager, and admin
              workspaces.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
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

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {(message || error) && (
          <div
            className={`rounded-2xl px-5 py-4 border ${
              message
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            {message || error}
          </div>
        )}

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {roleOptions.map((role) => (
            <div
              key={role.value}
              className="bg-[#111827] border border-slate-800 rounded-3xl p-5"
            >
              <p className="text-slate-400 text-sm">{role.label}</p>
              <h2 className="text-3xl font-black mt-2">
                {roleCounts[role.value] || 0}
              </h2>
            </div>
          ))}
        </section>

        <section className="grid xl:grid-cols-[420px_1fr] gap-6">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 h-fit">
            <h2 className="text-xl font-black">
              {editingUser ? "Edit Staff User" : "Create Staff User"}
            </h2>
            <p className="text-slate-400 text-sm mt-1 mb-6">
              Give each staff member their own PIN for accountability.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: John Waiter"
                required
              />

              <FormInput
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Optional"
              />

              <FormInput
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0700000000"
              />

              <label className="block">
                <span className="text-sm text-slate-400">Role</span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full mt-2 bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>

              {!editingUser && (
                <>
                  <FormInput
                    label="PIN"
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    placeholder="Example: 2222"
                    required
                  />

                  <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Optional for waiters"
                  />
                </>
              )}

              {editingUser && (
                <label className="block">
                  <span className="text-sm text-slate-400">Status</span>
                  <select
                    name="is_active"
                    value={formData.is_active}
                    onChange={handleChange}
                    className="w-full mt-2 bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </label>
              )}

              <div className="flex gap-3">
                <button
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-2xl py-4 font-black"
                >
                  {loading
                    ? "Saving..."
                    : editingUser
                    ? "Save Changes"
                    : "Create User"}
                </button>

                {editingUser && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black">Staff Users</h2>
                <p className="text-slate-400 text-sm">
                  {filteredUsers.length} visible staff members
                </p>
              </div>

              <div className="flex gap-3">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search staff..."
                  className="bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
                />

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
                >
                  <option value="all">All Roles</option>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={loadUsers}
                  className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl font-semibold"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <p className="text-slate-400">Loading users...</p>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <StaffCard
                    key={user.id}
                    user={user}
                    onEdit={startEdit}
                    onPin={(selectedUser) => {
                      setPinUser(selectedUser);
                      setNewPin("");
                    }}
                  />
                ))}

                {filteredUsers.length === 0 && (
                  <div className="bg-[#0D1117] border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
                    No staff found.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {pinUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleChangePin}
            className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-6"
          >
            <h2 className="text-xl font-black">Change PIN</h2>
            <p className="text-slate-400 text-sm mt-1 mb-5">
              Updating PIN for {pinUser.name}
            </p>

            <FormInput
              label="New PIN"
              name="newPin"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Example: 4455"
              required
            />

            <div className="flex gap-3 mt-5">
              <button
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-2xl py-4 font-black"
              >
                {loading ? "Updating..." : "Update PIN"}
              </button>

              <button
                type="button"
                onClick={() => setPinUser(null)}
                className="px-5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StaffCard({ user, onEdit, onPin }) {
  const role = roleOptions.find((item) => item.value === user.role);

  return (
    <div className="bg-[#0D1117] border border-slate-800 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h3 className="font-black text-lg">{user.name}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              role?.color || "bg-slate-800 text-slate-300"
            }`}
          >
            {role?.label || user.role}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              Number(user.is_active) === 1
                ? "bg-green-500/10 text-green-300"
                : "bg-red-500/10 text-red-300"
            }`}
          >
            {Number(user.is_active) === 1 ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="text-slate-400 text-sm mt-2">
          {user.phone || "No phone"} • {user.email || "No email"}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onEdit(user)}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-2xl font-bold"
        >
          Edit
        </button>

        <button
          onClick={() => onPin(user)}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-2xl font-bold"
        >
          Change PIN
        </button>
      </div>
    </div>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        required={required}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full mt-2 bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
      />
    </label>
  );
}

export default UsersPage;
