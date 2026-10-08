/**
 * authStore — Supabase authentication & user role state (Zustand)
 *
 * Manages the signed-in session and user personas:
 * 1. 'owner' -> Multi-bank owner (monitors & manages multiple facilities)
 * 2. 'operator' -> Single-bank operator (bound to one specific facility)
 */
import { create } from 'zustand';
import { supabase } from '@/services/supabase/client';
import { useNetworkStore } from '@/store/networkStore';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'owner' | 'operator';

interface AuthState {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  assignedBankId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUserRole: (role: UserRole, assignedBankId?: string | null) => void;
  signIn: (email: string, password: string, role?: UserRole, assignedBankId?: string | null) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole, assignedBankId?: string | null) => Promise<boolean>;
  quickDemoLogin: (role: UserRole, bankId?: string | null) => void;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialize: () => () => void; // returns unsubscribe fn
}

const STORAGE_ROLE_KEY = 'raktflow_user_role';
const STORAGE_BANK_KEY = 'raktflow_assigned_bank';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  userRole: (localStorage.getItem(STORAGE_ROLE_KEY) as UserRole) || 'owner',
  assignedBankId: localStorage.getItem(STORAGE_BANK_KEY) || 'bank-001',
  isLoading: true,
  error: null,

  setUserRole: (role, assignedBankId = null) => {
    localStorage.setItem(STORAGE_ROLE_KEY, role);
    if (assignedBankId) {
      localStorage.setItem(STORAGE_BANK_KEY, assignedBankId);
      useNetworkStore.getState().setCurrentBankId(assignedBankId);
    }
    set({ userRole: role, assignedBankId: assignedBankId ?? get().assignedBankId });
  },

  // ── Initialize — call once at app root to subscribe to Supabase auth changes ──
  initialize: () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const role = (metadata.role as UserRole) || get().userRole || 'owner';
        const bankId = metadata.assigned_bank_id || get().assignedBankId || 'bank-001';
        
        localStorage.setItem(STORAGE_ROLE_KEY, role);
        localStorage.setItem(STORAGE_BANK_KEY, bankId);
        useNetworkStore.getState().setCurrentBankId(bankId);

        set({
          session,
          user: session.user,
          userRole: role,
          assignedBankId: bankId,
          isLoading: false,
        });
      } else {
        set({ session: null, user: null, isLoading: false });
      }
    });

    // Subscribe to future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const role = (metadata.role as UserRole) || get().userRole || 'owner';
        const bankId = metadata.assigned_bank_id || get().assignedBankId || 'bank-001';

        localStorage.setItem(STORAGE_ROLE_KEY, role);
        localStorage.setItem(STORAGE_BANK_KEY, bankId);
        useNetworkStore.getState().setCurrentBankId(bankId);

        set({
          session,
          user: session.user,
          userRole: role,
          assignedBankId: bankId,
          isLoading: false,
        });
      } else {
        set({ session: null, user: null, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  },

  // ── Sign In ───────────────────────────────────────────────────────────────
  signIn: async (email, password, role, assignedBankId) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // If user exists in Supabase auth.users but has not clicked email confirmation link
      if (error.message.toLowerCase().includes('email not confirmed')) {
        console.warn('Supabase email unconfirmed. Granting active session for testing/demo.');
        const effectiveRole = role || 'owner';
        const effectiveBankId = assignedBankId || 'bank-001';
        get().quickDemoLogin(effectiveRole, effectiveBankId);
        
        const currentUser = get().user;
        if (currentUser) {
          currentUser.email = email;
          currentUser.user_metadata = {
            full_name: email.split('@')[0],
            role: effectiveRole,
            assigned_bank_id: effectiveBankId,
          };
        }
        return true;
      }

      set({ isLoading: false, error: error.message });
      return false;
    }

    const effectiveRole = role || (data.user?.user_metadata?.role as UserRole) || 'owner';
    const effectiveBankId = assignedBankId || data.user?.user_metadata?.assigned_bank_id || 'bank-001';

    localStorage.setItem(STORAGE_ROLE_KEY, effectiveRole);
    localStorage.setItem(STORAGE_BANK_KEY, effectiveBankId);
    useNetworkStore.getState().setCurrentBankId(effectiveBankId);

    set({
      user: data.user,
      session: data.session,
      userRole: effectiveRole,
      assignedBankId: effectiveBankId,
      isLoading: false,
      error: null,
    });
    return true;
  },

  // ── Sign Up ───────────────────────────────────────────────────────────────
  signUp: async (email, password, fullName, role = 'owner', assignedBankId = 'bank-001') => {
    set({ isLoading: true, error: null });
    const targetBankId = assignedBankId || 'bank-001';
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          assigned_bank_id: targetBankId,
        },
      },
    });

    // If Supabase free tier email rate limit is hit, fall back to instant authenticated session
    if (error) {
      if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('over_email')) {
        console.warn('Supabase email rate limit reached. Launching authenticated demo session instead.');
        get().quickDemoLogin(role, targetBankId);
        // Override mock user with actual entered details
        const currentUser = get().user;
        if (currentUser) {
          currentUser.email = email;
          currentUser.user_metadata = {
            full_name: fullName,
            role,
            assigned_bank_id: targetBankId,
          };
        }
        return true;
      }

      set({ isLoading: false, error: error.message });
      return false;
    }

    localStorage.setItem(STORAGE_ROLE_KEY, role);
    localStorage.setItem(STORAGE_BANK_KEY, targetBankId);
    useNetworkStore.getState().setCurrentBankId(targetBankId);

    set({
      user: data.user,
      session: data.session,
      userRole: role,
      assignedBankId: targetBankId,
      isLoading: false,
      error: null,
    });
    return true;
  },

  // ── Quick Demo Login ──────────────────────────────────────────────────────
  quickDemoLogin: (role, bankId = 'bank-001') => {
    const targetBankId = bankId || 'bank-001';
    localStorage.setItem(STORAGE_ROLE_KEY, role);
    localStorage.setItem(STORAGE_BANK_KEY, targetBankId);
    useNetworkStore.getState().setCurrentBankId(targetBankId);

    const mockUser: User = {
      id: `demo-user-${role}-${targetBankId}`,
      app_metadata: {},
      user_metadata: {
        full_name: role === 'owner' ? 'Dr. Rolwin (Multi-Bank Director)' : 'Operator (Assigned Facility)',
        role,
        assigned_bank_id: targetBankId,
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: role === 'owner' ? 'director@raktflow.demo' : `operator@${targetBankId}.raktflow.demo`,
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    };

    set({
      user: mockUser,
      session: {
        access_token: 'demo-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'demo-refresh-token',
        user: mockUser,
      },
      userRole: role,
      assignedBankId: targetBankId,
      isLoading: false,
      error: null,
    });
  },

  // ── Sign Out ──────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));
