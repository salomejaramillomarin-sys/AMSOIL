import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import WaveFooter from "../components/WaveFooter";
import { api, normalizeText } from "../api";
import { usePageStyles } from "../hooks/usePageStyles";

import principalCssUrl from "../styles/principal.css?url";
import crearfacCssUrl from "../styles/crearfac.css?url";

const FACTURA_DRAFT_KEY = "amsoil_factura_draft";
const EMPLEADO_DRAFT_KEY = "amsoil_factura_empleado_draft";

function cargarBorrador() {
    try {
        const data = localStorage.getItem(FACTURA_DRAFT_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

export default function CrearFactura() {
    usePageStyles([principalCssUrl, crearfacCssUrl]);

    const [productos, setProductos] = useState([]);
    const [filas, setFilas] = useState(cargarBorrador);
    const [empleado, setEmpleado] = useState(() => localStorage.getItem(EMPLEADO_DRAFT_KEY) || "");
    const [fechaHora, setFechaHora] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [codigoInput, setCodigoInput] = useState("");
    const [cantidadInput, setCantidadInput] = useState("");
    const [noEncontrado, setNoEncontrado] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setProductos(await api.getProductos());
            } catch (e) {
                setProductos([]);
                console.error("No se pudieron cargar los productos:", e.message);
            }
        })();
    }, []);

    useEffect(() => {
        function actualizar() {
            setFechaHora(
                new Intl.DateTimeFormat("es-DO", {
                    timeZone: "America/Santo_Domingo",
                    dateStyle: "medium",
                    timeStyle: "medium",
                }).format(new Date())
            );
        }
        actualizar();
        const id = setInterval(actualizar, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(FACTURA_DRAFT_KEY, JSON.stringify(filas));
        } catch (e) {
            console.error("No se pudo guardar el borrador:", e);
        }
    }, [filas]);

    function handleEmpleadoChange(value) {
        setEmpleado(value);
        localStorage.setItem(EMPLEADO_DRAFT_KEY, value);
    }

    function abrirModal() {
        setCodigoInput("");
        setCantidadInput("");
        setNoEncontrado(false);
        setModalOpen(true);
    }

    function cerrarModal() {
        setModalOpen(false);
        setCodigoInput("");
        setCantidadInput("");
        setNoEncontrado(false);
    }

    function procesarProducto() {
        const codigo = normalizeText(codigoInput);
        const producto = productos.find((p) => normalizeText(p.codigo) === codigo);

        if (!producto) {
            setNoEncontrado(true);
            return;
        }

        const cantidad = Number(cantidadInput);
        if (!cantidad || cantidad <= 0) {
            alert("Ingresa una cantidad válida.");
            return;
        }

        const costoUnitario = Number(producto.costo).toFixed(2);
        const total = (cantidad * Number(producto.costo)).toFixed(2);

        setFilas((prev) => [
            ...prev,
            {
                codigo: producto.codigo,
                cantidad,
                reciclaje: producto.categoria === "cod-reciclaje" ? cantidad * Number(producto.factor) : "-",
                petroleo: producto.categoria === "petroleo" ? cantidad * Number(producto.factor) : "-",
                grasa: producto.categoria === "grasa" ? cantidad * Number(producto.factor) : "-",
                ivu: producto.categoria === "ivu" ? cantidad * Number(producto.factor) : "-",
                costo: costoUnitario,
                total,
            },
        ]);

        cerrarModal();
    }

    async function guardarFactura() {
        const empleadoLimpio = empleado.trim();

        if (!empleadoLimpio) {
            alert("Ingresa el nombre del empleado que atendió.");
            return;
        }

        if (filas.length === 0) {
            alert("Agrega al menos un producto antes de guardar la factura.");
            return;
        }

        const lineas = filas.map((fila) => ({ codigo: fila.codigo, cantidad: fila.cantidad }));

        try {
            await api.crearFactura(lineas, empleadoLimpio);
        } catch (e) {
            alert(e.message);
            return;
        }

        setFilas([]);
        setEmpleado("");
        localStorage.removeItem(EMPLEADO_DRAFT_KEY);

        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
    }

    return (
        <>
            <Navbar active="crearfac" />

            <main className="page-content">
                <section className="factura-header">
                    <h2 className="factura-title">Crear Factura</h2>
                    <div id="fecha-hora">{fechaHora}</div>

                    <div className="factura-empleado">
                        <label htmlFor="input-empleado">Empleado que atendió:</label>
                        <input
                            type="text"
                            id="input-empleado"
                            placeholder="Nombre del empleado"
                            value={empleado}
                            onChange={(e) => handleEmpleadoChange(e.target.value)}
                        />
                    </div>

                    <button className="btn-agregar-prod" type="button" onClick={abrirModal}>
                        + Agregar Producto
                    </button>
                </section>

                <div className="factura-table-wrapper">
                    <table className="factura-table" id="tabla-factura">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Cant.</th>
                                <th>Cod. Reciclaje</th>
                                <th>Deriv. Petróleo</th>
                                <th>Cod. Grasa</th>
                                <th>IVU</th>
                                <th>Costo</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filas.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.codigo}</td>
                                    <td>{item.cantidad}</td>
                                    <td>{item.reciclaje}</td>
                                    <td>{item.petroleo}</td>
                                    <td>{item.grasa}</td>
                                    <td>{item.ivu}</td>
                                    <td>{item.costo}</td>
                                    <td>{item.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="factura-footer">
                    <button className="btn-guardar-factura" type="button" onClick={guardarFactura}>
                        Guardar Factura
                    </button>
                </div>
            </main>

            <div
                className={`modal${modalOpen ? " is-open" : ""}`}
                onClick={(event) => {
                    if (event.target === event.currentTarget) cerrarModal();
                }}
            >
                <div className="modal-content">
                    <h2>Agregar Producto</h2>

                    <label htmlFor="input-codigo">Código:</label>
                    <input
                        type="text"
                        id="input-codigo"
                        placeholder="Ej: ABC2D"
                        style={{ textTransform: "uppercase" }}
                        value={codigoInput}
                        onChange={(e) => {
                            setCodigoInput(normalizeText(e.target.value));
                            setNoEncontrado(false);
                        }}
                    />

                    <p className={`msg-error${noEncontrado ? " is-visible" : ""}`}>Producto no encontrado.</p>

                    <label htmlFor="input-cantidad">¿Cuántas unidades?</label>
                    <input
                        type="number"
                        id="input-cantidad"
                        placeholder="0"
                        min="1"
                        value={cantidadInput}
                        onChange={(e) => setCantidadInput(e.target.value)}
                    />

                    <div className="modal-actions">
                        <button type="button" className="btn-modal-agregar" onClick={procesarProducto}>
                            Agregar Producto
                        </button>
                        <button type="button" className="btn-modal-cancelar" onClick={cerrarModal}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            <div className={`toast${toastVisible ? " is-visible" : ""}`}>✓ Factura guardada en el Historial</div>

            <WaveFooter />
        </>
    );
}
