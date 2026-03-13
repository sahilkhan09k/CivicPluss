import { useState, useEffect } from 'react';
import { AlertCircle, Clock, TrendingUp, MapPin, Loader2 } from 'lucide-react';
import { GoogleMap, Marker, Circle } from '@react-google-maps/api';
import Sidebar from '../../components/Sidebar';
import GoogleMapsWrapper from '../../components/GoogleMapsWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CITY_COORDINATES } from '../../constants/cities';

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
};

// Default center (Maharashtra state center) - fallback only
const defaultCenter = {
    lat: 19.7515,
    lng: 75.7139
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        criticalUnresolved: 0,
        avgResolutionTime: '0 days',
        resolutionEfficiency: 0,
        totalIssues: 0,
        weeklyData: [],
        topProblemZones: [],
        issuesWithLocation: []
    });

    // Get map center based on admin's city
    const getMapCenter = () => {
        if (user?.city && CITY_COORDINATES[user.city]) {
            return CITY_COORDINATES[user.city];
        }
        return defaultCenter;
    };

    const mapCenter = getMapCenter();
    const mapZoom = user?.city ? 13 : 7;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch comprehensive admin stats
            const statsResponse = await apiService.getAdminStats();
            const adminStats = statsResponse.data;
            
            // Also fetch all issues for the map (if not included in stats)
            const issuesResponse = await apiService.getAllIssues();
            const allIssues = issuesResponse.data;
            
            setIssues(allIssues);
            setStats({
                criticalUnresolved: adminStats.criticalUnresolved,
                avgResolutionTime: adminStats.avgResolutionTime,
                resolutionEfficiency: adminStats.resolutionEfficiency,
                totalIssues: adminStats.totalIssues,
                weeklyData: adminStats.weeklyData || [],
                topProblemZones: adminStats.topProblemZones || [],
                issuesWithLocation: adminStats.issuesWithLocation || allIssues.filter(i => i.location?.lat && i.location?.lng)
            });
            
            // Debug logging
            console.log('Admin Dashboard Data:', {
                totalIssues: adminStats.totalIssues,
                criticalUnresolved: adminStats.criticalUnresolved,
                avgResolutionTime: adminStats.avgResolutionTime,
                resolutionEfficiency: adminStats.resolutionEfficiency,
                weeklyDataPoints: adminStats.weeklyData?.length || 0,
                problemZones: adminStats.topProblemZones?.length || 0
            });
            
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

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
            scale: 8,
        };
    };

    const getTopProblemZones = () => {
        // Use dynamic data from API
        return stats.topProblemZones || [];
    };

    const getWeeklyData = () => {
        // Use dynamic data from API
        return stats.weeklyData || [];
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
                </div>

                <Sidebar isAdmin={true} />
                <div className="relative z-10 flex-1 ml-64 p-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-primary-500 to-accent-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                            <Loader2 className="h-10 w-10 text-white animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">Loading Dashboard</h2>
                        <p className="text-gray-600 text-lg">Gathering analytics...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
                </div>

                <Sidebar isAdmin={true} />
                <div className="relative z-10 flex-1 ml-64 p-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="card-gradient text-center py-16 border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
                            <div className="bg-gradient-to-br from-red-500 to-red-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <AlertCircle className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-red-700 mb-4">Dashboard Error</h2>
                            <p className="text-red-700 text-lg mb-8">{error}</p>
                            <button 
                                onClick={fetchData}
                                className="btn-primary"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const topProblemZones = getTopProblemZones();
    const weeklyData = getWeeklyData();
    const issuesWithLocation = stats.issuesWithLocation || issues.filter(i => i.location?.lat && i.location?.lng);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
            </div>

            <Sidebar isAdmin={true} />

            <div className="relative z-10 flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 animate-fade-in">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-4 rounded-2xl shadow-lg">
                                <TrendingUp className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 bg-clip-text text-transparent tracking-tight">
                                    {user?.city ? `${user.city} Admin Dashboard` : 'Admin Dashboard'}
                                </h1>
                                <p className="text-gray-600 text-xl font-medium">
                                    {user?.city ? `${user.city} issue management and analytics` : 'City-wide issue management and analytics'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
                        <div className="stat-card group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-2 font-medium">Critical Unresolved</p>
                                    <p className="text-4xl font-black text-red-600 mb-1">{stats.criticalUnresolved}</p>
                                    <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                                </div>
                                <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <AlertCircle className="h-8 w-8 text-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-2 font-medium">Avg Resolution Time</p>
                                    <p className="text-4xl font-black text-orange-600 mb-1">{stats.avgResolutionTime}</p>
                                    <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="h-8 w-8 text-orange-600" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-2 font-medium">Resolution Efficiency</p>
                                    <p className="text-4xl font-black text-green-600 mb-1">{stats.resolutionEfficiency}%</p>
                                    <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                                </div>
                                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-2 font-medium">Total Issues</p>
                                    <p className="text-4xl font-black text-primary-600 mb-1">{stats.totalIssues}</p>
                                    <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                                </div>
                                <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <MapPin className="h-8 w-8 text-primary-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Weekly Trend */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Weekly Trend</h2>
                        {weeklyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="reported" fill="#3b82f6" name="Reported" />
                                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No data available for the past week</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Top Problem Zones */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Top 5 Problem Zones</h2>
                        {topProblemZones.length > 0 ? (
                            <div className="space-y-3">
                                {topProblemZones.map((zone, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{zone.zone}</p>
                                                <p className="text-xs text-gray-500">{zone.location}</p>
                                                <p className="text-sm text-gray-600">{zone.issues} issues</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full ${zone.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                zone.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {zone.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No problem zones identified yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Issue Density Map */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold">City Issue Density Map</h2>
                            <p className="text-sm text-gray-600">Color-coded by priority level</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span>High Priority</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                <span>Medium</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <span>Low</span>
                            </div>
                        </div>
                    </div>

                    <GoogleMapsWrapper>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={mapZoom}
                            options={{
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false,
                                fullscreenControl: true,
                            }}
                        >
                            {issuesWithLocation.map(issue => (
                                <Marker
                                    key={issue._id}
                                    position={{
                                        lat: issue.location.lat,
                                        lng: issue.location.lng
                                    }}
                                    icon={getMarkerIcon(issue.priority)}
                                    title={`${issue.priority}: ${issue.title}`}
                                />
                            ))}

                            {/* Add circles for high-density zones */}
                            {topProblemZones.slice(0, 3).map((zone, index) => {
                                // Use lat/lng from zone data if available, otherwise parse from location string
                                const lat = zone.lat || parseFloat(zone.location.split(',')[0]);
                                const lng = zone.lng || parseFloat(zone.location.split(',')[1]);
                                
                                return (
                                    <Circle
                                        key={index}
                                        center={{ lat, lng }}
                                        radius={Math.max(300, zone.issues * 100)} // Dynamic radius based on issue count
                                        options={{
                                            fillColor: zone.priority === 'high' ? '#ef4444' :
                                                zone.priority === 'medium' ? '#f59e0b' : '#10b981',
                                            fillOpacity: 0.15,
                                            strokeColor: zone.priority === 'high' ? '#ef4444' :
                                                zone.priority === 'medium' ? '#f59e0b' : '#10b981',
                                            strokeOpacity: 0.4,
                                            strokeWeight: 2,
                                        }}
                                    />
                                );
                            })}
                        </GoogleMap>
                    </GoogleMapsWrapper>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Circles indicate high-density problem zones.
                            Larger circles = more issues in that area.
                        </p>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
