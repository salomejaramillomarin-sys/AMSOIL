const API_BASE_URL = "http://127.0.0.1:8000/api";

const TOKEN_KEY = "amsoil_token";
const USUARIO_KEY = "amsoil_usuario";

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function guardarSesion(token, usuario) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

function obtenerUsuarioSesion() {
    try {
        const data = localStorage.getItem(USUARIO_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function cerrarSesion() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
}

async function apiRequest(path, { method = "GET", body } = {}) {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Token ${token}`;

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (e) {
        throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
    }

    if (response.status === 401) {
        cerrarSesion();
        if (!window.location.pathname.endsWith("registro.html")) {
            window.location.href = "registro.html";
        }
        throw new Error("Sesión expirada. Inicia sesión de nuevo.");
    }

    if (response.status === 204) return null;

    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }

    if (!response.ok) {
        const mensaje =
            (data && (data.detail || data.error)) ||
            (data && Object.values(data).flat().join(" ")) ||
            "Ocurrió un error al comunicarse con el servidor.";
        throw new Error(mensaje);
    }

    return data;
}

const api = {
    login: (codigo, password) => apiRequest("/auth/login/", { method: "POST", body: { codigo, password } }),
    getProductos: () => apiRequest("/productos/"),
    crearProducto: (producto) => apiRequest("/productos/", { method: "POST", body: producto }),
    eliminarProducto: (codigo) => apiRequest(`/productos/${encodeURIComponent(codigo)}/`, { method: "DELETE" }),
    getFacturas: () => apiRequest("/facturas/"),
    crearFactura: (lineas, empleado) => apiRequest("/facturas/", { method: "POST", body: { lineas, empleado } }),
    getAjustes: () => apiRequest("/ajustes/"),
    guardarAjustes: (ajustes) => apiRequest("/ajustes/", { method: "PUT", body: ajustes }),
};
