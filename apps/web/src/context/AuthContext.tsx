import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  apiClient
} from '@/lib/api-client';
import type {
  UserDto,
  OrganizationDto,
  OrganizationMembershipDto,
  LoginInput,
  RegisterInput,
  UpdateProfileInput
} from '@ai-business-manager/shared';

interface AuthContextType {
  user: UserDto | null;
  activeOrganization: OrganizationDto | null;
  currentMembership: OrganizationMembershipDto | null;
  organizations: OrganizationDto[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<boolean>;
  createOrganization: (name: string, slug?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: UpdateProfileInput) => Promise<{ success: boolean; error?: string }>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [activeOrganization, setActiveOrganization] = useState<OrganizationDto | null>(null);
  const [currentMembership, setCurrentMembership] = useState<OrganizationMembershipDto | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const session = await apiClient.getMe();
      setUser(session.user);
      setActiveOrganization(session.activeOrganization);
      setCurrentMembership(session.currentMembership);
      setOrganizations(session.organizations);
    } catch {
      setUser(null);
      setActiveOrganization(null);
      setCurrentMembership(null);
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (data: LoginInput): Promise<{ success: boolean; error?: string }> => {
    try {
      const session = await apiClient.login(data);
      setUser(session.user);
      setActiveOrganization(session.activeOrganization);
      setCurrentMembership(session.currentMembership);
      setOrganizations(session.organizations);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Login failed'
      };
    }
  };

  const register = async (data: RegisterInput): Promise<{ success: boolean; error?: string }> => {
    try {
      const session = await apiClient.register(data);
      setUser(session.user);
      setActiveOrganization(session.activeOrganization);
      setCurrentMembership(session.currentMembership);
      setOrganizations(session.organizations);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } finally {
      setUser(null);
      setActiveOrganization(null);
      setCurrentMembership(null);
      setOrganizations([]);
    }
  };

  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    try {
      const result = await apiClient.switchOrganization(organizationId);
      setActiveOrganization(result.activeOrganization);
      setCurrentMembership(result.currentMembership);
      await refreshAuth();
      return true;
    } catch {
      return false;
    }
  };

  const createOrganization = async (name: string, slug?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await apiClient.createOrganization({ name, slug });
      setActiveOrganization(result.organization);
      setCurrentMembership(result.membership);
      await refreshAuth();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create organization'
      };
    }
  };

  const updateProfile = async (data: UpdateProfileInput): Promise<{ success: boolean; error?: string }> => {
    try {
      const updated = await apiClient.updateProfile(data);
      setUser(updated);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update profile'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrganization,
        currentMembership,
        organizations,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchOrganization,
        createOrganization,
        updateProfile,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
