/**
 * Growth Lab Logic
 */

const API_BASE = 'https://strava-backend-n6zk.onrender.com';
const REPO_URL = 'https://github.com/arvidstenhag/strava-runner-predictor';

document.addEventListener('DOMContentLoaded', () => {
    updateChecklist();
    renderEventLog();

    // Live update when tracking happens
    window.addEventListener('tracking_updated', () => {
        renderEventLog();
        updateChecklist();
    });

    // Manual Verify
    document.getElementById('verify-tracking').addEventListener('click', () => {
        window.trackEvent('tracking_test_verified', { status: 'success' });
        localStorage.setItem('tracking_verified', 'true');
        updateChecklist();
    });

    // API Test
    const apiBtn = document.getElementById('test-api-btn');
    const apiResult = document.getElementById('api-result');

    apiBtn.addEventListener('click', async () => {
        apiResult.innerText = '> Initializing fetch...';
        try {
            // Vi anropar backend (ping eller predict)
            const response = await fetch(`${API_BASE}/exchange`, { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ test: true }) 
            });
            const data = await response.json();
            
            apiResult.innerText = `> Status: ${response.status}
> Response: ${JSON.stringify(data).substring(0, 100)}...`;
            window.trackEvent('api_fetch_success', { status: response.status });
            localStorage.setItem('api_done', 'true');
        } catch (error) {
            apiResult.innerText = `> Error: ${error.message}
> Backend might be sleeping or CORS is strict.`;
            window.trackEvent('api_fetch_error', { error: error.message });
        }
        updateChecklist();
    });

    // Plugin Logic
    document.getElementById('plugin-repo-btn').addEventListener('click', () => {
        window.open(REPO_URL, '_blank');
        window.trackEvent('plugin_link_click', { url: REPO_URL });
        localStorage.setItem('plugin_done', 'true');
        updateChecklist();
    });

    // Modal
    const modal = document.getElementById('plugin-modal');
    document.getElementById('plugin-install-btn').onclick = () => modal.style.display = "block";
    document.getElementsByClassName('close')[0].onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

    // Proof Gen
    document.getElementById('gen-proof-btn').addEventListener('click', () => {
        const flags = ['lead_magnet_done', 'tracking_verified', 'api_done', 'whitepaper_done', 'plugin_done'];
        const results = flags.map(f => `${f.toUpperCase()}: ${localStorage.getItem(f) ? 'OK' : 'PENDING'}`);
        const text = `ARVID STENHAG - GROWTH LAB REPORT
--------------------------------
${results.join('
')}

BACKEND: ${API_BASE}
TIMESTAMP: ${new Date().toISOString()}`;
        document.getElementById('proof-text-area').value = text;
    });
});

function updateChecklist() {
    const listItems = document.querySelectorAll('#checklist li');
    listItems.forEach(li => {
        const flag = li.getAttribute('data-flag');
        if (localStorage.getItem(flag) === 'true') {
            li.querySelector('span').innerText = '✅';
            li.style.color = '#fff';
            li.style.fontWeight = 'bold';
        }
    });
}

function renderEventLog() {
    const log = JSON.parse(localStorage.getItem('event_log') || '[]');
    const body = document.getElementById('event-log-body');
    body.innerHTML = log.map(ev => `
        <tr>
            <td>${ev.timestamp.split('T')[1].split('.')[0]}</td>
            <td><strong>${ev.event}</strong></td>
            <td>${ev.page_path} ${ev.depth ? '(Scroll: '+ev.depth+'%)' : ''}</td>
        </tr>
    `).join('');
}
