/* js/store.js */
const STORAGE_KEY_HABITS = 'forge_habits';
const STORAGE_KEY_COMPLETIONS = 'forge_completions';
const STORAGE_KEY_SETTINGS = 'forge_settings';

const defaultHabits = [
    { id: 1, name: "Gym / Workout", emoji: "🏋️", category: "FITNESS", isDefault: true, frequency: 'daily', streak: 0, createdAt: new Date().toISOString() },
    { id: 2, name: "Read for 20-30 mins", emoji: "📚", category: "MIND", isDefault: true, frequency: 'daily', streak: 0, createdAt: new Date().toISOString() },
    { id: 3, name: "Learn a new skill (30 mins)", emoji: "🧠", category: "GROWTH", isDefault: true, frequency: 'daily', streak: 0, createdAt: new Date().toISOString() },
    { id: 4, name: "Social Media < 30 mins", emoji: "📵", category: "DIGITAL DETOX", isDefault: true, frequency: 'daily', streak: 0, createdAt: new Date().toISOString() },
    { id: 5, name: "Drink 3 Litres of Water", emoji: "💧", category: "HEALTH", isDefault: true, frequency: 'daily', streak: 0, createdAt: new Date().toISOString() },
    { id: 6, name: "Sleep by 11 PM", emoji: "😴", category: "RECOVERY", isDefault: true, frequency: 'daily', streak: 0, createdAt: new Date().toISOString() }
];

const defaultSettings = {
    reminderTime: '08:00',
    soundEnabled: true,
    theme: 'dark',
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15
};

const Store = {
    getHabits() {
        const habits = localStorage.getItem(STORAGE_KEY_HABITS);
        if (!habits || habits === "[]") {
            const clone = JSON.parse(JSON.stringify(defaultHabits));
            this.setHabits(clone);
            return clone;
        }
        return JSON.parse(habits);
    },

    setHabits(habits) {
        localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
    },

    addHabit(habit) {
        const habits = this.getHabits();
        habits.push({
            ...habit,
            id: Date.now().toString(),
            streak: 0,
            createdAt: new Date().toISOString()
        });
        this.setHabits(habits);
    },

    updateHabit(habitData) {
        let habits = this.getHabits();
        habits = habits.map(h => {
            if (h.id === habitData.id) {
                return { ...h, ...habitData };
            }
            return h;
        });
        this.setHabits(habits);
    },

    deleteHabit(habitId) {
        let habits = this.getHabits();
        habits = habits.filter(h => h.id !== habitId);
        this.setHabits(habits);

        let completions = this.getCompletions();
        let changed = false;
        for (const date in completions) {
            const idx = completions[date].indexOf(habitId);
            if (idx > -1) {
                completions[date].splice(idx, 1);
                changed = true;
            }
            if (completions[date].length === 0) {
                delete completions[date];
                changed = true;
            }
        }
        if (changed) {
            this.setCompletions(completions);
            this.recalculateStreaks();
        }
    },

    getCompletions() {
        const completions = localStorage.getItem(STORAGE_KEY_COMPLETIONS);
        return completions ? JSON.parse(completions) : {};
    },

    setCompletions(completions) {
        localStorage.setItem(STORAGE_KEY_COMPLETIONS, JSON.stringify(completions));
    },

    getSettings() {
        const settings = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (!settings) {
            this.setSettings(defaultSettings);
            return defaultSettings;
        }
        return JSON.parse(settings);
    },

    setSettings(settings) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    },

    getTodayStr() {
        // YYYY-MM-DD local time
        const d = new Date();
        const offset = d.getTimezoneOffset();
        const localD = new Date(d.getTime() - (offset*60*1000));
        return localD.toISOString().split('T')[0];
    },

    getDateStr(daysOffset = 0) {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        const offset = d.getTimezoneOffset();
        const localD = new Date(d.getTime() - (offset*60*1000));
        return localD.toISOString().split('T')[0];
    },

    toggleCompletion(habitId, dateStr) {
        const completions = this.getCompletions();
        if (!completions[dateStr]) {
            completions[dateStr] = [];
        }

        const index = completions[dateStr].indexOf(habitId);
        let isCompleted = false;

        if (index === -1) {
            completions[dateStr].push(habitId);
            isCompleted = true;
        } else {
            completions[dateStr].splice(index, 1);
        }

        this.setCompletions(completions);
        this.recalculateStreaks();
        return isCompleted;
    },

    isCompleted(habitId, dateStr) {
        const completions = this.getCompletions();
        return completions[dateStr] ? completions[dateStr].includes(habitId) : false;
    },

    recalculateStreaks() {
        const habits = this.getHabits();
        const completions = this.getCompletions();
        const todayStr = this.getTodayStr();
        const yesterdayStr = this.getDateStr(-1);

        habits.forEach(habit => {
            let streak = 0;
            // Count backwards from yesterday. If today is done, don't count today until we finish loop, or actually count today then go back.
            let d = new Date();
            let checkDateStr = todayStr;
            let currentIsCompleted = completions[checkDateStr] && completions[checkDateStr].includes(habit.id);
            
            if (currentIsCompleted) {
                streak++;
            } else {
                // If today is not done, check if streak continued until yesterday
            }

            // check preceding days
            let offsetDate = new Date();
            offsetDate.setDate(offsetDate.getDate() - 1);
            let offsetDateStr = this._dateToStr(offsetDate);

            while(completions[offsetDateStr] && completions[offsetDateStr].includes(habit.id)) {
                streak++;
                offsetDate.setDate(offsetDate.getDate() - 1);
                offsetDateStr = this._dateToStr(offsetDate);
            }
            habit.streak = streak;
        });

        this.setHabits(habits);
    },

    _dateToStr(d) {
        const offset = d.getTimezoneOffset();
        const localD = new Date(d.getTime() - (offset*60*1000));
        return localD.toISOString().split('T')[0];
    },

    getOverallStreak() {
        // defined as: number of consecutive days where AT LEAST ONE habit was completed
        const completions = this.getCompletions();
        let streak = 0;
        const todayStr = this.getTodayStr();
        
        let d = new Date();
        let offsetDateStr = this._dateToStr(d);

        if (completions[offsetDateStr] && completions[offsetDateStr].length > 0) {
            streak++;
        }
        
        d.setDate(d.getDate() - 1);
        offsetDateStr = this._dateToStr(d);
        
        while(completions[offsetDateStr] && completions[offsetDateStr].length > 0) {
            streak++;
            d.setDate(d.getDate() - 1);
            offsetDateStr = this._dateToStr(d);
        }
        
        return streak;
    },

    clearAllData() {
        localStorage.removeItem(STORAGE_KEY_HABITS);
        localStorage.removeItem(STORAGE_KEY_COMPLETIONS);
        localStorage.removeItem(STORAGE_KEY_SETTINGS);
        window.location.reload();
    }
};
