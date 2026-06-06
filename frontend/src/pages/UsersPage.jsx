import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import {
  changeUserPin,
  createUser,
  getUsers,
  updateUser,
} from "../api/usersApi";

const roleOptions = [
  { value: "admin", label: "System Admin", help: "Full system control" },
  { value: "manager", label: "Manager", help: "Reports and operations" },
  { value: "cashier", label: "Cashier", help: "Payments and receipts" },
  { value: "server", label: "Waiter / Server", help: "POS order taking" },
  { value: "kitchen", label: "Kitchen Staff", help: "Kitchen screen access" },
  { value: "bar", label: "Bar Staff", help: "Bar screen access" },
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
      const keyword = searchTerm.toLowerCase();

      const matchesSearch =
        user.name?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword);

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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AppHeader
        title="Users & Roles"
        subtitle="Create staff access for admin, manager, cashier, waiter, kitchen, and bar teams"
        showBackToDashboard={true}
      />

      <main className="mx-auto max-w-7xl p-5 space-y-5">
        <Link to="/admin" className="text-sm font-black text-slate-500">
          ← Back to System Admin
        </Link>

        {(message || error) && (
          <div
            className={`border px-5 py-4 text-sm font-black ${
              message
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message || error}
          </div>
        )}

        <section className="grid sm:grid-cols-2 xl:grid-cols-6 gap-3">
          {roleOptions.map((role) => (
            <div
              key={role.value}
              className="border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-black uppercase text-slate-400">
                {role.label}
              </p>
              <h2 className="mt-2 text-3xl font-black">
                {roleCounts[role.value] || 0}
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {role.help}
              </p>
            </div>
          ))}
        </section>

        <section className="grid xl:grid-cols-[420px_1fr] gap-5">
          <div className="border border-slate-200 bg-white p-5 shadow-sm h-fit">
            <h2 className="text-xl font-black">
              {editingUser ? "Edit Staff User" : "Create Staff User"}
            </h2>
            <p className="mt-1 mb-5 text-sm font-semibold text-slate-500">
              Use separate roles so kitchen and bar staff open their own screens
              automatically after login.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <FormInput
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />

              <label className="block">
                <span className="text-sm font-black text-slate-700">Role</span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-2 h-12 w-full border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-slate-500"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} — {role.help}
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
                    placeholder="Optional"
                  />
                </>
              )}

              {editingUser && (
                <label className="block">
                  <span className="text-sm font-black text-slate-700">
                    Status
                  </span>
                  <select
                    name="is_active"
                    value={formData.is_active}
                    onChange={handleChange}
                    className="mt-2 h-12 w-full border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-slate-500"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </label>
              )}

              <div className="flex gap-3">
                <button
                  disabled={loading}
                  className="h-12 flex-1 bg-slate-950 text-sm font-black text-white disabled:opacity-50"
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
                    className="h-12 px-5 border border-slate-200 bg-white font-black"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-black">Staff Users</h2>
                <p className="text-sm font-semibold text-slate-500">
                  {filteredUsers.length} visible staff members
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search staff..."
                  className="h-11 border border-slate-200 px-3 text-sm font-semibold outline-none"
                />

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-11 border border-slate-200 px-3 text-sm font-semibold outline-none"
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
                  className="h-11 bg-slate-950 px-4 text-sm font-black text-white"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <p className="text-sm font-black text-slate-400">
                Loading users...
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200">
                {filteredUsers.map((user) => (
                  <StaffRow
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
                  <div className="p-8 text-center text-sm font-black text-slate-400">
                    No staff found.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {pinUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleChangePin}
            className="w-full max-w-md border border-slate-200 bg-white p-5 shadow-xl"
          >
            <h2 className="text-xl font-black">Change PIN</h2>
            <p className="mt-1 mb-5 text-sm font-semibold text-slate-500">
              Updating PIN for {pinUser.name}
            </p>

            <FormInput
              label="New PIN"
              name="newPin"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              required
            />

            <div className="mt-5 flex gap-3">
              <button
                disabled={loading}
                className="h-12 flex-1 bg-slate-950 text-sm font-black text-white disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update PIN"}
              </button>

              <button
                type="button"
                onClick={() => setPinUser(null)}
                className="h-12 px-5 border border-slate-200 bg-white font-black"
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

function StaffRow({ user, onEdit, onPin }) {
  const role = roleOptions.find((item) => item.value === user.role);

  return (
    <div className="grid gap-3 px-4 py-3 lg:grid-cols-[1.2fr_1fr_120px_180px] lg:items-center">
      <div>
        <h3 className="font-black text-slate-950">{user.name}</h3>
        <p className="text-sm font-semibold text-slate-500">
          {user.phone || "No phone"} • {user.email || "No email"}
        </p>
      </div>

      <div>
        <p className="font-black text-slate-800">{role?.label || user.role}</p>
        <p className="text-xs font-semibold text-slate-500">{role?.help}</p>
      </div>

      <span
        className={`w-fit px-3 py-1 text-xs font-black uppercase ${
          Number(user.is_active) === 1
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {Number(user.is_active) === 1 ? "Active" : "Inactive"}
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(user)}
          className="h-10 flex-1 border border-slate-200 bg-white text-sm font-black"
        >
          Edit
        </button>
        <button
          onClick={() => onPin(user)}
          className="h-10 flex-1 bg-slate-950 text-sm font-black text-white"
        >
          PIN
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
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        required={required}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 h-12 w-full border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-slate-500"
      />
    </label>
  );
}

export default UsersPage;
