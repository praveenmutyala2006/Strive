let habits = JSON.parse(localStorage.getItem('strive_habits')) || [];

function saveHabits() {
    localStorage.setItem('strive_habits', JSON.stringify(habits));
    updateProgress();
}

function updateProgress() {
    const text = document.getElementById("progressText");
    const bar = document.getElementById("progressBar");

    if (!text || !bar) return;

    const totalHabits = habits.length;
    const doneHabits = habits.filter(h => h.completed).length;

    //  Progress Text
    text.textContent = `${doneHabits}/${totalHabits} completed`;

    // Progress %
    let percent =
        totalHabits === 0
            ? 0
            : (doneHabits / totalHabits) * 100;

    //  Progress Bar
    bar.style.width = percent + "%";

    //  Momentum flow
     renderMomentumUI();
}

function renderHabits() {
    const list = document.getElementById("habitList");
    if (!list) return;

    //  Empty State text display
    if (habits.length === 0) {
        list.innerHTML = `
        <div style="text-align:center; padding:30px 10px; color: var(--beige-lo); opacity:0.95;">
            <p style="font-size:18px; margin-bottom:6px;">No habits yet...</p>
            <span style="font-size:14px; opacity:0.7;">Start logging & tracking habits</span>
        </div>
    `;
        updateProgress();
        return;
    }

    //  Normal List
    list.innerHTML = "";

    habits.forEach((habit, index) => {
        const habitDiv = document.createElement("div");
        habitDiv.className = "habit";
        
        // Intensity state mapping
        const status = habit.status || 'none';
        if (status !== 'none' && status !== 'skipped') habitDiv.classList.add("completed");
        if (status === 'skipped') habitDiv.classList.add("skipped-row");

        const span = document.createElement("span");
        span.textContent = habit.text;

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.alignItems = "center";
        actions.style.gap = "8px";

        // Status Dropdown Menu
        const statusSelect = document.createElement("select");
        statusSelect.className = `status-select status-${status}`;
        
        const options = [
            { val: 'none', label: '⚪ Idle' },
            { val: 'barely', label: '🟡 Barely' },
            { val: 'did', label: '🟢 Did' },
            { val: 'crushed', label: '🔥 Crushed' },
            { val: 'skipped', label: '❌ Skipped' }
        ];

        options.forEach(opt => {
            const o = document.createElement("option");
            o.value = opt.val;
            o.textContent = opt.label;
            if (status === opt.val) o.selected = true;
            statusSelect.appendChild(o);
        });

        statusSelect.onchange = (e) => updateHabitStatus(index, e.target.value);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑";
        deleteBtn.className = "delete";
        deleteBtn.onclick = () => deleteHabit(index);

        actions.appendChild(statusSelect);
        actions.appendChild(deleteBtn);

        habitDiv.appendChild(span);
        habitDiv.appendChild(actions);

        list.appendChild(habitDiv);
    });

    updateProgress();
}

function addHabit() {
    const input = document.getElementById("habitInput");

    if (!input) {
        return;
    }

    const habitText = input.value.trim();

    if (habitText === "") {
        return;
    }

    habits.push({ 
        text: habitText, 
        status: 'none', 
        completed: false,
        createdAt: new Date().toISOString() 
    });
    input.value = "";

    saveHabits();
    renderHabits();
}

function updateHabitStatus(index, nextStatus) {
    habits[index].status = nextStatus;
    habits[index].completed = (nextStatus !== 'none' && nextStatus !== 'skipped');

    const history = getHistory();
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (!history[todayStr]) history[todayStr] = {};
    history[todayStr][index] = nextStatus;
    
    saveHistory(history);
    saveHabits();
    renderHabits();
}

function deleteHabit(index) {
    const history = getHistory();
    const todayStr = new Date().toISOString().split('T')[0];
    if (history[todayStr] && history[todayStr][index]) {
        delete history[todayStr][index];
        saveHistory(history);
    }

    habits.splice(index, 1);
    saveHabits();
    renderHabits();
}

function checkDailyReset() {
    const lastReset = localStorage.getItem('strive_last_reset');
    const todayStr = new Date().toISOString().split('T')[0];

    if (lastReset !== todayStr) {
        habits = habits.map(h => ({
            ...h,
            status: 'none',
            completed: false
        }));
        saveHabits();
        localStorage.setItem('strive_last_reset', todayStr);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    checkDailyReset(); 
    renderHabits();

    const habitInput = document.getElementById("habitInput");
    if (habitInput) {
        habitInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") addHabit();
        });
    }
});

// Display name from Local Storage
let username = localStorage.getItem("displayName") || "User";
document.getElementsByClassName("strive-page-title")[0].textContent = `Hello, ${username}!`;