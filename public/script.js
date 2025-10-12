// API Configuration
const API_KEY = '2d2d6db30ebb6d54f26c25ef9fa04d25';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const currentWeather = document.getElementById('currentWeather');
const weatherDetails = document.getElementById('weatherDetails');
const forecast = document.getElementById('forecast');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Initialize with a default city
window.addEventListener('load', () => {
    getWeatherData('London');
});

// Handle Search
function handleSearch() {
    const city = cityInput.value.trim();
    
    if (city === '') {
        showError('Please enter a city name');
        return;
    }
    
    getWeatherData(city);
}

// Fetch Weather Data
async function getWeatherData(city) {
    try {
        hideError();
        showLoading();
        
        // Get current weather
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) {
            if (currentResponse.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (currentResponse.status === 401) {
                throw new Error('Invalid API key. Please check your API configuration.');
            } else {
                throw new Error('Unable to fetch weather data. Please try again later.');
            }
        }
        
        const currentData = await currentResponse.json();
        
        // Get 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!forecastResponse.ok) {
            throw new Error('Unable to fetch forecast data. Please try again later.');
        }
        
        const forecastData = await forecastResponse.json();
        
        // Display data
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        showError(error.message);
        console.error('Error fetching weather data:', error);
    }
}

// Display Current Weather
function displayCurrentWeather(data) {
    const { name, sys, main, weather, wind, visibility } = data;
    
    // Update main weather display
    document.getElementById('mainTemp').textContent = Math.round(main.temp);
    document.getElementById('weatherDescription').textContent = weather[0].description;
    document.getElementById('cityName').textContent = `${name}, ${sys.country}`;
    document.getElementById('mainWeatherIcon').src = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
    document.getElementById('mainWeatherIcon').alt = weather[0].description;
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Update weather details
    document.getElementById('feelsLike').textContent = `${Math.round(main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(wind.speed * 3.6)} km/h`;
    document.getElementById('pressure').textContent = `${main.pressure} mb`;
    document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
    
    // UV Index would require additional API call (One Call API)
    // For now, we'll show a placeholder or calculate based on conditions
    document.getElementById('uvIndex').textContent = calculateUVIndex(weather[0].id);
    
    // Show elements
    currentWeather.classList.remove('d-none');
    weatherDetails.classList.remove('d-none');
}

// Display 5-Day Forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    
    // Filter forecast data to get one entry per day (12:00 PM)
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 5);
    
    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${dayName}, ${dayDate}</div>
            <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" 
                     alt="${day.weather[0].description}">
            </div>
            <div class="forecast-temp">
                <span class="temp-max">${Math.round(day.main.temp_max)}°</span>
                <span class="temp-min">${Math.round(day.main.temp_min)}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
    
    forecast.classList.remove('d-none');
}

// Update Date and Time
function updateDateTime() {
    const now = new Date();
    
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    };
    
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);
}

// Calculate UV Index (approximate based on weather conditions)
function calculateUVIndex(weatherId) {
    // This is a simplified calculation
    // Ideally, you'd use the One Call API for accurate UV data
    if (weatherId >= 200 && weatherId < 600) {
        return '2 - Low';
    } else if (weatherId >= 600 && weatherId < 700) {
        return '3 - Moderate';
    } else if (weatherId >= 700 && weatherId < 800) {
        return '4 - Moderate';
    } else if (weatherId === 800) {
        return '7 - High';
    } else {
        return '5 - Moderate';
    }
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');
    
    currentWeather.classList.add('d-none');
    weatherDetails.classList.add('d-none');
    forecast.classList.add('d-none');
}

// Hide Error Message
function hideError() {
    errorMessage.classList.add('d-none');
}

// Show Loading State
function showLoading() {
    searchBtn.innerHTML = '<div class="loading"></div>';
    searchBtn.disabled = true;
}

// Hide Loading State
function hideLoading() {
    searchBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
    `;
    searchBtn.disabled = false;
}