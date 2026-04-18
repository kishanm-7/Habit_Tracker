/* js/timer.js */
const Timer = {
    timeLeft: 25 * 60,
    timerId: null,
    isRunning: false,
    durationMs: 25 * 60 * 1000,
    startTime: 0,
    
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateDisplay();
        this.renderOptions();
    },

    cacheDOM() {
        this.display = document.getElementById('time-left');
        this.ring = document.getElementById('active-timer-ring');
        this.btnToggle = document.getElementById('btn-timer-toggle');
        this.btnReset = document.getElementById('btn-timer-reset');
        this.taskSelect = document.getElementById('timer-task-select');
        this.toggleSound = document.getElementById('toggle-sound');
    },

    bindEvents() {
        this.btnToggle.addEventListener('click', () => {
            if(this.isRunning) this.pause();
            else this.start();
        });

        this.btnReset.addEventListener('click', () => {
            this.reset();
        });
    },

    renderOptions() {
        const habits = Store.getHabits();
        let html = '<option value="">None</option>';
        habits.forEach(h => {
            html += `<option value="${h.id}">${h.emoji} ${h.name}</option>`;
        });
        this.taskSelect.innerHTML = html;
        
        // initialize circumference
        this.circumference = 2 * Math.PI * 130;
        this.ring.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.ring.style.strokeDashoffset = '0';
    },

    start() {
        this.isRunning = true;
        this.btnToggle.textContent = 'Pause';
        this.btnToggle.classList.replace('btn-primary', 'btn-secondary');
        
        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.complete();
            }
        }, 1000);
    },

    pause() {
        this.isRunning = false;
        clearInterval(this.timerId);
        this.btnToggle.textContent = 'Resume';
        this.btnToggle.classList.replace('btn-secondary', 'btn-primary');
    },

    reset() {
        this.pause();
        this.timeLeft = 25 * 60;
        this.btnToggle.textContent = 'Start Focus';
        this.btnToggle.classList.replace('btn-secondary', 'btn-primary');
        this.updateDisplay();
    },

    updateDisplay() {
        const m = Math.floor(this.timeLeft / 60);
        const s = this.timeLeft % 60;
        this.display.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        
        const pct = this.timeLeft / (25 * 60);
        const offset = this.circumference - (pct * this.circumference);
        this.ring.style.strokeDashoffset = offset;
    },

    complete() {
        this.reset();
        if(this.toggleSound.checked) {
            // Beep sound via Web Audio API or vibration
            if("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
            this.playBeep();
        }
        
        // Mark task linked as complete
        const linkedTask = this.taskSelect.value;
        if (linkedTask) {
             const todayStr = Store.getTodayStr();
             if(!Store.isCompleted(linkedTask, todayStr)) {
                 Store.toggleCompletion(linkedTask, todayStr);
                 UI.renderDashboard();
             }
        }
    },

    playBeep() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = 800;
        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc.start();
        osc.stop(ctx.currentTime + 1);
    }
};
