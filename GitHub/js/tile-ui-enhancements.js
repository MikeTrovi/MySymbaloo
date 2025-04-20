/**
 * tile-ui-enhancements.js - Miglioramenti all'interfaccia utente per i tile
 * 
 * Questo file contiene funzioni per migliorare l'interfaccia utente dei tile,
 * mantenendo la compatibilità con il codice esistente.
 */

// Funzioni per l'interfaccia di ridimensionamento moderno dei tile
function adjustTileWidth(change) {
    const widthInput = document.getElementById('tile-width');
    const visualWidth = document.getElementById('visual-width');
    
    // Ottieni il valore corrente e aggiungi il cambiamento
    let currentWidth = parseInt(widthInput.value);
    let newWidth = currentWidth + change;
    
    // Limita i valori tra min e max
    newWidth = Math.max(parseInt(widthInput.min), Math.min(parseInt(widthInput.max), newWidth));
    
    // Aggiorna il valore dell'input originale
    widthInput.value = newWidth;
    
    // Aggiorna la visualizzazione
    visualWidth.textContent = newWidth;
    
    // Aggiorna l'anteprima visiva
    updateTilePreview();
    
    // Simula l'evento change sull'input originale
    const event = new Event('change');
    widthInput.dispatchEvent(event);
}

function adjustTileHeight(change) {
    const heightInput = document.getElementById('tile-height');
    const visualHeight = document.getElementById('visual-height');
    
    // Ottieni il valore corrente e aggiungi il cambiamento
    let currentHeight = parseInt(heightInput.value);
    let newHeight = currentHeight + change;
    
    // Limita i valori tra min e max
    newHeight = Math.max(parseInt(heightInput.min), Math.min(parseInt(heightInput.max), newHeight));
    
    // Aggiorna il valore dell'input originale
    heightInput.value = newHeight;
    
    // Aggiorna la visualizzazione
    visualHeight.textContent = newHeight;
    
    // Aggiorna l'anteprima visiva
    updateTilePreview();
    
    // Simula l'evento change sull'input originale
    const event = new Event('change');
    heightInput.dispatchEvent(event);
}

// Aggiorna l'anteprima visiva del tile
function updateTilePreview() {
    const previewDisplay = document.getElementById('tile-preview-display');
    const widthValue = parseInt(document.getElementById('tile-width').value);
    const heightValue = parseInt(document.getElementById('tile-height').value);
    const tileColor = document.getElementById('tile-color').value;
    
    // Aggiorna le dimensioni dell'anteprima
    previewDisplay.style.width = `${widthValue * 50}px`;
    previewDisplay.style.height = `${heightValue * 50}px`;
    previewDisplay.style.backgroundColor = tileColor;
    previewDisplay.style.borderRadius = '8px';
    previewDisplay.style.display = 'flex';
    previewDisplay.style.justifyContent = 'center';
    previewDisplay.style.alignItems = 'center';
    
    // Posiziona l'icona
    const iconContainer = document.getElementById('icon-preview-container');
    if (iconContainer) {
        iconContainer.style.position = 'relative';
        iconContainer.style.backgroundColor = 'transparent';
    }
}

// Inizializza l'interfaccia utente migliorata
document.addEventListener('DOMContentLoaded', function() {
    // Aggiungiamo listener per i cambiamenti nei campi originali
    const widthInput = document.getElementById('tile-width');
    const heightInput = document.getElementById('tile-height');
    const colorInput = document.getElementById('tile-color');
    
    if (widthInput) {
        widthInput.addEventListener('change', function() {
            document.getElementById('visual-width').textContent = this.value;
            updateTilePreview();
        });
    }
    
    if (heightInput) {
        heightInput.addEventListener('change', function() {
            document.getElementById('visual-height').textContent = this.value;
            updateTilePreview();
        });
    }
    
    if (colorInput) {
        colorInput.addEventListener('change', updateTilePreview);
    }
    
    // Inizializza l'anteprima
    updateTilePreview();
    
    // Inizializza la visualizzazione
    if (widthInput && document.getElementById('visual-width')) {
        document.getElementById('visual-width').textContent = widthInput.value;
    }
    
    if (heightInput && document.getElementById('visual-height')) {
        document.getElementById('visual-height').textContent = heightInput.value;
    }
});
