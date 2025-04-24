/**
 * app.js - Logica principale dell'applicazione
 * 
 * Questo file gestisce l'inizializzazione dell'applicazione, la gestione delle pagine
 * e la coordinazione tra i diversi componenti.
 */

// Configurazione globale dell'applicazione
const AppConfig = {
    // Impostazioni predefinite
    defaultSettings: {
        appName: "My Symbaloo",
        windowColor: "#ffffff",
        emptyTileColor: "#e0e0e0",
        enableBackground: false,
        showEmptyTiles: true,
        windowOpacity: 90,
        gridColumns: 8,
        gridRows: 6
    },
    
    // Pagine predefinite
    defaultPages: [
        {
            id: "home",
            name: "Home",
            icon: "home",
            tiles: []
        }
    ],
    
    // Stato corrente dell'applicazione
    currentPage: "home",
    isEditing: false,
    editingTile: null,
    draggingTile: null,
    
    // Cache DOM
    dom: {}
};

/**
 * Inizializza l'applicazione
 */
function initApp() {
    console.log("Inizializzazione dell'applicazione...");
    
    // Cache dei riferimenti DOM
    cacheDOM();
    
    // Carica le impostazioni e i dati salvati
    loadAppData();
    
    // Applica le impostazioni
    applySettings();
    
    // Inizializza gli event listener
    initEvents();
    
    // Renderizza la pagina corrente (ora spostato in applySettings)
    
    console.log("Applicazione inizializzata con successo!");
}

/**
 * Memorizza riferimenti agli elementi DOM frequentemente utilizzati
 */
function cacheDOM() {
    AppConfig.dom = {
        // Header
        appTitle: document.querySelector('.app-title'),
        pageTitle: document.querySelector('.page-title'),
        searchInput: document.getElementById('search-input'),
        searchButton: document.getElementById('search-button'),
        
        // Sidebar
        settingsButton: document.getElementById('settings-button'),
        homeButton: document.getElementById('home-button'),
        pagesButtons: document.getElementById('pages-buttons'),
        addPageButton: document.getElementById('add-page-button'),
        
        // Pannelli
        settingsPanel: document.getElementById('settings-panel'),
        tileEditPanel: document.getElementById('tile-edit-panel'),
        groupOverlay: document.getElementById('group-overlay'),
        
        // Griglia tile
        tilesGrid: document.getElementById('tiles-grid'),
        
        // Bottoni di chiusura
        closeSettings: document.getElementById('close-settings'),
        closeEdit: document.getElementById('close-edit'),
        closeGroup: document.getElementById('close-group'),
        
        // Form settings
        settingsForm: {
            appName: document.getElementById('app-name'),
            windowColor: document.getElementById('window-color'),
            emptyTileColor: document.getElementById('empty-tile-color'),
            enableBackground: document.getElementById('enable-background'),
            showEmptyTiles: document.getElementById('show-empty-tiles'),
            transparencySlider: document.getElementById('transparency-slider'),
            gridColumns: document.getElementById('grid-columns'),
            gridRows: document.getElementById('grid-rows'),
            saveSettings: document.getElementById('save-settings')
        },
        
        // Form di modifica tile
        tileEditForm: {
            editPanelTitle: document.getElementById('edit-panel-title'),
            tileType: document.getElementById('tile-type'),
            tileIconType: document.getElementById('tile-icon-type'),
            predefinedIcons: document.getElementById('predefined-icons'),
            uploadIconArea: document.getElementById('upload-icon-area'),
            onlineIconArea: document.getElementById('online-icon-area'),
            iconFile: document.getElementById('icon-file'),
            iconUrl: document.getElementById('icon-url'),
            iconPreview: document.getElementById('icon-preview-container'),
            tileTitle: document.getElementById('tile-title'),
            tileUrl: document.getElementById('tile-url'),
            tileDisplay: document.getElementById('tile-display'),
            tileColor: document.getElementById('tile-color'),
            tileWidth: document.getElementById('tile-width'),
            tileHeight: document.getElementById('tile-height'),
            groupColumns: document.getElementById('group-columns'),
            groupRows: document.getElementById('group-rows'),
            tileLocked: document.getElementById('tile-locked'),
            saveTile: document.getElementById('save-tile'),
            cancelEdit: document.getElementById('cancel-edit'),
            urlContainer: document.getElementById('url-container'),
            tileSizeContainer: document.getElementById('tile-size-container'),
            groupSizeContainer: document.getElementById('group-size-container')
        },
        
        // Gruppo di tile
        groupPopup: {
            groupTitle: document.getElementById('group-title'),
            groupTiles: document.getElementById('group-tiles'),
            addGroupTile: document.getElementById('add-group-tile')
        }
    };
}

/**
 * Inizializza gli event listener dell'applicazione
 */
function initEvents() {
    // Eventi della barra di ricerca
    AppConfig.dom.searchButton.addEventListener('click', handleSearch);
    AppConfig.dom.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Eventi della sidebar
   // if (AppConfig.dom.settingsButton) AppConfig.dom.settingsButton.addEventListener('click', toggleSettingsPanel);
    if (AppConfig.dom.homeButton) AppConfig.dom.homeButton.addEventListener('click', () => switchPage('home'));
    if (AppConfig.dom.addPageButton) AppConfig.dom.addPageButton.addEventListener('click', showAddPageDialog);
    
    // Eventi dei pannelli
    if (AppConfig.dom.closeSettings) AppConfig.dom.closeSettings.addEventListener('click', toggleSettingsPanel);
    if (AppConfig.dom.closeEdit) AppConfig.dom.closeEdit.addEventListener('click', closeTileEditPanel);
    if (AppConfig.dom.closeGroup) AppConfig.dom.closeGroup.addEventListener('click', closeGroupOverlay);
    
    // Eventi delle impostazioni
    if (AppConfig.dom.settingsForm.saveSettings) AppConfig.dom.settingsForm.saveSettings.addEventListener('click', saveSettings);
    
    // Inizializza gli eventi del pannello impostazioni per aggiornamenti in tempo reale
    initSettingsEvents();
    
    // Eventi di modifica tile
    AppConfig.dom.tileEditForm.tileType.addEventListener('change', updateTileTypeInterface);
    AppConfig.dom.tileEditForm.tileIconType.addEventListener('change', updateIconSelection);
    AppConfig.dom.tileEditForm.iconFile.addEventListener('change', handleIconFileUpload);
    AppConfig.dom.tileEditForm.iconUrl.addEventListener('input', handleIconUrlInput);
    AppConfig.dom.tileEditForm.saveTile.addEventListener('click', saveTileEdit);
    AppConfig.dom.tileEditForm.cancelEdit.addEventListener('click', closeTileEditPanel);
    
    // Eventi del gruppo
    AppConfig.dom.groupPopup.addGroupTile.addEventListener('click', addTileToGroup);
    
    // Carica le icone predefinite
    loadPredefinedIcons();
}

/**
 * Gestisce la ricerca tramite il campo di ricerca
 */
function handleSearch() {
    const query = AppConfig.dom.searchInput.value.trim();
    if (query) {
        // Apertura in una nuova scheda
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        AppConfig.dom.searchInput.value = '';
    }
}

/**
 * Mostra/nasconde il pannello delle impostazioni
 */
function toggleSettingsPanel(force) {
    console.log('[DEBUG] toggleSettingsPanel called', force);
    if (!AppConfig.dom.settingsPanel) {
        console.error('[DEBUG] settingsPanel element not found!');
        return;
    }
    // Rimuovi evidenziazione da tutti i menu
    document.querySelectorAll('.settings-menu-item.active').forEach(el => el.classList.remove('active'));
    if (force === true) {
        AppConfig.dom.settingsPanel.classList.add('active');
    } else if (force === false) {
        AppConfig.dom.settingsPanel.classList.remove('active');
        AppConfig.editingTile = null;
        if (typeof renderCurrentPage === 'function') {
            renderCurrentPage();
        }
    } else {
        AppConfig.dom.settingsPanel.classList.toggle('active');
        if (!AppConfig.dom.settingsPanel.classList.contains('active')) {
            AppConfig.editingTile = null;
            if (typeof renderCurrentPage === 'function') {
                renderCurrentPage();
            }
        }
    }
}


/**
 * Mostra/nasconde il pannello di modifica tile
 */
function openTileEditPanel(tile = null) {
    // DEBUG: mostra quando viene chiamato e con quale tile
    console.log('--- DEBUG openTileEditPanel ---');
    console.log('tile passato:', tile);

    // Imposta il titolo del pannello
    AppConfig.dom.tileEditForm.editPanelTitle.textContent = tile ? "Modifica tile" : "Crea nuovo tile";
    
    // Se si sta modificando un tile esistente, popola i campi
    if (tile) {
        AppConfig.editingTile = tile;
        populateTileEditForm(tile);
    } else {
        AppConfig.editingTile = null;
        resetTileEditForm();
    }
    // Aggiorna la griglia per evidenziare il tile selezionato
    if (typeof renderCurrentPage === 'function') {
        renderCurrentPage();
    }
    
    // Mostra il pannello
    AppConfig.dom.tileEditPanel.classList.add('active');
}

/**
 * Chiude il pannello di modifica tile
 */
function closeTileEditPanel() {
    AppConfig.dom.tileEditPanel.classList.remove('active');
    AppConfig.editingTile = null;
    if (typeof renderCurrentPage === 'function') {
        renderCurrentPage();
    }
}

/**
 * Chiude l'overlay del gruppo di tile
 */
function closeGroupOverlay() {
    AppConfig.dom.groupOverlay.style.display = 'none';
}

/**
 * Cambia la pagina corrente
 * @param {string} pageId - ID della pagina da visualizzare
 */
function switchPage(pageId) {
    // Trova la pagina con l'ID specificato
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    const targetPage = pages.find(page => page.id === pageId);
    
    if (!targetPage) {
        console.error(`Pagina con ID ${pageId} non trovata`);
        return;
    }
    
    // Aggiorna lo stato corrente
    AppConfig.currentPage = pageId;
    
    // Aggiorna il titolo della pagina
    AppConfig.dom.pageTitle.textContent = targetPage.name;
    
    // Aggiorna la classe attiva sui bottoni della sidebar
    document.querySelectorAll('.sidebar-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`[data-page-id="${pageId}"]`) || AppConfig.dom.homeButton;
    activeButton.classList.add('active');
    
    // Renderizza la pagina
    renderCurrentPage();
    
    // Salva l'ultima pagina visitata
    saveToStorage('lastPage', pageId);
}

/**
 * Mostra un dialogo per aggiungere una nuova pagina
 */
function showAddPageDialog() {
    const pageName = prompt("Inserisci il nome della nuova pagina:", "Nuova pagina");
    if (pageName) {
        addNewPage(pageName);
    }
}

/**
 * Aggiunge una nuova pagina
 * @param {string} pageName - Nome della nuova pagina
 */
function addNewPage(pageName) {
    // Carica le pagine esistenti
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    
    // Crea un ID univoco per la nuova pagina
    const pageId = `page_${Date.now()}`;
    
    // Crea la nuova pagina
    const newPage = {
        id: pageId,
        name: pageName,
        icon: "bookmark",
        tiles: []
    };
    
    // Aggiungi la nuova pagina
    pages.push(newPage);
    
    // Salva le modifiche
    saveToStorage('pages', pages);
    
    // Aggiorna i bottoni delle pagine
    renderPageButtons();
    
    // Passa alla nuova pagina
    switchPage(pageId);
}

/**
 * Renderizza i bottoni delle pagine nella sidebar
 */
function renderPageButtons() {
    // Ottieni le pagine salvate
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    
    // Svuota il contenitore dei bottoni
    AppConfig.dom.pagesButtons.innerHTML = '';
    
    // Renderizza i bottoni per tutte le pagine tranne Home (che ha sempre il suo bottone dedicato)
    pages.forEach(page => {
        if (page.id !== 'home') {
            const button = document.createElement('button');
            button.className = `sidebar-button ${page.id === AppConfig.currentPage ? 'active' : ''}`;
            button.setAttribute('data-page-id', page.id);
            button.innerHTML = `<i class="fas fa-${page.icon}"></i>`;
            button.title = page.name;
            
            button.addEventListener('click', () => switchPage(page.id));
            
            AppConfig.dom.pagesButtons.appendChild(button);
        }
    });
}

/**
 * Carica l'applicazione all'avvio
 */
document.addEventListener('DOMContentLoaded', initApp);
