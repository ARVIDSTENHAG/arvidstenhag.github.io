/**
 * TRACKING HELPER: Handles dataLayer pushes and local event logging
 */
window.trackEvent = (name, params = {}) => {
    const eventData = {
        event: name,
        timestamp: new Date().toISOString(),
        page_path: window.location.pathname,
        ...params
    };

    // 1. Push to Google Tag Manager
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);

    // 2. Save in localStorage for Growth Lab audit (max 50)
    let log = JSON.parse(localStorage.getItem('event_log') || '[]');
    log.unshift(eventData);
    localStorage.setItem('event_log', JSON.stringify(log.slice(0, 50)));

    // 3. Trigger global event for UI updates
    window.dispatchEvent(new CustomEvent('tracking_updated', { detail: eventData }));
    
    console.log(`[Track] ${name}:`, params);
};
