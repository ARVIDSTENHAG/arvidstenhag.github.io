document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect-btn');
  const LIVE_URL = "https://strava-backend-n6zk.onrender.com";

  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      console.log('Knapp tryckt!');
      
      const clientId = "205442";
      const redirectUri = `${LIVE_URL}/exchange`;
      const scope = "read,activity:read_all";
      
      const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;
      
      // Öppnar Strava-inloggningen i en ny flik
      chrome.tabs.create({ url: authUrl });
    });
  } else {
    console.error('Fel: Kunde inte hitta knappen med id="connect-btn" i HTML-filen.');
  }

  // Exempel på fetch-anrop till live-servern
  async function checkServerStatus() {
    try {
      const response = await fetch(LIVE_URL);
      const data = await response.text();
      console.log("Serverstatus:", data);
    } catch (err) {
      console.error("Kunde inte nå live-servern:", err);
    }
  }
});
