import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../services/authFetch";
import "./Estilos/InspeccionVehiculo.css";

const InspeccionVehiculo = () => {
  const navigate = useNavigate();

  const partesVehiculo = [
    "Luces delanteras", "Luces traseras", "Frenos", "Aceite del motor",
    "Batería", "Filtro de aire", "Presión de neumáticos", "Amortiguadores",
    "Dirección", "Sistema de escape",
  ];

  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [vehiculosCliente, setVehiculosCliente] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");
  const [inspeccion, setInspeccion] = useState(() =>
    partesVehiculo.reduce((estado, parte) => {
      estado[parte] = "";
      return estado;
    }, {})
  );
  const [observaciones, setObservaciones] = useState(() =>
    partesVehiculo.reduce((obs, parte) => {
      obs[parte] = "";
      return obs;
    }, {})
  );
  const [firmaCliente, setFirmaCliente] = useState(false);

  useEffect(() => {
    const cargarClientes = async () => {
      const res = await authFetch("http://localhost:8000/clientes");
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
      }
    };
    cargarClientes();
  }, []);

  useEffect(() => {
    const cargarVehiculos = async () => {
      if (clienteSeleccionado) {
        const res = await authFetch(`http://localhost:8000/vehiculos/por-cliente/${clienteSeleccionado}`);
        if (res.ok) {
          const data = await res.json();
          setVehiculosCliente(data);
        }
      } else {
        setVehiculosCliente([]);
      }
    };
    cargarVehiculos();
  }, [clienteSeleccionado]);

  const handleSelectChange = (parte, estado) => {
    setInspeccion({ ...inspeccion, [parte]: estado });
  };

  const isInspeccionCompleta = partesVehiculo.every((parte) => inspeccion[parte] !== "");

  const handleSiguiente = async () => {
    if (!clienteSeleccionado || !vehiculoSeleccionado) {
      alert("❌ Debes seleccionar un cliente y un vehículo antes de continuar.");
      return;
    }

    if (!firmaCliente) {
      alert("❌ Debes confirmar que el cliente acepta la inspección.");
      return;
    }

    if (!isInspeccionCompleta) {
      const continuar = window.confirm("🚨 Faltan partes por inspeccionar. ¿Deseas continuar?");
      if (!continuar) return;
    }

    const id_inspeccion = `INSP-${crypto.randomUUID()}`;
    const fecha = new Date().toISOString().split("T")[0];

    // Crear inspección base
    const res = await authFetch("http://localhost:8000/inspecciones", {
      method: "POST",
      body: JSON.stringify({
        id_inspeccion,
        placa: vehiculoSeleccionado,
        fecha,
      }),
    });

    if (!res.ok) {
      alert("❌ Error al registrar inspección.");
      return;
    }

    // Registrar detalle por parte
    for (const parte of partesVehiculo) {
      await authFetch("http://localhost:8000/detalle-inspeccion", {
        method: "POST",
        body: JSON.stringify({
          id_detalle: crypto.randomUUID(),
          id_inspeccion,
          parte,
          estado: inspeccion[parte],
          observacion: observaciones[parte],
        }),
      });
    }

    alert("✅ Inspección registrada correctamente.");

    // Obtener objetos completos de cliente y vehículo
    const clienteObj = clientes.find((c) => c.id === clienteSeleccionado);
    const vehiculoObj = vehiculosCliente.find((v) => v.placa === vehiculoSeleccionado);

    // Navegar pasando todo como estado
    navigate("/diagnostico-vehiculo", {
      state: {
        clienteSeleccionado: clienteObj,
        vehiculoSeleccionado: vehiculoObj,
        inspeccionActual: inspeccion,
        observacionesActuales: observaciones,
        firmaCliente,
      },
    });
  };

  return (
    <div className="inspeccion-container">
      <h2>🔍 Inspección del Vehículo</h2>

      <label>👤 Seleccionar Cliente:</label>
      <select value={clienteSeleccionado} onChange={(e) => setClienteSeleccionado(e.target.value)}>
        <option value="">Seleccione un cliente</option>
        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nombre} (ID: {cliente.id})
          </option>
        ))}
      </select>

      <label>🚗 Seleccionar Vehículo:</label>
      <select
        value={vehiculoSeleccionado}
        onChange={(e) => setVehiculoSeleccionado(e.target.value)}
        disabled={!clienteSeleccionado}
      >
        <option value="">Seleccione un vehículo</option>
        {vehiculosCliente.map((vehiculo) => (
          <option key={vehiculo.placa} value={vehiculo.placa}>
            {vehiculo.marca} - {vehiculo.placa}
          </option>
        ))}
      </select>

      <table>
        <thead>
          <tr>
            <th>Parte</th>
            <th>Estado</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {partesVehiculo.map((parte, index) => (
            <tr key={index}>
              <td>{parte}</td>
              <td>
                <select
                  value={inspeccion[parte]}
                  onChange={(e) => handleSelectChange(parte, e.target.value)}
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="normal">✅ Normal</option>
                  <option value="reparar">🔧 Reparar</option>
                  <option value="cambiar">♻ Cambiar</option>
                  <option value="anormal">❌ Anormal</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Observaciones..."
                  value={observaciones[parte]}
                  onChange={(e) =>
                    setObservaciones({ ...observaciones, [parte]: e.target.value })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="firma-cliente">
        <label>
          <input
            type="checkbox"
            checked={firmaCliente}
            onChange={(e) => setFirmaCliente(e.target.checked)}
          />
          ✅ El cliente está de acuerdo con esta inspección.
        </label>
      </div>

      <button onClick={handleSiguiente} className="btn-siguiente">
        {isInspeccionCompleta ? "✅ Completar Inspección" : "➡ Siguiente (Incompleto)"}
      </button>
    </div>
  );
};

export default InspeccionVehiculo;