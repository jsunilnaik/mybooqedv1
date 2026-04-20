/**
 * Improved Geolocation and Nearby Salons Fetcher
 * Improvements:
 * 1. Promisified Geolocation API for clean async/await usage.
 * 2. High accuracy and timeout configuration.
 * 3. Categorized error handling with user-friendly logs.
 * 4. Robust fetch handling (rejection on non-200 responses).
 */

async function getNearbySalons() {
    const GEOLOCATION_OPTIONS = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    /**
     * Promisified wrapper for navigator.geolocation.getCurrentPosition
     */
    const getPosition = (options) => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
                return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    };

    try {
        console.log("📍 Requesting current location...");
        const position = await getPosition(GEOLOCATION_OPTIONS);
        const { latitude: lat, longitude: lng } = position.coords;
        
        console.log(`✅ Location retrieved: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        
        // Construct the URL with query parameters
        const url = new URL('/salons', window.location.origin);
        url.searchParams.append('lat', lat);
        url.searchParams.append('lng', lng);

        console.log(`🔍 Fetching nearby salons from: ${url.pathname}${url.search}`);
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        console.group("✨ Nearby Salons Data");
        console.log("Total found:", data.length);
        console.table(data);
        console.groupEnd();

        return data;

    } catch (error) {
        // Categorized error handling
        let errorMessage = "An unknown error occurred.";

        if (error instanceof GeolocationPositionError) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Location access denied by user.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Location request timed out.";
                    break;
            }
        } else {
            errorMessage = error.message;
        }

        console.error("❌ Geolocation/Fetch Error:", errorMessage);
        alert(errorMessage); // Optional: inform the user
        throw error;
    }
}

// Usage:
// getNearbySalons().then(data => { /* Handle salons data */ });
