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
    },

    cacheDOM() {
        this.habitList = document.getElementById('habit-list');
        this.headerDate = document.getElementById('header-date');
        this.globalStreak = document.getElementById('global-streak');
        this.progressRing = document.getElementById('daily-progress-ring');
        this.progressPercent = document.getElementById('progress-percent');
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

        // Modals
        this.btnAddHabit.addEventListener('click', () => this.openModal(this.modalAddHabit));
        this.btnCloseModal.addEventListener('click', () => this.closeModal(this.modalAddHabit));
        this.modalBackdrop.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => this.closeModal(m));
        });

        // Add Habit
        this.formAddHabit.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('habit-name').value;
            const emoji = document.getElementById('habit-emoji').value;
            const category = document.getElementById('habit-category').value;
            
            Store.addHabit({ name, emoji, category, frequency: 'daily' });
            this.closeModal(this.modalAddHabit);
            this.formAddHabit.reset();
            document.getElementById('habit-emoji').value = '🎯';
            this.renderDashboard();
        });

        // Habit Clicks (Delegation)
        this.habitList.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-check');
            if (btn) {
                const card = btn.closest('.habit-card');
                const id = card.dataset.id;
                this.handleHabitCheck(id, card, btn);
            }
        });

        // Settings
        this.btnResetData.addEventListener('click', () => {
            if(confirm("Are you sure? This will wipe all habits, streaks, and settings.")) {
                Store.clearAllData();
            }
        });
    },

    switchView(viewId) {
        this.views.forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        
        if (viewId === 'view-today') this.renderDashboard();
        if (viewId === 'view-stats') this.renderStats();
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
        modal.classList.remove('active');
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

        habits.forEach(habit => {
            const isCompleted = Store.isCompleted(habit.id, todayStr);
            if (isCompleted) completedCount++;

            const tagClass = this.getTagClass(habit.category);

            const html = `
                <div class="habit-card cat-${tagClass} ${isCompleted ? 'completed' : ''}" data-id="${habit.id}">
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
                </div>
            `;
            this.habitList.insertAdjacentHTML('beforeend', html);
        });

        this.updateProgressRing(completedCount, habits.length);
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
        
        // Circumference = 2 * Math.PI * r = 2 * Math.PI * 70 = 439.8
        const circumference = 439.8;
        this.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        const offset = circumference - (percent / 100) * circumference;
        this.progressRing.style.strokeDashoffset = offset;
    },

    handleHabitCheck(id, cardNode, btnNode) {
        const todayStr = Store.getTodayStr();
        const isNowCompleted = Store.toggleCompletion(id, todayStr);
        
        if (isNowCompleted) {
            // Add animations
            cardNode.classList.add('completed', 'anim-glow');
            setTimeout(() => cardNode.classList.remove('anim-glow'), 500);
            this.spawnConfetti(btnNode);
        } else {
            cardNode.classList.remove('completed');
        }
        
        // Re-render dashboard partly
        this.renderDashboard(); 
        // We re-render entirely to update ring and streaks easily. In production, partial DOM update is better.
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
        const completions = Store.getCompletions();
        
        let bestStreak = 0;
        let totalPossible = 0;
        let totalCompleted = 0;

        habits.forEach(h => {
            if(h.streak > bestStreak) bestStreak = h.streak;
            // Best historical streak would actually require a deeper calculate, but we will show current best streak for simplicity
        });

        // 30 days consistency
        for(let i=0; i<30; i++) {
            const d = Store.getDateStr(-i);
            totalPossible += habits.length;
            if (completions[d]) {
                totalCompleted += completions[d].length;
            }
        }
        
        const consistency = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);
        
        this.statsConsistency.textContent = consistency + '%';
        this.statsBestStreak.innerHTML = `${bestStreak} <span class="small-text">days</span>`;

        // Render Heatmap (current week)
        this.heatmapGrid.innerHTML = '';
        
        // Days labels
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const todayIdx = new Date().getDay();
        
        // Render headers
        for(let i=0; i<7; i++) {
            const dIdx = (todayIdx - 6 + i + 7) % 7; 
            const dStr = Store.getDateStr(-6 + i);
            const done = completions[dStr] ? completions[dStr].length : 0;
            
            // Level calculation (0-4 based on habits array size)
            let level = 0;
            if (done > 0) {
                const pct = done / habits.length;
                if (pct <= 0.25) level = 1;
                else if (pct <= 0.5) level = 2;
                else if (pct <= 0.75) level = 3;
                else level = 4;
            }

            const html = `
                <div class="heatmap-day">
                    <span class="heatmap-label">${days[dIdx]}</span>
                    <div class="heatmap-cell level-${level}"></div>
                </div>
            `;
            this.heatmapGrid.insertAdjacentHTML('beforeend', html);
        }
    }
};
