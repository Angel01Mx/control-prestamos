document.addEventListener('DOMContentLoaded', function () {
  var loans = [];
  
  // Cargar y limpiar datos corrompidos automáticamente
  try {
    var rawData = JSON.parse(localStorage.getItem('loans_data')) || [];
    loans = rawData.filter(function (item) {
      return item && typeof item === 'object';
    });
  } catch (e) {
    loans = [];
  }

  var activeLoanId = null;
  var today = new Date().toISOString().split('T')[0];

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val;
  }

  setVal('startDate', today);
  setVal('paymentDate', today);

  var formModal = document.getElementById('formModal');
  var detailModal = document.getElementById('detailModal');
  var paymentModal = document.getElementById('paymentModal');

  function bindClick(id, handler) {
    var btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handler);
  }

  function openModal(el) {
    if (el) el.classList.add('active');
  }

  function closeModal(el) {
    if (el) el.classList.remove('active');
  }

  bindClick('openFormBtn', function () { openModal(formModal); });
  bindClick('closeFormBtn', function () { closeModal(formModal); });
  bindClick('closeDetailBtn', function () { closeModal(detailModal); });
  bindClick('openPaymentBtn', function () { openModal(paymentModal); });
  bindClick('closePaymentBtn', function () { closeModal(paymentModal); });

  var loanForm = document.getElementById('loanForm');
  if (loanForm) {
    loanForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var clientName = getVal('clientName').trim();
      var amount = parseFloat(getVal('amount')) || 0;
      var interest = parseFloat(getVal('interest')) || 0;
      var term = getVal('term') || '1';
      var startDate = getVal('startDate') || today;
      var notes = getVal('notes') || 'Sin notas';

      if (!clientName || amount <= 0) return;

      var totalToPay = amount + (amount * (interest / 100));

      var newLoan = {
        id: Date.now(),
        clientName: clientName,
        amount: amount,
        interest: interest,
        totalToPay: totalToPay,
        balance: totalToPay,
        term: term,
        startDate: startDate,
        notes: notes,
        payments: []
      };

      loans.push(newLoan);
      saveData();
      loanForm.reset();
      setVal('startDate', today);
      closeModal(formModal);
      renderList();
    });
  }

  var paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var pAmount = parseFloat(getVal('paymentAmount')) || 0;
      var pDate = getVal('paymentDate') || today;

      if (pAmount <= 0) return;

      for (var i = 0; i < loans.length; i++) {
        if (loans[i].id === activeLoanId) {
          if (!loans[i].payments) loans[i].payments = [];
          loans[i].payments.push({ amount: pAmount, date: pDate });
          var bal = loans[i].balance !== undefined && loans[i].balance !== null ? loans[i].balance : loans[i].totalToPay;
          bal = parseFloat(bal) || 0;
          loans[i].balance = Math.max(0, bal - pAmount);
          openDetail(loans[i]);
          break;
        }
      }

      saveData();
      paymentForm.reset();
      setVal('paymentDate', today);
      closeModal(paymentModal);
      renderList();
    });
  }

  function saveData() {
    localStorage.setItem('loans_data', JSON.stringify(loans));
  }

  function parseSafeNumber(val) {
    var n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  }

  function renderList() {
    var list = document.getElementById('debtorsList');
    var totalDisplay = document.getElementById('totalDisplay');
    if (!list) return;

    list.innerHTML = '';
    var totalAcumulado = 0;

    if (loans.length === 0) {
      var p = document.createElement('p');
      p.style.textAlign = 'center';
      p.style.color = '#888';
      p.style.marginTop = '30px';
      p.textContent = 'Sin deudas registradas.';
      list.appendChild(p);
      if (totalDisplay) totalDisplay.textContent = '$0.00';
      return;
    }

    loans.forEach(function (item) {
      var rawBal = item.balance !== undefined && item.balance !== null ? item.balance : item.totalToPay;
      var bal = parseSafeNumber(rawBal);
      totalAcumulado += bal;

      var card = document.createElement('div');
      card.className = 'card-debtor';

      var left = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'debtor-name';
      name.textContent = item.clientName || 'Sin Nombre';

      var sub = document.createElement('div');
      sub.className = 'debtor-sub';
      sub.textContent = 'Pendiente | Inicio: ' + (item.startDate || today);

      left.appendChild(name);
      left.appendChild(sub);

      var right = document.createElement('div');
      right.className = 'debtor-amount';
      right.textContent = '$' + bal.toFixed(2);

      card.appendChild(left);
      card.appendChild(right);

      card.addEventListener('click', function () {
        openDetail(item);
      });

      list.appendChild(card);
    });

    if (totalDisplay) totalDisplay.textContent = '$' + totalAcumulado.toFixed(2);
  }

  function openDetail(loan) {
    activeLoanId = loan.id;
    var detailName = document.getElementById('detailName');
    if (detailName) detailName.textContent = loan.clientName || 'Detalle del Deudor';

    var body = document.getElementById('detailBody');
    if (body) {
      body.innerHTML = '';
      var rawBal = loan.balance !== undefined && loan.balance !== null ? loan.balance : loan.totalToPay;
      var bal = parseSafeNumber(rawBal);
      var origAmount = parseSafeNumber(loan.amount);
      var totalToPay = parseSafeNumber(loan.totalToPay);

      var rows = [
        ['Monto Original:', '$' + origAmount.toFixed(2)],
        ['Total con Interes:', '$' + totalToPay.toFixed(2)],
        ['Saldo Restante:', '$' + bal.toFixed(2)],
        ['Plazo:', (loan.term || '1') + ' Semanas'],
        ['Inicio:', loan.startDate || today],
        ['Notas:', loan.notes || 'Sin notas']
      ];

      rows.forEach(function (r, idx) {
        var div = document.createElement('div');
        div.className = 'info-row';

        var s1 = document.createElement('span');
        s1.textContent = r[0];

        var s2 = document.createElement('strong');
        s2.textContent = r[1];
        if (idx === 2) {
          s2.style.color = '#d32f2f';
          s2.style.fontSize = '18px';
        }

        div.appendChild(s1);
        div.appendChild(s2);
        body.appendChild(div);
      });
    }

    var pList = document.getElementById('paymentsList');
    if (pList) {
      pList.innerHTML = '';
      if (!loan.payments || loan.payments.length === 0) {
        var noP = document.createElement('p');
        noP.style.fontSize = '13px';
        noP.style.color = '#888';
        noP.textContent = 'No hay abonos registrados.';
        pList.appendChild(noP);
      } else {
        loan.payments.forEach(function (p) {
          var pDiv = document.createElement('div');
          pDiv.className = 'payment-item';

          var span = document.createElement('span');
          span.textContent = p.date || today;

          var st = document.createElement('strong');
          st.textContent = '+$' + parseSafeNumber(p.amount).toFixed(2);

          pDiv.appendChild(span);
          pDiv.appendChild(st);
          pList.appendChild(pDiv);
        });
      }
    }

    openModal(detailModal);
  }

  renderList();
});
