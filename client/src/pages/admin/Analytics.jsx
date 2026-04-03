import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Analytics = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [adminStats, setAdminStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [issuesResponse, statsResponse] = await Promise.all([
                apiService.getAllIssues(),
                apiService.getAdminStats()
            ]);
            setIssues(issuesResponse.data);
            setAdminStats(statsResponse.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryData = () => {
        const priorities = {};
        issues.forEach(issue => {
            priorities[issue.priority] = (priorities[issue.priority] || 0) + 1;
        });
        return Object.entries(priorities).map(([name, value]) => ({ name, value }));
    };

    const getAreaData = () => {
        if (!adminStats?.topProblemZones) return [];
        return adminStats.topProblemZones.map(zone => ({
            area: zone.zone,
            issues: zone.issues
        }));
    };

    const getResolutionTrend = () => {
        if (!adminStats?.weeklyData) return [];
        return adminStats.weeklyData.map(day => ({
            day: day.day,
            reported: day.reported,
            resolved: day.resolved
        }));
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
    const resolutionRate = issues.length > 0 ? Math.round((resolvedCount / issues.length) * 100) : 0;

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
                <Sidebar isAdmin={true} />
                <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
                <Sidebar isAdmin={true} />
                <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0">
                    <div className="card bg-red-50 border-2 border-red-200 text-center py-12">
                        <p className="text-red-700 text-lg">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const categoryData = getCategoryData();
    const areaData = getAreaData();
    const resolutionTrend = getResolutionTrend();

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
            <Sidebar isAdmin={true} />

            <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0 overflow-x-hidden">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {user?.role === 'super_admin' ? 'State Analytics & Reports' : 'Analytics & Reports'}
                    </h1>
                    <p className="text-gray-600">
                        {user?.role === 'super_admin' 
                            ? 'State-wide insights for governance oversight and quality monitoring'
                            : 'Data-driven insights for better governance'
                        }
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
                    <div className="card">
                        <p className="text-gray-600 text-sm mb-1">Total Issues</p>
                        <p className="text-3xl font-bold text-primary-600 mb-2">{issues.length}</p>
                        <div className="flex items-center text-green-600 text-sm">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>Active tracking</span>
                        </div>
                    </div>

                    <div className="card">
                        <p className="text-gray-600 text-sm mb-1">Resolution Rate</p>
                        <p className="text-3xl font-bold text-green-600 mb-2">{resolutionRate}%</p>
                        <div className="flex items-center text-green-600 text-sm">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>{resolvedCount} resolved</span>
                        </div>
                    </div>

                    <div className="card">
                        <p className="text-gray-600 text-sm mb-1">Avg Response Time</p>
                        <p className="text-3xl font-bold text-orange-600 mb-2">
                            {adminStats?.avgResolutionTime || '0 days'}
                        </p>
                        <div className="flex items-center text-gray-600 text-sm">
                            <span>Dynamic average</span>
                        </div>
                    </div>

                    <div className="card">
                        <p className="text-gray-600 text-sm mb-1">Citizen Satisfaction</p>
                        <p className="text-3xl font-bold text-purple-600 mb-2">4.2/5</p>
                        <div className="flex items-center text-green-600 text-sm">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>High rating</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Issues by Priority</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Top Problem Zones</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={areaData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="area" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="issues" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Weekly Activity Trend</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={resolutionTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="reported" stroke="#f59e0b" strokeWidth={2} name="Reported" />
                            <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;





