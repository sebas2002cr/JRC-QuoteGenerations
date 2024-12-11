"use client";

import { useState, useEffect } from "react";
import { useCustomAlert } from "@/config/useCustomAlert";
import CustomAlert from "./CustomAlert";

export default function UserInfo({ user }) {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", role: "", fullName: "" });
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const { alerts, showAlert, removeAlert } = useCustomAlert();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setIsAdmin(storedUser.role === "admin" || storedUser.role === "superAdmin");
      setIsSuperAdmin(storedUser.role === "superAdmin");
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/get-users`);
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error al cargar usuarios",
        message: "No se pudieron cargar los usuarios.",
      });
    }
  };

  // Función para manejar el cambio de contraseña
const handleChangePassword = async () => {
    if (!newPassword) {
      showAlert({
        type: "error",
        title: "Error",
        message: "La nueva contraseña no puede estar vacía.",
      });
      return;
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, newPassword }),
      });
  
      if (response.ok) {
        showAlert({
          type: "success",
          title: "Éxito",
          message: "Contraseña cambiada exitosamente.",
        });
        setIsChangePasswordVisible(false);
        setNewPassword("");
      } else {
        const data = await response.json();
        showAlert({
          type: "error",
          title: "Error",
          message: data.error || "Error al cambiar la contraseña.",
        });
      }
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Error al cambiar la contraseña.",
      });
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/add-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        showAlert({
          type: "success",
          title: "Éxito",
          message: "Usuario agregado exitosamente.",
        });
        fetchUsers();
        setIsAddUserModalOpen(false);
        setNewUser({ email: "", role: "", fullName: "" });
      } else {
        const data = await response.json();
        showAlert({
          type: "error",
          title: "Error",
          message: data.error || "Error al agregar el usuario.",
        });
      }
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Error al agregar el usuario.",
      });
    }
  };

  const handleDeleteUser = async (email) => {
    showAlert({
      type: "confirm",
      title: "Confirmación",
      message: `¿Estás seguro de que deseas eliminar al usuario con email ${email}?`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/delete-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (response.ok) {
            showAlert({
              type: "success",
              title: "Éxito",
              message: "Usuario eliminado exitosamente.",
            });
            fetchUsers();
          } else {
            const data = await response.json();
            showAlert({
              type: "error",
              title: "Error",
              message: data.error || "Error al eliminar el usuario.",
            });
          }
        } catch (error) {
          showAlert({
            type: "error",
            title: "Error",
            message: "Error al eliminar el usuario.",
          });
        }
      },
    });
  };

  const handleResetPassword = async (email) => {
    if (!isSuperAdmin) {
      showAlert({
        type: "error",
        title: "Acceso denegado",
        message: "No tienes permiso para restablecer contraseñas.",
      });
      return;
    }

    showAlert({
      type: "confirm",
      title: "Confirmación",
      message: `¿Estás seguro de que deseas restablecer la contraseña del usuario con email ${email}?`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (response.ok) {
            showAlert({
              type: "success",
              title: "Éxito",
              message: "Contraseña restablecida exitosamente.",
            });
          } else {
            const data = await response.json();
            showAlert({
              type: "error",
              title: "Error",
              message: data.error || "Error al restablecer la contraseña.",
            });
          }
        } catch (error) {
          showAlert({
            type: "error",
            title: "Error",
            message: "Error al restablecer la contraseña.",
          });
        }
      },
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-5xl mx-auto">
      <div className="flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-gray-500 text-white flex items-center justify-center text-3xl font-bold">
        {user?.fullName?.split(" ").map((n) => n[0]).join("") || "?"}
        </div>
        <h2 className="text-2xl font-bold mt-4">Información del Usuario</h2>
        <p className="mt-2 text-lg">
        <strong>Nombre:</strong> {user?.fullName || "No disponible"}
        </p>
        <p className="text-lg">
        <strong>Email:</strong> {user?.email || "No disponible"}
        </p>
      </div>
      {/* Cambiar contraseña */}
<div className="mt-6 flex flex-col items-center">
  {!isChangePasswordVisible ? (
    <button
      onClick={() => setIsChangePasswordVisible(true)}
      className="px-4 py-2 bg-white text-[#305832] border border-[#305832] rounded-lg hover:bg-gray-100"
    >
      Cambiar contraseña
    </button>
  ) : (
    <div className="mt-4 w-full sm:w-1/2">
      <h3 className="text-lg font-semibold text-center">Nueva contraseña</h3>
      <input
        type="password"
        placeholder="Ingresa nueva contraseña"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 mt-2"
      />
      <div className="flex justify-between mt-2">
        <button
          onClick={handleChangePassword}
          className="px-4 py-2 bg-[#305832] text-white rounded-lg hover:bg-green-800"
        >
          Guardar
        </button>
        <button
          onClick={() => {
            setIsChangePasswordVisible(false);
            setNewPassword("");
          }}
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Cancelar
        </button>
      </div>
    </div>
  )}
</div>


      {isAdmin && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Administrar Usuarios</h3>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2 bg-[#305832] text-white rounded-lg hover:bg-green-800 mb-4"
          >
            Agregar Usuario
          </button>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300 text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Nombre</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                  <th className="border border-gray-300 px-4 py-2">Rol</th>
                  {isSuperAdmin && (
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{user.fullName}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                    {isSuperAdmin && (
                      <td className="border border-gray-300 px-4 py-2 flex gap-1 justify-center">
                        <button
                          onClick={() => handleResetPassword(user.email)}
                          className="px-2 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-100 text-xs"
                        >
                          Resetear
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          className="px-2 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-100 text-xs"
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
        </div>
      )}

      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[95%] sm:w-[50%]">
            <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Usuario</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Ingrese el email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prevState) => ({
                    ...prevState,
                    email: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ingrese el nombre completo"
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser((prevState) => ({
                    ...prevState,
                    fullName: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser((prevState) => ({
                    ...prevState,
                    role: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Seleccione un rol</option>
                <option value="admin">Administrador</option>
                <option value="user">Usuario</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-white border border-[#305832] text-[#305832] rounded-lg hover:bg-[#305832] hover:text-white"
              >
                Agregar
              </button>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render de alertas */}
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
