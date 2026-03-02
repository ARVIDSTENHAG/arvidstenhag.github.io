/**
 * STARTUP MVP ENGINE
 */

// 1. CONFIG
const config = window.SITE_CONFIG || { WHITEPAPER_URL: '/assets/whitepaper.pdf', SHARE_URL: window.location.href };

// 2. FUNNEL LOGIC (State Management)
const funnelState = {
    users: parseInt(localStorage.getItem('f_users') || 0),
    api: parseInt(localStorage.getItem('f_api') || 0),
    leads: parseInt(localStorage.getItem('f_leads') || 0),
    shares: parseInt(localStorage.getItem('f_shares') || 0)
};

// Expose to window for external script access
window.updateFunnel = function(key) {
    funnelState[key]++;
    localStorage.setItem(`f_${key}`, funnelState[key]);
    renderFunnel();
};

function renderFunnel() {
    const u = document.getElementById('stat-users');
    const a = document.getElementById('stat-api');
    const l = document.getElementById('stat-leads');
    const s = document.getElementById('stat-shares');
    if(u) u.innerText = funnelState.users;
    if(a) a.innerText = funnelState.api;
    if(l) l.innerText = funnelState.leads;
    if(s) s.innerText = funnelState.shares;
}

// Tracking Wrapper
window.trackEvent = function(name, params = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 
        event: name, 
        timestamp: new Date().toISOString(), 
        ...params 
    });
    const list = document.getElementById('debug-list');
    if (list) {
        const li = document.createElement('li');
        li.innerText = name;
        list.prepend(li);
    }
    console.log(`[Growth Track]: ${name}`, params);
};

// 3. PERFORMANCE SCORE SYSTEM
function calculateScore(timeStr) {
    const parts = timeStr.split(':').map(Number);
    const totalMinutes = (parts[0] * 60) + parts[1];
    let score = Math.round(100 - ((totalMinutes - 180) / 1.2));
    return Math.max(5, Math.min(99, score));
}

function updateScoreUI(score, time) {
    const circle = document.getElementById('score-circle');
    const val = document.getElementById('score-value');
    const badge = document.getElementById('score-badge');
    const pct = document.getElementById('percentile-text');
    
    if(val) val.innerText = score;
    if(badge) badge.innerText = `Score: ${score}/100`;
    
    if(circle) {
        if (score > 80) circle.style.borderColor = "#10b981";
        else if (score > 60) circle.style.borderColor = "#f59e0b";
        else circle.style.borderColor = "#ef4444";
    }
    
    if(pct) pct.innerText = `You are faster than ${score + 2}% of analyzed runners.`;
}

// 4. SOCIAL PROOF: LEADERBOARD
function addToLeaderboard(score, time) {
    let board = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    board.push({ score, time, id: Date.now() });
    board.sort((a, b) => b.score - a.score);
    board = board.slice(0, 5);
    localStorage.setItem('leaderboard', JSON.stringify(board));
    renderLeaderboard(board);
}

function renderLeaderboard(board = null) {
    if (!board) board = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const list = document.getElementById('leaderboard-list');
    if(list) {
        list.innerHTML = board.map((item, idx) => `
            <li>
                <span>#${idx+1} Anonymous Athlete</span>
                <strong>${item.score} pts (${item.time})</strong>
            </li>
        `).join('');
    }
}

// 5. EVENT HANDLERS
document.getElementById('strava-connect')?.addEventListener('click', () => {
    window.updateFunnel('users');
    window.trackEvent('connect_click');
    
    setTimeout(() => {
        const time = "3:12:45";
        const score = calculateScore(time);
        
        const section = document.getElementById('strava-section');
        const res = document.getElementById('prediction-result');
        if(section) section.classList.remove('hidden');
        if(res) res.innerText = time;
        
        updateScoreUI(score, time);
        addToLeaderboard(score, time);
        window.updateFunnel('api');
        window.trackEvent('api_success', { score });
    }, 1500);
});

document.getElementById('signup-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    window.updateFunnel('leads');
    window.trackEvent('signup_submit');
    document.getElementById('lead-form-container')?.classList.add('hidden');
    document.getElementById('unlocked-container')?.classList.remove('hidden');
    const dl = document.getElementById('download-link');
    if(dl) dl.href = config.WHITEPAPER_URL;
});

document.getElementById('share-btn')?.addEventListener('click', () => {
    const time = document.getElementById('prediction-result')?.innerText || "3:12:45";
    const text = `I just got my marathon prediction (${time}) on Growth Lab. Beat me 👉 ${config.SHARE_URL}`;
    navigator.clipboard.writeText(text);
    window.updateFunnel('shares');
    window.trackEvent('share_click');
    alert("Result copied to clipboard!");
});

// Init
renderFunnel();
renderLeaderboard();
