/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Represents a meeting place with location and name
 */
export interface MeetingPlace {
  /**
   * The name of the meeting place.
   */
  name: string;
  /**
   * The location of the meeting place
   */
  location: Location;
}

/**
 * Asynchronously retrieves meeting places for a given location.
 *
 * @param location The location for which to retrieve meeting places.
 * @returns A promise that resolves to a list of meeting places.
 */
export async function getMeetingPlaces(location: Location): Promise<MeetingPlace[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      name: 'Starbucks',
      location: { lat: 37.7749, lng: -122.4194 },
    },
    {
      name: 'Public Library',
      location: { lat: 37.7833, lng: -122.4167 },
    },
  ];
}
