import { createBrowserRouter } from "react-router";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register/role",
    Component: RoleSelectionPage,
  },
  {
    path: "/register/account",
    Component: AccountInfoPage,
  },
  {
    path: "/register/business",
    Component: BusinessDetailsPage,
  },
  {
    path: "/register/success",
    Component: RegistrationSuccessPage,
  },
  {
    path: "/farmer",
    Component: FarmerLayout,
    children: [
      { index: true, Component: FarmerDashboard },
      { path: "listings", Component: FarmerListings },
      { path: "negotiations", Component: FarmerNegotiations },
      { path: "transactions", Component: FarmerTransactions },
      { path: "transport", Component: FarmerTransport },
      { path: "profile", Component: FarmerProfile },
    ],
  },
  {
    path: "/mill-owner",
    Component: MillOwnerLayout,
    children: [
      { index: true, Component: MillOwnerDashboard },
      { path: "browse", Component: BrowseListings },
      { path: "negotiations", Component: MillOwnerNegotiations },
      { path: "transactions", Component: MillOwnerTransactions },
      { path: "transport", Component: MillOwnerTransport },
      { path: "vehicles", Component: MillOwnerVehicles },
      { path: "profile", Component: MillOwnerProfile },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "verifications", Component: PendingVerifications },
      { path: "users", Component: AdminUsers },
      { path: "reports", Component: AdminReports },
    ],
  },
]);
