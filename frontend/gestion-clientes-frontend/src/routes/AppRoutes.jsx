import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Registro from "../pages/Registro";
import Consulta from "../pages/Consulta";
import RegistroCliente from "../pages/RegistroCliente";
import Clientes from "../pages/Clientes";
import RegistroConsumo from "../pages/RegistroConsumo";
import InspeccionVehiculo from "../pages/InspeccionVehiculo";
import Navbar from "../components/Navbar";
import Reports from "../pages/Reports";
import HistorialServicios from "../pages/HistorialServicios";
import DiagnosticoVehiculo from "../pages/DiagnosticoVehiculo";
import Login from "../pages/Login";
import PerfilTaller from "../pages/PerfilTaller"; 
import Facturacion from "../pages/Facturacion"; 
import AgendarCita from "../pages/AgendarCita"; 
import RegistroVehiculo from "../pages/RegistroVehiculo"; 
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Router>
      <Navbar /> {/* Navbar siempre visible */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/consulta" element={<Consulta />} />
        <Route path="/registro-cliente" element={<RegistroCliente />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/registro-consumo" element={<RegistroConsumo />} />
        <Route path="/inspeccion-vehiculo" element={<InspeccionVehiculo />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/historial-servicios" element={<HistorialServicios />} />
        <Route path="/diagnostico-vehiculo" element={<DiagnosticoVehiculo />} />
        <Route path="/perfil-taller" element={<PerfilTaller />} />
        <Route path="/facturacion" element={<Facturacion />} />
        <Route path="/agendar-cita" element={<AgendarCita />} />
        <Route path="/registro-vehiculo" element={<RegistroVehiculo />} />
        
      </Routes>
    </Router>
  );
};

<Route
  path="/agendar-cita"
  element={
    <ProtectedRoute>
      <AgendarCita />
    </ProtectedRoute>
  }
/>

export default AppRoutes;
