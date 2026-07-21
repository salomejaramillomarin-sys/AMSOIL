function normalizeText(value) {
    return (value || "").toString().trim().toUpperCase();
}

function formatFechaHora(isoString) {
    return new Intl.DateTimeFormat("es-DO", {
        timeZone: "America/Santo_Domingo",
        dateStyle: "medium",
        timeStyle: "medium",
    }).format(new Date(isoString));
}

const formulario = document.getElementById("loginForm");

// --- Login (registro.html) ---
if (formulario) {
    formulario.addEventListener("submit", async function (event) {
        event.preventDefault();

        const codigo = document.getElementById("codigo")?.value.trim() || "";
        const password = document.getElementById("password")?.value.trim() || "";

        if (codigo === "" || password === "") {
            alert("Debe ingresar el código y la contraseña.");
            return;
        }

        try {
            const data = await api.login(codigo, password);
            guardarSesion(data.token, data.usuario);
            window.location.href = "principal.html";
        } catch (e) {
            alert(e.message);
        }
    });
} else if (!getToken()) {
    // Cualquier otra página requiere haber iniciado sesión.
    window.location.href = "registro.html";
}

const togglePasswordBtn = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.style.cursor = "pointer";
    togglePasswordBtn.addEventListener("click", () => {
        const isHidden = passwordInput.type === "password";
        passwordInput.type = isHidden ? "text" : "password";
        togglePasswordBtn.classList.toggle("fa-eye", !isHidden);
        togglePasswordBtn.classList.toggle("fa-eye-slash", isHidden);
    });
}

// --- Referencias del DOM compartidas por productos/historial/ajustes ---
const viewButtons = document.querySelectorAll(".nav-btn[data-view]");
const viewPanels = document.querySelectorAll(".view-panel");
const filterButtons = document.querySelectorAll(".filter-btn[data-filter]");
const productsSearch = document.getElementById("products-search");
const productsTableWrappers = document.querySelectorAll(".products-table-wrapper");
const successModal = document.getElementById("success-modal");
const closeModalBtn = document.getElementById("close-modal-btn");

const historialLista = document.getElementById("historial-lista");
const modalHistorial = document.getElementById("modal-historial");
const historialSearch = document.getElementById("historial-search");

const idiomaSelect = document.getElementById("idioma");
const paisSelect = document.getElementById("pais");

let currentFilter = "todos";
let productos = [];
let facturas = [];

// Promesa compartida: crearfac.js espera a que los productos estén cargados
// antes de dejar buscar/agregar productos a una factura.
let productosPromise = Promise.resolve([]);

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
        wrapper.classList.toggle(
            "active",
            wrapper.id === `panel-${filterName}` || (filterName === "todos" && wrapper.id === "panel-todos")
        );
    });

    renderProducts();
}

async function cargarProductos() {
    try {
        productos = await api.getProductos();
    } catch (e) {
        productos = [];
        console.error("No se pudieron cargar los productos:", e.message);
    }
    renderProducts();
    return productos;
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
        ivu: document.getElementById("tbody-ivu"),
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

if (viewButtons.length) {
    viewButtons.forEach((button) => {
        button.addEventListener("click", () => {
            showView(button.dataset.view);
            if (button.dataset.view === "historial") {
                cargarHistorial();
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

    // Revisa si venimos de otra página pidiendo una vista específica (ej: crearfac.html?view=historial)
    const paramsUrl = new URLSearchParams(window.location.search);
    const vistaInicial = paramsUrl.get("view");

    if (vistaInicial === "historial") {
        showView("historial");
        cargarHistorial();
    } else if (vistaInicial === "agregar") {
        showView("agregar");
    } else if (vistaInicial === "ajustes") {
        showView("ajustes");
    } else {
        showView("productos");
    }
}

// Los productos se necesitan en principal.html (tabla + formulario) y en
// crearfac.html (buscador del modal), pero no en la página de login.
if (!formulario) {
    productosPromise = cargarProductos();
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

async function guardarProducto() {
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
        IVU: "ivu",
    };

    const categoria = categoriaMap[categoriaSeleccionada] || "todos";

    try {
        await api.crearProducto({ codigo, categoria, factor, costo });
    } catch (e) {
        alert(e.message);
        return;
    }

    codigoInput.value = "";
    costoInput.value = "";
    factorInput.value = "";
    document.querySelectorAll(".cat-btn").forEach((boton) => boton.classList.remove("selected"));

    showView("productos");
    await cargarProductos();
    openSuccessModal();
}

async function eliminarProducto() {
    const codigoInput = document.getElementById("codigoEliminar");
    const codigo = normalizeText(codigoInput?.value);

    if (!codigo) {
        alert("Ingresa el código del producto a eliminar.");
        return;
    }

    try {
        await api.eliminarProducto(codigo);
    } catch (e) {
        alert("No existe un producto con ese código.");
        return;
    }

    codigoInput.value = "";
    await cargarProductos();
    showView("productos");
    alert("Producto eliminado correctamente.");
}

// --- Historial de facturas ---
async function cargarHistorial() {
    if (!historialLista) return;

    try {
        facturas = await api.getFacturas();
    } catch (e) {
        facturas = [];
        console.error("No se pudo cargar el historial:", e.message);
    }

    renderHistorial();
}

function renderHistorial() {
    if (!historialLista) return;
    const searchTerm = (historialSearch?.value || "").trim().toLowerCase();
    const filtradas = facturas.filter(
        (factura) => !searchTerm || formatFechaHora(factura.fecha_hora).toLowerCase().includes(searchTerm)
    );

    if (filtradas.length === 0) {
        historialLista.innerHTML = '<p class="historial-vacio">Aún no hay facturas guardadas.</p>';
        return;
    }

    historialLista.innerHTML = "";
    filtradas.forEach((factura) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "historial-card";
        card.innerHTML = `
            <span class="historial-card__fecha">${formatFechaHora(factura.fecha_hora)}</span>
            <span class="historial-card__empleado">${factura.empleado || "-"}</span>
            <span class="historial-card__cantidad">${factura.lineas.length} producto(s)</span>
        `;
        card.addEventListener("click", () => abrirFacturaHistorial(factura));
        historialLista.appendChild(card);
    });
}

function abrirFacturaHistorial(factura) {
    const titulo = document.getElementById("historial-modal-fecha");
    const tbody = document.getElementById("historial-modal-cuerpo");
    if (!titulo || !tbody || !modalHistorial) return;

    titulo.textContent = `${formatFechaHora(factura.fecha_hora)} — Atendió: ${factura.empleado || "-"}`;
    tbody.innerHTML = "";

    factura.lineas.forEach((item) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${item.codigo_producto}</td>
            <td>${item.cantidad}</td>
            <td>${item.reciclaje ?? "-"}</td>
            <td>${item.petroleo ?? "-"}</td>
            <td>${item.grasa ?? "-"}</td>
            <td>${item.ivu ?? "-"}</td>
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

if (historialSearch) {
    historialSearch.addEventListener("input", renderHistorial);
}

// --- Ajustes ---
async function cargarAjustes() {
    if (!idiomaSelect && !paisSelect) return;
    try {
        const ajustes = await api.getAjustes();
        if (idiomaSelect && ajustes.idioma) idiomaSelect.value = ajustes.idioma;
        if (paisSelect && ajustes.pais) paisSelect.value = ajustes.pais;
    } catch (e) {
        console.error("No se pudieron cargar los ajustes:", e.message);
    }
}

async function guardarAjustes() {
    const ajustes = {
        idioma: idiomaSelect?.value,
        pais: paisSelect?.value,
    };

    try {
        await api.guardarAjustes(ajustes);
        alert("Ajustes guardados correctamente.");
    } catch (e) {
        alert(e.message);
    }
}

if (idiomaSelect || paisSelect) {
    cargarAjustes();
}
