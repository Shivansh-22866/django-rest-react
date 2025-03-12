import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../api/api";

interface AuthContextType {
  user: any;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  signup: (credentials: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ token });
    }
  }, []);

  const login = async ({ username, password }: { username: string; password: string }) => {
    try {
      const res = await instance.post("/login/", { username, password });
      localStorage.setItem("token", res.data.access);
      instance.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
      setUser(res.data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const signup = async ({ username, email, password }: { username: string; email: string; password: string }) => {
    try {
      await instance.post("/register/", { username, email, password });
      navigate("/login");
    } catch (error) {
      console.error("Signup failed", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete instance.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
