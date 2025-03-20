import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
    window.location.reload(); // Recargar para aplicar la protección de rutas
  };

  return (
    <nav className="navbar">
      {/* Logo y Nombre con enlace al Home */}
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <img src="/TallerTechLogo3.png" alt="TallerTech Logo" />
        <h1 className="navbar-title" style={{ cursor: "pointer" }}>
          TallerTech
        </h1>
      </div>

      {/* Botón para abrir/cerrar menú en móviles */}
      <button className="menu-toggle" onClick={() => setMenuAbierto(!menuAbierto)}>
        ☰
      </button>

      {/* Enlaces del menú */}
      <div className={`navbar-links ${menuAbierto ? "abierto" : ""}`}>
        <Link to="/">🏠 Inicio</Link>
        <Link to="/registro">📄 Registro</Link>
        <Link to="/consulta">🔍 Consulta</Link>
        <Link to="/clientes">👥 Clientes</Link>
        <Link to="/inspeccion-vehiculo">🛠 Inspección</Link>
        <Link to="/diagnostico-vehiculo">⚙ Diagnóstico</Link>
        <Link to="/perfil-taller">🏪 Perfil Taller</Link>
        <Link to="/facturacion">💰 Facturación</Link>
        <Link to="/agendar-cita">📅 Agendar Cita</Link>
      </div>

      {/* Botón de Cerrar Sesión */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
