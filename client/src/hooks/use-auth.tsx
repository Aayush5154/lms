import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Admin, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  admin: Admin | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("lms_token"));
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [, setLocation] = useLocation();

  const { data: me, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (me) {
      setAdmin(me);
    }
  }, [me]);

  const login = (newToken: string, newAdmin: Admin) => {
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

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
