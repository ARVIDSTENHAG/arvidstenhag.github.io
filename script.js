/**
 * SYSTEM RUNTIME (LOVE + POLESTAR STYLE)
 */

// Global Configuration
const BETA_VERSION = "1.2";
const STORAGE_KEY = "prediction_count";

document.addEventListener('DOMContentLoaded', () => {
    
    // --- PREDICTION RESULT LOGIC ---
    const params = new URLSearchParams(window.location.search);
    const predictedTime = params.get('predicted_time');
    
    if (predictedTime) {
        const resultEl = document.querySelector('.calc-result');
        if (resultEl) {
            resultEl.innerText = predictedTime;
            // Highlight effect
            resultEl.style.color = '#00ff00'; 
            setTimeout(() => { resultEl.style.color = ''; }, 2000);
        }
        
        // Increment the counter
        if (window.incrementPredictionCount) {
            window.incrementPredictionCount();
        }

        // Clean up URL without refreshing
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }

    // --- PREDICTION COUNT LOGIC ---
    
    window.getPredictionCount = function() {
        let count = localStorage.getItem(STORAGE_KEY);
        if (!count) {
            count = 87; // Default start value
            localStorage.setItem(STORAGE_KEY, count);
        }
        return parseInt(count);
    };

    window.incrementPredictionCount = function() {
        let count = window.getPredictionCount();
        count++;
        localStorage.setItem(STORAGE_KEY, count);
        window.updatePredictionUI(count);
        
        // Push Tracking
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 
            event: 'prediction_generated',
            beta_version: BETA_VERSION,
            new_count: count 
        });
    };

    window.updatePredictionUI = function(count) {
        const el = document.getElementById('prediction-count');
        if (el) el.innerText = count;
    };

    // Initial UI Update
    window.updatePredictionUI(window.getPredictionCount());

    // --- REPO LINK CONFIG & TRACKING ---
    const repoLink = document.getElementById('plugin-repo-link');
    if (repoLink && window.SITE_CONFIG.EXTENSION_REPO_URL) {
        repoLink.href = window.SITE_CONFIG.EXTENSION_REPO_URL;
        repoLink.addEventListener('click', () => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ 
                event: 'plugin_repo_click',
                url: window.SITE_CONFIG.EXTENSION_REPO_URL
            });
        });
    }

    // --- EXISTING HANDLERS ---
    
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // A. Navigation & Anchors
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
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetElement.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });

    // 2. API Success Check & Hardening
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        const API_URL = window.SITE_CONFIG.API_BASE + "/exchange";
        const proofContainer = document.getElementById('api-proof-container');
        const statusEl = document.getElementById('api-status');
        const payloadEl = document.getElementById('api-payload');
        const timeEl = document.getElementById('api-timestamp');
        const finalTime = document.getElementById('final-time');

        if (proofContainer) proofContainer.style.display = 'block';

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        })
        .then(res => {
            if (statusEl) statusEl.innerText = `HTTP ${res.status}`;
            return res.json().then(data => ({ status: res.status, data }));
        })
        .then(({ status, data }) => {
            if (payloadEl) {
                const rawJson = JSON.stringify(data);
                payloadEl.innerText = rawJson.length > 500 ? rawJson.substring(0, 500) + "..." : rawJson;
            }
            if (timeEl) timeEl.innerText = new Date().toISOString();
            if (finalTime) finalTime.innerText = "3:11:51"; 

            localStorage.setItem('api_done', 'true');
            if (window.updateFunnel) window.updateFunnel('api');
            
            // Increment the counter upon successful API verification
            if (window.incrementPredictionCount) window.incrementPredictionCount();

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ 
                event: 'api_fetch_success',
                api_status: status,
                timestamp: new Date().toISOString()
            });
        })
        .catch(err => {
            if (statusEl) statusEl.innerText = "Error: Fetch Failed";
            if (payloadEl) payloadEl.innerText = err.message;
        });
    }

    // White Paper PDF Toggle (Legacy Support)
    const toggleBtn = document.getElementById('toggle-inline-pdf');
    const pdfWrap = document.getElementById('pdf-viewer-wrap');

    if (toggleBtn && pdfWrap) {
        toggleBtn.addEventListener('click', () => {
            const isVisible = pdfWrap.classList.contains('pdf-visible');
            if (isVisible) {
                pdfWrap.classList.remove('pdf-visible');
                pdfWrap.classList.add('pdf-hidden');
                toggleBtn.textContent = 'Read Inline';
            } else {
                pdfWrap.classList.remove('pdf-hidden');
                pdfWrap.classList.add('pdf-visible');
                toggleBtn.textContent = 'Close Preview';
            }
        });
    }
});
