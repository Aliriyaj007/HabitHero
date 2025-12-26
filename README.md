<p align="center">
  <img src="https://img.shields.io/badge/version-2.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/made%20with-vanilla%20JS-yellow?style=for-the-badge" alt="Vanilla JS">
</p>

# 🌟 HabitHero

**Turn your daily habits into epic quests. Gain XP, level up, and become legendary.**

A gamified habit tracker built with pure HTML, CSS, and JavaScript. No frameworks. No dependencies. Just discipline made fun.

---

## 🤔 Why This Exists

Most habit trackers are boring checkboxes that you ignore after a week.

**What people usually do:**
- Download yet another habit app
- Use it for 3 days
- Forget it exists
- Repeat the cycle

**Why existing solutions fail:**
- They treat habits as chores, not achievements
- No sense of progression or reward
- Too complex or too simplistic
- Require accounts, subscriptions, or constant internet

> **This tool exists because** building good habits should feel like playing a game, not filling out paperwork.

---

## ⚡ What It Does

- ✅ **Track habits as "Quests"** with categories (Work, Fitness, Health, Personal)
- ✅ **Earn XP & Level Up** with every completed habit
- ✅ **Build RPG-style stats** (STR, INT, VIT, CHA) based on habit types
- ✅ **Collect coins** and unlock themes, badges, and XP potions
- ✅ **Focus Mode** with a Pomodoro-style timer and breathing orb
- ✅ **Visual progress tracking** with weekly charts and calendar heatmap
- ✅ **Journal reflections** to capture learnings
- ✅ **Export/Import saves** as JSON — your data, your control
- ✅ **Multiple themes** (Deep Space, Ocean, Neon, Golden)
- ✅ **Sound packs** (Modern, Retro 8-bit, Zen)

**What it does NOT try to be:**
- A social platform
- A cloud-synced service requiring sign-up
- A bloated SaaS product with premium tiers

---

## 📊 Before / After

| Before HabitHero | After HabitHero |
|------------------|-----------------|
| ❌ "I should drink more water" → forgotten | ✅ "Complete hydration quest" → +20 XP, streak grows |
| ❌ Open a note, write a date, feel nothing | ✅ Confetti bursts, level-up modal, coins earned |
| ❌ No visible progress over weeks | ✅ Calendar heatmap shows your adventure log |
| ❌ Same boring interface every day | ✅ Unlock new themes by earning coins |
| ❌ Motivation fades after day 5 | ✅ Streak counters and RPG stats keep you engaged |

---

## 🎮 Sample Output

**Your RPG Stats Bar:**
```
╔══════════════════════════════════════════════════════════════╗
║  Level 7  │  STR: 12  │  INT: 8  │  VIT: 15  │  CHA: 6      ║
║  ████████████░░░░░░░░  XP: 340/500                           ║
╚══════════════════════════════════════════════════════════════╝
```

**Quest Card:**
```
┌─────────────────────────────────────┐
│  💪 Morning Workout                 │
│  Fitness • +XP (STR)                │
│  🔥 14 Day Streak                   │
│                                     │
│  [⚔️ Complete]  [✏️]  [🗑️]         │
└─────────────────────────────────────┘
```

**Rewards Store:**
```
🌊 Ocean Theme .......... 💎 200
🌌 Neon Theme ........... 💎 300
👑 Golden Theme ......... 💎 500
🧪 XP Potion (+50 XP) ... 💎 50
🏆 Hero Badge ........... 💎 100
```

---

## 📥 Installation

### Option 1: Live Demo (Recommended)

No installation needed. Just open:

🔗 **[https://aliriyaj007.github.io/HabitHero/](https://aliriyaj007.github.io/HabitHero/)**

---

### Option 2: Download & Run Locally

```bash
# Clone the repository
git clone https://github.com/Aliriyaj007/HabitHero.git

# Navigate to folder
cd HabitHero

# Open in browser (any of these work)
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

---

### Option 3: Direct Download

1. Go to [Releases](https://github.com/Aliriyaj007/HabitHero/releases)
2. Download the latest `.zip` file
3. Extract and open `index.html`

---

### Option 4: Using Live Server (VS Code)

```bash
# Clone the repo
git clone https://github.com/Aliriyaj007/HabitHero.git
cd HabitHero

# Install Live Server extension in VS Code, then:
# Right-click index.html → "Open with Live Server"
```

---

## 🚀 One-Command Usage

**Just open it.** That's it.

```
📁 HabitHero/
   └── index.html   ← Double-click this
```

**Quick Start:**
1. Click **➕ Add New Quest**
2. Name your habit, pick a category
3. Hit **⚔️ Complete** when done
4. Watch XP flow, streaks grow, and levels unlock

---

## ⚙️ Configuration

All data is stored locally in your browser via `localStorage`:

| Key | Description |
|-----|-------------|
| `habits` | Array of habit objects |
| `coins` | Current coin balance |
| `history` | Daily completion log |
| `userStats` | Level, XP, and RPG stats |
| `inventory` | Purchased themes and badges |
| `settings` | Theme, sound, audio pack preferences |

**Export your save:**  
Settings → 💾 Save Game → Downloads a JSON backup

**Import a save:**  
Settings → ⬆️ Load Game → Select your JSON file

---

## 🎯 Use Cases

- **Developers** building consistent coding habits
- **Students** gamifying study routines
- **Fitness enthusiasts** tracking workouts without apps that sell your data
- **Anyone** who wants habit tracking that's actually engaging
- **Minimalists** who prefer local-first, zero-dependency tools
- **Privacy-conscious users** who don't want cloud accounts for basic tracking

---

## 🗺️ Roadmap

**Current Features:**
- [x] Habit CRUD with categories (Work, Fitness, Health, Personal)
- [x] RPG stat system (STR, INT, VIT, CHA)
- [x] XP, leveling, and coins
- [x] Focus Mode (Pomodoro timer with breathing orb)
- [x] Weekly progress chart (Chart.js)
- [x] Calendar heatmap for monthly view
- [x] Rewards store (themes, badges, consumables)
- [x] Multiple global themes
- [x] Audio packs (Modern, Retro, Zen)
- [x] Toast notification system
- [x] Export/Import JSON saves
- [x] Confetti particle animations

**Planned Improvements:**
- [ ] PWA support (offline mode, installable)
- [ ] Weekly/Monthly habit goals
- [ ] Achievement system with unlockable milestones
- [ ] Custom habit icons
- [ ] Habit analytics (best day, longest streak, etc.)

**Nice-to-Have:**
- [ ] Optional cloud sync (encrypted, opt-in)
- [ ] Multiplayer challenges (leaderboards with friends)
- [ ] Mobile app wrapper (Capacitor/Electron)

---

## ⚠️ Limitations

- **Browser-only storage:** Clearing browser data wipes progress (export backups!)
- **No sync:** Each browser/device has separate data
- **No notifications:** Browser doesn't remind you — add your own system alarm
- **Single user:** Designed for personal use, not team tracking

---

## 🤝 Contributing

Contributions are welcome. Keep it clean.

**How to contribute:**
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally (just open `index.html`)
5. Submit a PR with a clear description

**Code style:**
- Vanilla JS — no frameworks
- Self-documenting code preferred
- Comments for non-obvious logic

**What we'll merge:**
- Bug fixes
- UX improvements
- Performance optimizations
- New themes/sound packs
- Accessibility enhancements

---

## 📄 License

MIT License — do what you want, just don't blame us.

See [LICENSE](LICENSE) for full text.

---

## 👤 Author

**Riyajul Ali**

| | |
|---|---|
| 🐙 GitHub | [@Aliriyaj007](https://github.com/Aliriyaj007) |
| 📧 Email | [aliriyaj007@protonmail.com](mailto:aliriyaj007@protonmail.com) |
| 💼 LinkedIn | [linkedin.com/in/riyajulali](https://linkedin.com/in/riyajulali) |

---

<p align="center">
  <i>Built to remove friction, not add features.</i>
</p>

<p align="center">
  ⭐ Star this repo if it helped you stay consistent.
</p>
