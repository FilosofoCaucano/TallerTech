import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Estilos/Clientes.css";
import { authFetch } from "../services/authFetch"; // ✅ Importación clave

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("nombre");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [error, setError] = useState("");

  // ✅ Cargar clientes desde backend
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await authFetch("http://localhost:8000/clientes");
        const data = await res.json();
        if (res.ok) {
          setClientes(data);
        } else {
          setError(data.detail || "Error al cargar los clientes.");
        }
      } catch (err) {
        setError("Error de conexión con el servidor.");
      }
    };

    fetchClientes();
  }, []);

  // ✅ Filtrado
  const clientesFiltrados = clientes.filter((c) =>
    c[filtro]?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ✅ Abrir modal
  const abrirModalEdicion = (cliente) => {
    setClienteEditando(cliente);
    setModalAbierto(true);
  };

  // ✅ Guardar cambios
  const guardarEdicion = async () => {
    try {
      const res = await authFetch(`http://localhost:8000/clientes/${clienteEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteEditando),
      });

      const data = await res.json();

      if (res.ok) {
        const actualizados = await (await authFetch("http://localhost:8000/clientes")).json();
        setClientes(actualizados);
        setModalAbierto(false);
      } else {
        setError(data.detail || "No se pudo actualizar el cliente.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    }
  };

  // ✅ Eliminar cliente
  const eliminarCliente = async (id) => {
    const confirmado = window.confirm("¿Seguro que deseas eliminar este cliente?");
    if (!confirmado) return;

    try {
      const res = await authFetch(`http://localhost:8000/clientes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setClientes(clientes.filter((c) => c.id !== id));
      } else {
        const data = await res.json();
        setError(data.detail || "No se pudo eliminar el cliente.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    }
  };

  // ✅ Manejar cambio en formulario
  const handleChange = (e) => {
    setClienteEditando({
      ...clienteEditando,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Ver detalles
  const verDetallesCliente = (cliente) => {
    setClienteSeleccionado(cliente);
  };

  const cerrarDetalles = () => {
    setClienteSeleccionado(null);
  };

  // ✅ Datos para gráfico
  const dataClientes = {
    labels: ["Total Clientes"],
    datasets: [
      {
        label: "Cantidad",
        data: [clientes.length],
        backgroundColor: ["#4caf50"],
      },
    ],
  };

  return (
    <div className="clientes-container">
      <h2>📋 Gestión de Clientes</h2>
      {error && <p className="error-msg">{error}</p>}

      {/* Búsqueda */}
      <div className="busqueda-container">
        <input
          type="text"
          placeholder={`Buscar por ${filtro}...`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select onChange={(e) => setFiltro(e.target.value)}>
          <option value="nombre">Nombre</option>
          <option value="telefono">Teléfono</option>
          <option value="email">Correo electrónico</option>
        </select>
      </div>

      {/* Tabla */}
      <table className="clientes-tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Vehículos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nombre}</td>
                <td>{c.telefono}</td>
                <td>{c.email}</td>
                <td>-</td>
                <td>
                  <button className="btn-ver" onClick={() => verDetallesCliente(c)}>👁 Ver</button>
                  <button className="btn-editar" onClick={() => abrirModalEdicion(c)}>✏ Editar</button>
                  <button className="btn-eliminar" onClick={() => eliminarCliente(c.id)}>🗑 Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No se encontraron clientes.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Gráfico */}
      <h3>📈 Total de Clientes</h3>
      <div className="grafico-container">
        <Bar data={dataClientes} />
      </div>

      {/* Modal edición */}
      {modalAbierto && (
        <div className="modal">
          <div className="modal-content">
            <h3>✏️ Editar Cliente</h3>
            <label>Nombre:</label>
            <input type="text" name="nombre" value={clienteEditando?.nombre || ""} onChange={handleChange} />

            <label>Teléfono:</label>
            <input type="text" name="telefono" value={clienteEditando?.telefono || ""} onChange={handleChange} />

            <label>Correo electrónico:</label>
            <input type="email" name="email" value={clienteEditando?.email || ""} onChange={handleChange} />

            <label>Tecnomecánica:</label>
            <input
              type="date"
              name="tecnomecanica"
              value={clienteEditando?.tecnomecanica?.slice(0, 10) || ""}
              onChange={handleChange}
            />

            <button className="guardar-btn" onClick={guardarEdicion}>💾 Guardar Cambios</button>
            <button className="cerrar-btn" onClick={() => setModalAbierto(false)}>❌ Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal detalles */}
      {clienteSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h3>👤 Detalles del Cliente</h3>
            <p><strong>ID:</strong> {clienteSeleccionado.id}</p>
            <p><strong>Nombre:</strong> {clienteSeleccionado.nombre}</p>
            <p><strong>Teléfono:</strong> {clienteSeleccionado.telefono}</p>
            <p><strong>Email:</strong> {clienteSeleccionado.email}</p>
            <p><strong>Vehículos:</strong> -</p>
            <p><strong>Tecnomecánica:</strong> {clienteSeleccionado.tecnomecanica?.slice(0, 10) || "-"}</p>
            <button className="cerrar-btn" onClick={cerrarDetalles}>❌ Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
