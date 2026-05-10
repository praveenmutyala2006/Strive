/**
 * STRIVE Analytics Engine
 */

class AnalyticsEngine {
    constructor() {
        this.habitReliability = [
            { name: "Physical Training", score: 82 },
            { name: "Deep Focus", score: 76 },
            { name: "Reading", score: 51 },
            { name: "Early Wakeup", score: 24 }
        ];

        this.insights = [
            { tag: "Elite Friction", text: "As your score crosses 80%, ghost-day decay intensifies. Avoid zero-activity days to protect your rating." },
            { tag: "Streak Leverage", text: "Consecutive 'Did' or 'Crushed' states are currently compounding your overall momentum score." },
            { tag: "Intensity Deficit", text: "If progress slows, utilize the 'Crushed' state to push through asymptotic resistance." }
        ];

        this.init();
    }

    init() {
        const renderAll = () => {
            console.log("Analytics Engine: Initiating Render...");
            renderMomentumUI(); 
            this.renderConsistencySpine();
            this.renderPerformanceSummary();
            this.renderHabitReliability();
            this.renderHeatmap();
            this.renderInsights();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderAll);
        } else {
            renderAll();
        }
    }


    renderConsistencySpine() {
        const container = document.getElementById('consistencySpine');
        if (!container) return;

        const history = typeof getHistory === 'function' ? getHistory() : {};
        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let spineHTML = '';

        const weights = { 'crushed': 1.2, 'did': 1.0, 'barely': 0.5, 'skipped': -0.2, 'none': 0.0 };
        const patterns = [82, 45, 91, 30, 68, 55]; 

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = days[d.getDay()];
            
            const dayLogs = history[dateStr];
            let score = 0;

            if (dayLogs && Object.keys(dayLogs).length > 0) {
                let earnedCredit = 0;
                let totalTasks = 0;
                Object.values(dayLogs).forEach(state => {
                    if (state === 'did' || state === 'crushed') earnedCredit += 1;
                    else if (state === 'barely') earnedCredit += 0.5; // Show 50% for barely
                    if (state !== 'none') totalTasks += 1;
                });
                score = totalTasks > 0 ? Math.round((earnedCredit / totalTasks) * 100) : 0;
            }
 else if (i > 0) {
                // SHADOW SEEDING
                score = patterns[(i - 1) % patterns.length];
            }

            let status = '';
            if (score > 80) status = 'strong';
            if (score < 45 && score > 0) status = 'weak';

            spineHTML += `
                <div class="spine-row ${status}">
                    <span class="spine-day">${dayName}</span>
                    <div class="spine-bar-bg">
                        <div class="spine-bar-fill" style="width: ${score}%"></div>
                    </div>
                    <span class="spine-val">${score}%</span>
                </div>
            `;
        }
        container.innerHTML = spineHTML;
    }

    renderPerformanceSummary() {
        const summary = document.getElementById('performanceSummary');
        if (!summary) return;

        const history = typeof getHistory === 'function' ? getHistory() : {};
        const momentum = typeof calculateMomentum === 'function' ? calculateMomentum() : 0;
        const now = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const weights = { 'crushed': 1.2, 'did': 1.0, 'barely': 0.5, 'skipped': -0.2, 'none': 0.0 };
        const shadowPatterns = [82, 45, 91, 30, 68, 55]; 

        let bestScore = -1;
        let bestDayName = "Evaluating...";
        let worstScore = 101;
        let worstDayName = "Evaluating...";

       
        for (let i = 0; i < 14; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLogs = history[dateStr];
            
            let dailyScore = 0;
            if (dayLogs && Object.keys(dayLogs).length > 0) {
                let earned = 0; let possible = 0;
                Object.values(dayLogs).forEach(s => { earned += weights[s] || 0; possible += 1; });
                dailyScore = Math.round((earned / possible) * 100);
            } else if (i > 0) {
                // Incorporate shadow seeds stable across the full 14 days
                const pattern = [82, 45, 91, 30, 68, 55, 42, 75, 88, 62, 25, 50, 71, 80];
                dailyScore = pattern[i % pattern.length];
            }

            if (dailyScore > 0) {
                if (dailyScore >= bestScore) {
                    bestScore = dailyScore;
                    bestDayName = dayNames[d.getDay()];
                }
                if (dailyScore <= worstScore) {
                    worstScore = dailyScore;
                    worstDayName = dayNames[d.getDay()];
                }
            }
        }

        const metrics = [
            { label: 'Peak Flow Day', value: bestDayName }, 
            { label: 'Highest Friction', value: worstDayName },  
            { label: 'Rolling 30-Day Avg', value: `${momentum}%` }, // REAL
            { label: 'Engine Status', value: momentum > 80 ? 'Overdrive' : (momentum > 0 ? 'Building' : 'Idle') }         
        ];

        summary.innerHTML = metrics.map(m => `
            <div class="metric-row">
                <span class="metric-label">${m.label}</span>
                <span class="metric-value">${m.value}</span>
            </div>
        `).join('');
    }

    renderHabitReliability() {
        const reliability = document.getElementById('habitReliability');
        if (!reliability) return;

        const habits = typeof getHabits === 'function' ? getHabits() : [];
        
        // Show real habit names if they exist, otherwise use mock
        const displayHabits = habits.length > 0 
            ? habits.map(h => ({ name: h.text, score: Math.floor(Math.random() * 30) + 65 })) // Simulation score 65-95%
            : this.habitReliability;

        reliability.innerHTML = displayHabits.map(h => `
            <div class="metric-row">
                <span class="metric-label">${h.name}</span>
                <div style="display:flex; align-items:center;">
                    <span class="metric-value" style="font-size:14px;">${h.score}%</span>
                    <div class="rel-bar-container">
                        <div class="rel-bar-inner" style="width: ${h.score}%; opacity: ${h.score < 30 ? 0.35 : 1}"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderHeatmap() {
        const grid = document.getElementById('heatmapGrid');
        if (!grid) return;

        grid.innerHTML = ""; 
        let cellsHTML = '';
        for (let i = 0; i < 91; i++) { 
            const cyclePos = i % 7;
            let lvl = '';

            // Realistic Logic 
            const slump = Math.floor(i / 30); 
            const isSlumpWeek = (slump === 1 && i % 30 < 7);

            if (isSlumpWeek) {
                lvl = Math.random() > 0.9 ? 'lvl-1' : '';
            } else if (cyclePos === 1 || cyclePos === 2) {
                lvl = 'lvl-' + (Math.floor(Math.random() * 2) + 3);
            } else if (cyclePos === 5 || cyclePos === 6) {
                lvl = Math.random() > 0.85 ? 'lvl-1' : '';
            } else if (Math.random() > 0.5) {
                lvl = 'lvl-' + (Math.floor(Math.random() * 3) + 1);
            }

            cellsHTML += `<div class="h-cell ${lvl}"></div>`;
        }
        grid.innerHTML = cellsHTML;
    }

    renderInsights() {
        const feed = document.getElementById('insightsFeed');
        if (!feed) return;

        const momentum = typeof calculateMomentum === 'function' ? calculateMomentum() : 0;
        let dynamicInsights = [];

        // Dynamic Logics
        if (momentum < 30) {
            dynamicInsights = [
                { tag: "Getting Started", text: "Focus on showing up. Don't worry about being perfect right now." },
                { tag: "Quick Wins", text: "The system is sensitive early on. Even small actions will boost your score quickly." },
                { tag: "Consistency First", text: "Aim for 'Did' instead of 'Crushed'. Build the habit before focusing on intensity." }
            ];
        } else if (momentum < 80) {
            dynamicInsights = [
                { tag: "Momentum Active", text: "You've built a solid foundation. Now, focus on protecting your daily streak." },
                { tag: "Avoid Zero Days", text: "Skipping a day will cause your rolling average to drop significantly. Keep moving." },
                { tag: "Streak Bonus", text: "String together 3 consecutive days of activity for an automatic 5% score boost." }
            ];
        } else {
            dynamicInsights = [
                { tag: "Peak Performance", text: "You are in the elite tier. Maintaining this score requires intense daily focus." },
                { tag: "Push Harder", text: "Doing the bare minimum won't keep you here. Use the 'Crushed' status to stay at the top." },
                { tag: "High Stakes", text: "Missing a day at this level carries a heavy penalty. Protect your hard-earned momentum." }
            ];
        }
        
        feed.innerHTML = dynamicInsights.map(i => `
            <div class="insight-row">
                <span class="insight-tag">${i.tag}</span>
                <p class="insight-text">${i.text}</p>
            </div>
        `).join('');
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.striveAnalytics = new AnalyticsEngine(); });
} else {
    window.striveAnalytics = new AnalyticsEngine();
}
