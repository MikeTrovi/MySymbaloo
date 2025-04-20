// Gestione apertura/chiusura modal info app con animazioni e accessibilità
const logoBtn = document.getElementById('about-logo');
const aboutModal = document.getElementById('about-modal');
const closeAbout = document.getElementById('close-about-modal');


function openAboutModal() {
  if (!aboutModal.classList.contains('show')) {
    aboutModal.style.display = 'flex';
    // Forza reflow per trigger animazione
    void aboutModal.offsetWidth;
    aboutModal.classList.add('show');
    setTimeout(() => closeAbout && closeAbout.focus(), 180);
  }
}

function closeAboutModal() {
  aboutModal.classList.remove('show');
  setTimeout(() => {
    aboutModal.style.display = 'none';
  }, 250);
}

if (logoBtn && aboutModal && closeAbout) {
  logoBtn.addEventListener('click', openAboutModal);
  closeAbout.addEventListener('click', closeAboutModal);
  window.addEventListener('keydown', function(e) {
    if (aboutModal.classList.contains('show') && (e.key === 'Escape' || e.key === 'Esc')) {
      closeAboutModal();
    }
  });
  aboutModal.addEventListener('mousedown', function(e) {
    if (e.target === aboutModal) closeAboutModal();
  });
}
