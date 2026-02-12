import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';

const Analytics = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAllIssues();
            setIssues(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch issues');
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
        const areas = ['Downtown', 'North', 'East', 'West', 'South'];
        return areas.map(area => ({
            area,
            issues: Math.floor(Math.random() * 30) + 10
        }));
    };

    const getResolutionTrend = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map(month => ({
            month,
            resolved: Math.floor(Math.random() * 20) + 40,
            reported: Math.floor(Math.random() * 20) + 45
        }));
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
    const resolutionRate = issues.length > 0 ? Math.round((resolvedCount / issues.length) * 100) : 0;

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isAdmin={true} />
                <div className="flex-1 ml-64 p-8 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isAdmin={true} />
                <div className="flex-1 ml-64 p-8">
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
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isAdmin={true} />

            <div className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
                    <p className="text-gray-600">Data-driven insights for better governance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                        <p className="text-3xl font-bold text-orange-600 mb-2">3.2d</p>
                        <div className="flex items-center text-gray-600 text-sm">
                            <span>Estimated average</span>
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
                        <h2 className="text-xl font-bold mb-4">Area-wise Issue Density</h2>
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
                    <h2 className="text-xl font-bold mb-4">Resolution Trend (6 Months)</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={resolutionTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
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
