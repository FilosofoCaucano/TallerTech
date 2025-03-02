import { Link } from "react-router-dom";

const Registro = () => {
  return (
    <div className="registro-page">
      <h1>📝 Registro</h1>
      <p>Seleccione una opción para registrar datos.</p>

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

        <Link to="/registro-consumo" className="registro-card">
          <div>
            <i className="fas fa-wrench"></i>
            <h3>Registrar Servicio</h3>
            <p>Registre un servicio realizado en el taller.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Registro;