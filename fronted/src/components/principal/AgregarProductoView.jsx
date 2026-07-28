import { useState } from "react";
import { api, normalizeText } from "../../api";
import { useDialog } from "../DialogProvider";

const CATEGORIAS = [
    { label: "Cod. para reciclaje", value: "cod-reciclaje" },
    { label: "Deriv. petroleo sin reciclaje", value: "petroleo" },
    { label: "Cod. grasa lubricante", value: "grasa" },
    { label: "IVU", value: "ivu" },
];

export default function AgregarProductoView({ onCreated }) {
    const [codigo, setCodigo] = useState("");
    const [costo, setCosto] = useState("");
    const [factor, setFactor] = useState("");
    const [categoria, setCategoria] = useState("");
    const { alert } = useDialog();

    async function guardarProducto() {
        const codigoLimpio = normalizeText(codigo);
        const costoLimpio = costo.trim();
        const factorLimpio = factor.trim();

        if (!codigoLimpio || !costoLimpio || !factorLimpio || !categoria) {
            await alert("Completa todos los campos y selecciona una categoría.", {
                title: "Falta información",
                variant: "info",
            });
            return;
        }

        try {
            await api.crearProducto({
                codigo: codigoLimpio,
                categoria,
                factor: factorLimpio,
                costo: costoLimpio,
            });
        } catch (e) {
            await alert(e.message, { title: "No se pudo guardar", variant: "peligro" });
            return;
        }

        setCodigo("");
        setCosto("");
        setFactor("");
        setCategoria("");

        await onCreated();
    }

    return (
        <section className="view-panel view-panel--form active">
            <div className="form-page">
                <div className="form-container">
                    <h2>Registrar Nuevo Producto</h2>

                    <label>Código:</label>
                    <input
                        type="text"
                        placeholder="Ej: AMSOIL-001"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                    />

                    <label>Categoría:</label>
                    <div className="category-options">
                        {CATEGORIAS.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                className={`cat-btn${categoria === c.value ? " selected" : ""}`}
                                onClick={() => setCategoria(c.value)}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    <label>Factor Multiplicativo:</label>
                    <input type="number" placeholder="10" value={factor} onChange={(e) => setFactor(e.target.value)} />

                    <label>Costo por Unidad:</label>
                    <input type="number" placeholder="0.00" value={costo} onChange={(e) => setCosto(e.target.value)} />

                    <button className="save-btn" type="button" onClick={guardarProducto}>
                        Guardar Producto
                    </button>
                </div>
            </div>
        </section>
    );
}