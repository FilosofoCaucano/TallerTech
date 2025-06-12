import { useEffect, useState } from "react";
import "./Estilos/RegistroConsumo.css";
import { authFetch } from "../services/authFetch";
import { v4 as uuidv4 } from "uuid";

const RegistroConsumo = () => {
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [formData, setFormData] = useState({
    placaVehiculo: "",
    servicio: "",
    costo: "",
    fecha: "",
  });

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await authFetch("http://localhost:8000/clientes");
        const data = await res.json();
        setClientes(data);
      } catch (error) {
        console.error("❌ Error al cargar clientes:", error);
      }
    };

    const cargarServicios = async () => {
      try {
        const res = await authFetch("http://localhost:8000/servicios");
        const data = await res.json();
        setServicios(data);
      } catch (error) {
        console.error("❌ Error al cargar servicios:", error);
      }
    };

    cargarClientes();
    cargarServicios();
  }, []);

  useEffect(() => {
    const cargarVehiculos = async () => {
      if (!clienteSeleccionado) return;
      try {
        const res = await authFetch(
          `http://localhost:8000/vehiculos/por-cliente/${clienteSeleccionado}`
        );
        const data = await res.json();
        setVehiculos(data);
      } catch (error) {
        console.error("❌ Error al cargar vehículos:", error);
      }
    };

    cargarVehiculos();
  }, [clienteSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const consumo = {
      id_consumo: uuidv4(),
      id_cliente: clienteSeleccionado,
      placa: formData.placaVehiculo,
      id_servicio: formData.servicio,
      costo: formData.costo,
      fecha: formData.fecha,
    };

    try {
      const res = await authFetch("http://localhost:8000/consumos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consumo),
      });

      if (res.ok) {
        alert("✅ Consumo registrado exitosamente.");
        setFormData({
          placaVehiculo: "",
          servicio: "",
          costo: "",
          fecha: "",
        });
        setClienteSeleccionado("");
      } else {
        const err = await res.json();
        alert(`❌ Error: ${err.detail}`);
      }
    } catch (error) {
      console.error("❌ Error al registrar consumo:", error);
      alert("❌ No se pudo conectar al servidor.");
    }
  };

  return (
    <div className="registro-consumo-container">
      <h2>🧾 Registro de Consumo</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo">
          <label>Cliente:</label>
          <select
            name="clienteId"
            value={clienteSeleccionado}
            onChange={(e) => setClienteSeleccionado(e.target.value)}
            required
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Vehículo:</label>
          <select
            name="placaVehiculo"
            value={formData.placaVehiculo}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un vehículo</option>
            {vehiculos.map((v) => (
              <option key={v.placa} value={v.placa}>
                {v.marca} - {v.placa}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Servicio:</label>
          <select
            name="servicio"
            value={formData.servicio}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un servicio</option>
            {servicios.map((s) => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.nombre} (${s.precio})
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Costo ($):</label>
          <input
            type="number"
            name="costo"
            value={formData.costo}
            onChange={handleChange}
            placeholder="Ingrese el costo"
            required
          />
        </div>

        <div className="campo">
          <label>Fecha:</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Registrar Consumo</button>
      </form>
    </div>
  );
};

export default RegistroConsumo;
