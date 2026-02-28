document.addEventListener('DOMContentLoaded', () => {
    /**
     * 1. Scroll-triggered Reveals (Intersection Observer)
     * Adds 'visible' class to sections when they enter the viewport
     */
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Once visible, we can stop observing this section
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        revealObserver.observe(section);
    });

    /**
     * 2. Smooth Scrolling refinement (for Safari/older browsers)
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    /**
     * 3. Animated Result Count-up (VG-detalj)
     * Call this function on the results page to animate the marathon time.
     * Example usage: animateTimeCount('result-display', '03:11:51');
     */
    window.animateTimeCount = function(elementId, targetTimeStr) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Parse HH:MM:SS to total seconds
        const parts = targetTimeStr.split(':').map(Number);
        const targetSeconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        
        let currentSeconds = 0;
        const duration = 2000; // 2 seconds animation
        const frameRate = 60;
        const totalFrames = (duration / 1000) * frameRate;
        const increment = targetSeconds / totalFrames;

        const timer = setInterval(() => {
            currentSeconds += increment;
            if (currentSeconds >= targetSeconds) {
                currentSeconds = targetSeconds;
                clearInterval(timer);
            }

            // Format back to HH:MM:SS
            const h = Math.floor(currentSeconds / 3600);
            const m = Math.floor((currentSeconds % 3600) / 60);
            const s = Math.floor(currentSeconds % 60);
            
            element.textContent = 
                `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }, 1000 / frameRate);
    };
});
