import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "./Estilos/Home.css";
import { authFetch } from "../services/authFetch";

const Home = () => {
  const [metrics, setMetrics] = useState({
    serviciosPendientes: 0,
    citasHoy: 0,
    ingresosMes: 0,
    serviciosEnProgreso: 0,
  });

  const [proximasCitas, setProximasCitas] = useState([]);
  const [notas, setNotas] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resCitas = await authFetch("http://localhost:8000/citas");
        const citas = await resCitas.json();

        const resFacturas = await authFetch("http://localhost:8000/facturas");
        const facturas = await resFacturas.json();

        const resDiagnosticos = await authFetch("http://localhost:8000/diagnosticos");
        const diagnosticos = await resDiagnosticos.json();

        const hoy = new Date().toISOString().split("T")[0];
        const citasHoy = citas.filter((c) => c.fecha === hoy);

        setMetrics({
          serviciosPendientes: citas.length,
          citasHoy: citasHoy.length,
          ingresosMes: facturas.reduce((acc, f) => acc + f.total, 0),
          serviciosEnProgreso: diagnosticos.length,
        });

        setProximasCitas(citasHoy);

        const notasGuardadas = localStorage.getItem("notasTaller");
        if (notasGuardadas) setNotas(notasGuardadas);
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
      }
    };

    cargarDatos();
  }, []);

  // 📊 Datos de gráficos (por ahora estáticos)
  const dataServicios = {
    labels: ["Cambio de Aceite", "Alineación", "Revisión", "Frenos"],
    datasets: [
      {
        label: "Servicios Realizados",
        data: [20, 15, 10, 8],
        backgroundColor: ["#4caf50", "#ffcc00", "#2196F3", "#f44336"],
      },
    ],
  };

  const dataIngresos = {
    labels: ["Enero", "Febrero", "Marzo", "Abril"],
    datasets: [
      {
        label: "Ingresos ($)",
        data: [2000, 1800, 2200, 2500],
        backgroundColor: ["#4caf50", "#ff9800", "#f44336", "#2196f3"],
      },
    ],
  };

  const handleNotasChange = (e) => {
    const nuevaNota = e.target.value;
    setNotas(nuevaNota);
    localStorage.setItem("notasTaller", nuevaNota);
  };

  return (
    <div className="home-container">
      <div className="contenido">
        <div className="header">
          <img src="/TallerTechLogo3.png" alt="Logo TallerTech" className="logo" />
          <h1>Bienvenido a TallerTech</h1>
          <p>📅 {new Date().toLocaleDateString()}</p>
        </div>

        <div className="estado-taller">
          <h3>📊 Estado del Taller</h3>
          <div className="metricas">
            <div className="card">⚙️ <strong>Servicios Pendientes:</strong> {metrics.serviciosPendientes}</div>
            <div className="card">📅 <strong>Citas Hoy:</strong> {metrics.citasHoy}</div>
            <div className="card">🛠 <strong>Servicios en Progreso:</strong> {metrics.serviciosEnProgreso}</div>
            <div className="card">💰 <strong>Ingresos Mes:</strong> ${metrics.ingresosMes}</div>
          </div>
        </div>

        <div className="graficos">
          <div className="grafico-container">
            <h3>📈 Servicios Realizados</h3>
            <Bar data={dataServicios} />
          </div>
          <div className="grafico-container">
            <h3>💰 Ingresos Mensuales</h3>
            <Pie data={dataIngresos} />
          </div>
        </div>

        <div className="citas-hoy">
          <h3>📅 Próximas Citas de Hoy</h3>
          {proximasCitas.length > 0 ? (
            <ul>
              {proximasCitas.map((cita, index) => (
                <li key={index}>
                  🕒 {cita.hora} - {cita.servicio || "Sin nombre"} (📞 {cita.telefono || "N/A"})
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay citas programadas para hoy.</p>
          )}
        </div>

        <div className="acciones-rapidas">
          <h3>🚀 Accesos Rápidos</h3>
          <div className="acciones-botones">
            <Link to="/diagnostico-vehiculo" className="btn">🔧 Diagnóstico</Link>
            <Link to="/historial-servicios" className="btn">📋 Historial de Servicios</Link>
            <Link to="/facturacion" className="btn">💳 Facturación</Link>
            <Link to="/reportes" className="btn">📊 Reportes</Link>
          </div>
        </div>

        <div className="notas-taller">
          <h3>📝 Notas del Taller</h3>
          <textarea
            value={notas}
            onChange={handleNotasChange}
            placeholder="Escribe aquí comentarios sobre el día de trabajo..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Home;
