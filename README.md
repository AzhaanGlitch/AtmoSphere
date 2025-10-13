# AtmoSphere: Weather Anywhere

![Atmosphere UI](/assets/Dashboard.png) 

## Overview
**AtmoSphere** is a futuristic, immersive weather dashboard designed for tactical weather intelligence. Built with a cyberpunk aesthetic, it provides real-time weather data, 5-day forecasts, and a stunning 3D interactive Earth globe visualization. Users can search for any location worldwide, view dynamic backgrounds based on city images, and interact with a rotating 3D globe powered by Three.js.

**Key highlights:**

* **Real-time Weather**: Fetches current conditions, humidity, wind, pressure, visibility, and UV index.
* **Forecast**: 5-day mission forecast with high/low temperatures and icons.
* **3D Globe**: Interactive Earth model with `OrbitControls` for exploration (debug mode enabled).
* **Responsive Design**: Works seamlessly on desktop and mobile devices.
* **Animated UI**: Glitch effects, particle systems, and glowing elements for a high-tech feel.

This project was developed to showcase modern web technologies, including Three.js for 3D rendering and OpenWeatherMap for data.

---

## Features
* **Location Search**: Enter any city to fetch weather data.
* **Dynamic Backgrounds**: Unsplash API pulls city-specific images with overlays.
* **Current Weather Display**: Large temperature readout, weather icons, and quick stats.
* **Detailed Metrics**: Humidity, wind speed, pressure, visibility, and feels-like temperature.
* **5-Day Forecast**: Grid of daily cards with icons and temp ranges.
* **3D Earth Globe**: Loads a GLB model, auto-scales/centers it, and rotates continuously. Includes debug features like a test red sphere and green emissive glow for troubleshooting.
* **Animations & Effects**: Floating particles, glitch text, pulsing rings, and scan lines.
* **Error Handling**: Graceful fallbacks for invalid locations or API failures.
* **Auto-Init**: Defaults to "Delhi" on load.

---

## Demo
**[Live Demo](https://your-live-demo-url.com)**
* Weather Dashboard
* 3D Globe

---

## Technologies Used

| Category       | Technologies                                                                 |
|----------------|------------------------------------------------------------------------------|
| **Frontend** | HTML5, CSS3 (with custom variables and animations), Bootstrap 5                |
| **JavaScript** | Vanilla JS, Three.js (r128), `GLTFLoader`, `OrbitControls`                   |
| **Fonts** | Google Fonts: Orbitron (sci-fi titles), Rajdhani (body text)                 |
| **APIs** | OpenWeatherMap (weather data), Unsplash (background images)                  |
| **Build Tools**| None (static site; serve via Live Server or similar)                         |
| **3D Assets** | GLB model: `3d_model/earth.glb` (Earth atlas; replace as needed)               |

---

## Prerequisites
* A modern web browser (Chrome, Firefox, Safari).
* Local server for development (e.g., VS Code Live Server) to avoid CORS issues with GLB loading.
* **API Keys**:
    * **OpenWeatherMap**: Sign up at [openweathermap.org](https://openweathermap.org) and replace `WEATHER_API_KEY` in `script.js`.
    * **Unsplash**: Get a key from [unsplash.com/developers](https://unsplash.com/developers) and update `UNSPLASH_API_KEY`.

---

## Installation & Setup

1.  **Clone or Download:**
    ```bash
    git clone <your-repo-url>
    cd atmosphere-weather-dashboard
    ```

2.  **File Structure:**
    ```text
    .
    ├── index.html         
    ├── style.css          
    ├── script.js       
    ├── assets/            
    └── 3d_model/          
        └── earth.glb      
    ```

3.  **Update API Keys:**
    Open `script.js` and replace the placeholder keys:
    ```javascript
    const WEATHER_API_KEY = 'your-openweathermap-key-here';
    const UNSPLASH_API_KEY = 'your-unsplash-key-here';
    ```

4.  **Serve Locally:**
    Use a local server like VS Code's Live Server, or run a simple server from your terminal:
    ```bash
    # Using npm
    npx live-server

    # Using Python
    python -m http.server 8000
    ```
    Then, open `http://localhost:8000` (or the equivalent port) in your browser.

5.  **Optional: Deploy:**
    * **GitHub Pages**: Push to a repository and enable Pages in the settings.
    * **Netlify/Vercel**: Drag-and-drop the project folder or connect your GitHub repository for automatic deployment.
    * Ensure CORS is handled for GLB files (using relative paths usually works fine on these platforms).

---

## Usage
1.  **Launch**: Open `index.html` in a browser (via a local server).
2.  **Search**: Type a city (e.g., "London") and hit Enter or click the search icon.
3.  **View Data**: Scroll down for the 5-day forecast and the interactive globe. The page will auto-scroll to the globe after a successful search.
4.  **Interact with Globe**:
    * **Drag** to orbit around the Earth.
    * **Scroll** to zoom in and out.
    * The globe rotates automatically. A red test sphere is visible at the center in debug mode.
5.  **Mobile**: The layout is fully responsive and adjusts for smaller screens.

**Example Workflow:**
Search "New York" → Background changes to a NYC skyline → Weather data for New York loads → The 3D globe continues to spin.

---

## Troubleshooting
* **3D Globe Not Visible?**
    * Check the browser console for diagnostics (e.g., model size, scale).
    * Ensure `earth.glb` is in the `3d_model/` directory and served via HTTP (not `file://`).
    * If you don't even see the red test sphere: It might be a renderer issue. Verify the Three.js CDN is loading correctly.
    * If the model is too small/large: Adjust the `desiredSize` variable in the `loadGlobeModel()` function.

* **API Errors:**
    * **Invalid key**: Double-check your keys on the OpenWeatherMap and Unsplash dashboards.
    * **CORS**: Always use a local server for development to prevent Cross-Origin Resource Sharing errors.

* **Animations Lag:**
    * Reduce the number of particles created in the `createParticles()` function.
    * Consider disabling `OrbitControls` in a production environment if not essential.

* **Console Logs**: The `script.js` file includes several `console.log` statements for debugging. Enable them to see details about model loading, scaling, and mesh properties.

---

## Contributing
Contributions are welcome! Feel free to fork the repository and submit a pull request.

1.  Fork the repo.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

Ideas welcome: Custom themes, more 3D models, weather alerts, or even VR support!

---

## License
This project is licensed under the MIT License - see the `LICENSE` file for details.

---

## Acknowledgments
* **Three.js**: For the 3D magic.
* **OpenWeatherMap & Unsplash**: For providing the essential data.
* **Inspiration**: Cyberpunk 2077 aesthetics and futuristic sci-fi dashboards.
* **GLB Model**: Free Earth atlas (source: *your-model-source*).
---

Built by **[Azhaan Ali Siddiqui]** – October 2025