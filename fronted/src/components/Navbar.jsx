import { Link } from "react-router-dom";
import {
    IconProductos,
    IconHistorial,
    IconCrearFactura,
    IconAgregar,
    IconEliminar,
    IconAjustes,
} from "./NavIcons";

const NAV_ITEMS = [
    { view: "productos", label: "Productos", icon: <IconProductos /> },
    { view: "historial", label: "Historial", icon: <IconHistorial /> },
    { view: "crearfac", label: "Crear Factura", icon: <IconCrearFactura />, path: "/crear-factura" },
    { view: "agregar", label: "Agregar Producto", icon: <IconAgregar /> },
    { view: "eliminar", label: "Eliminar Producto", icon: <IconEliminar /> },
    { view: "ajustes", label: "Ajustes", icon: <IconAjustes /> },
];

export default function Navbar({ active }) {
    return (
        <header className="navbar">
            <div className="navbar__logo">
                <img src="/font/amsoil.png" alt="AMSOIL Logo" />
            </div>

            <nav className="navbar__nav">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.view}
                        className={`nav-btn${active === item.view ? " nav-btn--active" : ""}`}
                        to={item.path ?? `/principal?view=${item.view}`}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>
        </header>
    );
}
