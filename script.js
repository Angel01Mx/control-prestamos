document.addEventListener('DOMContentLoaded', () => {
  const formModal = document.getElementById('formModal');
  const detailModal = document.getElementById('detailModal');
  
  const openFormBtn = document.getElementById('openFormBtn');
  const closeFormBtn = document.getElementById('closeFormBtn');
  const closeDetailBtn = document.getElementById('closeDetailBtn');
  
  const loanForm = document.getElementById('loanForm');
  const debtorsList = document.getElementById('debtorsList');
  const totalDisplay = document.getElementById('totalDisplay');

  let loans = JSON.parse(localStorage.getItem('loans_data')) || [];

  document.getElementById('startDate').valueAsDate = new Date();

  // Abrir / Cerrar Formularios Flotantes
  openFormBtn.addEventListener('click', () => formModal.classList.add('active'));
  closeFormBtn.addEventListener('click', () => formModal.classList.remove('active'));
  closeDetailBtn.addEventListener('click', () => detailModal.classList.remove('active'));

  // Registrar Préstamo
  loanForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const interest = parseFloat(document.getElementById('interest').value) || 0;
    const totalToPay = amount + (amount * (interest / 100));

    const newLoan = {
      id: Date.now(),
      clientName: document.getElementById('clientName').value,
      amount: amount,
      interest: interest,
      totalToPay: totalToPay,
      term: document.getElementById('term').value,
      startDate: document.getElementById('startDate').value,
      notes: document.getElementById('notes').value || 'Sin notas'
    };

    loans.push(newLoan);
    localStorage.setItem('loans_data', JSON.stringify(loans));

    renderList();
    loanForm.reset();
    document.getElementById('startDate').valueAsDate = new Date();
    formModal.classList.remove('active');
  });

  // Mostrar Lista de Deudores
  function renderList() {
    debtorsList.innerHTML = '';
    let totalAcumulado = 0;

    if (loans.length === 0) {
      debtorsList.innerHTML = '
