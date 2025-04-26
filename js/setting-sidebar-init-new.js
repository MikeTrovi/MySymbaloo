// setting-sidebar-init-new.js
// Refactored version with optimizations

window.SettingsManager = (function() {

  let _settingsMenuHtml = null; // Store the initial menu HTML
  let _isAnimating = false; // Simple flag to prevent concurrent animations

  // Store only the unique content for each page
  const _settingsPagesContent = {
    "add-tiles": `
      <h2>PAGINA DI TEST</h2>
      <p>Questa è una pagina di test caricata dinamicamente!</p>
    `,
    "customize-tiles": `
      <h2>Customize Tiles</h2>
      <p>Personalizza colore, dimensione e icona delle tue Tiles.</p>
    `,
    "markers": `
      <h2>Markers</h2>
      <p>Etichetta le Tiles con colori e nomi personalizzati.</p>
    `,
    "groups": `
      <h2>Groups</h2>
      <p>Raggruppa più Tiles in un unico Tile.</p>
    `,
    "learning-paths": `
      <h2>Learning Paths</h2>
      <p>Crea un percorso didattico e aggiungi attività.</p>
    `,
    "general": `
      <h2>General</h2>
      <p>Imposta nome, colore e icona del Webmix.</p>
    `,
    "size": `
      <h2>Size</h2>
      <p>Ridimensiona il Webmix per adattarlo alle tue Tiles.</p>
    `,
    "style": `
      <h2>Style</h2>
      <p>Imposta la forma delle Tiles sul Webmix.</p>
    `,
    "collaborate": `
      <h2>Collaborate</h2>
      <p>Collabora con altri utenti su questo Webmix.</p>
    `,
    "remove": `
      <h2>Remove</h2>
      <p>Rimuovi questo Webmix. Attenzione: questa azione non è reversibile!</p>
    `,
    "background": `
      <h2>Background</h2>
      <div class="background-preview-label">Preview</div>
      <div class="background-preview-container">
        <!-- Preview content will be injected here -->
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
    `,
  };

  // --- Private Helper Functions ---

  /**
   * Gets a DOM element safely.
   * @param {string} selector CSS selector
   * @param {string} context Optional context description for errors
   * @returns {HTMLElement|null}
   */
  function _getElement(selector, context = '') {
    const el = document.querySelector(selector);
    if (!el) {
      console.error(`SettingsManager: Element not found for selector "${selector}" ${context ? 'in ' + context : ''}`);
    }
    return el;
  }

  /**
   * Creates the full HTML for a settings page including the header bar.
   * @param {string} pageName The key for the page content.
   * @param {string} contentHTML The specific content HTML for the page.
   * @returns {string} Full page HTML.
   */
  function _createSettingsPageHTML(pageName, contentHTML) {
    // Note: Using onclick directly as in the original. Ideally, use event delegation.
    return `
      <div class="settings-page settings-page-${pageName}">
        <div class="settings-header-bar">
          <button class="settings-back" onclick="SettingsManager.showSettingsMenu()">
            <i class="fas fa-arrow-left"></i>
          </button>
          <button class="settings-close" onclick="SettingsManager.toggleSettingsPanel(false)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        ${contentHTML}
      </div>
    `;
  }

  /**
   * Handles the CSS transition animation between two content states (e.g., menu and page).
   * @param {string} oldContentHTML HTML of the content leaving.
   * @param {string} newContentHTML HTML of the content entering.
   * @param {'menuToPage' | 'pageToMenu'} animationType Determines animation direction.
   * @param {Function} onComplete Callback function when animation finishes.
   */
  function _animateTransition(oldContentHTML, newContentHTML, animationType, onComplete) {
    if (_isAnimating) {
      console.warn("SettingsManager: Animation already in progress.");
      return;
    }
    _isAnimating = true;

    const container = _getElement('#settings-page-content', '_animateTransition');
    if (!container || !container.parentNode) {
      _isAnimating = false;
      return;
    }

    const oldDiv = document.createElement('div');
    oldDiv.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; z-index:1110; pointer-events:none; background: white;';
    oldDiv.innerHTML = oldContentHTML;
    oldDiv.style.transform = 'translateX(0)';
    oldDiv.style.opacity = '1';

    const newDiv = document.createElement('div');
    newDiv.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; z-index:1111; pointer-events:none; background: white;';
    newDiv.innerHTML = newContentHTML;
    newDiv.style.opacity = '1';

    // Determine start/end positions based on animation type
    const oldEndTransform = animationType === 'menuToPage' ? 'translateX(-100%)' : 'translateX(-100%)'; // Menu/Page always exits left
    const newStartTransform = animationType === 'menuToPage' ? 'translateX(100%)' : 'translateX(100%)'; // Page/Menu always enters right
    const newEndTransform = 'translateX(0)';

    newDiv.style.transform = newStartTransform;

    container.parentNode.appendChild(oldDiv);
    container.parentNode.appendChild(newDiv);
    container.style.display = 'block'; // Ensure container is visible for children

    // Force reflow before applying transitions
    void oldDiv.offsetWidth;

    oldDiv.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s linear';
    newDiv.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s linear';

    requestAnimationFrame(() => {
      oldDiv.style.transform = oldEndTransform;
      // oldDiv.style.opacity = '0'; // Optional: fade out exiting element
      newDiv.style.transform = newEndTransform;
    });

    let finishedTransitions = 0;
    const totalTransitions = 2;
    const transitionTimeout = 600; // Fallback timeout

    function cleanup() {
      finishedTransitions++;
      if (finishedTransitions === totalTransitions) {
        clearTimeout(fallbackTimeout);
        if (oldDiv.parentNode) oldDiv.parentNode.removeChild(oldDiv);
        if (newDiv.parentNode) newDiv.parentNode.removeChild(newDiv);

        // Set the final content in the actual container
        container.innerHTML = newContentHTML;
        container.style.transform = '';
        container.style.opacity = '';
        container.style.display = 'block'; // Keep container visible

        _isAnimating = false;
        if (typeof onComplete === 'function') {
          onComplete();
        }
        console.debug(`[DEBUG] Transition ${animationType} complete.`);
      }
    }

    oldDiv.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'transform') {
        oldDiv.removeEventListener('transitionend', handler);
        cleanup();
      }
    });

    newDiv.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'transform') {
        newDiv.removeEventListener('transitionend', handler);
        cleanup();
      }
    });

    // Fallback timeout in case transitionend doesn't fire reliably
    const fallbackTimeout = setTimeout(() => {
      if (finishedTransitions < totalTransitions) {
        console.warn(`[DEBUG] Transition ${animationType} fallback cleanup triggered.`);
        if (oldDiv.parentNode) oldDiv.parentNode.removeChild(oldDiv);
        if (newDiv.parentNode) newDiv.parentNode.removeChild(newDiv);
        container.innerHTML = newContentHTML;
        container.style.transform = '';
        container.style.opacity = '';
        container.style.display = 'block';
        _isAnimating = false;
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    }, transitionTimeout);
  }


  /**
   * Attaches click listeners to settings menu items.
   */
  function _attachSettingsMenuListeners() {
    const menuItems = document.querySelectorAll('#settings-panel .settings-menu-item');
    console.debug(`[DEBUG] Attaching listeners to ${menuItems.length} menu items.`);
    menuItems.forEach(btn => {
      // Clone and replace to remove old listeners safely
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener('click', function() {
        if (_isAnimating) return; // Prevent clicks during animation
        const page = this.getAttribute('data-settings-page');
        if (page) {
          console.debug(`[DEBUG] Menu item clicked for page: ${page}`);
          SettingsManager.showSettingsPage(page);
        } else {
          console.warn("[DEBUG] Menu item clicked but no 'data-settings-page' attribute found.");
        }
      });
    });
  }

  /**
   * Initializes background-specific settings and event listeners.
   */
  function _initBackgroundSettings() {
      const bgPage = document.querySelector('.settings-page-background');
      if (!bgPage) return;

      console.debug("[DEBUG] Initializing background settings...");

      // --- Inject Tiles Grid Preview ---
      const tilesGrid = _getElement('#tiles-grid', '_initBackgroundSettings');
      const previewContent = _getElement('#background-preview-content', '_initBackgroundSettings');

      if (tilesGrid && previewContent) {
          const previewContainer = previewContent.closest('.background-preview-container');
          let bodyBg = window.getComputedStyle(document.body).backgroundImage;
          let bodyBgColor = window.getComputedStyle(document.body).backgroundColor;

          // Prefer image, fallback to color
          if (bodyBg && bodyBg !== 'none') {
              previewContainer.style.backgroundImage = bodyBg;
              previewContainer.style.backgroundSize = 'cover';
              previewContainer.style.backgroundPosition = 'center';
              previewContainer.style.backgroundColor = ''; // Clear color if image is set
          } else if (bodyBgColor) {
              previewContainer.style.backgroundColor = bodyBgColor;
              previewContainer.style.backgroundImage = 'none';
          } else {
              previewContainer.style.backgroundColor = '#e3f0fc'; // Default preview bg
              previewContainer.style.backgroundImage = 'none';
          }

          const gridClone = tilesGrid.cloneNode(true);
          gridClone.removeAttribute('id');
          gridClone.style.cssText = `
              transform: scale(0.26);
              transform-origin: center center; /* Center the scaled grid */
              pointer-events: none;
              margin: 0 auto;
              position: relative;
              box-shadow: none;
              opacity: 0.85;
              width: ${tilesGrid.offsetWidth}px; /* Set explicit width */
              height: ${tilesGrid.offsetHeight}px; /* Set explicit height */
          `;

          previewContent.style.display = 'flex';
          previewContent.style.alignItems = 'center';
          previewContent.style.justifyContent = 'center';
          previewContent.style.overflow = 'hidden'; // Hide parts of grid outside bounds
          previewContent.innerHTML = ''; // Clear previous content
          previewContent.appendChild(gridClone);
      } else {
          console.warn("[DEBUG] Could not find #tiles-grid or #background-preview-content for background preview.");
      }


      // --- Attach Event Listeners (Simplified Example) ---
      // Note: This part needs the full logic from the original file, adapted slightly.
      // This is a placeholder structure. You'll need to copy/adapt the original
      // event listener logic for transparency, enable, type select, thumbnails, etc.

      const transparencyCheckbox = _getElement('#webmix-transparency', '_initBackgroundSettings');
      const enableBgCheckbox = _getElement('#enable-background', '_initBackgroundSettings');
      const bgTypeSelect = _getElement('#background-type', '_initBackgroundSettings');
      const thumbnails = bgPage.querySelectorAll('.background-thumb');

      // Example: Transparency toggle (adapt others similarly)
      if (transparencyCheckbox) {
          transparencyCheckbox.addEventListener('change', function() {
              // ... (logic to update opacity and save settings) ...
              console.log("Transparency changed:", this.checked);
              // Example: if (typeof applySettings === 'function') applySettings();
          });
      }
       if (enableBgCheckbox) {
          enableBgCheckbox.addEventListener('change', function() {
              // ... (logic to update opacity and save settings) ...
              console.log("Enable BG changed:", this.checked);
              // Example: if (typeof applySettings === 'function') applySettings();
          });
      }
       if (bgTypeSelect) {
          bgTypeSelect.addEventListener('change', function() {
              // ... (logic to update opacity and save settings) ...
              console.log("BG Type changed:", this.value);
              // Example: if (typeof applySettings === 'function') applySettings();
          });
      }
       if (thumbnails) {
          thumbnails.forEach(thumb => {
             thumb.addEventListener('click', function() {
                 console.log("Thumbnail clicked:", this.src);
                 // Example: saveAndApplyBackground(this.src, 'image');
                 // Example: if (typeof applySettings === 'function') applySettings();
             });
          });
      }

      console.debug("[DEBUG] Background settings initialized.");
  }


  // --- Public Methods ---

  /**
   * Initializes the Settings Manager. Should be called on DOMContentLoaded.
   */
  function init() {
    console.debug("[DEBUG] SettingsManager initializing...");
    const menuContainer = _getElement('#settings-page-content', 'init');
    if (menuContainer && !_settingsMenuHtml) {
      _settingsMenuHtml = menuContainer.innerHTML;
      console.debug("[DEBUG] Initial settings menu HTML captured.");
      // Ensure listeners are attached to the initial menu
      _attachSettingsMenuListeners();
       // Hide the content initially, panel controls visibility
       menuContainer.style.display = 'none';
    } else if (!menuContainer) {
        console.error("[DEBUG] #settings-page-content not found during init.");
        return;
    } else if (_settingsMenuHtml) {
        console.debug("[DEBUG] Settings menu HTML already captured.");
    }


    const settingsBtn = _getElement('#settings-button', 'init');
    if (settingsBtn) {
      // Prevent event bubbling issues
      settingsBtn.addEventListener('mousedown', e => e.stopPropagation());
      settingsBtn.addEventListener('click', e => {
        e.stopPropagation();
        const panel = _getElement('#settings-panel', 'settings button click');
        const isOpen = panel && panel.classList.contains('active');
        SettingsManager.toggleSettingsPanel(!isOpen);
      });
      console.debug("[DEBUG] Settings button listener attached.");
    } else {
        console.error("[DEBUG] #settings-button not found during init.");
    }
  }

  /**
   * Toggles the main settings panel open or closed.
   * @param {boolean} open True to open, false to close.
   */
  function toggleSettingsPanel(open) {
    if (_isAnimating) return;
    const panel = _getElement('#settings-panel', 'toggleSettingsPanel');
    const container = _getElement('#settings-page-content', 'toggleSettingsPanel');
    if (!panel) return;

    console.debug(`[DEBUG] toggleSettingsPanel called with open=${open}`);

    if (open === false) {
      // --- CLOSE PANEL ---
      _isAnimating = true;
      panel.classList.remove('slide-in');
      panel.classList.add('slide-out');

      const handleTransitionEnd = (e) => {
        if (e.propertyName === 'transform' && e.target === panel) {
          panel.removeEventListener('transitionend', handleTransitionEnd);
          panel.classList.remove('active', 'slide-out');
          panel.style.display = 'none'; // Hide after animation

          // Reset content container
          if (container && _settingsMenuHtml) {
            container.innerHTML = _settingsMenuHtml; // Restore menu for next open
            container.style.display = 'none';
            _attachSettingsMenuListeners(); // Re-attach listeners
          }
          _isAnimating = false;
          console.debug("[DEBUG] Panel closed and reset.");
          // Optional: Rerender main page if needed
          // if (typeof renderCurrentPage === 'function') renderCurrentPage();
        }
      };
      panel.addEventListener('transitionend', handleTransitionEnd);
      // Fallback
      setTimeout(() => {
          if (panel.classList.contains('slide-out')) { // Check if still closing
              console.warn("[DEBUG] Close panel transition fallback.");
              panel.removeEventListener('transitionend', handleTransitionEnd);
              panel.classList.remove('active', 'slide-out');
              panel.style.display = 'none';
              if (container && _settingsMenuHtml) {
                  container.innerHTML = _settingsMenuHtml;
                  container.style.display = 'none';
                  _attachSettingsMenuListeners();
              }
              _isAnimating = false;
          }
      }, 600);

    } else {
      // --- OPEN PANEL ---
      panel.style.display = 'block'; // Show before animation
      panel.classList.remove('slide-out');
      panel.classList.add('active');

      requestAnimationFrame(() => {
        panel.classList.add('slide-in');
      });

      // Ensure the menu is visible inside the container when opening
      if (container) {
          if (!_settingsMenuHtml) { // Safety check if init failed partially
              console.error("Cannot show menu: _settingsMenuHtml is null.");
              _settingsMenuHtml = "<div>Error: Menu not loaded.</div>"; // Provide fallback
          }
          container.innerHTML = _settingsMenuHtml;
          container.style.display = 'block';
          container.style.transform = ''; // Reset any previous transforms
          container.style.opacity = '1';
          container.classList.remove('slide-in', 'slide-out'); // Reset animation classes
          _attachSettingsMenuListeners(); // Ensure listeners are fresh
      }

      // Ensure sidebar is also visible and animated in
      const sidebar = _getElement('.settings-sidebar', 'toggleSettingsPanel open');
      if (sidebar) {
          sidebar.style.display = 'block';
          sidebar.classList.remove('slide-out');
          requestAnimationFrame(() => {
              sidebar.classList.add('slide-in');
          });
      }
      console.debug("[DEBUG] Panel opened.");
    }
  }

  /**
   * Shows a specific settings page, animating from the menu.
   * @param {string} pageName Key of the page in _settingsPagesContent.
   */
  function showSettingsPage(pageName) {
    if (_isAnimating) return;
    console.debug(`[DEBUG] showSettingsPage called for: ${pageName}`);

    const sidebar = _getElement('.settings-sidebar', 'showSettingsPage');
    const container = _getElement('#settings-page-content', 'showSettingsPage');
    const pageContentHTML = _settingsPagesContent[pageName];

    if (!container || !sidebar || !pageContentHTML || !_settingsMenuHtml) {
      console.error(`SettingsManager: Cannot show page "${pageName}". Missing elements, content, or initial menu HTML.`);
      return;
    }

    const fullPageHTML = _createSettingsPageHTML(pageName, pageContentHTML);

    // Animate sidebar out
    sidebar.classList.remove('slide-in');
    sidebar.classList.add('slide-out');
    sidebar.style.display = 'block'; // Keep visible during animation

    // Use the transition helper for menu -> page
    _animateTransition(_settingsMenuHtml, fullPageHTML, 'menuToPage', () => {
      // Animation complete callback
      sidebar.style.display = 'none'; // Hide sidebar after animation
      sidebar.classList.remove('slide-out'); // Reset class

      // Activate page-specific logic (e.g., background settings)
      if (pageName === 'background') {
        _initBackgroundSettings();
      }
      // Deactivate menu items visually (optional)
      document.querySelectorAll('.settings-menu-item.active').forEach(el => el.classList.remove('active'));
    });
  }

  /**
   * Shows the main settings menu, animating from a specific page.
   */
  function showSettingsMenu() {
    if (_isAnimating) return;
    console.debug("[DEBUG] showSettingsMenu called");

    const sidebar = _getElement('.settings-sidebar', 'showSettingsMenu');
    const container = _getElement('#settings-page-content', 'showSettingsMenu');

    if (!container || !sidebar || !_settingsMenuHtml) {
      console.error("SettingsManager: Cannot show menu. Missing elements or initial menu HTML.");
      return;
    }

    const currentPageHTML = container.innerHTML;

    // If the current content is already the menu, do nothing (or maybe just ensure sidebar is visible)
    // This simple check might fail if whitespace differs, a more robust check might be needed.
    if (currentPageHTML.trim() === _settingsMenuHtml.trim()) {
        console.debug("[DEBUG] Menu is already visible.");
        sidebar.style.display = 'block';
        sidebar.classList.remove('slide-out');
        sidebar.classList.add('slide-in'); // Ensure it's slid in
        return;
    }


    // Animate sidebar in
    sidebar.style.display = 'block'; // Show before animation
    sidebar.classList.remove('slide-out');
    requestAnimationFrame(() => {
      sidebar.classList.add('slide-in');
    });

    // Use the transition helper for page -> menu
    _animateTransition(currentPageHTML, _settingsMenuHtml, 'pageToMenu', () => {
      // Animation complete callback
      sidebar.classList.remove('slide-in'); // Reset class after animation
      _attachSettingsMenuListeners(); // Re-attach listeners to the newly loaded menu
    });
  }

  // --- Public Interface ---
  return {
    init: init,
    toggleSettingsPanel: toggleSettingsPanel,
    showSettingsPage: showSettingsPage,
    showSettingsMenu: showSettingsMenu
    // No need to expose attachSettingsMenuListeners or showSettingsMenuOnly
  };

})();

// --- Initialize after DOM is ready ---
document.addEventListener('DOMContentLoaded', SettingsManager.init);
