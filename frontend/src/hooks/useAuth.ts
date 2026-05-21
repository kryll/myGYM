import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { LoginCredentials, RegisterData } from '@/types';

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    tenant,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    clearError,
    updateProfile,
  } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await storeLogin(credentials);
      navigate('/dashboard');
    },
    [storeLogin, navigate],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      await storeRegister(data);
      navigate('/dashboard');
    },
    [storeRegister, navigate],
  );

  const logout = useCallback(() => {
    storeLogout();
    navigate('/login');
  }, [storeLogout, navigate]);

  const isAdmin = user?.role === 'admin';
  const isTrainer = user?.role === 'trainer' || user?.role === 'admin';
  const isMember = user?.role === 'member';

  const fullName = user
    ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
    : '';

  const hasFeature = useCallback(
    (feature: string): boolean => {
      return tenant?.settings.features.includes(feature) ?? false;
    },
    [tenant],
  );

  return {
    user,
    tenant,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isTrainer,
    isMember,
    fullName,
    login,
    register,
    logout,
    clearError,
    updateProfile,
    hasFeature,
  };
}
