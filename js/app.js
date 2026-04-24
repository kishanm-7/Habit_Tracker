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
            UI.showToast("Settings saved");
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
    function checkNotificationTime() {
        const reminderTime = localStorage.getItem('reminderTime');
        if (!reminderTime) return;
        
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const [reminderHours, reminderMinutes] = reminderTime.split(':').map(Number);
        
        const lastNotified = localStorage.getItem('lastNotified');
        const today = now.toDateString();
        
        if (currentHours === reminderHours && 
            currentMinutes === reminderMinutes && 
            lastNotified !== today) {
            
            new Notification('Time to FORGE 🔥', {
                body: "Your habits are waiting. Don't break the streak.",
                icon: '/public/forge-logo.png'
            });
            
            localStorage.setItem('lastNotified', today);
        }
    }
    
    // Start checking every 30 seconds
    setInterval(checkNotificationTime, 30000);
    // Also check immediately on load
    checkNotificationTime();
};

const bootSequence = () => {
    initApp();

    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                splash.style.display = 'none';
                splash.remove();
                
                // Native UI Routing
                if (!localStorage.getItem('onboardingComplete')) {
                    const ob = document.getElementById('onboarding-flow');
                    if(ob) ob.style.display = 'flex';
                    if(window.UI && window.UI.initOnboarding) UI.initOnboarding();
                } else {
                    const mainApp = document.getElementById('main-app-container') || document.getElementById('app');
                    if(mainApp) mainApp.style.display = 'block';
                }
            }, 500);
        } else {
            if (!localStorage.getItem('onboardingComplete')) {
                const ob = document.getElementById('onboarding-flow');
                if(ob) ob.style.display = 'flex';
                if(window.UI && window.UI.initOnboarding) UI.initOnboarding();
            } else {
                const mainApp = document.getElementById('main-app-container') || document.getElementById('app');
                if(mainApp) mainApp.style.display = 'block';
            }
        }
    }, 5000);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootSequence);
} else {
    bootSequence();
}
