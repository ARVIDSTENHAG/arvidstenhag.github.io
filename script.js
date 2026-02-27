document.addEventListener('DOMContentLoaded', () => {
    // Skapa en knapp för att invertera färgerna (svart till vitt, vitt till svart)
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'INVERTERA';
    toggleBtn.className = 'btn theme-toggle';
    
    document.body.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});