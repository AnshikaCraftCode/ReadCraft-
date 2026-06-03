// Readcraft — app.js

let generatedMarkdown = '';

function val(id) { return document.getElementById(id).value.trim(); }
function getSections() { return Array.from(document.querySelectorAll('input[name="sec"]:checked')).map(c => c.value); }
function lines(text) { return text.split('\n').map(l => l.trim()).filter(Boolean); }
function slugify(text) { return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''); }

// ── GITHUB AUTO-FILL ─────────────────────────

async function fetchFromGitHub() {
  const input = val('githubUrl');
  if (!input) { showToast('⚠ Please enter a GitHub repo URL'); return; }

  let owner, repo;
  try {
    const cleaned = input.replace('https://github.com/', '').replace('http://github.com/', '').replace(/\/$/, '').split('/');
    owner = cleaned[0];
    repo  = cleaned[1];
    if (!owner || !repo) throw new Error();
  } catch { showToast('⚠ Invalid URL — use https://github.com/username/repo'); return; }

  const btn = document.getElementById('fetchBtn');
  btn.textContent = 'Fetching...';
  btn.disabled = true;

  try {
    const [repoRes, langsRes, contentsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`),
      fetch(`https://api.github.com/repos/${owner}/${repo}/languages`),
      fetch(`https://api.github.com/repos/${owner}/${repo}/contents`),
    ]);

    if (!repoRes.ok) {
      if (repoRes.status === 404) throw new Error('Repo not found — make sure it is public');
      if (repoRes.status === 403) throw new Error('GitHub rate limit hit — wait a minute and try again');
      throw new Error(`GitHub error ${repoRes.status}`);
    }

    const repoData  = await repoRes.json();
    const langsData = langsRes.ok ? await langsRes.json() : {};
    const contents  = contentsRes.ok ? await contentsRes.json() : [];

    setField('projName', repoData.name || '');
    setField('projDesc', repoData.description || '');
    setField('ghUser', owner);
    setField('repoName', repo);

    const topics    = repoData.topics || [];
    const languages = Object.keys(langsData);
    const techStack = [...new Set([...languages, ...topics])].slice(0, 8).join(', ');
    setField('techStack', techStack);

    if (repoData.license?.spdx_id) {
      const licenseSelect = document.getElementById('license');
      const options = Array.from(licenseSelect.options).map(o => o.value);
      const match = options.find(o => o === repoData.license.spdx_id || repoData.license.spdx_id.includes(o));
      if (match) licenseSelect.value = match;
    }

    const hasPackageJson = Array.isArray(contents) && contents.some(f => f.name === 'package.json');
    const hasDockerfile  = Array.isArray(contents) && contents.some(f => f.name === 'Dockerfile');
    const hasTests       = Array.isArray(contents) && contents.some(f => ['test','tests','__tests__','spec'].includes(f.name));
    const hasDocs        = Array.isArray(contents) && contents.some(f => ['docs','documentation'].includes(f.name?.toLowerCase()));

    const autoFeatures = [];
    if (hasDockerfile) autoFeatures.push('Docker support');
    if (hasTests)      autoFeatures.push('Test coverage included');
    if (hasDocs)       autoFeatures.push('Detailed documentation');
    if (repoData.has_wiki) autoFeatures.push('Wiki available');
    if (languages.length > 1) autoFeatures.push(`Multi-language codebase (${languages.join(', ')})`);
    if (topics.length) autoFeatures.push(...topics.slice(0, 3).map(t => t.replace(/-/g,' ')));
    if (autoFeatures.length > 0) setField('features', autoFeatures.slice(0, 6).join('\n'));

    const techLower = techStack.toLowerCase();
    let installSteps = '';
    if (techLower.includes('python') || techLower.includes('django') || techLower.includes('flask') || techLower.includes('fastapi')) installSteps = 'pip install -r requirements.txt';
    else if (techLower.includes('rust'))   installSteps = 'cargo build';
    else if (techLower.includes('go'))     installSteps = 'go mod download';
    else if (hasPackageJson)               installSteps = 'npm install';
    if (installSteps) setField('installSteps', installSteps);

    let usageExample = '';
    if (techLower.includes('python'))    usageExample = 'python main.py';
    else if (techLower.includes('rust')) usageExample = 'cargo run';
    else if (techLower.includes('go'))   usageExample = 'go run main.go';
    else if (hasPackageJson)             usageExample = 'npm start\n# or for development\nnpm run dev';
    if (usageExample) setField('usageExample', usageExample);

    showRepoStats(repoData);
    showToast(`✅ Loaded ${owner}/${repo} successfully!`);

  } catch (err) {
    showToast(`⚠ ${err.message}`);
  } finally {
    btn.textContent = 'Fetch Repo →';
    btn.disabled = false;
  }
}

function setField(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.value = value;
}

function showRepoStats(data) {
  const stats = document.getElementById('repoStats');
  if (!stats) return;
  stats.innerHTML = `
    <div class="stat"><span>⭐</span> ${data.stargazers_count.toLocaleString()} stars</div>
    <div class="stat"><span>🍴</span> ${data.forks_count.toLocaleString()} forks</div>
    <div class="stat"><span>👁</span> ${data.watchers_count.toLocaleString()} watchers</div>
    <div class="stat"><span>🔤</span> ${data.language || 'N/A'}</div>
  `;
  stats.style.display = 'flex';
}

// ── BADGE GENERATOR ──────────────────────────

function getBadges(tech, gh, repo, license) {
  const badges = [];
  const t = tech.toLowerCase();

  if (license) badges.push(`[![License: ${license}](https://img.shields.io/badge/License-${encodeURIComponent(license)}-6ee7b7.svg?style=flat-square)](https://opensource.org/licenses/${license})`);

  if (gh && repo) {
    badges.push(`[![GitHub stars](https://img.shields.io/github/stars/${gh}/${repo}?style=flat-square)](https://github.com/${gh}/${repo}/stargazers)`);
    badges.push(`[![GitHub forks](https://img.shields.io/github/forks/${gh}/${repo}?style=flat-square)](https://github.com/${gh}/${repo}/network)`);
    badges.push(`[![GitHub issues](https://img.shields.io/github/issues/${gh}/${repo}?style=flat-square)](https://github.com/${gh}/${repo}/issues)`);
  }

  const techBadges = {
    react:      '[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org)',
    next:       '[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)',
    vue:        '[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=flat-square&logo=vue.js&logoColor=4FC08D)](https://vuejs.org)',
    angular:    '[![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io)',
    svelte:     '[![Svelte](https://img.shields.io/badge/Svelte-4A4A55?style=flat-square&logo=svelte&logoColor=FF3E00)](https://svelte.dev)',
    node:       '[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)',
    express:    '[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)',
    python:     '[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)',
    django:     '[![Django](https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white)](https://djangoproject.com)',
    flask:      '[![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)',
    fastapi:    '[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)',
    typescript: '[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)',
    javascript: '[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://javascript.com)',
    tailwind:   '[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)',
    postgres:   '[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)',
    mysql:      '[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)',
    mongodb:    '[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)',
    redis:      '[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)',
    docker:     '[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat-square&logo=docker&logoColor=white)](https://docker.com)',
    kubernetes: '[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io)',
    aws:        '[![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com)',
    firebase:   '[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)',
    graphql:    '[![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=flat-square&logo=graphql&logoColor=white)](https://graphql.org)',
    rust:       '[![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)](https://rust-lang.org)',
    go:         '[![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)](https://golang.org)',
    java:       '[![Java](https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=java&logoColor=white)](https://java.com)',
    kotlin:     '[![Kotlin](https://img.shields.io/badge/Kotlin-0095D5?style=flat-square&logo=kotlin&logoColor=white)](https://kotlinlang.org)',
    swift:      '[![Swift](https://img.shields.io/badge/Swift-FA7343?style=flat-square&logo=swift&logoColor=white)](https://swift.org)',
    php:        '[![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white)](https://php.net)',
    laravel:    '[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)',
    vite:       '[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)',
    prisma:     '[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white)](https://prisma.io)',
    supabase:   '[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)',
  };

  for (const [key, badge] of Object.entries(techBadges)) {
    if (t.includes(key)) badges.push(badge);
  }

  return badges.join('\n');
}

// ── TONE HELPERS ─────────────────────────────

function toneVal() { return val('tone'); }

function intro(name, desc) {
  const t = toneVal();
  if (t === 'fun') return `> 🚀 ${desc} — let's gooo!\n`;
  if (t === 'friendly') return `> ${desc}. Built with love for developers who hate boilerplate.\n`;
  if (t === 'minimal') return `> ${desc}\n`;
  return `> ${desc}\n`;
}

function contribLine() {
  const t = toneVal();
  if (t === 'fun') return "Contributions are super welcome! Let's build something awesome together. 🎉";
  if (t === 'friendly') return 'We love contributions! Every bug fix, feature, or typo correction is appreciated.';
  if (t === 'minimal') return 'Contributions welcome.';
  return 'Contributions are welcome and greatly appreciated.';
}

function closingLine(name) {
  const t = toneVal();
  if (t === 'fun') return `\n---\n\n⭐ If **${name}** saved you time, drop a star! It means the world. 🌍`;
  if (t === 'friendly') return `\n---\n\n> Made with ❤️ — if this helped you, a ⭐ would make my day!`;
  if (t === 'minimal') return '';
  return `\n---\n\n> If you find **${name}** useful, consider giving it a ⭐ on GitHub.`;
}

// ── SECTION BUILDERS ─────────────────────────

function buildBadges(cfg) {
  const b = getBadges(cfg.tech, cfg.gh, cfg.repo, cfg.license);
  return b ? `${b}\n\n` : '';
}

function buildDemo(cfg) {
  return `## 📸 Demo\n\n![${cfg.name} Demo](./assets/demo.png)\n\n> Replace with your actual screenshot or GIF.\n\n`;
}

function buildInstall(cfg) {
  const steps = lines(cfg.installSteps);
  let cloneBlock = '';
  if (cfg.gh && cfg.repo) cloneBlock = `\`\`\`bash\ngit clone https://github.com/${cfg.gh}/${cfg.repo}.git\ncd ${cfg.repo}\n\`\`\`\n\n`;
  const tech = cfg.tech.toLowerCase();
  let installBlock = '';
  if (steps.length > 0) installBlock = `\`\`\`bash\n${steps.join('\n')}\n\`\`\`\n\n`;
  else if (tech.includes('python') || tech.includes('django') || tech.includes('flask') || tech.includes('fastapi')) installBlock = `\`\`\`bash\npip install -r requirements.txt\n\`\`\`\n\n`;
  else if (tech.includes('go'))   installBlock = `\`\`\`bash\ngo mod download\n\`\`\`\n\n`;
  else if (tech.includes('rust')) installBlock = `\`\`\`bash\ncargo build\n\`\`\`\n\n`;
  else                            installBlock = `\`\`\`bash\nnpm install\n\`\`\`\n\n`;
  return `## 🚀 Installation\n\n### Prerequisites\n\n- [Git](https://git-scm.com/)\n- [Node.js](https://nodejs.org/) v16+\n\n### Steps\n\n**1. Clone the repository**\n\n${cloneBlock}**2. Install dependencies**\n\n${installBlock}**3. Start the application**\n\n\`\`\`bash\nnpm run dev\n\`\`\`\n\n`;
}

function buildUsage(cfg) {
  const example = cfg.usageExample;
  const tech = cfg.tech.toLowerCase();
  let codeBlock = '';
  if (example)                     codeBlock = `\`\`\`bash\n${example}\n\`\`\`\n`;
  else if (tech.includes('python'))codeBlock = `\`\`\`python\npython main.py\n\`\`\`\n`;
  else if (tech.includes('go'))    codeBlock = `\`\`\`bash\ngo run main.go\n\`\`\`\n`;
  else if (tech.includes('rust'))  codeBlock = `\`\`\`bash\ncargo run\n\`\`\`\n`;
  else                             codeBlock = `\`\`\`bash\nnpm start\n\`\`\`\n`;
  return `## 💡 Usage\n\n${codeBlock}\nFor more examples, check the [documentation](#).\n\n`;
}

function buildAPI(cfg) {
  return `## 📡 API Reference\n\n### Base URL\n\n\`\`\`\nhttps://api.${slugify(cfg.name)}.com/v1\n\`\`\`\n\n### Endpoints\n\n| Method | Endpoint | Description |\n|--------|----------|-------------|\n| \`GET\` | \`/items\` | Get all items |\n| \`GET\` | \`/items/:id\` | Get item by ID |\n| \`POST\` | \`/items\` | Create new item |\n| \`PUT\` | \`/items/:id\` | Update item |\n| \`DELETE\` | \`/items/:id\` | Delete item |\n\n### Example\n\n\`\`\`bash\ncurl -X GET https://api.${slugify(cfg.name)}.com/v1/items \\\n  -H "Authorization: Bearer YOUR_TOKEN"\n\`\`\`\n\n`;
}

function buildConfig(cfg) {
  return `## ⚙️ Configuration\n\n\`\`\`bash\ncp .env.example .env\n\`\`\`\n\n\`\`\`env\nNODE_ENV=development\nPORT=3000\nDATABASE_URL=your_database_url\nJWT_SECRET=your_jwt_secret\n\`\`\`\n\n| Variable | Description | Required |\n|----------|-------------|----------|\n| \`PORT\` | Server port | No |\n| \`DATABASE_URL\` | DB connection | Yes |\n| \`JWT_SECRET\` | JWT key | Yes |\n\n`;
}

function buildContributing(cfg) {
  return `## 🤝 Contributing\n\n${contribLine()}\n\n1. Fork the repo\n2. Create your branch: \`git checkout -b feature/amazing-feature\`\n3. Commit: \`git commit -m "feat: add amazing feature"\`\n4. Push: \`git push origin feature/amazing-feature\`\n5. Open a Pull Request\n\n`;
}

function buildLicense(cfg) {
  return `## 📄 License\n\nThis project is licensed under the **${cfg.license} License** — see the [LICENSE](./LICENSE) file for details.\n\n`;
}

function buildRoadmap(cfg) {
  const featureList = lines(cfg.features);
  const doneItems = featureList.slice(0,3).map(f => `- [x] ${f}`).join('\n') || '- [x] Initial release';
  const todoItems = ['Add comprehensive tests','Improve performance','Add i18n support','Write full documentation'].map(f => `- [ ] ${f}`).join('\n');
  return `## 🗺️ Roadmap\n\n### Done ✅\n\n${doneItems}\n\n### Coming Soon 🔜\n\n${todoItems}\n\n`;
}

function buildFAQ(cfg) {
  return `## ❓ FAQ\n\n**Q: Is ${cfg.name} free?**\nA: Yes, completely free under the ${cfg.license} license.\n\n**Q: How do I report a bug?**\nA: Open an [issue on GitHub](https://github.com/${cfg.gh||'username'}/${cfg.repo||slugify(cfg.name)}/issues).\n\n**Q: Can I use it commercially?**\nA: Yes, the ${cfg.license} license allows it.\n\n`;
}

function buildCredits(cfg) {
  return `## 🙏 Credits\n\nBuilt by [${cfg.gh||'your-username'}](https://github.com/${cfg.gh||'your-username'}).\n\nThanks to all [contributors](https://github.com/${cfg.gh||'username'}/${cfg.repo||slugify(cfg.name)}/graphs/contributors).\n\n`;
}

function buildChangelog(cfg) {
  return `## 📝 Changelog\n\n### [1.0.0] — ${new Date().toISOString().split('T')[0]}\n\n#### Added\n- Initial release\n- Core functionality\n- Documentation\n\n`;
}

// ── MAIN GENERATE ─────────────────────────────

function generate() {
  const name = val('projName');
  const desc = val('projDesc');
  if (!name || !desc) { showToast('⚠ Please fill in Project Name and Description'); return; }

  const cfg = {
    name, desc,
    tech:         val('techStack'),
    features:     val('features'),
    installSteps: val('installSteps'),
    usageExample: val('usageExample'),
    gh:           val('ghUser'),
    repo:         val('repoName') || slugify(name),
    license:      val('license'),
  };

  const sections = getSections();
  let md = '';

  md += `# ${cfg.name}\n\n`;
  md += intro(cfg.name, cfg.desc) + '\n';

  if (sections.includes('badges')) { const b = buildBadges(cfg); if (b) md += b; }

  md += `## 📋 Table of Contents\n\n`;
  const tocMap = { demo:'- [Demo](#-demo)', install:'- [Installation](#-installation)', usage:'- [Usage](#-usage)', api:'- [API Reference](#-api-reference)', config:'- [Configuration](#️-configuration)', contributing:'- [Contributing](#-contributing)', license:'- [License](#-license)', roadmap:'- [Roadmap](#️-roadmap)', faq:'- [FAQ](#-faq)', credits:'- [Credits](#-credits)', changelog:'- [Changelog](#-changelog)' };
  for (const sec of sections) { if (tocMap[sec]) md += tocMap[sec] + '\n'; }
  md += '\n';

  md += `## 📖 About\n\n${cfg.desc}`;
  if (cfg.tech) md += ` Built with **${cfg.tech}**.`;
  md += '\n\n';

  const featureList = lines(cfg.features);
  if (featureList.length > 0) { md += `## ✨ Features\n\n`; featureList.forEach(f => { md += `- ✅ ${f}\n`; }); md += '\n'; }

  const builders = { demo:()=>buildDemo(cfg), install:()=>buildInstall(cfg), usage:()=>buildUsage(cfg), api:()=>buildAPI(cfg), config:()=>buildConfig(cfg), contributing:()=>buildContributing(cfg), license:()=>buildLicense(cfg), roadmap:()=>buildRoadmap(cfg), faq:()=>buildFAQ(cfg), credits:()=>buildCredits(cfg), changelog:()=>buildChangelog(cfg) };
  for (const sec of sections) { if (builders[sec]) md += builders[sec](); }

  md += closingLine(cfg.name);
  generatedMarkdown = md;

  document.getElementById('placeholder').style.display = 'none';
  const raw = document.getElementById('rawOutput');
  raw.style.display = 'block';
  raw.textContent = md;
  document.getElementById('previewOutput').style.display = 'none';
  document.getElementById('rawBtn').classList.add('active');
  document.getElementById('prevBtn').classList.remove('active');
  document.getElementById('aiBtn').style.display = 'inline-flex';
  showToast('✅ README generated!');
}

// ── VIEW SWITCH ──────────────────────────────

function switchView(view) {
  const raw = document.getElementById('rawOutput');
  const preview = document.getElementById('previewOutput');
  if (view === 'raw') {
    raw.style.display = 'block'; preview.style.display = 'none';
    document.getElementById('rawBtn').classList.add('active');
    document.getElementById('prevBtn').classList.remove('active');
  } else {
    raw.style.display = 'none'; preview.style.display = 'block';
    document.getElementById('rawBtn').classList.remove('active');
    document.getElementById('prevBtn').classList.add('active');
    preview.innerHTML = markdownToHtml(generatedMarkdown);
  }
}

// ── MARKDOWN PARSER ──────────────────────────

function markdownToHtml(md) {
  let h = md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_,l,c) => `<pre><code>${c}</code></pre>`)
    .replace(/`([^`\n]+)`/g,'<code>$1</code>')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/^---+$/gm,'<hr/>')
    .replace(/^\- \[x\] (.+)$/gm,'<li>✅ $1</li>')
    .replace(/^\- \[ \] (.+)$/gm,'<li>⬜ $1</li>')
    .replace(/^\- (.+)$/gm,'<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li>$1</li>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img alt="$1" src="$2"/>')
    .replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g,'<a href="$3" target="_blank"><img alt="$1" src="$2" style="vertical-align:middle;margin:2px 3px"/></a>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>');
  h = h.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  h = h.replace(/(\|.+\|\n)+/g, (table) => {
    const rows = table.trim().split('\n');
    let html = '<table>';
    rows.forEach((row, i) => {
      if (row.match(/^\|[-\s|:]+\|$/)) return;
      const cells = row.split('|').slice(1,-1);
      const tag = i === 0 ? 'th' : 'td';
      html += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    });
    return html + '</table>';
  });
  h = '<p>' + h.replace(/\n\n(?!<[hupbhrt])/g,'\n</p>\n<p>') + '</p>';
  return h.replace(/<p>\s*<\/p>/g,'');
}

// ── AI IMPROVE ───────────────────────────────

function improveWithAI() {
  if (!generatedMarkdown) return;
  const prompt = `Please improve this README.md. Make the writing more compelling, improve descriptions, clean up code examples, and ensure it follows GitHub best practices. Keep the same structure and sections.\n\nHere is the README:\n\n---\n\n${generatedMarkdown}\n\n---\n\nReturn ONLY the improved README.md content, no commentary.`;
  document.getElementById('aiPrompt').textContent = prompt;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('copyPromptText').textContent = 'Copy Prompt';
}

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(document.getElementById('aiPrompt').textContent);
    document.getElementById('copyPromptText').textContent = '✓ Copied!';
    setTimeout(() => { document.getElementById('copyPromptText').textContent = 'Copy Prompt'; }, 2000);
  } catch { showToast('⚠ Select manually and copy'); }
}

// ── COPY & DOWNLOAD ──────────────────────────

async function copyOutput() {
  if (!generatedMarkdown) { showToast('⚠ Nothing to copy yet'); return; }
  try { await navigator.clipboard.writeText(generatedMarkdown); showToast('✅ Copied!'); }
  catch { showToast('⚠ Select manually and copy'); }
}

function downloadOutput() {
  if (!generatedMarkdown) { showToast('⚠ Nothing to download yet'); return; }
  const name = (val('projName') || 'README').toLowerCase().replace(/\s+/g,'-');
  const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}-README.md`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('✅ Downloaded!');
}

// ── TOAST ─────────────────────────────────────

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── KEYBOARD SHORTCUTS ───────────────────────
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate();
  if (e.key === 'Escape') closeModal();
});