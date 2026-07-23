import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import WaveFooter from "../components/WaveFooter";
import SuccessModal from "../components/SuccessModal";
import HistorialModal from "../components/HistorialModal";
import ProductosView from "../components/principal/ProductosView";
import HistorialView from "../components/principal/HistorialView";
import AgregarProductoView from "../components/principal/AgregarProductoView";
import EliminarProductoView from "../components/principal/EliminarProductoView";
import AjustesView from "../components/principal/AjustesView";
import { api, formatFechaHora } from "../api";
import { usePageStyles } from "../hooks/usePageStyles";

import principalCssUrl from "../styles/principal.css?url";
import productosCssUrl from "../styles/productos.css?url";
import agregarprodCssUrl from "../styles/agregarprod.css?url";
import crearfacCssUrl from "../styles/crearfac.css?url";
import eliminarCssUrl from "../styles/eliminar.css?url";
import ajustesCssUrl from "../styles/ajustes.css?url";

export default function Principal() {
    usePageStyles([
        principalCssUrl,
        productosCssUrl,
        agregarprodCssUrl,
        crearfacCssUrl,
        eliminarCssUrl,
        ajustesCssUrl,
    ]);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const view = searchParams.get("view") || "productos";

    const [productos, setProductos] = useState([]);
    const [facturas, setFacturas] = useState([]);
    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    useEffect(() => {
        cargarProductos();
    }, []);

    useEffect(() => {
        if (view === "historial") {
            cargarHistorial();
        }
    }, [view]);

    async function cargarProductos() {
        try {
            setProductos(await api.getProductos());
        } catch (e) {
            setProductos([]);
            console.error("No se pudieron cargar los productos:", e.message);
        }
    }

    async function cargarHistorial() {
        try {
            setFacturas(await api.getFacturas());
        } catch (e) {
            setFacturas([]);
            console.error("No se pudo cargar el historial:", e.message);
        }
    }

    async function handleProductoCreado() {
        await cargarProductos();
        navigate("/principal?view=productos");
        setSuccessModalOpen(true);
    }

    async function handleProductoEliminado() {
        await cargarProductos();
        navigate("/principal?view=productos");
    }

    async function handleFacturaEliminada(factura) {
        const confirmado = window.confirm(
            `¿Borrar la factura del ${formatFechaHora(factura.fecha_hora)}? Esta acción no se puede deshacer.`
        );
        if (!confirmado) return;

        try {
            await api.eliminarFactura(factura.id);
        } catch (e) {
            alert("No se pudo borrar la factura: " + e.message);
            return;
        }

        if (facturaSeleccionada?.id === factura.id) setFacturaSeleccionada(null);
        await cargarHistorial();
    }

    return (
        <>
            <Navbar active={view} />

            <main className="page-content">
                {view === "productos" && <ProductosView productos={productos} />}
                {view === "historial" && (
                    <HistorialView
                        facturas={facturas}
                        onSelect={setFacturaSeleccionada}
                        onDelete={handleFacturaEliminada}
                    />
                )}
                {view === "agregar" && <AgregarProductoView onCreated={handleProductoCreado} />}
                {view === "eliminar" && <EliminarProductoView onDeleted={handleProductoEliminado} />}
                {view === "ajustes" && <AjustesView />}
            </main>

            <HistorialModal factura={facturaSeleccionada} onClose={() => setFacturaSeleccionada(null)} />

            <WaveFooter />

            <SuccessModal
                open={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title="Producto guardado"
                message="El producto se agregó correctamente a la tabla."
            />
        </>
    );
}
