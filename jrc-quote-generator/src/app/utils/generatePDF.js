import React from "react";
import html2pdf from "html2pdf.js";

const PDFPreview = ({ formData, breakdown }) => {
  const uniqueFeatures = [...new Set(formData.featuresSeleccionadas)];

  const translations = {
    es: {
      title: (tipoPlan, planSeleccionado, nombreCliente) =>
        tipoPlan === "predefinido"
          ? `Plan ${planSeleccionado} - ${nombreCliente}`
          : `Plan Personalizado - ${nombreCliente}`,
      clientInfo: "Información del Cliente",
      planFeatures: "Características del Plan",
      additionalDetails: "Especificaciones Adicionales",
      extraFeatures: "Características Extras",
      priceBreakdown: "Desglose de Precios",
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
      title: (tipoPlan, planSeleccionado, nombreCliente) =>
        tipoPlan === "predefinido"
          ? `${planSeleccionado} Plan - ${nombreCliente}`
          : `Custom Plan - ${nombreCliente}`,
      clientInfo: "Client Information",
      planFeatures: "Plan Features",
      additionalDetails: "Additional Specifications",
      extraFeatures: "Extra Features",
      priceBreakdown: "Price Breakdown",
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
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
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

  return (
    <div id="pdf-content" className="p-6 mx-auto" style={{ maxWidth: "700px", padding: "20px" }}>
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
        `}
      </style>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <img src="/NEGRO-FONDO-BLANCO.jpg" alt="Logo" className="h-20" />
        <div>
          <p className="text-md font-bold">JRC Consulting Group</p>
          <p>{t.date}: {new Date().toLocaleDateString(language === "en" ? "en-US" : "es-CR")}</p>
          <p>{t.time}: {new Date().toLocaleTimeString(language === "en" ? "en-US" : "es-CR")}</p>
        </div>
      </div>

      {/* Tipo de Plan */}
      <div className="text-2xl font-bold mb-4">
        {t.title(tipoPlan, planSeleccionado, cliente.nombre)}
      </div>

      {/* Información del Cliente */}
      <div className="bg-[#305832] text-white px-4 py-1 font-bold">{t.clientInfo}</div>
      <table className="w-full mb-4 border page-section">
        <tbody>
          <tr>
            <td className="border px-4 py-2 font-bold">{language === "es" ? "Nombre:" : "Name:"}</td>
            <td className="border px-4 py-2">{cliente.nombre}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">{language === "es" ? "Correo Electrónico:" : "Email:"}</td>
            <td className="border px-4 py-2">{cliente.correo}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">{language === "es" ? "Teléfono:" : "Phone:"}</td>
            <td className="border px-4 py-2">{cliente.telefono}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">{language === "es" ? "Dirección:" : "Address:"}</td>
            <td className="border px-4 py-2">{cliente.direccion}</td>
          </tr>
        </tbody>
      </table>

      {/* Características del Plan */}
      <div className="bg-[#305832] text-white px-4 py-1 font-bold">{t.planFeatures}</div>
      <ul className="list-disc ml-6 mb-4 page-section">
        {uniqueFeatures.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>

      {/* Especificaciones Adicionales */}
      <div className="bg-[#305832] text-white px-4 py-1 font-bold">{t.additionalDetails}</div>
      <table className="w-full mb-4 border page-section">
        <tbody>
          <tr>
            <td className="border px-4 py-2">{t.payrollManagement}:</td>
            <td className="border px-4 py-2">{colaboradores > 0 ? t.yes : t.no}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">{t.employees}:</td>
            <td className="border px-4 py-2">{colaboradores}</td>
          </tr>
          {formData.facturas && (
            <>
              <tr>
                <td className="border px-4 py-2">{t.issuedInvoices}:</td>
                <td className="border px-4 py-2">{facturasEmitidas || 0}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">{t.receivedInvoices}:</td>
                <td className="border px-4 py-2">{facturasRecibidas || 0}</td>
              </tr>
            </>
          )}
          <tr>
            <td className="border px-4 py-2">{t.transactions}:</td>
            <td className="border px-4 py-2">{transacciones || 0}</td>
          </tr>
        </tbody>
      </table>

      {/* Características Extras */}
      {extraFeatures.length > 0 && (
        <>
          <div className="bg-[#305832] text-white px-4 py-1 font-bold">{t.extraFeatures}</div>
          <table className="w-full mb-4 border page-section">
            <thead>
              <tr>
                <th className="border px-4 py-2">{language === "es" ? "Descripción" : "Description"}</th>
                <th className="border px-4 py-2">{language === "es" ? "Valor" : "Value"}</th>
              </tr>
            </thead>
            <tbody>
              {extraFeatures.map((feature, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{feature.name}</td>
                  <td className="border px-4 py-2">
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
      <div className="bg-[#305832] text-white px-4 py-1 font-bold">{t.priceBreakdown}</div>
      <table className="w-full mb-4 border page-section">
        <thead>
          <tr>
            <th className="border px-4 py-2">{language === "es" ? "Descripción" : "Description"}</th>
            <th className="border px-4 py-2">{language === "es" ? "Monto" : "Amount"}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">{t.planCost}</td>
            <td className="border px-4 py-2">{currencySymbol}{breakdown.planBase.toLocaleString()}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">{t.payrollCost}</td>
            <td className="border px-4 py-2">{currencySymbol}{breakdown.colaboradores?.toLocaleString()}</td>
          </tr>
          {breakdown.facturas > 0 && (
            <tr>
              <td className="border px-4 py-2">{t.invoiceCost}</td>
              <td className="border px-4 py-2">{currencySymbol}{breakdown.facturas.toLocaleString()}</td>
            </tr>
          )}
          {breakdown.transacciones > 0 && (
            <tr>
              <td className="border px-4 py-2">{t.transactionCost}</td>
              <td className="border px-4 py-2">{currencySymbol}{breakdown.transacciones.toLocaleString()}</td>
            </tr>
          )}
          {breakdown.extraFeatures > 0 && (
            <tr>
              <td className="border px-4 py-2">{t.extraFeatureCost}</td>
              <td className="border px-4 py-2">{currencySymbol}{breakdown.extraFeatures.toLocaleString()}</td>
            </tr>
          )}
          {breakdown.discount > 0 && (
            <tr>
              <td className="border px-4 py-2">{t.discount}</td>
              <td className="border px-4 py-2">-{currencySymbol}{breakdown.discount.toLocaleString()}</td>
            </tr>
          )}
          <tr>
            <td className="border px-4 py-2 font-bold">{t.totalCost}</td>
            <td className="border px-4 py-2 font-bold">{currencySymbol}{breakdown.totalCost.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="text-sm mt-6 page-section">
        <p>{t.notes}</p>
        <p className="mt-2 font-semibold">{t.observation}</p>
        <p className="mt-2">{t.importantNote}</p>
      </div>

      <div className="flex justify-between items-center mt-6 page-section">
        <div className="text-sm">
          <p>JRC Consulting Group</p>
        </div>
        <div>
          <img src="/pyme_costa_rica_image.png" alt="PYME Logo" className="h-12" />
        </div>
      </div>

      <button
        onClick={handleDownloadPDF}
        className="mt-4 py-2 px-4 bg-[#305832] text-white rounded hover:bg-green-700 print-hidden"
      >
        {t.downloadPDF}
      </button>
    </div>
  );
};

export default PDFPreview;
