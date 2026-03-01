/**
 * GROWTH LAB: Verification and Flag Management
 */

document.addEventListener('DOMContentLoaded', () => {
    updateChecklist();

    // 1. "Verify Tracking" Button
    const verifyBtn = document.getElementById('verify-tracking');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            window.trackEvent('tracking_verify', { source: 'growth-lab' });
            localStorage.setItem('tracking_verified', 'true');
            
            // Show feedback in UI
            const output = document.getElementById('api-result');
            if (output) {
                output.innerHTML = `<span style="color:#0f0">> Event sent: tracking_verify (${new Date().toLocaleTimeString()})</span>`;
            }
            updateChecklist();
        });
    }

    // 2. "Run API Prediction Test" Button
    const apiBtn = document.getElementById('test-api-btn');
    const apiResult = document.getElementById('api-result');
    
    if (apiBtn && apiResult) {
        apiBtn.addEventListener('click', async () => {
            const config = window.SITE_CONFIG;
            
            if (!config || !config.API_BASE || config.API_BASE.includes('TODO')) {
                apiResult.innerHTML = `<span style="color:#ff0000">> ERROR: Set API_BASE in /assets/config.js</span>`;
                return;
            }

            apiResult.innerText = `> Fetching ${config.API_BASE}${config.API_ENDPOINT}...`;
            
            try {
                const response = await fetch(config.API_BASE + config.API_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ test: true })
                });
                
                const status = response.status;
                const data = await response.json().catch(() => ({ message: "No JSON" }));

                apiResult.innerHTML = `
                    <div style="color:#0f0">> Status: ${status}</div>
                    <div>> Body: ${JSON.stringify(data).substring(0, 500)}</div>
                    <div style="color:#888">> Time: ${new Date().toLocaleTimeString()}</div>
                `;

                if (status === 200) {
                    localStorage.setItem('api_done', 'true');
                    window.trackEvent('api_fetch_success', { status });
                    updateChecklist();
                }
            } catch (error) {
                apiResult.innerHTML = `<span style="color:#f00">> FETCH ERROR: ${error.message}</span>`;
                window.trackEvent('api_fetch_error', { message: error.message });
            }
        });
    }

    // 3. Listen for live tracking updates
    window.addEventListener('tracking_updated', updateChecklist);
});

function updateChecklist() {
    // Flags mapping: localStorage key -> data-flag attribute
    const flags = {
        'lead_magnet_done': 'lead_magnet_done',
        'tracking_verified': 'tracking_verified',
        'api_done': 'api_done',
        'whitepaper_done': 'whitepaper_done',
        'plugin_done': 'plugin_done'
    };
    
    Object.keys(flags).forEach(key => {
        const li = document.querySelector(`li[data-flag="${flags[key]}"]`);
        if (li && localStorage.getItem(key) === 'true') {
            const span = li.querySelector('span');
            if (span) span.innerText = '✅';
            li.style.color = '#fff'; // Highlight completed
        }
    });

    renderEventLog();
}

function renderEventLog() {
    const log = JSON.parse(localStorage.getItem('event_log') || '[]');
    const body = document.getElementById('event-log-body');
    if (body) {
        body.innerHTML = log.slice(0, 10).map(ev => `
            <tr>
                <td>${ev.timestamp.split('T')[1].split('.')[0]}</td>
                <td><strong>${ev.event}</strong></td>
                <td>${ev.page_path}</td>
            </tr>
        `).join('');
    }
}
