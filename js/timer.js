/* js/timer.js */
const Timer = {
    timeLeft: 25 * 60,
    timerId: null,
    isRunning: false,
    mode: 'work',
    pomodoroCount: 0,
    
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
        
        this.timerModeText = document.getElementById('timer-mode');
        this.inputWork = document.getElementById('input-work');
        this.inputBreak = document.getElementById('input-break');
        this.inputLongBreak = document.getElementById('input-long-break');
    },

    bindEvents() {
        this.btnToggle.addEventListener('click', () => {
            if(this.isRunning) this.pause();
            else this.start();
        });

        this.btnReset.addEventListener('click', () => this.reset());

        [this.inputWork, this.inputBreak, this.inputLongBreak].forEach(input => {
            input.addEventListener('change', (e) => {
                let val = parseInt(e.target.value) || 1;
                const min = parseInt(e.target.min);
                const max = parseInt(e.target.max);
                if(val < min) val = min;
                if(val > max) val = max;
                e.target.value = val;

                const settings = Store.getSettings();
                settings.workDuration = parseInt(this.inputWork.value);
                settings.breakDuration = parseInt(this.inputBreak.value);
                settings.longBreakDuration = parseInt(this.inputLongBreak.value);
                Store.setSettings(settings);

                if (!this.isRunning) this.reset();
            });
        });
    },

    renderOptions() {
        const settings = Store.getSettings();
        this.inputWork.value = settings.workDuration || 25;
        this.inputBreak.value = settings.breakDuration || 5;
        this.inputLongBreak.value = settings.longBreakDuration || 15;

        const habits = Store.getHabits();
        let html = '<option value="">None</option>';
        habits.forEach(h => {
            html += `<option value="${h.id}">${h.emoji} ${h.name}</option>`;
        });
        this.taskSelect.innerHTML = html;
        
        this.circumference = 2 * Math.PI * 130;
        this.ring.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.ring.style.strokeDashoffset = '0';
        
        this.reset();
    },

    getModeDuration() {
        if (this.mode === 'break') return parseInt(this.inputBreak.value) * 60;
        if (this.mode === 'longBreak') return parseInt(this.inputLongBreak.value) * 60;
        return parseInt(this.inputWork.value) * 60;
    },

    setInputsLocked(locked) {
        this.inputWork.disabled = locked;
        this.inputBreak.disabled = locked;
        this.inputLongBreak.disabled = locked;
    },

    start() {
        this.isRunning = true;
        this.setInputsLocked(true);
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
        this.setInputsLocked(false);
        this.btnToggle.textContent = this.mode === 'work' ? 'Resume Focus' : 'Resume Break';
        this.btnToggle.classList.replace('btn-secondary', 'btn-primary');
    },

    reset() {
        this.pause();
        this.timeLeft = this.getModeDuration();
        this.timerModeText.textContent = this.mode === 'work' ? 'Focus' : (this.mode === 'break' ? 'Short Break' : 'Long Break');
        this.btnToggle.textContent = this.mode === 'work' ? 'Start Focus' : 'Start Break';
        this.btnToggle.classList.replace('btn-secondary', 'btn-primary');
        this.updateDisplay();
    },

    updateDisplay() {
        const m = Math.floor(this.timeLeft / 60);
        const s = this.timeLeft % 60;
        this.display.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        
        const total = this.getModeDuration();
        const pct = this.timeLeft / total;
        const offset = this.circumference - (pct * this.circumference);
        this.ring.style.strokeDashoffset = offset;
    },

    complete() {
        if(this.toggleSound && this.toggleSound.checked) {
            if("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
            this.playBeep();
        }
        
        if (this.mode === 'work') {
            const linkedTask = this.taskSelect.value;
            if (linkedTask) {
                 const todayStr = Store.getTodayStr();
                 if(!Store.isCompleted(linkedTask, todayStr)) {
                     Store.toggleCompletion(linkedTask, todayStr);
                     if (typeof UI !== 'undefined') UI.renderDashboard();
                 }
            }
            this.pomodoroCount++;
            if (this.pomodoroCount >= 4) {
                this.mode = 'longBreak';
                this.pomodoroCount = 0;
            } else {
                this.mode = 'break';
            }
        } else {
            this.mode = 'work';
        }
        
        this.reset();
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
