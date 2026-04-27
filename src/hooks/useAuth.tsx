import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  confirmSignUp as amplifyConfirmSignUp,
  fetchUserAttributes,
  getCurrentUser,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  resendSignUpCode,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { ensureAmplifyConfigured, isAwsConfigured } from '../services/awsConfig';

export interface ConcoctUser {
  uid: string;          // Cognito sub
  username: string;
  email?: string;
  displayName?: string;
}

interface AuthContextValue {
  user: ConcoctUser | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<{ needsConfirmation: boolean }>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isAwsConfigured();
  const [user, setUser] = useState<ConcoctUser | null>(null);
  const [loading, setLoading] = useState<boolean>(configured);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!ensureAmplifyConfigured()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const current = await getCurrentUser();
      let attrs: Record<string, string | undefined> = {};
      try {
        attrs = await fetchUserAttributes();
      } catch {
        /* attribute fetch can fail right after confirmation; ignore */
      }
      setUser({
        uid: current.userId,
        username: current.username,
        email: attrs.email ?? current.signInDetails?.loginId,
        displayName: attrs.name,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + listen for auth events from Amplify
  useEffect(() => {
    refreshUser();
    const unsub = Hub.listen('auth', ({ payload }) => {
      if (
        payload.event === 'signedIn' ||
        payload.event === 'signedOut' ||
        payload.event === 'tokenRefresh'
      ) {
        refreshUser();
      }
    });
    return unsub;
  }, [refreshUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!ensureAmplifyConfigured()) {
        setError('AWS is not configured. Set VITE_AWS_* env vars and restart.');
        return;
      }
      setError(null);
      try {
        const result = await amplifySignIn({ username: email, password });
        if (result.isSignedIn) {
          await refreshUser();
        } else {
          setError(`Additional step required: ${result.nextStep.signInStep}`);
        }
      } catch (err) {
        setError(humanError(err));
      }
    },
    [refreshUser],
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      if (!ensureAmplifyConfigured()) {
        setError('AWS is not configured. Set VITE_AWS_* env vars and restart.');
        return { needsConfirmation: false };
      }
      setError(null);
      try {
        const result = await amplifySignUp({
          username: email,
          password,
          options: {
            userAttributes: {
              email,
              ...(name ? { name } : {}),
            },
          },
        });
        return {
          needsConfirmation: result.nextStep.signUpStep === 'CONFIRM_SIGN_UP',
        };
      } catch (err) {
        setError(humanError(err));
        return { needsConfirmation: false };
      }
    },
    [],
  );

  const confirmSignUp = useCallback(async (email: string, code: string) => {
    if (!ensureAmplifyConfigured()) return;
    setError(null);
    try {
      await amplifyConfirmSignUp({ username: email, confirmationCode: code });
    } catch (err) {
      setError(humanError(err));
      throw err;
    }
  }, []);

  const resendCode = useCallback(async (email: string) => {
    if (!ensureAmplifyConfigured()) return;
    setError(null);
    try {
      await resendSignUpCode({ username: email });
    } catch (err) {
      setError(humanError(err));
    }
  }, []);

  const signOutUser = useCallback(async () => {
    if (!ensureAmplifyConfigured()) return;
    await amplifySignOut();
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured,
      signIn,
      signUp,
      confirmSignUp,
      resendCode,
      signOutUser,
      error,
      clearError,
    }),
    [user, loading, configured, signIn, signUp, confirmSignUp, resendCode, signOutUser, error, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function humanError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return 'Authentication failed';
}
