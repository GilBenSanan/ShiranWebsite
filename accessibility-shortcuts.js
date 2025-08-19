// Keyboard Shortcuts for Accessibility

document.addEventListener('keydown', (e) => {
    // Only trigger if Ctrl + Alt are pressed
    if (e.ctrlKey && e.altKey) {
        switch(e.key) {
            case 'h': // High Contrast
                e.preventDefault();
                toggleHighContrast();
                break;
            case 'm': // Reduced Motion
                e.preventDefault();
                toggleReducedMotion();
                break;
            case '+': // Increase Font
                e.preventDefault();
                adjustFontSize('increase');
                break;
            case '-': // Decrease Font
                e.preventDefault();
                adjustFontSize('decrease');
                break;
            case '0': // Reset Font
                e.preventDefault();
                adjustFontSize('reset');
                break;
            case 'd': // Dyslexic Font
                e.preventDefault();
                toggleDyslexicFont();
                break;
            case 'k': // Show Keyboard Shortcuts Help
                e.preventDefault();
                showAccessibilityHelp();
                break;
        }
    }
});

// Help Modal
function showAccessibilityHelp() {
    const modal = document.createElement('div');
    modal.role = 'dialog';
    modal.ariaLabel = 'Keyboard Shortcuts Help';
    modal.className = 'accessibility-help-modal';
    
    const shortcuts = [
        ['Ctrl + Alt + H', 'Toggle High Contrast'],
        ['Ctrl + Alt + M', 'Toggle Reduced Motion'],
        ['Ctrl + Alt + +', 'Increase Font Size'],
        ['Ctrl + Alt + -', 'Decrease Font Size'],
        ['Ctrl + Alt + 0', 'Reset Font Size'],
        ['Ctrl + Alt + D', 'Toggle Dyslexic Font'],
        ['Ctrl + Alt + K', 'Show This Help'],
        ['Tab', 'Navigate Through Elements'],
        ['Enter/Space', 'Activate Buttons/Links'],
        ['Esc', 'Close Dialogs']
    ];
    
    const content = `
        <div class="help-content">
            <h2>Keyboard Shortcuts</h2>
            <table>
                <thead>
                    <tr>
                        <th>Shortcut</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${shortcuts.map(([key, action]) => `
                        <tr>
                            <td><kbd>${key}</kbd></td>
                            <td>${action}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">
                Close
            </button>
        </div>
    `;
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    // Focus management
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.focus();
    
    // Close on Escape
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.remove();
        }
    });
    
    // Trap focus within modal
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
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
    });
}