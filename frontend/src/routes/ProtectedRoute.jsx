import { Navigate } from "react-router-dom";

function getRoleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "manager") return "/manager";
  if (role === "cashier") return "/counter";
  return "/dashboard";
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("zera_token");
  const user = JSON.parse(localStorage.getItem("zera_user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
