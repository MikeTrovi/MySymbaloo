// Oggetto che contiene i markup HTML delle pagine impostazioni
const settingsPages = {
  "add-tiles": `
    <div class="settings-page">
      <button class="settings-back" onclick="showSettingsMenu()" style="margin-bottom:18px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-arrow-left"></i> Indietro
      </button>
      <h2>PAGINA DI TEST</h2>
      <p>Questa è una pagina di test caricata dinamicamente!</p>
    </div>
  `,
  "customize-tiles": `
    <div class="settings-page">
      <button class="settings-back" onclick="showSettingsMenu()" style="margin-bottom:18px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-arrow-left"></i> Indietro
      </button>
      <h2>Customize Tiles</h2>
      <p>Personalizza colore, dimensione e icona delle tue Tiles.</p>
    </div>
  `,
  "markers": `
    <div class="settings-page">
      <button class="settings-back" onclick="showSettingsMenu()" style="margin-bottom:18px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-arrow-left"></i> Indietro
      </button>
      <h2>Markers</h2>
      <p>Etichetta le Tiles con colori e nomi personalizzati.</p>
    </div>
  `,
  "groups": `
    <div class="settings-page">
      <button class="settings-back" onclick="showSettingsMenu()" style="margin-bottom:18px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-arrow-left"></i> Indietro
      </button>
      <h2>Groups</h2>
      <p>Raggruppa più Tiles in un unico Tile.</p>
    </div>
  `,
  "learning-paths": `
    <div class="settings-page">
      <button class="settings-back" onclick="showSettingsMenu()" style="margin-bottom:18px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-arrow-left"></i> Indietro
      </button>
      <h2>Learning Paths</h2>
      <p>Crea un percorso didattico e aggiungi attività.</p>
    </div>
  `,
  general: `
    <div class="settings-page">
      <button class="settings-back" onclick="showSettingsMenu()" style="margin-bottom:18px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-arrow-left"></i> Indietro
      </button>
      <h2>General</h2>
      <p>Imposta nome, colore e icona del Webmix.</p>
    </div>
  `,
  size: `
    <div class="settings-page">
      <button class="settings-back" onclick="showSettingsMenu()" style="margin-bottom:18px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-arrow-left"></i> Indietro
      </button>
      <h2>Size</h2>
      <p>Ridimensiona il Webmix per adattarlo alle tue Tiles.</p>
    </div>
  `,
  style: `
    <div class="settings-page">
      <button class="settings-back" onclick="showSettingsMenu()" style="margin-bottom:18px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-arrow-left"></i> Indietro
      </button>
      <h2>Style</h2>
      <p>Imposta la forma delle Tiles sul Webmix.</p>
    </div>
  `,
  collaborate: `
    <div class="settings-page">
      <button class="settings-back" onclick="showSettingsMenu()" style="margin-bottom:18px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-arrow-left"></i> Indietro
      </button>
      <h2>Collaborate</h2>
      <p>Collabora con altri utenti su questo Webmix.</p>
    </div>
  `,
  remove: `
    <div class="settings-page">
      <button class="settings-back" onclick="showSettingsMenu()" style="margin-bottom:18px;display:flex;align-items:center;gap:6px;">
        <i class="fas fa-arrow-left"></i> Indietro
      </button>
      <h2>Remove</h2>
      <p>Rimuovi questo Webmix. Attenzione: questa azione non è reversibile!</p>
    </div>
  `,
  background: `
    <div class="settings-page settings-page-bg">
      <button class="settings-back" onclick="showSettingsOverview()">
        <i class="fas fa-arrow-left"></i> Back to settings overview
      </button>
      <button class="settings-close" onclick="toggleSettingsPanel()">
        <i class="fas fa-times"></i>
      </button>
      <h2>Background</h2>
      <div class="background-preview-container">
        <span class="preview-label">Preview</span>
        <div class="background-preview">
          <img src="https://source.unsplash.com/random/400x150/?abstract" alt="Background Preview" id="background-preview-img" />
          <div class="tile-grid-overlay"></div>
        </div>
      </div>
      <div class="settings-section">
        <label class="switch-label">
          Webmix Transparency
          <input type="checkbox" id="webmix-transparency" checked>
          <span class="slider"></span>
        </label>
      </div>
      <div class="settings-section">
        <label class="switch-label">
          Set custom Background
          <input type="checkbox" id="enable-background" checked>
          <span class="slider"></span>
        </label>
        <div class="background-selector-row">
          <select id="background-type" class="background-type-select">
            <option value="images">Images</option>
            <option value="upload">Upload</option>
            <option value="colors">Colors</option>
          </select>
        </div>
        <div class="background-thumbnails">
          <img src="https://source.unsplash.com/100x60/?nature,water" class="background-thumb" />
          <img src="https://source.unsplash.com/100x60/?abstract,green" class="background-thumb" />
          <img src="https://source.unsplash.com/100x60/?city,night" class="background-thumb" />
          <img src="https://source.unsplash.com/100x60/?ocean" class="background-thumb" />
          <img src="https://source.unsplash.com/100x60/?love,sky" class="background-thumb" />
        </div>
      </div>
    </div>
  `,
  // Puoi aggiungere altre pagine qui
  // esempio: add-tiles: `<div>...</div>`,
};

window.showSettingsPage = function(pageName) {
  console.log('showSettingsPage:', pageName, settingsPages[pageName]);
  const container = document.getElementById('settings-page-content');
  const sidebar = document.querySelector('.settings-sidebar');
  if (settingsPages[pageName]) {
    container.innerHTML = settingsPages[pageName];
    container.classList.remove('slide-out');
    container.classList.add('slide-in');
    container.style.display = 'block';
    sidebar.style.display = 'none';
  } else {
    container.innerHTML = '';
    container.style.display = 'none';
    container.classList.remove('slide-in', 'slide-out');
    sidebar.style.display = 'block';
  }
  document.querySelectorAll('.settings-menu-item').forEach(btn => {
    if (btn.getAttribute('data-settings-page') === pageName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Funzione per tornare al menu delle impostazioni con animazione
window.showSettingsMenu = function() {
  const container = document.getElementById('settings-page-content');
  const sidebar = document.querySelector('.settings-sidebar');
  container.classList.remove('slide-in');
  container.classList.add('slide-out');
  // Nascondi il contenuto dopo la transizione
  container.addEventListener('transitionend', function handler(e) {
    if (e.propertyName === 'transform') {
      container.style.display = 'none';
      sidebar.style.display = 'block';
      container.classList.remove('slide-out');
      container.removeEventListener('transitionend', handler);
    }
  });
};


document.querySelectorAll('.settings-menu-item').forEach(btn => {
  btn.addEventListener('click', function() {
    const page = this.getAttribute('data-settings-page');
    if (page) showSettingsPage(page);
  });
});
// All'avvio: mostra solo il menu, non caricare nessuna pagina
const container = document.getElementById('settings-page-content');
const sidebar = document.querySelector('.settings-sidebar');
function showSettingsMenuOnly() {
  if (container && sidebar) {
    container.style.display = 'none';
    sidebar.style.display = 'block';
    container.innerHTML = '';
    sidebar.querySelectorAll('.settings-menu-item').forEach(btn => btn.classList.remove('active'));
  }
}
showSettingsMenuOnly();

// Monkey patch per ripristinare il menu quando si apre il pannello impostazioni
if (typeof window.toggleSettingsPanel === 'function') {
  const origToggleSettingsPanel = window.toggleSettingsPanel;
  window.toggleSettingsPanel = function(...args) {
    const wasActive = AppConfig.dom.settingsPanel && AppConfig.dom.settingsPanel.classList.contains('active');
    origToggleSettingsPanel.apply(this, args);
    // Se il pannello è ora attivo (cioè è stato appena aperto), mostra solo il menu
    const isActive = AppConfig.dom.settingsPanel && AppConfig.dom.settingsPanel.classList.contains('active');
    if (!wasActive && isActive) {
      showSettingsMenuOnly();
    }
  };
}

