// API Configuration
const WEATHER_API_KEY = 'db712e605e96a5d39d853fb684e45d93';
const UNSPLASH_API_KEY = 'vqQ4TjhQtDRnttG35Vy5b1AQZ3kOlynCkE0WPo_9DEo';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';
const GLOBE_MODEL_URL = '3d_model/earth.glb';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const currentWeather = document.getElementById('currentWeather');
const weatherDetails = document.getElementById('weatherDetails');
const forecast = document.getElementById('forecast');
const loadingState = document.getElementById('loadingState');
const backgroundImage = document.getElementById('backgroundImage');
const globeContainer = document.getElementById('globe-canvas');

// Three.js variables for globe
let globeScene, globeCamera, globeRenderer, globeModel;
let globeInitialized = false;

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Initialize
init3DBackground();
createParticles();
window.addEventListener('load', () => {
    setTimeout(() => {
        initGlobe();
    }, 100);
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
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.1 });
    const shapes = [];
    for (let i = 0; i < 20; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);
        scene.add(mesh);
        shapes.push(mesh);
    }
    camera.position.z = 30;
    function animate() {
        requestAnimationFrame(animate);
        shapes.forEach((shape, index) => {
            shape.rotation.x += 0.001 * (index % 2 === 0 ? 1 : -1);
            shape.rotation.y += 0.001 * (index % 3 === 0 ? 1 : -1);
        });
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize 3D Globe
function initGlobe() {
    if (!globeContainer || globeContainer.clientWidth === 0 || globeContainer.clientHeight === 0 || globeInitialized) {
        return;
    }
    try {
        globeScene = new THREE.Scene();
        globeCamera = new THREE.PerspectiveCamera(75, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
        globeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        globeRenderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
        globeRenderer.setPixelRatio(window.devicePixelRatio);
        globeRenderer.setClearColor(0x000000, 0);
        globeContainer.innerHTML = '';
        globeContainer.appendChild(globeRenderer.domElement);
        globeCamera.position.z = 2.5;
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        globeScene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 3, 5);
        globeScene.add(directionalLight);
        loadGlobeModel();
        animateGlobe();
        window.addEventListener('resize', () => {
            if (!globeContainer) return;
            const width = globeContainer.clientWidth;
            const height = globeContainer.clientHeight;
            if (width > 0 && height > 0) {
                globeCamera.aspect = width / height;
                globeCamera.updateProjectionMatrix();
                globeRenderer.setSize(width, height);
            }
        });
        globeInitialized = true;
        console.log('Globe initialization completed');
    } catch (error) {
        console.error('Error initializing globe:', error);
    }
}

// Load GLB model
function loadGlobeModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
        console.warn('GLTFLoader not available.');
        return;
    }
    const loader = new THREE.GLTFLoader();
    loader.load(GLOBE_MODEL_URL, (gltf) => {
        console.log('✓ GLB model loaded successfully!');
        globeModel = gltf.scene;
        // Auto-scaling and centering logic
        const box = new THREE.Box3().setFromObject(globeModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const desiredSize = 2.0; // Set desired diameter of the globe
        const scale = desiredSize / maxSize;
        globeModel.scale.set(scale, scale, scale);
        globeModel.position.sub(center.multiplyScalar(scale));
        globeModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        globeScene.add(globeModel);
        console.log('Model re-scaled, centered, and added to scene');
    }, undefined, (error) => {
        console.error('✗ GLB model failed to load:', error);
    });
}

// Animate globe
function animateGlobe() {
    if (!globeInitialized) return;
    requestAnimationFrame(animateGlobe);
    if (globeModel) {
        globeModel.rotation.y += 0.001;
    }
    globeRenderer.render(globeScene, globeCamera);
}

// Create Animated Particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
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
    if (city) {
        getWeatherData(city);
    } else {
        showError('PLEASE ENTER A LOCATION');
    }
}

// Fetch and display weather data
async function getWeatherData(city) {
    hideError();
    showLoading();
    try {
        const currentResponse = await fetch(`${WEATHER_BASE_URL}/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
        if (!currentResponse.ok) throw new Error('Location not found.');
        const currentData = await currentResponse.json();

        const forecastResponse = await fetch(`${WEATHER_BASE_URL}/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
        if (!forecastResponse.ok) throw new Error('Forecast data unavailable.');
        const forecastData = await forecastResponse.json();

        await updateBackgroundImage(currentData.name);
        displayCurrentWeather(currentData);
        displayForecast(forecastData);

        // ===== FINAL FIX: SCROLL TO THE GLOBE =====
        setTimeout(() => {
            const globeSection = document.querySelector('.globe-section');
            if (globeSection) {
                globeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                console.log('Scrolled to globe section.');
            }
        }, 500); // Small delay to ensure layout is ready

    } catch (error) {
        showError(error.message);
        console.error('Error fetching weather data:', error);
    } finally {
        hideLoading();
    }
}

// Update Background Image
async function updateBackgroundImage(cityName) {
    try {
        const response = await fetch(`${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(cityName + ' city')}&per_page=1&orientation=landscape&client_id=${UNSPLASH_API_KEY}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (data.results.length > 0) {
            backgroundImage.style.backgroundImage = `url('${data.results[0].urls.regular}')`;
        }
    } catch (error) {
        console.error('Error fetching city image:', error);
        backgroundImage.style.backgroundImage = ''; // Let CSS handle fallback
    }
}

// Display Current Weather
function displayCurrentWeather(data) {
    const { name, sys, main, weather, wind, visibility } = data;
    document.getElementById('mainTemp').textContent = Math.round(main.temp);
    document.getElementById('weatherDescription').textContent = weather[0].description.toUpperCase();
    document.getElementById('cityName').textContent = `${name}, ${sys.country}`;
    document.getElementById('mainWeatherIcon').src = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
    updateDateTime();
    if (window.dateTimeInterval) clearInterval(window.dateTimeInterval);
    window.dateTimeInterval = setInterval(updateDateTime, 1000);
    document.getElementById('feelsLike').textContent = `${Math.round(main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(wind.speed * 3.6)} km/h`;
    document.getElementById('pressure').textContent = `${main.pressure} mb`;
    document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
    document.getElementById('uvIndex').textContent = 'N/A'; // Placeholder
    document.getElementById('quickHumidity').textContent = `${main.humidity}%`;
    document.getElementById('quickWind').textContent = `${Math.round(wind.speed * 3.6)} km/h`;
    document.getElementById('quickFeels').textContent = `${Math.round(main.feels_like)}°C`;
    currentWeather.classList.remove('d-none');
    weatherDetails.classList.remove('d-none');
}

// Display Forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);
    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${dayName}, ${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}</div>
            <div class="forecast-icon"><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt=""></div>
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
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

// UI State Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');
    setTimeout(() => errorMessage.classList.add('d-none'), 5000);
}

function hideError() {
    errorMessage.classList.add('d-none');
}

function showLoading() {
    loadingState.classList.remove('d-none');
    currentWeather.classList.add('d-none');
    weatherDetails.classList.add('d-none');
    forecast.classList.add('d-none');
    searchBtn.disabled = true;
}

function hideLoading() {
    loadingState.classList.add('d-none');
    searchBtn.disabled = false;
}