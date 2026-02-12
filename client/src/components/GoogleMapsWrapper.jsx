import { useLoadScript } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

const libraries = ['visualization', 'places'];

const GoogleMapsWrapper = ({ children }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    if (loadError) {
        return (
            <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
                <div className="text-center">
                    <p className="text-red-700 font-semibold mb-2">Error loading Google Maps</p>
                    <p className="text-sm text-red-600">Please check your API key configuration</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading Google Maps...</p>
                </div>
            </div>
        );
    }

    return children;
};

export default GoogleMapsWrapper;
