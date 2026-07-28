import { useEffect } from "react";

// Cada página original cargaba solo sus propias hojas de estilo (link tags
// distintos por archivo .html). Para que ese aislamiento se mantenga en la
// SPA -y las hojas no se mezclen entre páginas-, las inyectamos/retiramos
// dinámicamente al montar/desmontar cada página.
export function usePageStyles(urls) {
    useEffect(() => {
        const links = urls.map((url) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            document.head.appendChild(link);
            return link;
        });

        return () => {
            links.forEach((link) => document.head.removeChild(link));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
