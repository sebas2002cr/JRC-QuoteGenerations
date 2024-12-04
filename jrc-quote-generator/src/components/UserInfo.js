"use client";

import { useState, useEffect } from "react";

export default function UserInfo({ user }) {
  const [newPassword, setNewPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", role: "", fullName: "" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.role === "admin") {
      setIsAdmin(true);
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5001/get-users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
    }
  };

  const handleChangePassword = async () => {
    try {
      const response = await fetch("http://localhost:5001/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, newPassword }),
      });
      if (response.ok) {
        alert("Contraseña actualizada exitosamente.");
        setIsChangePasswordVisible(false);
        setNewPassword("");
      } else {
        const data = await response.json();
        alert(data.error || "Error al actualizar la contraseña.");
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch("http://localhost:5001/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        alert("Usuario agregado exitosamente.");
        fetchUsers();
        setIsAddUserModalOpen(false);
        setNewUser({ email: "", role: "", fullName: "" });
      } else {
        const data = await response.json();
        alert(data.error || "Error al agregar el usuario.");
      }
    } catch (error) {
      console.error("Error al agregar el usuario:", error);
    }
  };

  const handleDeleteUser = async (email) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario con email ${email}?`)) {
      try {
        const response = await fetch("http://localhost:5001/delete-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          alert("Usuario eliminado exitosamente.");
          fetchUsers();
        } else {
          const data = await response.json();
          alert(data.error || "Error al eliminar el usuario.");
        }
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        alert("Error al eliminar el usuario.");
      }
    }
  };

  const handleResetPassword = async (email) => {
    try {
      const response = await fetch("http://localhost:5001/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        alert("Contraseña restablecida exitosamente.");
      } else {
        const data = await response.json();
        alert(data.error || "Error al restablecer la contraseña.");
      }
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Usuario no autenticado</h2>
          <p className="text-gray-600">Por favor, inicia sesión para ver esta información.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-5xl mx-auto">
      <div className="flex flex-col items-center text-center">
        {/* Foto de usuario */}
        <div className="w-24 h-24 rounded-full bg-gray-500 text-white flex items-center justify-center text-3xl font-bold">
          {user.fullName.split(" ").map((n) => n[0]).join("")}
        </div>
        <h2 className="text-2xl font-bold mt-4">Información del Usuario</h2>
        <p className="mt-2 text-lg">
          <strong>Nombre:</strong> {user.fullName}
        </p>
        <p className="text-lg">
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      {/* Cambiar Contraseña */}
      <div className="mt-6 flex flex-col items-center">
        {!isChangePasswordVisible ? (
          <button
            onClick={() => setIsChangePasswordVisible(true)}
            className="mt-2 px-4 py-2 font-semibold text-[#305832] border border-green-800 rounded-lg"
          >
            ¿Quieres cambiar tu contraseña?
          </button>
        ) : (
          <div className="mt-4 w-full sm:w-1/2">
            <h3 className="text-lg font-semibold text-center">Cambiar Contraseña</h3>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-2"
            />
            <button
              onClick={handleChangePassword}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full"
            >
              Cambiar Contraseña
            </button>
          </div>
        )}
      </div>

      {/* Administrar Usuarios */}
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
                <th className="border border-gray-300 px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{user.fullName}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                  <td className="border border-gray-300 px-4 py-2 flex gap-1 justify-center">
                    <button
                      onClick={() => handleResetPassword(user.email)}
                      className="px-2 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-xs"
                    >
                      Resetear
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      className="px-2 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Modal para agregar usuario */}
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
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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
    </div>
  );
}
