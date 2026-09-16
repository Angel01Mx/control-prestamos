let clientes = JSON.parse(localStorage.getItem('prestamos_data')) || [];
let clienteSeleccionadoId = null;

document.addEventListener('DOMContentLoaded', () => {
  const fechaInput = document.getElementById('fechaInicio');
  if (fechaInput) fechaInput.valueAsDate = new Date();
  renderizarTabla();
});

function guardarDatos() {
  localStorage.setItem('prestamos_data', JSON.stringify(clientes));
}

function guardarYRenderizar() {
  guardarDatos();
  renderizarTabla();
}

document.getElementById('loanForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const clienteNuevo = {
    id: Date.now(),
    nombre: document.getElementById('nombre').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    direccion: document.getElementById('direccion').value.trim(),
    fechaInicio: document.getElementById('fechaInicio').value,
    frecuencia: document.getElementById('frecuencia').value,
    montoEntregado: parseFloat(document.getElementById('montoEntregado').value),
    montoTotal: parseFloat(document.getElementById('montoTotal').value),
    pagado: 0,
    historialPagos: []
  };

  clientes.push(clienteNuevo);
  guardarYRenderizar();

  document.getElementById('loanForm').reset();
  document.getElementById('fechaInicio').valueAsDate = new Date();
});

function registrarAbono(id) {
  const c = clientes.find(item => item.id === id);
  if (!c) return;

  const pendiente = c.montoTotal - c.pagado;
  if (pendiente <= 0) {
    alert("Este cliente ya saldó la cuenta.");
    return;
  }

  const monto = parseFloat(prompt(`Registrar abono para ${c.nombre}\nPendiente: $${pendiente.toLocaleString()}`));
  if (isNaN(monto) || monto <= 0) return;

  if (monto > pendiente) {
    alert("El abono sobrepasa la deuda pendiente.");
    return;
  }

  c.pagado += monto;
  if (!c.historialPagos) c.historialPagos = [];
  c.historialPagos.push({
    monto: monto,
    fecha: new Date().toLocaleDateString()
  });

  guardarYRenderizar();
}

// NUEVAS FUNCIONES PARA EL MODAL DE HISTORIAL
function verHistorial(id) {
  const c = clientes.find(item => item.id === id);
  if (!c) return;

  clienteSeleccionadoId = id;
  const modal = document.getElementById('modalHistorial');
  const titulo = document.getElementById('modalClienteNombre');
  const contenedorLista = document.getElementById('modalHistorialLista');

  titulo.textContent = `Abonos de: ${c.nombre}`;
  contenedorLista.innerHTML = '';

  if (!c.historialPagos || c.historialPagos.length === 0) {
    contenedorLista.innerHTML = `<p class="text-sm text-slate-400 py-4 text-center">Sin abonos registrados.</p>`;
  } else {
    c.historialPagos.forEach((p, idx) => {
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-700/50';
      
      item.innerHTML = `
        <div>
          <p class="font-bold text-emerald-400">$${p.monto.toLocaleString()}</p>
          <p class="text-xs text-slate-400">${p.fecha}</p>
        </div>
        <button onclick="eliminarAbonoDirecto(${idx})" 
                class="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-lg text-xs font-medium transition">
          🗑️ Eliminar
        </button>
      `;
      contenedorLista.appendChild(item);
    });
  }

  modal.classList.remove('hidden');
}

function eliminarAbonoDirecto(index) {
  const c = clientes.find(item => item.id === clienteSeleccionadoId);
  if (!c || !c.historialPagos[index]) return;

  const abonoAEliminar = c.historialPagos[index];
  
  if (confirm(`¿Eliminar este abono de $${abonoAEliminar.monto.toLocaleString()}?`)) {
    c.pagado -= abonoAEliminar.monto;
    c.historialPagos.splice(index, 1);
    guardarYRenderizar();
    verHistorial(clienteSeleccionadoId); // Recarga la lista dentro del modal
  }
}

function cerrarModalHistorial() {
  document.getElementById('modalHistorial').classList.add('hidden');
  clienteSeleccionadoId = null;
}

function eliminarCliente(id) {
  if (confirm("¿Estás seguro de eliminar a este cliente?")) {
    clientes = clientes.filter(c => c.id !== id);
    guardarYRenderizar();
  }
}

document.getElementById('searchInput').addEventListener('input', renderizarTabla);

function renderizarTabla() {
  const tbody = document.getElementById('clientList');
  const busqueda = document.getElementById('searchInput').value.toLowerCase();
  tbody.innerHTML = '';

  let tPrestado = 0, tCobrado = 0, tPendiente = 0;

  clientes.forEach(c => {
    const pendiente = c.montoTotal - c.pagado;
    
    tPrestado += c.montoTotal;
    tCobrado += c.pagado;
    tPendiente += pendiente;

    if (!c.nombre.toLowerCase().includes(busqueda)) return;

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/50 transition border-b border-slate-700/50';

    const tdCliente = document.createElement('td');
    tdCliente.className = 'p-4';
    
    const divNombre = document.createElement('div');
    divNombre.className = 'font-semibold text-white';
    divNombre.textContent = c.nombre;
    
    const divContacto = document.createElement('div');
    divContacto.className = 'text-xs text-indigo-400 font-medium';
    divContacto.textContent = [c.telefono, c.direccion].filter(Boolean).join(' • ');

    const divFecha = document.createElement('div');
    divFecha.className = 'text-xs text-slate-400 mt-0.5';
    divFecha.textContent = 'Inicio: ' + (c.fechaInicio || 'N/A');

    tdCliente.appendChild(divNombre);
    if (c.telefono || c.direccion) tdCliente.appendChild(divContacto);
    tdCliente.appendChild(divFecha);

    const tdFrecuencia = document.createElement('td');
    tdFrecuencia.className = 'p-4 text-slate-300';
    tdFrecuencia.textContent = c.frecuencia;

    const tdEstado = document.createElement('td');
    tdEstado.className = 'p-4';
    const spanEstado = document.createElement('span');
    spanEstado.className = pendiente <= 0 
      ? 'px-2 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      : 'px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20';
    spanEstado.textContent = pendiente <= 0 ? 'Pagado' : 'Activo';
    tdEstado.appendChild(spanEstado);

    const tdTotal = document.createElement('td');
    tdTotal.className = 'p-4 font-medium text-white';
    tdTotal.textContent = '$' + c.montoTotal.toLocaleString();

    const tdPagado = document.createElement('td');
    tdPagado.className = 'p-4 text-emerald-400 font-medium';
    tdPagado.textContent = '$' + c.pagado.toLocaleString();

    const tdPendiente = document.createElement('td');
    tdPendiente.className = 'p-4 font-semibold ' + (pendiente <= 0 ? 'text-slate-500' : 'text-rose-400');
    tdPendiente.textContent = '$' + pendiente.toLocaleString();

    const tdAcciones = document.createElement('td');
    tdAcciones.className = 'p-4 text-center space-x-2';

    const btnAbonar = document.createElement('button');
    btnAbonar.className = 'bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-medium transition';
    btnAbonar.textContent = '+ Abono';
    btnAbonar.onclick = () => registrarAbono(c.id);

    const btnHistorial = document.createElement('button');
    btnHistorial.className = 'bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded-lg text-xs font-medium transition';
    btnHistorial.textContent = 'Historial';
    btnHistorial.onclick = () => verHistorial(c.id);

    const btnBorrar = document.createElement('button');
    btnBorrar.className = 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1 rounded-lg text-xs font-medium border border-rose-500/20 transition';
    btnBorrar.textContent = 'Eliminar';
    btnBorrar.onclick = () => eliminarCliente(c.id);

    tdAcciones.append(btnAbonar, btnHistorial, btnBorrar);

    tr.append(tdCliente, tdFrecuencia, tdEstado, tdTotal, tdPagado, tdPendiente, tdAcciones);
    tbody.appendChild(tr);
  });

  document.getElementById('totalPrestado').textContent = '$' + tPrestado.toLocaleString();
  document.getElementById('totalCobrado').textContent = '$' + tCobrado.toLocaleString();
  document.getElementById('totalPendiente').textContent = '$' + tPendiente.toLocaleString();
}

document.getElementById('btnExportar').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clientes, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `respaldo_prestamos_${new Date().toISOString().slice(0,10)}.json`);
  dlAnchorElem.click();
});
