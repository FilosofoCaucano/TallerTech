import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Estilos/HistorialServicios.css";
import { authFetch } from "../services/authFetch";

const HistorialServicios = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [detalleVehiculo, setDetalleVehiculo] = useState(null);

  const API_BASE = "http://localhost:8000";

  // 🚗 Cargar lista de vehículos desde el backend
  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const res = await authFetch(`${API_BASE}/vehiculos`);
        const data = await res.json();
        if (res.ok) setVehiculos(data);
      } catch (error) {
        console.error("Error cargando vehículos:", error);
      }
    };

    fetchVehiculos();
  }, []);

  // 🔍 Buscar por placa o cliente
  const vehiculosFiltrados = vehiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(filtro.toLowerCase()) ||
      v.cliente_nombre?.toLowerCase().includes(filtro.toLowerCase())
  );

  // 📖 Consultar historial de un vehículo específico
  const verDetalles = async (placa) => {
    try {
      const [inspeccionesRes, facturasRes, consumosRes] = await Promise.all([
        authFetch(`${API_BASE}/inspecciones/${placa}`),
        authFetch(`${API_BASE}/facturas/${placa}`),
        authFetch(`${API_BASE}/consumos/placa/${placa}`),
      ]);

      const inspecciones = await inspeccionesRes.json();
      const facturas = await facturasRes.json();
      const servicios = await consumosRes.json();

      setDetalleVehiculo({ placa, inspecciones, facturas, servicios });
    } catch (error) {
      console.error("Error al obtener el historial del vehículo:", error);
    }
  };

  const cerrarDetalles = () => setDetalleVehiculo(null);

  const exportarPDF = () => {
  const doc = new jsPDF();
doc.text("🚘 Vehículos Registrados", 14, 10);
autoTable(doc, {
  startY: 20,
  head: [["Placa", "Cliente", "Marca", "Modelo"]],
  body: vehiculosFiltrados.map((v) => [
    v.placa,
    v.cliente_nombre || "Sin nombre",
    v.marca,
    v.modelo,
  ]),
});
doc.save("vehiculos_registrados.pdf");
};


  return (
    <div className="historial-container">
      <h2>🚘 Consulta de Vehículos y su Historial</h2>

      <input
        type="text"
        placeholder="🔍 Buscar por placa o cliente..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Cliente</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vehiculosFiltrados.map((v, index) => (
            <tr key={index}>
              <td>{v.placa}</td>
              <td>{v.cliente_nombre || "Sin nombre"}</td>
              <td>{v.marca}</td>
              <td>{v.modelo}</td>
              <td>
                <button className="detalle-btn" onClick={() => verDetalles(v.placa)}>
                  📄 Ver Historial
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={exportarPDF}>📄 Exportar Vehículos</button>

      {/* Modal Detalle */}
      {detalleVehiculo && (
        <div className="modal-detalle">
          <div className="detalle-content">
            <h3>📖 Historial del Vehículo</h3>
            <p>🚗 Placa: {detalleVehiculo.placa}</p>

            <h4>🔧 Inspecciones</h4>
            {detalleVehiculo.inspecciones.length > 0 ? (
              <ul>
                {detalleVehiculo.inspecciones.map((i, idx) => (
                  <li key={idx}>
                    {i.fecha} - {i.parte}: {i.estado}
                  </li>
                ))}
              </ul>
            ) : (
              <p>❌ No hay inspecciones.</p>
            )}

            <h4>🛠 Servicios Realizados</h4>
            {detalleVehiculo.servicios.length > 0 ? (
              <ul>
                {detalleVehiculo.servicios.map((s, idx) => (
                  <li key={idx}>
                    {s.fecha} - {s.servicio} (${s.costo})
                  </li>
                ))}
              </ul>
            ) : (
              <p>❌ No hay servicios registrados.</p>
            )}

            <h4>🧾 Facturación</h4>
            {detalleVehiculo.facturas.length > 0 ? (
              <ul>
                {detalleVehiculo.facturas.map((f, idx) => (
                  <li key={idx}>
                    {f.fecha} - Factura #{f.numFactura} - Total: ${f.total}
                  </li>
                ))}
              </ul>
            ) : (
              <p>❌ No hay facturas.</p>
            )}

            <button className="cerrar-btn" onClick={cerrarDetalles}>
              ❌ Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialServicios;
