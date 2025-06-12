import { useState } from "react";
import "./Estilos/RegistroCliente.css";

const RegistroCliente = () => {
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    tecnomecanica: "",
    email: "",
    telefono: "",
    direccion: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { id, nombre, tecnomecanica, email } = formData;

    if (!id || !nombre || !tecnomecanica) {
      setError("❌ Todos los campos obligatorios deben ser llenados.");
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setError("❌ El correo electrónico no es válido.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("❌ No estás autenticado. Inicia sesión.");
      return;
    }

    const cliente = {
      ...formData,
      email: formData.email || "",
      telefono: formData.telefono || "",
      direccion: formData.direccion || "",
    };

    try {
      const res = await fetch("http://localhost:8000/clientes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cliente),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Cliente registrado con éxito.");
        setFormData({
          id: "",
          nombre: "",
          tecnomecanica: "",
          email: "",
          telefono: "",
          direccion: "",
        });
      } else {
        setError(result.detail || "❌ Error al registrar el cliente.");
      }
    } catch (error) {
      console.error("❌ Error al contactar el servidor:", error);
      setError("❌ Hubo un problema al contactar al servidor.");
    }
  };

  return (
    <div className="registro-cliente-container">
      <h2>👤 Registro de Cliente</h2>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="campo">
          <label>ID:</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="Ingrese su ID"
            required
          />
        </div>

        <div className="campo">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingrese su nombre"
            required
          />
        </div>

        <div className="campo">
          <label>Vencimiento Tecnomecánica:</label>
          <input
            type="date"
            name="tecnomecanica"
            value={formData.tecnomecanica}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo">
          <label>Email (opcional):</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="campo">
          <label>Teléfono (opcional):</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ingrese su teléfono"
          />
        </div>

        <div className="campo">
          <label>Dirección (opcional):</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Ingrese su dirección"
          />
        </div>

        <button type="submit">Registrar Cliente</button>
      </form>
    </div>
  );
};

export default RegistroCliente;
