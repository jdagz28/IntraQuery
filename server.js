require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 1919;


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

// Listen on port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });