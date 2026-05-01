// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check if Storage is loaded
    if (typeof Storage !== 'undefined') {
        Storage.init();
    }

    // Initialize UI
    if (typeof UI !== 'undefined') {
        UI.init();
    }
});
