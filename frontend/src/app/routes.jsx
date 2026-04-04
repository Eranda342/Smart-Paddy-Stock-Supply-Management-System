import { createBrowserRouter } from "react-router-dom";

// ================= PUBLIC =================
import LandingPage from "./pages/LandingPage";
import PaddyTypesPage from "./pages/PaddyTypesPage";
import FertilizersPage from "./pages/FertilizersPage";
import TransportPage from "./pages/TransportPage";
import AboutPage from "./pages/AboutPage";

// ================= AUTH =================
import LoginPage from "./pages/LoginPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import AccountInfoPage from "./pages/AccountInfoPage";
import BusinessDetailsPage from "./pages/BusinessDetailsPage";
import RegistrationSuccessPage from "./pages/RegistrationSuccessPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// ================= LAYOUTS =================
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import FarmerLayout from "./layouts/FarmerLayout";
import MillOwnerLayout from "./layouts/MillOwnerLayout";
import AdminLayout from "./layouts/AdminLayout";

// ================= FARMER =================
import FarmerDashboard from "./pages/farmer/Dashboard";
import FarmerListings from "./pages/farmer/Listings";
import FarmerNegotiations from "./pages/farmer/Negotiations";
import FarmerTransactions from "./pages/farmer/Transactions";
import FarmerTransport from "./pages/farmer/Transport";
import FarmerProfile from "./pages/farmer/Profile";
import ListingDetails from "./pages/farmer/ListingDetails";
import FarmerBrowseListings from "./pages/farmer/BrowseListings";

// ================= MILL OWNER =================
import MillOwnerDashboard from "./pages/mill-owner/Dashboard";
import MillOwnerBrowseListings from "./pages/mill-owner/BrowseListings";
import MillOwnerNegotiations from "./pages/mill-owner/Negotiations";
import MillOwnerTransactions from "./pages/mill-owner/Transactions";
import MillOwnerTransport from "./pages/mill-owner/Transport";
import MillOwnerVehicles from "./pages/mill-owner/Vehicles";
import MillOwnerProfile from "./pages/mill-owner/Profile";
import MillOwnerListings from "./pages/mill-owner/MillOwnerListings";

// ================= ADMIN =================
import AdminDashboard from "./pages/admin/Dashboard";
import PendingVerifications from "./pages/admin/PendingVerifications";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import AdminListings from "./pages/admin/Listings";
import AdminNegotiations from "./pages/admin/Negotiations";
import AdminTransactions from "./pages/admin/Transactions";
import AdminTransport from "./pages/admin/Transport";
import AdminDisputes from "./pages/admin/Disputes";
import AdminNotificationsCenter from "./pages/admin/NotificationsCenter";
import AdminSystemSettings from "./pages/admin/SystemSettings";

// ================= SHARED =================
import TransactionDetails from "./pages/common/TransactionDetails";
import Complaints from "./pages/common/Complaints";

// ================= PROTECTED =================
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([

  // ================= PUBLIC =================
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/paddy-types",
        element: <PaddyTypesPage />,
      },
      {
        path: "/fertilizers",
        element: <FertilizersPage />,
      },
      {
        path: "/transport",
        element: <TransportPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
    ],
  },

  // ================= AUTH =================
  {
    element: <AuthLayout />,
    children: [
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
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/reset-password/:token",
        element: <ResetPasswordPage />,
      },
    ],
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

      { path: "browse-listings", element: <FarmerBrowseListings /> },

      // Negotiations
      { path: "negotiations", element: <FarmerNegotiations /> },
      { path: "negotiations/:id", element: <FarmerNegotiations /> },

      // Transactions
      { path: "transactions", element: <FarmerTransactions /> },
      { path: "transactions/:id", element: <TransactionDetails /> },

      { path: "transport", element: <FarmerTransport /> },
      { path: "complaints", element: <Complaints /> },
      { path: "profile", element: <FarmerProfile /> },

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

      { path: "browse-listings", element: <MillOwnerBrowseListings /> },
      { path: "listings", element: <MillOwnerListings /> },

      // Negotiations
      { path: "negotiations", element: <MillOwnerNegotiations /> },
      { path: "negotiations/:id", element: <MillOwnerNegotiations /> },

      // Transactions
      { path: "transactions", element: <MillOwnerTransactions /> },
      { path: "transactions/:id", element: <TransactionDetails /> },

      { path: "transport", element: <MillOwnerTransport /> },
      { path: "vehicles", element: <MillOwnerVehicles /> },
      { path: "complaints", element: <Complaints /> },
      { path: "profile", element: <MillOwnerProfile /> },

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

      // Users
      { path: "users", element: <AdminUsers /> },
      { path: "verifications", element: <PendingVerifications /> },

      // Marketplace
      { path: "listings", element: <AdminListings /> },
      { path: "negotiations", element: <AdminNegotiations /> },
      { path: "transactions", element: <AdminTransactions /> },
      { path: "transport", element: <AdminTransport /> },

      // Analytics
      { path: "reports", element: <AdminReports /> },

      // Support
      { path: "disputes", element: <AdminDisputes /> },
      { path: "notifications-center", element: <AdminNotificationsCenter /> },

      // Configuration
      { path: "settings", element: <AdminSystemSettings /> },

      { path: "*", element: <AdminDashboard /> }
    ],
  },

]);