import { useState } from "react";
import { api, normalizeText } from "../../api";
import { useDialog } from "../DialogProvider";

export default function EliminarProductoView({ onDeleted }) {
    const [codigo, setCodigo] = useState("");
    const { alert, confirm } = useDialog();

    async function eliminarProducto() {
        const codigoLimpio = normalizeText(codigo);

        if (!codigoLimpio) {
            await alert("Ingresa el código del producto a eliminar.", {
                title: "Falta información",
                variant: "info",
            });
            return;
        }

        const confirmado = await confirm(
            `¿Seguro que deseas eliminar el producto "${codigoLimpio}"? Esta acción no se puede deshacer.`,
            {
                title: "Eliminar producto",
                variant: "peligro",
                confirmLabel: "Sí, eliminar",
            }
        );
        if (!confirmado) return;

        try {
            await api.eliminarProducto(codigoLimpio);
        } catch (e) {
            await alert("No existe un producto con ese código.", {
                title: "No encontrado",
                variant: "peligro",
            });
            return;
        }

        setCodigo("");
        await onDeleted();
        await alert("Producto eliminado correctamente.", {
            title: "Producto eliminado",
            variant: "exito",
        });
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