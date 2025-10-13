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

// Initialize 3D Background
init3DBackground();

// Create Animated Particles
createParticles();

// Initialize with Delhi, India
window.addEventListener('load', () => {
    getWeatherData('Delhi');
});

// 3D Background with Three.js
function init3DBackground() {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create geometric shapes
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00f0ff, 
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    
    const shapes = [];
    for (let i = 0; i < 20; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (Math.random() - 0.5) * 50;
        mesh.position.y = (Math.random() - 0.5) * 50;
        mesh.position.z = (Math.random() - 0.5) * 50;
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);
        scene.add(mesh);
        shapes.push(mesh);
    }
    
    camera.position.z = 30;
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        shapes.forEach((shape, index) => {
            shape.rotation.x += 0.001 * (index % 2 === 0 ? 1 : -1);
            shape.rotation.y += 0.001 * (index % 3 === 0 ? 1 : -1);
            
            // Float animation
            shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Create Animated Particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Handle Search
function handleSearch() {
    const city = cityInput.value.trim();
    
    if (city === '') {
        showError('PLEASE ENTER A LOCATION');
        return;
    }
    
    getWeatherData(city);
}

// Fetch City Background Image from Unsplash
async function getCityImage(cityName) {
    try {
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
        backgroundImage.style.backgroundImage = 'linear-gradient(135deg, #0a0e17 0%, #1a1f35 50%, #0a0e17 100%)';
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
                throw new Error('LOCATION NOT FOUND. CHECK COORDINATES AND RETRY.');
            } else if (currentResponse.status === 401) {
                console.error('API Key Error Details:', errorData);
                throw new Error('API KEY ERROR: SYSTEM NOT AUTHORIZED. WAIT 1-2 HOURS AND RETRY.');
            } else {
                throw new Error(`DATA RETRIEVAL FAILED: ${errorData.message || currentResponse.statusText}`);
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
            throw new Error(`FORECAST DATA UNAVAILABLE: ${errorData.message || forecastResponse.statusText}`);
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

// Display Current Weather with Animations
function displayCurrentWeather(data) {
    const { name, sys, main, weather, wind, visibility } = data;
    
    // Update main weather display with number animation
    animateNumber(document.getElementById('mainTemp'), Math.round(main.temp));
    document.getElementById('weatherDescription').textContent = weather[0].description.toUpperCase();
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

// Animate Number Count Up
function animateNumber(element, targetNumber) {
    const duration = 1000;
    const startTime = performance.now();
    const startNumber = 0;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * easeOutQuad(progress));
        element.textContent = currentNumber;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = targetNumber;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Easing function
function easeOutQuad(t) {
    return t * (2 - t);
}

// Display 5-Day Forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    
    // Filter forecast data to get one entry per day (12:00 PM)
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 5);
    
    dailyForecasts.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const dayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.style.animationDelay = `${index * 0.1}s`;
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
        second: '2-digit',
        hour12: false
    };
    
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions).toUpperCase();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);
}

// Update Last Updated Time
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        lastUpdatedElement.innerHTML = '<span class="status-indicator"></span>UPDATED JUST NOW';
    }
}

// Calculate UV Index (approximate based on weather conditions)
function calculateUVIndex(weatherId) {
    if (weatherId >= 200 && weatherId < 600) {
        return '2 - LOW';
    } else if (weatherId >= 600 && weatherId < 700) {
        return '3 - MODERATE';
    } else if (weatherId >= 700 && weatherId < 800) {
        return '4 - MODERATE';
    } else if (weatherId === 800) {
        return '7 - HIGH';
    } else {
        return '5 - MODERATE';
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
    
    // Auto hide error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
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

// Add Tilt Effect to Cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        cityInput.focus();
        cityInput.select();
    }
});

// Add scan line animation to text
function addScanLineEffect() {
    const scanElements = document.querySelectorAll('.scan-line-text');
    scanElements.forEach(el => {
        el.style.animation = 'scanLine 2s infinite';
    });
}

// Add entrance animations when elements become visible
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.8s ease forwards';
        }
    });
}, observerOptions);

// Observe all cards
setTimeout(() => {
    document.querySelectorAll('.detail-card, .forecast-card').forEach(card => {
        observer.observe(card);
    });
}, 100);