import { useState } from "react";

export function useCustomAlert() {
  const [alerts, setAlerts] = useState([]);

  const showAlert = ({ type = "info", title, message, onConfirm, autoClose = true, duration = 3000 }) => {
    const id = Date.now(); // Generar un ID único
    const newAlert = { id, type, title, message, onConfirm, autoClose, duration };
    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);

    if (autoClose && type !== "confirm") {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  };

  const removeAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return { alerts, showAlert, removeAlert };
}
