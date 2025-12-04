import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

interface AuthContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // ----------------------------
  // SAFE LOAD FROM LOCALSTORAGE
  // ----------------------------
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("user");
      if (!saved) return null;

      const parsed = JSON.parse(saved);

      // SAFE CHECK — FIXED
      return {
        ...parsed,
        role: parsed?.role?.toLowerCase() || "student", // default instead of crash
      };
    } catch {
      return null;
    }
  });

  // ----------------------------
  // SAVE USER TO LOCALSTORAGE
  // ----------------------------
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          role: user.role?.toLowerCase(), // SAFE
        })
      );
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ----------------------------
  // LOGOUT
  // ----------------------------
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
