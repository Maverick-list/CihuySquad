/**
 * Map Service - SehatKu AI
 *
 * Real-time maps integration with Google Maps JavaScript API.
 * Provides hospital and pharmacy navigation with distance matrix and directions.
 *
 * Features:
 * - Browser geolocation for user coordinates
 * - Nearby hospitals and pharmacies search
 * - Real-time distance and travel time calculation
 * - Route planning with directions service
 * - Emergency room highlighting
 */

class MapService {
    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.map = null;
        this.userLocation = null;
        this.markers = [];
        this.directionsService = null;
        this.directionsRenderer = null;

        // Initialize Google Maps services
        this.initServices();
    }

    /**
     * Initialize Google Maps services
     */
    initServices() {
        if (typeof google !== 'undefined') {
            this.directionsService = new google.maps.DirectionsService();
            this.directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: true, // We'll add custom markers
                polylineOptions: {
                    strokeColor: '#3B82F6', // Blue color for routes
                    strokeWeight: 5,
                    strokeOpacity: 0.8
                }
            });
        }
    }

    /**
     * Get user location using browser geolocation API
     * @returns {Promise<{lat: number, lng: number}>}
     */
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation tidak didukung oleh browser ini'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.userLocation = location;
                    resolve(location);
                },
                (error) => {
                    let errorMessage = 'Tidak dapat mendapatkan lokasi';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Akses lokasi ditolak. Izinkan akses lokasi untuk fitur peta.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Informasi lokasi tidak tersedia';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Waktu permintaan lokasi habis';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    /**
     * Initialize Google Map
     * @param {string} mapElementId - DOM element ID for the map
     * @param {Object} options - Map initialization options
     */
    initMap(mapElementId, options = {}) {
        const defaultOptions = {
            zoom: 15,
            center: this.userLocation || { lat: -6.2088, lng: 106.8456 }, // Jakarta default
            styles: this.getMapStyles(),
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true
        };

        const mapOptions = { ...defaultOptions, ...options };
        const mapElement = document.getElementById(mapElementId);

        if (!mapElement) {
            throw new Error(`Element dengan ID '${mapElementId}' tidak ditemukan`);
        }

        this.map = new google.maps.Map(mapElement, mapOptions);
        this.directionsRenderer.setMap(this.map);

        return this.map;
    }

    /**
     * Search for nearby hospitals and pharmacies
     * @param {Object} location - User location {lat, lng}
     * @param {string} type - 'hospital' or 'pharmacy'
     * @param {number} radius - Search radius in meters
     * @returns {Promise<Array>} Array of places
     */
    async searchNearbyPlaces(location, type = 'hospital', radius = 5000) {
        const service = new google.maps.places.PlacesService(this.map);

        const request = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: radius,
            type: type,
            keyword: type === 'hospital' ? 'rumah sakit' : 'apotek'
        };

        return new Promise((resolve, reject) => {
            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    const places = results.map(place => ({
                        id: place.place_id,
                        name: place.name,
                        address: place.vicinity,
                        location: {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        },
                        rating: place.rating || 0,
                        isOpen: place.opening_hours?.isOpen() || null,
                        types: place.types,
                        photo: place.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 300 })
                    }));
                    resolve(places);
                } else {
                    reject(new Error(`Gagal mencari ${type}: ${status}`));
                }
            });
        });
    }

    /**
     * Calculate distance and travel time using Distance Matrix API
     * @param {Object} origin - Origin location {lat, lng}
     * @param {Array} destinations - Array of destination locations
     * @param {string} travelMode - 'DRIVING', 'WALKING', 'BICYCLING', 'TRANSIT'
     * @returns {Promise<Array>} Distance matrix results
     */
    async calculateDistances(origin, destinations, travelMode = 'DRIVING') {
        const service = new google.maps.DistanceMatrixService();

        const origins = [new google.maps.LatLng(origin.lat, origin.lng)];
        const destinationPoints = destinations.map(dest =>
            new google.maps.LatLng(dest.lat, dest.lng)
        );

        const request = {
            origins: origins,
            destinations: destinationPoints,
            travelMode: google.maps.TravelMode[travelMode],
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        };

        return new Promise((resolve, reject) => {
            service.getDistanceMatrix(request, (response, status) => {
                if (status === google.maps.DistanceMatrixStatus.OK) {
                    const results = response.rows[0].elements.map((element, index) => ({
                        destination: destinations[index],
                        distance: {
                            text: element.distance?.text || 'N/A',
                            value: element.distance?.value || 0 // in meters
                        },
                        duration: {
                            text: element.duration?.text || 'N/A',
                            value: element.duration?.value || 0 // in seconds
                        },
                        status: element.status
                    }));
                    resolve(results);
                } else {
                    reject(new Error(`Gagal menghitung jarak: ${status}`));
                }
            });
        });
    }

    /**
     * Get route directions to a destination
     * @param {Object} destination - Destination location {lat, lng}
     * @param {string} travelMode - Travel mode
     * @returns {Promise<Object>} Directions result
     */
    async getDirections(destination, travelMode = 'DRIVING') {
        if (!this.directionsService || !this.userLocation) {
            throw new Error('Directions service belum diinisialisasi atau lokasi user tidak tersedia');
        }

        const request = {
            origin: new google.maps.LatLng(this.userLocation.lat, this.userLocation.lng),
            destination: new google.maps.LatLng(destination.lat, destination.lng),
            travelMode: google.maps.TravelMode[travelMode],
            optimizeWaypoints: true,
            avoidHighways: false,
            avoidTolls: false
        };

        return new Promise((resolve, reject) => {
            this.directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    // Render the route on the map
                    this.directionsRenderer.setDirections(result);

                    const route = result.routes[0];
                    const leg = route.legs[0];

                    resolve({
                        distance: leg.distance,
                        duration: leg.duration,
                        steps: leg.steps.map(step => ({
                            instructions: step.instructions,
                            distance: step.distance,
                            duration: step.duration,
                            path: step.path
                        })),
                        bounds: route.bounds,
                        copyrights: route.copyrights
                    });
                } else {
                    reject(new Error(`Gagal mendapatkan rute: ${status}`));
                }
            });
        });
    }

    /**
     * Add markers to the map
     * @param {Array} places - Array of places to mark
     * @param {string} type - 'hospital' or 'pharmacy'
     */
    addMarkers(places, type = 'hospital') {
        // Clear existing markers
        this.clearMarkers();

        const iconUrl = type === 'hospital'
            ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';

        places.forEach((place, index) => {
            const marker = new google.maps.Marker({
                position: place.location,
                map: this.map,
                title: place.name,
                icon: {
                    url: iconUrl,
                    scaledSize: new google.maps.Size(32, 32)
                },
                animation: google.maps.Animation.DROP
            });

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
                content: this.createInfoWindowContent(place, type)
            });

            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });

            this.markers.push(marker);
        });
    }

    /**
     * Highlight emergency room on map
     * @param {Object} erLocation - ER location {lat, lng}
     */
    highlightEmergencyRoom(erLocation) {
        const erMarker = new google.maps.Marker({
            position: erLocation,
            map: this.map,
            title: 'UGD - Unit Gawat Darurat',
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-pushpin.png',
                scaledSize: new google.maps.Size(40, 40)
            },
            animation: google.maps.Animation.BOUNCE,
            zIndex: 1000
        });

        // Add pulsing effect for emergency
        this.addEmergencyPulse(erLocation);

        // Center map on ER
        this.map.setCenter(erLocation);
        this.map.setZoom(18);

        this.markers.push(erMarker);

        return erMarker;
    }

    /**
     * Add emergency pulse effect
     * @param {Object} location - Location to pulse
     */
    addEmergencyPulse(location) {
        const pulseMarker = new google.maps.Marker({
            position: location,
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 0,
                fillColor: '#EF4444',
                fillOpacity: 0.5,
                strokeColor: '#DC2626',
                strokeWeight: 2
            },
            zIndex: 999
        });

        // Animate pulse
        let scale = 0;
        const pulse = () => {
            scale += 0.1;
            if (scale > 2) scale = 0;

            pulseMarker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: scale * 20,
                fillColor: '#EF4444',
                fillOpacity: 0.3 - (scale * 0.15),
                strokeColor: '#DC2626',
                strokeWeight: 1
            });

            requestAnimationFrame(pulse);
        };

        pulse();
        this.markers.push(pulseMarker);
    }

    /**
     * Clear all markers from map
     */
    clearMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
    }

    /**
     * Create info window content for places
     * @param {Object} place - Place object
     * @param {string} type - Place type
     * @returns {string} HTML content
     */
    createInfoWindowContent(place, type) {
        const typeLabel = type === 'hospital' ? 'Rumah Sakit' : 'Apotek';
        const ratingStars = '★'.repeat(Math.floor(place.rating)) + '☆'.repeat(5 - Math.floor(place.rating));

        return `
            <div class="p-3 max-w-sm">
                <h3 class="font-bold text-lg text-gray-800">${place.name}</h3>
                <p class="text-sm text-gray-600 mb-2">${typeLabel}</p>
                <p class="text-sm text-gray-700 mb-2">${place.address}</p>
                ${place.rating ? `<p class="text-sm text-yellow-600 mb-2">${ratingStars} (${place.rating})</p>` : ''}
                ${place.isOpen !== null ? `<p class="text-sm ${place.isOpen ? 'text-green-600' : 'text-red-600'}">${place.isOpen ? 'Buka' : 'Tutup'}</p>` : ''}
                <button onclick="mapService.getDirections(${place.location.lat}, ${place.location.lng})"
                        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Petunjuk Arah
                </button>
            </div>
        `;
    }

    /**
     * Get custom map styles for glassmorphism aesthetic
     * @returns {Array} Map style configuration
     */
    getMapStyles() {
        return [
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#1e3a8a' }]
            },
            {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#1f2937' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#374151' }]
            },
            {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{ color: '#4b5563' }]
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{ color: '#6b7280' }]
            }
        ];
    }

    /**
     * Smart recommendation logic
     * @param {string} severity - Green, Yellow, or Red
     * @param {Array} hospitals - Array of hospitals
     * @param {Array} pharmacies - Array of pharmacies
     * @returns {Object} Recommended places
     */
    getSmartRecommendations(severity, hospitals = [], pharmacies = []) {
        if (severity === 'Red') {
            // Recommend nearest emergency room
            return {
                type: 'emergency',
                places: hospitals.filter(h => h.types.includes('emergency_room')).slice(0, 3),
                message: 'Segera ke Unit Gawat Darurat terdekat!'
            };
        } else if (severity === 'Yellow') {
            // Recommend hospitals with specialists
            return {
                type: 'hospital',
                places: hospitals.slice(0, 5),
                message: 'Kunjungi rumah sakit terdekat untuk pemeriksaan'
            };
        } else {
            // Green - recommend pharmacies
            return {
                type: 'pharmacy',
                places: pharmacies.slice(0, 5),
                message: 'Kunjungi apotek terdekat untuk obat'
            };
        }
    }
}

// Export for use in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapService;
} else {
    window.MapService = MapService;
}