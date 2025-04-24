/**
 * settings.js - Gestione delle impostazioni dell'applicazione
 * 
 * Questo file contiene le funzioni per gestire le impostazioni dell'applicazione,
 * compreso il caricamento, il salvataggio e l'applicazione delle impostazioni.
 */

/**
 * Carica i dati dell'applicazione (impostazioni e pagine)
 */
function loadAppData() {
    // Carica tutte le impostazioni per pagina
    let allSettings = loadFromStorage('settings') || {};
    // Se non ci sono impostazioni per la Home, prova a prenderle dalla pagina nascosta
    if (!allSettings.home) {
        const hidden = document.getElementById('hidden-settings-fields');
        if (hidden) {
            allSettings.home = {
                appName: hidden.querySelector('#app-name')?.value || 'My Symbaloo',
                windowColor: hidden.querySelector('#window-color')?.value || '#a52a2a',
                emptyTileColor: hidden.querySelector('#empty-tile-color')?.value || '#800080',
                enableBackground: hidden.querySelector('#enable-background')?.checked || false,
                showEmptyTiles: hidden.querySelector('#show-empty-tiles')?.checked || true,
                windowOpacity: parseInt(hidden.querySelector('#transparency-slider')?.value) || 20,
                gridColumns: parseInt(hidden.querySelector('#grid-columns')?.value) || 9,
                gridRows: parseInt(hidden.querySelector('#grid-rows')?.value) || 9
            };
        } else {
            allSettings.home = AppConfig.defaultSettings;
        }
    }
    AppConfig.settings = allSettings;
    
    // Carica le pagine
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    
    // Carica l'ultima pagina visitata
    const lastPage = loadFromStorage('lastPage') || 'home';
    AppConfig.currentPage = lastPage;
    
    // Renderizza i bottoni delle pagine
    renderPageButtons();
    
    console.log("Dati dell'applicazione caricati", { allSettings, pages });
}

/**
 * Applica le impostazioni attuali all'interfaccia
 */
function applySettings() {
    const pageId = AppConfig.currentPage || 'home';
    const settings = AppConfig.settings[pageId] || AppConfig.settings.home;
    
    // Aggiorna l'interfaccia delle impostazioni
    updateSettingsInterface();
    
    // Aggiorna il titolo dell'applicazione
    document.title = settings.appName;
    AppConfig.dom.appTitle.textContent = settings.appName;
    
    // Imposta le variabili CSS per i colori e l'opacità
    document.documentElement.style.setProperty('--window-color', settings.windowColor);
    document.documentElement.style.setProperty('--empty-tile-color', settings.emptyTileColor);
    
    // Calcola l'opacità dallo slider di trasparenza (0-100 => trasparenza 0-85%)
    // Trasparenza 0% = opacità 1, Trasparenza 85% = opacità 0.15
    const opacity = 1 - (settings.windowOpacity / 100 * 0.85);
    document.documentElement.style.setProperty('--window-opacity', opacity);
    
    // Imposta le variabili CSS per la griglia
    document.documentElement.style.setProperty('--grid-columns', settings.gridColumns);
    document.documentElement.style.setProperty('--grid-rows', settings.gridRows);
    
    // Gestisce lo sfondo
    if (settings.enableBackground) {
        const backgroundUrl = loadFromStorage('backgroundImage');
        if (backgroundUrl) {
            document.documentElement.style.setProperty('--background-image', `url(${backgroundUrl})`);
        } else {
            document.documentElement.style.setProperty('--background-image', 'url(https://source.unsplash.com/random/1920x1080/?abstract)');
        }
    } else {
        document.documentElement.style.setProperty('--background-image', 'none');
    }
    
    // Gestisce i tile vuoti
    if (settings.showEmptyTiles) {
        document.documentElement.style.setProperty('--empty-tile-opacity', '0.5');
    } else {
        document.documentElement.style.setProperty('--empty-tile-opacity', '0');
    }
    
    console.log("Impostazioni applicate all'interfaccia");
    if (typeof switchPage === 'function') {
        switchPage(AppConfig.currentPage);
    }
}

/**
 * Aggiorna l'interfaccia del pannello impostazioni con i valori attuali
 */
function updateSettingsInterface() {
    const pageId = AppConfig.currentPage || 'home';
    const settings = AppConfig.settings[pageId] || AppConfig.settings.home;
    const form = AppConfig.dom.settingsForm;
    
    // Imposta i valori dei campi del form
    form.appName.value = settings.appName;
    form.windowColor.value = settings.windowColor;
    form.emptyTileColor.value = settings.emptyTileColor;
    form.enableBackground.checked = settings.enableBackground;
    form.showEmptyTiles.checked = settings.showEmptyTiles;
    form.transparencySlider.value = settings.windowOpacity;
    form.gridColumns.value = settings.gridColumns;
    form.gridRows.value = settings.gridRows;
}

/**
 * Salva le impostazioni dal form
 */
function saveSettings() {
    const form = AppConfig.dom.settingsForm;
    const settings = {
        appName: form.appName.value,
        windowColor: form.windowColor.value,
        emptyTileColor: form.emptyTileColor.value,
        enableBackground: form.enableBackground.checked,
        showEmptyTiles: form.showEmptyTiles.checked,
        windowOpacity: parseInt(form.transparencySlider.value), // Valore tra 15 e 85
        gridColumns: parseInt(form.gridColumns.value),
        gridRows: parseInt(form.gridRows.value)
    };
    
    // Valida le impostazioni
    if (settings.gridColumns < 4) settings.gridColumns = 4;
    if (settings.gridColumns > 12) settings.gridColumns = 12;
    if (settings.gridRows < 3) settings.gridRows = 3;
    if (settings.gridRows > 10) settings.gridRows = 10;
    
    // Aggiorna le impostazioni solo per la pagina corrente
    const pageId = AppConfig.currentPage || 'home';
    AppConfig.settings[pageId] = settings;
    
    // Salva tutte le impostazioni
    saveToStorage('settings', AppConfig.settings);
    
    // Applica le impostazioni
    applySettings();
    
    // Chiudi il pannello impostazioni
    if (typeof window.toggleSettingsPanel === 'function') {
        window.toggleSettingsPanel(false);
    } else {
        // Fallback: nascondi direttamente
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) settingsPanel.style.display = 'none';
    }
    
    // Ridisegna la griglia attuale
    renderCurrentPage();
    
    console.log("Impostazioni salvate", settings);
}

/**
 * Mostra un dialogo per selezionare un'immagine di sfondo
 */
function showBackgroundSelection() {
    const url = prompt("Inserisci l'URL dell'immagine di sfondo o lascia vuoto per usare un'immagine casuale:");
    
    if (url !== null) {
        if (url.trim() === '') {
            // Usa un'immagine casuale
            saveToStorage('backgroundImage', 'https://source.unsplash.com/random/1920x1080/?abstract');
        } else {
            // Usa l'URL specificato
            saveToStorage('backgroundImage', url.trim());
        }
        
        // Applica lo sfondo
        if (AppConfig.settings.enableBackground) {
            applySettings();
        }
    }
}

/**
 * Gestione menu sidebar impostazioni
 */
window.initSettingsSidebarMenu = function initSettingsSidebarMenu() {
  const menuItems = document.querySelectorAll('.settings-menu-item');
  const pages = document.querySelectorAll('.settings-page');
  menuItems.forEach(btn => {
    // Rimuovi tutti i listener precedenti clonando il nodo
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', function() {
      const page = this.getAttribute('data-settings-page');
      console.debug('[DEBUG] Click menu item:', page, this);
      if (typeof window.showSettingsPage === 'function') {
        window.showSettingsPage(page);
      }
    });
  });
}

/**
 * Aggiunge event listener per gli elementi del pannello impostazioni
 */
function initSettingsEvents() {
    // Listener per chiusura settings se si clicca fuori
    document.addEventListener('click', function(event) {
        const settingsPanel = document.getElementById('settings-panel');
        const settingsButton = document.getElementById('settings-button');
        // Se il pannello non è visibile, non fare nulla
        if (!settingsPanel || settingsPanel.style.display === 'none') return;
        // Se il click è dentro il pannello o sul pulsante di apertura, non fare nulla
        if (settingsPanel.contains(event.target) || (settingsButton && settingsButton.contains(event.target))) {
            return;
        }
        // Altrimenti chiudi il pannello
        if (typeof window.toggleSettingsPanel === 'function') {
            window.toggleSettingsPanel(false); // Assumiamo che false chiuda
        } else {
            // Fallback: nascondi direttamente
            settingsPanel.style.display = 'none';
        }
    });
    // Aggiunge event listener per il cambio di impostazioni in tempo reale
    AppConfig.dom.settingsForm.appName.addEventListener('input', updateAppName);
    AppConfig.dom.settingsForm.windowColor.addEventListener('input', updateWindowColor);
    AppConfig.dom.settingsForm.emptyTileColor.addEventListener('input', updateEmptyTileColor);
    AppConfig.dom.settingsForm.transparencySlider.addEventListener('input', updateWindowOpacity);
    
    // Gestisce la visualizzazione del selettore di sfondo
    const backgroundSelectorContainer = document.getElementById('background-selector-container');
    const selectBackgroundButton = document.getElementById('select-background');
    
    // Event listener per il checkbox di attivazione sfondo
    AppConfig.dom.settingsForm.enableBackground.addEventListener('change', function() {
        // Mostra/nascondi il selettore di sfondo in base allo stato del checkbox
        backgroundSelectorContainer.style.display = this.checked ? 'block' : 'none';
        
        // Aggiorna l'anteprima dello sfondo
        if (this.checked) {
            const backgroundUrl = loadFromStorage('backgroundImage');
            if (backgroundUrl) {
                document.documentElement.style.setProperty('--background-image', `url(${backgroundUrl})`);
            } else {
                document.documentElement.style.setProperty('--background-image', 'url(https://source.unsplash.com/random/1920x1080/?abstract)');
            }
        } else {
            document.documentElement.style.setProperty('--background-image', 'none');
        }
    });
    
    // Event listener per il pulsante di selezione sfondo
    if (selectBackgroundButton) {
        selectBackgroundButton.addEventListener('click', showBackgroundSelection);
    }
    
    // Inizializza la visualizzazione del selettore di sfondo in base allo stato iniziale
    if (AppConfig.settings?.enableBackground) {
        backgroundSelectorContainer.style.display = 'block';
    } else {
        backgroundSelectorContainer.style.display = 'none';
    }
    
    // Funzione per aggiornare il titolo dell'app in tempo reale
    function updateAppName() {
        const newName = AppConfig.dom.settingsForm.appName.value;
        AppConfig.dom.appTitle.textContent = newName;
    }
    
    // Funzione per aggiornare il colore delle finestre in tempo reale
    function updateWindowColor() {
        const newColor = AppConfig.dom.settingsForm.windowColor.value;
        document.documentElement.style.setProperty('--window-color', newColor);
    }
    
    // Funzione per aggiornare il colore dei tile vuoti in tempo reale
    function updateEmptyTileColor() {
        const newColor = AppConfig.dom.settingsForm.emptyTileColor.value;
        document.documentElement.style.setProperty('--empty-tile-color', newColor);
    }
    
    // Funzione per aggiornare l'opacità delle finestre in tempo reale
    function updateWindowOpacity() {
        // Valori slider: 0-100 significa trasparenza 0-85%
        // In termini di opacità CSS: slider 0 = opacità 1, slider 100 = opacità 0.15
        const slider = AppConfig.dom.settingsForm.transparencySlider;
        const value = parseInt(slider.value);
        
        // Calcola l'opacità: 1 = completamente opaco, 0.15 = 85% trasparente
        const opacity = 1 - (value / 100 * 0.85);
        
        document.documentElement.style.setProperty('--window-opacity', opacity);
    }
    

}

// L'inizializzazione viene ora gestita dalla funzione initEvents() in app.js
