import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "./Estilos/AgendarCita.css";
import { authFetch } from "../services/authFetch";
import { v4 as uuidv4 } from "uuid";

const AgendarCita = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [vehiculosCliente, setVehiculosCliente] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");

  const [cita, setCita] = useState({
    fecha: "",
    hora: "",
    servicio: "",
    email: "",
    telefono: "",
  });

  const [citas, setCitas] = useState([]);

  const serviciosDisponibles = [
    "Cambio de Aceite",
    "Alineación y Balanceo",
    "Cambio de Filtros",
    "Revisión General",
    "Cambio de Batería",
  ];

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await authFetch("http://localhost:8000/clientes");
        const data = await res.json();
        setClientes(data);
      } catch (error) {
        console.error("❌ Error al cargar clientes:", error);
      }
    };

    cargarClientes();
  }, []);

  useEffect(() => {
    const cargarCitas = async () => {
      try {
        const res = await authFetch("http://localhost:8000/citas");
        const data = await res.json();
        setCitas(data);
      } catch (error) {
        console.error("❌ Error al cargar citas:", error);
      }
    };

    cargarCitas();
  }, []);

  // 🔁 Nuevo useEffect: carga vehículos del cliente desde backend
  useEffect(() => {
    const cargarVehiculos = async () => {
      if (!clienteSeleccionado) {
        setVehiculosCliente([]);
        return;
      }

      try {
        const res = await authFetch(`http://localhost:8000/vehiculos/por-cliente/${clienteSeleccionado}`);
        const data = await res.json();
        setVehiculosCliente(data);
      } catch (error) {
        console.error("❌ Error al cargar vehículos del cliente:", error);
      }
    };

    cargarVehiculos();
  }, [clienteSeleccionado]);

  const obtenerNombreCliente = (id) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.nombre : "Desconocido";
  };

  const handleChange = (e) => {
    setCita({ ...cita, [e.target.name]: e.target.value });
  };

  const enviarRecordatorio = ({ cliente, vehiculo, fecha, hora, servicio, email }) => {
  const templateParams = {
    name: obtenerNombreCliente(cliente),
    vehiculo: vehiculo,
    fecha: fecha,
    hora: hora,
    servicio: servicio,
    email: email, // necesario para que emailjs lo use en tu plantilla
  };

  emailjs
    .send("service_vcu3hss", "template_12smrqi", templateParams, "jc2KHEe6_bqatSo0Q")
    .then((response) => {
      console.log("✅ Email enviado con éxito:", response);
    })
    .catch((error) => {
      console.error("❌ Error al enviar email:", error);
    });
};


  const agendarCita = async (e) => {
    e.preventDefault();

    if (
      !clienteSeleccionado ||
      !vehiculoSeleccionado ||
      !cita.fecha ||
      !cita.hora ||
      !cita.servicio ||
      !cita.email ||
      !cita.telefono
    ) {
      alert("❌ Debes completar todos los campos.");
      return;
    }

    const idGenerado = uuidv4();

    const citaBackend = {
      id_cita: idGenerado,
      id_cliente: clienteSeleccionado,
      placa: vehiculoSeleccionado,
      fecha: cita.fecha,
      hora: cita.hora,
      id_servicio: cita.servicio,
    };

    try {
      const res = await authFetch("http://localhost:8000/citas", {
        method: "POST",
        body: JSON.stringify(citaBackend),
      });

      if (res.ok) {
        enviarRecordatorio({
          ...cita,
          cliente: clienteSeleccionado,
          vehiculo: vehiculoSeleccionado,
        });

        alert("✅ Cita agendada correctamente. Se ha enviado un recordatorio por correo.");

        setCita({ fecha: "", hora: "", servicio: "", email: "", telefono: "" });
        setVehiculoSeleccionado("");

        const nuevaLista = await (await authFetch("http://localhost:8000/citas")).json();
        setCitas(nuevaLista);
      } else {
        const data = await res.json();
        alert(`❌ Error: ${data.detail}`);
      }
    } catch (error) {
      console.error("❌ Error de red/agendamiento:", error);
      alert("❌ No se pudo conectar con el servidor.");
    }
  };

  const citasDelDia = citas.filter((c) => c.fecha === new Date().toISOString().split("T")[0]);

  return (
    <div className="citas-container">
      <h2>📅 Agendamiento de Citas</h2>

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
        {vehiculosCliente.length > 0 ? (
          vehiculosCliente.map((vehiculo, index) => (
            <option key={index} value={vehiculo.placa}>
              {vehiculo.marca} - {vehiculo.placa}
            </option>
          ))
        ) : (
          <option value="" disabled>
            No hay vehículos disponibles
          </option>
        )}
      </select>
      {clienteSeleccionado && vehiculosCliente.length === 0 && (
        <button onClick={() => alert("Por favor, agregue un vehículo al cliente.")}>Agregar Vehículo</button>
      )}

      <form onSubmit={agendarCita}>
        <label>📅 Fecha:</label>
        <input type="date" name="fecha" value={cita.fecha} onChange={handleChange} required />

        <label>⏰ Hora:</label>
        <input type="time" name="hora" value={cita.hora} onChange={handleChange} required />

        <label>🛠 Servicio:</label>
        <select name="servicio" value={cita.servicio} onChange={handleChange} required>
          <option value="">Selecciona un servicio</option>
          {serviciosDisponibles.map((servicio, index) => (
            <option key={index} value={servicio}>
              {servicio}
            </option>
          ))}
        </select>

        <label>📩 Correo Electrónico:</label>
        <input
          type="email"
          name="email"
          value={cita.email}
          onChange={handleChange}
          placeholder="Ingrese su correo"
          required
          pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
        />

        <label>📞 Teléfono:</label>
        <input
          type="tel"
          name="telefono"
          value={cita.telefono}
          onChange={handleChange}
          placeholder="Ingrese su teléfono"
          required
          pattern="[0-9]{7,}"
        />

        <button type="submit">📌 Agendar Cita</button>
      </form>

      <h3>📋 Citas Agendadas</h3>
      <ul>
        {citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).map((cita, index) => (
          <li key={index}>
            <strong>Cliente:</strong> {obtenerNombreCliente(cita.id_cliente)} <br />
<strong>Vehículo:</strong> {cita.placa} <br />

            🗓 {cita.fecha} ⏰ {cita.hora} - {cita.servicio} <br />
            📩 {cita.email} | 📞 {cita.telefono}
          </li>
        ))}
      </ul>

      <h3>📅 Citas de Hoy</h3>
      <ul>
        {citasDelDia.length > 0 ? (
          citasDelDia.map((cita, index) => (
            <li key={index}>
              <strong>Cliente:</strong> {obtenerNombreCliente(cita.id_cliente)} <br />
<strong>Vehículo:</strong> {cita.placa} <br />

              🕒 {cita.hora} - {cita.servicio}
            </li>
          ))
        ) : (
          <li>No hay citas programadas para hoy.</li>
        )}
      </ul>
    </div>
  );
};

export default AgendarCita;
