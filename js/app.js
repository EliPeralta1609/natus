// CARRITO
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ACTUALIZAR CONTADOR DE CARRITO
function actualizarContadorCarrito() {
    const contador = carrito.reduce((total, item) => total + item.cantidad, 0);
    $('#carrito-contador').text(contador);
}

// GUARDAR CARRITO EN LOCALSTORAGE
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// AGREGAR PRODUCTO AL CARRITO
function agregarAlCarrito(producto) {
    const productoExistente = carrito.find(item => item.id === producto.id);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    guardarCarrito();
    actualizarContadorCarrito();
    mostrarNotificacion('Producto agregado al carrito');
}

// MOSTRAR NOTIFICACIÓN
function mostrarNotificacion(mensaje) {
    const notificacion = $(`
        <div class="notification-toast">
            <i class="fa-solid fa-check"></i> ${mensaje}
        </div>
    `);

    $('body').append(notificacion);
    notificacion.fadeIn();

    setTimeout(() => {
        notificacion.fadeOut(() => notificacion.remove());
    }, 2000);
}

// ABRIR MODAL DE DETALLES
function abrirModalProducto(producto) {
    $('#modalProductoNombre').text(producto.nombre);
    $('#modalProductoDescripcion').text(producto.descripcion || producto.nombreCorto);
    $('#modalProductoPrecio').text(producto.precio);
    $('#modalProductoTags').html(
        producto.tags.map(tag => `<span class="badge bg-light text-dark">${tag}</span>`).join('')
    );

    $('.btn-agregar-modal').off('click').on('click', function () {
        agregarAlCarrito(producto);
        $('#modalProducto').modal('hide');
    });

    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

// ABRIR MODAL DE CARRITO
function abrirModalCarrito() {
    const carritoHTML = carrito.length > 0 ? `
        <div class="carrito-items">
            ${carrito.map(item => `
                <div class="carrito-item">
                    <div class="item-info">
                        <h6>${item.nombre}</h6>
                        <p class="text-muted">Cantidad: <strong>${item.cantidad}</strong></p>
                    </div>
                    <div class="item-precio">
                        <p>$${(parseInt(item.precio.replace(/[^0-9]/g, '')) * item.cantidad).toLocaleString('es-CO')}</p>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito('${item.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `).join('')}
        </div>
        <hr>
        <div class="carrito-total">
            <h5>Total: $${calcularTotalCarrito()}</h5>
        </div>
    ` : '<p class="text-center text-muted">Tu carrito está vacío</p>';

    $('#carritoContenido').html(carritoHTML);
    const modal = new bootstrap.Modal(document.getElementById('modalCarrito'));
    modal.show();
}

// CALCULAR TOTAL
function calcularTotalCarrito() {
    return carrito.reduce((total, item) => {
        const precio = parseInt(item.precio.replace(/[^0-9]/g, ''));
        return total + (precio * item.cantidad);
    }, 0).toLocaleString('es-CO');
}

// ELIMINAR DEL CARRITO
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito();
    actualizarContadorCarrito();
    abrirModalCarrito();
    mostrarNotificacion('Producto eliminado del carrito');
}

// PROCEDER AL PAGO
function procederAlPago() {
    if (carrito.length === 0) {
        mostrarNotificacion('Tu carrito está vacío');
        return;
    }

    const resumen = carrito.map(item => `${item.nombre} x${item.cantidad}`).join(', ');
    const total = calcularTotalCarrito();

    alert(`Resumen:\n${resumen}\n\nTotal: $${total}\n\n¡Gracias por tu compra!`);

    // Limpiar carrito
    carrito = [];
    guardarCarrito();
    actualizarContadorCarrito();

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
    if (modal) modal.hide();

    mostrarNotificacion('¡Compra realizada exitosamente!');
}

$(document).ready(function () {
    // ACTUALIZAR CONTADOR AL CARGAR
    actualizarContadorCarrito();

    // BÚSQUEDA DE PRODUCTOS
    $(".search-input, .form-control[placeholder*='Busca'], .form-control[placeholder*='Buscar']").on("keyup", function () {
        let value = $(this).val().toLowerCase();

        $(".card-product").filter(function () {
            $(this).toggle(
                $(this).text().toLowerCase().indexOf(value) > -1
            );
        });
    });

    // CLICK EN CARD DE PRODUCTO
    $(document).on('click', '.card-product', function (e) {
        if (!$(e.target).closest('.btn').length) {
            const card = $(this);
            const producto = {
                id: card.data('product-id') || card.find('h5').text().replace(/\s+/g, '-'),
                nombre: card.find('h5').text(),
                nombreCorto: card.find('p.text-muted').text(),
                precio: card.find('h6').text(),
                tags: card.find('.badge.bg-light').map((i, el) => $(el).text()).get(),
                descripcion: card.find('p.text-muted').text()
            };
            abrirModalProducto(producto);
        }
    });

    // CLICK EN BOTÓN AGREGAR AL CARRITO
    $(document).on('click', '.card-product .btn-natus', function (e) {
        e.stopPropagation();
        const card = $(this).closest('.card-product');
        const producto = {
            id: card.data('product-id') || card.find('h5').text().replace(/\s+/g, '-'),
            nombre: card.find('h5').text(),
            nombreCorto: card.find('p.text-muted').text(),
            precio: card.find('h6').text(),
            tags: card.find('.badge.bg-light').map((i, el) => $(el).text()).get(),
            descripcion: card.find('p.text-muted').text()
        };
        agregarAlCarrito(producto);
    });

    // ABRIR MODAL DE CARRITO
    $('#btn-ver-carrito').on('click', function () {
        abrirModalCarrito();
    });

    // BOTONES DE NAVEGACIÓN
    $(".btn-go-kits").click(function () {
        window.location.href = "kits.html";
    });

    $(".btn-go-cultivo").click(function () {
        window.location.href = "cultivo.html";
    });

});