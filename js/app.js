/* js/app.js */
// 1. Initialize data
Store.init();

// 2. Initialize UI
UI.init();

// 3. Splash Sequence
window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    const app = document.getElementById('app');
    
    // Guaranteed 4 second timeout
    setTimeout(() => {
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                
                // 4. Reveal App
                if (app) {
                    app.style.display = 'block';
                    // Ensure scrolling is active
                    document.body.style.overflowY = 'auto';
                    document.documentElement.style.overflowY = 'auto';
                }
            }, 800);
        }
    }, 4000);
});

// Periodic Re-render for date changes
setInterval(() => {
    UI.renderAll();
}, 60000);
