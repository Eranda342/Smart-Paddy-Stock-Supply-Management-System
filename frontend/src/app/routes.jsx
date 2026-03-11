import { createBrowserRouter } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import AccountInfoPage from "./pages/AccountInfoPage";
import BusinessDetailsPage from "./pages/BusinessDetailsPage";
import RegistrationSuccessPage from "./pages/RegistrationSuccessPage";

import FarmerLayout from "./layouts/FarmerLayout";
import MillOwnerLayout from "./layouts/MillOwnerLayout";
import AdminLayout from "./layouts/AdminLayout";

import FarmerDashboard from "./pages/farmer/Dashboard";
import FarmerListings from "./pages/farmer/Listings";
import FarmerNegotiations from "./pages/farmer/Negotiations";
import FarmerTransactions from "./pages/farmer/Transactions";
import FarmerTransport from "./pages/farmer/Transport";
import FarmerProfile from "./pages/farmer/Profile";

import MillOwnerDashboard from "./pages/mill-owner/Dashboard";
import BrowseListings from "./pages/mill-owner/BrowseListings";
import MillOwnerNegotiations from "./pages/mill-owner/Negotiations";
import MillOwnerTransactions from "./pages/mill-owner/Transactions";
import MillOwnerTransport from "./pages/mill-owner/Transport";
import MillOwnerVehicles from "./pages/mill-owner/Vehicles";
import MillOwnerProfile from "./pages/mill-owner/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import PendingVerifications from "./pages/admin/PendingVerifications";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register/role",
    element: <RoleSelectionPage />,
  },
  {
    path: "/register/account",
    element: <AccountInfoPage />,
  },
  {
    path: "/register/business",
    element: <BusinessDetailsPage />,
  },
  {
    path: "/register/success",
    element: <RegistrationSuccessPage />,
  },

  {
    path: "/farmer",
    element: (
    <ProtectedRoute role="farmer">
      <FarmerLayout />
    </ProtectedRoute>
  ),
    children: [
      { index: true, element: <FarmerDashboard /> },
      { path: "listings", element: <FarmerListings /> },
      { path: "negotiations", element: <FarmerNegotiations /> },
      { path: "transactions", element: <FarmerTransactions /> },
      { path: "transport", element: <FarmerTransport /> },
      { path: "profile", element: <FarmerProfile /> },
    ],
  },

  {
    path: "/mill-owner",
    element: (
    <ProtectedRoute role="mill_owner">
      <MillOwnerLayout />
    </ProtectedRoute>
  ),
    children: [
      { index: true, element: <MillOwnerDashboard /> },
      { path: "browse", element: <BrowseListings /> },
      { path: "negotiations", element: <MillOwnerNegotiations /> },
      { path: "transactions", element: <MillOwnerTransactions /> },
      { path: "transport", element: <MillOwnerTransport /> },
      { path: "vehicles", element: <MillOwnerVehicles /> },
      { path: "profile", element: <MillOwnerProfile /> },
    ],
  },

  {
    path: "/admin",
    element: (
    <ProtectedRoute role="admin">
      <AdminLayout />
    </ProtectedRoute>
  ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "verifications", element: <PendingVerifications /> },
      { path: "users", element: <AdminUsers /> },
      { path: "reports", element: <AdminReports /> },
    ],
  },
]);