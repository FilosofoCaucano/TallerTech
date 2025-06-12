import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Estilos/Consulta.css";
import { authFetch } from "../services/authFetch";

const Consulta = () => {
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [registro, setRegistro] = useState([]);

  const [nuevoRegistro, setNuevoRegistro] = useState({
    id_cliente: "",
    placa: "",
    id_servicio: "",
    fecha: "",
    estado: "Activo",
  });

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("cliente");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  // Cargar clientes desde backend
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await authFetch("http://localhost:8000/clientes");
        if (!res.ok) throw new Error("Error al cargar clientes");
        const data = await res.json();
        setClientes(data);
      } catch (error) {
        console.error("❌ Error al obtener clientes:", error);
      }
    };

    fetchClientes();
  }, []);

  // Cargar vehículos cuando se selecciona un cliente
  useEffect(() => {
    const fetchVehiculos = async () => {
      const id_cliente = nuevoRegistro.id_cliente;
      if (!id_cliente) return;

      try {
        const res = await authFetch(`http://localhost:8000/vehiculos/por-cliente/${id_cliente}`);
        if (!res.ok) throw new Error("Error al cargar vehículos");
        const data = await res.json();
        setVehiculos(data);
      } catch (error) {
        console.error("❌ Error al obtener vehículos:", error);
        setVehiculos([]);
      }
    };

    fetchVehiculos();
  }, [nuevoRegistro.id_cliente]);

  // Cargar servicios
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await authFetch("http://localhost:8000/servicios");
        if (!res.ok) throw new Error("Error al cargar servicios");
        const data = await res.json();
        setServicios(data);
      } catch (error) {
        console.error("❌ Error al obtener servicios:", error);
      }
    };

    fetchServicios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoRegistro((prev) => ({ ...prev, [name]: value }));
  };

  const agregarRegistro = () => {
    const { id_cliente, placa, id_servicio, fecha } = nuevoRegistro;

    if (!id_cliente || !placa || !id_servicio || !fecha) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const cliente = clientes.find(c => c.id === id_cliente);
    const vehiculo = vehiculos.find(v => v.placa === placa);
    const servicio = servicios.find(s => s.id_servicio === id_servicio);

    if (!cliente || !vehiculo || !servicio) return;

    const nuevo = {
      id_cliente,
      cliente_nombre: cliente.nombre,
      placa: vehiculo.placa,
      marca_modelo: `${vehiculo.marca} ${vehiculo.modelo}`,
      nombre_servicio: servicio.nombre,
      costo: parseFloat(servicio.precio),
      fecha,
      estado: nuevoRegistro.estado,
    };

    setRegistro((prev) => [...prev, nuevo]);

    setNuevoRegistro((prev) => ({
      ...prev,
      placa: "",
      id_servicio: "",
      fecha: "",
    }));
  };

  const handleEliminar = (index) => {
    if (window.confirm("¿Deseas eliminar este registro?")) {
      setRegistro((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const toggleEstado = (index) => {
    setRegistro((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, estado: r.estado === "Activo" ? "Inactivo" : "Activo" }
          : r
      )
    );
  };

  const registrosFiltrados = registro.filter((r) => {
    const campo = r[filtro];
    const valorCampo = typeof campo === "string" ? campo : String(campo || "");
    return (
      valorCampo.toLowerCase().includes(busqueda.toLowerCase()) &&
      (estadoFiltro === "Todos" || r.estado === estadoFiltro)
    );
  });

  const calcularTotal = () => {
    let total = {};
    registrosFiltrados.forEach((r) => {
      total[r.cliente_nombre] = (total[r.cliente_nombre] || 0) + r.costo;
    });
    return total;
  };

  const dataGastos = {
    labels: Object.keys(calcularTotal()),
    datasets: [
      {
        label: "Total Gastado ($)",
        data: Object.values(calcularTotal()),
        backgroundColor: "#3498db",
      },
    ],
  };

  return (
    <div className="consulta-container">
      <h2>🔧 Registro de Consumos por Cliente y Vehículo</h2>

      {/* Formulario */}
      <form onSubmit={(e) => { e.preventDefault(); agregarRegistro(); }} className="form-agregar-consumo">
        <select name="id_cliente" value={nuevoRegistro.id_cliente} onChange={handleChange}>
          <option value="">Selecciona un cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select name="placa" value={nuevoRegistro.placa} onChange={handleChange} disabled={!nuevoRegistro.id_cliente}>
          <option value="">Selecciona un vehículo</option>
          {vehiculos.map((v) => (
            <option key={v.placa} value={v.placa}>
              {v.marca} {v.modelo} - Placa: {v.placa}
            </option>
          ))}
        </select>

        <select name="id_servicio" value={nuevoRegistro.id_servicio} onChange={handleChange}>
          <option value="">Selecciona un servicio</option>
          {servicios.map((s) => (
            <option key={s.id_servicio} value={s.id_servicio}>
              {s.nombre} - ${parseFloat(s.precio).toFixed(2)}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="fecha"
          value={nuevoRegistro.fecha}
          onChange={handleChange}
          required
        />

        <select name="estado" value={nuevoRegistro.estado} onChange={handleChange}>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>

        <button type="submit">Agregar</button>
      </form>

      {/* Filtros */}
      <div className="busqueda-container">
        <input
          type="text"
          placeholder={`Buscar por ${filtro}...`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select onChange={(e) => setFiltro(e.target.value)}>
          <option value="cliente_nombre">Cliente</option>
          <option value="placa">Placa</option>
          <option value="nombre_servicio">Servicio</option>
        </select>
        <select onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      {/* Tabla de consumos */}
      <table className="consulta-tabla">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Vehículo</th>
            <th>Servicio</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Costo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registrosFiltrados.length > 0 ? (
            registrosFiltrados.map((r, index) => (
              <tr key={index}>
                <td>{r.cliente_nombre}</td>
                <td>{r.marca_modelo}</td>
                <td>{r.nombre_servicio}</td>
                <td>{r.fecha}</td>
                <td>{r.estado}</td>
                <td>${r.costo.toFixed(2)}</td>
                <td>
                  <button onClick={() => handleEliminar(index)}>🗑</button>
                  <button onClick={() => toggleEstado(index)}>🔁</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No hay registros.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Gráfico */}
      <h3>📈 Gastos por Cliente</h3>
      <div className="grafico-container">
        <Bar data={dataGastos} />
      </div>
    </div>
  );
};

export default Consulta;