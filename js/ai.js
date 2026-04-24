window.AI = {
    apiKey: "ANTHROPIC_API_KEY",
    model: "claude-haiku-4-5-20251001",
    maxRefreshes: 3,
    
    init() {
        this.btnRefresh = document.getElementById('btn-refresh-insight');
        this.contentBox = document.getElementById('insight-content');
        if (this.btnRefresh) {
            this.btnRefresh.addEventListener('click', () => this.forceRefresh());
        }
    },
    
    getCacheKey() {
        return 'insight_' + new Date().toDateString();
    },
    
    getRefreshCountKey() {
        return 'insight_refreshes_' + new Date().toDateString();
    },
    
    renderInsight() {
        const cached = localStorage.getItem(this.getCacheKey());
        if (cached) {
            this.contentBox.innerHTML = cached;
            return;
        }
        this.fetchInsight();
    },
    
    forceRefresh() {
        let count = parseInt(localStorage.getItem(this.getRefreshCountKey()) || '0');
        if (count >= this.maxRefreshes) {
            if(window.UI && UI.showToast) UI.showToast("Max insights reached for today.");
            return;
        }
        localStorage.setItem(this.getRefreshCountKey(), count + 1);
        this.fetchInsight();
    },
    
    showSkeleton() {
        if (!this.contentBox) return;
        this.contentBox.innerHTML = `
            <div class="skeleton-container">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
        `;
    },
    
    async fetchInsight() {
        this.showSkeleton();
        
        const stats = this.compileStats();
        
        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey,
                    "anthropic-version": "2023-06-01",
                    "anthropic-dangerously-allow-browser": "true"
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 150,
                    messages: [{
                        role: "user",
                        content: `You are a personal habit coach for a self improvement app called FORGE. 
                        Analyze this user's habit data from the last 7 days and give ONE short, specific, 
                        motivating insight (max 2 sentences). Be direct, no fluff. Sound like a serious coach not a chatbot. No emojis.
                        
                        Habit data: ${JSON.stringify(stats)}`
                    }]
                })
            });
            
            if (!response.ok) throw new Error("API failed");
            
            const data = await response.json();
            const insightText = data.content[0].text;
            
            localStorage.setItem(this.getCacheKey(), insightText);
            this.typewriterEffect(insightText);
            
        } catch (error) {
            console.error("AI Insight Error:", error);
            const fallback = "Keep showing up. Consistency beats everything else.";
            localStorage.setItem(this.getCacheKey(), fallback);
            this.typewriterEffect(fallback);
        }
    },
    
    compileStats() {
        const habits = Store.getHabits() || [];
        const completions = Store.getCompletions() || {};
        
        let bestHabit = null;
        let worstHabit = null;
        let highestStreak = -1;
        let lowestStreak = 9999;
        
        let totalPossible = habits.length;
        let completedToday = 0;
        const todayStr = Store.getTodayStr();
        if (completions[todayStr]) {
            completedToday = completions[todayStr].length;
        }
        
        habits.forEach(h => {
            if (h.streak > highestStreak) {
                highestStreak = h.streak;
                bestHabit = h.name;
            }
            if (h.streak < lowestStreak) {
                lowestStreak = h.streak;
                worstHabit = h.name;
            }
        });
        
        return {
            totalHabits: habits.length,
            bestPerformingHabit: bestHabit,
            mostSkippedHabit: worstHabit,
            todayCompletionPercentage: totalPossible > 0 ? Math.round((completedToday / totalPossible) * 100) : 0,
            recentStreaks: habits.map(h => ({ name: h.name, streak: h.streak }))
        };
    },
    
    typewriterEffect(text) {
        if (!this.contentBox) return;
        this.contentBox.innerHTML = '';
        let i = 0;
        const speed = 30; // 30ms per char
        
        const typeWriter = () => {
            if (i < text.length) {
                this.contentBox.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        };
        typeWriter();
    }
};
