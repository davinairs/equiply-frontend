import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import LoginPage from "./pages/auth/LoginPage";
import NotificationPage from "./pages/common/NotificationPage";
import SettingPage from "./pages/common/SettingPage";

import ServerErrorPage from "./pages/errors/ServerErrorPage";
import NotFoundPage from "./pages/errors/NotFoundPage";
import ForbiddenPage from "./pages/errors/ForbiddenPage";

import DashboardPage from "./pages/admin/DashboardPage";
import AdminEquipmentPage from "./pages/admin/AdminEquipmentPage";
import AdminBorrowRequestsPage from "./pages/admin/AdminBorrowRequestsPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import CategoryPage from "./pages/admin/CategoryPage";
import CompanyPage from "./pages/admin/CompanyPage";
import ReportPage from "./pages/admin/ReportPage";

import UserEquipmentPage from "./pages/user/UserEquipmentPage";
import UserBorrowRequestsPage from "./pages/user/UserBorrowRequestsPage";
import BorrowRequestModal from "./components/BorrowRequestModal";

function RootRedirect() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={role === "admin" ? "/admin/dashboard" : "/user/equipments"} replace />;
}

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
    <Toaster position="top-right" />
      <Routes>
        {/* Root & Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* General */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/notification"
          element={
            <ProtectedRoute>
              <NotificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/borrow-requests"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminBorrowRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/equipments"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminEquipmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRole="admin">
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRole="admin">
              <CategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute allowedRole="admin">
              <CompanyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRole="admin">
              <ReportPage />
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/user/equipments"
          element={
            <ProtectedRoute allowedRole="user">
              <UserEquipmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/my-borrow-requests"
          element={
            <ProtectedRoute allowedRole="user">
              <UserBorrowRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/borrow-requests/create/:equipmentId"
          element={
            <ProtectedRoute allowedRole="user">
              <BorrowRequestModal />
            </ProtectedRoute>
          }
        />

        {/* Error Pages */}
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/server-error" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;