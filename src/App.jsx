import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation, // 👈 Added useLocation here
} from "react-router-dom";

//Static Pages
import Homepage from "./Pages/Homepage";
import About from "./Pages/About";
import Services from "./Pages/Services";
import Contact from "./Pages/Contact";
import Footer from "./Layout/Footer";
import Clubs from "./Pages/Clubs";
import InfluencerMarketing from "./Pages/InfluencerMarketing";
import PrComms from "./Pages/PrComms";
import Radio from "./Pages/Radio";
import Label from "./Pages/Label";
import ArtistPage from "./Components/ArtistPage";

// Layouts
import Layout from "./Components/Layout";
import AdminLayout from "./Layout/AdminLayout";
import Header from "./Layout/Header";

//Auth Pages
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import VerifyEmail from "./Pages/VerifyEmail";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

//Protected Routes
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute";

// Dashboard routes
import DashboardLayout from "./Layout/DashboardLayout";
import SettingsPage from "./Pages/Dashboard/SettingsPage";
import DashboardOverview from "./Pages/Dashboard/DashboardOverview";
import WalletPage from "./Pages/Dashboard/WalletPage";
import ReleasesPage from "./Pages/Dashboard/ReleasesPage";
import ArtistProfileForm from "./Pages/Dashboard/ArtistProfileForm";
import NewReleaseBuilder from "./Pages/Dashboard/NewReleaseBuilder";

//Admin routes
import AdminOverview from "./Pages/Admin/AdminOverview";
import UserManagement from "./Pages/Admin/UserManagement";
import ReleaseApprovalQueue from "./Pages/Admin/ReleaseApprovalQueue";
import WithdrawalManager from "./Pages/Admin/WithdrawalManager";

//Auth Pages
import { useUserStore } from "./store/useUserStore";
import "./App.css";
import { Toaster } from "react-hot-toast";

// 1. We create a sub-component to handle the layout logic
const AppContent = () => {
  const { user, checkingAuth } = useUserStore(); // 👈 Pull checkingAuth
  const location = useLocation();

  // 🚀 STOP EVERYTHING if we are still checking the session
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#B6B09F]"></div>
      </div>
    );
  }

  const AuthRedirect = () => {
    const { user } = useUserStore();
    if (!user) return <Login />;
    return user.role === "admin" ? (
      <Navigate to="/admin" />
    ) : (
      <Navigate to="/dashboard" />
    );
  };

  // Check if the current path starts with /dashboard
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      {/* 2. Only show Header if we are NOT on a dashboard route */}
      {!isDashboard && <Header />}

      <main className="flex-grow">
        <Layout>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<About />} />
            <Route path="/artists/:id" element={<ArtistPage />} />
            <Route path="/services">
              <Route index element={<Services />} />
              <Route path="clubs" element={<Clubs />} />
              <Route
                path="influencer-marketing"
                element={<InfluencerMarketing />}
              />
              <Route path="pr-comms" element={<PrComms />} />
              <Route path="radio" element={<Radio />} />
              <Route path="label-services" element={<Label />} />
            </Route>

            <Route path="/contact" element={<Contact />} />
            <Route
              path="/login"
              element={<AuthRedirect />} // Redirect logged in users to dashboard
            />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/signup"
              element={<AuthRedirect />} // Redirect logged in users to dashboard
            />

            {/* Admin Portal Routes - Protected by AdminRoute */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              {/* The 'index' route renders at exactly /admin */}
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="releases" element={<ReleaseApprovalQueue />} />
              <Route path="withdrawals" element={<WithdrawalManager />} />
            </Route>

            {/* Artist Portal Routes - Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="profile" element={<ArtistProfileForm />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="releases" element={<ReleasesPage />} />
              <Route path="releases/new" element={<NewReleaseBuilder />} />
            </Route>

            {/* Catch-all route at absolute bottom */}
            <Route path="*" element={<Navigate to={"/"} />} />
          </Routes>
        </Layout>
      </main>

      {/* 3. Only show Footer if we are NOT on a dashboard route */}
      {!isDashboard && <Footer />}
      <Toaster />
    </div>
  );
};

// 4. App component just wraps everything in the Router
const App = () => {
  const { checkAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
