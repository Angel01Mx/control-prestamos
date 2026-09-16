document.addEventListener('DOMContentLoaded', function () {
  var formModal = document.getElementById('formModal');
  var detailModal = document.getElementById('detailModal');
  
  var openFormBtn = document.getElementById('openFormBtn');
  var closeFormBtn = document.getElementById('closeFormBtn');
  var closeDetailBtn = document.getElementById('closeDetailBtn');
  
  var loanForm = document.getElementById('loanForm');
  var debtorsList = document.getElementById('debtorsList');
  var totalDisplay = document.getElementById('totalDisplay');

  var loans = JSON.parse(localStorage.getItem('loans_data')) || [];

  var today = new Date().toISOString().split('T')[0];
  document.getElementById('startDate').value = today;

  openFormBtn.addEventListener('click', function () {
    formModal.classList.add('active');
  });

  closeFormBtn.addEventListener('click', function () {
    formModal.classList.remove('active');
  });

  closeDetailBtn.addEventListener('click', function () {
    detailModal.classList.remove('active');
  });

  loanForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var amount = parseFloat(document.getElementById('amount').value);
    var interest = parseFloat(document.getElementById('interest').value) || 0;
    var totalToPay = amount + (amount * (interest / 100));

    var newLoan = {
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
    document.getElementById('startDate').value = today;
    formModal.classList.remove('active');
  });

  function renderList() {
    debtorsList.innerHTML = '';
    var totalAcumulado = 0;

    if (loans.length === 0) {
      var emptyMsg = document.createElement('p');
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#888';
      emptyMsg.style.marginTop = '30px';
      emptyMsg.textContent = 'Sin deudas registradas.';
      debtorsList.appendChild(emptyMsg);
      totalDisplay.textContent = '$0.00';
      return;
    }

    loans.forEach(function (item) {
      totalAcumulado += item.totalToPay;

      var card = document.createElement('div');
      card.className = 'card-debtor';

      var infoDiv = document.createElement('div');
      
      var nameDiv = document.createElement('div');
      nameDiv.className = 'debtor-name';
      nameDiv.textContent = item.clientName;

      var subDiv = document.createElement('div');
      subDiv.className = 'debtor-sub';
      subDiv.textContent = 'Inicio: ' + item.startDate;

      infoDiv.appendChild(nameDiv);
      infoDiv.appendChild(subDiv);

      var amountDiv = document.createElement('div');
      amountDiv.className = 'debtor-amount';
      amountDiv.textContent = '$' + item.totalToPay.toFixed(2);

      card.appendChild(infoDiv);
      card.appendChild(amountDiv);

      card.addEventListener('click', function () {
        openDetail(item);
      });

      debtorsList.appendChild(card);
    });

    totalDisplay.textContent = '$' + totalAcumulado.toFixed(2);
  }

  function openDetail(loan) {
    document.getElementById('detailName').textContent = loan.clientName;
    
    var body = document.getElementById('detailBody');
    body.innerHTML = '';

    var fields = [
      { label: 'Monto Original:', value: '$' + loan.amount.toFixed(2) },
      { label: 'Interés Aplicado:', value: loan.interest + '%' },
      { label: 'Total a Cobrar:', value: '$' + loan.totalToPay.toFixed(2), highlight: true },
      { label: 'Plazo Acordado:', value: loan.term + ' Semanas' },
      { label: 'Fecha de Inicio:', value: loan.startDate },
      { label: 'Notas:', value: loan.notes }
    ];

    fields.forEach(function (field) {
      var row = document.createElement('div');
      row.className = 'info-row';

      var span = document.createElement('span');
      span.textContent = field.label;

      var strong = document.createElement('strong');
      strong.textContent = field.value;

      if (field.highlight) {
        strong.style.color = '#2e7d32';
        strong.style.fontSize = '18px';
      }

      row.appendChild(span);
      row.appendChild(strong);
      body.appendChild(row);
    });

    detailModal.classList.add('active');
  }

  renderList();
});
