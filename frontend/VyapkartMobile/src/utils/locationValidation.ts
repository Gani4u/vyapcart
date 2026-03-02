// src/utils/locationValidation.ts

/**
 * Validate latitude
 */
export const isValidLatitude = (latitude: any): boolean => {
  const num = parseFloat(latitude);
  return !isNaN(num) && num >= -90 && num <= 90;
};

/**
 * Validate longitude
 */
export const isValidLongitude = (longitude: any): boolean => {
  const num = parseFloat(longitude);
  return !isNaN(num) && num >= -180 && num <= 180;
};

/**
 * Validate delivery radius
 */
export const isValidDeliveryRadius = (radius: any): boolean => {
  const num = parseInt(radius, 10);
  return !isNaN(num) && num > 0 && num <= 100;
};

/**
 * Validate search radius
 */
export const isValidSearchRadius = (radius: any): boolean => {
  const num = parseInt(radius, 10);
  return !isNaN(num) && num > 0 && num <= 100;
};

/**
 * Validate pincode format (6 digits for India)
 */
export const isValidPincode = (pincode: string): boolean => {
  return /^[0-9]{6}$/.test(pincode.trim());
};

/**
 * Validate coordinates object
 */
export const isValidCoordinates = (
  latitude: any,
  longitude: any
): boolean => {
  return isValidLatitude(latitude) && isValidLongitude(longitude);
};

/**
 * Get validation error message
 */
export const getLocationValidationError = (
  field: string,
  value: any
): string | null => {
  switch (field) {
    case 'latitude':
      if (!isValidLatitude(value)) {
        return 'Latitude must be a number between -90 and 90';
      }
      break;

    case 'longitude':
      if (!isValidLongitude(value)) {
        return 'Longitude must be a number between -180 and 180';
      }
      break;

    case 'deliveryRadius':
      if (!isValidDeliveryRadius(value)) {
        return 'Delivery radius must be between 1 and 100 km';
      }
      break;

    case 'searchRadius':
      if (!isValidSearchRadius(value)) {
        return 'Search radius must be between 1 and 100 km';
      }
      break;

    case 'pincode':
      if (!isValidPincode(value)) {
        return 'Pincode must be exactly 6 digits';
      }
      break;

    default:
      return null;
  }

  return null;
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (latitude: number | null | undefined, longitude: number | null | undefined): string => {
  if (!latitude || !longitude) {
    return 'Location not set';
  }
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * Calculate approximate distance in km using simple formula
 * Note: This is less accurate but works without external libraries
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
