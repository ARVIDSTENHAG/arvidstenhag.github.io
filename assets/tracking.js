/**
 * ARCHITECTURE: Tracking & System Monitoring
 * Exposed via window.trackEvent
 */

window.trackEvent = function(name, params = {}) {
    const eventData = {
        event: name,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        ...params
    };

    // Push to GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);

    // Persist for Audit (Max 50)
    let log = JSON.parse(localStorage.getItem('sys_audit_log') || '[]');
    log.unshift(eventData);
    localStorage.setItem('sys_audit_log', JSON.stringify(log.slice(0, 50)));

    // Update Debug UI if active
    if (window.showDebugPanel) window.showDebugPanel();
    
    console.log(`[System.Track] ${name}`, params);
};

// Internal Debug Mode (?debug=1)
(function() {
    if (new URLSearchParams(window.location.search).get('debug') === '1') {
        const panel = document.createElement('div');
        panel.id = 'debug-runtime-panel';
        panel.style.cssText = 'position:fixed; bottom:0; right:0; width:300px; height:200px; background:rgba(0,0,0,0.9); color:#0f0; font-family:monospace; font-size:10px; padding:10px; z-index:9999; overflow-y:auto; border-top:1px solid #333; pointer-events:auto;';
        panel.innerHTML = `
            <div style="border-bottom:1px solid #333; padding-bottom:5px; margin-bottom:5px; display:flex; justify-content:space-between;">
                <span>RUNTIME_DEBUG: ACTIVE</span>
                <span onclick="this.parentElement.parentElement.remove()" style="cursor:pointer;">[X]</span>
            </div>
            <div id="debug-log-content"></div>
        `;
        document.body.appendChild(panel);

        window.showDebugPanel = function() {
            const content = document.getElementById('debug-log-content');
            if (!content) return;
            const log = JSON.parse(localStorage.getItem('sys_audit_log') || '[]');
            content.innerHTML = log.map(e => `<div>[${e.timestamp.split('T')[1].split('.')[0]}] ${e.event}</div>`).join('');
        };
        window.showDebugPanel();

        window.onerror = function(msg, url, line) {
            window.trackEvent('js_error', { msg, line });
        };
    }
})();
