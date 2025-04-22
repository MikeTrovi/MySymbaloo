// Oggetto che contiene i markup HTML delle pagine impostazioni
// Salva il markup iniziale del menu (solo al primo caricamento)
document.addEventListener('DOMContentLoaded', function() {
  var menuContainer = document.getElementById('settings-page-content');
  if (menuContainer && !window.settingsMenuHtml) {
    window.settingsMenuHtml = menuContainer.innerHTML;
  }
});
const settingsPages = {
  "add-tiles": `
    <div class="settings-page">
      
      <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>PAGINA DI TEST</h2>
      <p>Questa è una pagina di test caricata dinamicamente!</p>
    </div>
  `,
  "customize-tiles": `
    <div class="settings-page">
                  <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>Customize Tiles</h2>
      <p>Personalizza colore, dimensione e icona delle tue Tiles.</p>
    </div>
  `,
  "markers": `
    <div class="settings-page">
                  <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>Markers</h2>
      <p>Etichetta le Tiles con colori e nomi personalizzati.</p>
    </div>
  `,
  "groups": `
    <div class="settings-page">
                  <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>Groups</h2>
      <p>Raggruppa più Tiles in un unico Tile.</p>
    </div>
  `,
  "learning-paths": `
    <div class="settings-page">
                  <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>Learning Paths</h2>
      <p>Crea un percorso didattico e aggiungi attività.</p>
    </div>
  `,
  general: `
    <div class="settings-page">
                  <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>General</h2>
      <p>Imposta nome, colore e icona del Webmix.</p>
    </div>
  `,
  size: `
    <div class="settings-page">
                  <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>Size</h2>
      <p>Ridimensiona il Webmix per adattarlo alle tue Tiles.</p>
    </div>
  `,
  style: `
    <div class="settings-page">
                  <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>Style</h2>
      <p>Imposta la forma delle Tiles sul Webmix.</p>
    </div>
  `,
  collaborate: `
    <div class="settings-page">
                  <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>Collaborate</h2>
      <p>Collabora con altri utenti su questo Webmix.</p>
    </div>
  `,
  remove: `
    <div class="settings-page">
                  <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>Remove</h2>
      <p>Rimuovi questo Webmix. Attenzione: questa azione non è reversibile!</p>
    </div>
  `,
  background: `
    <div class="settings-page settings-page-bg">
      <div class="settings-header-bar">
        <button class="settings-back" onclick="showSettingsMenu()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="settings-close" onclick="toggleSettingsPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <h2>Background</h2>
      <div class="background-preview-label">Preview</div>
      <div class="background-preview-container">
        <div class="background-preview-label">Preview</div>
        <div class="background-preview-content" id="background-preview-content"></div>
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
  const container = document.getElementById('settings-page-content');
  const sidebar = document.querySelector('.settings-sidebar');
  if (settingsPages[pageName]) {
    // Se c'è già una pagina visibile, animazione sovrapposta (menu -> pagina)
    if (container.style.display === 'block' && container.innerHTML.trim() !== '') {
      // oldPage = menu, newPage = nuova pagina
      const oldPage = document.createElement('div');
      oldPage.className = container.className;
      oldPage.style.cssText = container.style.cssText + ';position:absolute;top:0;left:0;width:100%;height:100%;z-index:1110;pointer-events:none;';
      oldPage.innerHTML = window.settingsMenuHtml;
      oldPage.style.transform = 'translateX(0)';
      oldPage.style.opacity = '1';
      
      const newPage = document.createElement('div');
      newPage.className = container.className;
      newPage.style.cssText = container.style.cssText + ';position:absolute;top:0;left:0;width:100%;height:100%;z-index:1111;pointer-events:none;';
      newPage.innerHTML = settingsPages[pageName];
      newPage.style.transform = 'translateX(-100%)';
      newPage.style.opacity = '1';
      
      container.parentNode.appendChild(oldPage);
      container.parentNode.appendChild(newPage);
      sidebar.style.display = 'none';
      
      void oldPage.offsetWidth;
      oldPage.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s';
      newPage.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s';
      oldPage.style.transform = 'translateX(100%)'; // menu pushed right
      newPage.style.transform = 'translateX(0)';    // page enters from left
      
      let finished = 0;
      function cleanup() {
        finished++;
        if (finished === 2) {
          container.innerHTML = settingsPages[pageName];
          container.classList.remove('slide-in', 'slide-out');
          if (oldPage.parentNode) oldPage.parentNode.removeChild(oldPage);
          if (newPage.parentNode) newPage.parentNode.removeChild(newPage);
        }
      }
      oldPage.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'transform') {
          cleanup();
          oldPage.removeEventListener('transitionend', handler);
        }
      });
      newPage.addEventListener('transitionend', function handler2(e) {
        if (e.propertyName === 'transform') {
          cleanup();
          newPage.removeEventListener('transitionend', handler2);
        }
      });
    } else {
      // Primo caricamento: normale animazione entrata
      container.innerHTML = settingsPages[pageName];
      container.classList.remove('slide-in', 'slide-out');
      container.style.display = 'block';
      container.style.transform = 'translateX(100%)';
      container.style.opacity = '0';
      void container.offsetWidth;
      container.classList.add('slide-in');
      container.style.transform = '';
      container.style.opacity = '';
      sidebar.style.display = 'none';
    }
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






// Unica funzione per mostrare il menu delle impostazioni con animazione e fallback
window.showSettingsMenu = function() {
  const container = document.getElementById('settings-page-content');
  const sidebar = document.querySelector('.settings-sidebar');
  console.debug('[DEBUG] showSettingsMenu called');

  // Caso 1: c'è una pagina visibile, esegui animazione sovrapposta (pagina -> menu)
  if (container && container.style.display === 'block' && container.innerHTML.trim() !== '') {
    console.debug('[DEBUG] Animated transition: page -> menu');
    const oldPage = document.createElement('div');
    oldPage.className = container.className;
    oldPage.style.cssText = container.style.cssText + ';position:absolute;top:0;left:0;width:100%;height:100%;z-index:1110;pointer-events:none;';
    oldPage.innerHTML = container.innerHTML;
    oldPage.style.transform = 'translateX(0)';
    oldPage.style.opacity = '1';
    const newPage = document.createElement('div');
    newPage.className = container.className;
    newPage.style.cssText = container.style.cssText + ';position:absolute;top:0;left:0;width:100%;height:100%;z-index:1111;pointer-events:none;';
    newPage.innerHTML = window.settingsMenuHtml;
    newPage.style.transform = 'translateX(100%)';
    newPage.style.opacity = '1';
    container.parentNode.appendChild(oldPage);
    container.parentNode.appendChild(newPage);
    sidebar.style.display = 'none';
    void oldPage.offsetWidth;
    oldPage.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s';
    newPage.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s';
    oldPage.style.transform = 'translateX(-100%)';
    newPage.style.transform = 'translateX(0)';
    let finished = 0;
    function cleanup() {
      finished++;
      if (finished === 2) {
        container.innerHTML = '';
        container.style.display = 'none';
        sidebar.style.display = 'block';
        if (oldPage.parentNode) oldPage.parentNode.removeChild(oldPage);
        if (newPage.parentNode) newPage.parentNode.removeChild(newPage);
        console.debug('[DEBUG] Menu transition complete, cleaned up overlay nodes');
      }
    }
    oldPage.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'transform') {
        cleanup();
        oldPage.removeEventListener('transitionend', handler);
      }
    });
    newPage.addEventListener('transitionend', function handler2(e) {
      if (e.propertyName === 'transform') {
        cleanup();
        newPage.removeEventListener('transitionend', handler2);
      }
    });
    // Fallback: se transitionend non viene chiamato
    setTimeout(() => {
      if (finished < 2) {
        container.innerHTML = '';
        container.style.display = 'none';
        sidebar.style.display = 'block';
        if (oldPage.parentNode) oldPage.parentNode.removeChild(oldPage);
        if (newPage.parentNode) newPage.parentNode.removeChild(newPage);
        console.debug('[DEBUG] Menu transition fallback cleanup');
      }
    }, 600);
  } else {
    // Caso 2: nessuna pagina visibile, semplice slide-out/slide-in
    console.debug('[DEBUG] Simple slide-out/in menu transition');
    container.classList.remove('slide-in');
    container.classList.add('slide-out');
    container.style.display = 'block';
    sidebar.classList.remove('slide-out');
    sidebar.classList.add('slide-in');
    sidebar.style.display = 'block';
    let finished = 0;
    function cleanup() {
      finished++;
      if (finished === 2) {
        container.style.display = 'none';
        container.classList.remove('slide-out');
        sidebar.classList.remove('slide-in');
        console.debug('[DEBUG] Simple menu transition complete');
      }
    }
    container.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'transform') {
        container.removeEventListener('transitionend', handler);
        cleanup();
      }
    });
    sidebar.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'transform') {
        sidebar.removeEventListener('transitionend', handler);
        cleanup();
      }
    });
    // Fallback: se uno dei due non termina
    setTimeout(() => {
      if (finished < 2) {
        container.style.display = 'none';
        container.classList.remove('slide-out');
        sidebar.classList.remove('slide-in');
        console.debug('[DEBUG] Simple menu transition fallback cleanup');
      }
    }, 600);
  }
};


document.querySelectorAll('.settings-menu-item').forEach(btn => {
  btn.addEventListener('click', function() {
    const page = this.getAttribute('data-settings-page');
    if (!page) return;
    const sidebar = document.querySelector('.settings-sidebar');
    const container = document.getElementById('settings-page-content');
    // Start slide-out of sidebar
    sidebar.classList.add('slide-out');
    sidebar.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'transform' || e.propertyName === 'left') {
        sidebar.style.display = 'none';
        sidebar.classList.remove('slide-out');
        // Show settings page with slide-in
        showSettingsPage(page);
        container.classList.add('slide-in');
        container.style.display = 'block';
        sidebar.removeEventListener('transitionend', handler);
      }
    });
    // Fallback in case transitionend doesn't fire
    setTimeout(() => {
      if (sidebar.style.display !== 'none') {
        sidebar.style.display = 'none';
        sidebar.classList.remove('slide-out');
        showSettingsPage(page);
        container.classList.add('slide-in');
        container.style.display = 'block';
      }
    }, 400);
  });
});
// All'avvio: mostra solo il menu, non caricare nessuna pagina
const container = document.getElementById('settings-page-content');
const sidebar = document.querySelector('.settings-sidebar');
function showSettingsMenuOnly() {
  const container = document.getElementById('settings-page-content');
  const sidebar = document.querySelector('.settings-sidebar');
  if (container && sidebar) {
    // Restore menu HTML if missing
    if (window.settingsMenuHtml && (!sidebar.innerHTML || sidebar.innerHTML.trim() === '')) {
      sidebar.innerHTML = window.settingsMenuHtml;
    }
    // Reset sidebar classes
    sidebar.classList.remove('slide-out', 'slide-in');
    sidebar.style.display = 'block';
    // Hide and clear page content
    container.style.display = 'none';
    container.classList.remove('slide-in', 'slide-out');
    container.innerHTML = '';
    // Remove active state from all menu items
    sidebar.querySelectorAll('.settings-menu-item').forEach(btn => btn.classList.remove('active'));
    // Re-attach menu event listeners
    if (typeof window.initSettingsSidebarMenu === 'function') {
      console.log('[DEBUG] Calling initSettingsSidebarMenu after restoring menu HTML');
      window.initSettingsSidebarMenu();
    }
  }
}
showSettingsMenuOnly();

// Monkey patch per ripristinare il menu quando si apre il pannello impostazioni
if (typeof window.toggleSettingsPanel === 'function') {
  const origToggleSettingsPanel = window.toggleSettingsPanel;
  window.toggleSettingsPanel = function(...args) {
  const wasActive = AppConfig.dom.settingsPanel && AppConfig.dom.settingsPanel.classList.contains('active');
  origToggleSettingsPanel.apply(this, args);
  const isActive = AppConfig.dom.settingsPanel && AppConfig.dom.settingsPanel.classList.contains('active');
  if (!wasActive && isActive) {
    // Always restore menu state and sidebar
    showSettingsMenuOnly();
  }
};
  };


// --- BACKGROUND SETTINGS LOGIC ---

function initBackgroundSettingsEvents() {
  // Only run if background page is active
  const bgPage = document.querySelector('.settings-page-bg');
  if (!bgPage) return;

  // Elements
  const previewImg = document.getElementById('background-preview-img');
  const transparencyCheckbox = document.getElementById('webmix-transparency');
  const enableBgCheckbox = document.getElementById('enable-background');
  const bgTypeSelect = document.getElementById('background-type');
  const thumbnails = document.querySelectorAll('.background-thumb');

  // Dynamic elements for upload/color
  let uploadInput, colorInput;

  // Helper: update preview
  function updatePreview(src, type) {
    console.log('[DEBUG] updatePreview', {src, type});
    const previewBox = bgPage.querySelector('.background-preview');
    // Remove debug border and message for production
    previewBox.style.border = '';
    let debugMsg = previewBox.querySelector('.debug-msg');
    if (debugMsg) debugMsg.remove();
    if (type === 'color') {
      previewImg.style.display = 'none';
      previewBox.style.background = src;
    } else {
      previewImg.style.display = 'block';
      previewImg.src = src;
      previewBox.style.background = '';
    }
  }

  // Helper: save and apply
  function saveAndApplyBackground(value, type) {
    console.log('[DEBUG] saveAndApplyBackground', {value, type});
    if (type === 'color') {
      localStorage.setItem('backgroundImage', value); // Save color as background
    } else {
      localStorage.setItem('backgroundImage', value); // Save image URL/dataURL
    }
    // Enable background if not already
    if (!enableBgCheckbox.checked) {
      enableBgCheckbox.checked = true;
    }
    // Save enableBackground in settings
    const pageId = AppConfig.currentPage || 'home';
    if (AppConfig.settings[pageId]) {
      AppConfig.settings[pageId].enableBackground = true;
    }
    localStorage.setItem('settings', JSON.stringify(AppConfig.settings));
    if (typeof applySettings === 'function') applySettings();
  }

  // Transparency toggle
  if (transparencyCheckbox) {
    transparencyCheckbox.addEventListener('change', function() {
      const val = this.checked ? 20 : 0;
      const pageId = AppConfig.currentPage || 'home';
      if (AppConfig.settings[pageId]) {
        AppConfig.settings[pageId].windowOpacity = val;
        localStorage.setItem('settings', JSON.stringify(AppConfig.settings));
      }
      if (typeof applySettings === 'function') applySettings();
    });
  }

  // Enable custom background toggle
  if (enableBgCheckbox) {
    enableBgCheckbox.addEventListener('change', function() {
      const pageId = AppConfig.currentPage || 'home';
      if (AppConfig.settings[pageId]) {
        AppConfig.settings[pageId].enableBackground = this.checked;
        localStorage.setItem('settings', JSON.stringify(AppConfig.settings));
      }
      if (typeof applySettings === 'function') applySettings();
    });
  }

  // Background type selector
  if (bgTypeSelect) {
    bgTypeSelect.addEventListener('change', function() {
      // Remove any dynamic input
      if (uploadInput && uploadInput.parentNode) uploadInput.parentNode.removeChild(uploadInput);
      if (colorInput && colorInput.parentNode) colorInput.parentNode.removeChild(colorInput);
      if (this.value === 'upload') {
        uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.accept = 'image/*';
        uploadInput.style.margin = '10px 0';
        uploadInput.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
              updatePreview(ev.target.result, 'image');
              saveAndApplyBackground(ev.target.result, 'image');
            };
            reader.readAsDataURL(file);
          }
        });
        bgTypeSelect.parentNode.appendChild(uploadInput);
      } else if (this.value === 'colors') {
        colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.style.margin = '10px 0 0 10px';
        colorInput.addEventListener('input', function(e) {
          updatePreview(e.target.value, 'color');
          saveAndApplyBackground(e.target.value, 'color');
        });
        bgTypeSelect.parentNode.appendChild(colorInput);
      }
    });
  }

  // Thumbnails
  if (thumbnails) {
    thumbnails.forEach(img => {
      // Fallback if image fails to load
      img.onerror = function() {
        console.log('[DEBUG] Thumbnail failed to load:', this.src);
        this.src = 'assets/logo/logo.png'; // fallback local image
      };
      img.addEventListener('click', function() {
        updatePreview(this.src, 'image');
        saveAndApplyBackground(this.src, 'image');
      });
    });
  }

  // Initial preview: load from storage
  let bg = localStorage.getItem('backgroundImage');
  if (bg) {
    if (bg.startsWith('#')) {
      updatePreview(bg, 'color');
    } else {
      updatePreview(bg, 'image');
    }
  }
}

// Patch: when background settings page is shown, attach events
const origShowSettingsPage = window.showSettingsPage;
window.showSettingsPage = function(pageName) {
  const container = document.getElementById('settings-page-content');
  const sidebar = document.querySelector('.settings-sidebar');
  origShowSettingsPage.apply(this, arguments);
  // Start both transitions (inverted direction)
  container.classList.remove('slide-out');
  container.classList.add('slide-in');
  container.style.display = 'block';
  console.debug('[DEBUG] Pagina settings entra (slide-in), sidebar esce (slide-out)');
  // Animate sidebar out to the right
  sidebar.classList.remove('slide-in');
  sidebar.classList.add('slide-out');
  sidebar.style.display = 'block';

  // Wait for both transitions to finish before hiding sidebar
  let finished = 0;
  function cleanup() {
    finished++;
    if (finished === 2) {
      sidebar.style.display = 'none';
      sidebar.classList.remove('slide-out');
    }
  }
  // Listen for transitionend on both
  container.addEventListener('transitionend', function handler(e) {
    if (e.propertyName === 'transform') {
      container.removeEventListener('transitionend', handler);
      cleanup();
    }
  });
  sidebar.addEventListener('transitionend', function handler(e) {
    if (e.propertyName === 'transform') {
      sidebar.removeEventListener('transitionend', handler);
      cleanup();
    }
  });

  if (pageName === 'background') {
    // Inserisci la preview della griglia tiles
    const tilesGrid = document.getElementById('tiles-grid');
    const previewContent = document.getElementById('background-preview-content');
    if (tilesGrid && previewContent) {
      // Imposta il background dinamico se disponibile
      const previewContainer = previewContent.closest('.background-preview-container');
      let bg = window.getComputedStyle(document.body).backgroundImage;
      if (bg && bg !== 'none') {
        previewContainer.style.setProperty('--preview-bg', bg);
        previewContainer.style.backgroundImage = bg;
        previewContainer.style.backgroundSize = 'cover';
        previewContainer.style.backgroundPosition = 'center';
      } else {
        previewContainer.style.setProperty('--preview-bg', '#111');
        previewContainer.style.backgroundImage = 'none';
      }
      // Clona il nodo tiles-grid
      const gridClone = tilesGrid.cloneNode(true);
      gridClone.removeAttribute('id');
      gridClone.style.transform = 'scale(0.26)';
      gridClone.style.transformOrigin = 'top left';
      gridClone.style.pointerEvents = 'none';
      gridClone.style.margin = '0 auto';
      gridClone.style.position = 'relative';
      gridClone.style.boxShadow = 'none';
      gridClone.style.opacity = '0.85';
      // Centra verticalmente
      previewContent.style.display = 'flex';
      previewContent.style.alignItems = 'center';
      previewContent.style.justifyContent = 'center';
      // Pulisci il contenuto precedente
      previewContent.innerHTML = '';
      previewContent.appendChild(gridClone);
    }
    setTimeout(initBackgroundSettingsEvents, 0);
  }
};
