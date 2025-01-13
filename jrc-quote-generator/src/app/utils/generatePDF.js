import React from "react";
import html2pdf from "html2pdf.js";

const PDFPreview = ({ formData, breakdown }) => {
  const uniqueFeatures = [...new Set(formData.featuresSeleccionadas)];

  const translations = {
    es: {
      title: (tipoPlan, planSeleccionado, nombreCliente) => {
        if (tipoPlan === "servicios-adicionales") {
          return `Servicios Adicionales - ${nombreCliente}`;
        }
        return tipoPlan === "predefinido"
          ? `Plan ${planSeleccionado} - ${nombreCliente}`
          : `Plan Personalizado - ${nombreCliente}`;
      },
      clientInfo: "Información del Cliente",
      planFeatures: "Características del Plan",
      additionalDetails: "Especificaciones Adicionales",
      extraFeatures: "Características Extras",
      priceBreakdown: "Desglose de Precios - IVA incluido",
      planCost: "Costo del Plan",
      payrollCost: "Costo por Planilla",
      extraFeatureCost: "Costo de Características Extras",
      invoiceCost: "Costo de Facturación Electrónica",
      transactionCost: "Costo de Transacciones",
      discount: "Descuento",
      totalCost: "Costo Total",
      downloadPDF: "Descargar PDF",
      notes: "La presente cotización tiene una validez de 15 días naturales. Para más información, contáctanos a info@jrc.cr.",
      observation: "Observación: Nosotros brindamos acompañamiento, es el factor de diferenciación entre muchos otros contadores o asesores.",
      importantNote: "Es importante destacar que el servicio ofrecido no incluye certificaciones de ingresos, flujos proyectados por CPA, certificaciones literales, personerías jurídicas, ni RTBF (a menos que se especifique lo contrario en esta cotización).",
      yes: "Sí",
      no: "No",
      payrollManagement: "Manejo de Planilla",
      employees: "Cantidad de Colaboradores",
      issuedInvoices: "Facturas Emitidas",
      receivedInvoices: "Facturas Recibidas",
      transactions: "Transacciones",
      date: "Fecha",
      time: "Hora",
    },
    en: {
      title: (tipoPlan, planSeleccionado, nombreCliente) => {
        if (tipoPlan === "servicios-adicionales") {
          return `Additional Services - ${nombreCliente}`;
        }
        return tipoPlan === "predefinido"
          ? `${planSeleccionado} Plan - ${nombreCliente}`
          : `Custom Plan - ${nombreCliente}`;
      },
      clientInfo: "Client Information",
      planFeatures: "Plan Features",
      additionalDetails: "Additional Specifications",
      extraFeatures: "Extra Features",
      priceBreakdown: "Price Breakdown - VAT",
      planCost: "Plan Cost",
      payrollCost: "Payroll Cost",
      extraFeatureCost: "Extra Features Cost",
      invoiceCost: "Electronic Billing Cost",
      transactionCost: "Transaction Cost",
      discount: "Discount",
      totalCost: "Total Cost",
      downloadPDF: "Download PDF",
      notes: "This quotation is valid for 15 calendar days. For more information, contact us at info@jrc.cr.",
      observation: "Observation: We provide guidance, which is our differentiating factor compared to many other accountants or advisors.",
      importantNote: "It is important to note that the offered service does not include income certifications, projected cash flows by CPA, literal certifications, legal entity certificates, or RTBF (unless otherwise specified in this quotation).",
      yes: "Yes",
      no: "No",
      payrollManagement: "Payroll Management",
      employees: "Number of Employees",
      issuedInvoices: "Issued Invoices",
      receivedInvoices: "Received Invoices",
      transactions: "Transactions",
      date: "Date",
      time: "Time",
    },
  };

  const {
    cliente,
    tipoPlan,
    planSeleccionado,
    extraFeatures,
    tipoMoneda,
    colaboradores,
    facturasEmitidas,
    facturasRecibidas,
    transacciones,
    tipoCambio,
    createdAt,
  } = formData;

  const language = formData.idiomaCotizacion === "ingles" ? "en" : "es";
  const t = translations[language];

  const handleDownloadPDF = () => {
    const button = document.querySelector(".print-hidden");
    if (button) button.style.display = "none";

    const content = document.getElementById("pdf-content");

    const opt = {
      margin: 1,
      filename: `Cotizacion-${tipoPlan}-${cliente.nombre.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(content)
      .save()
      .finally(() => {
        if (button) button.style.display = "block";
      });
  };

  const currencySymbol = tipoMoneda === "USD" ? "$" : "₡";

  const convertExtraFeature = (value) => {
    return tipoMoneda === "USD" && tipoCambio
      ? value / parseFloat(tipoCambio)
      : value;
  };

  const formatValue = (value) => {
    return value && value !== 0 ? value : "N/A";
  };

  const formatValueDesgloce = (value, currencySymbol) => {
    if (!value || value === 0) {
      return "N/A"; // Retorna "N/A" si el valor es 0 o vacío.
    }
    // Formatea el número con separadores de miles
    return `${currencySymbol}${new Intl.NumberFormat("es-CR").format(value)}`;
  };
  

  return (
    <div id="pdf-content" className="p-4 mx-auto" style={{ maxWidth: "700px",padding: "16px", fontSize: "10px"  }}>
      <style>
    {`
      @media print {
        .print-hidden {
          display: none !important;
        }
        .page-section {
          page-break-inside: avoid;
        }
        .page-break-before {
          page-break-before: always;
        }
      }
      table {
        font-size: 9px;
      }
      table th, table td {
        padding: 4px;
      }
      .bg-title {
        font-size: 10px;
        padding: 4px;
      }
    `}
  </style>

      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <img src="/NEGRO-FONDO-BLANCO.jpg" alt="Logo" className="h-20" />
        <div>
          <p className="text-sm font-bold">JRC Consulting Group</p>
          <p className="text-xs">
            Fecha: {createdAt
              ? new Date(createdAt._seconds * 1000).toLocaleDateString("es-CR")
              : "Fecha no disponible"}
          </p>
          <p className="text-xs font-bold">
            Cotización # {formData.cotizacionNumber || "N/A"}
          </p>
        </div>
      </div>

      {/* Tipo de Plan */}
      <div className="text-xl font-bold mb-2">
        {t.title(tipoPlan, planSeleccionado, cliente.nombre || cliente.nombreCompleto)}
      </div>

      {/* Información del Cliente */}
      <div className="bg-title bg-[#305832] text-white font-bold">{t.clientInfo}</div>
      <table className="w-full mb-2 border page-section">
  <tbody>
    <tr>
      <td className="border px-2 py-1 font-bold">{language === "es" ? "Nombre:" : "Name:"}</td>
      <td className="border px-2 py-1">{formatValue(cliente.nombre || cliente.nombreCompleto)}</td>
    </tr>
    <tr>
      <td className="border px-2 py-1 font-bold">{language === "es" ? "Correo Electrónico:" : "Email:"}</td>
      <td className="border px-2 py-1">{formatValue(cliente.correo)}</td>
    </tr>
    <tr>
      <td className="border px-2 py-1 font-bold">{language === "es" ? "Teléfono:" : "Phone:"}</td>
      <td className="border px-2 py-1">{formatValue(cliente.telefono)}</td>
    </tr>
    <tr>
      <td className="border px-2 py-1 font-bold">{language === "es" ? "Dirección:" : "Address:"}</td>
      <td className="border px-2 py-1">{formatValue(cliente.direccion)}</td>
    </tr>
  </tbody>
</table>


      {/* Características del Plan */}
      {tipoPlan !== "servicios-adicionales" && (
        <>
          <div className="bg-title bg-[#305832] text-white font-bold">{t.planFeatures}</div>
          <ul className="list-disc ml-4 mb-2 page-section">
            {uniqueFeatures.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </>
      )}

      {/* Especificaciones Adicionales */}
      {tipoPlan !== "servicios-adicionales" && (
  <>
          <div className="bg-title bg-[#305832] text-white font-bold">{t.additionalDetails}</div>
    <table className="w-full mb-2 border page-section">
      <tbody>
        <tr>
          <td className="border px-2 py-1">{t.payrollManagement}:</td>
          <td className="border px-2 py-1">{formatValue(colaboradores > 0 ? t.yes : t.no)}</td>
        </tr>
        <tr>
          <td className="border px-2 py-1">{t.employees}:</td>
          <td className="border px-2 py-1">{formatValue(colaboradores)}</td>
        </tr>
        {formData.facturas && (
          <>
            <tr>
              <td className="border px-2 py-1">{t.issuedInvoices}:</td>
              <td className="border px-2 py-1">{formatValue(facturasEmitidas)}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">{t.receivedInvoices}:</td>
              <td className="border px-2 py-1">{formatValue(facturasRecibidas)}</td>
            </tr>
          </>
        )}
        <tr>
          <td className="border px-2 py-1">{t.transactions}:</td>
          <td className="border px-2 py-1">{formatValue(transacciones)}</td>
        </tr>
      </tbody>
    </table>
    </>
)}

      {/* Características Extras */}
      {extraFeatures.length > 0 && (
        <>
          <div className="bg-[#305832] text-white px-2 py-1 font-bold">{t.extraFeatures}</div>
          <table className="w-full mb-4 border page-section">
            <thead>
              <tr>
                <th className="border px-2 py-1">{language === "es" ? "Descripción" : "Description"}</th>
                <th className="border px-2 py-1">{language === "es" ? "Valor" : "Value"}</th>
              </tr>
            </thead>
            <tbody>
              {extraFeatures.map((feature, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1">{feature.name}</td>
                  <td className="border px-2 py-1">
                    {currencySymbol}
                    {convertExtraFeature(parseFloat(feature.value)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Forzar un salto de página después */}
      <div className="page-break-before"></div>

      {/* Desglose de Precios */}
      <div className="bg-title bg-[#305832] text-white px-2 py-1 font-bold">{t.priceBreakdown}</div>
<table className="w-full mb-4 border page-section">
  <thead>
    <tr>
      <th className="border px-2 py-1">{language === "es" ? "Descripción" : "Description"}</th>
      <th className="border px-2 py-1">{language === "es" ? "Monto" : "Amount"}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border px-2 py-1">{t.planCost}</td>
      <td className="border px-2 py-1">{formatValueDesgloce(breakdown.planBase, currencySymbol)}</td>
    </tr>
    <tr>
      <td className="border px-2 py-1">{t.payrollCost}</td>
      <td className="border px-2 py-1">{formatValueDesgloce(breakdown.colaboradores, currencySymbol)}</td>
    </tr>
    {breakdown.facturas > 0 && (
      <tr>
        <td className="border px-2 py-1">{t.invoiceCost}</td>
        <td className="border px-2 py-1">{formatValueDesgloce(breakdown.facturas, currencySymbol)}</td>
      </tr>
    )}
    {breakdown.transacciones > 0 && (
      <tr>
        <td className="border px-2 py-1">{t.transactionCost}</td>
        <td className="border px-2 py-1">{formatValueDesgloce(breakdown.transacciones, currencySymbol)}</td>
      </tr>
    )}
    {breakdown.extraFeatures > 0 && (
      <tr>
        <td className="border px-2 py-1">{t.extraFeatureCost}</td>
        <td className="border px-2 py-1">{formatValueDesgloce(breakdown.extraFeatures, currencySymbol)}</td>
      </tr>
    )}
    {breakdown.discount > 0 && (
      <tr>
        <td className="border px-2 py-1">{t.discount}</td>
        <td className="border px-2 py-1">-{formatValueDesgloce(breakdown.discount, currencySymbol)}</td>
      </tr>
    )}
    <tr>
      <td className="border px-2 py-1 font-bold">{t.totalCost}</td>
      <td className="border px-2 py-1 font-bold">{formatValueDesgloce(breakdown.totalCost, currencySymbol)}</td>
    </tr>
  </tbody>
</table>


      {/* Footer */}
      <div className="text-xs mt-4 page-section">
        <p>{t.notes}</p>
        <p className="mt-2 font-semibold">{t.observation}</p>
        <p className="mt-2">{t.importantNote}</p>
      </div>

      <div className="flex justify-end items-center mt-4 page-section gap-2">
        <div className="text-xs text-right">
          <p>
            JRC Consulting Group ® <span>&copy;</span>
          </p>
        </div>
        <div>
          <img src="/pyme.svg" alt="Logo PYME" style={{ width: "auto", height: "56px" }} />
        </div>
      </div>


      <button
        onClick={handleDownloadPDF}
        className="mt-4 py-1 px-2 bg-[#305832] text-white rounded hover:bg-green-700 print-hidden"
      >
        {t.downloadPDF}
      </button>
    </div>
  );
};

export default PDFPreview;
