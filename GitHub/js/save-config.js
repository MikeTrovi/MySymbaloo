// Salva la configurazione della pagina in un file config.xml
function saveConfigAsXML() {
    // Recupera le pagine dallo storage o da AppConfig
    let pages = [];
    if (typeof loadFromStorage === 'function') {
        pages = loadFromStorage('pages') || (window.AppConfig && AppConfig.defaultPages) || [];
    } else if (window.AppConfig && AppConfig.defaultPages) {
        pages = AppConfig.defaultPages;
    }
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<mysymbaloo-config version="1.0">\n';
    // Esporta le impostazioni personalizzate
    let settings = (window.AppConfig && (AppConfig.settings || AppConfig.defaultSettings)) || {};
    xml += '  <settings>\n';
    Object.keys(settings).forEach(key => {
        xml += `    <setting name="${key}" value="${settings[key]}" />\n`;
    });
    xml += '  </settings>\n';
    xml += '  <pages>\n';
    pages.forEach(page => {
        xml += `    <page id="${page.id}" name="${page.name}" icon="${page.icon}">\n`;
        if (Array.isArray(page.tiles)) {
            xml += '      <tiles>\n';
            page.tiles.forEach(tile => {
                xml += '        <tile';
                if (tile.id) xml += ` id="${tile.id}"`;
                if (tile.title) xml += ` title="${tile.title}"`;
                if (tile.url) xml += ` url="${tile.url}"`;
                if (tile.type) xml += ` type="${tile.type}"`;
                xml += ' />\n';
            });
            xml += '      </tiles>\n';
        }
        xml += '    </page>\n';
    });
    xml += '  </pages>\n';
    // Esporta SOLO le chiavi di localStorage che iniziano con STORAGE_PREFIX
    xml += '  <localstorage>\n';
    const STORAGE_PREFIX = 'my_symbaloo_';
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
        let value = localStorage.getItem(key);
        try {
            let obj = JSON.parse(value);
            if (typeof obj === 'object' && obj !== null) {
                xml += `    <item key="${key}">\n`;
                Object.keys(obj).forEach(k => {
                    xml += `      <field name="${k}">${JSON.stringify(obj[k])}</field>\n`;
                });
                xml += '    </item>\n';
                continue;
            }
        } catch (e) {}
        // Valore semplice
        xml += `    <item key="${key}">${value}</item>\n`;
    }
    xml += '  </localstorage>\n';
    xml += '</mysymbaloo-config>';



    // Crea un blob e scarica il file
    const blob = new Blob([xml], { type: 'application/xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'config.xml';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }, 0);
}

    

// Listener per il pulsante
window.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('save-config-button');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveConfigAsXML);
    }
});

window.addEventListener('DOMContentLoaded', function() {
    // Bottone di caricamento config
    const loadBtn = document.getElementById('load-config-button');
    const fileInput = document.getElementById('load-config-file');
    if (loadBtn && fileInput) {
        loadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', function(e) {
            // Cancella SOLO le chiavi dell'applicazione (con prefisso)
            const STORAGE_PREFIX = 'my_symbaloo_';
            for (let i = localStorage.length - 1; i >= 0; i--) {
                let key = localStorage.key(i);
                if (key && key.startsWith(STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            }
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(ev.target.result, 'application/xml');
                    const root = xml.querySelector('mysymbaloo-config');
                    if (!root) throw new Error('File non valido: manca il tag <mysymbaloo-config>');
                    // Ripristina settings
                    const settings = root.querySelectorAll('settings > setting');
                    if (settings.length) {
                        let settingsObj = {};
                        settings.forEach(s => {
                            settingsObj[s.getAttribute('name')] = s.getAttribute('value');
                        });
                        localStorage.setItem('settings', JSON.stringify(settingsObj));
                    }
                    // Ripristina pagine
                    const pages = [];
                    root.querySelectorAll('pages > page').forEach(pageNode => {
                        const page = {
                            id: pageNode.getAttribute('id'),
                            name: pageNode.getAttribute('name'),
                            icon: pageNode.getAttribute('icon'),
                            tiles: []
                        };
                        const tilesNode = pageNode.querySelector('tiles');
                        if (tilesNode) {
                            tilesNode.querySelectorAll('tile').forEach(tileNode => {
                                const tile = {};
                                Array.from(tileNode.attributes).forEach(attr => {
                                    tile[attr.name] = attr.value;
                                });
                                page.tiles.push(tile);
                            });
                        }
                        pages.push(page);
                    });
                    if (pages.length) {
                        localStorage.setItem('pages', JSON.stringify(pages));
                    }
                    // Ripristina localStorage extra
                    const lsNodes = root.querySelectorAll('localstorage > item');
                    lsNodes.forEach(item => {
                        const key = item.getAttribute('key');
                        if (!key) return;
                        const fields = item.querySelectorAll('field');
                        if (fields.length) {
                            // Ricostruisci oggetto
                            let obj = {};
                            fields.forEach(f => {
                                let val = f.textContent;
                                try { val = JSON.parse(val); } catch(e){}
                                obj[f.getAttribute('name')] = val;
                            });
                            localStorage.setItem(key, JSON.stringify(obj));
                        } else {
                            // Valore semplice
                            localStorage.setItem(key, item.textContent);
                        }
                    });
                    alert('Configurazione caricata! La pagina verrà ricaricata.');
                    location.reload();
                } catch(e) {
                    alert('Errore nel caricamento della configurazione: ' + e.message);
                }
            };
            reader.readAsText(file);
        });
    }
});
