// Gestione selezione motore di ricerca per la search bar
const ENGINES = [
  {
    name: 'Google',
    logo: 'assets/search-logos/google.png',
    url: 'https://www.google.com/search?q='
  },
  {
    name: 'Bing',
    logo: 'assets/search-logos/bing.png',
    url: 'https://www.bing.com/search?q='
  },
  {
    name: 'Yahoo',
    logo: 'assets/search-logos/yahoo.png',
    url: 'https://search.yahoo.com/search?p='
  },
  {
    name: 'DuckDuckGo',
    logo: 'assets/search-logos/duckduckgo.png',
    url: 'https://duckduckgo.com/?q='
  }
];

// Ripristina la scelta dal localStorage, altrimenti Google di default
let currentEngine = ENGINES[0];
try {
  const saved = localStorage.getItem('searchEngine');
  if (saved) {
    const found = ENGINES.find(e => e.name === saved);
    if (found) currentEngine = found;
  }
} catch(e) {}

const selector = document.getElementById('search-engine-selector');
const logo = document.getElementById('search-engine-logo');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Imposta sempre il logo corretto al caricamento
if (logo && currentEngine) {
  logo.src = currentEngine.logo;
  logo.alt = currentEngine.name;
}

// Popup dinamico
let popup = null;

selector.addEventListener('click', function(e) {
  e.stopPropagation();
  if (popup) {
    popup.remove();
    popup = null;
    return;
  }
  popup = document.createElement('div');
  popup.className = 'search-engine-popup';
  ENGINES.forEach(engine => {
    const item = document.createElement('div');
    item.className = 'search-engine-option';
    if (engine.name === currentEngine.name) {
      item.classList.add('selected');
    }
    item.innerHTML = `<img src="${engine.logo}" alt="${engine.name}" /> <span>${engine.name}</span>`;
    item.onclick = function() {
      currentEngine = engine;
      logo.src = engine.logo;
      logo.alt = engine.name;
      // Salva la scelta nel localStorage
      try { localStorage.setItem('searchEngine', engine.name); } catch(e) {}
      // Aggiorna la selezione nel popup
      popup.querySelectorAll('.search-engine-option').forEach(opt => opt.classList.remove('selected'));
      item.classList.add('selected');
      setTimeout(() => { popup.remove(); popup = null; }, 120); // chiudi dopo breve feedback
    };
    popup.appendChild(item);
  });
  document.body.appendChild(popup);
  const rect = selector.getBoundingClientRect();
  popup.style.position = 'absolute';
  popup.style.left = rect.left + 'px';
  popup.style.top = (rect.bottom + 6) + 'px';
});

document.addEventListener('click', function() {
  if (popup) {
    popup.remove();
    popup = null;
  }
});

// Ricerca con il motore selezionato
searchButton.addEventListener('click', function(e) {
  const query = searchInput.value.trim();
  if (query) {
    window.open(currentEngine.url + encodeURIComponent(query), '_blank');
  }
});

searchInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    searchButton.click();
  }
});
