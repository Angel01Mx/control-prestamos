document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('loanModal');
  const openBtn = document.getElementById('openFormBtn');
  const closeBtn = document.getElementById('closeFormBtn');
  const loanForm = document.getElementById('loanForm');

  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  loanForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Préstamo registrado');
    modal.classList.remove('active');
    loanForm.reset();
  });
});
