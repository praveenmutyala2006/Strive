/*
 STRIVE Shared Utilities like navigation and Momentum Score
*/

// Global Navigation
function goTo(page) {
    const isInHtmlDir = window.location.pathname.includes('/html/');

    if (page.includes('index.html')) {
        window.location.href = isInHtmlDir ? '../index.html' : 'index.html';
    } 
    else {
        window.location.href = isInHtmlDir ? page : 'html/' + page;
    }
}

// Data Management
function getHabits() {
    return JSON.parse(localStorage.getItem('strive_habits')) || [];
}

function getHistory() {
    return JSON.parse(localStorage.getItem('strive_history')) || {};
}

function saveHabits(habits) {
    localStorage.setItem('strive_habits', JSON.stringify(habits));
}

function saveHistory(history) {
    localStorage.setItem('strive_history', JSON.stringify(history));
}

// Momentum Calculation
function calculateMomentum() {
    const history = getHistory();
    const now = new Date();
    let totalPossible = 0;
    let totalEarned = 0;

    // Phase Detection
    const historyKeys = Object.keys(history);
    const realActiveDays = historyKeys.filter(key => Object.keys(history[key]).length > 0).length;

    const isOnboarding = realActiveDays < 3;
    const daysToTrack = isOnboarding ? 14 : 30;
    const ghostWeightBase = isOnboarding ? 1.5 : 3.0;
    const weights = { 'crushed': 1.2, 'did': 1.0, 'barely': 0.5, 'skipped': -0.2, 'none': 0.0 };
    const shadowPatterns = [82, 45, 91, 30, 68, 55, 42, 75, 88, 62, 25, 50, 71, 80];

    let streak = 0;
    let maxStreak = 0;

    for (let i = daysToTrack - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLogs = history[dateStr];
        
        if (dayLogs && Object.keys(dayLogs).length > 0) {
            let dayEarned = 0;
            let dayPossible = 0;
            let activeOnDay = false;

            Object.values(dayLogs).forEach(state => {
                const weight = weights[state] || 0;
                dayEarned += weight;
                dayPossible += 1;
                if (weight > 0) activeOnDay = true;
            });

            const isPerfect = Object.values(dayLogs).every(s => s === 'did' || s === 'crushed');
            if (isPerfect && dayPossible > 0) dayEarned *= 1.15;

            totalEarned += dayEarned;
            totalPossible += dayPossible;

            if (activeOnDay) {
                streak++;
                maxStreak = Math.max(maxStreak, streak);
            } else {
                streak = 0;
            }
        } else {
            
            const currentApproxScore = totalPossible > 0 ? (totalEarned / totalPossible) : 0;
            const frictionMultiplier = (!isOnboarding && currentApproxScore > 0.8) ? 3.33 : 1.0;
            totalPossible += (ghostWeightBase * frictionMultiplier);
            streak = 0;
        }
    }

    if (totalPossible <= 0) return 0;
    const streakBonus = 1 + (Math.floor(maxStreak / 3) * 0.05);
    let rawScore = (totalEarned / totalPossible) * 100 * streakBonus;

    if (rawScore > 80) {
        const excess = rawScore - 80;
        rawScore = 80 + (20 * (1 - Math.exp(-excess / 25)));
    }

    return Math.min(99, Math.max(0, Math.round(rawScore)));
}

// Momentum Forecast
function calculateMomentumForecast() {
    const habits = getHabits();
    const history = getHistory();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    
    if (habits.length === 0) return calculateMomentum();

    // 1. PHASE DETECTION
    const historyKeys = Object.keys(history);
    const realActiveDays = historyKeys.filter(k => Object.keys(history[k]).length > 0).length;
    const isOnboarding = realActiveDays < 3;
    const daysToTrack = isOnboarding ? 14 : 30;
    const weights = { 'crushed': 1.2, 'did': 1.0, 'barely': 0.5, 'skipped': -0.2, 'none': 0.0 };
    const shadowPatterns = [82, 45, 91, 30, 68, 55, 42, 75, 88, 62, 25, 50, 71, 80];

    let totalEarned = 0;
    let totalPossible = 0;

    for (let i = 0; i < daysToTrack; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        if (i === 0) {
            
            habits.forEach(() => {
                totalEarned += weights['skipped'];
                totalPossible += 1;
            });
        } else {
            const dayLogs = history[dateStr];
            if (dayLogs && Object.keys(dayLogs).length > 0) {
                // REAL HISTORY
                Object.values(dayLogs).forEach(state => {
                    totalEarned += (weights[state] || 0);
                    totalPossible += 1;
                });
            } else {
                
                totalPossible += (isOnboarding ? 1.5 : 3.0);
            }
        }
    }

    if (totalPossible <= 0) return 0;
    let rawScore = (totalEarned / totalPossible) * 100;
    if (rawScore > 80) rawScore = 80 + (20 * (1 - Math.exp(-(rawScore - 80) / 25)));
    return Math.min(99, Math.max(0, Math.round(rawScore)));
}


function renderMomentumUI() {
    const score = calculateMomentum();
    
    // 1. Update SVG Momentum Rings (Dashboard & Analytics)
    const paths = document.querySelectorAll('#momentumPath');
    const vals = document.querySelectorAll('#momentumVal');
    
    paths.forEach(path => {
        path.style.strokeDasharray = `${score}, 100`;
    });
    
    vals.forEach(val => {
        val.textContent = `${score}%`;
    });

    // 2. Update Motivation Page Scores (Current & Forecast)
    const motivationScore = document.getElementById('motivationMomentumScore');
    if (motivationScore) {
        motivationScore.textContent = `${score}%`;
    }

    const forecastEl = document.getElementById('forecastScore');
    if (forecastEl) {
        const forecast = typeof calculateMomentumForecast === 'function' ? calculateMomentumForecast() : 0;
        forecastEl.textContent = `${forecast}%`;
    }

    // 3. Sync dashboard indicators if they exist
    const momentumLegacy = document.getElementById("momentumScore");
    if (momentumLegacy) {
        momentumLegacy.textContent = score + "%";
        momentumLegacy.style.background = `conic-gradient(var(--amber) ${score}%, var(--lift) 0%)`;
    }
}

// System Reset: Wipes all user data
function resetUserData() {
    const confirmed = confirm("CRITICAL ACTION: This will permanently delete all your habits, history, and settings. Are you absolutely sure?");
    if (confirmed) {
        // Clear all keys used by Strive
        const keysToRemove = [
            'strive_habits',
            'strive_history',
            'striveUsername',
            'strive_journal',
            'displayName',
            'email'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));

        alert("System Reset Complete. Returning to landing page.");
        goTo('index.html');
    }
}

