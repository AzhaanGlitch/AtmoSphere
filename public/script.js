// API Configuration
const WEATHER_API_KEY = 'db712e605e96a5d39d853fb684e45d93';
const UNSPLASH_API_KEY = 'vqQ4TjhQtDRnttG35Vy5b1AQZ3kOlynCkE0WPo_9DEo';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';
const GLOBE_MODEL_URL = '3d_model/earth_globe_-_atlas.glb';

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
let proceduralGlobeCreated = false;

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

// Initialize with Delhi, India and globe
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
    
    function animate() {
        requestAnimationFrame(animate);
        
        shapes.forEach((shape, index) => {
            shape.rotation.x += 0.001 * (index % 2 === 0 ? 1 : -1);
            shape.rotation.y += 0.001 * (index % 3 === 0 ? 1 : -1);
            shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
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
    if (!globeContainer || globeContainer.clientWidth === 0 || globeContainer.clientHeight === 0) {
        console.warn('Globe container not ready, retrying...');
        setTimeout(initGlobe, 100);
        return;
    }

    if (globeInitialized) {
        return;
    }

    try {
        globeScene = new THREE.Scene();
        globeCamera = new THREE.PerspectiveCamera(
            75,
            globeContainer.clientWidth / globeContainer.clientHeight,
            0.1,
            1000
        );
        globeRenderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            precision: 'highp',
            powerPreference: 'high-performance'
        });
        
        globeRenderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
        globeRenderer.setPixelRatio(window.devicePixelRatio);
        globeRenderer.setClearColor(0x000000, 0);
        
        globeContainer.innerHTML = '';
        globeContainer.appendChild(globeRenderer.domElement);
        
        // Force canvas visibility
        globeRenderer.domElement.style.opacity = '1';
        globeRenderer.domElement.style.display = 'block';
        
        globeCamera.position.z = 2.5;
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        globeScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 3, 5);
        globeScene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0x00f0ff, 0.4);
        pointLight.position.set(-5, -3, 5);
        globeScene.add(pointLight);
        
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
        console.warn('GLTFLoader not available, creating procedural globe');
        createProceduralGlobe();
        return;
    }

    const loader = new THREE.GLTFLoader();
    
    console.log('Attempting to load GLB model from:', GLOBE_MODEL_URL);
    
    loader.load(
        GLOBE_MODEL_URL,
        (gltf) => {
            console.log('✓ GLB model loaded successfully!');
            
            globeModel = gltf.scene;
            globeModel.scale.set(1, 1, 1);
            globeModel.position.set(0, 0, 0);
            
            globeModel.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    
                    if (node.material) {
                        node.material.side = THREE.FrontSide;
                        if (node.material.metalness !== undefined) {
                            node.material.metalness = 0.2;
                        }
                        if (node.material.roughness !== undefined) {
                            node.material.roughness = 0.8;
                        }
                        if (node.material.map) {
                            node.material.map.encoding = THREE.sRGBEncoding;
                        }
                    }
                }
            });
            
            globeScene.add(globeModel);
            proceduralGlobeCreated = false;
            console.log('Model added to scene');
            console.log('Globe model visible:', globeModel.visible);
            console.log('Globe model position:', globeModel.position);
        },
        (progress) => {
            if (progress.total > 0) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                console.log(`Loading globe: ${percent}%`);
            }
        },
        (error) => {
            console.warn('✗ GLB model failed to load:', error.message);
            
            if (!proceduralGlobeCreated) {
                console.log('Creating procedural globe as fallback...');
                createProceduralGlobe();
            }
        }
    );
}

// Create procedural globe
function createProceduralGlobe() {
    if (proceduralGlobeCreated) {
        console.log('Procedural globe already created');
        return;
    }

    try {
        const geometry = new THREE.IcosahedronGeometry(1, 6);
        
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                
                const noise1 = Math.sin(x * 0.003) * Math.cos(y * 0.002);
                const noise2 = Math.sin(x * 0.01) * Math.cos(y * 0.008) * 0.5;
                const noise3 = Math.sin(x * 0.02) * Math.cos(y * 0.015) * 0.25;
                const noise = noise1 + noise2 + noise3;
                
                if (noise > 0.3) {
                    data[idx] = 34; data[idx + 1] = 120; data[idx + 2] = 60;
                } else if (noise > 0.1) {
                    data[idx] = 180; data[idx + 1] = 150; data[idx + 2] = 100;
                } else if (noise > -0.1) {
                    data[idx] = 70; data[idx + 1] = 130; data[idx + 2] = 180;
                } else {
                    data[idx] = 25; data[idx + 1] = 60; data[idx + 2] = 120;
                }
                
                data[idx + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.encoding = THREE.sRGBEncoding;
        
        const material = new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.7,
            metalness: 0.1,
            side: THREE.FrontSide
        });
        
        globeModel = new THREE.Mesh(geometry, material);
        globeScene.add(globeModel);
        
        proceduralGlobeCreated = true;
        console.log('✓ Procedural globe created successfully');
    } catch (error) {
        console.error('Error creating procedural globe:', error);
    }
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

// Fetch City Background Image
async function getCityImage(cityName) {
    try {
        if (UNSPLASH_API_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
            return null;
        }
        
        const response = await fetch(
            `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(cityName + ' city skyline')}&per_page=1&orientation=landscape&client_id=${UNSPLASH_API_KEY}`
        );
        
        if (!response.ok) throw new Error('Unable to fetch city image');
        
        const data = await response.json();
        return data.results && data.results.length > 0 ? data.results[0].urls.regular : null;
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
        
        const currentResponse = await fetch(
            `${WEATHER_BASE_URL}/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) {
            const errorData = await currentResponse.json().catch(() => ({}));
            
            if (currentResponse.status === 404) {
                throw new Error('LOCATION NOT FOUND. CHECK COORDINATES AND RETRY.');
            } else if (currentResponse.status === 401) {
                throw new Error('API KEY ERROR: SYSTEM NOT AUTHORIZED.');
            } else {
                throw new Error(`DATA RETRIEVAL FAILED: ${errorData.message || currentResponse.statusText}`);
            }
        }
        
        const currentData = await currentResponse.json();
        
        const forecastResponse = await fetch(
            `${WEATHER_BASE_URL}/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!forecastResponse.ok) {
            throw new Error('FORECAST DATA UNAVAILABLE');
        }
        
        const forecastData = await forecastResponse.json();
        
        await updateBackgroundImage(currentData.name);
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
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
    
    animateNumber(document.getElementById('mainTemp'), Math.round(main.temp));
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
    document.getElementById('uvIndex').textContent = calculateUVIndex(weather[0].id);
    
    document.getElementById('quickHumidity').textContent = `${main.humidity}%`;
    document.getElementById('quickWind').textContent = `${Math.round(wind.speed * 3.6)} km/h`;
    document.getElementById('quickFeels').textContent = `${Math.round(main.feels_like)}°C`;
    
    currentWeather.classList.remove('d-none');
    weatherDetails.classList.remove('d-none');
}

// Animate Number
function animateNumber(element, targetNumber) {
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentNumber = Math.floor(targetNumber * progress * (2 - progress));
        element.textContent = currentNumber;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = targetNumber;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Display Forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    
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
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }).toUpperCase();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
}

// Update Last Updated
function updateLastUpdated() {
    const elem = document.getElementById('lastUpdated');
    if (elem) elem.innerHTML = '<span class="status-indicator"></span>UPDATED JUST NOW';
}

// Calculate UV Index
function calculateUVIndex(weatherId) {
    if (weatherId >= 200 && weatherId < 600) return '2 - LOW';
    if (weatherId >= 600 && weatherId < 700) return '3 - MODERATE';
    if (weatherId >= 700 && weatherId < 800) return '4 - MODERATE';
    if (weatherId === 800) return '7 - HIGH';
    return '5 - MODERATE';
}

// Show/Hide Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');
    currentWeather.classList.add('d-none');
    weatherDetails.classList.add('d-none');
    forecast.classList.add('d-none');
    loadingState.classList.add('d-none');
    setTimeout(hideError, 5000);
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

// Tilt Effect
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tilt]').forEach(card => {
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        cityInput.focus();
        cityInput.select();
    }
});

// Intersection Observer
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

setTimeout(() => {
    document.querySelectorAll('.detail-card, .forecast-card').forEach(card => {
        observer.observe(card);
    });
}, 100);