import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate, useLocation } from "react-router-dom";
import "./Estilos/DiagnosticoVehiculo.css";
import { authFetch } from "../services/authFetch";
import { v4 as uuidv4 } from "uuid";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DiagnosticoVehiculo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clienteSeleccionado, vehiculoSeleccionado, inspeccionActual } = location.state || {};

  const [inspeccionPrev, setInspeccionPrev] = useState(null);
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);

  const [estado, setEstado] = useState({
    motor: "Normal",
    bateria: "Normal",
    frenos: "Normal",
    presionNeumaticos: {
      frontalIzq: "Normal",
      frontalDer: "Normal",
      traseraIzq: "Normal",
      traseraDer: "Normal",
    },
    balanceo: {
      frontalIzq: 0.5,
      frontalDer: -0.3,
      traseraIzq: 0.7,
      traseraDer: -0.4,
    },
  });

  useEffect(() => {
    if (!vehiculoSeleccionado) {
      console.error("No se ha seleccionado ningún vehículo.");
      return;
    }

    if (inspeccionActual) {
      setInspeccionPrev(inspeccionActual);
    } else {
      setMostrarAdvertencia(true);
    }
  }, [vehiculoSeleccionado, inspeccionActual]);

  const handleChange = (componente, valor) => {
    setEstado((prev) => ({
      ...prev,
      [componente]: valor,
    }));
  };

  const handleNeumaticoChange = (posicion, valor) => {
    setEstado((prev) => ({
      ...prev,
      presionNeumaticos: {
        ...prev.presionNeumaticos,
        [posicion]: valor,
      },
    }));
  };

  const handleBalanceoChange = (posicion, valor) => {
    setEstado((prev) => ({
      ...prev,
      balanceo: {
        ...prev.balanceo,
        [posicion]: parseFloat(valor),
      },
    }));
  };

  const dataPresion = {
    labels: ["Frontal Izq.", "Frontal Der.", "Trasera Izq.", "Trasera Der."],
    datasets: [
      {
        label: "Estado",
        data: Object.values(estado.presionNeumaticos).map((p) => (p === "Baja" ? 25 : 30)),
        backgroundColor: Object.values(estado.presionNeumaticos).map((p) =>
          p === "Baja" ? "#f44336" : "#4caf50"
        ),
      },
    ],
  };

  const dataBalanceoBarras = {
    labels: ["Frontal Izq.", "Frontal Der.", "Trasera Izq.", "Trasera Der."],
    datasets: [
      {
        label: "Ángulo de Caída (°)",
        data: Object.values(estado.balanceo),
        backgroundColor: Object.values(estado.balanceo).map((angulo) =>
          angulo > 0 ? "#4caf50" : "#f44336"
        ),
        borderColor: "rgba(0, 0, 0, 0.2)",
        borderWidth: 1,
      },
    ],
  };

  const getRecomendaciones = () => {
    const recomendaciones = [];

    Object.entries(estado.presionNeumaticos).forEach(([posicion, estadoNeumatico]) => {
      if (estadoNeumatico === "Baja") {
        recomendaciones.push(
          `Se recomienda inflar el neumático ${posicion.replace(/([A-Z])/g, " $1")} a 30 PSI.`
        );
      }
    });

    Object.entries(estado.balanceo).forEach(([posicion, angulo]) => {
      if (Math.abs(angulo) > 1.0) {
        recomendaciones.push(
          `Se recomienda realizar una alineación en las ruedas ${posicion.replace(
            /([A-Z])/g,
            " $1"
          )}.`
        );
      }
    });

    if (estado.motor === "Falla") recomendaciones.push("Se recomienda revisar el motor.");
    if (estado.bateria === "Baja") recomendaciones.push("Cargar o reemplazar batería.");
    if (estado.frenos === "Desgastados")
      recomendaciones.push("Inspeccionar y cambiar pastillas de freno.");

    if (inspeccionPrev?.["Frenos"] === "cambiar" && estado.frenos === "Normal") {
      recomendaciones.push("⚠️ En la inspección se recomendó cambiar frenos. Verifique el diagnóstico.");
    }

    return recomendaciones;
  };

  const guardarDiagnostico = async () => {
  const id_diagnostico = uuidv4();
  const detalles = [
    {
      id_detalle: uuidv4(),
      id_diagnostico, // ⬅️ Campo añadido
      componente: "motor",
      valor: estado.motor === "Falla" ? 1 : 0,
    },
    {
      id_detalle: uuidv4(),
      id_diagnostico, // ⬅️ Campo añadido
      componente: "bateria",
      valor: estado.bateria === "Baja" ? 1 : 0,
    },
    {
      id_detalle: uuidv4(),
      id_diagnostico, // ⬅️ Campo añadido
      componente: "frenos",
      valor: estado.frenos === "Desgastados" ? 1 : 0,
    },
    ...Object.entries(estado.presionNeumaticos).map(([posicion, estadoPresion]) => ({
      id_detalle: uuidv4(),
      id_diagnostico, // ⬅️ Campo añadido
      componente: `presion_${posicion}`,
      valor: estadoPresion === "Baja" ? 25 : 30,
    })),
    ...Object.entries(estado.balanceo).map(([posicion, valor]) => ({
      id_detalle: uuidv4(),
      id_diagnostico, // ⬅️ Campo añadido
      componente: `alineacion_${posicion}`,
      valor: parseFloat(valor),
    })),
  ];

  const payload = {
    id_diagnostico,
    placa: vehiculoSeleccionado?.placa || vehiculoSeleccionado,
    fecha: new Date().toISOString().split("T")[0],
    detalles,
  };

  console.log("Payload enviado:", payload); // Debugging

  try {
    const res = await authFetch("http://localhost:8000/diagnosticos/completo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log("✅ Diagnóstico guardado con éxito");
    } else {
      const data = await res.json();
      console.error("❌ Detalle del error:", data);

      if (Array.isArray(data.detail)) {
        const mensajes = data.detail.map((d, i) => `• ${d.msg || JSON.stringify(d)}`).join("\n");
        alert("❌ Error al guardar:\n" + mensajes);
      } else {
        alert("❌ Error al guardar: " + (data.detail || "Error desconocido"));
      }
    }
  } catch (error) {
    console.error("❌ Conexión fallida:", error);
    alert("❌ No se pudo guardar el diagnóstico.");
  }
};


  const handleSiguiente = async () => {
    const recomendaciones = getRecomendaciones();
    if (recomendaciones.length > 0) {
      const confirmacion = window.confirm(
        "Hay problemas críticos detectados. ¿Desea continuar?"
      );
      if (!confirmacion) return;
    }

    await guardarDiagnostico();
    navigate("/facturacion");
  };

  return (
    <div className="diagnostico-container">
      <h2>🛠 Diagnóstico del Vehículo</h2>

      {mostrarAdvertencia && (
        <div className="advertencia">
          <p>No se encontró ninguna inspección previa para este vehículo.</p>
        </div>
      )}

      {inspeccionPrev && (
        <div className="inspeccion-previa">
          <h3>📋 Inspección Previa</h3>
          <ul>
            {Object.entries(inspeccionPrev).map(([parte, estado], index) => (
              <li key={index}>
                <span className={`estado-valor ${estado.toLowerCase()}`}>
                  {estado === "normal"
                    ? "✅"
                    : estado === "reparar"
                    ? "🔧"
                    : estado === "cambiar"
                    ? "♻"
                    : "❌"}{" "}
                  {parte}: {estado}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ... resto igual (selectores y gráficos) */}

      <div className="recomendaciones">
        <h3>💡 Recomendaciones</h3>
        <ul>
          {getRecomendaciones().length > 0 ? (
            getRecomendaciones().map((recomendacion, index) => (
              <li key={index}>{recomendacion}</li>
            ))
          ) : (
            <li>No se encontraron problemas críticos.</li>
          )}
        </ul>
      </div>

      <button onClick={handleSiguiente} className="btn-siguiente">
        Siguiente ➡
      </button>
    </div>
  );
};

export default DiagnosticoVehiculo;