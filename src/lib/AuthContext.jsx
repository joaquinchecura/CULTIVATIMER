import React, { createContext, useContext } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, openSignIn } = useClerk();

  const logout = (shouldRedirect = true) => {
    signOut({ redirectUrl: shouldRedirect ? '/' : undefined });
  };

  const navigateToLogin = () => {
    openSignIn();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: isSignedIn ?? false,
      isLoadingAuth: !isLoaded,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);