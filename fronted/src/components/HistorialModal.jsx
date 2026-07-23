import { formatFechaHora } from "../api";

export default function HistorialModal({ factura, onClose }) {
    const open = Boolean(factura);

    return (
        <div
            className={`modal${open ? " is-open" : ""}`}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-content modal-content--ancho">
                <div className="modal-historial-header">
                    <h2>
                        {factura
                            ? `${formatFechaHora(factura.fecha_hora)} — Atendió: ${factura.empleado || "-"}`
                            : "Factura"}
                    </h2>
                    <button type="button" className="btn-cerrar-x" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="factura-table-wrapper">
                    <table className="factura-table">
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
                            {factura?.lineas.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.codigo_producto}</td>
                                    <td>{item.cantidad}</td>
                                    <td>{item.reciclaje ?? "-"}</td>
                                    <td>{item.petroleo ?? "-"}</td>
                                    <td>{item.grasa ?? "-"}</td>
                                    <td>{item.ivu ?? "-"}</td>
                                    <td>{item.costo}</td>
                                    <td>{item.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
