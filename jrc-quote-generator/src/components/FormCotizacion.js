'use client';
import { useState, useEffect } from "react";
import { generatePDF } from "@/app/utils/generatePDF";

export default function FormCotizacion({
  initialData, // Datos iniciales para editar
  isEditMode = false, // Si está en modo edición
  onSubmit, // Función para guardar cotización nueva
  onUpdate, // Función para actualizar cotización existente
}) {
  const [plans, setPlans] = useState([]); // Estado para almacenar los planes cargados
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    tipoPlan: "",
    planSeleccionado: "",
    featuresSeleccionadas: [],
    extraFeatures: [],
    precioBase: "",
    tipoPersona: "",
    manejoPlanilla: false,
    colaboradores: "",
    facturas: false,
    facturasEmitidas: "",
    facturasRecibidas: "",
    transacciones: "",
    tipoMoneda: "CRC",
    idiomaCotizacion: "Español",
    tipoCambio: "",
    cliente: {
      nombre: "",
      apellido: "",
      cedula: "",
      correo: "",
      telefono: "",
      direccion: "",
    },
  });
  

    // Cargar los datos iniciales si existen
    useEffect(() => {
      if (initialData) {
        setFormData({
          ...formData,
          ...initialData,
          cliente: { ...formData.cliente, ...initialData.cliente },
          featuresSeleccionadas: initialData.featuresSeleccionadas || [],
        });
      }
    }, [initialData]);
    

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
      setIsDirty(true); // Marca que se han hecho cambios en el formulario
    };



  const calculateTotalCost = () => {
    const precioBase = parseFloat(formData.precioBase || 0);
    const totalExtraCosts = formData.extraFeatures.reduce((sum, feature) => {
      const value = parseFloat(feature.value || 0);
      return sum + value;
    }, 0);
  
    return precioBase + totalExtraCosts;
  };
  
  // Cargar JSON desde la carpeta public
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/plans.json");
        const data = await response.json();
        setPlans(data.plans);
      } catch (error) {
        console.error("Error al cargar los planes:", error);
      }
    };

    fetchPlans();
  }, []);

  const handlePlanTypeChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      tipoPlan: value,
      planSeleccionado: "",
      featuresSeleccionadas: [],
      precioBase: "",
    });
  };

  const handlePlanSelection = (e) => {
    const plan = plans.find((p) => p.name === e.target.value);
    setFormData({
      ...formData,
      planSeleccionado: e.target.value,
      featuresSeleccionadas: plan ? plan.features : [],
    });
  };
  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      cliente: {
        ...prevState.cliente,
        [name]: value,
      },
    }));
    setIsDirty(true); // Marca que se han hecho cambios en el formulario
  };
  

  const handleFeatureSelection = (e) => {
    const feature = e.target.value;
    const isChecked = e.target.checked;
  
    setFormData((prevState) => ({
      ...prevState,
      featuresSeleccionadas: isChecked
        ? [...prevState.featuresSeleccionadas, feature]
        : prevState.featuresSeleccionadas.filter((f) => f !== feature),
    }));
  };
  

  const handleAddExtraFeature = () => {
    const newFeature = {
      name: "",
      value: "",
    };
    setFormData((prevState) => ({
      ...prevState,
      extraFeatures: [...prevState.extraFeatures, newFeature],
    }));
  };

  const handleRemoveExtraFeature = (index) => {
    const updatedExtraFeatures = [...formData.extraFeatures];
    updatedExtraFeatures.splice(index, 1);
    setFormData({ ...formData, extraFeatures: updatedExtraFeatures });
  };

  const handleExtraFeatureChange = (index, field, value) => {
    const updatedExtraFeatures = [...formData.extraFeatures];
    updatedExtraFeatures[index][field] = field === "value" ? formatPrice(value) : value;
    setFormData({ ...formData, extraFeatures: updatedExtraFeatures });
  };

  const formatPrice = (value) => {
    if (!value) return "";
    const numericValue = value.replace(/[^\d]/g, ""); // Remueve cualquier carácter no numérico
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(numericValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos del Formulario:", formData);

    // Generar PDF
    await generatePDF(formData);
  };

  const handleSaveQuotation = async () => {
    try {
      const totalCost = calculateTotalCost(); // Calcula el costo total
  
      // Datos que serán enviados
      const quotationData = {
        ...formData,
        totalCost,
        user: {
          email: localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).email
            : "Usuario desconocido",
          fullName: localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).fullName
            : "Usuario desconocido",
        },
        cliente: formData.cliente, // Usamos directamente el cliente dentro de formData
      };
  
      console.log("Datos enviados:", quotationData);
  
      // Enviar los datos al backend
      const response = await fetch("http://localhost:5001/save-quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quotationData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Cotización guardada exitosamente.");
      } else {
        alert("Error al guardar la cotización: " + data.error);
      }
    } catch (error) {
      console.error("Error al guardar la cotización:", error);
      alert("Error al guardar la cotización.");
    }
  };
  
  const handleUpdateQuotation = async () => {
    try {
      const totalCost = calculateTotalCost();
  
      const updatedData = {
        ...formData,
        totalCost,
      };
  
      const response = await fetch(`http://localhost:5001/update-quotation/${initialData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        alert("Cotización actualizada exitosamente.");
        // Cierra el modal y recarga las cotizaciones
        window.location.reload(); // Recarga la página completa
      } else {
        console.error("Error al actualizar la cotización:", await response.json());
        alert("Error al actualizar la cotización.");
      }
    } catch (error) {
      console.error("Error al actualizar la cotización:", error);
      alert("Error de conexión al actualizar la cotización.");
    }
  };
  

  
  const uniqueFeatures = plans
    .find((p) => p.name === "full-compliance")
    ?.features.filter(
      (feature, index, self) => self.indexOf(feature) === index
    ) || [];

    const formatTipoCambio = (value) => {
        if (!value) return "";
      
        // Remover cualquier carácter que no sea número
        let numericValue = value.replace(/[^\d]/g, "");
      
        // Limitar el valor a un máximo de 5 dígitos
        numericValue = numericValue.slice(0, 5);
      
        // Convertir el valor a float y agregar dos decimales
        const floatValue = parseFloat(numericValue) / 100;
      
        // Formatear el valor como colones con dos decimales y coma como separador
        return floatValue.toLocaleString("es-CR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };
      
      

  return (
    <div className="max-h-[90vh] overflow-y-auto bg-gray-50 p-8 rounded-lg shadow-lg">
        {/* Contenedor de Selección de Moneda e Idioma */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Configuración de Cotización</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Selección de Tipo de Moneda */}
            <div>
            <label className="block text-gray-700 font-medium mb-2">Tipo de Moneda</label>
            <select
                name="tipoMoneda"
                value={formData.tipoMoneda}
                onChange={(e) =>
                setFormData({ ...formData, tipoMoneda: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
                required
            >
                <option value="CRC">Colones (₡)</option>
                <option value="USD">Dólares ($)</option>
            </select>
            </div>

            {/* Selección de Idioma de Cotización */}
            <div>
            <label className="block text-gray-700 font-medium mb-2">Idioma de Cotización</label>
            <select
                name="idiomaCotizacion"
                value={formData.idiomaCotizacion}
                onChange={(e) =>
                setFormData({ ...formData, idiomaCotizacion: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
                required
            >
                <option value="espanol">Español</option>
                <option value="ingles">Inglés</option>
            </select>
            </div>
        </div>

        {/* Tipo de Cambio - Mostrar solo si se selecciona Dólares */}
        {formData.tipoMoneda === "USD" && (
        <div className="mt-6">
            <label className="block text-gray-700 font-medium mb-2">Tipo de Cambio</label>
            <input
            type="text"
            name="tipoCambio"
            value={formData.tipoCambio}
            onChange={(e) =>
                setFormData({ ...formData, tipoCambio: formatTipoCambio(e.target.value) })
            }
            placeholder="Ingrese el tipo de cambio (₡)"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
            required
            />
        </div>
        )}

        </div>

{/* Contenedor de Información del Cliente */}
<div className="mb-8 p-6 bg-white rounded-lg shadow-inner border border-gray-200">
  <h2 className="text-2xl font-bold mb-6 text-gray-800">Información del Cliente</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <div>
      <label className="block text-gray-700 font-medium mb-1">Nombre</label>
      <input
        type="text"
        name="nombre"
        value={formData.cliente.nombre}
        onChange={handleClientChange}
        placeholder="Ingrese el nombre"
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
        required
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium mb-1">Apellido</label>
      <input
        type="text"
        name="apellido"
        value={formData.cliente.apellido}
        onChange={handleClientChange}
        placeholder="Ingrese el apellido"
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
        required
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium mb-1">Cédula</label>
      <input
        type="text"
        name="cedula"
        value={formData.cliente.cedula}
        onChange={handleClientChange}
        placeholder="Ingrese la cédula"
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
        required
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium mb-1">Correo Electrónico</label>
      <input
        type="email"
        name="correo"
        value={formData.cliente.correo}
        onChange={handleClientChange}
        placeholder="Ingrese el correo electrónico"
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
        required
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium mb-1">Teléfono</label>
      <input
        type="tel"
        name="telefono"
        value={formData.cliente.telefono}
        onChange={handleClientChange}
        placeholder="Ingrese el teléfono"
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
        required
      />
    </div>
    <div>
      <label className="block text-gray-700 font-medium mb-1">Dirección</label>
      <textarea
        name="direccion"
        value={formData.cliente.direccion}
        onChange={handleClientChange}
        placeholder="Ingrese la dirección"
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
        rows="2"
        required
      ></textarea>
    </div>
  </div>
</div>

  <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">Generar Cotización</h2>

    {/* Selección del tipo de plan */}
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">
        ¿Qué tipo de plan desea?
      </label>
      <select
        name="tipoPlan"
        value={formData.tipoPlan}
        onChange={handlePlanTypeChange}
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
        required
      >
        <option value="">Seleccione una opción</option>
        <option value="predefinido">Plan Predefinido</option>
        <option value="personalizado">Plan Personalizado</option>
      </select>
    </div>

    {/* Selección de plan predefinido */}
    {formData.tipoPlan === "predefinido" && (
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Seleccione un plan</label>
        <select
          name="planSeleccionado"
          value={formData.planSeleccionado}
          onChange={handlePlanSelection}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
          required
        >
          <option value="">Seleccione un plan</option>
          {plans.map((plan) => (
            <option key={plan.name} value={plan.name}>
              {plan.name}
            </option>
          ))}
        </select>
        {formData.planSeleccionado && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Características del Plan Seleccionado:</h3>
            <ul className="list-disc list-inside mt-2">
              {formData.featuresSeleccionadas.map((feature, index) => (
                <li key={index} className="text-gray-600">{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}

    {/* Selección de plan personalizado */}
    {formData.tipoPlan === "personalizado" && (
      <>
        {/* Precio base */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Precio base del plan (en colones)
          </label>
          <input
            type="text"
            name="precioBase"
            value={formData.precioBase}
            onChange={(e) =>
              setFormData({
                ...formData,
                precioBase: formatPrice(e.target.value),
              })
            }
            placeholder="Ingrese el precio base"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
            required
          />
        </div>

        {/* Características únicas */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Seleccione las características
          </label>
          {uniqueFeatures.map((feature, index) => (
            <div key={index} className="flex items-center mb-3">
              <input
                type="checkbox"
                value={feature}
                checked={formData.featuresSeleccionadas.includes(feature)} // Verifica si está seleccionado
                onChange={handleFeatureSelection} // Controla el cambio
                className="mr-3 focus:ring-[#305832]"
              />
              <span className="text-gray-600">{feature}</span>
            </div>
          ))}
        </div>

      </>
    )}

        {/* Agregar características extra */}
        {formData.tipoPlan === "personalizado" && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleAddExtraFeature}
              className="py-2 px-4 bg-white border border-[#305832] text-[#305832] rounded-md hover:bg-gray-100"
            >
              Agregar Característica Extra
            </button>
            {formData.extraFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Nombre de la característica"
                  value={feature.name}
                  onChange={(e) =>
                    handleExtraFeatureChange(index, "name", e.target.value)
                  }
                  className="w-2/3 border rounded-md p-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Valor en colones"
                  value={feature.value}
                  onChange={(e) =>
                    handleExtraFeatureChange(index, "value", e.target.value)
                  }
                  className="w-1/3 border rounded-md p-2 text-right"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExtraFeature(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Preguntas adicionales */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Tipo de Persona
          </label>
          <select
            name="tipoPersona"
            value={formData.tipoPersona}
            onChange={(e) =>
              setFormData({ ...formData, tipoPersona: e.target.value })
            }
            className="w-full border rounded-md p-2"
            required
          >
            <option value="">Seleccione una opción</option>
            <option value="fisica">Persona Física</option>
            <option value="juridica">Persona Jurídica</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="manejoPlanilla"
              checked={formData.manejoPlanilla}
              onChange={(e) =>
                setFormData({ ...formData, manejoPlanilla: e.target.checked })
              }
              className="mr-2"
            />
            ¿Ocupa manejo de planilla?
          </label>
          {formData.manejoPlanilla && (
            
            <input
              type="number"
              name="colaboradores"
              value={formData.colaboradores}
              onChange={(e) =>
                setFormData({ ...formData, colaboradores: e.target.value })
              }
              placeholder="Cantidad de colaboradores"
              className="w-full mt-2 border rounded-md p-2"
              required
            />
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="facturas"
              checked={formData.facturas}
              onChange={(e) =>
                setFormData({ ...formData, facturas: e.target.checked })
              }
              className="mr-2"
            />
            ¿Ocupa manejo de facturas electrónicas?
          </label>
          {formData.facturas && (
            <div className="mt-2 space-y-2">
              <input
                type="number"
                name="facturasEmitidas"
                value={formData.facturasEmitidas}
                onChange={(e) =>
                  setFormData({ ...formData, facturasEmitidas: e.target.value })
                }
                placeholder="Facturas emitidas al mes"
                className="w-full border rounded-md p-2"
                required
              />
              <input
                type="number"
                name="facturasRecibidas"
                value={formData.facturasRecibidas}
                onChange={(e) =>
                  setFormData({ ...formData, facturasRecibidas: e.target.value })
                }
                placeholder="Facturas recibidas al mes"
                className="w-full border rounded-md p-2"
                required
              />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            ¿Cuántas transacciones se hacen al mes?
          </label>
          <input
            type="number"
            name="transacciones"
            value={formData.transacciones}
            onChange={(e) =>
              setFormData({ ...formData, transacciones: e.target.value })
            }
            placeholder="Número de transacciones"
            className="w-full border rounded-md p-2"
            required
          />
        </div>

        {/* Botón para generar PDF */}
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full py-3 bg-[#305832] text-white font-semibold rounded-lg hover:bg-[#267423] transition duration-300 ease-in-out"
        >
          Generar Cotización (PDF)
        </button>

        {/* Botón para guardar o actualizar cotización */}
        <button
          type="button"
          onClick={isEditMode ? handleUpdateQuotation : handleSaveQuotation}
          className={`w-full py-3 mt-4 text-white font-semibold rounded-lg transition duration-300 ease-in-out ${
            isEditMode
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isEditMode ? "Guardar Cambios" : "Guardar Cotización"}
        </button>


      </form>
    </div>
  );
}
