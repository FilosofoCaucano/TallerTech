import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Estilos/Login.css";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newUser, setNewUser] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");

  const navigate = useNavigate();

  const isValidLoginForm = () => {
    return usuario.trim() !== "" && password.trim() !== "";
  };

  const isValidRegisterForm = () => {
    return newUser.trim() !== "" && newPassword.trim() !== "" && confirmPassword.trim() !== "";
  };

  const doPasswordsMatch = () => {
    return newPassword === confirmPassword;
  };

  // Función para manejar el inicio de sesión
  const handleSubmitLogin = async (e) => {
    e.preventDefault();

    if (!isValidLoginForm()) {
      setError("❌ Por favor, completa todos los campos.");
      return;
    }

    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_usuario: usuario,
        contraseña: password,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Guarda el token en localStorage después del login exitoso
      localStorage.setItem("token", data.access_token); 
      navigate("/clientes");
    } else {
      setError("❌ Usuario o contraseña incorrectos");
    }
  };

  // Función para manejar el registro de usuario
  const handleSubmitRegister = async (e) => {
    e.preventDefault();

    if (!isValidRegisterForm()) {
      setRegisterError("❌ Por favor, completa todos los campos.");
      return;
    }

    if (!doPasswordsMatch()) {
      setRegisterError("❌ Las contraseñas no coinciden.");
      return;
    }

    const response = await fetch("http://localhost:8000/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_usuario: newUser,
        contraseña: newPassword,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setRegisterError("");
      setShowRegisterForm(false); 
      alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
    } else {
      setRegisterError("❌ Error al registrar el usuario.");
    }
  };

  return (
    <div className="login-container">
      <img src="/TallerTechLogo3.png" alt="Logo Taller Tech" className="logo" />
      <h1>Bienvenido a Taller Tech</h1>

      {!showRegisterForm ? (
        <>
          <h2>🔐 Iniciar Sesión</h2>
          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmitLogin}>
            <label>ID de Usuario:</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
            />

            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={!isValidLoginForm()}>
              Ingresar
            </button>
          </form>

          <button className="create-account-btn" onClick={() => setShowRegisterForm(true)}>
            Crear cuenta
          </button>
        </>
      ) : (
        <>
          <h2>📝 Crear cuenta</h2>
          {registerError && <p className="error-msg">{registerError}</p>}

          <form onSubmit={handleSubmitRegister}>
            <label>Nombre de Usuario:</label>
            <input
              type="text"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              required
            />

            <label>Contraseña:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label>Confirmar Contraseña:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={!isValidRegisterForm() || !doPasswordsMatch()}>
              Registrar
            </button>
          </form>

          <button className="back-to-login-btn" onClick={() => setShowRegisterForm(false)}>
            Volver al inicio de sesión
          </button>
        </>
      )}
    </div>
  );
};

export default Login;
