// src/services/authFetch.js

export const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("⚠️ No has iniciado sesión. Redirigiendo al login...");
        window.location.href = "/login";
        return;
    }

    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Si el token expiró o es inválido
        if (response.status === 401) {
            localStorage.removeItem("token");
            alert("⚠️ Sesión expirada. Por favor inicia sesión nuevamente.");
            window.location.href = "/login";
        }

        return response;
    } catch (error) {
        console.error("❌ Error en authFetch:", error);
        alert("❌ No se pudo conectar al servidor.");
        throw error;
    }
};
