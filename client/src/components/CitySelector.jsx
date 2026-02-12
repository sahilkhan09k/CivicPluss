import { MapPin } from 'lucide-react';
import { CITIES } from '../constants/cities';

export const CitySelector = ({ value, onChange, error, disabled = false }) => {
    return (
        <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                City *
            </label>
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <select
                    id="city"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all duration-200 appearance-none cursor-pointer"
                    required
                    disabled={disabled}
                >
                    <option value="">Select your city</option>
                    {CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
