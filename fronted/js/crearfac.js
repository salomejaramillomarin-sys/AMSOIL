const FACTURA_DRAFT_KEY = "amsoil_factura_draft";

let filasFactura = cargarBorrador();

function cargarBorrador() {
    try {
        const data = localStorage.getItem(FACTURA_DRAFT_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function guardarBorrador() {
    try {
        localStorage.setItem(FACTURA_DRAFT_KEY, JSON.stringify(filasFactura));
    } catch (e) {
        console.error("No se pudo guardar el borrador:", e);
    }
}

function renderTablaFactura() {
    const tbody = document.getElementById("cuerpo-factura");
    if (!tbody) return;
    tbody.innerHTML = "";

    filasFactura.forEach((item) => {
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
}

renderTablaFactura();

function actualizarFechaHora() {
    const el = document.getElementById("fecha-hora");
    if (!el) return;
    const ahora = new Date();
    el.textContent = new Intl.DateTimeFormat("es-DO", {
        timeZone: "America/Santo_Domingo",
        dateStyle: "medium",
        timeStyle: "medium"
    }).format(ahora);
}
setInterval(actualizarFechaHora, 1000);
actualizarFechaHora();

function abrirModal() {
    resetModal();
    document.getElementById("modal-producto")?.classList.add("is-open");
}

function cerrarModal() {
    document.getElementById("modal-producto")?.classList.remove("is-open");
    resetModal();
}

function resetModal() {
    document.getElementById("input-codigo").value = "";
    document.getElementById("input-cantidad").value = "";
    document.getElementById("msg-no-encontrado").classList.remove("is-visible");
}

function buscarProducto() {
    const input = document.getElementById("input-codigo");
    input.value = normalizeText(input.value);
    document.getElementById("msg-no-encontrado").classList.remove("is-visible");
}

async function procesarProducto() {
    await productosPromise;

    const codigo = normalizeText(document.getElementById("input-codigo")?.value);
    const producto = productos.find((p) => normalizeText(p.codigo) === codigo);

    if (!producto) {
        document.getElementById("msg-no-encontrado").classList.add("is-visible");
        return;
    }

    const cantidad = Number(document.getElementById("input-cantidad")?.value);

    if (!cantidad || cantidad <= 0) {
        alert("Ingresa una cantidad válida.");
        return;
    }

    const costoUnitario = Number(producto.costo).toFixed(2);
    const total = (cantidad * Number(producto.costo)).toFixed(2);

    filasFactura.push({
        codigo: producto.codigo,
        cantidad,
        reciclaje: producto.categoria === "cod-reciclaje" ? (cantidad * Number(producto.factor)) : "-",
        petroleo: producto.categoria === "petroleo" ? (cantidad * Number(producto.factor)) : "-",
        grasa: producto.categoria === "grasa" ? (cantidad * Number(producto.factor)) : "-",
        ivu: producto.categoria === "ivu" ? (cantidad * Number(producto.factor)) : "-",
        costo: costoUnitario,
        total
    });

    guardarBorrador();
    renderTablaFactura();
    cerrarModal();
}

async function guardarFactura() {
    if (filasFactura.length === 0) {
        alert("Agrega al menos un producto antes de guardar la factura.");
        return;
    }

    const lineas = filasFactura.map((fila) => ({ codigo: fila.codigo, cantidad: fila.cantidad }));

    try {
        await api.crearFactura(lineas);
    } catch (e) {
        alert(e.message);
        return;
    }

    filasFactura = [];
    guardarBorrador();
    renderTablaFactura();
    mostrarToastGuardado();
}

function mostrarToastGuardado() {
    const toast = document.getElementById("toast-guardado");
    if (!toast) return;
    toast.classList.add("is-visible");
    setTimeout(() => toast.classList.remove("is-visible"), 2500);
}