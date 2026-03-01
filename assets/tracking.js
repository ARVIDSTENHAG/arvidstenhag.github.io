/**
 * TRACKING HELPER - Core Verification Engine
 */

window.trackEvent = function(name, params = {}) {
    const eventData = {
        event: name,
        timestamp: new Date().toISOString(),
        page_path: window.location.pathname,
        ...params
    };

    // 1. Push to GTM dataLayer
    if (window.dataLayer) {
        window.dataLayer.push(eventData);
    } else {
        console.warn('dataLayer missing - Event logged locally only:', name);
    }

    // 2. Persist in localStorage for Proof/Audit (max 50)
    let eventLog = JSON.parse(localStorage.getItem('event_log') || '[]');
    eventLog.unshift(eventData);
    localStorage.setItem('event_log', JSON.stringify(eventLog.slice(0, 50)));

    // 3. Notify Growth Lab UI to update live
    window.dispatchEvent(new CustomEvent('tracking_updated', { detail: eventData }));
    
    console.log(`[Event Tracked]: ${name}`, params);
};

// Global Outbound Link Tracking
document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.hostname && link.hostname !== window.location.hostname) {
        window.trackEvent('outbound_link_click', {
            link_url: link.href,
            link_text: link.innerText.trim()
        });
    }
});
