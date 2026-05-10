/**
 * STRIVE Motivation Engine
 */

let timerInterval;

const dailyQuotes = [
    { text: "The friction you feel is the boundary between who you are and who you are becoming.", author: "Strive Philosophy", mood: "default" },
    { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca", mood: "exhausted" },
    { text: "You don't rise to the level of your goals, you fall to the level of your systems.", author: "James Clear", mood: "procrastinating" },
    { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", mood: "overwhelmed" },
    { text: "The first rule is to keep an untroubled spirit. The second is to look things in the face and know them for what they are.", author: "Marcus Aurelius", mood: "overwhelmed" },
    { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King", mood: "procrastinating" },
    { text: "The cost of a thing is the amount of what I will call life which is required to be exchanged for it.", author: "Henry David Thoreau", mood: "exhausted" },
    { text: "Great things are not done by impulse, but by a series of small things brought together.", author: "Vincent van Gogh", mood: "overwhelmed" },
    { text: "Hard work is only a prison cell when the work has no meaning.", author: "Malcolm Gladwell", mood: "war_mode" },
    { text: "Who is more worthy of your competition than your yesterday self?", author: "Strive Philosophy", mood: "war_mode" }
];

const affirmations = ["UNSTOPPABLE", "RELENTLESS", "EXECUTE", "STAY HARD", "DISCIPLINED", "BEYOND LIMITS"];
const mantras = [
    "Ignore the noise. Focus on the mission.",
    "Pain is temporary. Pride is forever.",
    "Small wins compound into greatness.",
    "Deep work is your superpower.",
    "The mirror is your only competition.",
    "Don't stop when you're tired. Stop when you're done."
];

function renderSparkQuote(moodFilter = 'default') {
    const quoteEl = document.getElementById('sparkQuote');
    const authorEl = document.getElementById('sparkAuthor');
    if (!quoteEl || !authorEl) return;

    let filtered = dailyQuotes.filter(q => q.mood === moodFilter);
    if (filtered.length === 0) filtered = dailyQuotes.filter(q => q.mood === 'default');

    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];

    quoteEl.textContent = `"${quote.text}"`;
    authorEl.textContent = quote.author;
}

function selectMood(mood) {
    const node = document.getElementById(`node-${mood}`);
    const isAlreadyActive = node && node.classList.contains('active');

    // 1. UI Reset
    resetMood();
    
    // If it was already active, we just reset (Toggle Off)
    if (isAlreadyActive) return;

    // 2. Set active node
    if (node) node.classList.add('active');

    // 3. Highlight Logic
    const allCards = document.querySelectorAll('.strive-card');
    allCards.forEach(c => {
        if (!c.classList.contains('diagnostic-console')) {
            c.classList.add('dimmed');
        }
    });

    const mappings = {
        'exhausted': ['card-spark', 'card-audio3', 'card-breath', 'media-literature'],
        'overwhelmed': ['card-spark', 'card-forecast', 'card-breath', 'media-literature'],
        'procrastinating': ['card-spark', 'card-audio1', 'card-journal', 'media-cinema'],
        'war_mode': ['card-spark', 'card-audio2', 'card-forecast', 'media-sports']
    };

    const targets = mappings[mood] || [];
    targets.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('dimmed');
            el.classList.add('highlighted');
        }
    });

    renderSparkQuote(mood);
}

function resetMood() {
    const allCards = document.querySelectorAll('.strive-card');
    const nodes = document.querySelectorAll('.diag-node');
    
    allCards.forEach(c => {
        c.classList.remove('dimmed');
        c.classList.remove('highlighted');
    });

    nodes.forEach(n => n.classList.remove('active'));
    renderSparkQuote('default');
}

function toggleAudio(cardElement, audioId) {
    const audio = document.getElementById(audioId);
    const overlay = cardElement.querySelector('.play-overlay');

    if (audio.paused) {
        document.querySelectorAll('audio').forEach(a => {
            a.pause();
            const card = a.closest('.strive-card');
            if (card) {
                card.classList.remove('active');
                card.querySelector('.play-overlay').textContent = '▶';
            }
        });

        audio.play();
        cardElement.classList.add('active');
        overlay.textContent = '⏸';
    } else {
        audio.pause();
        cardElement.classList.remove('active');
        overlay.textContent = '▶';
    }
}

let mantraInterval;
function startMantraCycling() {
    const el = document.getElementById('missionMantra');
    if (!el) return;
    
    el.textContent = mantras[Math.floor(Math.random() * mantras.length)];
    mantraInterval = setInterval(() => {
        el.textContent = mantras[Math.floor(Math.random() * mantras.length)];
    }, 8000); 
}

function startSprint(minutes) {
    const overlay = document.getElementById('timerOverlay');
    const display = document.getElementById('timerDisplay');
    if (!overlay || !display) return;

    overlay.style.display = 'flex';
    let seconds = minutes * 60;

    startMantraCycling();

    timerInterval = setInterval(() => {
        seconds--;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        display.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;

        if (seconds <= 0) {
            clearInterval(timerInterval);
            clearInterval(mantraInterval);
            alert("Mission Complete.");
            stopSprint();
        }
    }, 1000);
}

function stopSprint() {
    clearInterval(timerInterval);
    clearInterval(mantraInterval);
    const overlay = document.getElementById('timerOverlay');
    if (overlay) overlay.style.display = 'none';
}

let breathTimeout;
let isBreathworkActive = false;

function startBreathwork() {
    const circle = document.getElementById('breathCircle');
    const text = document.getElementById('breathText');
    const badge = document.getElementById('breathBadge');
    const btn = document.getElementById('breathBtn');
    const stopBtn = document.getElementById('stopBreathBtn');

    if (!btn || !circle || !text || !badge || !stopBtn) return;

    isBreathworkActive = true;
    btn.style.display = 'none';
    stopBtn.style.display = 'block';
    badge.textContent = 'Active';
    badge.classList.add('active');

    const phases = [
        { name: 'Inhale', class: 'inhale', duration: 4000 },
        { name: 'Hold', class: 'hold-in', duration: 4000 },
        { name: 'Exhale', class: 'exhale', duration: 4000 },
        { name: 'Hold', class: 'hold-out', duration: 4000 }
    ];

    let cycle = 0;
    let phaseIndex = 0;
    const totalCycles = 4;

    function nextPhase() {
        if (!isBreathworkActive) return;

        if (cycle >= totalCycles) {
            stopBreathwork();
            text.textContent = 'Done ✓';
            return;
        }

        const phase = phases[phaseIndex];
        circle.className = 'breath-circle ' + phase.class;
        text.textContent = phase.name;

        phaseIndex++;
        if (phaseIndex >= phases.length) {
            phaseIndex = 0;
            cycle++;
        }

        breathTimeout = setTimeout(nextPhase, phase.duration);
    }

    nextPhase();
}

function stopBreathwork() {
    isBreathworkActive = false;
    clearTimeout(breathTimeout);

    const circle = document.getElementById('breathCircle');
    const text = document.getElementById('breathText');
    const badge = document.getElementById('breathBadge');
    const btn = document.getElementById('breathBtn');
    const stopBtn = document.getElementById('stopBreathBtn');

    if (circle) circle.className = 'breath-circle';
    if (text) text.textContent = 'Start';
    if (badge) {
        badge.textContent = 'Ready';
        badge.classList.remove('active');
    }
    if (btn) btn.style.display = 'block';
    if (stopBtn) stopBtn.style.display = 'none';
}

let journalEntries = JSON.parse(localStorage.getItem('strive_journal')) || [];

function renderJournal() {
    const container = document.getElementById('journalEntries');
    if (!container) return;
    container.innerHTML = '';

    journalEntries.slice().reverse().forEach(entry => {
        const div = document.createElement('div');
        div.className = 'journal-entry';
        div.innerHTML = `
            <span>${entry.text}</span>
            <span class="journal-time">${entry.time}</span>
        `;
        container.appendChild(div);
    });
}

function saveJournalEntry() {
    const input = document.getElementById('journalInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    journalEntries.push({ text, time });
    localStorage.setItem('strive_journal', JSON.stringify(journalEntries));
    input.value = '';
    renderJournal();
}

document.addEventListener('DOMContentLoaded', () => {
    const journalInput = document.getElementById('journalInput');
    if (journalInput) {
        journalInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') saveJournalEntry();
        });
    }
    renderJournal();
    renderMomentumUI();
    renderSparkQuote();
});
