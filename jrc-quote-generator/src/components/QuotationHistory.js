"use client";

import { useEffect, useState } from "react";
import FormCotizacion from "./FormCotizacion";

export default function QuotationHistory() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Verificar si el usuario tiene el rol de admin y obtener su email desde localStorage
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUserEmail(parsedUser.email);
      if (parsedUser.role === "admin") {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cotización?")) {
      try {
        const response = await fetch(`http://localhost:5001/delete-quotation/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Cotización eliminada exitosamente.");
          setQuotations(quotations.filter((q) => q.id !== id)); // Eliminar de la lista en el frontend
        } else {
          console.error("Error al eliminar la cotización:", await response.json());
          alert("Error al eliminar la cotización.");
        }
      } catch (error) {
        console.error("Error al eliminar la cotización:", error);
        alert("Error de conexión.");
      }
    }
  };

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await fetch("http://localhost:5001/get-quotations");
        const data = await response.json();

        if (response.ok) {
          // Filtrar las cotizaciones según el rol del usuario
          const filteredData = isAdmin
            ? data.quotations // Administrador ve todas
            : data.quotations.filter(
                (quotation) => quotation.user?.email === currentUserEmail
              ); // Usuario ve solo las suyas

          setQuotations(filteredData);
          setFilteredQuotations(filteredData);
        } else {
          console.error("Error al obtener las cotizaciones:", data.error);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, [isAdmin, currentUserEmail]);

  useEffect(() => {
    const filtered = quotations.filter((quotation) =>
      `${quotation.cliente?.nombre || ""} ${quotation.cliente?.apellido || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredQuotations(filtered);
  }, [searchTerm, quotations]);

  const formatDate = (timestamp) => {
    if (timestamp && timestamp._seconds) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleDateString();
    }
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    return "Fecha inválida";
  };

  const openEditModal = (quotation) => {
    setSelectedQuotation(quotation); // Configura la cotización seleccionada
    setIsEditModalOpen(true); // Abre el modal de edición
  };

  if (loading) {
    return <p className="text-center">Cargando historial de cotizaciones...</p>;
  }

  if (quotations.length === 0) {
    return <p className="text-center">No hay cotizaciones disponibles.</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Historial de Cotizaciones</h2>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre del cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#305832]"
        />
      </div>

      {/* Tabla de cotizaciones */}
      <div className="overflow-x-auto"> 
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Plan</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Usuario</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
            {isAdmin && <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {filteredQuotations.map((quotation) => (
            <tr
              key={quotation.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => openEditModal(quotation)}
            >
              <td className="border border-gray-300 px-4 py-2">
                {quotation.cliente?.nombre || "Desconocido"} {quotation.cliente?.apellido || ""}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {formatDate(quotation.createdAt)}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {quotation.tipoPlan || "No especificado"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {quotation.user?.fullName || "Usuario desconocido"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                ₡{quotation.totalCost ? parseInt(quotation.totalCost).toLocaleString() : "0.00"}
              </td>
              {isAdmin && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Evita abrir el modal al hacer clic en el botón
                      handleDelete(quotation.id);
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Modal de edición */}
      {isEditModalOpen && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[95%] sm:w-[80%] lg:w-[60%]">
            <FormCotizacion
              initialData={selectedQuotation}
              isEditMode={true} // Activa el modo edición
              onSubmit={() => setIsEditModalOpen(false)} // Cierra el modal al guardar
            />
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="mt-6 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
