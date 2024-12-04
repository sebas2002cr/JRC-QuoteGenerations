import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDF = async (formData) => {
  const {
    tipoPlan,
    planSeleccionado,
    featuresSeleccionadas,
    extraFeatures,
    precioBase,
    tipoPersona,
    manejoPlanilla,
    colaboradores,
    facturas,
    facturasEmitidas,
    facturasRecibidas,
    transacciones,
  } = formData;

  const doc = new jsPDF();
  const cotizacionNumber = `COT-${Date.now()}`;
  const logoImg = "/NEGRO-FONDO-BLANCO.jpg";

  // Encabezado con logo y título
  doc.addImage(logoImg, "JPEG", 10, 10, 30, 30);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Cotización de Cliente", 50, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 50);
  doc.text(`Hora: ${new Date().toLocaleTimeString()}`, 10, 55);
  doc.text(`No. Cotización: ${cotizacionNumber}`, 120, 50);

  doc.line(10, 60, 200, 60);

  // Información general
  doc.autoTable({
    startY: 70,
    head: [["Detalles de la Cotización", ""]],
    body: [
      ["Tipo de Persona:", tipoPersona],
      ["Manejo de Planilla:", manejoPlanilla ? "Sí" : "No"],
      manejoPlanilla ? ["Colaboradores:", colaboradores || "N/A"] : null,
      ["Facturación Electrónica:", facturas ? "Sí" : "No"],
      facturas ? ["Facturas Emitidas:", facturasEmitidas || "N/A"] : null,
      facturas ? ["Facturas Recibidas:", facturasRecibidas || "N/A"] : null,
      ["Transacciones Mensuales:", transacciones || "N/A"],
    ].filter(Boolean),
    theme: "grid",
    headStyles: { fillColor: "#305832", textColor: "#ffffff" },
    bodyStyles: { fillColor: "#ffffff", textColor: "#000000" },
  });

  // Detalles del plan seleccionado o personalizado
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Detalles del Plan Seleccionado", 10, doc.lastAutoTable.finalY + 15);

  if (tipoPlan === "predefinido") {
    doc.text(`Plan Seleccionado: ${planSeleccionado}`, 10, doc.lastAutoTable.finalY + 25);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 30,
      head: [["Características del Plan"]],
      body: featuresSeleccionadas.map((feature) => [feature]),
      theme: "grid",
      headStyles: { fillColor: "#305832", textColor: "#ffffff" },
      bodyStyles: { fillColor: "#ffffff", textColor: "#000000" },
    });
  } else {
    doc.text("Plan Personalizado", 10, doc.lastAutoTable.finalY + 25);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 30,
      head: [["Descripción", "Monto"]],
      body: [
        ["Precio Base", `₡${parseFloat(precioBase).toLocaleString()}`],
        ...featuresSeleccionadas.map((feature) => [feature, "Incluido"]),
        ...extraFeatures.map((extra) => [extra.name, `₡${parseFloat(extra.value).toLocaleString()}`]),
      ],
      theme: "grid",
      headStyles: { fillColor: "#305832", textColor: "#ffffff" },
      bodyStyles: { fillColor: "#ffffff", textColor: "#000000" },
    });
  }

  const totalExtraCosts = extraFeatures.reduce((sum, feature) => sum + parseFloat(feature.value || 0), 0);
  const totalCost = parseFloat(precioBase || 0) + totalExtraCosts;

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Resumen de Costos", "Monto"]],
    body: [
      ["Costo Base", `₡${parseFloat(precioBase).toLocaleString()}`],
      ["Costos Adicionales", `₡${totalExtraCosts.toLocaleString()}`],
      ["Costo Total", `₡${totalCost.toLocaleString()}`],
    ],
    theme: "grid",
    headStyles: { fillColor: "#305832", textColor: "#ffffff" },
    bodyStyles: { fillColor: "#ffffff", textColor: "#000000" },
  });

  // Guardar o abrir el PDF
  doc.save(`Cotizacion_${cotizacionNumber}.pdf`);
};
