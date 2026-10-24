import { createContext, useContext, useState, useEffect, } from 'react';
import { getMe } from '@/services/api';
const AuthContext = createContext({
  user: null,
  setUser: () => { },
  isLoading: true,
});
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);
  return (<AuthContext.Provider value={{ user, setUser, isLoading }}>
    {children}
  </AuthContext.Provider>);
};
export const useAuth = () => useContext(AuthContext);



