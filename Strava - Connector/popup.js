document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect-btn');
  const LIVE_URL = "https://strava-backend-n6zk.onrender.com";

  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      const clientId = "205442";
      
      /**
       * Note: OAuth token exchange happens server-side for security reasons.
       * The redirectUri points to our backend to keep the client_secret hidden.
       */
      const redirectUri = `${LIVE_URL}/exchange`;
      const scope = "read,activity:read_all";
      
      const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;
      
      // Opens the Strava authorization flow in a new tab
      chrome.tabs.create({ url: authUrl });
    });
  }
});
