let clientes = JSON.parse(localStorage.getItem('prestamos_db')) || [];

function inicializarApp() {
  document.getElementById('fechaInicio').valueAsDate = new Date();
  document.getElementById('btnExportar').onclick = exportarDatos;

  document.getElementById('loanForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const clienteNuevo = {
      id: Date.now(),
      nombre: document.getElementById('nombre').value.trim(),
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

  document.getElementById('searchInput').addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    const filtrados = clientes.filter(c => c.nombre.toLowerCase().includes(texto));
    renderizarTabla(filtrados);
  });

  guardarYRenderizar();
}

function registrarPago(id) {
  const abono = parseFloat(prompt("Ingrese el monto del abono:"));
  if (isNaN(abono) || abono <= 0) return;
  const fecha = new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
  clientes = clientes.map(c => {
    if (c.id === id) {
      c.pagado += abono;
      if (!c.historialPagos) c.historialPagos = [];
      c.historialPagos.push({ monto: abono, fecha: fecha });
    }
    return c;
  });
  guardarYRenderizar();
}

function verHistorial(id) {
  const c = clientes.find(item => item.id === id);
  if (!c || !c.historialPagos || c.historialPagos.length === 0) {
    alert("Este cliente aún no registra abonos.");
    return;
  }
  let msg = "Historial de abonos de " + c.nombre + ":\n\n";
  c.historialPagos.forEach((p, idx) => {
    msg += (idx + 1) + ". $" + p.monto.toLocaleString() + " - " + p.fecha + "\n";
  });
  alert(msg);
}

function eliminarCliente(id) {
  if (confirm("¿Estás seguro de eliminar este registro?")) {
    clientes = clientes.filter(c => c.id !== id);
    guardarYRenderizar();
  }
}

function guardarYRenderizar() {
  localStorage.setItem('prestamos_db', JSON.stringify(clientes));
  renderizarTabla(clientes);
  actualizarResumen();
}

function renderizarTabla(lista) {
  const clientList = document.getElementById('clientList');
  clientList.innerHTML = '';

  if (lista.length === 0) {
    const trVacio = document.createElement('tr');
    const tdVacio = document.createElement('td');
    tdVacio.colSpan = 7;
    tdVacio.className = 'p-6 text-center text-slate-500';
    tdVacio.textContent = 'No hay registros para mostrar';
    trVacio.appendChild(tdVacio);
    clientList.appendChild(trVacio);
    return;
  }

  lista.forEach(c => {
    const pendiente = c.montoTotal - c.pagado;
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-700/50';

    const tdCliente = document.createElement('td');
    tdCliente.className = 'p-4';
    const divNombre = document.createElement('div');
    divNombre.className = 'font-semibold text-white';
    divNombre.textContent = c.nombre;
    const divFecha = document.createElement('div');
    divFecha.className = 'text-xs text-slate-400';
    divFecha.textContent = 'Inicio: ' + (c.fechaInicio || 'N/A');
    tdCliente.appendChild(divNombre);
    tdCliente.appendChild(divFecha);

    const tdFrecuencia = document.createElement('td');
    tdFrecuencia.className = 'p-4 text-slate-300 text-xs font-medium';
    tdFrecuencia.textContent = c.frecuencia || 'Semanal';

    const tdEstado = document.createElement('td');
    tdEstado.className = 'p-4';
    const badge = document.createElement('span');
    if (pendiente <= 0) {
      badge.className = 'px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400';
      badge.textContent = 'Pagado';
    } else if (c.pagado > 0) {
      badge.className = 'px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400';
      badge.textContent = 'Abonando';
    } else {
      badge.className = 'px-2 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400';
      badge.textContent = 'Pendiente';
    }
    tdEstado.appendChild(badge);

    const tdTotal = document.createElement('td');
    tdTotal.className = 'p-4 text-slate-300 font-medium';
    const divTotal = document.createElement('div');
    divTotal.textContent = '$' + c.montoTotal.toLocaleString();
    const divBase = document.createElement('div');
    divBase.className = 'text-xs text-slate-500';
    divBase.textContent = 'Base: $' + (c.montoEntregado || c.montoTotal).toLocaleString();
    tdTotal.appendChild(divTotal);
    tdTotal.appendChild(divBase);

    const tdPagado = document.createElement('td');
    tdPagado.className = 'p-4 text-emerald-400 font-medium';
    tdPagado.textContent = '$' + c.pagado.toLocaleString();

    const tdPendiente = document.createElement('td');
    const valorPendiente = pendiente < 0 ? 0 : pendiente;
    tdPendiente.className = 'p-4 font-bold ' + (pendiente > 0 ? 'text-rose-400' : 'text-slate-500');
    tdPendiente.textContent = '$' + valorPendiente.toLocaleString();

    const tdAcciones = document.createElement('td');
    tdAcciones.className = 'p-4 text-center space-x-1';

    const btnAbonar = document.createElement('button');
    btnAbonar.className = 'bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition';
    btnAbonar.textContent = '+ Abonar';
    btnAbonar.onclick = () => registrarPago(c.id);

    const btnHistorial = document.createElement('button');
    btnHistorial.className = 'bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded-lg text-xs transition';
    btnHistorial.textContent = 'Historial';
    btnHistorial.onclick = () => verHistorial(c.id);

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded-lg text-xs transition';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.onclick = () => eliminarCliente(c.id);

    tdAcciones.appendChild(btnAbonar);
    tdAcciones.appendChild(btnHistorial);
    tdAcciones.appendChild(btnEliminar);

    tr.appendChild(tdCliente);
    tr.appendChild(tdFrecuencia);
    tr.appendChild(tdEstado);
    tr.appendChild(tdTotal);
    tr.appendChild(tdPagado);
    tr.appendChild(tdPendiente);
    tr.appendChild(tdAcciones);

    clientList.appendChild(tr);
  });
}

function actualizarResumen() {
  const totalP = clientes.reduce((acc, c) => acc + c.montoTotal, 0);
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

document.addEventListener('DOMContentLoaded', inicializarApp);
