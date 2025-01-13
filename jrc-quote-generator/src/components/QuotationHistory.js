"use client";

import { useEffect, useState } from "react";
import FormCotizacion from "./FormCotizacion";
import { useCustomAlert } from "@/config/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";


export default function QuotationHistory({ isDeletedView = false }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { alerts, showAlert, removeAlert } = useCustomAlert();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(""); // Filtro por plan
  const [selectedUserName, setSelectedUserName] = useState(""); // Filtro por nombre de usuario
  const [startDate, setStartDate] = useState(""); // Fecha inicial
  const [endDate, setEndDate] = useState(""); // Fecha final
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUserEmail(parsedUser.email);
      setIsAdmin(
        parsedUser.role === "superAdmin" || parsedUser.role === "admin"
      );
    }
  }, []);

  // Reestablecer una cotización
const handleRestore = async (id) => {
  showAlert({
    type: "confirm",
    title: "Confirmación",
    message: "¿Estás seguro de que deseas reestablecer esta cotización?",
    onConfirm: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/restore-quotation/${id}`,
          { method: "PUT" } // Asume que este endpoint existe en tu backend
        );

        if (response.ok) {
          showAlert({
            type: "success",
            title: "Éxito",
            message: "Cotización reestablecida exitosamente.",
          });
          setQuotations(quotations.filter((q) => q.id !== id)); // Eliminar de la vista
        } else {
          const data = await response.json();
          showAlert({
            type: "error",
            title: "Error",
            message: `Error al reestablecer la cotización: ${data.error}`,
          });
        }
      } catch (error) {
        showAlert({
          type: "error",
          title: "Error",
          message: "Error de conexión al reestablecer la cotización.",
        });
      }
    },
  });
};

// Eliminar definitivamente una cotización
const handlePermanentDelete = async (id) => {
  showAlert({
    type: "confirm",
    title: "Confirmación",
    message: "¿Estás seguro de que deseas eliminar definitivamente esta cotización?",
    onConfirm: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/delete-quotation-permanently/${id}`,
          { method: "DELETE" } // Asume que este endpoint existe en tu backend
        );

        if (response.ok) {
          showAlert({
            type: "success",
            title: "Éxito",
            message: "Cotización eliminada definitivamente.",
          });
          setQuotations(quotations.filter((q) => q.id !== id)); // Eliminar de la vista
        } else {
          const data = await response.json();
          showAlert({
            type: "error",
            title: "Error",
            message: `Error al eliminar la cotización: ${data.error}`,
          });
        }
      } catch (error) {
        showAlert({
          type: "error",
          title: "Error",
          message: "Error de conexión al eliminar la cotización.",
        });
      }
    },
  });
};

  
  const formatPlanName = (planName) => {
    if (!planName) return "No especificado";
    const planMap = {
      starter: "Starter",
      professional: "Professional",
      "full-compliance": "Full Compliance",
      personalizado: "Personalizado", // Por si acaso
    };
    return planMap[planName.toLowerCase()] || "No especificado";
  };
  
  const handleDelete = async (id) => {
    showAlert({
      type: "confirm",
      title: "Confirmación",
      message: "¿Estás seguro de que deseas eliminar esta cotización?",
      onConfirm: async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
  
          if (!user || !user.fullName) {
            showAlert({
              type: "error",
              title: "Error",
              message: "No se encontró información del usuario para realizar la eliminación.",
            });
            return;
          }
  
          const deletedBy = user.fullName;
  
          const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/delete-quotation/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ deletedBy }),
          });
  
          if (response.ok) {
            showAlert({
              type: "success",
              title: "Éxito",
              message: "Cotización eliminada exitosamente.",
            });
            setQuotations(quotations.filter((q) => q.id !== id));
          } else {
            const data = await response.json();
            showAlert({
              type: "error",
              title: "Error",
              message: `Error al eliminar la cotización: ${data.error}`,
            });
          }
        } catch (error) {
          showAlert({
            type: "error",
            title: "Error",
            message: "Error de conexión al eliminar la cotización.",
          });
        }
      },
    });
  };
  
  

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const endpoint = isDeletedView
          ? `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/get-quotations-deleted`
          : `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/get-quotations`;
        const response = await fetch(endpoint);
        const data = await response.json();
  
        if (response.ok) {
          const filteredData = isAdmin
            ? data.quotations
            : data.quotations.filter(
                (quotation) => quotation.user?.email === currentUserEmail
              );
  
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
  }, [isAdmin, currentUserEmail, isDeletedView]);
  
  

  useEffect(() => {
    let filtered = quotations;
  
    // Filtro por búsqueda de cliente
    if (searchTerm) {
      filtered = filtered.filter((quotation) =>
        `${quotation.cliente?.nombre || ""} ${quotation.cliente?.apellido || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        `${quotation.cotizacionNumber || ""}`.includes(searchTerm) // Filtro por número de cotización
      );
    }
  
    // Filtro por plan seleccionado
    if (selectedPlan) {
      filtered = filtered.filter(
        (quotation) =>
          quotation.planSeleccionado === selectedPlan ||
          (selectedPlan === "personalizado" && quotation.tipoPlan === "personalizado")
      );
    }
  
    // Filtro por nombre de usuario
    if (selectedUserName) {
      filtered = filtered.filter((quotation) =>
        (quotation.user?.fullName || "").toLowerCase().includes(selectedUserName.toLowerCase())
      );
    }
  
    // Filtro por rango de fechas
    if (startDate || endDate) {
      filtered = filtered.filter((quotation) => {
        const date = new Date(quotation.createdAt._seconds * 1000);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
  
        return (!start || date >= start) && (!end || date <= end);
      });
    }
  
    setFilteredQuotations(filtered);
  }, [searchTerm, selectedPlan, selectedUserName, startDate, endDate, quotations]);
  

  const formatDate = (timestamp) => {
    if (timestamp && timestamp._seconds) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleDateString();
    }
    return "Fecha inválida";
  };

  const openEditModal = (quotation) => {
    setSelectedQuotation(quotation);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return <p className="text-center">Cargando historial de cotizaciones...</p>;
  }

  if (quotations.length === 0) {
    return <p className="text-center">No hay cotizaciones disponibles.</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
  {isDeletedView ? "Cotizaciones Eliminadas" : "Historial de Cotizaciones"}
</h2>


      {/* Filtros */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda por cliente */}
        <input
          type="text"
          placeholder="Buscar por nombre o # de cotización..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#305832]"
        />

        {/* Filtro por nombre de usuario */}
        {isAdmin && (
          <input
            type="text"
            placeholder="Buscar por nombre de usuario creador..."
            value={selectedUserName}
            onChange={(e) => setSelectedUserName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#305832]"
          />
        )}
      </div>


      {/* Tabla de cotizaciones */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
            <th className="border border-gray-300 px-4 py-2 text-left"># de Cotización</th> {/* Cambiado */}
            <th className="border border-gray-300 px-4 py-2 text-left">
              {isDeletedView ? "Eliminado por" : "Creado por"}
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
            {isAdmin && (
              <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
            )}
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
                {quotation.cliente?.nombre ||quotation.cliente?.nombreCompleto || "Desconocido"} {quotation.cliente?.apellido || ""}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {formatDate(quotation.createdAt)}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {quotation.cotizacionNumber || "N/A"} {/* Mostrando # de Cotización */}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {isDeletedView
                  ? quotation.deletedBy || "Desconocido"
                  : quotation.user?.fullName || "Usuario desconocido"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {quotation.tipoMoneda === "USD"
                  ? `$${quotation.totalCost?.toFixed(2)}`
                  : `₡${parseInt(quotation.totalCost || 0).toLocaleString()}`}
              </td>
              {isAdmin && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {isDeletedView ? (
                    <div className="flex gap-2">
                      {/* Botón para reestablecer */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(quotation.id);
                        }}
                        className="px-2 py-1 border border-[#305832] text-[#305832] rounded-lg hover:bg-gray-200 text-sm"
                      >
                        Reestablecer
                      </button>
                      {/* Botón para eliminar definitivamente */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePermanentDelete(quotation.id);
                        }}
                        className="px-2 py-1 border border-red-500 text-red-500 rounded-lg hover:bg-red-100 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(quotation.id);
                      }}
                      className="px-2 py-1 border border-red-500 text-red-500 rounded-lg hover:bg-red-100 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
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
              isEditMode={true}
              onSubmit={() => setIsEditModalOpen(false)}
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
      {alerts.map((alert) => (
  <CustomAlert
    key={alert.id}
    isVisible
    type={alert.type}
    title={alert.title}
    message={alert.message}
    onClose={() => removeAlert(alert.id)}
    onConfirm={alert.onConfirm}
  />
))}

    </div>
  );
}
