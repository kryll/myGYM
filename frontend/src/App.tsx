import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import Layout from '@/components/Layout/Layout';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Main pages
import DashboardPage from '@/pages/DashboardPage';
import ExercisesPage from '@/pages/exercises/ExercisesPage';
import ExerciseDetailPage from '@/pages/exercises/ExerciseDetailPage';
import TrainingPlansPage from '@/pages/training/TrainingPlansPage';
import PlanDetailPage from '@/pages/training/PlanDetailPage';
import ActiveWorkoutPage from '@/pages/training/ActiveWorkoutPage';
import AICoachPage from '@/pages/ai/AICoachPage';
import MeasurementsPage from '@/pages/measurements/MeasurementsPage';
import AddMeasurementPage from '@/pages/measurements/AddMeasurementPage';
import ChallengesPage from '@/pages/challenges/ChallengesPage';
import GoalsPage from '@/pages/goals/GoalsPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import DevicesPage from '@/pages/profile/DevicesPage';
import TenantDashboard from '@/pages/admin/TenantDashboard';

// Auth Guard
function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Admin Guard
function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Guest Guard (redirect to dashboard if already logged in)
function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Real-time sync initializer
function RealtimeSync() {
  useRealtimeSync({ enabled: true });
  return null;
}

// Tenant detection from subdomain/URL
function useTenantDetection() {
  const setTenant = useAuthStore((s) => s.setTenant);
  const tenant = useAuthStore((s) => s.tenant);

  useEffect(() => {
    // Detect tenant from subdomain: gym.mygym.app -> slug = 'gym'
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    if (parts.length > 2 && parts[0] !== 'www') {
      const detectedSlug = parts[0];
      if (tenant && tenant.slug !== detectedSlug) {
        // Tenant mismatch - would trigger re-auth in production
        console.info(`[Tenant] Detectado slug: ${detectedSlug}`);
      }
    }

    // Also check URL param for dev
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant');
    if (tenantParam && !tenant) {
      console.info(`[Tenant] Tenant param: ${tenantParam}`);
    }
  }, [tenant, setTenant]);
}

function AppContent() {
  useTenantDetection();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  return (
    <>
      {isAuthenticated && <RealtimeSync />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <GuestGuard>
                <LoginPage />
              </GuestGuard>
            }
          />
          <Route
            path="/register"
            element={
              <GuestGuard>
                <RegisterPage />
              </GuestGuard>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <Layout />
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="exercises" element={<ExercisesPage />} />
            <Route path="exercises/:id" element={<ExerciseDetailPage />} />
            <Route path="training" element={<TrainingPlansPage />} />
            <Route path="training/:id" element={<PlanDetailPage />} />
            <Route path="workout/active" element={<ActiveWorkoutPage />} />
            <Route path="ai-coach" element={<AICoachPage />} />
            <Route path="measurements" element={<MeasurementsPage />} />
            <Route path="measurements/add" element={<AddMeasurementPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/devices" element={<DevicesPage />} />
            <Route
              path="admin"
              element={
                <AdminGuard>
                  <TenantDashboard />
                </AdminGuard>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
