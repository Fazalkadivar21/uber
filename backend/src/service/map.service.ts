import axios from 'axios';

export class MapService {
  private readonly mapboxToken: string;
  private readonly baseGeocodingUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private readonly baseDirectionsUrl = 'https://api.mapbox.com/directions/v5/mapbox';

  constructor(mapboxToken: string) {
    this.mapboxToken = mapboxToken;
  }

  /**
   * Convert address/place name to coordinates (lat, lng)
   */
  async getCoordinates(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const url = `${this.baseGeocodingUrl}/${encodeURIComponent(address)}.json`;
      const response = await axios.get(url, {
        params: {
          access_token: this.mapboxToken,
          limit: 1
        }
      });

      if (response.data.features.length === 0) {
        throw new Error('No coordinates found for the given address');
      }

      const [lng, lat] = response.data.features[0].geometry.coordinates;
      return { lat, lng };
    } catch (error) {
      throw new Error(`Error fetching coordinates: ${(error as Error).message}`);
    }
  }

  /**
   * Get distance and time between two locations
   */
  async getDistanceTime(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<{ distance: string; duration: string }> {
    try {
      const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
      const url = `${this.baseDirectionsUrl}/${profile}/${coords}`;

      const response = await axios.get(url, {
        params: {
          access_token: this.mapboxToken,
          overview: 'simplified',
          geometries: 'geojson'
        }
      });

      if (response.data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = response.data.routes[0];
      const distance = route.distance;
      const duration = route.duration;

      return { distance, duration };
    } catch (error) {
      throw new Error(`Error fetching distance/time: ${(error as Error).message}`);
    }
  }

  /**
   * Get place suggestions based on user input
   */
  async getSuggestions(input: string, limit: number = 5): Promise<string[]> {
    try {
      const url = `${this.baseGeocodingUrl}/${encodeURIComponent(input)}.json`;
      const response = await axios.get(url, {
        params: {
          access_token: this.mapboxToken,
          autocomplete: true,
          limit
        }
      });

      const suggestions = response.data.features.map((f: any) => f.place_name);
      return suggestions;
    } catch (error) {
      throw new Error(`Error fetching suggestions: ${(error as Error).message}`);
    }
  }
}
