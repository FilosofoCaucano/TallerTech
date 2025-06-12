import { useState, useEffect } from "react";
import "./Estilos/RegistroVehiculo.css";
import { authFetch } from "../services/authFetch";

const RegistroVehiculo = () => {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    cliente_id: "",
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
  });

  // Cargar clientes al iniciar
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await authFetch("http://localhost:8000/clientes");
        if (res.ok) {
          const data = await res.json();
          setClientes(data);
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };
    fetchClientes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { cliente_id, placa, marca, modelo, anio } = formData;

    if (!cliente_id || !placa || !marca || !modelo || !anio) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const vehiculo = {
      cliente_id,
      placa,
      marca,
      modelo,
      anio: parseInt(anio),
    };

    try {
      const res = await authFetch("http://localhost:8000/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehiculo),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Vehículo registrado correctamente.");
        setFormData({
          cliente_id: "",
          placa: "",
          marca: "",
          modelo: "",
          anio: "",
        });
      } else {
        alert("❌ Error: " + (result.detail || "Error desconocido."));
      }
    } catch (error) {
      alert("❌ Error de conexión.");
      console.error(error);
    }
  };

  return (
    <div className="registro-vehiculo-container">
      <h2>🚗 Registro de Vehículo</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo">
          <label>Cliente:</label>
          <select
            name="cliente_id"
            value={formData.cliente_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} (ID: {cliente.id})
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Placa:</label>
          <input
            type="text"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            placeholder="Ingrese la placa"
            required
          />
        </div>

        <div className="campo">
          <label>Marca:</label>
          <select
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una marca</option>
            {["Chevrolet", "Tesla", "Toyota", "Ford", "Honda", "BMW", "Mercedes-Benz", "Audi"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Modelo:</label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            placeholder="Ej: Spark, Corolla, Civic..."
            required
          />
        </div>

        <div className="campo">
          <label>Año:</label>
          <input
            type="number"
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            placeholder="Ej: 2022"
            required
          />
        </div>

        <button type="submit">Registrar Vehículo</button>
      </form>
    </div>
  );
};

export default RegistroVehiculo;
