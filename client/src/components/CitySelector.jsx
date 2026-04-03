import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Search, X } from 'lucide-react';
import { CITIES } from '../constants/cities';

export const CitySelector = ({ value, onChange, error, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCities, setFilteredCities] = useState(CITIES);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Filter cities based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCities(CITIES);
        } else {
            const filtered = CITIES.filter(city =>
                city.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCities(filtered);
        }
    }, [searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleCitySelect = (city) => {
        onChange(city);
        setIsOpen(false);
        setSearchTerm('');
    };

    const clearSelection = () => {
        onChange('');
        setSearchTerm('');
    };

    return (
        <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                City *
            </label>
            <div className="relative" ref={dropdownRef}>
                <div
                    className={`w-full pl-12 pr-12 py-3 bg-white border-2 rounded-xl outline-none transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        disabled 
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                            : isOpen 
                                ? 'border-primary-400 ring-4 ring-primary-100' 
                                : error 
                                    ? 'border-red-400' 
                                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                    <span className={`flex-1 ${value ? 'text-gray-900' : 'text-gray-500'}`}>
                        {value || 'Select your city'}
                    </span>
                    <div className="flex items-center space-x-2">
                        {value && !disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearSelection();
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        )}
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search cities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Cities List */}
                        <div className="max-h-60 overflow-y-auto">
                            {filteredCities.length > 0 ? (
                                filteredCities.map(city => (
                                    <button
                                        key={city}
                                        type="button"
                                        onClick={() => handleCitySelect(city)}
                                        className={`w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors duration-150 ${
                                            value === city ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-700'
                                        }`}
                                    >
                                        {city}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                    No cities found matching "{searchTerm}"
                                </div>
                            )}
                        </div>

                        {/* Footer with count */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-center">
                            {filteredCities.length} of {CITIES.length} cities
                        </div>
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
