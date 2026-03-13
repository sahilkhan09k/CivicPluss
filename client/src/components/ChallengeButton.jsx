import { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

const ChallengeButton = ({ issue, onChallengeClick, userHasSubmittedChallenge = false }) => {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isWithinWindow, setIsWithinWindow] = useState(false);

    useEffect(() => {
        // Check if issue has an admin decision timestamp
        if (!issue?.adminDecisionTimestamp) {
            setIsWithinWindow(false);
            return;
        }

        const calculateTimeRemaining = () => {
            const decisionTime = new Date(issue.adminDecisionTimestamp).getTime();
            const currentTime = Date.now();
            const elapsed = currentTime - decisionTime;
            const windowDuration = 86400000; // 24 hours in milliseconds (86400 seconds * 1000)
            
            const remaining = windowDuration - elapsed;
            
            if (remaining > 0) {
                setTimeRemaining(remaining);
                setIsWithinWindow(true);
            } else {
                setTimeRemaining(0);
                setIsWithinWindow(false);
            }
        };

        // Calculate immediately
        calculateTimeRemaining();

        // Update every second
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [issue?.adminDecisionTimestamp]);

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Don't render if not within challenge window
    if (!isWithinWindow) {
        return null;
    }

    // Don't show "Challenge Already Submitted" if challenge has been resolved by super admin
    if (issue?.challengeResolved) {
        return null;
    }

    // Show "Challenge Already Submitted" message if user has already submitted
    if (userHasSubmittedChallenge) {
        return (
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-400 rounded-full"></div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-indigo-400 rounded-full"></div>
                </div>
                
                <div className="relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-xl shadow-md mr-4">
                                <AlertCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    Challenge Already Submitted
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Your challenge is under review by the super admin
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-purple-100">
                            <div className="text-right">
                                <div className="text-lg font-mono font-bold text-purple-700">
                                    {formatTime(timeRemaining)}
                                </div>
                                <p className="text-xs text-purple-600">remaining</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                        <p className="text-sm text-gray-700">
                            ✅ Your challenge has been submitted and is awaiting super admin review. 
                            You will be notified once a decision is made.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-400 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-amber-400 rounded-full"></div>
            </div>
            
            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl shadow-md mr-4">
                            <AlertCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                Challenge Admin Decision
                            </h3>
                            <p className="text-sm text-gray-600">
                                Dispute this decision with photo evidence
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-4 border border-orange-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 text-orange-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Time Remaining</p>
                                <p className="text-xs text-gray-500">24-hour challenge window</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-mono font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-lg">
                                {formatTime(timeRemaining)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        <p>• Location verification required (50m radius)</p>
                        <p>• Live photo capture only</p>
                        <p>• AI similarity analysis</p>
                    </div>
                    <button
                        onClick={onChallengeClick}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
                    >
                        <AlertCircle className="h-4 w-4" />
                        <span>Submit Challenge</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChallengeButton;
