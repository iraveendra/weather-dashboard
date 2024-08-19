require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const NodeCache = require('node-cache');

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define Mongoose Schema and Model
const citySchema = new mongoose.Schema({
  name: String,
  country: String,
  lat: Number,
  lon: Number,
});

const City = mongoose.model('City', citySchema);

// Google OAuth2.0 Setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Routes
app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard');
  }
);

app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('http://localhost:3000/'));
});

app.get('/api/cities', async (req, res) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities data:', error);
    res.status(500).send('Error fetching cities data');
  }
});

const cache = new NodeCache({ stdTTL: 3600 });

async function generateExpandedDescription(weatherDescription) {
    const cachedResponse = cache.get(weatherDescription);
    if (cachedResponse) {
        console.log("Cache hit:", cachedResponse);  // Print cache hit
        return cachedResponse;
    }
  
    try {
        // Sending the prompt to the LLM API with the adjusted prompt and constraints
        const response = await axios.post(`${process.env.LLM_API}/generate`, {
            text: weatherDescription,
            max_tokens: 20,  // Ensure response length is constrained
            temperature: 0.85,  // Align with the model's temperature
        });
        console.log("Raw API response:", response.data);  // Print the raw API response
  
        // Extracting and formatting the response
        let generatedText = response.data[0].generated_text;
        console.log("Generated text:", generatedText);  // Print the generated text
  
        // Ensure it is a one-liner and trim any trailing spaces or punctuation
        generatedText = generatedText.split('\n')[0].trim();
        console.log("Cleaned generated text:", generatedText);  // Print the cleaned text
        
        // Further ensure it is concise
        if (generatedText.includes('.')) {
            generatedText = generatedText.split('.')[0] + '.';
        }
        console.log("Final one-liner:", generatedText);  // Print the final one-liner

        cache.set(weatherDescription, generatedText);
        return generatedText;
    } catch (error) {
        console.error('Error generating expanded description:', error);
        return null;
    }
}


app.get('/api/weather', async (req, res) => {
  const { city } = req.query;

  try {
    const cityData = await City.findOne({ name: city });

    if (!cityData) {
      return res.status(404).send('City not found');
    }

    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: cityData.lat,
        lon: cityData.lon,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric',
      }
    });

    // const weatherDescription = weatherResponse.data.weather[0].description;
    // let aiDescription = await generateExpandedDescription(weatherDescription);

    // if (!aiDescription) {
    //   aiDescription = weatherDescription;
    // }

    // weatherResponse.data.weather[0].description = aiDescription;
    res.json(weatherResponse.data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).send('Error fetching weather data');
  }
});
  

  app.get('/api/pinterest', async (req, res) => {
    const { query } = req.query;
    try {
      const response = await axios.get(`https://api.pinterest.com/v1/search/pins/`, {
        params: {
          query,
          access_token: process.env.PINTEREST_API_KEY,
        },
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).send('Error fetching Pinterest data');
    }
  });
  

  app.get('/api/restaurant', async (req, res) => {
    const { location } = req.query;
    try {
      const response = await axios.get(`https://api.yelp.com/v3/businesses/search`, {
        params: {
          location,
        },
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
        },
      });
      res.json(response.data.businesses);
    } catch (error) {
      res.status(500).send('Error fetching restaurant data');
    }
  });
  

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    try {
      const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        model: 'gpt-3.5-turbo',  // Example model
        prompt: message,
        max_tokens: 150,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });
      res.json(response.data.choices[0].text);
    } catch (error) {
      res.status(500).send('Error processing chat message');
    }
  });
  

// Start the server
const PORT = process.env.PORT || configDotenv.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
