/**
 * tiles.js - Gestione dei tile dell'applicazione
 * 
 * Questo file contiene le funzioni per la gestione dei tile, inclusa
 * la creazione, modifica, eliminazione e visualizzazione dei tile.
 */

/**
 * Renderizza la pagina corrente con i relativi tile
 */
function renderCurrentPage() {
    // Ottieni i dati della pagina corrente
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    const currentPage = pages.find(page => page.id === AppConfig.currentPage);
    
    if (!currentPage) {
        console.error(`Pagina corrente "${AppConfig.currentPage}" non trovata`);
        return;
    }
    
    // Memorizza i tile della pagina
    const tiles = currentPage.tiles || [];
    
    // Ottieni le dimensioni della griglia dalle impostazioni
    const gridColumns = AppConfig.settings?.gridColumns || 8;
    const gridRows = AppConfig.settings?.gridRows || 6;
    
    // Calcola il numero totale di celle nella griglia
    const totalCells = gridColumns * gridRows;
    
    // Svuota il contenitore dei tile
    AppConfig.dom.tilesGrid.innerHTML = '';
    
    // Crea una matrice per tenere traccia delle celle occupate
    const occupiedCells = Array(gridRows).fill().map(() => Array(gridColumns).fill(false));
    
    // Marca le celle occupate dai tile esistenti
    tiles.forEach(tile => {
        const { x, y, width, height } = tile;
        
        // Controlla se le coordinate sono valide
        if (x >= 0 && y >= 0 && x < gridColumns && y < gridRows) {
            // Marca le celle occupate dal tile
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    if (y + i < gridRows && x + j < gridColumns) {
                        occupiedCells[y + i][x + j] = true;
                    }
                }
            }
        }
    });
    
    // Renderizza i tile esistenti
    tiles.forEach(tile => renderTile(tile));
    
    // Aggiungi tile vuoti nelle celle non occupate se l'opzione è abilitata
    if (AppConfig.settings?.showEmptyTiles) {
        for (let y = 0; y < gridRows; y++) {
            for (let x = 0; x < gridColumns; x++) {
                if (!occupiedCells[y][x]) {
                    // Crea un tile vuoto
                    const emptyTile = {
                        id: `empty_${x}_${y}`,
                        type: 'empty',
                        x: x,
                        y: y,
                        width: 1,
                        height: 1
                    };
                    
                    // Renderizza il tile vuoto
                    renderTile(emptyTile);
                }
            }
        }
    }
    
    // PATCH: Assicura che tutti i tile abbiano il drag abilitato
    const allTiles = AppConfig.dom.tilesGrid.querySelectorAll('.tile');
    allTiles.forEach(tileEl => {
        if (!tileEl.classList.contains('empty') && !tileEl.classList.contains('locked')) {
            if (!tileEl.hasAttribute('data-drag-enabled')) {
                enableDragForTile(tileEl);
                tileEl.setAttribute('data-drag-enabled', 'true');
            }
        }
    });

    console.log(`Pagina "${currentPage.name}" renderizzata con ${tiles.length} tile`);
}

/**
 * Renderizza un singolo tile nella griglia
 * @param {Object} tile - Oggetto contenente i dati del tile
 */
function renderTile(tile) {
    // Crea l'elemento del tile
    const tileElement = document.createElement('div');
    tileElement.className = `tile ${tile.type || 'single'}`;
    tileElement.id = tile.id;
    
    // Imposta gli attributi di posizione e dimensione
    tileElement.style.gridColumnStart = tile.x + 1;
    tileElement.style.gridRowStart = tile.y + 1;
    
    // Imposta la larghezza e l'altezza dinamicamente, sia come attributi che come stile diretto
    const width = tile.width || 1;
    const height = tile.height || 1;
    
    tileElement.setAttribute('data-width', width);
    tileElement.setAttribute('data-height', height);
    tileElement.style.gridColumnEnd = `span ${width}`;
    tileElement.style.gridRowEnd = `span ${height}`;
    tileElement.setAttribute('data-x', tile.x);
    tileElement.setAttribute('data-y', tile.y);
    
    // Imposta il colore del tile
    if (tile.color && tile.type !== 'empty') {
        tileElement.style.backgroundColor = tile.color;
    }
    
    // Se il tile è bloccato, aggiungi la classe
    if (tile.locked) {
        tileElement.classList.add('locked');
    }
    
    // Contenuto del tile in base al tipo
    if (tile.type === 'empty') {
        // Per i tile vuoti, aggiungi solo l'evento click per la creazione
        tileElement.addEventListener('click', () => openTileEditPanel({ x: tile.x, y: tile.y }));
    } else if (tile.type === 'group') {
        // Per i tile di gruppo, aggiungi l'icona della cartella e il titolo
        tileElement.innerHTML = `
            <div class="tile-icon">
                ${tile.icon ? (
                    (tile.icon.startsWith('fas fa-') || tile.icon.startsWith('fab fa-') || tile.icon.startsWith('far fa-'))
                        ? `<i class="${tile.icon}"></i>`
                        : `<img src="${tile.icon}" alt="${tile.title || 'Gruppo'}">`
                ) : '<i class="fas fa-folder"></i>'}
            </div>
            <div class="tile-info-bar">
                <div class="tile-title">${tile.title || 'Gruppo'}</div>
            </div>
            <div class="tile-action folder-indicator"><i class="fas fa-folder"></i></div>
            <div class="tile-action delete-action"><i class="fas fa-times"></i></div>
            <div class="tile-action edit-action"><i class="fas fa-cog"></i></div>
        `;
        
        // Aggiungi eventi per le azioni
        // Aggiungi evento solo se la X è presente
        const deleteAction = tileElement.querySelector('.delete-action');
        if (deleteAction) {
            deleteAction.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTile(tile.id);
            });
        }
        
        // L'azione di modifica: se bloccato il lucchetto apre il pannello, altrimenti la matita/ingranaggio
        if (tile.locked) {
            const lockAction = tileElement.querySelector('.lock-action');
            if (lockAction) {
                lockAction.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openTileEditPanel(tile);
                });
            }
        } else {
            const editAction = tileElement.querySelector('.edit-action');
if (editAction) {
    editAction.addEventListener('click', (e) => {
        e.stopPropagation();
        openTileEditPanel(tile);
    });
}
        }
        
        // Evento click sul tile per aprire il gruppo
        tileElement.addEventListener('click', () => openGroupTiles(tile));
    } else {
        // Per i tile singoli, aggiungi l'icona, il titolo e l'URL
        let tileContent = `
            <div class="tile-icon">
                ${tile.icon ? (
                    (tile.icon.startsWith('fas fa-') || tile.icon.startsWith('fab fa-') || tile.icon.startsWith('far fa-'))
                        ? `<i class="${tile.icon}"></i>`
                        : `<img src="${tile.icon}" alt="${tile.title || ''}">`
                ) : '<i class="fas fa-globe"></i>'}
            </div>
        `;
        
        // Crea la fascia informativa in basso con titolo e URL
        let infoBar = '<div class="tile-info-bar">';
        
        // Aggiungi titolo e URL in base alle preferenze di visualizzazione
        if (tile.display === 'title' || tile.display === 'both' || !tile.display) {
            infoBar += `<div class="tile-title">${tile.title || ''}</div>`;
        }
        
        if (tile.display === 'url' || tile.display === 'both') {
            infoBar += `<div class="tile-url">${tile.url || ''}</div>`;
        }
        
        infoBar += '</div>';
        tileContent += infoBar;
        
        // Aggiungi le azioni
        tileContent += `
            <div class="tile-action open-action"><i class="fas fa-external-link-alt"></i></div>
            ${!tile.locked ? '<div class="tile-action delete-action"><i class="fas fa-times"></i></div>' : ''}
            ${tile.locked ? '<div class="tile-action lock-action"><i class="fas fa-lock"></i></div>' : '<div class="tile-action edit-action"><i class="fas fa-cog"></i></div>'}
        `;
        
        tileElement.innerHTML = tileContent;
        
        // Aggiungi eventi per le azioni
        // Aggiungi evento solo se la X è presente
        const deleteAction = tileElement.querySelector('.delete-action');
        if (deleteAction) {
            deleteAction.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTile(tile.id);
            });
        }
        
        // L'azione di modifica: se bloccato il lucchetto apre il pannello, altrimenti la matita/ingranaggio
        if (tile.locked) {
            const lockAction = tileElement.querySelector('.lock-action');
            if (lockAction) {
                lockAction.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openTileEditPanel(tile);
                });
            }
        } else {
            const editAction = tileElement.querySelector('.edit-action');
if (editAction) {
    editAction.addEventListener('click', (e) => {
        e.stopPropagation();
        openTileEditPanel(tile);
    });
}
        }
        
        tileElement.querySelector('.open-action').addEventListener('click', (e) => {
            e.stopPropagation();
            if (tile.url) {
                window.open(tile.url, '_blank');
            }
        });
        
        // Evento click sul tile per aprire l'URL
        tileElement.addEventListener('click', () => {
            if (tile.url) {
                window.location.href = tile.url;
            }
        });
    }
    
    // Aggiungi il tile alla griglia
    AppConfig.dom.tilesGrid.appendChild(tileElement);
}

/**
 * Elimina un tile
 * @param {string} tileId - ID del tile da eliminare
 */
function deleteTile(tileId) {
    // Chiedi conferma
    if (!confirm('Sei sicuro di voler eliminare questo tile?')) {
        return;
    }
    
    // Ottieni le pagine e la pagina corrente
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    const pageIndex = pages.findIndex(page => page.id === AppConfig.currentPage);
    
    if (pageIndex === -1) {
        console.error('Pagina corrente non trovata');
        return;
    }
    
    // Trova l'indice del tile nella pagina
    const tileIndex = pages[pageIndex].tiles.findIndex(tile => tile.id === tileId);
    
    if (tileIndex === -1) {
        console.error(`Tile con ID ${tileId} non trovato`);
        return;
    }
    
    // Rimuovi il tile
    pages[pageIndex].tiles.splice(tileIndex, 1);
    
    // Salva le modifiche
    saveToStorage('pages', pages);
    
    // Aggiorna la visualizzazione
    renderCurrentPage();
    
    console.log(`Tile con ID ${tileId} eliminato`);
}

/**
 * Aggiorna l'interfaccia del form di modifica del tile in base al tipo selezionato
 */
function updateTileTypeInterface() {
    const tileType = AppConfig.dom.tileEditForm.tileType.value;
    const urlContainer = AppConfig.dom.tileEditForm.urlContainer;
    const tileSizeContainer = AppConfig.dom.tileEditForm.tileSizeContainer;
    const groupSizeContainer = AppConfig.dom.tileEditForm.groupSizeContainer;
    
    // Mostra/nascondi il campo URL in base al tipo di tile
    if (tileType === 'group') {
        urlContainer.style.display = 'none';
        tileSizeContainer.style.display = 'none';
        groupSizeContainer.style.display = 'block';
    } else {
        urlContainer.style.display = 'block';
        tileSizeContainer.style.display = 'block';
        groupSizeContainer.style.display = 'none';
    }
}

/**
 * Aggiorna l'interfaccia di selezione delle icone in base al tipo selezionato
 */
function updateIconSelection() {
    const iconType = AppConfig.dom.tileEditForm.tileIconType.value;
    const predefinedIcons = AppConfig.dom.tileEditForm.predefinedIcons;
    const uploadIconArea = AppConfig.dom.tileEditForm.uploadIconArea;
    const onlineIconArea = AppConfig.dom.tileEditForm.onlineIconArea;
    
    // Mostra/nascondi le aree di selezione delle icone
    predefinedIcons.style.display = iconType === 'predefined' ? 'grid' : 'none';
    uploadIconArea.style.display = iconType === 'upload' ? 'block' : 'none';
    onlineIconArea.style.display = iconType === 'online' ? 'block' : 'none';
}

/**
 * Carica le icone predefinite nel selettore
 */
function loadPredefinedIcons() {
    const iconContainer = AppConfig.dom.tileEditForm.predefinedIcons;
    
    // Array di icone Font Awesome predefinite
    const icons = [
        'home', 'user', 'heart', 'star', 'cog', 
        'envelope', 'bell', 'calendar', 'image', 'video',
        'music', 'file', 'folder', 'shopping-cart', 'chart-bar',
        'globe', 'map-marker', 'clock', 'search', 'link'
    ];
    
    // Svuota il container
    iconContainer.innerHTML = '';
    
    // Aggiungi le icone
    icons.forEach(icon => {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-option';
        iconElement.innerHTML = `<i class="fas fa-${icon}"></i>`;
        iconElement.setAttribute('data-icon', icon);
        
        // Evento di selezione dell'icona
        iconElement.addEventListener('click', () => {
            // Rimuovi la classe selected da tutti gli elementi
            document.querySelectorAll('.icon-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Aggiungi la classe selected a questo elemento
            iconElement.classList.add('selected');
            
            // Aggiorna l'anteprima
            AppConfig.dom.tileEditForm.iconPreview.innerHTML = `<i class="fas fa-${icon}"></i>`;
            
            // Memorizza l'icona selezionata
            AppConfig.selectedIcon = `fas fa-${icon}`;
        });
        
        iconContainer.appendChild(iconElement);
    });
}

/**
 * Gestisce il caricamento di un file di icona
 */
function handleIconFileUpload() {
    const fileInput = AppConfig.dom.tileEditForm.iconFile;
    const file = fileInput.files[0];
    
    if (file) {
        // Verifica che sia un'immagine
        if (!file.type.startsWith('image/')) {
            alert('Per favore seleziona un file immagine valido.');
            fileInput.value = '';
            return;
        }
        
        // Crea un oggetto URL per l'anteprima
        const imageUrl = URL.createObjectURL(file);
        
        // Aggiorna l'anteprima
        AppConfig.dom.tileEditForm.iconPreview.innerHTML = `<img src="${imageUrl}" alt="Icona">`;
        
        // Memorizza il file selezionato
        AppConfig.selectedIcon = file;
    }
}

/**
 * Gestisce l'input di un URL per l'icona
 */
function handleIconUrlInput() {
    const iconUrl = AppConfig.dom.tileEditForm.iconUrl.value.trim();
    
    if (iconUrl) {
        // Aggiorna l'anteprima con l'URL fornito
        AppConfig.dom.tileEditForm.iconPreview.innerHTML = `<img src="${iconUrl}" alt="Icona">`;
        
        // Memorizza l'URL dell'icona
        AppConfig.selectedIcon = iconUrl;
    }
}

/**
 * Popola il form di modifica con i dati di un tile esistente
 * @param {Object} tile - Dati del tile da modificare
 */
function populateTileEditForm(tile) {
    const form = AppConfig.dom.tileEditForm;
    
    // Imposta i valori del form
    form.tileType.value = tile.type || 'single';
    form.tileTitle.value = tile.title || '';
    form.tileUrl.value = tile.url || '';
    form.tileDisplay.value = tile.display || 'title';
    form.tileColor.value = tile.color || '#3498db';
    form.tileWidth.value = tile.width || 1;
    form.tileHeight.value = tile.height || 1;
    form.tileLocked.checked = tile.locked || false;
    
    // Se è un gruppo, imposta le dimensioni del gruppo
    if (tile.type === 'group') {
        form.groupColumns.value = tile.groupColumns || 2;
        form.groupRows.value = tile.groupRows || 2;
    }
    
    // Imposta l'icona
    if (tile.icon) {
        // Determina il tipo di icona
        if (tile.icon.includes('fa-')) {
            // Icona Font Awesome
            form.tileIconType.value = 'predefined';
            const iconName = tile.icon.split('fa-')[1];
            AppConfig.selectedIcon = `fas fa-${iconName}`;
            form.iconPreview.innerHTML = `<i class="${tile.icon}"></i>`;
            
            // Seleziona l'icona nella griglia
            const iconOption = document.querySelector(`.icon-option[data-icon="${iconName}"]`);
            if (iconOption) {
                iconOption.classList.add('selected');
            }
        } else {
            // Immagine esterna
            form.tileIconType.value = 'online';
            form.iconUrl.value = tile.icon;
            AppConfig.selectedIcon = tile.icon;
            form.iconPreview.innerHTML = `<img src="${tile.icon}" alt="Icona">`;
        }
    } else {
        // Nessuna icona selezionata
        form.tileIconType.value = 'predefined';
        AppConfig.selectedIcon = null;
        form.iconPreview.innerHTML = '';
    }
    
    // Aggiorna l'interfaccia in base al tipo
    updateTileTypeInterface();
    updateIconSelection();
}

/**
 * Resetta il form di modifica per un nuovo tile
 */
function resetTileEditForm() {
    const form = AppConfig.dom.tileEditForm;
    
    // Resetta i valori del form
    form.tileType.value = 'single';
    form.tileIconType.value = 'predefined';
    form.tileTitle.value = '';
    form.tileUrl.value = '';
    form.tileDisplay.value = 'title';
    form.tileColor.value = '#3498db';
    form.tileWidth.value = 1;
    form.tileHeight.value = 1;
    form.groupColumns.value = 2;
    form.groupRows.value = 2;
    form.tileLocked.checked = false;
    form.iconUrl.value = '';
    form.iconFile.value = '';
    
    // Resetta l'anteprima dell'icona
    form.iconPreview.innerHTML = '';
    
    // Resetta l'icona selezionata
    AppConfig.selectedIcon = null;
    
    // Rimuovi la selezione dalle icone predefinite
    document.querySelectorAll('.icon-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Aggiorna l'interfaccia
    updateTileTypeInterface();
    updateIconSelection();
}

/**
 * Salva le modifiche a un tile
 */
function saveTileEdit() {
    // DEBUG: logga l'id del tile che si vuole salvare e la modalità
    console.log('--- DEBUG saveTileEdit ---');
    console.log('AppConfig.editingTile:', AppConfig.editingTile);
    if (AppConfig.editingTile) {
        console.log('Sto modificando tile con id:', AppConfig.editingTile.id);
    } else {
        console.log('Sto creando un nuovo tile');
    }

    const form = AppConfig.dom.tileEditForm;
    const tileType = form.tileType.value;
    
    // Validazione di base
    if (tileType === 'single' && !form.tileUrl.value.trim()) {
        alert('Per i tile singoli, l\'URL è obbligatorio.');
        return;
    }
    
    if (!form.tileTitle.value.trim()) {
        alert('Il titolo è obbligatorio.');
        return;
    }
    
    // Ottieni le pagine e la pagina corrente
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    const pageIndex = pages.findIndex(page => page.id === AppConfig.currentPage);
    
    if (pageIndex === -1) {
        console.error('Pagina corrente non trovata');
        return;
    }
    
    // Prepara l'oggetto tile
    const isEditing = !!AppConfig.editingTile;
    let x = isEditing ? AppConfig.editingTile.x : undefined;
    let y = isEditing ? AppConfig.editingTile.y : undefined;
    let width = isEditing ? AppConfig.editingTile.width : 1;
    let height = isEditing ? AppConfig.editingTile.height : 1;
    if (tileType === 'single') {
        if (form.tileWidth && form.tileWidth.value) width = parseInt(form.tileWidth.value) || 1;
        if (form.tileHeight && form.tileHeight.value) height = parseInt(form.tileHeight.value) || 1;
    }
    if (!isEditing) {
        const pos = findFreePosition();
        x = pos.x;
        y = pos.y;
    }
    const newTile = {
        id: isEditing ? AppConfig.editingTile.id : `tile_${Date.now()}`,
        type: tileType,
        title: form.tileTitle.value.trim(),
        color: form.tileColor.value,
        display: form.tileDisplay.value,
        locked: form.tileLocked.checked,
        x,
        y,
        width,
        height
    };
    
    // Aggiungi proprietà specifiche in base al tipo
    if (tileType === 'single') {
        newTile.url = form.tileUrl.value.trim();
    } else {
        newTile.groupColumns = parseInt(form.groupColumns.value) || 2;
        newTile.groupRows = parseInt(form.groupRows.value) || 2;
        newTile.tiles = isEditing && AppConfig.editingTile.tiles ? AppConfig.editingTile.tiles : [];
        newTile.height = 1;
    }
    
    // Gestisci l'icona
    if (AppConfig.selectedIcon) {
        if (typeof AppConfig.selectedIcon === 'string') {
            if (AppConfig.selectedIcon.startsWith('fas fa-')) {
                // Icona Font Awesome
                newTile.icon = AppConfig.selectedIcon;
            } else {
                // URL di un'immagine
                newTile.icon = AppConfig.selectedIcon;
            }
        } else {
            // File caricato, lo convertiamo in base64
            const reader = new FileReader();
            reader.onload = function(e) {
                newTile.icon = e.target.result;
                
                // Ora che abbiamo l'icona, possiamo completare il salvataggio
                finalizeTileSave(newTile, pages, pageIndex);
            };
            reader.readAsDataURL(AppConfig.selectedIcon);
            
            // Interrompi qui, il salvataggio verrà completato nel callback
            return;
        }
    }
    
    // Completa il salvataggio
    finalizeTileSave(newTile, pages, pageIndex);
}

/**
 * Finalizza il salvataggio di un tile
 * @param {Object} tile - Tile da salvare
 * @param {Array} pages - Array delle pagine
 * @param {number} pageIndex - Indice della pagina corrente
 */
function finalizeTileSave(tile, pages, pageIndex) {
    // DEBUG: logga la situazione prima della modifica
    console.log('--- DEBUG finalizeTileSave ---');
    console.log('Tile da salvare:', tile);
    console.log('pageIndex:', pageIndex);
    if (pages[pageIndex]) {
        console.log('Id tile PRIMA:', pages[pageIndex].tiles.map(t => t.id));
    }

    // Controlla se stiamo modificando un tile esistente
    if (AppConfig.editingTile) {
        // Trova l'indice del tile nella pagina
        const tileIndex = pages[pageIndex].tiles.findIndex(t => t.id === tile.id);
        
        if (tileIndex !== -1) {
            // Sostituisci il tile esistente
            console.log('DEBUG: Sostituisco tile esistente con id:', tile.id, 'all’indice', tileIndex);
            pages[pageIndex].tiles[tileIndex] = tile;
        } else {
            // Aggiungi il nuovo tile
            console.log('DEBUG: Tile non trovato, aggiungo come nuovo con id:', tile.id);
            pages[pageIndex].tiles.push(tile);
        }
    } else {
        // Aggiungi il nuovo tile
        if (!pages[pageIndex].tiles) {
            pages[pageIndex].tiles = [];
        }
        console.log('DEBUG: Nessun editingTile, aggiungo tile nuovo con id:', tile.id);
        pages[pageIndex].tiles.push(tile);
    }
    if (pages[pageIndex]) {
        console.log('Id tile DOPO:', pages[pageIndex].tiles.map(t => t.id));
    }
    // Salva le modifiche
    saveToStorage('pages', pages);
    // Chiudi il pannello di modifica
    closeTileEditPanel();
    // Aggiorna la visualizzazione
    renderCurrentPage();
    console.log(`Tile "${tile.title}" salvato con successo`);
}

/**
 * Trova una posizione libera nella griglia per un nuovo tile
 * @returns {Object} - Coordinate x, y della posizione libera
 */
function findFreePosition() {
    // Ottieni le dimensioni della griglia dalle impostazioni
    const gridColumns = AppConfig.settings?.gridColumns || 8;
    const gridRows = AppConfig.settings?.gridRows || 6;
    
    // Ottieni i tile della pagina corrente
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    const currentPage = pages.find(page => page.id === AppConfig.currentPage);
    const tiles = currentPage?.tiles || [];
    
    // Crea una matrice per tenere traccia delle celle occupate
    const occupiedCells = Array(gridRows).fill().map(() => Array(gridColumns).fill(false));
    
    // Marca le celle occupate dai tile esistenti
    tiles.forEach(tile => {
        const { x, y, width, height } = tile;
        
        // Controlla se le coordinate sono valide
        if (x >= 0 && y >= 0 && x < gridColumns && y < gridRows) {
            // Marca le celle occupate dal tile
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    if (y + i < gridRows && x + j < gridColumns) {
                        occupiedCells[y + i][x + j] = true;
                    }
                }
            }
        }
    });
    
    // Cerca una cella libera
    for (let y = 0; y < gridRows; y++) {
        for (let x = 0; x < gridColumns; x++) {
            if (!occupiedCells[y][x]) {
                return { x, y };
            }
        }
    }
    
    // Se non ci sono celle libere, restituisci le coordinate (0, 0)
    console.warn('Nessuna cella libera trovata nella griglia');
    return { x: 0, y: 0 };
}

/**
 * Apre il popup con i tile di un gruppo
 * @param {Object} groupTile - Tile di gruppo da aprire
 */
function openGroupTiles(groupTile) {
    // Verifica che il tile sia di tipo gruppo
    if (groupTile.type !== 'group') {
        console.error('Il tile selezionato non è un gruppo');
        return;
    }
    
    // Imposta il titolo del popup
    AppConfig.dom.groupPopup.groupTitle.textContent = groupTile.title || 'Gruppo';
    
    // Svuota il contenitore dei tile
    AppConfig.dom.groupPopup.groupTiles.innerHTML = '';
    
    // Ottieni i tile del gruppo
    const groupTiles = groupTile.tiles || [];
    
    // Renderizza i tile del gruppo
    groupTiles.forEach(tile => {
        // Crea l'elemento del tile
        const tileElement = document.createElement('div');
        tileElement.className = `tile ${tile.type || 'single'}`;
        tileElement.style.backgroundColor = tile.color || '#3498db';
        
        // Contenuto del tile
        let tileContent = `
            <div class="tile-icon">
                ${tile.icon ? (
                    (tile.icon.startsWith('fas fa-') || tile.icon.startsWith('fab fa-') || tile.icon.startsWith('far fa-'))
                        ? `<i class="${tile.icon}"></i>`
                        : `<img src="${tile.icon}" alt="${tile.title || ''}">`
                ) : '<i class="fas fa-globe"></i>'}
            </div>
            <div class="tile-title">${tile.title || ''}</div>
        `;
        
        // Aggiungi le azioni
        tileContent += `
            <div class="tile-action open-action"><i class="fas fa-external-link-alt"></i></div>
            ${!tile.locked ? '<div class="tile-action delete-action"><i class="fas fa-times"></i></div>' : ''}
            ${tile.locked ? '<div class="tile-action lock-action"><i class="fas fa-lock"></i></div>' : '<div class="tile-action edit-action"><i class="fas fa-cog"></i></div>'}
        `;
        
        tileElement.innerHTML = tileContent;
        
        // Aggiungi eventi per le azioni
        tileElement.querySelector('.delete-action').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteGroupTile(groupTile.id, tile.id);
        });
        
        tileElement.querySelector('.edit-action').addEventListener('click', (e) => {
            e.stopPropagation();
            openGroupTileEditPanel(groupTile.id, tile);
        });
        
        tileElement.querySelector('.open-action').addEventListener('click', (e) => {
            e.stopPropagation();
            if (tile.url) {
                window.open(tile.url, '_blank');
            }
        });
        
        // Evento click sul tile per aprire l'URL
        tileElement.addEventListener('click', () => {
            if (tile.url) {
                window.open(tile.url, '_blank');
            }
        });
        
        // Aggiungi il tile al contenitore
        AppConfig.dom.groupPopup.groupTiles.appendChild(tileElement);
    });
    
    // Se non ci sono tile, mostra un messaggio
    if (groupTiles.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Questo gruppo non contiene tile. Clicca sul pulsante "Aggiungi tile" per aggiungerne uno.';
        AppConfig.dom.groupPopup.groupTiles.appendChild(emptyMessage);
    }
    
    // Imposta l'evento per il pulsante di aggiunta tile
    AppConfig.dom.groupPopup.addGroupTile.onclick = () => {
        openGroupTileEditPanel(groupTile.id);
    };
    
    // Mostra il popup
    AppConfig.dom.groupOverlay.style.display = 'flex';
    
    // Memorizza il gruppo corrente
    AppConfig.currentGroup = groupTile.id;
}

/**
 * Elimina un tile da un gruppo
 * @param {string} groupId - ID del gruppo
 * @param {string} tileId - ID del tile da eliminare
 */
function deleteGroupTile(groupId, tileId) {
    // Chiedi conferma
    if (!confirm('Sei sicuro di voler eliminare questo tile dal gruppo?')) {
        return;
    }
    
    // Ottieni le pagine e la pagina corrente
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    const pageIndex = pages.findIndex(page => page.id === AppConfig.currentPage);
    
    if (pageIndex === -1) {
        console.error('Pagina corrente non trovata');
        return;
    }
    
    // Trova l'indice del gruppo nella pagina
    const groupIndex = pages[pageIndex].tiles.findIndex(tile => tile.id === groupId);
    
    if (groupIndex === -1) {
        console.error(`Gruppo con ID ${groupId} non trovato`);
        return;
    }
    
    // Trova l'indice del tile nel gruppo
    const tileIndex = pages[pageIndex].tiles[groupIndex].tiles.findIndex(tile => tile.id === tileId);
    
    if (tileIndex === -1) {
        console.error(`Tile con ID ${tileId} non trovato nel gruppo`);
        return;
    }
    
    // Rimuovi il tile dal gruppo
    pages[pageIndex].tiles[groupIndex].tiles.splice(tileIndex, 1);
    
    // Salva le modifiche
    saveToStorage('pages', pages);
    
    // Aggiorna la visualizzazione del gruppo
    openGroupTiles(pages[pageIndex].tiles[groupIndex]);
    
    console.log(`Tile con ID ${tileId} eliminato dal gruppo ${groupId}`);
}

/**
 * Apre il pannello di modifica per un tile in un gruppo
 * @param {string} groupId - ID del gruppo
 * @param {Object} tile - Tile da modificare (null per nuovo tile)
 */
function openGroupTileEditPanel(groupId, tile = null) {
    // Imposta il titolo del pannello
    AppConfig.dom.tileEditForm.editPanelTitle.textContent = tile ? "Modifica tile" : "Aggiungi tile al gruppo";
    
    // Se si sta modificando un tile esistente, popola i campi
    if (tile) {
        AppConfig.editingTile = tile;
        populateTileEditForm(tile);
    } else {
        AppConfig.editingTile = null;
        resetTileEditForm();
    }
    
    // Forza il tipo a 'single' per i tile nei gruppi
    AppConfig.dom.tileEditForm.tileType.value = 'single';
    AppConfig.dom.tileEditForm.tileType.disabled = true;
    
    // Nascondi il gruppo di tile in un gruppo
    AppConfig.dom.tileEditForm.groupSizeContainer.style.display = 'none';
    
    // Memorizza il gruppo corrente
    AppConfig.editingGroupId = groupId;
    
    // Personalizza il pulsante di salvataggio
    AppConfig.dom.tileEditForm.saveTile.textContent = tile ? "Aggiorna tile" : "Aggiungi al gruppo";
    
    // Ridefinisci l'evento di click del pulsante di salvataggio
    AppConfig.dom.tileEditForm.saveTile.onclick = saveGroupTileEdit;
    
    // Mostra il pannello
    AppConfig.dom.tileEditPanel.classList.add('active');
    
    // Aggiorna l'interfaccia
    updateTileTypeInterface();
    updateIconSelection();
}

/**
 * Salva le modifiche a un tile in un gruppo
 */
function saveGroupTileEdit() {
    const form = AppConfig.dom.tileEditForm;
    
    // Validazione di base
    if (!form.tileUrl.value.trim()) {
        alert('L\'URL è obbligatorio.');
        return;
    }
    
    if (!form.tileTitle.value.trim()) {
        alert('Il titolo è obbligatorio.');
        return;
    }
    
    // Ottieni le pagine e la pagina corrente
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    const pageIndex = pages.findIndex(page => page.id === AppConfig.currentPage);
    
    if (pageIndex === -1) {
        console.error('Pagina corrente non trovata');
        return;
    }
    
    // Trova l'indice del gruppo nella pagina
    const groupIndex = pages[pageIndex].tiles.findIndex(tile => tile.id === AppConfig.editingGroupId);
    
    if (groupIndex === -1) {
        console.error(`Gruppo con ID ${AppConfig.editingGroupId} non trovato`);
        return;
    }
    
    // Prepara l'oggetto tile
    const newTile = {
        id: AppConfig.editingTile ? AppConfig.editingTile.id : `group_tile_${Date.now()}`,
        type: 'single',
        title: form.tileTitle.value.trim(),
        url: form.tileUrl.value.trim(),
        color: form.tileColor.value,
        display: form.tileDisplay.value
    };
    
    // Gestisci l'icona
    if (AppConfig.selectedIcon) {
        if (typeof AppConfig.selectedIcon === 'string') {
            if (AppConfig.selectedIcon.startsWith('fas fa-')) {
                // Icona Font Awesome
                newTile.icon = AppConfig.selectedIcon;
            } else {
                // URL di un'immagine
                newTile.icon = AppConfig.selectedIcon;
            }
        } else {
            // File caricato, lo convertiamo in base64
            const reader = new FileReader();
            reader.onload = function(e) {
                newTile.icon = e.target.result;
                
                // Ora che abbiamo l'icona, possiamo completare il salvataggio
                finalizeGroupTileSave(newTile, pages, pageIndex, groupIndex);
            };
            reader.readAsDataURL(AppConfig.selectedIcon);
            
            // Interrompi qui, il salvataggio verrà completato nel callback
            return;
        }
    }
    
    // Completa il salvataggio
    finalizeGroupTileSave(newTile, pages, pageIndex, groupIndex);
}

/**
 * Finalizza il salvataggio di un tile in un gruppo
 * @param {Object} tile - Tile da salvare
 * @param {Array} pages - Array delle pagine
 * @param {number} pageIndex - Indice della pagina corrente
 * @param {number} groupIndex - Indice del gruppo
 */
function finalizeGroupTileSave(tile, pages, pageIndex, groupIndex) {
    // Controlla se stiamo modificando un tile esistente
    if (AppConfig.editingTile) {
        // Trova l'indice del tile nel gruppo
        const tileIndex = pages[pageIndex].tiles[groupIndex].tiles.findIndex(t => t.id === tile.id);
        
        if (tileIndex !== -1) {
            // Sostituisci il tile esistente
            pages[pageIndex].tiles[groupIndex].tiles[tileIndex] = tile;
        } else {
            // Aggiungi il nuovo tile
            pages[pageIndex].tiles[groupIndex].tiles.push(tile);
        }
    } else {
        // Aggiungi il nuovo tile
        if (!pages[pageIndex].tiles[groupIndex].tiles) {
            pages[pageIndex].tiles[groupIndex].tiles = [];
        }
        pages[pageIndex].tiles[groupIndex].tiles.push(tile);
    }
    
    // Salva le modifiche
    saveToStorage('pages', pages);
    
    // Chiudi il pannello di modifica
    closeTileEditPanel();
    
    // Reimposta il pulsante di salvataggio
    AppConfig.dom.tileEditForm.saveTile.onclick = saveTileEdit;
    AppConfig.dom.tileEditForm.tileType.disabled = false;
    
    // Aggiorna la visualizzazione del gruppo
    openGroupTiles(pages[pageIndex].tiles[groupIndex]);
    
    console.log(`Tile "${tile.title}" salvato nel gruppo con successo`);
}

/**
 * Aggiunge un tile a un gruppo
 */
function addTileToGroup() {
    // Apri il pannello di modifica per un nuovo tile nel gruppo
    openGroupTileEditPanel(AppConfig.currentGroup);
}
