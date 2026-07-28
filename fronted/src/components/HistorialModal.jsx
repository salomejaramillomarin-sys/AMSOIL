import { useMemo } from "react";
import * as XLSX from "xlsx";
import { formatFechaHora } from "../api";

function calcularTotales(lineas) {
    const totales = { reciclaje: 0, petroleo: 0, grasa: 0, ivu: 0, general: 0 };

    lineas.forEach((item) => {
        const total = Number(item.total) || 0;
        totales.general += total;

        if (item.reciclaje != null) totales.reciclaje += total;
        if (item.petroleo != null) totales.petroleo += total;
        if (item.grasa != null) totales.grasa += total;
        if (item.ivu != null) totales.ivu += total;
    });

    return totales;
}

function sanitizeFileName(texto) {
    return (texto || "")
        .replace(/[,:]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export default function HistorialModal({ factura, onClose }) {
    const open = Boolean(factura);

    const totales = useMemo(() => {
        if (!factura) return { reciclaje: 0, petroleo: 0, grasa: 0, ivu: 0, general: 0 };
        return calcularTotales(factura.lineas);
    }, [factura]);

    function descargarExcel() {
        if (!factura) return;

        const encabezados = [
            "Código", "Cant.", "Cod. Reciclaje", "Deriv. Petróleo",
            "Cod. Grasa", "IVU", "Costo", "Total"
        ];

        const filas = factura.lineas.map((item) => [
            item.codigo_producto,
            item.cantidad,
            item.reciclaje ?? "-",
            item.petroleo ?? "-",
            item.grasa ?? "-",
            item.ivu ?? "-",
            item.costo,
            item.total
        ]);

        filas.push([
            "TOTAL",
            "",
            totales.reciclaje.toFixed(2),
            totales.petroleo.toFixed(2),
            totales.grasa.toFixed(2),
            totales.ivu.toFixed(2),
            "",
            totales.general.toFixed(2)
        ]);

        const datos = [encabezados, ...filas];
        const hoja = XLSX.utils.aoa_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Factura");

        const nombreArchivo = `factura ${sanitizeFileName(formatFechaHora(factura.fecha_hora))}.xlsx`;
        XLSX.writeFile(libro, nombreArchivo);
    }

    return (
        <div
            className={`modal${open ? " is-open" : ""}`}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-content modal-content--ancho">
                <div className="modal-historial-header">
                    <h2>{factura ? formatFechaHora(factura.fecha_hora) : "Factura"}</h2>
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
                        <tfoot>
                            <tr className="fila-total">
                                <td><strong>TOTAL</strong></td>
                                <td>-</td>
                                <td>{totales.reciclaje.toFixed(2)}</td>
                                <td>{totales.petroleo.toFixed(2)}</td>
                                <td>{totales.grasa.toFixed(2)}</td>
                                <td>{totales.ivu.toFixed(2)}</td>
                                <td>-</td>
                                <td><strong>{totales.general.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="modal-historial-acciones">
                    <button type="button" className="btn-descargar-excel" onClick={descargarExcel}>
                        ⬇ Descargar Excel
                    </button>
                </div>
            </div>
        </div>
    );
}