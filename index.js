const axios = require('axios');
require('dotenv').config();

// Get API key from environment variables or use a default
const API_KEY = process.env.OPENWEATHER_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Function to get weather by city name
async function getWeatherByCity(city) {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: city,
                appid: API_KEY,
                units: 'metric', // For Celsius, use 'imperial' for Fahrenheit
                lang: 'en'
            }
        });
        
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('City not found');
        } else if (error.response && error.response.status === 401) {
            throw new Error('Invalid API key');
        } else {
            throw new Error('Error fetching weather data');
        }
    }
}

// Function to display weather information
function displayWeather(weatherData) {
    console.log('\n========== WEATHER REPORT ==========');
    console.log(`📍 City: ${weatherData.name}, ${weatherData.sys.country}`);
    console.log(`🌡️ Temperature: ${weatherData.main.temp}°C`);
    console.log(`🤔 Feels like: ${weatherData.main.feels_like}°C`);
    console.log(`📊 Pressure: ${weatherData.main.pressure} hPa`);
    console.log(`💧 Humidity: ${weatherData.main.humidity}%`);
    console.log(`🌬️ Wind: ${weatherData.wind.speed} m/s, ${weatherData.wind.deg}°`);
    console.log(`☁️ Weather: ${weatherData.weather[0].main} - ${weatherData.weather[0].description}`);
    console.log(`👀 Visibility: ${weatherData.visibility / 1000} km`);
    console.log('====================================\n');
}

// Main function
async function main() {
    // Get city from command line arguments
    const city = process.argv[2];
    
    if (!city) {
        console.log('Please provide a city name. Usage: node index.js "London"');
        console.log('Example: node index.js "New York"');
        return;
    }
    
    try {
        console.log(`Fetching weather for ${city}...`);
        const weatherData = await getWeatherByCity(city);
        displayWeather(weatherData);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

// Run the app
main();