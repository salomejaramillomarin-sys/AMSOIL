const formulario = document.getElementById("loginForm");

if (formulario) {
    formulario.addEventListener("submit", function(event) {
        event.preventDefault();

        const codigo = document.getElementById("codigo")?.value.trim();
        const password = document.getElementById("password")?.value.trim();

        if (codigo === "" || password === "") {
            alert("Debe ingresar el código y la contraseña.");
            return;
        }

        window.location.href = "principal.html";
    });
}






const STORAGE_KEY = "amsoil_productos";

function normalizeText(value) {
    return (value || "").toString().trim().toUpperCase();
}

function cargarProductosStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function guardarProductosStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
    } catch (e) {
        console.error("No se pudo guardar en localStorage:", e);
    }
}

const viewButtons = document.querySelectorAll(".nav-btn[data-view]");
const viewPanels = document.querySelectorAll(".view-panel");
const filterButtons = document.querySelectorAll(".filter-btn[data-filter]");
const productsSearch = document.getElementById("products-search");
const productsTableWrappers = document.querySelectorAll(".products-table-wrapper");
const successModal = document.getElementById("success-modal");
const closeModalBtn = document.getElementById("close-modal-btn");

let currentFilter = "todos";
let productos = cargarProductosStorage();

function showView(viewName) {
    viewPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === `view-${viewName}`);
    });

    viewButtons.forEach((button) => {
        button.classList.toggle("nav-btn--active", button.dataset.view === viewName);
    });
}

function showProductsFilter(filterName) {
    currentFilter = filterName;
    filterButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.filter === filterName);
    });

    productsTableWrappers.forEach((wrapper) => {
        wrapper.classList.toggle("active", wrapper.id === `panel-${filterName}` || (filterName === "todos" && wrapper.id === "panel-todos"));
    });

    renderProducts();
}

function renderProducts() {
    const searchTerm = normalizeText(productsSearch?.value);
    const filtered = productos.filter((producto) => {
        const matchesSearch = !searchTerm || normalizeText(producto.codigo).includes(searchTerm);
        if (currentFilter === "todos") return matchesSearch;
        return matchesSearch && producto.categoria === currentFilter;
    });

    const tbodyMap = {
        todos: document.getElementById("tbody-todos"),
        "cod-reciclaje": document.getElementById("tbody-cod-reciclaje"),
        petroleo: document.getElementById("tbody-petroleo"),
        grasa: document.getElementById("tbody-grasa"),
        ivu: document.getElementById("tbody-ivu")
    };

    Object.values(tbodyMap).forEach((tbody) => {
        if (tbody) tbody.innerHTML = "";
    });

    if (currentFilter === "todos") {
        const tbody = tbodyMap.todos;
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No hay productos registrados.</td></tr>';
            return;
        }

        filtered.forEach((producto) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${producto.codigo}</td>
                <td>${producto.costo}</td>
                <td>${producto.categoria === "cod-reciclaje" ? producto.factor : ""}</td>
                <td>${producto.categoria === "petroleo" ? producto.factor : ""}</td>
                <td>${producto.categoria === "grasa" ? producto.factor : ""}</td>
                <td>${producto.categoria === "ivu" ? producto.factor : ""}</td>
            `;
            tbody.appendChild(fila);
        });
        return;
    }

    const tbody = tbodyMap[currentFilter];
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">No hay productos registrados.</td></tr>';
        return;
    }

    filtered.forEach((producto) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${producto.codigo}</td>
            <td>${producto.costo}</td>
            <td>${producto.factor}</td>
        `;
        tbody.appendChild(fila);
    });
}

viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
        showView(button.dataset.view);
        if (button.dataset.view === "historial") {
            renderHistorial();
        }
    });
});

filterButtons.forEach((button) => {
    button.addEventListener("click", () => showProductsFilter(button.dataset.filter));
});

if (productsSearch) {
    productsSearch.addEventListener("input", () => {
        productsSearch.value = normalizeText(productsSearch.value);
        renderProducts();
    });
}

showProductsFilter("todos");

// Revisa si venimos de otra página pidiendo una vista específica (ej: crearfac.html?view=historial)
const paramsUrl = new URLSearchParams(window.location.search);
const vistaInicial = paramsUrl.get("view");

if (vistaInicial === "historial") {
    showView("historial");
    renderHistorial();
} else if (vistaInicial === "agregar") {
    showView("agregar");
} else if (vistaInicial === "ajustes") {
    showView("ajustes");
} else {
    showView("productos");
}

function openSuccessModal() {
    if (successModal) {
        successModal.classList.add("is-open");
        successModal.setAttribute("aria-hidden", "false");
    }
}

function closeSuccessModal() {
    if (successModal) {
        successModal.classList.remove("is-open");
        successModal.setAttribute("aria-hidden", "true");
    }
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeSuccessModal);
}

if (successModal) {
    successModal.addEventListener("click", (event) => {
        if (event.target === successModal) {
            closeSuccessModal();
        }
    });
}

function seleccionarCat(categoria) {
    const opciones = document.querySelectorAll(".cat-btn");
    opciones.forEach((boton) => boton.classList.remove("selected"));

    opciones.forEach((boton) => {
        if (boton.textContent.trim() === categoria) {
            boton.classList.add("selected");
        }
    });
}

function guardarProducto() {
    const codigoInput = document.getElementById("codigo");
    const costoInput = document.getElementById("costo");
    const factorInput = document.getElementById("factor");

    const codigo = normalizeText(codigoInput?.value);
    const costo = costoInput?.value.trim();
    const factor = factorInput?.value.trim();
    const categoriaSeleccionada = document.querySelector(".cat-btn.selected")?.textContent.trim();

    if (!codigo || !costo || !factor || !categoriaSeleccionada) {
        alert("Completa todos los campos y selecciona una categoría.");
        return;
    }

    const categoriaMap = {
        "Cod. para reciclaje": "cod-reciclaje",
        "Deriv. petroleo sin reciclaje": "petroleo",
        "Cod. grasa lubricante": "grasa",
        IVU: "ivu"
    };

    const categoria = categoriaMap[categoriaSeleccionada] || "todos";
    const costoNumero = Number(costo);
    const factorNumero = Number(factor);

    productos.push({
        codigo,
        costo: Number.isFinite(costoNumero) ? costoNumero.toFixed(2) : costo,
        factor: Number.isFinite(factorNumero) ? factorNumero.toString() : factor,
        categoria
    });

    guardarProductosStorage();

    codigoInput.value = "";
    costoInput.value = "";
    factorInput.value = "";
    document.querySelectorAll(".cat-btn").forEach((boton) => boton.classList.remove("selected"));

    showView("productos");
    renderProducts();
    openSuccessModal();
}

function eliminarProducto() {
    const codigoInput = document.getElementById("codigoEliminar");
    const codigo = normalizeText(codigoInput?.value);

    if (!codigo) {
        alert("Ingresa el código del producto a eliminar.");
        return;
    }

    const productoIndex = productos.findIndex((producto) => normalizeText(producto.codigo) === codigo);

    if (productoIndex === -1) {
        alert("No existe un producto con ese código.");
        return;
    }

    productos.splice(productoIndex, 1);
    guardarProductosStorage();

    codigoInput.value = "";
    renderProducts();
    showView("productos");
    alert("Producto eliminado correctamente.");
}

const HISTORIAL_KEY = "amsoil_facturas";
const historialLista = document.getElementById("historial-lista");
const modalHistorial = document.getElementById("modal-historial");

function cargarFacturasHistorial() {
    try {
        const data = localStorage.getItem(HISTORIAL_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function renderHistorial() {
    if (!historialLista) return;
    const facturas = cargarFacturasHistorial().sort((a, b) => b.timestamp - a.timestamp);

    if (facturas.length === 0) {
        historialLista.innerHTML = '<p class="historial-vacio">Aún no hay facturas guardadas.</p>';
        return;
    }

    historialLista.innerHTML = "";
    facturas.forEach((factura) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "historial-card";
        card.innerHTML = `
            <span class="historial-card__fecha">${factura.fechaHora}</span>
            <span class="historial-card__cantidad">${factura.filas.length} producto(s)</span>
        `;
        card.addEventListener("click", () => abrirFacturaHistorial(factura));
        historialLista.appendChild(card);
    });
}

function abrirFacturaHistorial(factura) {
    const titulo = document.getElementById("historial-modal-fecha");
    const tbody = document.getElementById("historial-modal-cuerpo");
    if (!titulo || !tbody || !modalHistorial) return;

    titulo.textContent = factura.fechaHora;
    tbody.innerHTML = "";

    factura.filas.forEach((item) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${item.codigo}</td>
            <td>${item.cantidad}</td>
            <td>${item.reciclaje}</td>
            <td>${item.petroleo}</td>
            <td>${item.grasa}</td>
            <td>${item.ivu}</td>
            <td>${item.costo}</td>
            <td>${item.total}</td>
        `;
        tbody.appendChild(fila);
    });

    modalHistorial.classList.add("is-open");
}

function cerrarFacturaModal() {
    modalHistorial?.classList.remove("is-open");
}

if (modalHistorial) {
    modalHistorial.addEventListener("click", (event) => {
        if (event.target === modalHistorial) cerrarFacturaModal();
    });
}