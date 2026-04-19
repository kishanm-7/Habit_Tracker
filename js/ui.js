/* js/ui.js */
const quotes = [
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "First forget inspiration. Habit is more dependable.",
    "Depending on what they are, our habits will either make us or break us.",
    "Chains of habit are too light to be felt until they are too heavy to be broken.",
    "Your net worth to the world is usually determined by what remains after your bad habits are subtracted from your good ones.",
    "The secret of your future is hidden in your daily routine.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "It's not what we do once in a while that shapes our lives. It's what we do consistently.",
    "Good habits formed at youth make all the difference.",
    "Habit is a cable; we weave a thread of it each day, and at last we cannot break it.",
    "Drop by drop is the water pot filled.",
    "Focus on the systems, not the goals.",
    "What you do every day matters more than what you do once in a while.",
    "Discipline is choosing between what you want now and what you want most.",
    "You do not rise to the level of your goals. You fall to the level of your systems.",
    "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    "To change your life, you need to change your priorities.",
    "Character is simply habit long continued.",
    "Every action you take is a vote for the type of person you wish to become.",
    "The heavier the resistance, the greater the growth.",
    "Don't wait. The time will never be just right.",
    "Action is the foundational key to all success.",
    "If you want to master a habit, the key is to start with repetition, not perfection.",
    "A year from now you will wish you had started today.",
    "Rome wasn't built in a day, but they were laying bricks every hour.",
    "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
    "Great acts are made up of small deeds.",
    "Build the person you intend to become.",
    "A journey of a thousand miles begins with a single step."
];

const UI = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderDashboard();
        
        const splash = document.getElementById('splash-screen');
        if (splash) {
            setTimeout(() => {
                splash.classList.add('fade-out');
                setTimeout(() => splash.remove(), 800);
            }, 6200);
        }
    },

    cacheDOM() {
        this.habitList = document.getElementById('habit-list');
        this.headerDate = document.getElementById('header-date');
        this.dynamicGreeting = document.getElementById('dynamic-greeting');
        this.globalStreak = document.getElementById('global-streak');
        this.progressRing = document.getElementById('daily-progress-ring');
        this.progressPercent = document.getElementById('progress-percent');
        this.progressFraction = document.getElementById('progress-fraction');
        this.miniHeatmap = document.getElementById('mini-heatmap');
        this.dailyQuote = document.getElementById('daily-quote');
        this.views = document.querySelectorAll('.view');
        this.navItems = document.querySelectorAll('.nav-item');
        
        this.modalAddHabit = document.getElementById('modal-add-habit');
        this.modalBackdrop = document.getElementById('modal-backdrop');
        this.btnAddHabit = document.getElementById('btn-add-habit');
        this.btnCloseModal = document.getElementById('btn-close-modal');
        this.formAddHabit = document.getElementById('form-add-habit');
        
        this.statsConsistency = document.getElementById('stat-consistency');
        this.statsBestStreak = document.getElementById('stat-best-streak');
        this.heatmapGrid = document.getElementById('heatmap-grid');
        this.statInsight = document.getElementById('stat-insight');
        
        this.btnResetData = document.getElementById('btn-reset-data');
        this.btnExportData = document.getElementById('btn-export-data');
        this.toggleTheme = document.getElementById('toggle-theme');
        this.inputReminder = document.getElementById('reminder-time');
        this.settingsHabitList = document.getElementById('settings-habit-list');
        
        this.notifStatus = document.getElementById('notif-status');
        this.btnEnableNotif = document.getElementById('btn-enable-notif');
        this.btnTestNotif = document.getElementById('btn-test-notif');

        this.modalDelete = document.getElementById('modal-delete');
        this.btnCancelDelete = document.getElementById('btn-cancel-delete');
        this.btnConfirmDelete = document.getElementById('btn-confirm-delete');
        this.habitIdInput = document.getElementById('habit-id');
    },

    bindEvents() {
        // Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.dataset.target;
                this.switchView(target);
                
                // Update nav state
                this.navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Notifications
        if(this.btnEnableNotif) {
            this.btnEnableNotif.addEventListener('click', async () => {
                if (window.Capacitor && window.Capacitor.Plugins.LocalNotifications) {
                    const { LocalNotifications } = window.Capacitor.Plugins;
                    const permStatus = await LocalNotifications.requestPermissions();
                    
                    if (permStatus.display === 'granted') {
                        this.updateNotifStatus();
                        const timeStr = document.getElementById('reminder-time').value || '09:00';
                        const [hours, minutes] = timeStr.split(':');
                        
                        await LocalNotifications.schedule({
                            notifications: [
                                {
                                    title: "Time to FORGE 🔥",
                                    body: "Your habits are waiting. Don't break the streak.",
                                    id: 1,
                                    schedule: {
                                        on: { hour: parseInt(hours), minute: parseInt(minutes) },
                                        allowWhileIdle: true
                                    }
                                }
                            ]
                        });
                        alert("Notifications enabled successfully!");
                    } else {
                        this.updateNotifStatus();
                        alert("Notification permission denied!");
                    }
                } else {
                    // Fallback to Web API for Vercel
                    if (!("Notification" in window)) {
                        alert("This browser does not support notifications.");
                        return;
                    }
                    Notification.requestPermission().then((permission) => {
                        this.updateNotifStatus();
                        if (permission === "granted") {
                            if('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                                navigator.serviceWorker.controller.postMessage({
                                    type: 'SYNC_REMINDER',
                                    time: document.getElementById('reminder-time').value || '09:00'
                                });
                            }
                            alert("Notifications enabled successfully!");
                        }
                    });
                }
            });
        }

        if(this.btnTestNotif) {
            this.btnTestNotif.addEventListener('click', async () => {
                if (window.Capacitor && window.Capacitor.Plugins.LocalNotifications) {
                    const { LocalNotifications } = window.Capacitor.Plugins;
                    const permStatus = await LocalNotifications.checkPermissions();
                    if (permStatus.display === 'granted') {
                        await LocalNotifications.schedule({
                            notifications: [
                                {
                                    title: "Time to FORGE 🔥",
                                    body: "Your habits are waiting. Don't break the streak.",
                                    id: 2,
                                    schedule: { at: new Date(Date.now() + 1000) } // Fires instantly
                                }
                            ]
                        });
                    } else {
                        alert("Please enable notifications first.");
                    }
                } else {
                    // Fallback to Web API for Vercel
                    if (!("Notification" in window)) return;
                    
                    if (Notification.permission === "granted") {
                        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                            navigator.serviceWorker.controller.postMessage({ type: 'TEST_NOTIFICATION' });
                        } else if (navigator.serviceWorker) {
                            navigator.serviceWorker.ready.then(reg => {
                                reg.showNotification("Time to FORGE 🔥", {
                                    body: "Your habits are waiting. Don't break the streak.",
                                    icon: "/public/forge-logo.png"
                                });
                            });
                        }
                    } else {
                        alert("Please enable notifications first.");
                    }
                }
            });
        }

        // Modals
        this.btnAddHabit.addEventListener('click', () => this.openModal(this.modalAddHabit));
        this.btnCloseModal.addEventListener('click', () => this.closeModal(this.modalAddHabit));
        this.modalBackdrop.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => this.closeModal(m));
        });

        // Bug 2: Mobile explicit tracking for select update
        const categorySelect = document.getElementById('habit-category');
        categorySelect.addEventListener('change', (e) => {
            categorySelect.value = e.target.value;
        });

        // Add Habit Form
        this.formAddHabit.addEventListener('submit', (e) => {
            e.preventDefault();
            const habitId = this.habitIdInput.value;
            const habitData = {
                name: document.getElementById('habit-name').value,
                emoji: document.getElementById('habit-emoji').value,
                category: document.getElementById('habit-category').value,
                notes: document.getElementById('habit-notes').value,
                frequency: 'daily'
            };

            if (habitId) {
                habitData.id = habitId;
                Store.updateHabit(habitData);
            } else {
                Store.addHabit(habitData);
            }
            
            this.closeModal(this.modalAddHabit);
            this.formAddHabit.reset();
            this.habitIdInput.value = '';
            document.getElementById('habit-emoji').value = '🎯';
            document.querySelector('#form-add-habit button[type="submit"]').textContent = 'Create Habit';
            this.renderDashboard();
            this.renderStats();
            this.renderSettings();
        });

        // Initialize Add Default
        this.btnAddHabit.addEventListener('click', () => {
            this.formAddHabit.reset();
            this.habitIdInput.value = '';
            document.querySelector('#form-add-habit button[type="submit"]').textContent = 'Create Habit';
            this.openModal(this.modalAddHabit);
        });

        // Delete Confirm
        this.btnCancelDelete.addEventListener('click', () => this.closeModal(this.modalDelete));
        this.btnConfirmDelete.addEventListener('click', () => {
            if (this.currentDeleteId) {
                Store.deleteHabit(this.currentDeleteId);
                this.closeModal(this.modalDelete);
                this.currentDeleteId = null;
                this.renderDashboard();
                this.renderStats();
            }
        });

        // Habit Clicks (Delegation)
        this.habitList.addEventListener('click', (e) => {
            const editItem = e.target.closest('.edit-habit');
            if (editItem) {
                e.stopPropagation();
                const id = editItem.dataset.id;
                this.openEditModal(id);
                document.querySelectorAll('.dropdown-menu.active').forEach(d => d.classList.remove('active'));
                return;
            }

            const deleteItem = e.target.closest('.delete-habit');
            if (deleteItem) {
                e.stopPropagation();
                const id = deleteItem.dataset.id;
                this.openDeleteModal(id);
                document.querySelectorAll('.dropdown-menu.active').forEach(d => d.classList.remove('active'));
                return;
            }

            // Dropdown Menu
            const menuBtn = e.target.closest('.habit-menu-btn');
            if (menuBtn) {
                e.stopPropagation();
                const dropdown = menuBtn.querySelector('.dropdown-menu');
                document.querySelectorAll('.dropdown-menu.active').forEach(d => {
                    if(d !== dropdown) d.classList.remove('active');
                });
                dropdown.classList.toggle('active');
                return;
            }

            // Checkmark
            const btn = e.target.closest('.btn-check');
            if (btn) {
                const card = btn.closest('.habit-card');
                const id = card.dataset.id;
                this.handleHabitCheck(id, card, btn);
            }
        });

        // Global dismiss dropdowns
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu.active').forEach(d => d.classList.remove('active'));
        });

        // Settings Inputs
        this.toggleTheme.addEventListener('change', (e) => {
            const isLight = !e.target.checked; // If checked, it's dark
            if (isLight) {
                document.body.classList.add('theme-light');
                document.body.classList.remove('theme-dark');
            } else {
                document.body.classList.remove('theme-light');
                document.body.classList.add('theme-dark');
            }
            const settings = Store.getSettings();
            settings.theme = isLight ? 'light' : 'dark';
            Store.setSettings(settings);
        });

        this.inputReminder.addEventListener('change', (e) => {
            const settings = Store.getSettings();
            settings.reminderTime = e.target.value;
            Store.setSettings(settings);
        });

        this.btnExportData.addEventListener('click', () => {
            const data = {
                habits: Store.getHabits(),
                completions: Store.getCompletions(),
                settings: Store.getSettings()
            };
            const jsonStr = JSON.stringify(data, null, 2);
            
            // Try standard download attempt automatically
            try {
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `forge-backup-${Store.getTodayStr()}.json`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            } catch (err) {
                console.error("Automatic blob download failed", err);
            }

            // Always display fallback modal to guarantee mobile capability
            this.showExportFallbackModal(jsonStr);
        });

        this.btnResetData.addEventListener('click', () => {
            if(confirm("Are you sure? This will wipe all habits, streaks, and settings.")) {
                Store.clearAllData();
            }
        });

        // Settings Dropdown/Action Routing Context
        this.settingsHabitList.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-habit-btn');
            if (editBtn) {
                this.openEditModal(editBtn.dataset.id);
            }
            const deleteBtn = e.target.closest('.delete-habit-btn');
            if (deleteBtn) {
                this.openDeleteModal(deleteBtn.dataset.id);
            }
        });
    },

    switchView(viewId) {
        this.views.forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        
        if (viewId === 'view-today') this.renderDashboard();
        if (viewId === 'view-stats') this.renderStats();
        if (viewId === 'view-settings') this.renderSettings();
        if (viewId === 'view-timer') {
            if (typeof Timer !== 'undefined') Timer.renderOptions();
        }
    },

    openModal(modal) {
        this.modalBackdrop.classList.add('active');
        modal.classList.add('active');
    },

    closeModal(modal) {
        this.modalBackdrop.classList.remove('active');
        if (modal) modal.classList.remove('active');
    },

    openEditModal(id) {
        const habits = Store.getHabits();
        const habit = habits.find(h => h.id === id);
        if(!habit) return;

        this.habitIdInput.value = habit.id;
        document.getElementById('habit-name').value = habit.name;
        document.getElementById('habit-emoji').value = habit.emoji;
        document.getElementById('habit-category').value = habit.category;
        document.getElementById('habit-notes').value = habit.notes || '';
        
        document.querySelector('#form-add-habit button[type="submit"]').textContent = 'Save Changes';
        this.openModal(this.modalAddHabit);
    },

    openDeleteModal(id) {
        const habits = Store.getHabits();
        const habit = habits.find(h => h.id === id);
        if(!habit) return;

        this.currentDeleteId = id;
        document.getElementById('delete-prompt-name').textContent = `Delete ${habit.name}?`;
        this.openModal(this.modalDelete);
    },

    async updateNotifStatus() {
        if (!this.notifStatus) return;
        
        if (window.Capacitor && window.Capacitor.Plugins.LocalNotifications) {
            try {
                const perm = await window.Capacitor.Plugins.LocalNotifications.checkPermissions();
                if (perm.display === "granted") {
                    this.notifStatus.textContent = "Allowed";
                    this.notifStatus.style.color = "var(--status-success, #2ECC71)";
                } else if (perm.display === "denied") {
                    this.notifStatus.textContent = "Blocked";
                    this.notifStatus.style.color = "var(--status-danger, #E74C3C)";
                } else {
                    this.notifStatus.textContent = "Not set";
                    this.notifStatus.style.color = "#F5A623";
                }
                return;
            } catch (e) {
                console.error("Native permission check failed:", e);
            }
        }

        if (!("Notification" in window)) {
            this.notifStatus.textContent = "Unsupported";
            this.notifStatus.style.color = "var(--text-muted)";
            return;
        }

        switch (Notification.permission) {
            case "granted":
                this.notifStatus.textContent = "Allowed";
                this.notifStatus.style.color = "var(--status-success, #2ECC71)";
                break;
            case "denied":
                this.notifStatus.textContent = "Blocked";
                this.notifStatus.style.color = "var(--status-danger, #E74C3C)";
                break;
            default:
                this.notifStatus.textContent = "Not set";
                this.notifStatus.style.color = "#F5A623";
                break;
        }
    },

    renderSettings() {
        const settings = Store.getSettings();
        this.inputReminder.value = settings.reminderTime || '09:00';
        this.updateNotifStatus();
        
        if (settings.theme === 'light') {
            this.toggleTheme.checked = false;
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
        } else {
            this.toggleTheme.checked = true;
            document.body.classList.add('theme-dark');
            document.body.classList.remove('theme-light');
        }

        const habits = Store.getHabits();
        if (habits.length === 0) {
            this.settingsHabitList.innerHTML = '<p class="small-text">No habits tracked.</p>';
            return;
        }

        let html = '';
        habits.forEach(habit => {
            const isDefault = ['1','2','3','4','5','6'].includes(habit.id);
            html += `
            <div class="settings-habit-item">
                <div class="habit-info">
                    <span class="habit-emoji">${habit.emoji}</span>
                    <span class="habit-name-text">${habit.name}</span>
                </div>
                <div class="habit-actions">
                    <button class="btn-icon edit-habit-btn" data-id="${habit.id}">✏️</button>
                    ${!isDefault ? `<button class="btn-icon danger delete-habit-btn" data-id="${habit.id}">🗑️</button>` : `<span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Default</span>`}
                </div>
            </div>`;
        });
        this.settingsHabitList.innerHTML = html;
    },

    getTagClass(category) {
        const map = {
            'Fitness': 'fitness',
            'Mind': 'mind',
            'Growth': 'growth',
            'Digital Detox': 'detox',
            'Health': 'health',
            'Recovery': 'recovery',
            'Work': 'growth'
        };
        return map[category] || '';
    },

    renderDashboard() {
        const d = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        this.headerDate.textContent = d.toLocaleDateString('en-US', options);
        
        // Dynamic Greeting Engine
        if (this.dynamicGreeting) {
            const hour = d.getHours();
            let greetingPrefix;

            if (hour >= 5 && hour < 12) {
                greetingPrefix = "Good morning, ";
            } else if (hour >= 12 && hour < 17) {
                greetingPrefix = "Good afternoon, ";
            } else if (hour >= 17 && hour < 21) {
                greetingPrefix = "Good evening, ";
            } else {
                greetingPrefix = "Still up, ";
            }

            this.dynamicGreeting.innerHTML = `${greetingPrefix}<span class="accent">warrior.</span>`;
        }
        
        // Quote
        const quoteIndex = d.getDate() % quotes.length;
        this.dailyQuote.textContent = quotes[quoteIndex];
        
        // Global Streak
        this.globalStreak.textContent = Store.getOverallStreak();
        
        // Habits
        const habits = Store.getHabits();
        const todayStr = Store.getTodayStr();
        
        if (habits.length === 0) {
            this.habitList.innerHTML = `<div class="empty-state"><p>No habits yet.</p><p class="small-text">Start building.</p></div>`;
            this.updateProgressRing(0, 0);
            return;
        }

        this.habitList.innerHTML = '';
        let completedCount = 0;

        habits.forEach((habit, index) => {
            const isCompleted = Store.isCompleted(habit.id, todayStr);
            if (isCompleted) completedCount++;

            const tagClass = this.getTagClass(habit.category);
            const delay = 380 + (index * 80);

            const isCustom = !['1','2','3','4','5','6'].includes(habit.id.toString());
            let menuHtml = '';
            if (isCustom) {
                menuHtml = `
                    <button class="habit-menu-btn" data-id="${habit.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="1.5"></circle>
                            <circle cx="19" cy="12" r="1.5"></circle>
                            <circle cx="5" cy="12" r="1.5"></circle>
                        </svg>
                        <div class="dropdown-menu">
                            <div class="dropdown-item edit-habit" data-id="${habit.id}">✏️ Edit</div>
                            <div class="dropdown-item danger delete-habit" data-id="${habit.id}">🗑️ Delete</div>
                        </div>
                    </button>
                `;
            }

            const html = `
                <div class="habit-card cat-${tagClass} ${isCompleted ? 'completed' : ''} anim-enter" style="animation-delay: ${delay}ms" data-id="${habit.id}">
                    <div class="habit-icon">${habit.emoji}</div>
                    <div class="habit-details">
                        <div class="habit-name">${habit.name}</div>
                        <div class="habit-meta">
                            <span class="tag ${this.getTagClass(habit.category)}">${habit.category}</span>
                            <span class="habit-streak">🔥 ${habit.streak}</span>
                        </div>
                        <div class="history-bar">
                            ${this.generateHistoryHtml(habit.id)}
                        </div>
                    </div>
                    <button class="btn-check" aria-label="Mark completed">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    ${menuHtml}
                </div>
            `;
            this.habitList.insertAdjacentHTML('beforeend', html);
        });

        this.updateProgressRing(completedCount, habits.length);
        this.renderMiniHeatmap(habits);
    },

    renderMiniHeatmap(habits) {
        const daysNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const d = new Date();
        const currentDay = d.getDay() === 0 ? 7 : d.getDay(); // 1=Mon...7=Sun
        
        let heatmapHtml = '';
        for(let i=1; i<=7; i++) {
            const diff = i - currentDay;
            const dateStr = Store.getDateStr(diff);
            
            const doneCount = habits.filter(h => Store.isCompleted(h.id, dateStr)).length;
            const opacity = habits.length > 0 ? (doneCount / habits.length).toFixed(2) : 0;
            const isToday = (diff === 0);
            
            heatmapHtml += `
            <div class="mini-day">
                <div class="mini-square ${isToday ? 'today' : ''}">
                    <div class="mini-square-fill" style="opacity: ${opacity}"></div>
                </div>
                <span class="mini-label">${daysNames[i-1]}</span>
            </div>`;
        }
        this.miniHeatmap.innerHTML = heatmapHtml;
    },

    generateHistoryHtml(habitId) {
        let html = '';
        for (let i = 6; i >= 0; i--) {
            const dStr = Store.getDateStr(-i);
            const isDone = Store.isCompleted(habitId, dStr);
            // If it's a future relative date or today not yet marked, decide how to show it.
            // For now, simple approach: show done or empty. If i=0 (today), show done or empty. 
            // If i>0 and not done, it is "missed" if they created the habit before that date...
            // To simplify, if not done, show 'missed' class. But actually, let's keep it gray if not done.
            html += `<div class="history-node ${isDone ? 'done' : ''}"></div>`;
        }
        return html;
    },

    updateProgressRing(completed, total) {
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        this.progressPercent.textContent = percent + '%';
        this.progressFraction.textContent = `${completed} of ${total} habits done`;
        
        // Circumference = 2 * Math.PI * r = 2 * Math.PI * 100 = 628.318
        const circumference = 628.318;
        this.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        const offset = circumference - (percent / 100) * circumference;
        this.progressRing.style.strokeDashoffset = offset;
    },

    handleHabitCheck(id, cardNode, btnNode) {
        const todayStr = Store.getTodayStr();
        
        // Find habit to check streak before
        let habits = Store.getHabits();
        let targetHabit = habits.find(h => h.id === id);
        const streakBefore = targetHabit ? targetHabit.streak : 0;

        const isNowCompleted = Store.toggleCompletion(id, todayStr);
        
        // Get streak after
        habits = Store.getHabits();
        targetHabit = habits.find(h => h.id === id);
        const streakAfter = targetHabit ? targetHabit.streak : 0;

        if (isNowCompleted) {
            // Add animations
            cardNode.classList.add('completed', 'anim-glow');
            setTimeout(() => cardNode.classList.remove('anim-glow'), 500);
            this.spawnConfetti(btnNode);
            
            // Check Milestones
            if (streakAfter > streakBefore) {
                const milestones = [3, 7, 14, 30];
                if (milestones.includes(streakAfter)) {
                    this.triggerCelebration(streakAfter);
                }
            }
        } else {
            cardNode.classList.remove('completed');
        }
        
        // Re-render dashboard partly
        this.renderDashboard(); 
        // We re-render entirely to update ring and streaks easily. In production, partial DOM update is better.
    },

    triggerCelebration(days) {
        const overlay = document.getElementById('celebration-overlay');
        const title = document.getElementById('celebration-title');
        const sparklerContainer = document.getElementById('sparkler-container');
        
        if (!overlay) return;
        
        title.textContent = `${days}-Day Streak.`;
        overlay.classList.add('active');
        sparklerContainer.innerHTML = '';
        
        for(let i=0; i<20; i++) {
            const particle = document.createElement('div');
            particle.className = 'sparkle-line';
            particle.style.left = (10 + Math.random() * 80) + '%';
            const h = 50 + Math.random() * 150;
            particle.style.height = h + 'px';
            particle.style.animationDelay = (Math.random() * 0.3) + 's';
            particle.style.animationDuration = (1.2 + Math.random() * 0.6) + 's';
            sparklerContainer.appendChild(particle);
        }
        
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 2500);
    },

    spawnConfetti(targetNode) {
        const rect = targetNode.getBoundingClientRect();
        const colors = ['#F5A623', '#27AE60', '#F0EDE8'];
        for(let i=0; i<5; i++) {
            const c = document.createElement('div');
            c.className = 'particle';
            c.style.background = colors[Math.floor(Math.random() * colors.length)];
            c.style.left = rect.left + rect.width/2 + 'px';
            c.style.top = rect.top + rect.height/2 + 'px';
            document.body.appendChild(c);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 20 + Math.random() * 30;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity - 20;

            c.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
            }).onfinish = () => c.remove();
        }
    },

    renderStats() {
        const habits = Store.getHabits();
        
        if (habits.length === 0) {
            document.getElementById('stat-consistency').textContent = '0%';
            document.getElementById('stat-weakest-day').textContent = 'N/A';
            document.getElementById('bar-chart-14').innerHTML = '';
            document.getElementById('streak-bars-container').innerHTML = '<p class="small-text">No habits tracked.</p>';
            return;
        }

        // 1. 30-Day Consistency & Weakest Day
        const dayCounts = [0,0,0,0,0,0,0]; // Sun=0, Mon=1...
        const dayPossible = [0,0,0,0,0,0,0];
        let totalDone30 = 0;
        let totalPossible30 = habits.length * 30;

        for (let i = 0; i < 30; i++) {
            const dateStr = Store.getDateStr(-i);
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dow = d.getDay();
            
            dayPossible[dow] += habits.length;

            const doneToday = habits.filter(h => Store.isCompleted(h.id, dateStr)).length;
            totalDone30 += doneToday;
            dayCounts[dow] += doneToday;
        }

        const consistency = Math.round((totalDone30 / totalPossible30) * 100);
        document.getElementById('stat-consistency').textContent = consistency + '%';

        // Weakest Day
        const daysNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let weakestIdx = -1;
        let lowestPct = 100;
        for (let i = 0; i < 7; i++) {
            if (dayPossible[i] > 0) {
                const pct = (dayCounts[i] / dayPossible[i]) * 100;
                if (pct < lowestPct) {
                    lowestPct = pct;
                    weakestIdx = i;
                }
            }
        }
        document.getElementById('stat-weakest-day').textContent = weakestIdx >= 0 ? daysNamesFull[weakestIdx] : 'N/A';

        // 2. 14-Day Bar Chart
        const barChartContainer = document.getElementById('bar-chart-14');
        let chartHtml = '';
        const shortDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        
        for (let i = 13; i >= 0; i--) {
            const dateStr = Store.getDateStr(-i);
            const doneToday = habits.filter(h => Store.isCompleted(h.id, dateStr)).length;
            const pct = Math.round((doneToday / habits.length) * 100);
            
            const tempDate = new Date();
            tempDate.setDate(tempDate.getDate() - i);
            const label = i === 0 ? 'T' : shortDays[tempDate.getDay()];

            chartHtml += `
            <div class="chart-bar-container">
                <div class="chart-bar anim-enter" style="height: ${pct}%; animation-delay: ${(13-i)*40}ms"></div>
                <span class="chart-label">${label}</span>
            </div>`;
        }
        barChartContainer.innerHTML = chartHtml;

        // 3. Best Streaks Horizontal Bars
        const streakContainer = document.getElementById('streak-bars-container');
        let streakHtml = '';
        
        // Find max streak to scale the bars (baseline max 30)
        let absoluteMax = 30;
        habits.forEach(h => { if(h.streak > absoluteMax) absoluteMax = h.streak; });

        habits.forEach((habit, idx) => {
            const widthPct = Math.min((habit.streak / absoluteMax) * 100, 100);
            streakHtml += `
            <div class="streak-bar-item anim-enter" style="animation-delay: ${idx * 60}ms">
                <div class="streak-bar-label">${habit.emoji} ${habit.name}</div>
                <div class="streak-bar-track">
                    <div class="streak-bar-fill" style="width: ${widthPct}%"></div>
                </div>
                <div class="streak-count">${habit.streak}</div>
            </div>`;
        });
        
        streakContainer.innerHTML = streakHtml;
    },

    showExportFallbackModal(jsonStr) {
        let exportModal = document.getElementById('modal-export-fallback');
        if (!exportModal) {
            exportModal = document.createElement('div');
            exportModal.id = 'modal-export-fallback';
            exportModal.className = 'modal';
            exportModal.innerHTML = `
                <div class="modal-body" style="text-align: center; max-height: 80vh; display: flex; flex-direction: column;">
                    <div class="modal-header">
                        <h2>Export Data</h2>
                        <button id="btn-close-export" class="btn-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <p class="small-text" style="margin-bottom: 16px;">If your device blocked the automatic download, manually copy your raw ecosystem structure here:</p>
                    <textarea id="export-json-content" class="custom-textarea" style="flex: 1; min-height: 200px; font-family: monospace; font-size: 12px; margin-bottom: 16px;" readonly></textarea>
                    <button id="btn-copy-export" class="btn-primary full-width">Copy to Clipboard</button>
                </div>
            `;
            document.body.appendChild(exportModal);

            document.getElementById('btn-close-export').addEventListener('click', () => {
                exportModal.classList.remove('active');
                document.getElementById('modal-backdrop').classList.remove('active');
            });

            document.getElementById('btn-copy-export').addEventListener('click', () => {
                const ta = document.getElementById('export-json-content');
                ta.select();
                document.execCommand('copy');
                const btn = document.getElementById('btn-copy-export');
                btn.textContent = 'Copied Successfully!';
                setTimeout(() => btn.textContent = 'Copy to Clipboard', 2000);
            });
        }
        
        document.getElementById('export-json-content').value = jsonStr;
        document.getElementById('modal-backdrop').classList.add('active');
        exportModal.classList.add('active');
    }

};
