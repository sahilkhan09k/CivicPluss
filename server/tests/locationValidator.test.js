/**
 * Unit tests for Location Validator
 * 
 * Tests the haversine distance calculation and location validation logic
 * 
 * Note: This file uses Jest syntax. To run tests, install Jest:
 * npm install --save-dev jest @types/jest
 * 
 * Add to package.json scripts:
 * "test": "jest"
 */

import { calculateDistance, validateChallengeLocation } from '../utils/locationValidator.js';

describe('Location Validator', () => {
  describe('calculateDistance', () => {
    test('should calculate distance between two known locations accurately', () => {
      // New York to Los Angeles (approximately 3936 km)
      const nyc = { lat: 40.7128, lng: -74.0060 };
      const la = { lat: 34.0522, lng: -118.2437 };
      
      const distance = calculateDistance(nyc, la);
      
      // Should be approximately 3936000 meters (allow 1% margin)
      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(3970000);
    });

    test('should return 0 for identical coordinates', () => {
      const coord = { lat: 40.7128, lng: -74.0060 };
      
      const distance = calculateDistance(coord, coord);
      
      expect(distance).toBe(0);
    });

    test('should calculate short distances accurately', () => {
      // Two points approximately 100 meters apart
      const point1 = { lat: 40.7128, lng: -74.0060 };
      const point2 = { lat: 40.7137, lng: -74.0060 }; // ~100m north
      
      const distance = calculateDistance(point1, point2);
      
      // Should be approximately 100 meters (allow 10m margin)
      expect(distance).toBeGreaterThan(90);
      expect(distance).toBeLessThan(110);
    });

    test('should handle coordinates at the equator', () => {
      const point1 = { lat: 0, lng: 0 };
      const point2 = { lat: 0, lng: 1 };
      
      const distance = calculateDistance(point1, point2);
      
      // 1 degree at equator is approximately 111 km
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    test('should handle coordinates near the poles', () => {
      const point1 = { lat: 89, lng: 0 };
      const point2 = { lat: 89, lng: 180 };
      
      const distance = calculateDistance(point1, point2);
      
      // Distance should be relatively small near poles
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(500000);
    });

    test('should handle negative coordinates', () => {
      const point1 = { lat: -33.8688, lng: 151.2093 }; // Sydney
      const point2 = { lat: -37.8136, lng: 144.9631 }; // Melbourne
      
      const distance = calculateDistance(point1, point2);
      
      // Should be approximately 714 km
      expect(distance).toBeGreaterThan(700000);
      expect(distance).toBeLessThan(730000);
    });
  });

  describe('validateChallengeLocation', () => {
    test('should validate location within 50m radius', () => {
      const issueLocation = { lat: 40.7128, lng: -74.0060 };
      const userLocation = { lat: 40.7130, lng: -74.0061 }; // ~25m away
      
      const result = validateChallengeLocation(issueLocation, userLocation, 50);
      
      expect(result.valid).toBe(true);
      expect(result.distance).toBeLessThan(50);
      expect(result.message).toContain('Location verified');
    });

    test('should reject location beyond 50m radius', () => {
      const issueLocation = { lat: 40.7128, lng: -74.0060 };
      const userLocation = { lat: 40.7140, lng: -74.0060 }; // ~133m away
      
      const result = validateChallengeLocation(issueLocation, userLocation, 50);
      
      expect(result.valid).toBe(false);
      expect(result.distance).toBeGreaterThan(50);
      expect(result.message).toContain('must be within 50 meters');
      expect(result.message).toContain('Current distance');
    });

    test('should accept location exactly at 50m boundary', () => {
      const issueLocation = { lat: 40.7128, lng: -74.0060 };
      // Calculate a point approximately 50m away
      const userLocation = { lat: 40.71325, lng: -74.0060 }; // ~50m north
      
      const result = validateChallengeLocation(issueLocation, userLocation, 50);
      
      // Should be valid at exactly 50m
      expect(result.distance).toBeLessThanOrEqual(51); // Allow small margin
      expect(result.distance).toBeGreaterThan(48);
    });

    test('should use custom radius when provided', () => {
      const issueLocation = { lat: 40.7128, lng: -74.0060 };
      const userLocation = { lat: 40.7138, lng: -74.0060 }; // ~111m away
      
      const result = validateChallengeLocation(issueLocation, userLocation, 150);
      
      expect(result.valid).toBe(true);
      expect(result.message).toContain('Location verified');
    });

    test('should default to 50m radius when not specified', () => {
      const issueLocation = { lat: 40.7128, lng: -74.0060 };
      const userLocation = { lat: 40.7140, lng: -74.0060 }; // ~133m away
      
      const result = validateChallengeLocation(issueLocation, userLocation);
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('50 meters');
    });

    test('should round distance to 2 decimal places', () => {
      const issueLocation = { lat: 40.7128, lng: -74.0060 };
      const userLocation = { lat: 40.71285, lng: -74.00605 };
      
      const result = validateChallengeLocation(issueLocation, userLocation, 50);
      
      // Check that distance has at most 2 decimal places
      const decimalPlaces = (result.distance.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    test('should reject invalid issue location coordinates', () => {
      const invalidIssueLocation = { lat: 'invalid', lng: -74.0060 };
      const userLocation = { lat: 40.7128, lng: -74.0060 };
      
      const result = validateChallengeLocation(invalidIssueLocation, userLocation, 50);
      
      expect(result.valid).toBe(false);
      expect(result.distance).toBeNull();
      expect(result.message).toContain('Invalid issue location');
    });

    test('should reject invalid user location coordinates', () => {
      const issueLocation = { lat: 40.7128, lng: -74.0060 };
      const invalidUserLocation = { lat: 40.7128, lng: null };
      
      const result = validateChallengeLocation(issueLocation, invalidUserLocation, 50);
      
      expect(result.valid).toBe(false);
      expect(result.distance).toBeNull();
      expect(result.message).toContain('Invalid user location');
    });

    test('should reject missing location objects', () => {
      const issueLocation = { lat: 40.7128, lng: -74.0060 };
      
      const result = validateChallengeLocation(issueLocation, null, 50);
      
      expect(result.valid).toBe(false);
      expect(result.distance).toBeNull();
      expect(result.message).toContain('Invalid user location');
    });

    test('should reject coordinates out of valid range', () => {
      const issueLocation = { lat: 91, lng: -74.0060 }; // Invalid latitude
      const userLocation = { lat: 40.7128, lng: -74.0060 };
      
      const result = validateChallengeLocation(issueLocation, userLocation, 50);
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('out of valid range');
    });

    test('should reject longitude out of valid range', () => {
      const issueLocation = { lat: 40.7128, lng: -74.0060 };
      const userLocation = { lat: 40.7128, lng: 181 }; // Invalid longitude
      
      const result = validateChallengeLocation(issueLocation, userLocation, 50);
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('out of valid range');
    });

    test('should handle identical locations', () => {
      const location = { lat: 40.7128, lng: -74.0060 };
      
      const result = validateChallengeLocation(location, location, 50);
      
      expect(result.valid).toBe(true);
      expect(result.distance).toBe(0);
      expect(result.message).toContain('Location verified');
    });
  });
});
