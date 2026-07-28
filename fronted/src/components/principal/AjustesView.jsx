import { useEffect, useState } from "react";
import { api } from "../../api";

export default function AjustesView() {
    const [idioma, setIdioma] = useState("ES");
    const [pais, setPais] = useState("PR");

    useEffect(() => {
        (async () => {
            try {
                const ajustes = await api.getAjustes();
                if (ajustes.idioma) setIdioma(ajustes.idioma);
                if (ajustes.pais) setPais(ajustes.pais);
            } catch (e) {
                console.error("No se pudieron cargar los ajustes:", e.message);
            }
        })();
    }, []);

    async function guardarAjustes() {
        try {
            await api.guardarAjustes({ idioma, pais });
            alert("Ajustes guardados correctamente.");
        } catch (e) {
            alert(e.message);
        }
    }

    return (
        <section className="view-panel view-panel--form active">
            <div className="form-page">
                <div className="form-container">
                    <h2>Ajustes</h2>

                    <label>Idioma</label>
                    <select value={idioma} onChange={(e) => setIdioma(e.target.value)}>
                        <option value="EN">Ingles</option>
                        <option value="ES">Español</option>
                    </select>

                    <label>Pais</label>
                    <select value={pais} onChange={(e) => setPais(e.target.value)}>
                        <option value="CR">Costa Rica</option>
                        <option value="RD">Republica Dominicana</option>
                        <option value="PR">Puerto Rico</option>
                        <option value="US">Estados Unidos</option>
                    </select>

                    <div className="btn-ajustes">
                        <button className="btn-guardar-ajustes" type="button" onClick={guardarAjustes}>
                            Guardar Ajustes
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
