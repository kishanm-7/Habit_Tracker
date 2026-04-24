(function initHabits() {
  const key = 'forge_habits';
  const existing = localStorage.getItem(key);
  if (!existing || JSON.parse(existing).length === 0) {
    const defaults = [
      { id: '1', name: 'Gym / Workout', emoji: '🏋️', 
        category: 'FITNESS', isDefault: true, 
        streak: 0, completions: {} },
      { id: '2', name: 'Read for 20-30 mins', emoji: '📚', 
        category: 'MIND', isDefault: true, 
        streak: 0, completions: {} },
      { id: '3', name: 'Learn a new skill (30 mins)', 
        emoji: '🧠', category: 'GROWTH', isDefault: true, 
        streak: 0, completions: {} },
      { id: '4', name: 'Social Media < 30 mins', 
        emoji: '📵', category: 'DIGITAL DETOX', 
        isDefault: true, streak: 0, completions: {} },
      { id: '5', name: 'Drink 3 Litres of Water', 
        emoji: '💧', category: 'HEALTH', isDefault: true, 
        streak: 0, completions: {} },
      { id: '6', name: 'Sleep by 11 PM', emoji: '😴', 
        category: 'RECOVERY', isDefault: true, 
        streak: 0, completions: {} }
    ];
    localStorage.setItem(key, JSON.stringify(defaults));
  }
})();

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

window.addEventListener('load', function() {
  var app = document.getElementById('app');
  if (app) {
    app.style.display = 'block';
    app.style.overflow = 'auto';
    app.style.height = '100%';
  }
  
  setTimeout(function() {
    var splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.transition = 'opacity 0.8s ease';
      splash.style.opacity = '0';
      setTimeout(function() {
        splash.style.display = 'none';
        splash.remove();
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      }, 800);
    }
  }, 4000);
});
