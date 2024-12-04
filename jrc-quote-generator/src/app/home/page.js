"use client";

import { useState, useEffect } from "react";
import FormCotizacion from "@/components/FormCotizacion";
import { useAuth } from "@/config/authContext";
import { useRouter } from "next/navigation";
import QuotationHistory from "@/components/QuotationHistory";
import UserInfo from "@/components/UserInfo";

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar cerrado por defecto en pantallas pequeñas
  const [activeSection, setActiveSection] = useState("crearCotizacion"); // Sección activa

  // Redirigir al login si el usuario no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 sm:flex-row">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 fixed sm:relative bg-white w-64 sm:w-64 h-full shadow-md transition-transform duration-300 z-50`}
      >
        <div className="flex flex-col justify-between h-full">
          {/* Sidebar Content */}
          <div>
            <div className="p-6 text-lg font-bold text-gray-800 justify-center flex">
              <img
                src="/NEGRO-FONDO-BLANCO.jpg"
                alt="Logo de la Empresa"
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
              />
            </div>
            <ul className="space-y-2">
              <li
                className={`px-4 py-2 hover:bg-gray-200 cursor-pointer ${
                  activeSection === "crearCotizacion" ? "bg-gray-200" : ""
                }`}
                onClick={() => {
                  setActiveSection("crearCotizacion");
                  setIsSidebarOpen(false); // Cierra el sidebar en pantallas pequeñas
                }}
              >
                Crear Cotización
              </li>
              <li
                className={`px-4 py-2 hover:bg-gray-200 cursor-pointer ${
                  activeSection === "historial" ? "bg-gray-200" : ""
                }`}
                onClick={() => {
                  setActiveSection("historial");
                  setIsSidebarOpen(false);
                }}
              >
                Historial de Cotizaciones
              </li>
              <li
                className={`px-4 py-2 hover:bg-gray-200 cursor-pointer ${
                  activeSection === "editarPlantilla" ? "bg-gray-200" : ""
                }`}
                onClick={() => {
                  setActiveSection("editarPlantilla");
                  setIsSidebarOpen(false);
                }}
              >
                Editar Plantilla
              </li>
            </ul>
          </div>

          {/* User Info */}
          <div className="p-4 bg-gray-100">
            {user ? (
              <>
                <button
                  onClick={() => {
                    setActiveSection("userInfo");
                    setIsSidebarOpen(false);
                  }}
                  className="text-gray-800 font-semibold hover:underline"
                >
                  {user.fullName}
                </button>
                <div className="text-gray-500 text-sm">{user.email}</div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Cargando usuario...</p>
            )}
            <button
              onClick={logout}
              className="mt-2 text-red-500 text-sm hover:underline"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow-md p-4 flex items-center justify-between sm:justify-center">
          <h1 className="text-xl font-bold text-gray-800">
            Cotizador JRC Consulting Group
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="sm:hidden p-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            {isSidebarOpen ? "Cerrar Menú" : "Abrir Menú"}
          </button>
        </header>

        {/* Content */}
        <main className="p-6 flex-1 overflow-y-auto">
          {activeSection === "crearCotizacion" && <FormCotizacion />}
          {activeSection === "historial" && <QuotationHistory />}
          {activeSection === "editarPlantilla" && <p>Editar Plantilla</p>}
          {activeSection === "userInfo" && <UserInfo user={user} />}
        </main>
      </div>
    </div>
  );
}
