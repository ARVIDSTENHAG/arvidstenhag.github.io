const toggle = document.getElementById('toggle');
const statusText = document.getElementById('status-text');

// Ladda sparat tillstånd
chrome.storage.local.get(['pluginActive'], (res) => {
    const active = res.pluginActive ?? true;
    toggle.checked = active;
    updateText(active);
});

// Spara tillstånd när man klickar
toggle.addEventListener('change', () => {
    const active = toggle.checked;
    chrome.storage.local.set({ pluginActive: active });
    updateText(active);
});

function updateText(active) {
    statusText.innerText = active ? "On" : "Off";
    statusText.style.color = active ? "#00ff88" : "#ef4444";
}