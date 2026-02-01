"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  bio?: string;
  city?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializers pour éviter setState dans useEffect
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser) as User;
    } catch {
      sessionStorage.removeItem("user");
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("accessToken");
  });

  // isLoading est false car le chargement depuis sessionStorage est synchrone
  const [isLoading] = useState(false);
  const router = useRouter();

  // Fonction de login
  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Erreur de connexion";
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Stocker dans sessionStorage
    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    // Mettre à jour le state
    setAccessToken(data.accessToken);
    setUser(data.user);

    // Rediriger vers le dashboard
    router.push("/dashboard");
  };

  // Fonction de logout
  const logout = useCallback(() => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  // Fonction pour rafraîchir le token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const currentRefreshToken = sessionStorage.getItem("refreshToken");

    if (!currentRefreshToken) {
      logout();
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentRefreshToken}`,
        },
      });

      if (!response.ok) {
        logout();
        return false;
      }

      const data = await response.json();

      sessionStorage.setItem("accessToken", data.accessToken);
      setAccessToken(data.accessToken);

      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  // Fonction pour mettre à jour les données utilisateur localement
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...userData };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    logout,
    refreshAccessToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
