// Initialize language from URL or localStorage
let currentLang = new URLSearchParams(window.location.search).get('lang') || 
                 localStorage.getItem('preferredLanguage') || 
                 'he';

// Update HTML lang attribute
document.documentElement.lang = currentLang;

// Debug log
console.log('Current language:', currentLang);
console.log('Translations available:', window.translations);

// Initialize EmailJS
(function() {
    emailjs.init("mxIT6YNnZRUu0l7Eh");
})();

// Update content based on selected language
function updateContent() {
    console.log('Updating content to language:', currentLang);
    
    if (!window.translations || !window.translations[currentLang]) {
        console.error('Translations not found for language:', currentLang);
        console.log('Available translations:', window.translations);
        return;
    }

    // Update meta tags
    document.title = translations[currentLang].meta.title;
    document.querySelector('meta[name="description"]').setAttribute('content', translations[currentLang].meta.description);

    const elements = document.querySelectorAll('[data-translate]');
    console.log('Found elements to translate:', elements.length);

    elements.forEach(element => {
        const path = element.getAttribute('data-translate');
        const keys = path.split('.');
        let translation = window.translations[currentLang];
        
        // Navigate through nested translation objects
        for (const key of keys) {
            if (translation && translation.hasOwnProperty(key)) {
                translation = translation[key];
            } else {
                console.warn(`Translation not found for path: ${path} in language: ${currentLang}`);
                console.log('Current translation object:', translation);
                return;
            }
        }
        
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
            console.log(`Updated element with path ${path}:`, translation);
        }
    });

    // Update form elements
    const form = document.getElementById('contactForm');
    if (form) {
        const nameInput = form.querySelector('#name');
        const emailInput = form.querySelector('#email');
        const subjectSelect = form.querySelector('#subject');
        const messageTextarea = form.querySelector('#message');

        if (nameInput) nameInput.placeholder = translations[currentLang].contact.form.fullName;
        if (emailInput) emailInput.placeholder = translations[currentLang].contact.form.email;
        if (messageTextarea) messageTextarea.placeholder = translations[currentLang].contact.form.message;
        
        if (subjectSelect) {
            const options = translations[currentLang].contact.form.options;
            subjectSelect.innerHTML = `
                <option value="">${translations[currentLang].contact.form.selectTopic}</option>
                <option value="lecture-booking">${options.lecture}</option>
                <option value="workshop-inquiry">${options.workshop}</option>
                <option value="general-question">${options.question}</option>
                <option value="collaboration">${options.collaboration}</option>
            `;
        }
    }

    // Update language button text
    const langText = document.querySelector('.lang-text');
    if (langText) {
        langText.textContent = translations[currentLang].nav.language;
    }

    // Update RTL/LTR
    document.body.classList.toggle('rtl', currentLang === 'he');
}

// Toggle language
function toggleLanguage() {
    console.log('Toggling language from:', currentLang);
    currentLang = currentLang === 'en' ? 'he' : 'en';
    console.log('New language:', currentLang);
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('lang', currentLang);
    window.history.pushState({}, '', url);
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLang;
    
    // Store preference
    localStorage.setItem('preferredLanguage', currentLang);
    
    // Update content
    updateContent();
    
    // Update RTL
    document.body.classList.toggle('rtl', currentLang === 'he');
    
    // Reinitialize sliders with new language settings
    initializeSlider('.lectures-slider-container', '.lecture-card');
    initializeSlider('.publications-slider-container', '.publication-card');
    initializeSlider('.testimonials-slider-container', '.testimonial-card');
    
    // Debug log after update
    console.log('Updated language:', currentLang);
    console.log('RTL enabled:', document.body.classList.contains('rtl'));
}

    // Cookie consent
async function acceptCookies() {
    try {
        // Send consent to backend
        const response = await fetch('record_consent.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                consentVersion: '1.0'
            })
        });

        if (response.ok) {
            // Hide the consent banner
            document.getElementById('cookie-consent').classList.add('hidden');
            // Store in localStorage to remember user's choice
            localStorage.setItem('cookiesAccepted', 'true');
        } else {
            console.error('Failed to record consent');
            // Still hide the banner and store locally even if server recording fails
            document.getElementById('cookie-consent').classList.add('hidden');
            localStorage.setItem('cookiesAccepted', 'true');
        }
    } catch (error) {
        console.error('Error recording consent:', error);
        // Still hide the banner and store locally even if there's an error
        document.getElementById('cookie-consent').classList.add('hidden');
        localStorage.setItem('cookiesAccepted', 'true');
    }
}

// Check if cookies were previously accepted
function checkCookieConsent() {
    if (!localStorage.getItem('cookiesAccepted')) {
        document.getElementById('cookie-consent').classList.remove('hidden');
    }
}

// Keyboard navigation for sliders
function setupKeyboardNavigation() {
    const sliders = document.querySelectorAll('.slider-container, .gallery-grid');
    sliders.forEach(slider => {
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        
        slider.setAttribute('role', 'region');
        slider.setAttribute('aria-label', 'Content slider');
        
        if (prevBtn) {
            prevBtn.setAttribute('aria-label', 'Previous slide');
            prevBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    prevBtn.click();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.setAttribute('aria-label', 'Next slide');
            nextBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    nextBtn.click();
                }
            });
        }
    });
}

// Accessibility Controls
function adjustFontSize(action) {
    const body = document.body;
    const currentSize = localStorage.getItem('fontSize') || 'normal';
    
    const sizes = {
        smallest: 0,
        smaller: 1,
        normal: 2,
        larger: 3,
        largest: 4
    };
    
    let newSize;
    if (action === 'increase') {
        newSize = sizes[currentSize] < 4 ? Object.keys(sizes)[sizes[currentSize] + 1] : currentSize;
    } else if (action === 'decrease') {
        newSize = sizes[currentSize] > 0 ? Object.keys(sizes)[sizes[currentSize] - 1] : currentSize;
    } else {
        newSize = 'normal';
    }
    
    // Remove all font size classes
    body.classList.remove('font-size-smallest', 'font-size-smaller', 'font-size-larger', 'font-size-largest');
    
    // Add new font size class if not normal
    if (newSize !== 'normal') {
        body.classList.add(`font-size-${newSize}`);
    }
    
    localStorage.setItem('fontSize', newSize);
    
    // Announce font size change to screen readers
    const status = document.getElementById('a11y-status');
    status.textContent = `Font size changed to ${newSize}`;
}

function toggleHighContrast() {
    const body = document.body;
    const isHighContrast = body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', isHighContrast);
    
    // Update button state
    const button = document.querySelector('button[onclick="toggleHighContrast()"]');
    button.classList.toggle('active', isHighContrast);
    
    // Announce change to screen readers
    const status = document.getElementById('a11y-status');
    status.textContent = `High contrast mode ${isHighContrast ? 'enabled' : 'disabled'}`;
}

function toggleReducedMotion() {
    const body = document.body;
    const isReduced = body.classList.toggle('reduced-motion');
    localStorage.setItem('reducedMotion', isReduced);
    
    // Update button state
    const button = document.querySelector('button[onclick="toggleReducedMotion()"]');
    button.classList.toggle('active', isReduced);
    
    // Announce change to screen readers
    const status = document.getElementById('a11y-status');
    status.textContent = `Reduced motion ${isReduced ? 'enabled' : 'disabled'}`;
}

// Load accessibility preferences
function loadAccessibilityPreferences() {
    // Font size
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize && savedFontSize !== 'normal') {
        document.body.classList.add(`font-size-${savedFontSize}`);
    }
    
    // High contrast
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
        const button = document.querySelector('button[onclick="toggleHighContrast()"]');
        button.classList.add('active');
    }
    
    // Reduced motion
    if (localStorage.getItem('reducedMotion') === 'true') {
        document.body.classList.add('reduced-motion');
        const button = document.querySelector('button[onclick="toggleReducedMotion()"]');
        button.classList.add('active');
    }
    
    // Check system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
        const button = document.querySelector('button[onclick="toggleReducedMotion()"]');
        button.classList.add('active');
    }
}

// Accessibility overlay toggle - now hamburger style slide-out
function toggleA11yMenu() {
    const overlay = document.getElementById('a11yOverlay');
    const button = document.querySelector('.a11y-toggle-btn');
    
    console.log('Toggle function called');
    console.log('Overlay element:', overlay);
    console.log('Button element:', button);
    
    if (!overlay) {
        console.error('Overlay element not found!');
        return;
    }
    
    // Check if overlay is currently visible
    const isVisible = overlay.classList.contains('show');
    
    if (isVisible) {
        // Hide overlay - slide out to the right
        overlay.classList.remove('show');
        button.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = 'auto';
        console.log('Overlay hidden - slid out');
    } else {
        // Show overlay - slide in from the right
        overlay.classList.add('show');
        button.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        console.log('Overlay shown - slid in');
    }
}

// Announce changes to screen readers
function announceToScreenReader(message) {
    const status = document.getElementById('a11y-status');
    if (status) {
        status.textContent = message;
        status.classList.remove('visually-hidden');
        setTimeout(() => {
            status.classList.add('visually-hidden');
        }, 3000);
    }
}

// Enhanced applyAccessibilitySettings function
function applyAccessibilitySettings(closeOverlay = true) {
    // Get all toggle states
    const screenReader = document.getElementById('screenReaderToggle').checked;
    const keyboard = document.getElementById('keyboardToggle').checked;
    const contrast = document.getElementById('contrastToggle').checked;
    const grayscale = document.getElementById('grayscaleToggle').checked;
    const motion = document.getElementById('motionToggle').checked;
    const help = document.getElementById('helpToggle').checked;
    
    let changes = [];
    
    // Apply settings
    if (contrast) {
        document.body.classList.add('high-contrast');
        changes.push('High contrast mode enabled');
    } else {
        document.body.classList.remove('high-contrast');
        changes.push('High contrast mode disabled');
    }
    
    if (motion) {
        document.body.classList.add('reduced-motion');
        changes.push('Reduced motion enabled');
    } else {
        document.body.classList.remove('reduced-motion');
        changes.push('Reduced motion disabled');
    }
    
    if (grayscale) {
        document.body.classList.add('grayscale');
        changes.push('Grayscale mode enabled');
    } else {
        document.body.classList.remove('grayscale');
        changes.push('Grayscale mode disabled');
    }

    // Apply screen reader support
    if (screenReader) {
        enableScreenReaderSupport();
        changes.push('Screen reader support enabled');
    } else {
        disableScreenReaderSupport();
        changes.push('Screen reader support disabled');
    }

    // Apply keyboard navigation
    if (keyboard) {
        enableKeyboardNavigation();
        changes.push('Enhanced keyboard navigation enabled');
    } else {
        disableKeyboardNavigation();
        changes.push('Enhanced keyboard navigation disabled');
    }

    // Apply help layer
    if (help) {
        showHelpLayer();
        changes.push('Help layer enabled');
                } else {
        hideHelpLayer();
        changes.push('Help layer disabled');
    }
    
    // Close overlay only if requested (not when loading preferences)
    if (closeOverlay) {
        toggleA11yMenu();
    }
    
    // Announce changes to screen readers
    if (changes.length > 0) {
        announceToScreenReader(`Accessibility settings applied: ${changes.join(', ')}`);
    }

    // Save preferences to localStorage
    saveAccessibilityPreferences();
}

// Screen Reader Support Functions
function enableScreenReaderSupport() {
    // Add ARIA labels and roles where needed
    document.body.setAttribute('aria-live', 'polite');
    
    // Enhance existing elements with better screen reader support
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
        if (!img.hasAttribute('alt')) {
            img.setAttribute('alt', 'Image');
        }
    });

    // Add skip links for better navigation
    addSkipLinks();
}

function disableScreenReaderSupport() {
    document.body.removeAttribute('aria-live');
    // Remove any added skip links
    const skipLinks = document.querySelectorAll('.skip-link-added');
    skipLinks.forEach(link => link.remove());
}

// Keyboard Navigation Functions
function enableKeyboardNavigation() {
    // Ensure all interactive elements are keyboard accessible
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    interactiveElements.forEach(element => {
        if (element.tagName === 'BUTTON' || element.tagName === 'A') {
            element.setAttribute('tabindex', '0');
        }
    });

    // Add keyboard event listeners for custom components
    setupEnhancedKeyboardNavigation();
}

function disableKeyboardNavigation() {
    // Remove enhanced keyboard navigation
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    interactiveElements.forEach(element => {
        if (element.hasAttribute('data-original-tabindex')) {
            element.setAttribute('tabindex', element.getAttribute('data-original-tabindex'));
        } else {
            element.removeAttribute('tabindex');
        }
    });
}

// Help Layer Functions
function showHelpLayer() {
    // Create help overlay
    const helpOverlay = document.createElement('div');
    helpOverlay.id = 'helpOverlay';
    helpOverlay.className = 'help-overlay';
    helpOverlay.innerHTML = `
        <div class="help-content">
            <h3>Website Help Guide</h3>
            <div class="help-sections">
                <div class="help-section">
                    <h4>Navigation</h4>
                    <ul>
                        <li>Use Tab to navigate between elements</li>
                        <li>Press Enter or Space to activate buttons</li>
                        <li>Use arrow keys in sliders</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>Language</h4>
                    <ul>
                        <li>Click the language button (EN/HE) to switch languages</li>
                        <li>Hebrew text will display right-to-left</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>Accessibility</h4>
                    <ul>
                        <li>Use the accessibility button for more options</li>
                        <li>Font size can be adjusted with A+ and A- buttons</li>
                        <li>High contrast mode available for better visibility</li>
                    </ul>
                </div>
            </div>
            <button class="help-close" onclick="hideHelpLayer()">Close Help</button>
        </div>
    `;
    
    document.body.appendChild(helpOverlay);
    
    // Add help styles
    if (!document.getElementById('helpStyles')) {
        const helpStyles = document.createElement('style');
        helpStyles.id = 'helpStyles';
        helpStyles.textContent = `
            .help-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .help-content {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .help-sections {
                margin: 1.5rem 0;
            }
            .help-section {
                margin-bottom: 1.5rem;
            }
            .help-section h4 {
                color: #1e40af;
                margin-bottom: 0.5rem;
            }
            .help-section ul {
                margin: 0;
                padding-left: 1.5rem;
            }
            .help-section li {
                margin-bottom: 0.5rem;
            }
            .help-close {
                background: #1e40af;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 1rem;
            }
            .help-close:hover {
                background: #1e3a8a;
            }
        `;
        document.head.appendChild(helpStyles);
    }
}

function hideHelpLayer() {
    const helpOverlay = document.getElementById('helpOverlay');
    if (helpOverlay) {
        helpOverlay.remove();
    }
}

// Enhanced Keyboard Navigation
function setupEnhancedKeyboardNavigation() {
    // Add keyboard support for sliders
    const sliders = document.querySelectorAll('.slider-nav-button');
    sliders.forEach(button => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
            });
        });
        
    // Add keyboard support for gallery
    const galleryButtons = document.querySelectorAll('.gallery-nav-button');
    galleryButtons.forEach(button => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + A to open accessibility menu
        if (e.altKey && e.key === 'a') {
            e.preventDefault();
            toggleA11yMenu();
            announceToScreenReader('Accessibility menu opened');
        }
        
        // Alt + H to show help
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            if (!document.getElementById('helpOverlay')) {
                showHelpLayer();
                announceToScreenReader('Help layer opened');
            }
        }
        
        // Alt + C to toggle high contrast
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            const contrastToggle = document.getElementById('contrastToggle');
            contrastToggle.checked = !contrastToggle.checked;
            toggleHighContrast();
        }
        
        // Alt + M to toggle reduced motion
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            const motionToggle = document.getElementById('motionToggle');
            motionToggle.checked = !motionToggle.checked;
            toggleReducedMotion();
        }
        
        // Alt + G to toggle grayscale
        if (e.altKey && e.key === 'g') {
            e.preventDefault();
            const grayscaleToggle = document.getElementById('grayscaleToggle');
            grayscaleToggle.checked = !grayscaleToggle.checked;
            // Apply the setting
            if (grayscaleToggle.checked) {
                document.body.classList.add('grayscale');
                announceToScreenReader('Grayscale mode enabled');
            } else {
                document.body.classList.remove('grayscale');
                announceToScreenReader('Grayscale mode disabled');
            }
        }
        
        // Escape to close accessibility overlay
        if (e.key === 'Escape') {
            const overlay = document.getElementById('a11yOverlay');
            if (overlay && overlay.classList.contains('show')) {
                toggleA11yMenu();
                announceToScreenReader('Accessibility menu closed');
            }
            
            const helpOverlay = document.getElementById('helpOverlay');
            if (helpOverlay) {
                hideHelpLayer();
                announceToScreenReader('Help layer closed');
            }
        }
    });
}

// Skip Links
function addSkipLinks() {
    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links-container';
    skipLinksContainer.innerHTML = `
        <a href="#main-content" class="skip-link skip-link-added">Skip to main content</a>
        <a href="#navigation" class="skip-link skip-link-added">Skip to navigation</a>
        <a href="#footer" class="skip-link skip-link-added">Skip to footer</a>
    `;
    
    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
}

// Save and Load Accessibility Preferences
function saveAccessibilityPreferences() {
    const preferences = {
        screenReader: document.getElementById('screenReaderToggle').checked,
        keyboard: document.getElementById('keyboardToggle').checked,
        contrast: document.getElementById('contrastToggle').checked,
        grayscale: document.getElementById('grayscaleToggle').checked,
        motion: document.getElementById('motionToggle').checked,
        help: document.getElementById('helpToggle').checked
    };
    
    localStorage.setItem('accessibilityPreferences', JSON.stringify(preferences));
}

function loadAccessibilityPreferences() {
    const saved = localStorage.getItem('accessibilityPreferences');
    if (saved) {
        const preferences = JSON.parse(saved);
        
        // Set toggle states
        if (preferences.screenReader) document.getElementById('screenReaderToggle').checked = true;
        if (preferences.keyboard) document.getElementById('keyboardToggle').checked = true;
        if (preferences.contrast) document.getElementById('contrastToggle').checked = true;
        if (preferences.grayscale) document.getElementById('grayscaleToggle').checked = true;
        if (preferences.motion) document.getElementById('motionToggle').checked = true;
        if (preferences.help) document.getElementById('helpToggle').checked = true;
        
        // Apply saved settings
        applyAccessibilitySettings(false); // Pass false to prevent auto-closing
    }
}

// Test all accessibility features
function testAccessibilityFeatures() {
    console.log('Testing accessibility features...');
    
    // Test screen reader support
    const screenReaderToggle = document.getElementById('screenReaderToggle');
    if (screenReaderToggle) {
        console.log('✓ Screen reader toggle found');
    } else {
        console.error('✗ Screen reader toggle not found');
    }
    
    // Test keyboard navigation
    const keyboardToggle = document.getElementById('keyboardToggle');
    if (keyboardToggle) {
        console.log('✓ Keyboard navigation toggle found');
    } else {
        console.error('✗ Keyboard navigation toggle not found');
    }
    
    // Test high contrast
    const contrastToggle = document.getElementById('contrastToggle');
    if (contrastToggle) {
        console.log('✓ High contrast toggle found');
    } else {
        console.error('✗ High contrast toggle not found');
    }
    
    // Test grayscale
    const grayscaleToggle = document.getElementById('grayscaleToggle');
    if (grayscaleToggle) {
        console.log('✓ Grayscale toggle found');
    } else {
        console.error('✗ Grayscale toggle not found');
    }
    
    // Test reduced motion
    const motionToggle = document.getElementById('motionToggle');
    if (motionToggle) {
        console.log('✓ Reduced motion toggle found');
    } else {
        console.error('✗ Reduced motion toggle not found');
    }
    
    // Test help layer
    const helpToggle = document.getElementById('helpToggle');
    if (helpToggle) {
        console.log('✓ Help layer toggle found');
    } else {
        console.error('✗ Help layer toggle not found');
    }
    
    // Test font size controls
    const fontControls = document.querySelector('.font-size-controls');
    if (fontControls) {
        console.log('✓ Font size controls found');
    } else {
        console.error('✗ Font size controls not found');
    }
    
    // Test accessibility status
    const status = document.getElementById('a11y-status');
    if (status) {
        console.log('✓ Accessibility status element found');
    } else {
        console.error('✗ Accessibility status element not found');
    }
    
    // Test skip links
    const skipLinks = document.querySelectorAll('.skip-link');
    if (skipLinks.length > 0) {
        console.log(`✓ ${skipLinks.length} skip links found`);
    } else {
        console.log('ℹ No skip links found (will be added when screen reader support is enabled)');
    }
    
    console.log('Accessibility feature test completed');
}

// Ensure accessibility overlay is hidden on page load
function ensureOverlayHidden() {
    const overlay = document.getElementById('a11yOverlay');
    if (overlay) {
        console.log('Ensuring overlay is hidden on page load');
        overlay.classList.remove('show');
        
        // Also ensure the button state is correct
        const button = document.querySelector('.a11y-toggle-btn');
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
        
        // Ensure body overflow is normal
        document.body.style.overflow = 'auto';
        console.log('Overlay hidden successfully');
    } else {
        console.log('Overlay element not found during initialization');
    }
}

// Initialize sliders when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing sliders...');
    
    // Update content with current language first
    updateContent();
    
    initializeSlider('.lectures-slider-container', '.lecture-card');
    initializeSlider('.publications-slider-container', '.publication-card');
    initializeSlider('.testimonials-slider-container', '.testimonial-card');
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    // Check cookie consent
    checkCookieConsent();
    
    // Load accessibility preferences
    loadAccessibilityPreferences();
    
    // Load gallery items
    loadGalleryItems();
});

// Reinitialize sliders on window resize
window.addEventListener('resize', function() {
    console.log('Window resized, reinitializing sliders...');
    setTimeout(() => {
        initializeSlider('.lectures-slider-container', '.lecture-card');
        initializeSlider('.publications-slider-container', '.publication-card');
        initializeSlider('.testimonials-slider-container', '.testimonial-card');
    }, 100);
});

// Gallery functionality
function loadGalleryItems() {
    console.log('Loading gallery items...');
    const photosGrid = document.getElementById('photos-grid');
    const galleryContainer = document.querySelector('.gallery-grid');
    
    if (!photosGrid || !galleryContainer) {
        console.error('Required gallery elements not found');
        return;
    }

    try {
        // Get photos from configuration
        const photos = window.galleryPhotos || [];
        console.log('Loaded photos:', photos);

        console.log('Found photos grid, adding photos...');
        
        // Clear existing content
        photosGrid.innerHTML = '';

        if (photos.length === 0) {
            console.log('No photos found in gallery');
            photosGrid.innerHTML = '<p>No photos available</p>';
            return;
        }
    
        // Add photos twice to create continuous flow
        const addPhoto = (photo) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'gallery-photo-item';
            photoItem.setAttribute('role', 'button');
            photoItem.setAttribute('tabindex', '0');
            photoItem.setAttribute('aria-label', `View photo: ${photo.split('/').pop().split('.')[0].replace(/-/g, ' ')}`);
            
            const img = document.createElement('img');
            img.src = photo;
            // Extract meaningful alt text from the filename
            const altText = photo.split('/').pop().split('.')[0]
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            img.alt = `Lecture photo: ${altText}`;
            
            // Add loading animation
            img.style.opacity = '0';
            img.onload = () => {
                img.style.transition = 'opacity 0.3s ease';
                img.style.opacity = '1';
            };
            
            photoItem.appendChild(img);
            photosGrid.appendChild(photoItem);
            
            // Add click handler for lightbox
            photoItem.addEventListener('click', () => {
                openLightbox(photo);
            });
            
            // Add keyboard support
            photoItem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(photo);
                }
            });
            
            console.log('Added photo:', photo);
        };

        // Add each photo twice to create continuous flow
        photos.forEach(photo => addPhoto(photo));
        photos.forEach(photo => addPhoto(photo));
    } catch (error) {
        console.error('Error loading gallery photos:', error);
        photosGrid.innerHTML = '<p>Error loading photos</p>';
        return;
    }
    
    const prevButton = galleryContainer.querySelector('.gallery-nav-button.prev');
    const nextButton = galleryContainer.querySelector('.gallery-nav-button.next');
    
    // Add ARIA labels and roles
    prevButton.setAttribute('aria-label', 'Previous photos');
    nextButton.setAttribute('aria-label', 'Next photos');
    prevButton.setAttribute('role', 'button');
    nextButton.setAttribute('role', 'button');
    
    // Add keyboard support
    prevButton.setAttribute('tabindex', '0');
    nextButton.setAttribute('tabindex', '0');
    
    prevButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            prevButton.click();
        }
    });
    
    nextButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            nextButton.click();
        }
    });
    const slider = photosGrid;

    let currentPosition = 0;
    const items = document.querySelectorAll('.gallery-photo-item');
    if (items.length > 0) {
        // Calculate item width based on actual element size
        const itemWidth = items[0].offsetWidth + 32; // width plus gap
        const visibleItems = 3;
        const totalItems = items.length;
        console.log('Slider setup:', {
            totalItems,
            itemWidth
        });

        function updateNavButtons() {
            // In circular navigation, buttons are always enabled
            if (prevButton) {
                prevButton.style.opacity = '1';
                prevButton.style.cursor = 'pointer';
            }
            if (nextButton) {
                nextButton.style.opacity = '1';
                nextButton.style.cursor = 'pointer';
            }
        }

        function moveSlider(position) {
            // Calculate total width of all items for one set
            const singleSetWidth = totalItems * itemWidth;
            
            // When we reach the end of the first set, reset position to start of second set
            if (position <= -singleSetWidth) {
                position = position + singleSetWidth;
                currentPosition = position;
            }
            // When we reach the start and go backwards, jump to end of first set
            else if (position > 0) {
                position = position - singleSetWidth;
                currentPosition = position;
            } else {
                currentPosition = position;
            }
            
            slider.style.transform = `translateX(${currentPosition}px)`;
            console.log('Moved slider:', {
                position,
                currentPosition,
                singleSetWidth
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                const isRTL = document.documentElement.lang === 'he';
                if (isRTL) {
                    moveSlider(currentPosition - itemWidth);
                } else {
                    moveSlider(currentPosition + itemWidth);
                }
            });
        }

                    if (nextButton) {
                nextButton.addEventListener('click', () => {
                    const isRTL = document.documentElement.lang === 'he';
                    if (isRTL) {
                        moveSlider(currentPosition + itemWidth);
                    } else {
                        moveSlider(currentPosition - itemWidth);
                    }
                });
            }

        updateNavButtons();
    }
}

// Lightbox functionality
function openLightbox(imageSrc) {
    // Create lightbox container
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-label', 'Photo viewer');
    
    // Create lightbox content
    const lightboxContent = document.createElement('div');
    lightboxContent.className = 'lightbox-content';
    
    // Create image wrapper for better containment
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'lightbox-image-wrapper';
    
    // Create image
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Photo in lightbox view';
    img.className = 'lightbox-image';
    
    // Add loading state
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'lightbox-loading';
    loadingSpinner.innerHTML = '<div class="spinner"></div>';
    lightboxContent.appendChild(loadingSpinner);
    
    img.onload = () => {
        loadingSpinner.remove();
        imgWrapper.appendChild(img);
        lightboxContent.appendChild(imgWrapper);
    };
    
    img.onerror = () => {
        loadingSpinner.remove();
        const errorMsg = document.createElement('div');
        errorMsg.className = 'lightbox-error';
        errorMsg.textContent = 'Failed to load image';
        lightboxContent.appendChild(errorMsg);
    };
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close photo viewer');
    closeBtn.setAttribute('type', 'button');
    

    

    
    // Add elements to content
    lightboxContent.appendChild(closeBtn);
    lightboxContent.appendChild(img);
    
    // Add content to lightbox
    lightbox.appendChild(lightboxContent);
    document.body.appendChild(lightbox);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    closeBtn.focus();
    
    // Navigation functionality
    const photos = window.galleryPhotos || [];
    const currentIndex = photos.indexOf(imageSrc);
    
    function showPhoto(index) {
        if (index >= 0 && index < photos.length) {
            img.src = photos[index];
            img.alt = `Photo ${index + 1} of ${photos.length}`;
            
            // Announce to screen reader
            if (window.announceToScreenReader) {
                window.announceToScreenReader(`Photo ${index + 1} of ${photos.length}`);
            }
        }
    }
    
    // Event listeners
    closeBtn.addEventListener('click', closeLightbox);
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Close on ESC key
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    };
    document.addEventListener('keydown', handleEsc);
    

    
    function closeLightbox() {
            lightbox.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
        }
}

// Slider functionality
function initializeSlider(containerSelector, slideSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.log('Container not found:', containerSelector);
        return;
    }

    const slider = container.querySelector('.slider') || 
                  container.querySelector('.lectures-slider') ||
                  container.querySelector('.gallery-slider');
    const slides = container.querySelectorAll(slideSelector);
    const prevButton = container.querySelector('.prev');
    const nextButton = container.querySelector('.next');

    if (!slider || slides.length === 0) {
        console.log('Slider or slides not found in:', containerSelector);
        return;
    }

    console.log('Initializing slider for:', containerSelector, 'with', slides.length, 'slides');

    // Check if we're on mobile (single slide visible)
    const isMobile = window.innerWidth <= 768;
    const visibleSlides = isMobile ? 1 : 3;
    
        const slideWidth = slides[0].offsetWidth + 32; // width + gap
    const maxPosition = -(Math.max(0, slides.length - visibleSlides) * slideWidth);
    
    // Set initial position based on current language
    const isRTL = document.documentElement.lang === 'he';
    let currentPosition;
    
    if (isRTL) {
        // In RTL mode, start from the rightmost position (showing last slides first)
        currentPosition = maxPosition;
        console.log('RTL initialization - starting from right, position:', currentPosition);
        slider.style.transform = `translateX(${currentPosition}px)`;
    } else {
        // In LTR mode, start from the leftmost position (showing first slides first)
        currentPosition = 0;
        console.log('LTR initialization - starting from left, position:', currentPosition);
    }

        function updateNavButtons() {
            const isRTL = document.documentElement.lang === 'he';
            if (prevButton) {
                const isPrevDisabled = isRTL ? currentPosition <= maxPosition : currentPosition === 0;
                prevButton.style.opacity = isPrevDisabled ? '0.5' : '1';
                prevButton.style.cursor = isPrevDisabled ? 'default' : 'pointer';
            prevButton.disabled = isPrevDisabled;
            }
            if (nextButton) {
                const nextPosition = currentPosition - slideWidth;
                const isNextDisabled = isRTL ? currentPosition === 0 : nextPosition < maxPosition;
                nextButton.style.opacity = isNextDisabled ? '0.5' : '1';
                nextButton.style.cursor = isNextDisabled ? 'default' : 'pointer';
            nextButton.disabled = isNextDisabled;
            }
        }

        function moveSlider(position) {
            currentPosition = Math.max(maxPosition, Math.min(0, position));
            slider.style.transform = `translateX(${currentPosition}px)`;
            updateNavButtons();
        console.log('Slider moved to position:', currentPosition);
        }

    // Remove any existing event listeners
        if (prevButton) {
        prevButton.replaceWith(prevButton.cloneNode(true));
        const newPrevButton = container.querySelector('.prev');
        newPrevButton.addEventListener('click', () => {
                const isRTL = document.documentElement.lang === 'he';
                if (isRTL) {
                // In RTL, left button (prev button) moves to next slide (negative direction)
                const nextPosition = currentPosition - slideWidth;
                if (nextPosition >= maxPosition) {
                    moveSlider(nextPosition);
                    }
                } else {
                // In LTR, prev button moves backward (positive direction)
                    if (currentPosition < 0) {
                        moveSlider(currentPosition + slideWidth);
                    }
                }
            });
        }

        if (nextButton) {
        nextButton.replaceWith(nextButton.cloneNode(true));
        const newNextButton = container.querySelector('.next');
        newNextButton.addEventListener('click', () => {
                const isRTL = document.documentElement.lang === 'he';
                if (isRTL) {
                // In RTL, right button (next button) moves to previous slide (positive direction)
                    if (currentPosition < 0) {
                        moveSlider(currentPosition + slideWidth);
                    }
                } else {
                // In LTR, next button moves forward (negative direction)
                    const nextPosition = currentPosition - slideWidth;
                    if (nextPosition >= maxPosition) {
                        moveSlider(nextPosition);
                    }
                }
            });
        }

        updateNavButtons();
    
    // Force slider to update its height for immediate application
    slider.offsetHeight;
}

// Make functions available globally
window.toggleLanguage = toggleLanguage;
window.loadGalleryItems = loadGalleryItems;
window.openLightbox = openLightbox;
window.initializeSlider = initializeSlider;