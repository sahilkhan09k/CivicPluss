import { AlertCircle, CheckCircle, Brain, Users } from 'lucide-react';
import Navbar from '../components/Navbar';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-8">About CivicPulse</h1>

                {/* Problem Statement */}
                <section className="card mb-8">
                    <div className="flex items-start space-x-4 mb-6">
                        <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold mb-4">The Problem</h2>
                            <div className="space-y-3 text-gray-700">
                                <p>Current civic complaint systems are broken:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Manual categorization leads to delays and errors</li>
                                    <li>No transparency - citizens don't know if issues are being addressed</li>
                                    <li>Fake reports waste resources and time</li>
                                    <li>No data-driven prioritization</li>
                                    <li>Poor accountability and trust metrics</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Solution */}
                <section className="card mb-8">
                    <div className="flex items-start space-x-4 mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Why CivicPulse is Different</h2>
                            <div className="space-y-4 text-gray-700">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">AI-Powered Intelligence</h3>
                                    <p>Machine learning automatically categorizes issues, detects priorities, and suggests optimal resolution paths. No more manual sorting through hundreds of complaints.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Complete Transparency</h3>
                                    <p>Public live map shows all issues in real-time. Citizens can track their reports from submission to resolution, building trust in governance.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Community Verification</h3>
                                    <p>Crowd-sourced validation prevents fake reports. Multiple citizens can confirm issues and add supporting evidence, ensuring authenticity.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Data-Driven Decisions</h3>
                                    <p>Advanced analytics identify problem zones, track resolution efficiency, and provide actionable insights for better resource allocation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Smart City Alignment */}
                <section className="card mb-8">
                    <div className="flex items-start space-x-4">
                        <Brain className="h-8 w-8 text-primary-600 flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Smart City + AI Alignment</h2>
                            <p className="text-gray-700 mb-4">
                                CivicPulse is built for the future of urban governance:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">IoT Integration Ready</h3>
                                    <p className="text-sm text-gray-600">Connect with smart sensors and city infrastructure</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Predictive Analytics</h3>
                                    <p className="text-sm text-gray-600">Forecast issues before they become critical</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Open Data Standards</h3>
                                    <p className="text-sm text-gray-600">API-first architecture for third-party integration</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Scalable Infrastructure</h3>
                                    <p className="text-sm text-gray-600">Cloud-native design handles cities of any size</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Impact */}
                <section className="card">
                    <div className="flex items-start space-x-4">
                        <Users className="h-8 w-8 text-primary-600 flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Our Impact</h2>
                            <div className="grid grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-3xl font-bold text-primary-600 mb-2">60%</div>
                                    <div className="text-sm text-gray-600">Faster Resolution</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                                    <div className="text-sm text-gray-600">Citizen Satisfaction</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-orange-600 mb-2">40%</div>
                                    <div className="text-sm text-gray-600">Cost Reduction</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
