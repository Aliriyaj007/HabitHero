// --- Game State & Data ---
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let coins = JSON.parse(localStorage.getItem("coins")) || 0;
let history = JSON.parse(localStorage.getItem("history")) || {};
let reflections = JSON.parse(localStorage.getItem("reflections")) || {};
let userStats = JSON.parse(localStorage.getItem("userStats")) || {
  lvl: 1, xp: 0, maxXp: 100,
  str: 0, int: 0, vit: 0, cha: 0
};
let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

// Store Configuration
const storeItems = [
  { id: 'theme_ocean', name: '🌊 Ocean Theme', type: 'theme', cost: 200, value: 'ocean', desc: 'Deep calm vibes.', icon: '🌊' },
  { id: 'theme_neon', name: '🌌 Neon Theme', type: 'theme', cost: 300, value: 'neon', desc: 'Cyberpunk energy.', icon: '🌌' },
  { id: 'theme_gold', name: '👑 Golden Theme', type: 'theme', cost: 500, value: 'gold', desc: 'Pure luxury.', icon: '👑' },
  { id: 'potion_xp', name: '🧪 XP Potion', type: 'consumable', cost: 50, value: 50, desc: 'Instantly gain 50 XP.', icon: '🧪' },
  { id: 'badge_master', name: '🏆 Hero Badge', type: 'badge', cost: 100, desc: 'A badge of honor.', icon: '🏆' }
];

// Migration for old habits (assign random or default stat)
habits.forEach(h => { if (!h.statType) h.statType = "VIT"; });

let idToEdit = null, filter = "All";

// --- Audio Controller (Web Audio API) ---
const AudioCtrl = (() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  function playTone(freq, type, duration, vol = 0.1) {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  let soundEnabled = true;
  let currentPack = 'modern';

  const packs = {
    modern: {
      success: () => {
        playTone(440, 'sine', 0.1);
        setTimeout(() => playTone(554, 'sine', 0.1), 100);
        setTimeout(() => playTone(659, 'sine', 0.2), 200);
      },
      levelUp: () => {
        [440, 554, 659, 880, 1108, 1760].forEach((f, i) => setTimeout(() => playTone(f, 'square', 0.4, 0.2), i * 100));
      },
      click: () => playTone(800, 'triangle', 0.05, 0.05),
      error: () => playTone(150, 'sawtooth', 0.3)
    },
    retro: {
      success: () => {
        playTone(523.25, 'square', 0.1);
        setTimeout(() => playTone(659.25, 'square', 0.1), 80);
      },
      levelUp: () => {
        [220, 440, 880, 1760].forEach((f, i) => setTimeout(() => playTone(f, 'sawtooth', 0.1, 0.3), i * 80));
      },
      click: () => playTone(1200, 'square', 0.03, 0.1),
      error: () => playTone(100, 'square', 0.2)
    },
    zen: {
      success: () => {
        playTone(300, 'sine', 1.0, 0.05);
        setTimeout(() => playTone(450, 'sine', 1.5, 0.05), 200);
      },
      levelUp: () => {
        [200, 300, 400, 500].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 2.0, 0.1), i * 300));
      },
      click: () => playTone(800, 'sine', 0.05, 0.05),
      error: () => playTone(200, 'sine', 0.5)
    }
  };

  return {
    toggleSound: (val) => soundEnabled = val,
    setPack: (pack) => { if (packs[pack]) currentPack = pack; },
    playSuccess: () => { if (soundEnabled) packs[currentPack].success(); },
    playLevelUp: () => { if (soundEnabled) packs[currentPack].levelUp(); },
    playClick: () => { if (soundEnabled) packs[currentPack].click(); },
    playError: () => { if (soundEnabled) packs[currentPack].error(); }
  };
})();

// --- Confetti / Particles ---
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let particles = [];
let animationId = null;

function createBurst(x, y) {
  for (let i = 0; i < 15; i++) { // Optimization: Reduced from 30
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      life: 1
    });
  }
  if (!animationId) animateParticles();
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (particles.length === 0) {
    animationId = null;
    return; // Optimization: Stop loop when no particles
  }

  particles.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy;
    p.life -= 0.02;
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    if (p.life <= 0) particles.splice(i, 1);
  });

  animationId = requestAnimationFrame(animateParticles);
}

// --- Notifications & Badges ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'gold') icon = '🏆';

  toast.innerHTML = `<span style="font-size:1.2rem">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function renderBadges() {
  const caseDiv = document.getElementById('badge-case');
  if (!caseDiv) return;

  const badges = storeItems.filter(i => i.type === 'badge' && inventory.includes(i.id));

  if (badges.length > 0) {
    caseDiv.style.display = 'flex';
    caseDiv.innerHTML = badges.map(b => `
      <div class="badge-item" title="${b.name}\n${b.desc}">
        ${b.icon}
      </div>
    `).join('');
  } else {
    caseDiv.style.display = 'none';
  }
}

// --- Save & Persistence ---
function save() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("coins", JSON.stringify(coins));
  localStorage.setItem("history", JSON.stringify(history));
  localStorage.setItem("reflections", JSON.stringify(reflections));
  localStorage.setItem("userStats", JSON.stringify(userStats));
  localStorage.setItem("inventory", JSON.stringify(inventory));
  localStorage.setItem("settings", JSON.stringify({
    theme: document.getElementById('global-theme-select').value,
    sound: document.getElementById('sound-toggle').checked,
    audioPack: document.getElementById('audio-pack-select').value
  }));
}

// --- Store Logic ---
function renderStore() {
  const grid = document.getElementById("store-items");
  if (!grid) return;
  grid.innerHTML = "";

  storeItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "reward-card";
    const owned = inventory.includes(item.id);

    // Logic for Consumables vs One-time Unlocks
    let btnText = "Unlock";
    let btnClass = "btn-primary";
    let disabled = "";

    if (item.type === 'theme' || item.type === 'badge') {
      if (owned) { btnText = "Owned"; btnClass = "btn-outline"; disabled = "disabled"; }
    }

    card.innerHTML = `
      <h3>${item.name}</h3>
      <p style="font-size:0.9rem; color:#aaa">${item.desc}</p>
      <p class="cost">💎 ${item.cost}</p>
      <button class="buy-btn ${btnClass}" onclick="buyItem('${item.id}')" ${disabled}>${btnText}</button>
    `;
    grid.appendChild(card);
  });
}

function buyItem(id) {
  const item = storeItems.find(i => i.id === id);
  if (!item) return;

  if (coins >= item.cost) {
    if (item.type !== 'consumable' && inventory.includes(id)) return; // Already owned

    coins -= item.cost;

    if (item.type === 'consumable') {
      // Apply effect immediately
      if (id === 'potion_xp') {
        gainXP(item.value, 'INT');
        showToast(`Glug glug... You gained ${item.value} XP!`, 'gold');
      }
    } else {
      inventory.push(id);
      if (item.type === 'theme') updateThemeOptions();
      if (item.type === 'badge') renderBadges(); // Update badges display
    }

    save();
    renderStore();
    document.getElementById("coin-counter").textContent = coins;
    AudioCtrl.playLevelUp(); // Sound effect
    createBurst(event.clientX, event.clientY);
    showToast(`Acquired: ${item.name}`, 'success');
  } else {
    AudioCtrl.playError();
    showToast("Not enough coins, Hero!", 'error');
  }
}

function updateThemeOptions() {
  const select = document.getElementById('global-theme-select');
  // Enable options if owned
  // Simplified: We will just check inventory in the change handler or rebuild options.
  // For now, let's keep it simple: If they own it, they can select it.
  // Actually, we should rebuild the select options based on inventory.

  const themes = [
    { val: 'space', name: 'Deep Space (Default)', req: null },
    { val: 'ocean', name: 'Abyssal Ocean', req: 'theme_ocean' },
    { val: 'neon', name: 'Neon Tokyo', req: 'theme_neon' },
    { val: 'gold', name: 'Golden Legend', req: 'theme_gold' }
  ];

  const currentVal = select.value;
  select.innerHTML = "";

  themes.forEach(t => {
    if (!t.req || inventory.includes(t.req)) {
      const opt = document.createElement('option');
      opt.value = t.val;
      opt.textContent = t.name;
      select.appendChild(opt);
    }
  });
  select.value = currentVal; // Restore selection if still valid
  if (select.value === "") select.value = "space"; // Fallback
}

// --- RPG Logic ---
function gainXP(amount, statType) {
  userStats.xp += amount;
  if (statType) userStats[statType.toLowerCase()] += 1;

  if (userStats.xp >= userStats.maxXp) {
    userStats.lvl++;
    userStats.xp -= userStats.maxXp;
    userStats.maxXp = Math.floor(userStats.maxXp * 1.5);
    AudioCtrl.playLevelUp();
    showLevelUpModal();
    createBurst(window.innerWidth / 2, window.innerHeight / 2);
  }
  renderStatsBar();
  save();
}

// --- Rendering ---
function renderStatsBar() {
  const bar = document.getElementById('rpg-stats');
  const pct = Math.min(100, (userStats.xp / userStats.maxXp) * 100);
  bar.innerHTML = `
    <div class="stat-pill" style="border-color:var(--neon-gold)">
      <span class="stat-name">Level</span>
      <span class="stat-value">${userStats.lvl}</span>
      <div class="xp-bar" style="width:${pct}%"></div>
    </div>
    <div class="stat-pill"><span class="stat-name">STR</span><span class="stat-value">${userStats.str}</span></div>
    <div class="stat-pill"><span class="stat-name">INT</span><span class="stat-value">${userStats.int}</span></div>
    <div class="stat-pill"><span class="stat-name">VIT</span><span class="stat-value">${userStats.vit}</span></div>
    <div class="stat-pill"><span class="stat-name">CHA</span><span class="stat-value">${userStats.cha}</span></div>
  `;
}

function renderHabits() {
  const grid = document.getElementById("habits-grid");
  grid.innerHTML = "";

  habits.filter(h => filter === "All" || h.category === filter).forEach(h => {
    const div = document.createElement("div");
    div.className = "habit-card";
    const isCompleted = h.completions.includes(new Date().toISOString().slice(0, 10));

    div.innerHTML = `
      <h3>${h.name}</h3>
      <p>${h.category} • +XP (${h.statType})</p>
      <span class="habit-streak">🔥 ${h.streak || 0} Day Streak</span>
      <div class="card-actions">
        <button class="btn-checkin" onclick="checkIn(${h.id})" ${isCompleted ? 'disabled style="opacity:0.5"' : ''}>
           ${isCompleted ? '✅ Done' : '⚔️ Complete'}
        </button>
        <button class="btn-edit" onclick="openEdit(${h.id})">✏️</button>
        <button class="btn-delete" onclick="delHabit(${h.id})">🗑️</button>
      </div>
    `;
    grid.appendChild(div);
  });

  document.getElementById("coin-counter").textContent = coins;
  renderStats();
}

// --- Actions ---
function addHabit(name, category, statType) {
  habits.push({
    id: Date.now(),
    name, category, statType,
    streak: 0, completions: []
  });
  save();
  renderHabits();
  AudioCtrl.playSuccess();
  showToast(`Quest Added: ${name}`, 'success');
}

function checkIn(id) {
  const h = habits.find(x => x.id === id);
  const today = new Date().toISOString().slice(0, 10);

  if (!h.completions.includes(today)) {
    h.completions.push(today);
    h.streak++;
    coins += 5; // More coins in V2
    if (!history[today]) history[today] = [];
    history[today].push(h.name);

    gainXP(20, h.statType);
    createBurst(event.clientX, event.clientY);
    AudioCtrl.playSuccess();
    showToast(`Check-in: ${h.name} (+20 XP)`, 'success');

    save(); renderHabits(); renderCalendar();

    // Optional reflection 50% chance or every time? keeping original flow
    openReflection(today);
  }
}

function delHabit(id) {
  if (confirm("Abandon this quest?")) {
    const h = habits.find(x => x.id === id);
    habits = habits.filter(h => h.id !== id);
    save();
    renderHabits();
    showToast(`Quest abandoned: ${h ? h.name : ""}`, 'error');
  }
}

// --- UI / Modals ---
// Add Habit (New Flow)
document.getElementById('hero-add').onclick = () => {
  idToEdit = null; // New habit
  document.getElementById('modal-name').value = "";
  document.getElementById('habit-modal').classList.remove('hidden');
};

document.getElementById('modal-save').onclick = () => {
  const name = document.getElementById('modal-name').value;
  const catSelect = document.getElementById('modal-category');
  const category = catSelect.value;
  // Map Category to Stat
  const statMap = { 'Work': 'INT', 'Fitness': 'STR', 'Health': 'VIT', 'Personal': 'CHA' };
  const statType = statMap[category];

  if (!name) { AudioCtrl.playError(); return; }

  if (idToEdit) {
    const h = habits.find(x => x.id === idToEdit);
    h.name = name; h.category = category; h.statType = statType;
  } else {
    addHabit(name, category, statType);
  }
  save(); renderHabits();
  document.getElementById('habit-modal').classList.add('hidden');
};
document.getElementById('modal-cancel').onclick = () => document.getElementById('habit-modal').classList.add('hidden');

function openEdit(id) {
  idToEdit = id;
  const h = habits.find(x => x.id === id);
  document.getElementById('modal-name').value = h.name;
  document.getElementById('modal-category').value = h.category;
  document.getElementById('habit-modal').classList.remove('hidden');
}

// Reflection
function openReflection(date) {
  document.getElementById("reflection-text").value = reflections[date] || "";
  document.getElementById("reflection-modal").classList.remove("hidden");

  document.getElementById("reflection-save").onclick = () => {
    reflections[date] = document.getElementById("reflection-text").value;
    coins += 5; // Bonus coins
    gainXP(10, 'CHA'); // Reflection boosts CHARISMA? Or just generic.
    save();
    document.getElementById("reflection-modal").classList.add("hidden");
    AudioCtrl.playSuccess();
  };
  document.getElementById("reflection-close").onclick = () => document.getElementById("reflection-modal").classList.add("hidden");
}

function showLevelUpModal() {
  document.getElementById('levelup-level').textContent = userStats.lvl;
  document.getElementById('levelup-modal').classList.remove('hidden');
}

// --- Focus Mode ---
let focusTimer = null;
let focusSeconds = 25 * 60;
let isFocusing = false;

window.openFocusMode = () => {
  document.getElementById('focus-overlay').classList.add('active');
};
window.closeFocusMode = () => {
  document.getElementById('focus-overlay').classList.remove('active');
  clearInterval(focusTimer); isFocusing = false;
  document.getElementById('focus-toggle').textContent = "Start Focus";
};

document.getElementById('focus-toggle').onclick = () => {
  if (isFocusing) {
    clearInterval(focusTimer); isFocusing = false;
    document.getElementById('focus-toggle').textContent = "Resume Focus";
  } else {
    isFocusing = true;
    document.getElementById('focus-toggle').textContent = "Pause Focus";
    focusTimer = setInterval(() => {
      focusSeconds--;
      const mins = Math.floor(focusSeconds / 60);
      const secs = focusSeconds % 60;
      document.getElementById('timer-display').textContent =
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      if (focusSeconds <= 0) {
        clearInterval(focusTimer);
        AudioCtrl.playLevelUp();
        AudioCtrl.playLevelUp();
        showToast("Focus Session Complete! +100 XP", 'gold');
        gainXP(100, 'INT');
        closeFocusMode();
        focusSeconds = 25 * 60;
      }
    }, 1000);
  }
};

// Theme Switcher Logic
document.getElementById('focus-theme-select').onchange = (e) => {
  document.getElementById('focus-overlay').dataset.focusTheme = e.target.value;
  AudioCtrl.playClick();
};


// --- Calendar & Stats ---
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";
  const today = new Date();
  const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  for (let i = 1; i <= days; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), i).toISOString().slice(0, 10);
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.textContent = i;
    if (history[d]) cell.classList.add("completed");
    cell.onclick = () => openReflection(d);
    grid.appendChild(cell);
  }
}

function renderStats() {
  document.getElementById("total-habits").textContent = habits.length;
  const tot = habits.reduce((a, h) => a + h.completions.length, 0);
  document.getElementById("total-completions").textContent = tot;
  document.getElementById("avg-rate").textContent = (habits.length ? Math.round(tot / (habits.length * 30) * 100) : 0) + "%";
  renderChart();
}
function renderChart() {
  const ctx = document.getElementById("weeklyChart").getContext("2d");
  if (window.myChart) window.myChart.destroy(); // Destroy old chart to prevent stacking

  // Logic: Last 7 days
  const labels = [];
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    data.push(history[dateStr] ? history[dateStr].length : 0);
  }

  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: 'Quests Completed',
        data,
        backgroundColor: '#00f3ff',
        borderRadius: 5
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0' } },
        x: { grid: { display: false }, ticks: { color: '#a0a0a0' } }
      }
    }
  });
}


// --- Settings & Data Logic ---
function exportData() {
  const data = { habits, coins, history, reflections, userStats };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `HabitHero_Level${userStats.lvl}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  AudioCtrl.playSuccess();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // Validate basic structure
      if (data.habits && data.userStats) {
        habits = data.habits;
        coins = data.coins || 0;
        history = data.history || {};
        reflections = data.reflections || {};
        userStats = data.userStats;
        save();
        showToast("Save loaded successfully! Welcome back, Hero.", 'success');
        setTimeout(() => location.reload(), 1000);
      } else {
        throw new Error("Invalid save file");
      }
    } catch (err) {
      showToast("Error loading save: " + err.message, 'error');
      AudioCtrl.playError();
    }
  };
  reader.readAsText(file);
}

function resetData() {
  if (confirm("WARNING: This will wipe all progress. Are you sure?")) {
    localStorage.clear();
    location.reload();
  }
}

// UI Bindings for Data Capsule
document.getElementById('export-capsule').onclick = exportData;
document.getElementById('import-trigger').onclick = () => document.getElementById('import-input').click();
document.getElementById('import-input').onchange = importData;

// Settings Bindings
document.getElementById('sound-toggle').onchange = (e) => {
  AudioCtrl.toggleSound(e.target.checked);
  AudioCtrl.playClick();
};

document.getElementById('audio-pack-select').onchange = (e) => {
  AudioCtrl.setPack(e.target.value);
  AudioCtrl.playSuccess(); // Preview
};

document.getElementById('global-theme-select').onchange = (e) => {
  const theme = e.target.value;
  document.body.className = '';
  if (theme === 'space') {
    document.body.style.background = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
  } else if (theme === 'ocean') {
    document.body.style.background = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
  } else if (theme === 'neon') {
    document.body.style.background = 'linear-gradient(135deg, #1c0128, #340335, #350130)';
  } else if (theme === 'gold') {
    document.body.style.background = 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)'; // Gold gradient
    document.body.className = 'gold-theme'; // For extra CSS styling
  }
  AudioCtrl.playClick();
};

// --- Init ---
(function init() {
  const theme = localStorage.getItem("theme");
  if (theme === 'ocean') document.body.style.background = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';

  document.getElementById("coin-counter").textContent = coins;
  renderStatsBar();
  renderHabits();
  renderCalendar();

  // Filter buttons logic
  document.querySelectorAll(".filter-btn").forEach(btn => btn.onclick = () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    renderHabits();
  });

  // Scroll Animation Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card-section').forEach(section => {
    observer.observe(section);
  });

  // Load Settings
  const savedSettings = JSON.parse(localStorage.getItem("settings"));

  updateThemeOptions(); // Init themes based on inventory

  if (savedSettings) {
    if (savedSettings.theme) {
      // Check if we still own it/it exists in options
      const options = Array.from(document.getElementById('global-theme-select').options).map(o => o.value);
      if (options.includes(savedSettings.theme)) {
        document.getElementById('global-theme-select').value = savedSettings.theme;
        document.getElementById('global-theme-select').dispatchEvent(new Event('change'));
      }
    }
    if (savedSettings.audioPack) {
      document.getElementById('audio-pack-select').value = savedSettings.audioPack;
      AudioCtrl.setPack(savedSettings.audioPack);
    }
    if (savedSettings.sound !== undefined) {
      document.getElementById('sound-toggle').checked = savedSettings.sound;
      AudioCtrl.toggleSound(savedSettings.sound);
    }
  }

  renderStore(); // Init Store
  renderBadges(); // Init Badges
})();