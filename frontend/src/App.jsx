import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import POSPage from "./pages/pos/POSPage";
import OpenOrdersPage from "./pages/pos/OpenOrdersPage";
import MyOrdersHistoryPage from "./pages/pos/MyOrdersHistoryPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CounterDashboardPage from "./pages/CounterDashboardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
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
    </Routes>
  );
}

export default App;
