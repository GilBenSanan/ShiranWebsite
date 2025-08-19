// Accessibility Toolbar Functions

// Font Size Adjustment
function adjustFontSize(action) {
    // Get or set the current scale factor from localStorage
    let scaleFactor = parseFloat(localStorage.getItem('fontScaleFactor')) || 1;
    
    switch(action) {
        case 'increase':
            scaleFactor = Math.min(scaleFactor + 0.1, 2); // Max 200%
            break;
        case 'decrease':
            scaleFactor = Math.max(scaleFactor - 0.1, 0.8); // Min 80%
            break;
        case 'reset':
            scaleFactor = 1;
            break;
    }
    
    // Save the new scale factor
    localStorage.setItem('fontScaleFactor', scaleFactor);
    
    // Apply the scale factor to the root element
    document.documentElement.style.setProperty('--font-scale', scaleFactor);
    
    // Force text elements to inherit the scaled font size
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, label, input, textarea, button');
    textElements.forEach(element => {
        element.style.fontSize = `calc(var(--base-font-size, 1rem) * var(--font-scale))`;
    });
    
    // Announce change to screen readers
    const percentage = Math.round(scaleFactor * 100);
    announceToScreenReader(`Font size ${action}d. Now at ${percentage}%`);
}

// High Contrast Toggle
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    const isHighContrast = document.body.classList.contains('high-contrast');
    localStorage.setItem('highContrast', isHighContrast);
    announceToScreenReader(`High contrast mode ${isHighContrast ? 'enabled' : 'disabled'}`);
}

// Reduced Motion Toggle
function toggleReducedMotion() {
    document.body.classList.toggle('reduced-motion');
    const isReducedMotion = document.body.classList.contains('reduced-motion');
    localStorage.setItem('reducedMotion', isReducedMotion);
    announceToScreenReader(`Reduced motion ${isReducedMotion ? 'enabled' : 'disabled'}`);
}

// Dyslexic Font Toggle
function toggleDyslexicFont() {
    document.body.classList.toggle('use-dyslexic-font');
    const isDyslexicFont = document.body.classList.contains('use-dyslexic-font');
    localStorage.setItem('dyslexicFont', isDyslexicFont);
    announceToScreenReader(`Dyslexic friendly font ${isDyslexicFont ? 'enabled' : 'disabled'}`);
}

// Screen Reader Announcements
function announceToScreenReader(message) {
    const statusElement = document.getElementById('a11y-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Keyboard Navigation
function handleFirstTab(e) {
    if (e.keyCode === 9) { // Tab key
        document.body.classList.add('keyboard-navigation');
        window.removeEventListener('keydown', handleFirstTab);
    }
}

window.addEventListener('keydown', handleFirstTab);

// Load Saved Preferences
document.addEventListener('DOMContentLoaded', () => {
    // Load saved font size
    const savedFontScale = localStorage.getItem('fontScaleFactor');
    if (savedFontScale) {
        document.documentElement.style.setProperty('--font-scale', savedFontScale);
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, label, input, textarea, button');
        textElements.forEach(element => {
            element.style.fontSize = `calc(var(--base-font-size, 1rem) * var(--font-scale))`;
        });
    }
    // Load high contrast preference
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }
    
    // Load reduced motion preference
    if (localStorage.getItem('reducedMotion') === 'true') {
        document.body.classList.add('reduced-motion');
    }
    
    // Load dyslexic font preference
    if (localStorage.getItem('dyslexicFont') === 'true') {
        document.body.classList.add('use-dyslexic-font');
    }
    
    // Check system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }
    
    // Initialize focus management
    initFocusManagement();
});

// Focus Management
function initFocusManagement() {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // Handle modal/dialog focus trap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const modal = document.querySelector('[role="dialog"]');
            if (modal) {
                const focusableContent = modal.querySelectorAll(focusableElements);
                const firstFocusable = focusableContent[0];
                const lastFocusable = focusableContent[focusableContent.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        }
    });
}

// Form Validation Announcements
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const invalidFields = form.querySelectorAll(':invalid');
            if (invalidFields.length > 0) {
                e.preventDefault();
                announceToScreenReader(`Form has ${invalidFields.length} invalid fields. Please check your inputs.`);
            }
        });
    });
});