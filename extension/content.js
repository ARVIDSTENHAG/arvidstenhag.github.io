// Regex för att hitta tider som 1:45:22 eller 3:09
const timeRegex = /\b(\d{1,2}:)?\d{2}:\d{2}\b/g;

function highlightTimes() {
    chrome.storage.local.get(['pluginActive'], (result) => {
        // Om pluginet inte är aktivt, gör inget
        if (result.pluginActive === false) return;

        // Gå igenom all text på sidan
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walk.nextNode()) {
            const parent = node.parentElement;
            if (parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE' && parent.getAttribute('data-highlighter') !== 'true') {
                const text = node.nodeValue;
                if (timeRegex.test(text)) {
                    // Demo: Vi loggar bara i konsolen att vi hittat tider
                    // För en fullständig highlighter skulle vi ersätta text-noden med HTML
                    console.log("Pace Highlighter hittade tid i:", parent);
                    parent.style.borderLeft = "2px solid #00ff88";
                    parent.setAttribute('data-highlighter', 'true');
                }
            }
        }
    });
}

// Kör var 3:e sekund för att fånga dynamiskt innehåll
setInterval(highlightTimes, 3000);
console.log("Growth Lab Pace Highlighter active.");