/**
 * Location Validator Utility
 * 
 * Provides functions for validating user proximity to issue locations
 * using GPS coordinates and haversine distance calculation.
 */

/**
 * Calculate the distance between two GPS coordinates using the Haversine formula
 * 
 * The Haversine formula determines the great-circle distance between two points
 * on a sphere given their longitudes and latitudes.
 * 
 * @param {Object} coord1 - First coordinate
 * @param {number} coord1.lat - Latitude of first point (-90 to 90)
 * @param {number} coord1.lng - Longitude of first point (-180 to 180)
 * @param {Object} coord2 - Second coordinate
 * @param {number} coord2.lat - Latitude of second point (-90 to 90)
 * @param {number} coord2.lng - Longitude of second point (-180 to 180)
 * @returns {number} Distance in meters
 * 
 * @example
 * const distance = calculateDistance(
 *   { lat: 40.7128, lng: -74.0060 },  // New York
 *   { lat: 34.0522, lng: -118.2437 }  // Los Angeles
 * );
 * console.log(distance); // ~3936000 meters
 */
function calculateDistance(coord1, coord2) {
  // Earth's radius in meters
  const EARTH_RADIUS_METERS = 6371000;

  // Convert degrees to radians
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const lat1Rad = toRadians(coord1.lat);
  const lat2Rad = toRadians(coord2.lat);
  const deltaLatRad = toRadians(coord2.lat - coord1.lat);
  const deltaLngRad = toRadians(coord2.lng - coord1.lng);

  // Haversine formula
  const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in meters
  const distance = EARTH_RADIUS_METERS * c;

  return distance;
}

/**
 * Validate if a user's current location is within the allowed radius of an issue location
 * 
 * This function is used to verify that users are physically present at the issue location
 * when submitting a challenge, preventing remote challenges.
 * 
 * @param {Object} issueLocation - The original issue location
 * @param {number} issueLocation.lat - Latitude of issue location
 * @param {number} issueLocation.lng - Longitude of issue location
 * @param {Object} userLocation - The user's current location
 * @param {number} userLocation.lat - Latitude of user's current location
 * @param {number} userLocation.lng - Longitude of user's current location
 * @param {number} [radiusMeters=50] - Maximum allowed distance in meters (default: 50)
 * @returns {Object} Validation result
 * @returns {boolean} returns.valid - Whether the user is within the allowed radius
 * @returns {number} returns.distance - Actual distance in meters (rounded to 2 decimal places)
 * @returns {string} returns.message - Human-readable validation message
 * 
 * @example
 * const result = validateChallengeLocation(
 *   { lat: 40.7128, lng: -74.0060 },
 *   { lat: 40.7130, lng: -74.0062 },
 *   50
 * );
 * console.log(result);
 * // { valid: true, distance: 28.45, message: "Location verified. You are 28.45m from the issue." }
 */
function validateChallengeLocation(issueLocation, userLocation, radiusMeters = 50) {
  // Validate input coordinates
  if (!issueLocation || typeof issueLocation.lat !== 'number' || typeof issueLocation.lng !== 'number') {
    return {
      valid: false,
      distance: null,
      message: 'Invalid issue location coordinates.'
    };
  }

  if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
    return {
      valid: false,
      distance: null,
      message: 'Invalid user location coordinates.'
    };
  }

  // Validate coordinate ranges
  if (issueLocation.lat < -90 || issueLocation.lat > 90 || 
      issueLocation.lng < -180 || issueLocation.lng > 180) {
    return {
      valid: false,
      distance: null,
      message: 'Issue location coordinates out of valid range.'
    };
  }

  if (userLocation.lat < -90 || userLocation.lat > 90 || 
      userLocation.lng < -180 || userLocation.lng > 180) {
    return {
      valid: false,
      distance: null,
      message: 'User location coordinates out of valid range.'
    };
  }

  // Calculate distance
  const distance = calculateDistance(issueLocation, userLocation);
  const roundedDistance = Math.round(distance * 100) / 100; // Round to 2 decimal places

  // Validate against radius
  if (distance <= radiusMeters) {
    return {
      valid: true,
      distance: roundedDistance,
      message: `Location verified. You are ${roundedDistance}m from the issue.`
    };
  } else {
    return {
      valid: false,
      distance: roundedDistance,
      message: `You must be within ${radiusMeters} meters of the issue location to submit a challenge. Current distance: ${roundedDistance}m`
    };
  }
}

export {
  calculateDistance,
  validateChallengeLocation
};
