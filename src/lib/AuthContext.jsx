import { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (user) {
      setAuthUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress,
        photo_url: user.imageUrl,
      });
    } else {
      setAuthUser(null);
    }
  }, [user, isLoaded]);

  const logout = () => signOut();

  return (
    <AuthContext.Provider value={{ user: authUser, logout, loading: !isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);