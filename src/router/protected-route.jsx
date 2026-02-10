import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ element, allowedRoleIds }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/" />;

  if (!allowedRoleIds.includes(user?.roleId)) {
    return <Navigate to="/403" replace />;
  }

  return element;
}