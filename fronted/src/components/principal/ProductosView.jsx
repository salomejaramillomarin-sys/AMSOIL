import { useMemo, useState } from "react";
import { normalizeText } from "../../api";

const FILTERS = [
    { key: "todos", label: "Todo" },
    { key: "cod-reciclaje", label: "Código para reciclaje" },
    { key: "petroleo", label: "Petróleo sin reciclaje" },
    { key: "grasa", label: "Grasa lubricante" },
    { key: "ivu", label: "IVU" },
];

const CATEGORY_HEADERS = {
    "cod-reciclaje": "COD. PARA RECICLAJE",
    petroleo: "DERIV. DE PETROLEO SIN RECICLAJE",
    grasa: "COD. GRASA LUBRICANTE",
    ivu: "IVU",
};

export default function ProductosView({ productos }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("todos");

    const filtrados = useMemo(() => {
        const term = normalizeText(search);
        return productos.filter((producto) => {
            const matches = !term || normalizeText(producto.codigo).includes(term);
            if (filter === "todos") return matches;
            return matches && producto.categoria === filter;
        });
    }, [productos, search, filter]);

    return (
        <section className="view-panel active">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Buscar por código de producto..."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(normalizeText(e.target.value))}
                />
            </div>

            <div className="filter-container">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        className={`filter-btn${filter === f.key ? " active" : ""}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {filter === "todos" ? (
                <div className="products-table-wrapper active">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>COSTO POR UND.</th>
                                <th>COD. PARA RECICLAJE</th>
                                <th>DERIV. DE PETROLEO SIN RECICLAJE</th>
                                <th>COD. GRASA LUBRICANTE</th>
                                <th>IVU</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>No hay productos registrados.</td>
                                </tr>
                            ) : (
                                filtrados.map((producto) => (
                                    <tr key={producto.codigo}>
                                        <td>{producto.codigo}</td>
                                        <td>{producto.costo}</td>
                                        <td>{producto.categoria === "cod-reciclaje" ? producto.factor : ""}</td>
                                        <td>{producto.categoria === "petroleo" ? producto.factor : ""}</td>
                                        <td>{producto.categoria === "grasa" ? producto.factor : ""}</td>
                                        <td>{producto.categoria === "ivu" ? producto.factor : ""}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="products-table-wrapper active">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>COSTO POR UND.</th>
                                <th>{CATEGORY_HEADERS[filter]}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={3}>No hay productos registrados.</td>
                                </tr>
                            ) : (
                                filtrados.map((producto) => (
                                    <tr key={producto.codigo}>
                                        <td>{producto.codigo}</td>
                                        <td>{producto.costo}</td>
                                        <td>{producto.factor}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
