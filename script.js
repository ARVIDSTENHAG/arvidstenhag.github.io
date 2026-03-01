/**
 * SYSTEM RUNTIME (LOVE + POLESTAR STYLE)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Centralized Click Handler (Robust & Safe)
    document.addEventListener('click', (e) => {
        const target = e.target;

        // A. Handle Navigation & Anchors
        const anchor = target.closest('a[href^="#"]');
        if (anchor) {
            const id = anchor.getAttribute('href');
            if (id === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const targetElement = document.querySelector(id);
            if (targetElement) {
                e.preventDefault();
                const offset = 80; // Adjusted for sticky nav
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetElement.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                if (window.trackEvent) window.trackEvent('nav_scroll', { target: id });
            }
        }

        // B. Handle System Actions
        const actionEl = target.closest('[data-action]');
        if (actionEl) {
            const action = actionEl.getAttribute('data-action');
            handleAction(action);
        }

        // C. Track data-track elements
        const trackEl = target.closest('[data-track]');
        if (trackEl && window.trackEvent) {
            window.trackEvent('interaction', { id: trackEl.getAttribute('data-track') });
        }
    });

    // 2. Action Logic
    function handleAction(action) {
        switch(action) {
            case 'strava-connect':
                const clientId = '205442';
                const redirectUri = window.location.origin + window.location.pathname;
                const scope = 'read,activity:read_all';
                const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;
                
                if (window.trackEvent) window.trackEvent('lead_magnet_usage', { type: 'strava_oauth_init' });
                localStorage.setItem('lead_magnet_done', 'true');
                window.location.href = authUrl;
                break;
                
            case 'scroll-top':
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
        }
    }

    // 3. ScrollSpy (Active Nav Highlighting)
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(s => s !== null);

    window.addEventListener('scroll', () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // 4. API Success Check (from URL params)
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        const API_URL = "https://strava-backend-n6zk.onrender.com/exchange";
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        })
        .then(res => res.json())
        .then(data => {
            console.log('[System] API Connection Verified');
            localStorage.setItem('api_done', 'true');
            // Notify tracking
            if (window.trackEvent) window.trackEvent('api_connection_success');
        })
        .catch(err => console.error('[System] API Fetch Error:', err));
    }
});
