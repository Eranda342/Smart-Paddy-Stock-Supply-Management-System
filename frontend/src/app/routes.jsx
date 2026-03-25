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
import ListingDetails from "./pages/farmer/ListingDetails";
import FarmerBrowseListings from "./pages/farmer/BrowseListings";
import TransactionDetails from "./pages/farmer/TransactionDetails";

import MillOwnerDashboard from "./pages/mill-owner/Dashboard";
import MillOwnerBrowseListings from "./pages/mill-owner/BrowseListings";
import MillOwnerNegotiations from "./pages/mill-owner/Negotiations";
import MillOwnerTransactions from "./pages/mill-owner/Transactions";
import MillOwnerTransport from "./pages/mill-owner/Transport";
import MillOwnerVehicles from "./pages/mill-owner/Vehicles";
import MillOwnerProfile from "./pages/mill-owner/Profile";
import MillOwnerListings from "./pages/mill-owner/MillOwnerListings";

import AdminDashboard from "./pages/admin/Dashboard";
import PendingVerifications from "./pages/admin/PendingVerifications";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";

import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([

  // ================= PUBLIC =================
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

  // ================= FARMER =================
  {
    path: "/farmer",
    element: (
      <ProtectedRoute role="FARMER">
        <FarmerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <FarmerDashboard /> },

      { path: "listings", element: <FarmerListings /> },
      { path: "listings/:id", element: <ListingDetails /> },

      { path: "browse", element: <FarmerBrowseListings /> },

      // Negotiations
      { path: "negotiations", element: <FarmerNegotiations /> },
      { path: "negotiations/:id", element: <FarmerNegotiations /> },

      // Transactions
      { path: "transactions", element: <FarmerTransactions /> },
      { path: "transactions/:id", element: <TransactionDetails /> },

      { path: "transport", element: <FarmerTransport /> },
      { path: "profile", element: <FarmerProfile /> },

      // fallback
      { path: "*", element: <FarmerDashboard /> }
    ],
  },

  // ================= MILL OWNER =================
  {
    path: "/mill-owner",
    element: (
      <ProtectedRoute role="MILL_OWNER">
        <MillOwnerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <MillOwnerDashboard /> },

      { path: "browse", element: <MillOwnerBrowseListings /> },
      { path: "listings", element: <MillOwnerListings /> },

      // Negotiations
      { path: "negotiations", element: <MillOwnerNegotiations /> },
      { path: "negotiations/:id", element: <MillOwnerNegotiations /> },

      // Transactions
      { path: "transactions", element: <MillOwnerTransactions /> },
      { path: "transactions/:id", element: <TransactionDetails /> },

      { path: "transport", element: <MillOwnerTransport /> },
      { path: "vehicles", element: <MillOwnerVehicles /> },
      { path: "profile", element: <MillOwnerProfile /> },

      // fallback
      { path: "*", element: <MillOwnerDashboard /> }
    ],
  },

  // ================= ADMIN =================
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "verifications", element: <PendingVerifications /> },
      { path: "users", element: <AdminUsers /> },
      { path: "reports", element: <AdminReports /> },

      // fallback
      { path: "*", element: <AdminDashboard /> }
    ],
  },

]);