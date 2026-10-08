/**
 * Calculates great-circle distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates estimated driving transit time in minutes given distance in km.
 * Assumes average urban speed with traffic density factor.
 */
export function calculateEtaMinutes(distanceKm: number, isEmergency: boolean = false): number {
  // Urban speed ~ 25 km/h standard, 35 km/h emergency with green corridor
  const averageSpeedKmh = isEmergency ? 35 : 25;
  const transitHours = distanceKm / averageSpeedKmh;
  const dispatchBufferMinutes = isEmergency ? 3 : 8;
  const totalMinutes = Math.round(transitHours * 60 + dispatchBufferMinutes);
  return Math.max(5, totalMinutes);
}
