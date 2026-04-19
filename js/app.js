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
        // Hydrate literal key if not exists
        if(!localStorage.getItem('reminderTime')) localStorage.setItem('reminderTime', rtInput.value);

        rtInput.addEventListener('change', (e) => {
            settings.reminderTime = e.target.value;
            Store.setSettings(settings);
            localStorage.setItem('reminderTime', e.target.value);
            
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
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'SYNC_REMINDER',
                        time: settings.reminderTime || '09:00'
                    });
                }
            })
            .catch(err => console.error('SW failed:', err));
    }

    // Main App Background Notification Loop
    setInterval(() => {
        const now = new Date();
        const currentTime = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
        const reminderTime = localStorage.getItem("reminderTime") || "09:00";
        
        if (currentTime === reminderTime) {
            const lastNotified = localStorage.getItem("lastNotified");
            const todayStr = now.toDateString();
            
            if (lastNotified !== todayStr) {
                localStorage.setItem("lastNotified", todayStr);
                
                // Fire notification
                if (window.Capacitor && window.Capacitor.Plugins.LocalNotifications) {
                    window.Capacitor.Plugins.LocalNotifications.schedule({
                        notifications: [{
                            title: "Time to FORGE 🔥",
                            body: "Your habits are waiting. Don't break the streak.",
                            id: 3,
                            schedule: { at: new Date(Date.now() + 1000) }
                        }]
                    });
                } else if ("Notification" in window && Notification.permission === "granted") {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification("Time to FORGE 🔥", {
                            body: "Your habits are waiting. Don't break the streak.",
                            icon: "/public/forge-logo.png"
                        });
                    });
                }
            }
        }
    }, 60000);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
