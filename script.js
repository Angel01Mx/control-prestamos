let clientes = JSON.parse(localStorage.getItem('prestamos_db')) || [];

const loanForm = document.getElementById('loanForm');
const clientList = document.getElementById('clientList');
const searchInput = document.getElementById('searchInput');

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

function eliminarCliente(id) {
  if (confirm("¿Estás seguro de eliminar este registro?")) {
    clientes = clientes.filter(c => c.id !== id);
    guardarYRenderizar();
  }
}

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

function renderizarTabla(lista) {
  clientList.innerHTML = '';

  if (lista.length === 0) {
    const trVacio = document.createElement('tr');
    const tdVacio = document.createElement('td');
    tdVacio.colSpan = 6;
    tdVacio.className = 'p-6 text-center text-slate-500';
    tdVacio.textContent = 'No hay registros para mostrar';
    trVacio.appendChild(tdVacio);
    clientList.appendChild(trVacio);
    return;
  }

  lista.forEach(c => {
    const pendiente = c.monto - c.pagado;
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-700/50';

    const tdNombre = document.createElement('td');
    tdNombre.className = 'p-4 font-semibold text-white';
    tdNombre.textContent = c.nombre;

    const tdEstado = document.createElement('td');
    tdEstado.className = 'p-4';
    const badge = document.createElement('span');
    badge.className = 'px-2 py-1 rounded-full text-xs font-semibold ';
    
    if (pendiente <= 0) {
      badge.className += 'bg-emerald-500/20 text-emerald-400';
      badge.textContent = 'Pagado';
    } else if (c.pagado > 0) {
      badge.className += 'bg-amber-500/20 text-amber-400';
      badge.textContent = 'Abonando';
    } else {
      badge.className += 'bg-rose-500/20 text-rose-400';
      badge.textContent = 'Pendiente';
    }
    tdEstado.appendChild(badge);

    const tdMonto = document.createElement('td');
    tdMonto.className = 'p-4 text-slate-300';
    tdMonto.textContent = '$' + c.monto.toLocaleString();

    const tdPagado = document.createElement('td');
    tdPagado.className = 'p-4 text-emerald-400 font-medium';
    tdPagado.textContent = '$' + c.pagado.toLocaleString();

    const tdPendiente = document.createElement('td');
    tdPendiente.className = 'p-4 font-bold ' + (pendiente > 0 ? 'text-rose-400' : 'text-slate-500');
    tdPendiente.textContent = '$' + (pendiente < 0 ? 0 : pendiente).toLocaleString();

    const tdAcciones = document.createElement('td');
    tdAcciones.className = 'p-4 text-center space-x-2';

    const btnAbonar = document.createElement('button');
    btnAbonar.className = 'bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold';
    btnAbonar.textContent = '+ Abonar';
    btnAbonar.onclick = () => registrarPago(c.id);

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'bg-slate-700 hover:bg-rose-600 text-slate-300 hover:text-white px-2 py-1 rounded-lg text-xs';
    btnEliminar.textContent = '✕';
    btnEliminar.onclick = () => eliminarCliente(c.id);

    tdAcciones.appendChild(btnAbonar);
    tdAcciones.appendChild(btnEliminar);

    tr.appendChild(tdNombre);
    tr.appendChild(tdEstado);
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
  const pendiente = totalP - totalC;
  
  document.getElementById('totalPrestado').textContent = '$' + totalP.toLocaleString();
  document.getElementById('totalCobrado').textContent = '$' + totalC.toLocaleString();
  document.getElementById('totalPendiente').textContent = '$' + (pendiente < 0 ? 0 : pendiente).toLocaleString();
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

guardarYRenderizar();
