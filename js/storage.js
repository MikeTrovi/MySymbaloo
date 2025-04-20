/**
 * storage.js - Gestione della persistenza dei dati
 * 
 * Questo file contiene le funzioni per salvare e caricare i dati dell'applicazione
 * utilizzando il localStorage del browser.
 */

/**
 * Prefisso usato per le chiavi localStorage
 * Permette di evitare conflitti con altre applicazioni
 */
const STORAGE_PREFIX = 'my_symbaloo_';

/**
 * Salva i dati nel localStorage
 * @param {string} key - Chiave per identificare i dati
 * @param {*} data - Dati da salvare (verranno convertiti in JSON)
 */
function saveToStorage(key, data) {
    try {
        // Aggiungi il prefisso alla chiave
        const prefixedKey = STORAGE_PREFIX + key;
        
        // Converti i dati in stringa JSON
        const jsonData = JSON.stringify(data);
        
        // Salva nel localStorage
        localStorage.setItem(prefixedKey, jsonData);
        
        console.log(`Dati salvati con chiave: ${key}`);
        return true;
    } catch (error) {
        console.error(`Errore durante il salvataggio dei dati: ${error.message}`);
        
        // Gestisci il caso di localStorage pieno
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            alert('Spazio di archiviazione esaurito. Alcuni dati potrebbero non essere salvati.');
        }
        
        return false;
    }
}

/**
 * Carica i dati dal localStorage
 * @param {string} key - Chiave per identificare i dati
 * @returns {*} - I dati caricati (già convertiti da JSON) o null se non trovati
 */
function loadFromStorage(key) {
    try {
        // Aggiungi il prefisso alla chiave
        const prefixedKey = STORAGE_PREFIX + key;
        
        // Ottieni i dati dal localStorage
        const jsonData = localStorage.getItem(prefixedKey);
        
        // Se non ci sono dati, restituisci null
        if (jsonData === null) {
            return null;
        }
        
        // Converti i dati da JSON
        const data = JSON.parse(jsonData);
        
        console.log(`Dati caricati con chiave: ${key}`);
        return data;
    } catch (error) {
        console.error(`Errore durante il caricamento dei dati: ${error.message}`);
        return null;
    }
}

/**
 * Rimuove i dati dal localStorage
 * @param {string} key - Chiave dei dati da rimuovere
 * @returns {boolean} - true se l'operazione è riuscita, false altrimenti
 */
function removeFromStorage(key) {
    try {
        // Aggiungi il prefisso alla chiave
        const prefixedKey = STORAGE_PREFIX + key;
        
        // Rimuovi i dati dal localStorage
        localStorage.removeItem(prefixedKey);
        
        console.log(`Dati rimossi con chiave: ${key}`);
        return true;
    } catch (error) {
        console.error(`Errore durante la rimozione dei dati: ${error.message}`);
        return false;
    }
}

/**
 * Pulisce tutti i dati dell'applicazione dal localStorage
 * @returns {boolean} - true se l'operazione è riuscita, false altrimenti
 */
function clearAllStorage() {
    try {
        // Ottieni tutte le chiavi del localStorage
        const keys = Object.keys(localStorage);
        
        // Rimuovi solo le chiavi che iniziano con il nostro prefisso
        keys.forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        
        console.log('Tutti i dati dell\'applicazione sono stati rimossi');
        return true;
    } catch (error) {
        console.error(`Errore durante la pulizia dei dati: ${error.message}`);
        return false;
    }
}

/**
 * Esporta tutti i dati dell'applicazione come file JSON
 */
function exportData() {
    try {
        const data = {};
        
        // Ottieni tutte le chiavi del localStorage
        const keys = Object.keys(localStorage);
        
        // Raccogli solo i dati con il nostro prefisso
        keys.forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                // Rimuovi il prefisso dalla chiave per l'esportazione
                const shortKey = key.replace(STORAGE_PREFIX, '');
                data[shortKey] = JSON.parse(localStorage.getItem(key));
            }
        });
        
        // Crea un oggetto Blob con i dati
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        
        // Crea un URL per il blob
        const url = URL.createObjectURL(blob);
        
        // Crea un link per il download
        const a = document.createElement('a');
        a.href = url;
        a.download = `my_symbaloo_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        // Simula un click sul link
        document.body.appendChild(a);
        a.click();
        
        // Pulisci
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Dati esportati con successo');
        return true;
    } catch (error) {
        console.error(`Errore durante l'esportazione dei dati: ${error.message}`);
        alert(`Errore durante l'esportazione dei dati: ${error.message}`);
        return false;
    }
}

/**
 * Importa i dati da un file JSON
 * @param {File} file - File JSON da importare
 * @returns {Promise<boolean>} - Promise che si risolve a true se l'operazione è riuscita, false altrimenti
 */
function importData(file) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    // Parsa i dati JSON
                    const data = JSON.parse(e.target.result);
                    
                    // Inserisci i dati nel localStorage
                    for (const key in data) {
                        saveToStorage(key, data[key]);
                    }
                    
                    console.log('Dati importati con successo');
                    alert('Dati importati con successo. L\'applicazione verrà ricaricata.');
                    
                    // Ricarica l'applicazione per applicare i dati importati
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    
                    resolve(true);
                } catch (parseError) {
                    console.error(`Errore durante il parsing del file: ${parseError.message}`);
                    alert(`Errore durante l'importazione dei dati: il file non è un JSON valido.`);
                    resolve(false);
                }
            };
            
            reader.onerror = function() {
                console.error('Errore durante la lettura del file');
                alert('Errore durante la lettura del file');
                resolve(false);
            };
            
            // Leggi il file come testo
            reader.readAsText(file);
        } catch (error) {
            console.error(`Errore durante l'importazione dei dati: ${error.message}`);
            alert(`Errore durante l'importazione dei dati: ${error.message}`);
            resolve(false);
        }
    });
}

/**
 * Aggiunge funzionalità per import/export nei pulsanti dell'interfaccia
 */
function initStorageButtons() {
    // Aggiungi qui il codice per associare eventi ai pulsanti di import/export
    // quando saranno aggiunti all'interfaccia
    
    // Esempio:
    // document.getElementById('export-button').addEventListener('click', exportData);
    // document.getElementById('import-button').addEventListener('change', (e) => importData(e.target.files[0]));
}
