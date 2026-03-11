import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Convert roles to lowercase to avoid case problems
  const userRole = user.role.toLowerCase();

  if (role && userRole !== role.toLowerCase()) {
    return <Navigate to="/login" />;
  }

  return children;
}