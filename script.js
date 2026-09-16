document.addEventListener('DOMContentLoaded', function () {
  var formModal = document.getElementById('formModal');
  var detailModal = document.getElementById('detailModal');
  var paymentModal = document.getElementById('paymentModal');
  
  var openFormBtn = document.getElementById('openFormBtn');
  var closeFormBtn = document.getElementById('closeFormBtn');
  var closeDetailBtn = document.getElementById('closeDetailBtn');
  var openPaymentBtn = document.getElementById('openPaymentBtn');
  var closePaymentBtn = document.getElementById('closePaymentBtn');
  
  var loanForm = document.getElementById('loanForm');
  var paymentForm = document.getElementById('paymentForm');
  var debtorsList = document.getElementById('debtorsList');
  var totalDisplay = document.getElementById('totalDisplay');

  var loans = [];
  try {
    loans = JSON.parse(localStorage.getItem('loans_data')) || [];
  } catch (err) {
    loans = [];
  }

  var activeLoanId = null;

  var today = new Date().toISOString().split('T')[0];
  if (document.getElementById('startDate')) document.getElementById('startDate').value = today;
  if (document.getElementById('paymentDate')) document.getElementById('paymentDate').value = today;

  if (openFormBtn) openFormBtn.addEventListener('click', function () { formModal.classList.add('active'); });
  if (closeFormBtn) closeFormBtn.addEventListener('click', function () { formModal.classList.remove('active'); });
  if (closeDetailBtn) closeDetailBtn.addEventListener('click', function () { detailModal.classList.remove('active'); });
  if (openPaymentBtn) openPaymentBtn.addEventListener('click', function () { paymentModal.classList.add('active'); });
  if (closePaymentBtn) closePaymentBtn.addEventListener('click', function () { paymentModal.classList.remove('active'); });

  if (loanForm) {
    loanForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var amount = parseFloat(document.getElementById('amount').value) || 0;
      var interest = parseFloat(document.getElementById('interest').value) || 0;
      var totalToPay = amount + (amount * (interest / 100));

      var newLoan = {
        id: Date.now(),
        clientName: document.getElementById('clientName').value,
        amount: amount,
        interest: interest,
        totalToPay: totalToPay,
        balance: totalToPay,
        term: document.getElementById('term').value || '1',
        startDate: document.getElementById('startDate').value || today,
        notes: document.getElementById('notes').value || 'Sin notas',
        payments: []
      };

      loans.push(newLoan);
      saveAndRefresh();
      loanForm.reset();
      document.getElementById('startDate').value = today;
      formModal.classList.remove('active');
    });
  }

  if (paymentForm) {
    paymentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var pAmount = parseFloat(document.getElementById('paymentAmount').value) || 0;
      var pDate = document.getElementById('paymentDate').value || today;

      loans = loans.map(function (loan) {
        if (loan.id === activeLoanId) {
          if (!loan.payments) loan.payments = [];
          loan.payments.push({ amount: pAmount, date: pDate });
          var currentBal = loan.balance !== undefined ? loan.balance : loan.totalToPay;
          loan.balance = Math.max(0, currentBal - pAmount);
          openDetail(loan);
        }
        return loan;
      });

      saveAndRefresh();
      paymentForm.reset();
      document.getElementById('paymentDate').value = today;
      paymentModal.classList.remove('active');
    });
  }

  function saveAndRefresh() {
    localStorage.setItem('loans_data', JSON.stringify(loans));
    renderList();
  }

  function renderList() {
    if (!debtorsList) return;
    debtorsList.innerHTML = '';
    var totalAcumulado = 0;

    if (loans.length === 0) {
      var emptyMsg = document.createElement('p');
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#888';
      emptyMsg.style.marginTop = '30px';
      emptyMsg.textContent = 'Sin deudas registradas.';
      debtorsList.appendChild(emptyMsg);
      if (totalDisplay) totalDisplay.textContent = '$0.00';
      return;
    }

    loans.forEach(function (item) {
      var currentBalance = item.balance !== undefined ? item.balance : item.totalToPay;
      totalAcumulado += currentBalance;

      var card = document.createElement('div');
      card.className = 'card-debtor';

      var infoDiv = document.createElement('div');
      var nameDiv = document.createElement('div');
      nameDiv.className = 'debtor-name';
      nameDiv.textContent = item.clientName;

      var subDiv = document.createElement('div');
      subDiv.className = 'debtor-sub';
      subDiv.textContent = 'Pendiente | Inicio: ' + item.startDate;

      infoDiv.appendChild(nameDiv);
      infoDiv.appendChild(subDiv);

      var amountDiv = document.createElement('div');
      amountDiv.className = 'debtor-amount';
      amountDiv.textContent = '$' + currentBalance.toFixed(2);

      card.appendChild(infoDiv);
      card.appendChild(amountDiv);

      card.addEventListener('click', function () {
        openDetail(item);
      });

      debtorsList.appendChild(card);
    });

    if (totalDisplay) totalDisplay.textContent = '$' + totalAcumulado.toFixed(2);
  }

  function openDetail(loan) {
    activeLoanId = loan.id;
    var detailName = document.getElementById('detailName');
    if (detailName) detailName.textContent = loan.clientName;
    
    var body = document.getElementById('detailBody');
    if (!body) return;
    body.innerHTML = '';

    var currentBalance = loan.balance !== undefined ? loan.balance : loan.totalToPay;

    var fields = [
      { label: 'Monto Original:', value: '$' + loan.amount.toFixed(2) },
      { label: 'Total con Interes:', value: '$' + loan.totalToPay.toFixed(2) },
      { label: 'Saldo Restante:', value: '$' + currentBalance.toFixed(2), highlight: true },
      { label: 'Plazo:', value: loan.term + ' Semanas' },
      { label: 'Inicio:', value: loan.startDate },
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
        strong.style.color = '#d32f2f';
        strong.style.fontSize = '18px';
      }

      row.appendChild(span);
      row.appendChild(strong);
      body.appendChild(row);
    });

    var pList = document.getElementById('paymentsList');
    if (pList) {
      pList.innerHTML = '';
      if (!loan.payments || loan.payments.length === 0) {
        var noPaymentsMsg = document.createElement('p');
        noPaymentsMsg.style.fontSize = '13px';
        noPaymentsMsg.style.color = '#888';
        noPaymentsMsg.textContent = 'No hay abonos registrados.';
        pList.appendChild(noPaymentsMsg);
      } else {
        loan.payments.forEach(function (p) {
          var pDiv = document.createElement('div');
          pDiv.className = 'payment-item';
          
          var dateSpan = document.createElement('span');
          dateSpan.textContent = p.date;
          
          var amtStrong = document.createElement('strong');
          amtStrong.textContent = '+$' + p.amount.toFixed(2);

          pDiv.appendChild(dateSpan);
          pDiv.appendChild(amtStrong);
          pList.appendChild(pDiv);
        });
      }
    }

    if (detailModal) detailModal.classList.add('active');
  }

  renderList();
});
