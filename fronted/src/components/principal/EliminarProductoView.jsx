import { useState } from "react";
import { api, normalizeText } from "../../api";

export default function EliminarProductoView({ onDeleted }) {
    const [codigo, setCodigo] = useState("");

    async function eliminarProducto() {
        const codigoLimpio = normalizeText(codigo);

        if (!codigoLimpio) {
            alert("Ingresa el código del producto a eliminar.");
            return;
        }

        try {
            await api.eliminarProducto(codigoLimpio);
        } catch (e) {
            alert("No existe un producto con ese código.");
            return;
        }

        setCodigo("");
        await onDeleted();
        alert("Producto eliminado correctamente.");
    }

    return (
        <section className="view-panel view-panel--form active">
            <div className="form-page">
                <div className="form-container">
                    <h2>Eliminar Producto</h2>

                    <label>Código del Producto a Eliminar:</label>
                    <input
                        type="text"
                        placeholder="Ej: AMSOIL-001"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                    />

                    <button className="delete-btn" type="button" onClick={eliminarProducto}>
                        Eliminar Producto
                    </button>
                </div>
            </div>
        </section>
    );
}
