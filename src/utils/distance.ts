/**
  Haversine formula for calculating distance between two coordinates in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number | null | undefined,
  lon2: number | null | undefined
): number {
  if (lat2 === null || lon2 === null || lat2 === undefined || lon2 === undefined || isNaN(lat2) || isNaN(lon2)) {
    return Infinity;
  }
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
  Format distance meters to user friendly text
 */
export function formatDistance(meters?: number): string {
  if (meters === undefined || meters === null || isNaN(meters) || meters === Infinity) {
    return '無精確定位';
  }
  if (meters < 1000) {
    return `${meters} 公尺`;
  }
  return `${(meters / 1000).toFixed(1)} 公里`;
}

/**
  Format date string to HH:mm:ss format
 */
export function formatTime(isoOrTimeString?: string): string {
  if (!isoOrTimeString) return new Date().toLocaleTimeString('zh-TW', { hour12: false });
  try {
    const d = new Date(isoOrTimeString);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('zh-TW', { hour12: false });
    }
    return isoOrTimeString;
  } catch {
    return isoOrTimeString;
  }
}
