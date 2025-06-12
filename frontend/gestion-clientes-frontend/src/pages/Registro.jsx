import { Link } from "react-router-dom";
import "./Estilos/Registro.css";

const Registro = () => {
  return (
    <div className="registro-page">
      <h1 className="registro-titulo">📝 Registro y Consultas</h1>
      <p className="registro-subtitulo">Seleccione una opción para registrar o consultar datos.</p>

      {/* 📂 Sección de Registros */}
      <div className="registro-section">
        <h2>📂 Registros</h2>
        <div className="registro-options">
          
          <Link to="/registro-cliente" className="registro-card">
            <div>
              <i className="fas fa-user-plus"></i>
              <h3>Registrar Cliente</h3>
              <p>Agregue información de un nuevo cliente.</p>
            </div>
          </Link>

          <Link to="/registro-vehiculo" className="registro-card">
            <div>
              <i className="fas fa-car"></i>
              <h3>Registrar Vehículo</h3>
              <p>Registre un vehículo asociado a un cliente.</p>
            </div>
          </Link>

          
        </div>
      </div>

      {/* 🔍 Sección de Consultas */}
      <div className="registro-section">
        <h2>🔍 Consultas</h2>
        <div className="registro-options">
          <Link to="/historial-servicios" className="registro-card">
            <div>
              <i className="fas fa-file-alt"></i>
              <h3>Consulta de Vehiculos</h3>
              <p>Consulte el historial de vehiculos organizados y creados.</p>
            </div>
          </Link>

          <Link to="/clientes" className="registro-card">
            <div>
              <i className="fas fa-users"></i>
              <h3>Consulta de Clientes</h3>
              <p>Gestione la información de los clientes.</p>
            </div>
          </Link>

          <Link to="/consulta" className="registro-card">
            <div>
              <i className="fas fa-list"></i>
              <h3>Consulta de Consumos</h3>
              <p>Ver y administrar los servicios realizados.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 📊 Sección de Reportes */}
      <div className="registro-section">
        <h2>📊 Reportes</h2>
        <div className="registro-options">
          <Link to="/reportes" className="registro-card reportes">
            <div>
              <i className="fas fa-chart-bar"></i>
              <h3>Reportes</h3>
              <p>Vea estadísticas y métricas del taller.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Registro;
