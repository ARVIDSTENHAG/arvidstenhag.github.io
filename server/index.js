import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from root folder
app.use(express.static(path.join(__dirname, '../')));

// Strava Configuration
const CLIENT_ID = process.env.STRAVA_CLIENT_ID || '205442';
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || `http://localhost:${PORT}/auth/strava/callback`;
const FRONTEND_URL = "https://arvidstenhag.github.io/growth-lab/";

/**
 * 1. Start Strava Auth
 * Redirects user to Strava's OAuth page
 */
app.get('/login', (req, res) => {
    const scope = 'read,activity:read_all';
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${scope}`;
    console.log("Redirecting to Strava:", authUrl);
    res.redirect(authUrl);
});

/**
 * 2. Strava Callback
 * Strava redirects here with a 'code'. We then redirect back to the frontend with that code.
 */
app.get('/auth/strava/callback', (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.redirect(`${FRONTEND_URL}?error=auth_failed`);
    }
    console.log("Received code from Strava, redirecting to frontend...");
    res.redirect(`${FRONTEND_URL}?code=${code}`);
});

/**
 * 3. Exchange Token
 * Frontend calls this to exchange the code for an access token
 */
app.post('/exchange', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    try {
        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Exchange error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Root route → index.html
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Redirect URI set to: ${REDIRECT_URI}`);
});
