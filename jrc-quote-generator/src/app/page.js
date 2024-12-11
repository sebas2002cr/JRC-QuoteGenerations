"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/config/authContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar la carga
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Ocurrió un error. Por favor, intenta de nuevo.");
        setIsLoading(false);
        return;
      }
  
      const data = await response.json();
      
      login(data.token, data.user); // Asegúrate de pasar data.user correctamente
    } catch (err) {
      console.error("Error durante el inicio de sesión:", err);
      setError("Error de conexión. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };
  

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 backdrop-blur-md z-50">
        <img
          src="/JRCLogofull.png"
          alt="Logo de la Empresa"
          className="w-50 h-32 animate-slowPulse" // Usar la animación personalizada
        />
      </div>
    );
  }
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex flex-col sm:flex-row w-[90%] sm:w-4/5 lg:w-3/5 h-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Panel Izquierdo */}
        <div className="w-full sm:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/NEGRO-FONDO-BLANCO.jpg"
              alt="Logo de la Empresa"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 text-center">
            Iniciar Sesión
          </h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#305832]"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#305832]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#305832] text-white font-semibold rounded-md hover:opacity-90 transition duration-300"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
        {/* Panel Derecho */}
        <div
          className="hidden sm:flex sm:w-1/2 relative bg-cover bg-center"
          style={{
            backgroundImage: "url('/NEGRO-FONDO-BLANCO.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex flex-col justify-center items-center text-white p-6">
            <h2 className="text-lg sm:text-4xl font-bold mb-4">¡Bienvenido!</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
