/**
 * GROWTH LAB ENGINE - PERSISTENT STATE & VERIFICATION
 */

// --- CONFIGURATION ---
const API_BASE = 'https://strava-backend-n6zk.onrender.com'; 
const API_ENDPOINT = '/exchange'; 
// ---------------------

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Growth Lab] Initializing...");
    
    // UI Elements
    const elements = {
        verifyBtn: document.getElementById('verify-tracking'),
        apiBtn: document.getElementById('test-api-btn'),
        apiResult: document.getElementById('api-result'),
        msg: document.getElementById('growthMessages'),
        pluginLink: document.getElementById('plugin-repo-link'),
        // Letar efter whitepaper-länkar
        whitepaperLinks: document.querySelectorAll('a[href*="whitepaper"]')
    };

    // 1. STATE HELPERS
    const getFlag = (key) => localStorage.getItem(key) === 'true';
    const setFlag = (key) => localStorage.setItem(key, 'true');

    const updateUI = () => {
        const statuses = [
            { id: 'tracking', ok: getFlag('tracking_done') },
            { id: 'api', ok: getFlag('api_done') },
            { id: 'whitepaper', ok: getFlag('whitepaper_done') },
            { id: 'plugin', ok: getFlag('plugin_done') }
        ];

        statuses.forEach(s => {
            const el = document.querySelector(`[data-status="${s.id}"]`);
            if (el) {
                el.innerText = s.ok ? '✅' : '⚠️';
                if (s.ok) el.parentElement.style.color = '#fff';
            }
        });
        
        renderLocalLog();
    };

    // 2. ACTIONS
    
    // A) Verify Tracking
    if (elements.verifyBtn) {
        elements.verifyBtn.addEventListener('click', () => {
            window.trackEvent('tracking_verify', { source: 'growth-lab' });
            setFlag('tracking_done');
            const timestamp = new Date().toLocaleTimeString();
            if (elements.msg) elements.msg.innerHTML = `<span style="color:#0f0">> Sent tracking_verify at ${timestamp}</span>`;
            updateUI();
        });
    }

    // B) API Test
    if (elements.apiBtn) {
        elements.apiBtn.addEventListener('click', async () => {
            if (!API_BASE || API_BASE.includes('TODO')) {
                elements.apiResult.innerHTML = `<span style="color:#f00">> ERROR: Set API_BASE in growth-lab.js</span>`;
                return;
            }

            elements.apiResult.innerText = `> Connecting to ${API_BASE}...`;
            
            try {
                const response = await fetch(`${API_BASE}${API_ENDPOINT}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ test: true })
                });
                
                const data = await response.json().catch(() => ({}));
                const timestamp = new Date().toLocaleTimeString();

                elements.apiResult.innerHTML = `
                    <div style="color:#0f0">> STATUS: ${response.status} ${response.ok ? 'OK' : 'FAIL'}</div>
                    <div style="color:#888">> RESPONSE: ${JSON.stringify(data).substring(0, 200)}...</div>
                    <div style="color:#444">> TIME: ${timestamp}</div>
                `;

                if (response.ok) {
                    setFlag('api_done');
                    window.trackEvent('api_fetch_success', { status: response.status });
                }
            } catch (err) {
                elements.apiResult.innerHTML = `<span style="color:#f00">> FETCH_ERROR: ${err.message}</span>`;
                window.trackEvent('api_fetch_error', { msg: err.message });
            }
            updateUI();
        });
    }

    // C) Whitepaper tracking
    elements.whitepaperLinks.forEach(link => {
        link.addEventListener('click', () => {
            setFlag('whitepaper_done');
            window.trackEvent('whitepaper_open', { source: 'growth-lab' });
            updateUI();
        });
    });

    // D) Plugin tracking
    if (elements.pluginLink) {
        elements.pluginLink.addEventListener('click', () => {
            setFlag('plugin_done');
            window.trackEvent('plugin_repo_click', { source: 'growth-lab' });
            updateUI();
        });
    }

    // 3. LOGGING (Visual Proof for teacher)
    function renderLocalLog() {
        const log = JSON.parse(localStorage.getItem('event_log') || '[]');
        const body = document.getElementById('event-log-body');
        if (body) {
            body.innerHTML = log.slice(0, 10).map(ev => `
                <tr>
                    <td class="mono">${ev.timestamp ? ev.timestamp.split('T')[1].split('.')[0] : '-'}</td>
                    <td><strong>${ev.event}</strong></td>
                    <td class="mono">${ev.page_path || 'growth-lab'}</td>
                </tr>
            `).join('');
        }
    }

    // Initial Load
    updateUI();
});
