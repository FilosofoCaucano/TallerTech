import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Estilos/PerfilTaller.css";

const PerfilTaller = () => {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    logo: "",
    especializacion: "General",
    descripcion: "",
    servicios: [],
    horarioApertura: "08:00",
    horarioCierre: "18:00",
  });

  const [editando, setEditando] = useState(false);

  // 🔐 Verificación de login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ No has iniciado sesión.");
      navigate("/login");
    }
  }, [navigate]);

  // 📦 Cargar perfil desde localStorage
  useEffect(() => {
    const datosGuardados = JSON.parse(localStorage.getItem("perfilTaller"));
    if (datosGuardados) setPerfil(datosGuardados);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPerfil((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const especializaciones = [
    "General",
    "Frenos",
    "Alineación y Balanceo",
    "Llantas",
    "Diagnóstico Electrónico",
    "Cambio de Aceite",
    "Reparación de Motores",
  ];

  const serviciosDisponibles = {
    General: ["Frenos", "Cambio de Aceite", "Alineación", "Baterías", "Diagnóstico Electrónico"],
    Frenos: ["Revisión de Frenos", "Cambio de Pastillas", "Reparación de Freno ABS"],
    "Alineación y Balanceo": ["Alineación", "Balanceo de Ruedas", "Corrección de Caída"],
    Llantas: ["Cambio de Llantas", "Rotación de Llantas", "Ajuste de Presión"],
    "Diagnóstico Electrónico": ["Scanner Automotriz", "Chequeo de Sensores", "Codificación de Llaves"],
    "Cambio de Aceite": ["Cambio de Aceite", "Cambio de Filtros"],
    "Reparación de Motores": ["Diagnóstico de Motor", "Cambio de Piezas", "Ajuste de Válvulas"],
  };

  const handleEspecializacionChange = (e) => {
    const nuevaEspecializacion = e.target.value;
    setPerfil((prev) => ({
      ...prev,
      especializacion: nuevaEspecializacion,
      servicios: [],
    }));
  };

  const handleServiciosChange = (servicio) => {
    setPerfil((prev) => {
      const nuevosServicios = prev.servicios.includes(servicio)
        ? prev.servicios.filter((s) => s !== servicio)
        : [...prev.servicios, servicio];
      return { ...prev, servicios: nuevosServicios };
    });
  };

  const handleSave = () => {
    localStorage.setItem("perfilTaller", JSON.stringify(perfil));
    setEditando(false);
    alert("✅ Información guardada correctamente.");
  };

  return (
    <div className="perfil-container">
      <h2>🏠 Perfil del Taller</h2>

      <div className="perfil-content">
        {/* LOGO */}
        <div className="perfil-logo">
          {perfil.logo ? (
            <img src={perfil.logo} alt="Logo del Taller" />
          ) : (
            <p>📷 No hay logo</p>
          )}
          {editando && <input type="file" accept="image/*" onChange={handleImageUpload} />}
        </div>

        {/* INFORMACIÓN */}
        <div className="perfil-info">
          <label>Nombre del Taller:</label>
          {editando ? (
            <input type="text" name="nombre" placeholder="Ej: Mecánica Express" value={perfil.nombre} onChange={handleChange} />
          ) : (
            <p>{perfil.nombre || "No registrado"}</p>
          )}

          <label>Correo Electrónico:</label>
          {editando ? (
            <input type="email" name="correo" placeholder="taller@email.com" value={perfil.correo} onChange={handleChange} />
          ) : (
            <p>{perfil.correo || "No registrado"}</p>
          )}

          <label>Teléfono:</label>
          {editando ? (
            <input type="tel" name="telefono" placeholder="3001234567" value={perfil.telefono} onChange={handleChange} />
          ) : (
            <p>{perfil.telefono || "No registrado"}</p>
          )}

          <label>Dirección:</label>
          {editando ? (
            <input type="text" name="direccion" placeholder="Calle 123 #45-67" value={perfil.direccion} onChange={handleChange} />
          ) : (
            <p>{perfil.direccion || "No registrado"}</p>
          )}

          <label>Descripción del Taller:</label>
          {editando ? (
            <textarea
              name="descripcion"
              placeholder="Ej: Taller especializado en autos europeos..."
              value={perfil.descripcion}
              onChange={handleChange}
            ></textarea>
          ) : (
            <p>{perfil.descripcion || "No registrada"}</p>
          )}

          <label>Especialización:</label>
          {editando ? (
            <select value={perfil.especializacion} onChange={handleEspecializacionChange}>
              {especializaciones.map((esp) => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          ) : (
            <p>{perfil.especializacion}</p>
          )}

          {editando && (
            <div className="servicios-lista">
              <label>Servicios Ofrecidos:</label>
              {serviciosDisponibles[perfil.especializacion]?.map((servicio) => (
                <div key={servicio}>
                  <input
                    type="checkbox"
                    checked={perfil.servicios.includes(servicio)}
                    onChange={() => handleServiciosChange(servicio)}
                  />
                  <label>{servicio}</label>
                </div>
              ))}
            </div>
          )}

          <label>Horario de Atención:</label>
          {editando ? (
            <div className="horarios">
              <input type="time" name="horarioApertura" value={perfil.horarioApertura} onChange={handleChange} />
              <span> a </span>
              <input type="time" name="horarioCierre" value={perfil.horarioCierre} onChange={handleChange} />
            </div>
          ) : (
            <p>{perfil.horarioApertura} - {perfil.horarioCierre}</p>
          )}
        </div>
      </div>

      {/* BOTONES */}
      <div className="perfil-botones">
        {editando ? (
          <button className="guardar-btn" onClick={handleSave}>💾 Guardar</button>
        ) : (
          <button className="editar-btn" onClick={() => setEditando(true)}>✏️ Editar</button>
        )}
      </div>
    </div>
  );
};

export default PerfilTaller;
