// debug-visual.js
// (debug overlay disabilitato)
// Crea finestre di debug visive per tracciare le classi e lo stato dei menu settings

(function() {
  // Crea un overlay debug se non esiste
  let debugOverlay = document.getElementById('debug-visual-overlay');
  if (!debugOverlay) {
    debugOverlay = document.createElement('div');
    debugOverlay.id = 'debug-visual-overlay';
    debugOverlay.style.position = 'fixed';
    debugOverlay.style.top = '0';
    debugOverlay.style.right = '0';
    debugOverlay.style.zIndex = '99999';
    debugOverlay.style.background = 'rgba(0,0,0,0.7)';
    debugOverlay.style.color = '#fff';
    debugOverlay.style.fontSize = '14px';
    debugOverlay.style.padding = '10px';
    debugOverlay.style.maxWidth = '360px';
    debugOverlay.style.pointerEvents = 'none';
    debugOverlay.style.fontFamily = 'monospace';
    

    document.body.appendChild(debugOverlay);
  }

  function updateDebugInfo() {
    const container = document.getElementById('settings-page-content');
    const sidebar = document.querySelector('.settings-sidebar');
    let html = '<b>DEBUG MENU STATE</b><br>';
    if (container) {
      const computedContainer = window.getComputedStyle(container);
      html += `<div><b>#settings-page-content</b><br>class: ${container.className}<br>style: ${container.getAttribute('style') || ''}<br>transform (inline): ${container.style.transform || 'none'}<br>transform (computed): ${computedContainer.transform}</div>`;
    }
    if (sidebar) {
      const computedSidebar = window.getComputedStyle(sidebar);
      html += `<div><b>.settings-sidebar</b><br>class: ${sidebar.className}<br>style: ${sidebar.getAttribute('style') || ''}<br>transform (inline): ${sidebar.style.transform || 'none'}<br>transform (computed): ${computedSidebar.transform}</div>`;
    }
    debugOverlay.innerHTML = html;

  }

  // Hook su click sui menu
  document.addEventListener('click', function(e) {
    setTimeout(updateDebugInfo, 50);
  }, true);

  // Aggiorna anche su transizione
  document.addEventListener('transitionend', function(e) {
    updateDebugInfo();
  }, true);

  // Primo update
  setTimeout(updateDebugInfo, 500);
})();
