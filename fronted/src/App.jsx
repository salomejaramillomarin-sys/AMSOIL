import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registro from "./pages/Registro";
import Principal from "./pages/Principal";
import CrearFactura from "./pages/CrearFactura";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Registro />} />
                <Route
                    path="/principal"
                    element={
                        <ProtectedRoute>
                            <Principal />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/crear-factura"
                    element={
                        <ProtectedRoute>
                            <CrearFactura />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
