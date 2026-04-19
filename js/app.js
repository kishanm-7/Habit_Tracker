const initApp = () => {
    // Recalculate streaks before rendering to ensure accurate display
    Store.recalculateStreaks();
    
    // Initialize specific modules
    UI.init();
    Timer.init();
    
    // Load Settings
    const settings = Store.getSettings();
    const rtInput = document.getElementById('reminder-time');
    const tsInput = document.getElementById('toggle-sound');
    
    if(rtInput) {
        rtInput.value = settings.reminderTime || '09:00';
        rtInput.addEventListener('change', (e) => {
            settings.reminderTime = e.target.value;
            Store.setSettings(settings);
            
            // Sync with Service Worker
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SYNC_REMINDER',
                    time: settings.reminderTime
                });
            }
        });
    }
    
    if(tsInput) {
        tsInput.checked = settings.soundEnabled;
        tsInput.addEventListener('change', (e) => {
            settings.soundEnabled = e.target.checked;
            Store.setSettings(settings);
        });
    }

    // Register Service Worker for Notifications
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
                // initial sync if controller is active
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'SYNC_REMINDER',
                        time: settings.reminderTime || '09:00'
                    });
                }
            })
            .catch(err => {
                console.error('Service Worker registration failed:', err);
            });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
