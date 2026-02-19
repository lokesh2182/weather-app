// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Validate API key
if (!API_KEY) {
  console.error("❌ ERROR: OPENWEATHER_API_KEY not found in .env");
  process.exit(1);
}

// ✅ Validate MongoDB URI
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI not found in .env");
  process.exit(1);
}

// ✅ MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Schema
const citySchema = new mongoose.Schema({
  name: String,
  country: String,
  temperature: Number,
  description: String,
  icon: String, // ✅ include icon in schema
  date: { type: Date, default: Date.now },
});

const City = mongoose.model("City", citySchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Routes
app.get("/", (req, res) => {
  res.render("index", {
    weather: null,
    error: null,
    title: "Weather App",
  });
});

app.post("/", async (req, res) => {
  const city = req.body.city;

  if (!city) {
    return res.render("index", {
      weather: null,
      error: "Please enter a city name",
      title: "Weather App - Error",
    });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    const weather = {
      name: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon, // ✅ include icon
    };

    // Save to MongoDB
    await new City(weather).save();

    res.render("index", {
      weather,
      error: null,
      title: `Weather in ${weather.name}`,
    });
  } catch (error) {
    res.render("index", {
      weather: null,
      error: "City not found or API error",
      title: "Weather App - Error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log("🌤️ Weather app ready! Enter a city to get started.");

  // Open browser automatically (Windows)
  require("child_process").exec(`start http://localhost:${PORT}`);
});
