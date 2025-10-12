// API Configuration
const WEATHER_API_KEY = 'db712e605e96a5d39d853fb684e45d93';
const UNSPLASH_API_KEY = 'vqQ4TjhQtDRnttG35Vy5b1AQZ3kOlynCkE0WPo_9DEo';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const currentWeather = document.getElementById('currentWeather');
const weatherDetails = document.getElementById('weatherDetails');
const forecast = document.getElementById('forecast');
const loadingState = document.getElementById('loadingState');
const backgroundImage = document.getElementById('backgroundImage');

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

// Fetch City Background Image from Unsplash
async function getCityImage(cityName) {
    try {
        // If no API key is provided, use a fallback gradient
        if (UNSPLASH_API_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
            console.log('Unsplash API key not configured. Using default background.');
            return null;
        }
        
        const response = await fetch(
            `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(cityName + ' city skyline')}&per_page=1&orientation=landscape&client_id=${UNSPLASH_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Unable to fetch city image');
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.regular;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching city image:', error);
        return null;
    }
}

// Update Background Image
async function updateBackgroundImage(cityName) {
    const imageUrl = await getCityImage(cityName);
    
    if (imageUrl) {
        backgroundImage.style.backgroundImage = `url('${imageUrl}')`;
        backgroundImage.style.opacity = '1';
    } else {
        // Fallback to gradient if no image is found
        backgroundImage.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        backgroundImage.style.opacity = '1';
    }
}

// Fetch Weather Data
async function getWeatherData(city) {
    try {
        hideError();
        showLoading();
        
        // Get current weather
        const currentResponse = await fetch(
            `${WEATHER_BASE_URL}/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) {
            const errorData = await currentResponse.json().catch(() => ({}));
            
            if (currentResponse.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (currentResponse.status === 401) {
                console.error('API Key Error Details:', errorData);
                throw new Error('API key error: Your API key may not be activated yet. New keys can take 1-2 hours to activate. Please wait and try again.');
            } else {
                throw new Error(`Unable to fetch weather data. Error: ${errorData.message || currentResponse.statusText}`);
            }
        }
        
        const currentData = await currentResponse.json();
        console.log('Current weather data:', currentData);
        
        // Get 5-day forecast
        const forecastResponse = await fetch(
            `${WEATHER_BASE_URL}/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!forecastResponse.ok) {
            const errorData = await forecastResponse.json().catch(() => ({}));
            throw new Error(`Unable to fetch forecast data. Error: ${errorData.message || forecastResponse.statusText}`);
        }
        
        const forecastData = await forecastResponse.json();
        console.log('Forecast data:', forecastData);
        
        // Update background image
        await updateBackgroundImage(currentData.name);
        
        // Display data
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
        // Update last updated time
        updateLastUpdated();
        
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
    if (window.dateTimeInterval) {
        clearInterval(window.dateTimeInterval);
    }
    window.dateTimeInterval = setInterval(updateDateTime, 1000);
    
    // Update weather details
    document.getElementById('feelsLike').textContent = `${Math.round(main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(wind.speed * 3.6)} km/h`;
    document.getElementById('pressure').textContent = `${main.pressure} mb`;
    document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
    document.getElementById('uvIndex').textContent = calculateUVIndex(weather[0].id);
    
    // Update quick stats
    document.getElementById('quickHumidity').textContent = `${main.humidity}%`;
    document.getElementById('quickWind').textContent = `${Math.round(wind.speed * 3.6)} km/h`;
    document.getElementById('quickFeels').textContent = `${Math.round(main.feels_like)}°C`;
    
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

// Update Last Updated Time
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = 'Updated just now';
    }
}

// Calculate UV Index (approximate based on weather conditions)
function calculateUVIndex(weatherId) {
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
    loadingState.classList.add('d-none');
}

// Hide Error Message
function hideError() {
    errorMessage.classList.add('d-none');
}

// Show Loading State
function showLoading() {
    loadingState.classList.remove('d-none');
    currentWeather.classList.add('d-none');
    weatherDetails.classList.add('d-none');
    forecast.classList.add('d-none');
    searchBtn.disabled = true;
}

// Hide Loading State
function hideLoading() {
    loadingState.classList.add('d-none');
    searchBtn.disabled = false;
}