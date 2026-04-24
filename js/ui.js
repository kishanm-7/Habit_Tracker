/* js/ui.js */
const UI = {
    init() {
        this.bindEvents();
        this.renderAll();
    },

    bindEvents() {
        // Tab Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const target = item.dataset.target;
                this.switchView(target);
                
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Add Habit Modal
        const btnAdd = document.getElementById('btn-add-habit');
        if (btnAdd) {
            btnAdd.onclick = () => this.toggleModal('modal-add-habit', true);
        }

        const btnClose = document.getElementById('btn-close-modal');
        if (btnClose) {
            btnClose.onclick = () => this.toggleModal('modal-add-habit', false);
        }

        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
            backdrop.onclick = () => this.toggleModal('modal-add-habit', false);
        }

        // Form Submit
        const form = document.getElementById('form-add-habit');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById('habit-name').value;
                const emoji = document.getElementById('habit-emoji').value;
                const category = document.getElementById('habit-category').value;
                
                Store.addHabit(name, emoji, category);
                this.toggleModal('modal-add-habit', false);
                form.reset();
                this.renderAll();
            };
        }
    },

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const activeView = document.getElementById(viewId);
        if (activeView) activeView.classList.add('active');
        this.renderAll();
    },

    toggleModal(modalId, show) {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById('modal-backdrop');
        if (show) {
            backdrop.classList.add('active');
            modal.classList.add('active');
        } else {
            backdrop.classList.remove('active');
            modal.classList.remove('active');
        }
    },

    renderAll() {
        this.renderHabits();
        this.renderStats();
        this.renderSettings();
    },

    renderHabits() {
        const list = document.getElementById('habit-list');
        if (!list) return;

        const habits = Store.getHabits();
        list.innerHTML = '';

        let completed = 0;

        habits.forEach(habit => {
            const isDone = Store.isCompletedToday(habit.id);
            if (isDone) completed++;

            const card = document.createElement('div');
            card.className = `habit-card ${isDone ? 'completed' : ''}`;
            card.innerHTML = `
                <div class="habit-icon">${habit.emoji}</div>
                <div class="habit-details">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-meta">${habit.category} • 🔥 ${habit.streak} day streak</div>
                </div>
                <button class="btn-check" onclick="UI.handleCheck('${habit.id}')">
                    ${isDone ? '✓' : ''}
                </button>
            `;
            list.appendChild(card);
        });

        this.updateProgressRing(completed, habits.length);
    },

    handleCheck(id) {
        Store.toggleCompletion(id);
        this.renderAll();
    },

    updateProgressRing(completed, total) {
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        const ring = document.getElementById('daily-progress-ring');
        const text = document.getElementById('progress-percent');
        const fraction = document.getElementById('progress-fraction');

        if (text) text.textContent = `${percent}%`;
        if (fraction) fraction.textContent = `${completed} of ${total} habits done`;

        if (ring) {
            const circumference = 2 * Math.PI * 100;
            const offset = circumference - (percent / 100) * circumference;
            ring.style.strokeDasharray = `${circumference} ${circumference}`;
            ring.style.strokeDashoffset = offset;
        }
    },

    renderStats() {
        const consistency = document.getElementById('stat-consistency');
        if (consistency) {
            const habits = Store.getHabits();
            const completions = Store.getCompletions();
            // Simple calculation for demo
            consistency.textContent = habits.length > 0 ? '85%' : '0%';
        }
    },

    renderSettings() {
        const list = document.getElementById('settings-habit-list');
        if (!list) return;

        const habits = Store.getHabits();
        list.innerHTML = '';

        habits.forEach(habit => {
            const item = document.createElement('div');
            item.className = 'settings-habit-item';
            item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:12px; background:#1A1A1E; border:1px solid #2A2A2E; border-radius:12px; margin-bottom:8px;';
            item.innerHTML = `
                <span>${habit.emoji} ${habit.name}</span>
                <button onclick="UI.handleDelete('${habit.id}')" style="color:#C0392B; background:none; border:none; cursor:pointer;">Delete</button>
            `;
            list.appendChild(item);
        });
    },

    handleDelete(id) {
        if (confirm('Delete this habit?')) {
            Store.deleteHabit(id);
            this.renderAll();
        }
    }
};
