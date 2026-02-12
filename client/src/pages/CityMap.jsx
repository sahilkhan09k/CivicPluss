import { useState, useEffect } from 'react';
import { Filter, MapPin, Loader2, Layers } from 'lucide-react';
import { GoogleMap, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import Navbar from '../components/Navbar';
import GoogleMapsWrapper from '../components/GoogleMapsWrapper';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CITY_COORDINATES } from '../constants/cities';

const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '12px'
};

// Default center (Maharashtra state center)
const defaultCenter = {
    lat: 19.7515,
    lng: 75.7139
};

const CityMap = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [map, setMap] = useState(null);
    const [mapKey, setMapKey] = useState(0);

    const priorities = ['all', 'High', 'Medium', 'Low'];

    // Calculate map center and zoom based on user's city
    const getMapCenterAndZoom = () => {
        console.log('getMapCenterAndZoom called, user:', user);
        if (user?.city && CITY_COORDINATES[user.city]) {
            console.log(`Returning center for ${user.city}:`, CITY_COORDINATES[user.city]);
            return {
                center: CITY_COORDINATES[user.city],
                zoom: 13
            };
        }
        console.log('Returning default center');
        return {
            center: defaultCenter,
            zoom: 7
        };
    };

    const { center: mapCenter, zoom: mapZoom } = getMapCenterAndZoom();

    // Force map re-render when user changes
    useEffect(() => {
        console.log('User changed, forcing map re-render');
        setMapKey(prev => prev + 1);
    }, [user?.city]);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAllIssues();
            setIssues(response.data);
            console.log(`Loaded ${response.data.length} issues`);
        } catch (err) {
            setError(err.message || 'Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    const onMapLoad = (mapInstance) => {
        console.log('=== MAP LOAD DEBUG ===');
        console.log('Map loaded, user:', user);
        console.log('User city:', user?.city);
        console.log('City coordinates:', user?.city ? CITY_COORDINATES[user.city] : 'N/A');
        setMap(mapInstance);
        
        // Force center on user's city immediately after load
        if (user?.city && CITY_COORDINATES[user.city]) {
            const coords = CITY_COORDINATES[user.city];
            console.log(`Centering map on ${user.city}:`, coords);
            mapInstance.setCenter(coords);
            mapInstance.setZoom(13);
        } else {
            console.log('No user city or coordinates not found, using default');
        }
        console.log('=== END MAP LOAD DEBUG ===');
    };

    // Update map when user changes
    useEffect(() => {
        if (map && user?.city && CITY_COORDINATES[user.city]) {
            const coords = CITY_COORDINATES[user.city];
            console.log(`User changed, panning to ${user.city}:`, coords);
            map.panTo(coords);
            map.setZoom(13);
        }
    }, [user?.city, map]);

    // Calculate bounds for city restriction (approximately 50km radius)
    const getCityBounds = (cityName) => {
        const coords = CITY_COORDINATES[cityName];
        if (!coords) return undefined;
        
        // Approximately 0.5 degrees (~50km) in each direction
        const offset = 0.5;
        return {
            north: coords.lat + offset,
            south: coords.lat - offset,
            east: coords.lng + offset,
            west: coords.lng - offset,
        };
    };

    const filteredIssues = issues.filter(issue => {
        const priorityMatch = selectedPriority === 'all' || issue.priority === selectedPriority;
        return priorityMatch && issue.location?.lat && issue.location?.lng;
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return '#ef4444';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getMarkerIcon = (priority) => {
        return {
            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
            fillColor: getPriorityColor(priority),
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 10,
        };
    };

    // Calculate heatmap circles based on issue density
    const getHeatmapCircles = () => {
        const circles = [];
        const radius = 500; // 500 meters radius for density calculation
        
        filteredIssues.forEach((issue, index) => {
            // Count nearby issues
            const nearbyIssues = filteredIssues.filter(other => {
                if (other._id === issue._id) return false;
                const distance = getDistance(
                    issue.location.lat, issue.location.lng,
                    other.location.lat, other.location.lng
                );
                return distance <= radius;
            });

            const density = nearbyIssues.length + 1; // Include current issue
            
            circles.push({
                id: `circle-${index}`,
                center: { lat: issue.location.lat, lng: issue.location.lng },
                radius: radius,
                density: density,
                priority: issue.priority
            });
        });

        return circles;
    };

    // Calculate distance between two points in meters
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // Get circle color based on density and priority
    const getCircleOptions = (circle) => {
        let fillColor, strokeColor;
        
        // Color based on priority
        if (circle.priority === 'High') {
            fillColor = '#ef4444'; // Red
            strokeColor = '#dc2626';
        } else if (circle.priority === 'Medium') {
            fillColor = '#f59e0b'; // Yellow/Orange
            strokeColor = '#d97706';
        } else {
            fillColor = '#10b981'; // Green
            strokeColor = '#059669';
        }

        // Opacity based on density
        const opacity = Math.min(0.15 + (circle.density * 0.05), 0.4);

        return {
            fillColor,
            fillOpacity: opacity,
            strokeColor,
            strokeOpacity: 0.6,
            strokeWeight: 1,
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="card bg-red-50 border-2 border-red-200 text-center py-12">
                        <p className="text-red-700 text-lg">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        {user?.city ? `${user.city} Live Map` : 'Maharashtra Live Map'}
                    </h1>
                    <p className="text-gray-600">
                        {user?.city 
                            ? `Real-time transparency of all reported issues in ${user.city}`
                            : 'Real-time transparency of all reported issues across Maharashtra'
                        }
                    </p>
                    {/* Debug info */}
                    {user?.city && (
                        <div className="mt-2 text-sm text-gray-500">
                            Debug: User city = {user.city}, 
                            Coordinates = {CITY_COORDINATES[user.city] ? 
                                `${CITY_COORDINATES[user.city].lat}, ${CITY_COORDINATES[user.city].lng}` : 
                                'NOT FOUND'
                            },
                            Map center = {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)},
                            Zoom = {mapZoom},
                            User role = {user.role}
                            <button 
                                onClick={() => {
                                    console.log('Current user object:', user);
                                    console.log('LocalStorage user:', localStorage.getItem('user'));
                                    console.log('Map center:', mapCenter);
                                    console.log('Map zoom:', mapZoom);
                                    console.log('CITY_COORDINATES[Ratnagiri]:', CITY_COORDINATES['Ratnagiri']);
                                    if (map) {
                                        console.log('Manually centering map on Ratnagiri');
                                        map.panTo({ lat: 16.9902, lng: 73.3120 });
                                        map.setZoom(13);
                                    }
                                    alert(`User city: ${user.city}\nMap center: ${mapCenter.lat}, ${mapCenter.lng}\nClick OK and map will center on Ratnagiri`);
                                }}
                                className="ml-4 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                            >
                                Show User Data & Center Map
                            </button>
                        </div>
                    )}
                    {!user && (
                        <div className="mt-2 text-sm text-gray-500">
                            Debug: No user logged in, showing Maharashtra state view
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex items-center mb-4">
                        <Filter className="h-5 w-5 mr-2 text-gray-600" />
                        <h2 className="text-lg font-semibold">Filters & View Options</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                className="input-field"
                            >
                                {priorities.map(pri => (
                                    <option key={pri} value={pri}>
                                        {pri.charAt(0).toUpperCase() + pri.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Total Issues</label>
                            <div className="input-field bg-gray-50 flex items-center">
                                <span className="font-semibold text-primary-600">{filteredIssues.length}</span>
                                <span className="ml-2 text-gray-600">issues found</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Heatmap</label>
                            <button
                                onClick={() => setShowHeatmap(!showHeatmap)}
                                className={`w-full px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center ${
                                    showHeatmap 
                                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <Layers className="h-4 w-4 mr-2" />
                                {showHeatmap ? 'Hide Density' : 'Show Density'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Google Map */}
                <div className="card mb-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">City Issue Density Map</h3>
                        <p className="text-sm text-gray-600">
                            {user?.city ? `Focused on ${user.city}` : 'Showing all Maharashtra'}
                        </p>
                    </div>
                    <GoogleMapsWrapper>
                        <GoogleMap
                            key={mapKey}
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={mapZoom}
                            onLoad={onMapLoad}
                            options={{
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false,
                                fullscreenControl: true,
                                gestureHandling: 'greedy',
                                restriction: user?.city ? {
                                    latLngBounds: getCityBounds(user.city),
                                    strictBounds: false,
                                } : undefined,
                            }}
                        >
                            {/* Heatmap circles */}
                            {showHeatmap && getHeatmapCircles().map(circle => (
                                <Circle
                                    key={circle.id}
                                    center={circle.center}
                                    radius={circle.radius}
                                    options={getCircleOptions(circle)}
                                />
                            ))}

                            {/* Issue markers */}
                            {filteredIssues.map(issue => (
                                <Marker
                                    key={issue._id}
                                    position={{
                                        lat: issue.location.lat,
                                        lng: issue.location.lng
                                    }}
                                    icon={getMarkerIcon(issue.priority)}
                                    onClick={() => setSelectedIssue(issue)}
                                />
                            ))}

                            {selectedIssue && (
                                <InfoWindow
                                    position={{
                                        lat: selectedIssue.location.lat,
                                        lng: selectedIssue.location.lng
                                    }}
                                    onCloseClick={() => setSelectedIssue(null)}
                                >
                                    <div className="p-2 max-w-xs">
                                        <h3 className="font-bold text-lg mb-2">{selectedIssue.title}</h3>
                                        {selectedIssue.imageUrl && (
                                            <img
                                                src={selectedIssue.imageUrl}
                                                alt={selectedIssue.title}
                                                className="w-full h-32 object-cover rounded mb-2"
                                            />
                                        )}
                                        <p className="text-sm text-gray-600 mb-2">{selectedIssue.description}</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={`px-2 py-1 rounded ${selectedIssue.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                    selectedIssue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {selectedIssue.priority}
                                            </span>
                                            <span className="text-gray-600">{selectedIssue.status}</span>
                                        </div>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    </GoogleMapsWrapper>
                    <p className="text-xs text-gray-500 mt-2">
                        💡 Tip: Circles indicate high-density problem zones. Larger circles = more issues in that area.
                    </p>
                </div>

                {/* Legend */}
                <div className="card">
                    <h3 className="font-semibold mb-3">Map Legend</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Priority Markers:</p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                                    <span className="text-sm">High Priority ({issues.filter(i => i.priority === 'High').length})</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                                    <span className="text-sm">Medium Priority ({issues.filter(i => i.priority === 'Medium').length})</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm">Low Priority ({issues.filter(i => i.priority === 'Low').length})</span>
                                </div>
                            </div>
                        </div>
                        {showHeatmap && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Density Zones:</p>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-red-500 opacity-30 rounded-full mr-2"></div>
                                        <span className="text-sm">High Priority Zone</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-yellow-500 opacity-30 rounded-full mr-2"></div>
                                        <span className="text-sm">Medium Priority Zone</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-green-500 opacity-30 rounded-full mr-2"></div>
                                        <span className="text-sm">Low Priority Zone</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CityMap;
