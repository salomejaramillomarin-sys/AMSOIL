import { useMemo, useState } from "react";
import { formatFechaHora } from "../../api";

export default function HistorialView({ facturas, onSelect }) {
    const [search, setSearch] = useState("");

    const filtradas = useMemo(() => {
        const term = search.trim().toLowerCase();
        return facturas.filter(
            (factura) => !term || formatFechaHora(factura.fecha_hora).toLowerCase().includes(term)
        );
    }, [facturas, search]);

    return (
        <section className="view-panel active">
            <div className="historial-header">
                <h2 className="historial-title">Historial de Facturas</h2>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Buscar por fecha (ej: 7 jul 2026)..."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="historial-lista">
                {filtradas.length === 0 ? (
                    <p className="historial-vacio">Aún no hay facturas guardadas.</p>
                ) : (
                    filtradas.map((factura) => (
                        <button
                            key={factura.id}
                            type="button"
                            className="historial-card"
                            onClick={() => onSelect(factura)}
                        >
                            <span className="historial-card__fecha">{formatFechaHora(factura.fecha_hora)}</span>
                            <span className="historial-card__empleado">{factura.empleado || "-"}</span>
                            <span className="historial-card__cantidad">{factura.lineas.length} producto(s)</span>
                        </button>
                    ))
                )}
            </div>
        </section>
    );
}
