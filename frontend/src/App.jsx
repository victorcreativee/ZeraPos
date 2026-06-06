import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import POSPage from "./pages/pos/POSPage";
import OpenOrdersPage from "./pages/pos/OpenOrdersPage";
import MyOrdersHistoryPage from "./pages/pos/MyOrdersHistoryPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CounterDashboardPage from "./pages/CounterDashboardPage";
import KitchenDisplayPage from "./pages/kitchen/KitchenDisplayPage";
import BarDisplayPage from "./pages/bar/BarDisplayPage";
import SystemAdminSetupPage from "./pages/SystemAdminSetupPage";
import PreviousOrdersPage from "./pages/orders/PreviousOrdersPage";
import SettingsPage from "./pages/SettingsPage";
import { getAuthUser } from "./utils/authSession";

function DashboardRedirect() {
  const user = getAuthUser();
  const role = user?.role;

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "manager") return <Navigate to="/manager" replace />;
  if (role === "cashier") return <Navigate to="/counter" replace />;
  if (role === "kitchen") return <Navigate to="/kitchen" replace />;
  if (role === "bar") return <Navigate to="/bar" replace />;
  if (role === "server") return <Navigate to="/pos" replace />;

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pos"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "server"]}>
            <POSPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/open"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "server"]}>
            <OpenOrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/history"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "server"]}>
            <MyOrdersHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <ManagerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/counter"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "cashier"]}>
            <CounterDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kitchen"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "kitchen"]}>
            <KitchenDisplayPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bar"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "bar"]}>
            <BarDisplayPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/setup"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SystemAdminSetupPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/branches"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SystemAdminSetupPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tables"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SystemAdminSetupPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/menu"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SystemAdminSetupPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SystemAdminSetupPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/receipts"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SystemAdminSetupPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/backup-sync"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SystemAdminSetupPage />
          </ProtectedRoute>
        }
      />

      <Route path="/orders" element={<PreviousOrdersPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}

export default App;
