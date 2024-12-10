'use client';
import { useState, useEffect } from "react";
import { useCustomAlert } from "@/config/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import PDFPreview from "@/app/utils/generatePDF";

export default function FormCotizacion({
  initialData, // Datos iniciales para editar
  isEditMode = false, // Si está en modo edición
  onSubmit, // Función para guardar cotización nueva
  onUpdate, // Función para actualizar cotización existente
}) {
  const [plans, setPlans] = useState([]); // Estado para almacenar los planes cargados
  const [isDirty, setIsDirty] = useState(false);
  const [breakdown, setBreakdown] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { alerts, showAlert, removeAlert } = useCustomAlert();
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
  
  useEffect(() => {
    setBreakdown(calculateTotalCost());
  }, [formData]);

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
      const IVA = 0.13; // 13% IVA
      const tipoCambio = parseFloat(formData.tipoCambio || 1); // Tipo de cambio para conversión
      const breakdown = {};
      let totalCost = 0;
    
      // Precios base de los planes predefinidos
      const planPrices = {
        starter: formData.tipoPersona === "fisica" ? 45000 : 65000,
        professional: 99500,
        "full-compliance": 130000,
      };
    
      // **Precio Base**
      if (formData.tipoPlan === "predefinido" && formData.planSeleccionado) {
        breakdown.planBase = planPrices[formData.planSeleccionado] || 0;
        totalCost += breakdown.planBase;
      } else if (formData.tipoPlan === "personalizado") {
        const basePrice = parseFloat(formData.precioBase || 0); // Asegurar que sea un número
        breakdown.planBase = basePrice;
        totalCost += basePrice;
      }
    
      // **Colaboradores**
      if (formData.planSeleccionado === "full-compliance") {
        const colaboradoresExtra =
          parseInt(formData.colaboradores || 0) > 5
            ? parseInt(formData.colaboradores) - 5
            : 0;
        breakdown.colaboradores = colaboradoresExtra * 10000 * (1 + IVA);
        totalCost += breakdown.colaboradores;
      } else if (formData.manejoPlanilla) {
        breakdown.colaboradores = parseInt(formData.colaboradores || 0) * 10000 * (1 + IVA);
        totalCost += breakdown.colaboradores;
      }
    
      // **Facturas Emitidas**
      if (formData.facturas && formData.facturasEmitidas) {
        const facturasEmitidas = parseInt(formData.facturasEmitidas || 0);
        if (facturasEmitidas <= 10) {
          breakdown.facturas = 10000 * (1 + IVA);
        } else if (facturasEmitidas <= 20) {
          breakdown.facturas = 20000 * (1 + IVA);
        } else if (facturasEmitidas <= 30) {
          breakdown.facturas = 30000 * (1 + IVA);
        } else if (facturasEmitidas <= 40) {
          breakdown.facturas = 40000 * (1 + IVA);
        } else {
          breakdown.facturas =
            40000 * (1 + IVA) + (facturasEmitidas - 40) * 1000 * (1 + IVA);
        }
        totalCost += breakdown.facturas;
      }
    
      // **Transacciones**
      if (formData.transacciones && parseInt(formData.transacciones) > 50) {
        breakdown.transacciones =
          (parseInt(formData.transacciones) - 50) * 1000 * (1 + IVA);
        totalCost += breakdown.transacciones;
      } else {
        breakdown.transacciones = 0; // Asegúrate de que tenga un valor por defecto
      }
    
      // **Características Extra**
      breakdown.extraFeatures = formData.extraFeatures.reduce((sum, feature) => {
        const value = parseFloat(feature.value || 0); // Asegurar que sea un número
        return sum + value;
      }, 0);
      totalCost += breakdown.extraFeatures;
    
      // **Descuento**
      const discount = parseFloat(formData.discount || 0);
      if (formData.tipoDescuento === "porcentaje") {
        breakdown.discount = totalCost * (discount / 100); // Calcula porcentaje
      } else {
        breakdown.discount = discount; // Descuento fijo
      }
      totalCost -= breakdown.discount;

      breakdown.totalCost = totalCost;
    
      // **Conversión a dólares si aplica**
      if (formData.tipoMoneda === "USD") {
        const conversionRate = tipoCambio > 0 ? tipoCambio : 1; // Evitar división por 0
        Object.keys(breakdown).forEach((key) => {
          breakdown[key] = breakdown[key] / conversionRate;
        });
        totalCost /= conversionRate;
      }
    
      breakdown.totalCost = totalCost;
    
      return breakdown;
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
    const language = formData.idiomaCotizacion === "ingles" ? "en" : "es"; // Idioma actual
    setFormData({
      ...formData,
      planSeleccionado: e.target.value,
      featuresSeleccionadas: plan ? plan.features[language] : [], // Sincroniza características con el idioma
    });
  };
  
  const syncFeaturesWithLanguage = (newLanguage) => {
    const plan = plans.find((p) => p.name === formData.planSeleccionado); // Plan actual
    const language = newLanguage === "ingles" ? "en" : "es"; // Idioma nuevo
  
    setFormData((prevState) => ({
      ...prevState,
      idiomaCotizacion: newLanguage,
      featuresSeleccionadas: plan ? plan.features[language] : [], // Actualiza las características
    }));
  };
  

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    syncFeaturesWithLanguage(newLanguage); // Sincroniza características
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
    updatedExtraFeatures[index][field] = field === "value" ? parseFloat(value) || 0 : value;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setIsModalOpen(true); // Mostrar vista previa al hacer clic en Generar Cotización
  };

  const closeModal = () => {
    setIsModalOpen(false); // Cierra el modal
  };

  const handleSaveQuotation = async () => {
    try {
      const breakdown = calculateTotalCost();
      const totalCost = breakdown.totalCost;
  
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
        cliente: formData.cliente,
      };
  
      const response = await fetch("http://localhost:5001/save-quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quotationData),
      });
  
      if (response.ok) {
        showAlert({
          type: "success",
          title: "Éxito",
          message: "Cotización guardada exitosamente.",
        });
      } else {
        const data = await response.json();
        showAlert({
          type: "error",
          title: "Error",
          message: `Error al guardar la cotización: ${data.error}`,
        });
      }
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Error al guardar la cotización.",
      });
    }
  };
  
  
  
  const handleUpdateQuotation = async () => {
    try {
      const breakdown = calculateTotalCost();
      const totalCost = breakdown.totalCost;
  
      const updatedData = {
        ...formData,
        totalCost,
      };
  
      const response = await fetch(
        `http://localhost:5001/update-quotation/${initialData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );
  
      if (response.ok) {
        showAlert({
          type: "success",
          title: "Éxito",
          message: "Cotización actualizada exitosamente.",
        });
        window.location.reload();
      } else {
        const data = await response.json();
        showAlert({
          type: "error",
          title: "Error",
          message: `Error al actualizar la cotización: ${data.error}`,
        });
      }
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Error de conexión al actualizar la cotización.",
      });
    }
  };
  
  

  
  const uniqueFeatures = plans
  .find((p) => p.name === "full-compliance")
  ?.features[formData.idiomaCotizacion === "ingles" ? "en" : "es"]
  .filter((feature, index, self) => self.indexOf(feature) === index) || [];


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
              onChange={handleLanguageChange} // Usa el manejador actualizado
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
                precioBase: e.target.value.replace(/[^\d.]/g, ""), // Aceptar solo números
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
                <textarea
                  placeholder="Descripción detallada de la característica"
                  value={feature.name}
                  onChange={(e) =>
                    handleExtraFeatureChange(index, "name", e.target.value)
                  }
                  className="w-2/3 border rounded-md p-2 resize-none"
                  rows="3" // Puedes ajustar el número de filas
                  required
                ></textarea>
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
        />
      </div>


{/* Desglose del costo */}
<div className="mt-6 mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-800">Desglose del Costo:</h3>
  <ul className="mt-4 space-y-2">
    <li className="flex justify-between">
      <span>Precio Base:</span>
      <span>
        {new Intl.NumberFormat(formData.tipoMoneda === "USD" ? "en-US" : "es-CR", {
          style: "currency",
          currency: formData.tipoMoneda,
        }).format(breakdown.planBase || 0)}
      </span>
    </li>
    <li className="flex justify-between">
      <span>Colaboradores:</span>
      <span>
        {new Intl.NumberFormat(formData.tipoMoneda === "USD" ? "en-US" : "es-CR", {
          style: "currency",
          currency: formData.tipoMoneda,
        }).format(breakdown.colaboradores || 0)}
      </span>
    </li>
    <li className="flex justify-between">
      <span>Facturas:</span>
      <span>
        {new Intl.NumberFormat(formData.tipoMoneda === "USD" ? "en-US" : "es-CR", {
          style: "currency",
          currency: formData.tipoMoneda,
        }).format(breakdown.facturas || 0)}
      </span>
    </li>
    <li className="flex justify-between">
      <span>Transacciones:</span>
      <span>
        {new Intl.NumberFormat(formData.tipoMoneda === "USD" ? "en-US" : "es-CR", {
          style: "currency",
          currency: formData.tipoMoneda,
        }).format(breakdown.transacciones || 0)}
      </span>
    </li>
      <li className="flex justify-between">
        <span>Características Extra:</span>
        <span>
          {new Intl.NumberFormat(formData.tipoMoneda === "USD" ? "en-US" : "es-CR", {
            style: "currency",
            currency: formData.tipoMoneda,
          }).format(breakdown.extraFeatures)}
        </span>
      </li>
    {formData.discount > 0 && (
      <li className="flex justify-between items-center">
        <span>Descuento:</span>
        <div className="flex items-center">
          <span className="text-right">
            {new Intl.NumberFormat(formData.tipoMoneda === "USD" ? "en-US" : "es-CR", {
              style: "currency",
              currency: formData.tipoMoneda,
            }).format(breakdown.discount)}
          </span>
          <button
            className="ml-2 text-red-500 hover:text-red-700"
            onClick={() => setFormData({ ...formData, discount: 0 })}
          >
            X
          </button>
        </div>
      </li>
    )}

  </ul>

  {/* Botón para agregar descuento */}
  {!formData.discount && (
    <button
    type="button"
      className="mt-4 py-1 px-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
      onClick={() =>
        setFormData({ ...formData, showDiscountInput: true })
      }
    >
      Añadir descuento
    </button>
  )}

{formData.showDiscountInput && (
  <div className="p-4 mt-4 bg-gray-50 rounded-lg border border-gray-300">
    {/* Título */}
    <h3 className="text-lg font-medium text-gray-700 mb-4">Aplicar Descuento</h3>

    {/* Selector de tipo de descuento */}
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">Tipo de Descuento</label>
      <select
        name="tipoDescuento"
        value={formData.tipoDescuento || "fijo"}
        onChange={(e) => setFormData({ ...formData, tipoDescuento: e.target.value })}
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
      >
        <option value="fijo">Fijo (₡)</option>
        <option value="porcentaje">Porcentaje (%)</option>
      </select>
    </div>

    {/* Entrada para el descuento */}
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">Descuento</label>
      <input
        type="number"
        min="0"
        placeholder={formData.tipoDescuento === "porcentaje" ? "Descuento (%)" : "Descuento (₡)"}
        value={formData.discount || ""}
        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value || 0) })}
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#305832] transition duration-200"
      />
    </div>

    {/* Botones de acción */}
    <div className="flex justify-end gap-2">
      <button
        type="button"
        className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
        onClick={() => setFormData({ ...formData, showDiscountInput: false })}
      >
        Aceptar
      </button>
      <button
        type="button"
        className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
        onClick={() => setFormData({ ...formData, discount: 0, showDiscountInput: false })}
      >
        Cancelar
      </button>
    </div>
  </div>
)}



  {/* Total */}
  <div className="mt-4 border-t pt-4 flex justify-between font-bold text-lg">
    <span>Total:</span>
    <span>
      {new Intl.NumberFormat(formData.tipoMoneda === "USD" ? "en-US" : "es-CR", {
        style: "currency",
        currency: formData.tipoMoneda,
      }).format(breakdown.totalCost || 0)}
    </span>
  </div>
</div>


        {/* Botón para guardar o actualizar cotización */}
        <button
          type="button"
          onClick={isEditMode ? handleUpdateQuotation : handleSaveQuotation}
          className={`w-full py-3 mt-4  font-semibold rounded-lg transition duration-300 ease-in-out ${
            isEditMode
              ? "border border-blue-600 text-blue-600 hover:bg-blue-100"
              : "border border-blue-600 text-blue-600 hover:bg-blue-100"
          }`}
        >
          {isEditMode ? "Guardar Cambios" : "Guardar Cotización"}
        </button>
        <button
          type="submit"
          className="w-full mt-4 py-3 border border-[#305832] text-[#305832] font-semibold rounded-lg hover:bg-green-100 transition duration-300 ease-in-out"
        >
          Vista Previa del PDF 
        </button>

      </form>

       {/* Modal para mostrar la vista previa del PDF */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 h-3/4 overflow-auto">
          <PDFPreview formData={formData} breakdown={breakdown} />
            <button
              onClick={closeModal}
              className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
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
