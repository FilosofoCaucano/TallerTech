import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Estilos/Facturacion.css";
import { authFetch } from "../services/authFetch";

const Facturacion = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [vehiculosCliente, setVehiculosCliente] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");
  const [serviciosAuto, setServiciosAuto] = useState([]);
  const [serviciosManuales, setServiciosManuales] = useState([]);
  const [numFactura, setNumFactura] = useState("001");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  const serviciosDisponibles = [
    { nombre: "Cambio de Aceite", precio: 30 },
    { nombre: "Alineación y Balanceo", precio: 50 },
    { nombre: "Cambio de Filtros", precio: 40 },
    { nombre: "Revisión General", precio: 80 },
    { nombre: "Cambio de Batería", precio: 100 },
    { nombre: "Cambio de Pastillas de Freno", precio: 90 },
    { nombre: "Diagnóstico Computarizado", precio: 60 },
    { nombre: "Reparación de Suspensión", precio: 120 },
  ];

  useEffect(() => {
    const cargarClientes = async () => {
      const res = await authFetch("http://localhost:8000/clientes");
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
      }
    };

    cargarClientes();
    const siguienteNumero = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    setNumFactura(siguienteNumero);
  }, []);

  const seleccionarCliente = async (idCliente) => {
    setClienteSeleccionado(idCliente);
    setVehiculoSeleccionado("");
    const res = await authFetch(`http://localhost:8000/vehiculos/por-cliente/${idCliente}`);

    if (res.ok) {
      const data = await res.json();
      setVehiculosCliente(data);
    }
  };

  const seleccionarVehiculo = async (placa) => {
    setVehiculoSeleccionado(placa);
    const res = await authFetch(`http://localhost:8000/detalle-diagnostico-por-placa?placa=${placa}`);
    const diagnostico = {};
    if (res.ok) {
      const data = await res.json();
      data.forEach((item) => {
        diagnostico[item.componente] = item.valor;
      });
    }

    const serviciosDetectados = [];
    Object.entries(diagnostico).forEach(([componente, valor]) => {
      if (valor === "Falla") {
        serviciosDetectados.push({ nombre: `Reparación de ${componente}`, precio: 80 });
      } else if (valor === "Desgastados") {
        serviciosDetectados.push({ nombre: `Cambio de ${componente}`, precio: 50 });
      }
    });

    setServiciosAuto(serviciosDetectados);
    setServiciosManuales([]);
  };

  const agregarServicioPredefinido = (servicio) => {
    if (!serviciosManuales.some((s) => s.nombre === servicio.nombre)) {
      setServiciosManuales([...serviciosManuales, servicio]);
    }
  };

  const agregarServicioManual = () => {
    const nombre = prompt("Nombre del servicio:");
    const precio = parseFloat(prompt("Precio del servicio:"));
    if (nombre && !isNaN(precio)) {
      setServiciosManuales([...serviciosManuales, { nombre, precio }]);
    }
  };

  const eliminarServicio = (index) => {
    setServiciosManuales(serviciosManuales.filter((_, i) => i !== index));
  };

  const subtotal = [...serviciosAuto, ...serviciosManuales].reduce((sum, s) => sum + s.precio, 0);
  const impuestos = subtotal * 0.16;
  const total = subtotal + impuestos;

  const generarPDF = async () => {
  const clienteInfo = clientes.find((c) => c.id === clienteSeleccionado);
  const vehiculoInfo = vehiculosCliente.find((v) => v.placa === vehiculoSeleccionado);

  if (!clienteInfo || !vehiculoInfo) {
    alert("❌ No se encontró la información del cliente o vehículo.");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("TallerTech - Factura de Servicios", 14, 10);
  doc.setFontSize(12);
  doc.text(`Factura No: ${numFactura}`, 14, 20);
  doc.text(`Fecha: ${fecha}`, 14, 30);
  doc.text(`Cliente: ${clienteInfo.nombre}`, 14, 40);
  doc.text(`Vehículo: ${vehiculoInfo.marca} - ${vehiculoSeleccionado}`, 14, 50);

  // 👇 Aquí es clave capturar el resultado correctamente
  const result = autoTable(doc, {
    startY: 60,
    head: [["Servicio", "Precio ($)"]],
    body: [...serviciosAuto, ...serviciosManuales].map((s) => [s.nombre, `$${s.precio}`]),
    didDrawPage: () => {}, // Para evitar errores en algunos casos de rendering
  });

  const y = result && result.finalY ? result.finalY : 70;

  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 14, y + 10);
  doc.text(`Impuestos (16%): $${impuestos.toFixed(2)}`, 14, y + 20);
  doc.text(`Total: $${total.toFixed(2)}`, 14, y + 30);

  // Guardar en backend (ya lo tienes bien)
  const id_factura = `FAC-${numFactura}`;
  await authFetch("http://localhost:8000/facturas", {
    method: "POST",
    body: JSON.stringify({
      id_factura,
      id_cliente: clienteSeleccionado,
      placa: vehiculoSeleccionado,
      fecha,
      subtotal,
      impuestos,
      total,
    }),
  });

  for (const servicio of [...serviciosAuto, ...serviciosManuales]) {
    await authFetch("http://localhost:8000/detalle-factura", {
      method: "POST",
      body: JSON.stringify({
        id_detalle: crypto.randomUUID(),
        id_factura,
        id_servicio: "manual",
        descripcion: servicio.nombre,
        precio: servicio.precio,
      }),
    });
  }

  try {
    doc.save(`Factura_${numFactura}.pdf`);
    alert("✅ Factura generada y guardada.");
  } catch (error) {
    console.error("❌ Error al guardar PDF:", error);
    alert("❌ Ocurrió un error al guardar el PDF.");
  }
};


  return (
    <div className="facturacion-container">
      <h2>🧾 Facturación de Servicios</h2>
      <p>📄 Número de Factura: {numFactura}</p>

      <div className="seleccion">
        <label>👤 Cliente:</label>
        <select onChange={(e) => seleccionarCliente(e.target.value)}>
          <option value="">Seleccione Cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <label>🚗 Vehículo:</label>
        <select onChange={(e) => seleccionarVehiculo(e.target.value)} disabled={!clienteSeleccionado}>
          <option value="">Seleccione Vehículo</option>
          {vehiculosCliente.map((v) => (
            <option key={v.placa} value={v.placa}>{v.marca} - {v.placa}</option>
          ))}
        </select>
      </div>

      <h3>🔧 Servicios Disponibles</h3>
      <div className="servicios-disponibles">
        {serviciosDisponibles.map((s, i) => (
          <button key={i} onClick={() => agregarServicioPredefinido(s)}>
            ➕ {s.nombre} - ${s.precio}
          </button>
        ))}
      </div>

      <h3>🔧 Servicios Facturados</h3>
      <ul>
        {[...serviciosAuto, ...serviciosManuales].map((s, i) => (
          <li key={i}>
            {s.nombre} - ${s.precio}
            {i >= serviciosAuto.length && <button onClick={() => eliminarServicio(i)}>❌</button>}
          </li>
        ))}
      </ul>

      <button onClick={agregarServicioManual}>➕ Añadir Servicio Manual</button>
      <button onClick={() => {
        setServiciosManuales([]);
        setServiciosAuto([]);
      }}>🧹 Limpiar Servicios</button>

      <h3>💰 Total: ${total.toFixed(2)}</h3>
      <button onClick={generarPDF}>📄 Generar Factura</button>
    </div>
  );
};

export default Facturacion;