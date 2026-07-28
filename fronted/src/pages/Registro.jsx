import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, guardarSesion } from "../api";
import { usePageStyles } from "../hooks/usePageStyles";
import registroCssUrl from "../styles/registro.css?url";

export default function Registro() {
    usePageStyles([registroCssUrl]);
    const navigate = useNavigate();

    const [codigo, setCodigo] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        const codigoLimpio = codigo.trim();
        const passwordLimpio = password.trim();

        if (codigoLimpio === "" || passwordLimpio === "") {
            alert("Debe ingresar el código y la contraseña.");
            return;
        }

        try {
            const data = await api.login(codigoLimpio, passwordLimpio);
            guardarSesion(data.token, data.usuario);
            navigate("/principal");
        } catch (e) {
            alert(e.message);
        }
    }

    return (
        <>
            <nav className="navbar">
                <div className="logo">
                    <img src="/font/amsoil.png" alt="AMSOIL Logo" />
                    <div className="linea"></div>
                    <h2>Sistema de Gestión</h2>
                </div>

                <a href="#" className="help">
                    <i className="fa-regular fa-circle-question"></i>
                    Ayuda
                </a>
            </nav>

            <main>
                <div className="login-card">
                    <div className="icon">
                        <i className="fa-regular fa-user"></i>
                    </div>

                    <h1>Iniciar Sesión</h1>

                    <p>Ingrese su código de usuario y contraseña para acceder al sistema.</p>

                    <form id="loginForm" onSubmit={handleSubmit}>
                        <label>Código de usuario</label>

                        <div className="input-box">
                            <i className="fa-regular fa-user"></i>
                            <input
                                id="codigo"
                                type="text"
                                name="codigo"
                                placeholder="Ingrese su código"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                required
                            />
                        </div>

                        <label>Contraseña</label>

                        <div className="input-box">
                            <i className="fa-solid fa-lock"></i>
                            <input
                                id="password"
                                type={mostrarPassword ? "text" : "password"}
                                name="password"
                                placeholder="Ingrese su contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <i
                                className={`fa-regular ${mostrarPassword ? "fa-eye-slash" : "fa-eye"}`}
                                id="togglePassword"
                                style={{ cursor: "pointer" }}
                                onClick={() => setMostrarPassword((v) => !v)}
                            ></i>
                        </div>

                        <button type="submit">Acceder Inventario</button>
                    </form>
                </div>
            </main>

            <footer>© 2026 AMSOIL INC. Todos los derechos reservados.</footer>
        </>
    );
}
