import Sidebar from '../../components/Sidebar';
import ChallengeHistoryComponent from '../../components/ChallengeHistory';

const ChallengeHistory = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isAdmin={true} />

            <div className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Challenge History</h1>
                    <p className="text-gray-600">View resolved challenges and admin performance metrics</p>
                </div>

                <ChallengeHistoryComponent />
            </div>
        </div>
    );
};

export default ChallengeHistory;
