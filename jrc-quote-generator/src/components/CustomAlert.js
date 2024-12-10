"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomAlert({
  isVisible,
  type = "info", // success, error, info, confirm
  title,
  message,
  autoClose = true,
  duration = 2000,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (autoClose && isVisible && type !== "confirm") {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, type, duration, onClose]);

  const typeStyles = {
    success: "bg-white border border-[#305832] text-green-800 font-semibold",
    error: "bg-white border border-red text-red-800",
    info: "bg-white border border-[#305832] text-gray-800",
    confirm: "bg-white border border-[#305832] text-gray-800",
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(); // Ejecuta la acción confirmada
    }
    onClose(); // Cierra el modal después de la confirmación
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`p-6 rounded-lg shadow-lg w-[90%] max-w-md ${typeStyles[type]}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {title && <h3 className="text-lg font-bold">{title}</h3>}
            <p className="mt-2">{message}</p>
            {type === "confirm" && (
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
                >
                  Confirmar
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
