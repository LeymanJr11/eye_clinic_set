// App.jsx - Updated with consolidated login system
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { LoginPage } from "@/pages/auth/LoginPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { DoctorDashboard } from "@/pages/doctor/DoctorDashboard";
import { DoctorAppointmentsPage } from "@/pages/doctor/DoctorAppointmentsPage";
import { DoctorTimeSlotsPage } from "@/pages/doctor/DoctorTimeSlotsPage";
import { DoctorFeedbackPage } from "@/pages/doctor/DoctorFeedbackPage";
import { DoctorViewAppointmentPage } from "@/pages/doctor/DoctorViewAppointmentPage";
import { DoctorsPage } from "@/pages/admin/DoctorsPage";
import { ViewDoctorPage } from "@/pages/admin/ViewDoctorPage";
import { PatientsPage } from "@/pages/admin/PatientsPage";
import { AppointmentsPage } from "@/pages/admin/AppointmentsPage";
import { EyeTestPage } from "@/pages/admin/EyeTestPage";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { ViewAppointmentPage } from "./pages/admin/ViewAppointmentPage";
import { AdminsPage } from "./pages/admin/AdminPage";

export const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="admins" element={<AdminsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="doctors/:id" element={<ViewDoctorPage />} />
              <Route path="appointments/:id" element={<ViewAppointmentPage />} />
              <Route path="eye-tests" element={<EyeTestPage />} />
            </Route>

            {/* Doctor Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointmentsPage />} />
              <Route path="appointments/:id" element={<DoctorViewAppointmentPage />} />
              <Route path="time-slots" element={<DoctorTimeSlotsPage />} />
              <Route path="feedback" element={<DoctorFeedbackPage />} />
            </Route>

            {/* Redirect /dashboard to appropriate role dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {({ user }) => (
                    <Navigate
                      to={user.role === "admin" ? "/admin" : "/doctor"}
                      replace
                    />
                  )}
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;