/**
 * drag-drop.js - Gestione del drag and drop dei tile
 * 
 * Questo file contiene le funzioni per gestire il trascinamento dei tile nella griglia,
 * consentendo all'utente di riorganizzare i tile in base alle proprie preferenze.
 */

/**
 * Configurazione per il drag and drop
 */
const DragDropConfig = {
    // Flag per indicare se il drag è attivo
    isDragging: false,
    
    // Tile attualmente in fase di trascinamento
    draggedTile: null,
    
    // Elemento DOM del tile trascinato
    draggedElement: null,
    
    // Posizione originale del tile trascinato (per annullare il drag)
    originalPosition: { x: 0, y: 0 },
    
    // Offset del mouse rispetto all'angolo del tile
    mouseOffset: { x: 0, y: 0 },
    
    // Flag per indicare se è possibile rilasciare il tile nella posizione corrente
    canDrop: false,
    
    // Elemento placeholder per mostrare dove verrà rilasciato il tile
    placeholder: null
};

/**
 * Inizializza il drag and drop per i tile
 */
function initDragDrop() {
    // Aggiungi gli event listener per il drag and drop alla griglia
    const tilesContainer = AppConfig.dom.tilesGrid;
    
    // Disabilita comportamento di drag predefinito per evitare conflitti
    tilesContainer.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
    
    // Aggiungi gli eventi del mouse per la griglia
    tilesContainer.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    console.log('Drag and drop inizializzato');
}

/**
 * Abilita il drag and drop per un elemento tile
 * @param {HTMLElement} tileElement - Elemento DOM del tile
 */
function enableDragForTile(tileElement) {
    // Verifica se il tile è bloccato
    if (tileElement.classList.contains('locked')) {
        return;
    }
    
    // Drag subito al mousedown (se non click su tile-action)
    let dragStartPos = null;
    let dragInitiated = false;
    function onMouseMove(e) {
        if (!dragStartPos) return;
        const dx = Math.abs(e.clientX - dragStartPos.x);
        const dy = Math.abs(e.clientY - dragStartPos.y);
        if (!dragInitiated && (dx > 7 || dy > 7)) {
            dragInitiated = true;
            // Verifica quale tile è effettivamente sotto il cursore
            const elements = document.elementsFromPoint(e.clientX, e.clientY);
            const actualTileElement = elements.find(el => el.classList.contains('tile') && !el.classList.contains('empty'));
            if (actualTileElement && actualTileElement === tileElement) {
                handleDragStart(e, tileElement);
            }
        }
    }
    function onMouseUp(e) {
        dragStartPos = null;
        dragInitiated = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }
    tileElement.addEventListener('mousedown', (e) => {
        if (e.target.closest('.tile-action')) {
            return;
        }
        dragStartPos = { x: e.clientX, y: e.clientY };
        dragInitiated = false;
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });
}

/**
 * Gestisce l'inizio del drag di un tile
 * @param {MouseEvent} e - Evento del mouse
 * @param {HTMLElement} tileElement - Elemento DOM del tile
 */
function handleDragStart(e, tileElement) {
    // Verifica se il tile è vuoto o bloccato
    if (tileElement.classList.contains('empty') || tileElement.classList.contains('locked')) {
        return;
    }
    
    // Impedisci il comportamento predefinito
    e.preventDefault();
    
    // Ottieni i dati relativi al tile dal DOM
    const tileId = tileElement.id;
    const tileX = parseInt(tileElement.getAttribute('data-x'));
    const tileY = parseInt(tileElement.getAttribute('data-y'));
    const tileWidth = parseInt(tileElement.getAttribute('data-width'));
    const tileHeight = parseInt(tileElement.getAttribute('data-height'));
    
    // Memorizza la posizione originale per annullare il drag se necessario
    DragDropConfig.originalPosition = { x: tileX, y: tileY };
    
    // Calcola offset rispetto al container
    const container = AppConfig.dom.tilesGrid;
    const containerRect = container.getBoundingClientRect();
    const rect = tileElement.getBoundingClientRect();
    
    // CORREGGI: offset mouse rispetto al tile
    DragDropConfig.mouseOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    // Imposta posizione iniziale relativa al container
    tileElement.style.left = `${rect.left - containerRect.left + container.scrollLeft}px`;
    tileElement.style.top = `${rect.top - containerRect.top + container.scrollTop}px`;
    // Salva gli stili di griglia per ripristino successivo
    DragDropConfig._gridStyles = {
        gridColumnStart: tileElement.style.gridColumnStart,
        gridRowStart: tileElement.style.gridRowStart,
        gridColumnEnd: tileElement.style.gridColumnEnd,
        gridRowEnd: tileElement.style.gridRowEnd
    };
    // Rimuovi ogni stile di grid
    tileElement.style.gridColumnStart = '';
    tileElement.style.gridRowStart = '';
    tileElement.style.gridColumnEnd = '';
    tileElement.style.gridRowEnd = '';
    tileElement.style.width = rect.width + 'px';
    tileElement.style.height = rect.height + 'px';
    tileElement.style.minWidth = rect.width + 'px';
    tileElement.style.minHeight = rect.height + 'px';
    tileElement.style.maxWidth = rect.width + 'px';
    tileElement.style.maxHeight = rect.height + 'px';
    tileElement.style.boxSizing = 'border-box';
    
    // Imposta lo stato di drag
    DragDropConfig.isDragging = true;
    DragDropConfig.draggedElement = tileElement;
    
    // Ottieni i dati completi del tile
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    const currentPage = pages.find(page => page.id === AppConfig.currentPage);
    if (!currentPage || !currentPage.tiles) {
        return;
    }
    
    const tile = currentPage.tiles.find(t => t.id === tileId);
    if (!tile) {
        return;
    }
    
    DragDropConfig.draggedTile = tile;
    
    // Aggiungi la classe dragging al tile
    tileElement.classList.add('dragging');
    tileElement.style.opacity = '0.7';
    tileElement.style.transform = 'scale(1.05)';
    tileElement.style.position = 'absolute';
    tileElement.style.zIndex = '1000';
    // (rect già dichiarato sopra, non ridichiarare)

    
    // Crea il placeholder
    createPlaceholder(tileX, tileY, tileWidth, tileHeight);
    
    // Aggiorna la posizione del tile
    updateDragPosition(e);
    
    // --- DEBUG: mostra coordinate mouse/tile e dimensioni tile/gap temporaneamente ---
    function debugMouseTile(e, tileElement) {
        let debug = document.getElementById('drag-debug');
        if (!debug) {
            debug = document.createElement('div');
            debug.id = 'drag-debug';
            debug.style.position = 'fixed';
            debug.style.top = '10px';
            debug.style.right = '10px';
            debug.style.background = 'rgba(0,0,0,0.7)';
            debug.style.color = 'white';
            debug.style.zIndex = '9999';
            debug.style.fontSize = '12px';
            debug.style.padding = '6px 10px';
            debug.style.borderRadius = '8px';
            document.body.appendChild(debug);
        }
        const rect = tileElement.getBoundingClientRect();
        const tileSize = getComputedStyle(document.documentElement).getPropertyValue('--tile-size');
        const tileGap = getComputedStyle(document.documentElement).getPropertyValue('--tile-gap');
        const container = AppConfig.dom.tilesGrid;
        const containerStyle = getComputedStyle(container);
        const paddingLeft = containerStyle.paddingLeft;
        const marginLeft = containerStyle.marginLeft;
        let offsetGridLeft = 0;
        const firstTile = container.querySelector('.tile:not(.tile-drop-zone)');
        if (firstTile) {
            const tileRect = firstTile.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            offsetGridLeft = tileRect.left - containerRect.left;
        }
        debug.innerHTML = `Mouse: (${e.clientX}, ${e.clientY})<br>Tile: (${Math.round(rect.left)}, ${Math.round(rect.top)})<br>tile.offsetWidth: ${tileElement.offsetWidth}<br>tileSize(var): ${tileSize}<br>tileGap(var): ${tileGap}<br>paddingLeft: ${paddingLeft}<br>marginLeft: ${marginLeft}<br>offsetGridLeft: ${offsetGridLeft}`;
    }
    debugMouseTile(e, tileElement);
    
    console.log(`Iniziato drag del tile ${tileId} da posizione (${tileX}, ${tileY})`);
}

/**
 * Gestisce il movimento durante il drag
 * @param {MouseEvent} e - Evento del mouse
 */
function handleDragMove(e) {
    // Ignora se non c'è un drag in corso
    if (!DragDropConfig.isDragging || !DragDropConfig.draggedElement) {
        return;
    }
    
    // Impedisci il comportamento predefinito
    e.preventDefault();
    
    // Aggiorna la posizione del tile
    updateDragPosition(e);
    
    // Calcola la posizione della griglia in base alla posizione del mouse
    const gridPosition = calculateGridPosition(e);
    
    // Verifica se è possibile rilasciare il tile in questa posizione
    DragDropConfig.canDrop = checkDropValidity(gridPosition.x, gridPosition.y);
    
    // Aggiorna la posizione del placeholder
    if (DragDropConfig.canDrop) {
        updatePlaceholder(gridPosition.x, gridPosition.y);
    }
}

/**
 * Gestisce la fine del drag
 * @param {MouseEvent} e - Evento del mouse
 */
function handleDragEnd(e) {
    // Ignora se non c'è un drag in corso
    if (!DragDropConfig.isDragging || !DragDropConfig.draggedElement) {
        return;
    }
    
    // Impedisci il comportamento predefinito
    e.preventDefault();
    
    // Ripristina lo stile del tile
    if (DragDropConfig.draggedElement) {
        DragDropConfig.draggedElement.classList.remove('dragging');
        DragDropConfig.draggedElement.style.position = '';
        DragDropConfig.draggedElement.style.zIndex = '';
        DragDropConfig.draggedElement.style.opacity = '';
        DragDropConfig.draggedElement.style.transform = '';
        DragDropConfig.draggedElement.style.left = '';
        DragDropConfig.draggedElement.style.top = '';
        DragDropConfig.draggedElement.style.width = '';
        DragDropConfig.draggedElement.style.height = '';
        DragDropConfig.draggedElement.style.minWidth = '';
        DragDropConfig.draggedElement.style.minHeight = '';
        DragDropConfig.draggedElement.style.maxWidth = '';
        DragDropConfig.draggedElement.style.maxHeight = '';
        DragDropConfig.draggedElement.style.boxSizing = '';
        // Ripristina stili di grid
        if (DragDropConfig._gridStyles) {
            DragDropConfig.draggedElement.style.gridColumnStart = DragDropConfig._gridStyles.gridColumnStart;
            DragDropConfig.draggedElement.style.gridRowStart = DragDropConfig._gridStyles.gridRowStart;
            DragDropConfig.draggedElement.style.gridColumnEnd = DragDropConfig._gridStyles.gridColumnEnd;
            DragDropConfig.draggedElement.style.gridRowEnd = DragDropConfig._gridStyles.gridRowEnd;
            DragDropConfig._gridStyles = null;
        }
    }

    // Rimuovi il placeholder
    removePlaceholder();

    // Calcola la posizione finale della griglia
    let finalPosition = { x: DragDropConfig.originalPosition.x, y: DragDropConfig.originalPosition.y };
    if (DragDropConfig.canDrop) {
        // Aggiorna la posizione del tile nei dati
        const mouseEvent = e.changedTouches ? e.changedTouches[0] : e;
        finalPosition = calculateGridPosition(mouseEvent);
        updateTilePosition(DragDropConfig.draggedTile.id, finalPosition.x, finalPosition.y);
    }

    // Ripristina lo stato di drag
    DragDropConfig.isDragging = false;
    DragDropConfig.draggedElement = null;
    DragDropConfig.draggedTile = null;
    DragDropConfig.canDrop = false;

    // Ridisegna la griglia per riflettere le modifiche
    renderCurrentPage();

    // RIMUOVI DEBUG
    const dbg = document.getElementById('drag-debug');
    if (dbg) dbg.remove();
    
    console.log(`Fine del drag, posizione finale: (${finalPosition.x}, ${finalPosition.y})`);
}

/**
 * Aggiorna la posizione visiva del tile durante il drag
 * @param {MouseEvent} e - Evento del mouse
 */
function updateDragPosition(e) {
    if (!DragDropConfig.draggedElement) {
        return;
    }
    
    const container = AppConfig.dom.tilesGrid;
    const containerRect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    
    // Calcola posizione relativa al container
    const left = e.clientX - containerRect.left + scrollLeft - DragDropConfig.mouseOffset.x;
    const top = e.clientY - containerRect.top + scrollTop - DragDropConfig.mouseOffset.y;
    
    // Applica la nuova posizione
    DragDropConfig.draggedElement.style.left = `${left}px`;
    DragDropConfig.draggedElement.style.top = `${top}px`;
    
    // Sincronizza con la posizione del placeholder
    const gridPosition = calculateGridPosition(e);
    if (DragDropConfig.placeholder) {
        updatePlaceholder(gridPosition.x, gridPosition.y);
    }
    
    // --- DEBUG: mostra coordinate mouse/tile e dimensioni tile/gap temporaneamente ---
    function debugMouseTile(e, tileElement) {
        let debug = document.getElementById('drag-debug');
        if (!debug) {
            debug = document.createElement('div');
            debug.id = 'drag-debug';
            debug.style.position = 'fixed';
            debug.style.top = '10px';
            debug.style.right = '10px';
            debug.style.background = 'rgba(0,0,0,0.7)';
            debug.style.color = 'white';
            debug.style.zIndex = '9999';
            debug.style.fontSize = '12px';
            debug.style.padding = '6px 10px';
            debug.style.borderRadius = '8px';
            document.body.appendChild(debug);
        }
        const rect = tileElement.getBoundingClientRect();
        const tileSize = getComputedStyle(document.documentElement).getPropertyValue('--tile-size');
        const tileGap = getComputedStyle(document.documentElement).getPropertyValue('--tile-gap');
        const container = AppConfig.dom.tilesGrid;
        const containerStyle = getComputedStyle(container);
        const paddingLeft = containerStyle.paddingLeft;
        const marginLeft = containerStyle.marginLeft;
        let offsetGridLeft = 0;
        const firstTile = container.querySelector('.tile:not(.tile-drop-zone)');
        if (firstTile) {
            const tileRect = firstTile.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            offsetGridLeft = tileRect.left - containerRect.left;
        }
        debug.innerHTML = `Mouse: (${e.clientX}, ${e.clientY})<br>Tile: (${Math.round(rect.left)}, ${Math.round(rect.top)})<br>tile.offsetWidth: ${tileElement.offsetWidth}<br>tileSize(var): ${tileSize}<br>tileGap(var): ${tileGap}<br>paddingLeft: ${paddingLeft}<br>marginLeft: ${marginLeft}<br>offsetGridLeft: ${offsetGridLeft}`;
    }
    debugMouseTile(e, DragDropConfig.draggedElement);
}

/**
 * Calcola la posizione nella griglia basata sulla posizione del mouse
 * @param {MouseEvent} e - Evento del mouse
 * @returns {Object} - Coordinate x, y nella griglia
 */
function calculateGridPosition(e) {
    const container = AppConfig.dom.tilesGrid;
    const containerRect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    
    const tileSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tile-size')) || 80;
    const tileGap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tile-gap')) || 10;
    const totalTileSize = tileSize + tileGap;
    const gridColumns = AppConfig.settings?.gridColumns || 8;
    // Calcola la larghezza della griglia effettiva
    const gridWidth = gridColumns * tileSize + (gridColumns - 1) * tileGap;
    const containerWidth = container.clientWidth;
    // Calcola il bordo sinistro della griglia centrata
    let gridLeft = 0;
    if (getComputedStyle(container).justifyContent === 'center') {
        gridLeft = (containerWidth - gridWidth) / 2;
    }
    // Calcola la posizione del mouse rispetto all'inizio reale della griglia
    const relativeX = e.clientX - containerRect.left + scrollLeft - gridLeft;
    const relativeY = e.clientY - containerRect.top + scrollTop;
    const gridX = Math.max(0, Math.floor(relativeX / totalTileSize));
    const gridY = Math.max(0, Math.floor(relativeY / totalTileSize));
    return { x: gridX, y: gridY };
}

/**
 * Verifica se è possibile rilasciare il tile in una determinata posizione
 * @param {number} x - Coordinata x nella griglia
 * @param {number} y - Coordinata y nella griglia
 * @returns {boolean} - true se è possibile rilasciare il tile, false altrimenti
 */
function checkDropValidity(x, y) {
    // Ottieni le dimensioni della griglia dalle impostazioni
    const gridColumns = AppConfig.settings?.gridColumns || 8;
    const gridRows = AppConfig.settings?.gridRows || 6;
    
    // Ottieni le dimensioni del tile trascinato
    const tileWidth = parseInt(DragDropConfig.draggedElement.getAttribute('data-width'));
    const tileHeight = parseInt(DragDropConfig.draggedElement.getAttribute('data-height'));
    
    // Verifica che il tile non esca dalla griglia
    if (x < 0 || y < 0 || x + tileWidth > gridColumns || y + tileHeight > gridRows) {
        return false;
    }
    
    // Verifica che non ci siano sovrapposizioni con altri tile
    // Ottieni i tile della pagina corrente
    const pages = loadFromStorage('pages') || AppConfig.defaultPages;
    const currentPage = pages.find(page => page.id === AppConfig.currentPage);
    if (!currentPage || !currentPage.tiles) {
        return true;
    }
    
    const tiles = currentPage.tiles;
    
    for (const tile of tiles) {
        // Ignora il tile che stiamo trascinando
        if (tile.id === DragDropConfig.draggedTile.id) {
            continue;
        }
        
        // Controlla se c'è sovrapposizione
        if (x < tile.x + tile.width &&
            x + tileWidth > tile.x &&
            y < tile.y + tile.height &&
            y + tileHeight > tile.y) {
            return false;
        }
    }
    
    return true;
}

/**
 * Crea un placeholder per mostrare dove verrà rilasciato il tile
 * @param {number} x - Coordinata x iniziale
 * @param {number} y - Coordinata y iniziale
 * @param {number} width - Larghezza del tile
 * @param {number} height - Altezza del tile
 */
function createPlaceholder(x, y, width, height) {
    // Crea un elemento div per il placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'tile tile-drop-zone';
    placeholder.id = 'drag-placeholder';
    
    // Imposta la posizione iniziale
    placeholder.style.gridColumnStart = x + 1;
    placeholder.style.gridRowStart = y + 1;
    placeholder.setAttribute('data-width', width);
    placeholder.setAttribute('data-height', height);
    
    // Aggiungi il placeholder alla griglia
    AppConfig.dom.tilesGrid.appendChild(placeholder);
    
    // Memorizza il riferimento al placeholder
    DragDropConfig.placeholder = placeholder;
}

/**
 * Aggiorna la posizione del placeholder
 * @param {number} x - Nuova coordinata x
 * @param {number} y - Nuova coordinata y
 */
function updatePlaceholder(x, y) {
    if (!DragDropConfig.placeholder || !DragDropConfig.draggedElement) {
        return;
    }
    
    // Ottieni le dimensioni della griglia
    const gridColumns = AppConfig.settings?.gridColumns || 8;
    const gridRows = AppConfig.settings?.gridRows || 6;
    
    // Ottieni le dimensioni del tile
    const tileWidth = parseInt(DragDropConfig.draggedElement.getAttribute('data-width'));
    const tileHeight = parseInt(DragDropConfig.draggedElement.getAttribute('data-height'));
    
    // Calcola la posizione centrale del tile
    const centerX = x + Math.floor(tileWidth/2);
    const centerY = y + Math.floor(tileHeight/2);
    
    // Limita la posizione entro i confini della griglia
    x = Math.max(0, Math.min(centerX - Math.floor(tileWidth/2), gridColumns - tileWidth));
    y = Math.max(0, Math.min(centerY - Math.floor(tileHeight/2), gridRows - tileHeight));
    
    // CORREGGI: calcolo posizione placeholder
    // Aggiorna la posizione del placeholder
    DragDropConfig.placeholder.style.gridColumnStart = x + 1;
    DragDropConfig.placeholder.style.gridRowStart = y + 1;
    DragDropConfig.placeholder.style.gridColumnEnd = `span ${tileWidth}`;
    DragDropConfig.placeholder.style.gridRowEnd = `span ${tileHeight}`;
    
    // Aggiorna la classe in base alla validità del drop
    DragDropConfig.placeholder.classList.toggle('invalid', !DragDropConfig.canDrop);
}

/**
 * Rimuove il placeholder
 */
function removePlaceholder() {
    if (DragDropConfig.placeholder) {
        AppConfig.dom.tilesGrid.removeChild(DragDropConfig.placeholder);
        DragDropConfig.placeholder = null;
    }
}

/**
 * Aggiorna la posizione di un tile nei dati
 * @param {string} tileId - ID del tile da aggiornare
 * @param {number} newX - Nuova coordinata x
 * @param {number} newY - Nuova coordinata y
 */
function updateTilePosition(tileId, newX, newY) {
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
    
    // Aggiorna la posizione
    pages[pageIndex].tiles[tileIndex].x = newX;
    pages[pageIndex].tiles[tileIndex].y = newY;
    
    // Salva le modifiche
    saveToStorage('pages', pages);
    
    console.log(`Aggiornata posizione del tile ${tileId} a (${newX}, ${newY})`);
}

// Inizializza il drag and drop quando il documento è caricato
document.addEventListener('DOMContentLoaded', () => {
    // Aggiungi un observer per abilitare il drag per i nuovi tile aggiunti
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('tile') && 
                        !node.classList.contains('empty')) {
                        enableDragForTile(node);
                    }
                });
            }
        });
    });
    
    // Inizia l'osservazione della griglia
    observer.observe(AppConfig.dom.tilesGrid, { childList: true });
    
    // Inizializza il drag and drop
    initDragDrop();
});
