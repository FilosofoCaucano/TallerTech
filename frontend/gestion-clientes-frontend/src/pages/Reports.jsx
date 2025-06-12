import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { authFetch } from "../services/authFetch";
import "./Estilos/Reports.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  const [dataServicios, setDataServicios] = useState(null);
  const [dataIngresos, setDataIngresos] = useState(null);
  const [notas, setNotas] = useState("");
  const [rangoFechas, setRangoFechas] = useState({ inicio: "", fin: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authFetch("http://localhost:8000/consumos");
        const consumos = await res.json();

        const filtrarPorFecha = (datos) => {
          if (!rangoFechas.inicio || !rangoFechas.fin) return datos;
          return datos.filter((d) => {
            const fecha = new Date(d.fecha);
            return fecha >= new Date(rangoFechas.inicio) && fecha <= new Date(rangoFechas.fin);
          });
        };

        const filtrados = filtrarPorFecha(consumos);

        // Servicios realizados (cantidad por servicio)
        const servicios = {};
        filtrados.forEach((c) => {
          servicios[c.servicio] = (servicios[c.servicio] || 0) + 1;
        });

        setDataServicios({
          labels: Object.keys(servicios),
          datasets: [
            {
              label: "Servicios Realizados",
              data: Object.values(servicios),
              backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"],
            },
          ],
        });

        // Ingresos agrupados por mes
        const ingresos = {};
        filtrados.forEach((c) => {
          const fecha = new Date(c.fecha);
          const mes = fecha.toLocaleString("default", { month: "long", year: "numeric" });
          ingresos[mes] = (ingresos[mes] || 0) + c.costo;
        });

        setDataIngresos({
          labels: Object.keys(ingresos),
          datasets: [
            {
              label: "Ingresos por Mes ($)",
              data: Object.values(ingresos),
              backgroundColor: ["#4caf50", "#ff9800", "#f44336", "#2196f3"],
            },
          ],
        });

        const notasGuardadas = localStorage.getItem("notasTaller");
        if (notasGuardadas) setNotas(notasGuardadas);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    fetchData();
  }, [rangoFechas]);

  useEffect(() => {
    localStorage.setItem("notasTaller", notas);
  }, [notas]);

  const handleFechaChange = (e) => {
    setRangoFechas({ ...rangoFechas, [e.target.name]: e.target.value });
  };

  const exportarPDF = () => {
    const input = document.querySelector(".reports-container");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("reporte-tallertech.pdf");
    });
  };

  return (
    <div className="reports-container">
      <h2>📊 Reportes del Taller</h2>

      <div className="filtro-fechas">
        <label>Desde:</label>
        <input type="date" name="inicio" value={rangoFechas.inicio} onChange={handleFechaChange} />
        <label>Hasta:</label>
        <input type="date" name="fin" value={rangoFechas.fin} onChange={handleFechaChange} />
      </div>

      <button className="export-button" onClick={exportarPDF}>📄 Exportar Reporte</button>

      <div className="charts">
        <div className="chart">
          <h3>🔧 Servicios Realizados</h3>
          {dataServicios ? <Bar data={dataServicios} /> : <p>No hay datos</p>}
        </div>

        <div className="chart">
          <h3>💰 Ingresos Mensuales</h3>
          {dataIngresos ? <Pie data={dataIngresos} /> : <p>No hay datos</p>}
        </div>
      </div>

      <div className="notas-container">
        <h3>📝 Notas del Taller</h3>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Observaciones o comentarios del taller..."
        />
      </div>
    </div>
  );
};

export default Reports;
