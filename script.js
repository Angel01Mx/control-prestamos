let clientes = JSON.parse(localStorage.getItem('prestamos_db')) || [];

const loanForm = document.getElementById('loanForm');
const clientList = document.getElementById('clientList');
const searchInput = document.getElementById('searchInput');

// Guardar nuevo préstamo
loanForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const monto = parseFloat(document.getElementById('monto').value);

  const nuevoCliente = {
    id: Date.now(),
    nombre: nombre,
    monto: monto,
    pagado: 0
  };

  clientes.push(nuevoCliente);
  guardarYRenderizar();
  loanForm.reset();
});

// Registrar un abono/pago
function registrarPago(id) {
  const abono = parseFloat(prompt("Ingrese el monto del abono o pago:"));
  if (isNaN(abono) || abono <= 0) return;

  clientes = clientes.map(c => {
    if (c.id === id) {
      c.pagado += abono;
    }
    return c;
  });

  guardarYRenderizar();
}

// Eliminar registro
function eliminarCliente(id) {
  if (confirm("¿Estás seguro de eliminar este registro?")) {
    clientes = clientes.filter(c => c.id !== id);
    guardarYRenderizar();
  }
}

// Filtro del Buscador en tiempo real
searchInput.addEventListener('input', (e) => {
  const texto = e.target.value.toLowerCase();
  const filtrados = clientes.filter(c => c.nombre.toLowerCase().includes(texto));
  renderizarTabla(filtrados);
});

function guardarYRenderizar() {
  localStorage.setItem('prestamos_db', JSON.stringify(clientes));
  renderizarTabla(clientes);
  actualizarResumen();
}

// Renderizar Tabla de Clientes
function renderizarTabla(lista) {
  clientList.innerHTML = '';
  lista.forEach(c => {
    const pendiente = c.monto - c.pagado;
    const tr = document.createElement('tr');
    tr.className = 'border-b hover:bg-gray-50';

    const tdNombre = document.createElement('td');
    tdNombre.className = 'p-3 font-semibold';
    tdNombre.textContent = c.nombre;

    const tdMonto = document.createElement('td');
    tdMonto.className = 'p-3 text-blue-600';
    tdMonto.textContent = '$' + c.monto.toLocaleString();

    const tdPagado = document.createElement('td');
    tdPagado.className = 'p-3 text-green-600';
    tdPagado.textContent = '$' + c.pagado.toLocaleString();

    const tdPendiente = document.createElement('td');
    tdPendiente.className = 'p-3 font-bold ' + (pendiente > 0 ? 'text-red-600' : 'text-gray-400');
    tdPendiente.textContent = '$' + pendiente.toLocaleString();

    const tdAcciones = document.createElement('td');
    tdAcciones.className = 'p-3 space-x-2';

    const btnAbonar = document.createElement('button');
    btnAbonar.className = 'bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600';
    btnAbonar.textContent = 'Abonar';
    btnAbonar.onclick = () => registrarPago(c.id);

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600';
    btnEliminar.textContent = '✕';
    btnEliminar.onclick = () => eliminarCliente(c.id);

    tdAcciones.appendChild(btnAbonar);
    tdAcciones.appendChild(btnEliminar);

    tr.appendChild(tdNombre);
    tr.appendChild(tdMonto);
    tr.appendChild(tdPagado);
    tr.appendChild(tdPendiente);
    tr.appendChild(tdAcciones);

    clientList.appendChild(tr);
  });
}

function actualizarResumen() {
  const totalP = clientes.reduce((acc, c) => acc + c.monto, 0);
  const totalC = clientes.reduce((acc, c) => acc + c.pagado, 0);
  
  document.getElementById('totalPrestado').textContent = '$' + totalP.toLocaleString();
  document.getElementById('totalCobrado').textContent = '$' + totalC.toLocaleString();
  document.getElementById('totalPendiente').textContent = '$' + (totalP - totalC).toLocaleString();
}

function exportarDatos() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clientes));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `respaldo_prestamos_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Inicializar
guardarYRenderizar();
