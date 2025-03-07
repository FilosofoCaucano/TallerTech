import { useState } from "react";
import "./RegistroCliente.css"; // Asegúrate de crear un archivo de estilos

const RegistroCliente = () => {
  const [cliente, setCliente] = useState({
    nombre: "",
    id: "",
    placa: "",
    marca: "Chevrolet", // Valor por defecto
  });

  const marcas = ["Chevrolet", "Tesla", "Toyota", "Ford", "Honda"];

  const handleChange = (e) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cliente.nombre || !cliente.id || !cliente.placa) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    console.log("Cliente registrado:", cliente);
    alert("Cliente registrado correctamente 🚗");

    setCliente({ nombre: "", id: "", placa: "", marca: "Chevrolet" }); // Limpiar formulario
  };

  return (
    <div className="registro-container">
      <h2>Registro de Cliente</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={cliente.nombre}
          onChange={handleChange}
          placeholder="Ingrese su nombre"
          required
        />

        <label>ID:</label>
        <input
          type="text"
          name="id"
          value={cliente.id}
          onChange={handleChange}
          placeholder="Ingrese su ID"
          required
        />

        <label>Placa del Carro:</label>
        <input
          type="text"
          name="placa"
          value={cliente.placa}
          onChange={handleChange}
          placeholder="Ingrese la placa del carro"
          required
        />

        <label>Marca del Carro:</label>
        <select name="marca" value={cliente.marca} onChange={handleChange}>
          {marcas.map((marca, index) => (
            <option key={index} value={marca}>
              {marca}
            </option>
          ))}
        </select>

        <button type="submit">Registrar Cliente</button>
        <button type="button" className="btn-siguiente">
          Siguiente ➡
        </button>
      </form>
    </div>
  );
};

export default RegistroCliente;