import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("lms_token"));
  const [admin, setAdmin] = useState(null);
  const [, setLocation] = useLocation();
  const { data: me, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false
    }
  });
  useEffect(() => {
    if (me) {
      setAdmin(me);
    }
  }, [me]);
  const login = (newToken, newAdmin) => {
    localStorage.setItem("lms_token", newToken);
    setToken(newToken);
    setAdmin(newAdmin);
    setLocation("/");
  };
  const logout = () => {
    localStorage.removeItem("lms_token");
    setToken(null);
    setAdmin(null);
    setLocation("/login");
  };
  return <AuthContext.Provider value={{ token, admin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>;
}
function useAuth() {
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export {
  AuthProvider,
  useAuth
};
