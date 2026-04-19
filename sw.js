let targetReminderTime = "09:00"; // default fallback
let intervalId = null;

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
    startBackgroundTimer();
});

function startBackgroundTimer() {
    if (intervalId) return; // Prevent duplications

    // Poll locally explicitly adhering to the minute-by-minute directive
    intervalId = setInterval(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        if (currentTime === targetReminderTime) {
            triggerNotification();
        }
    }, 60000); 
}

function triggerNotification() {
    self.registration.showNotification("Time to FORGE 🔥", {
        body: "Your habits are waiting. Don't break the streak.",
        icon: "/public/forge-logo.png",
        vibrate: [200, 100, 200, 100, 400],
        requireInteraction: true // keeps it on screen until user interacts!
    });
}

self.addEventListener('message', event => {
    if (!event.data) return;

    if (event.data.type === 'SYNC_REMINDER') {
        if (event.data.time) {
            targetReminderTime = event.data.time;
        }
        // Ensure background timer is physically running if worker was asleep
        startBackgroundTimer();
    }

    if (event.data.type === 'TEST_NOTIFICATION') {
        triggerNotification();
    }
});
