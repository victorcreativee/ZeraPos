import { Navigate } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../utils/authSession";

function getRoleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "manager") return "/manager";
  if (role === "cashier") return "/counter";
  if (role === "kitchen") return "/kitchen";
  if (role === "bar") return "/bar";
  return "/pos";
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = getAuthToken();
  const user = getAuthUser();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
