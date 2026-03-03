# Strava Connector – Chrome Extension (MV3)

This Chrome Extension is part of a technical assignment demonstrating full-stack integration between a browser client, a Node.js backend, and the Strava OAuth 2.0 API.

## Technical Description
The extension facilitates the authentication loop for the **Marathon Predictor Engine**. It serves as an entry point for users to connect their Strava accounts, triggering a secure OAuth flow that results in data retrieval for performance forecasting.

### Architecture Overview:
1. **Frontend (Extension):** Built using Manifest V3. Initiates the OAuth flow.
2. **Backend (Render):** Receives the authorization `code`, exchanges it for an `access_token`, fetches activity data, and calculates marathon predictions.
3. **API Integration:** Utilizes the Strava v3 REST API.

## OAuth Flow Explanation
The extension follows a **Server-Side Authorization Code Flow**:
1. User clicks "Initialize Strava Connect" in the popup.
2. Extension redirects the user to Strava's `authorize` endpoint with a specific `redirect_uri` pointing to the backend.
3. Upon user approval, Strava redirects back to the backend `/exchange` route with a temporary `code`.
4. The backend performs a POST request to Strava to exchange the code for a token, ensuring no sensitive credentials (`client_secret`) are ever exposed in the browser.

## API Usage
- **Endpoint:** `https://www.strava.com/api/v3/athlete/activities`
- **Logic:** The system retrieves the athlete's latest running activities. If a run > 5km is found, it applies **Riegel's Formula** ($T_2 = T_1 	imes (D_2 / D_1)^{1.06}$) to generate a marathon time prediction.

## Note on Strava API Limits
Due to Strava's API developer restrictions, this application is currently in **Development Mode**.
- **User Limit:** Restricted to 1 authorized user (the developer/tester).
- **Scope:** Requires `read` and `activity:read_all` permissions to fetch race history.

## Installation Instructions
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the `Strava - Connector/` folder from this project.
5. Pin the extension and click the icon to begin the flow.
