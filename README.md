# Readcraft — README Generator

> Paste a GitHub link. Get a perfect README. In seconds.

![Version](https://img.shields.io/badge/version-1.0.0-6ee7b7?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-6ee7b7?style=flat-square)
![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-6ee7b7?style=flat-square)
![No API Key](https://img.shields.io/badge/API%20key-not%20required-6ee7b7?style=flat-square)

---

## 📖 About

Readcraft is a free browser-based README generator built for developers who hate writing documentation.

Paste your public GitHub repo URL and Readcraft automatically fetches your project name, description, tech stack, languages, license, and features — then generates a clean professional `README.md` in under a second. No sign up. No API key. No setup. Works completely offline.

---

## ✨ Features

- 🔗 **GitHub Auto-Fill** — paste any public GitHub URL and the form fills itself automatically
- ⚡ **Instant generation** — README ready in under 1 second, no API calls
- 🎨 **Smart badge detection** — auto-generates shields.io badges for 30+ tech stacks
- 📊 **Live repo stats** — pulls stars, forks, and watchers directly from GitHub
- 📋 **12 sections** — Badges, Demo, Installation, Usage, API Docs, Configuration, Contributing, License, Roadmap, FAQ, Credits, Changelog
- 🎭 **4 writing tones** — Professional, Friendly, Minimal, Fun
- 👁 **Live Preview** — switch between raw Markdown and rendered preview
- 📋 **One-click Copy** — copy raw Markdown instantly
- 💾 **Download as .md** — save the file directly to your machine
- ✨ **Improve with AI** — generates a ready-to-paste prompt for ChatGPT or Claude to polish it further
- ⌨️ **Keyboard shortcut** — press `Ctrl+Enter` to generate instantly
- 📱 **Fully responsive** — works on mobile and desktop
- 🔒 **100% private** — nothing sent to any server, ever

---

## 🕹 How to Use

### Option 1 — GitHub Auto-Fill (Recommended)
1. Open the app in your browser
2. Paste any public GitHub repo URL
https://github.com/username/repo-name

3. Click **Fetch Repo →**
4. Everything fills in automatically
5. Click **Generate README**
6. Click **Copy** or **Download .md**
7. Paste into your GitHub repo ✅

### Option 2 — Fill Manually

1. Open the app
2. Fill in your Project Name and Description
3. Add your tech stack, features, and install steps
4. Choose your sections and tone
5. Click **Generate README** or press `Ctrl+Enter`
6. Copy or download the result

---

## 🔘 Buttons Explained

| Button | What it does |
|---|---|
| **Fetch Repo →** | Reads your GitHub repo and fills the form automatically |
| **Generate README** | Builds your full README instantly |
| **Markdown** | Shows the raw Markdown code |
| **Preview** | Shows how it looks when rendered on GitHub |
| **Copy** | Copies the README to your clipboard |
| **Download .md** | Saves it as a file on your computer |
| **✨ Improve with AI** | Generates a prompt to paste into ChatGPT or Claude for free |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Generate README instantly |
| `Escape` | Close the AI modal |

---

## 📁 Project Structure
readcraft/
├── index.html    ← app layout and structure
├── style.css     ← dark theme and all styling
├── app.js        ← GitHub fetcher, template engine, markdown parser
└── README.md     ← this file
---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| HTML | App structure and layout |
| CSS | Dark theme, animations, responsive design |
| Vanilla JavaScript | GitHub API, template engine, badge generator, markdown parser |

**Zero dependencies. Zero frameworks. Zero build tools. Zero APIs.**

The entire app is 3 files. That's it.

---

## 🔧 How It Works

**GitHub Auto-Fill**
When you paste a repo URL, Readcraft calls three free GitHub public API endpoints simultaneously — repo info, languages, and file contents. It extracts the name, description, topics, languages, and license. It also detects files like `Dockerfile`, `package.json`, and test folders to auto-generate relevant features and install commands.

**Template Engine**
The smart template engine reads all your inputs and builds each README section using intelligent templates filled with your actual data — not generic placeholder text. It detects your tech stack and generates the correct install commands, usage examples, and shields.io badges automatically.

**Improve with AI**
After generating, the Improve with AI button assembles your full README and project context into a perfectly crafted prompt. Paste it into ChatGPT or Claude for free and get a polished version back in seconds.

---

## ✅ Pros and Cons

**Pros**
- Zero setup — open in browser and go
- Works 100% offline after first load
- Free forever — no API cost, no subscriptions
- Privacy friendly — nothing ever leaves your browser
- Generates in under 1 second

**Cons**
- Only works with public GitHub repos
- Output may need minor tweaks for very unique projects
- No saved history — download before closing the tab

---

## 🗺️ Roadmap

- [ ] Support private repos with GitHub personal access token
- [ ] Save README history to local storage
- [ ] Push README directly to GitHub repo
- [ ] Template presets for CLI tools, REST APIs, npm packages
- [ ] Export as PDF

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Author

Built by [your-username](https://github.com/your-username)

---

> ⭐ If Readcraft saved you time, drop a star. It helps more developers find it!

1. Open the app in your browser
2. Paste any public GitHub repo URL
