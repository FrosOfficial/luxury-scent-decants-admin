import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface LocalUser {
  id: string;
  supabase_auth_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  delivery_address: string | null;
  city: string | null;
  province: string | null;
  facebook_profile: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  localUser: LocalUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  checkAdminRole: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const verifyingRef = React.useRef(false);
  const checkedRef = React.useRef(false);

  const checkAdminRole = async (): Promise<boolean> => {
    try {
      const response = await api.get('/me');
      const user: LocalUser = response.data;
      setLocalUser(user);
      
      if (user.role !== 'admin') {
        toast.error('Access Denied: You do not have administrator privileges.');
        await supabase.auth.signOut();
        setLocalUser(null);
        setSupabaseUser(null);
        return false;
      }
      return true;
    } catch (error: any) {
      console.error('Error verifying admin profile:', error);
      toast.error(error.response?.data?.message || 'Failed to authenticate admin session.');
      await supabase.auth.signOut();
      setLocalUser(null);
      setSupabaseUser(null);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleAuth = async (session: any) => {
      if (!isMounted) return;

      if (session?.user) {
        setSupabaseUser(session.user);
        
        // Prevent duplicate concurrent /me checks
        if (!checkedRef.current && !verifyingRef.current) {
          verifyingRef.current = true;
          setLoading(true);
          const success = await checkAdminRole();
          if (isMounted) {
            verifyingRef.current = false;
            if (success) {
              checkedRef.current = true;
            }
            setLoading(false);
          }
        } else if (checkedRef.current) {
          setLoading(false);
        }
      } else {
        setSupabaseUser(null);
        setLocalUser(null);
        checkedRef.current = false;
        verifyingRef.current = false;
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // 1. Initial check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuth(session);
    });

    // 2. Auth listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        handleAuth(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setLocalUser(null);
      toast.success('Successfully logged out.');
    } catch (error: any) {
      toast.error('Logout failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!supabaseUser;
  const isAdmin = localUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        supabaseUser,
        localUser,
        loading,
        isAuthenticated,
        isAdmin,
        logout,
        checkAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
