require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const session = require('express-session');
const { allowedNodeEnvironmentFlags } = require('process');


const app = express();
const port = process.env.PORT;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'lax',  
        secure: false 
      }
}));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Route login-42
app.get('/auth/42', (req, res) => {
  const autorizeUrl = 'https://api.intra.42.fr/oauth/authorize';
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    response_type: 'code',
  });

  //redirect user to 42's login page
  res.redirect(`${autorizeUrl}?${params.toString()}`);
});

// 42 sends user back to this route
app.get('/auth/42/callback', async (req, res) => {
    const code = req.query.code;
    // code to get the access token
    // res.send(`Got the code: ${code}`);
    if (!code) {
        res.send('Error: No code provided');
        return ;
    }
    try {
        const tokenResponse = await axios.post('https://api.intra.42.fr/oauth/token', {
            grant_type: 'authorization_code',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code,
            redirect_uri: process.env.REDIRECT_URI,
        });
        
        const accessToken = tokenResponse.data.access_token;

        // get user info
        const userResponse = await axios.get('https://api.intra.42.fr/v2/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // store user data in session
        req.session.user = userResponse.data;
        res.redirect('/index.html');
        // Instead of storing user data in session and redirecting,
        
        // print out the user data in a formatted way for testing.
        // res.send(`
        //     <h1>User Data</h1>
        //     <pre>${JSON.stringify(userResponse.data, null, 2)}</pre>
        // `);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: Unable to get or fetch user data');
    }
});

// Route to get user data
app.get('/user', (req, res) => {
    if (!req.session.user) {
        res.status(401).send('Error: Not Logged In');
        return ;
    }

    res.send(req.session.user);
});

// Listen on port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});