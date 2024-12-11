"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
  
      if (token && userData) {
        try {
          const response = await fetch("${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/validate-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });
  
          const data = await response.json();
  
          if (response.ok && data.valid) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData)); // Restaurar los datos del usuario desde localStorage
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Error al validar el token:", error);
          handleLogout();
        }
      } else {
        handleLogout();
      }
      setLoading(false);
    };
  
    validateToken();
  }, []);
  

  const login = (token, userData) => {
    console.log("Token recibido:", token);
    console.log("Datos del usuario recibidos:", userData);
  
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData)); // Guardar los datos del usuario en localStorage
    setIsAuthenticated(true);
    setUser(userData);
    router.push("/home");
  };
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout: handleLogout }}>
      {!loading && children} {/* No renderizar nada mientras se valida */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
