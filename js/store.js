/* js/store.js */
const Store = {
    KEYS: {
        HABITS: 'forge_habits',
        COMPLETIONS: 'forge_completions'
    },

    init() {
        const habits = this.getHabits();
        if (!habits || habits.length === 0) {
            this.seedDefaults();
        }
    },

    seedDefaults() {
        const defaults = [
            { id: '1', name: 'Gym / Workout', emoji: '🏋️', category: 'FITNESS', streak: 0 },
            { id: '2', name: 'Read for 20-30 mins', emoji: '📚', category: 'MIND', streak: 0 },
            { id: '3', name: 'Learn a new skill', emoji: '🧠', category: 'GROWTH', streak: 0 },
            { id: '4', name: 'Digital Detox', emoji: '📵', category: 'DETOX', streak: 0 },
            { id: '5', name: 'Drink 3L Water', emoji: '💧', category: 'HEALTH', streak: 0 },
            { id: '6', name: 'Sleep by 11 PM', emoji: '😴', category: 'RECOVERY', streak: 0 }
        ];
        this.saveHabits(defaults);
    },

    getHabits() {
        const data = localStorage.getItem(this.KEYS.HABITS);
        return data ? JSON.parse(data) : [];
    },

    saveHabits(habits) {
        localStorage.setItem(this.KEYS.HABITS, JSON.stringify(habits));
    },

    getCompletions() {
        const data = localStorage.getItem(this.KEYS.COMPLETIONS);
        return data ? JSON.parse(data) : {};
    },

    saveCompletions(completions) {
        localStorage.setItem(this.KEYS.COMPLETIONS, JSON.stringify(completions));
    },

    getTodayStr() {
        return new Date().toISOString().split('T')[0];
    },

    toggleCompletion(habitId) {
        const today = this.getTodayStr();
        const completions = this.getCompletions();
        
        if (!completions[today]) completions[today] = [];
        
        const index = completions[today].indexOf(habitId);
        if (index === -1) {
            completions[today].push(habitId);
        } else {
            completions[today].splice(index, 1);
        }
        
        this.saveCompletions(completions);
        this.recalculateStreak(habitId);
    },

    isCompletedToday(habitId) {
        const today = this.getTodayStr();
        const completions = this.getCompletions();
        return completions[today] ? completions[today].includes(habitId) : false;
    },

    recalculateStreak(habitId) {
        const habits = this.getHabits();
        const completions = this.getCompletions();
        let streak = 0;
        let date = new Date();

        // Check backwards from today
        while (true) {
            const dateStr = date.toISOString().split('T')[0];
            if (completions[dateStr] && completions[dateStr].includes(habitId)) {
                streak++;
                date.setDate(date.getDate() - 1);
            } else {
                // If checking today and not done, streak might still be alive from yesterday
                if (dateStr === this.getTodayStr()) {
                    date.setDate(date.getDate() - 1);
                    continue;
                }
                break;
            }
            // Safety break
            if (streak > 365) break;
        }

        const habitIndex = habits.findIndex(h => h.id === habitId);
        if (habitIndex !== -1) {
            habits[habitIndex].streak = streak;
            this.saveHabits(habits);
        }
    },

    addHabit(name, emoji, category) {
        const habits = this.getHabits();
        const newHabit = {
            id: Date.now().toString(),
            name,
            emoji,
            category,
            streak: 0
        };
        habits.push(newHabit);
        this.saveHabits(habits);
    },

    deleteHabit(habitId) {
        let habits = this.getHabits();
        habits = habits.filter(h => h.id !== habitId);
        this.saveHabits(habits);
    }
};
