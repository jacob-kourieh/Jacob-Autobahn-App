import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, switchMap } from 'rxjs';

interface RoadsResponse {
  roads: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Base URL for the Autobahn API.
  private baseUrl = 'https://verkehr.autobahn.de/o/autobahn';

  constructor(private http: HttpClient) {}

  // Fetches a list of roads from the API.
  getRoads(): Observable<RoadsResponse> {
    return this.http.get<RoadsResponse>(`${this.baseUrl}`);
  }

  // Fetches roadworks data for a specific road.
  getRoadWorks(roadId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${roadId}/services/roadworks`);
  }

  // Fetches parking lorry data for a specific road.
  getParkingLorry(roadId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${roadId}/services/parking_lorry`);
  }

  // Fetches data for electric charging stations for a specific road.
  getElectricChargingStations(roadId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/${roadId}/services/electric_charging_station`
    );
  }

  // Fetch all parking lorries dynamically.
  getAllParkingLorries(): Observable<any[]> {
    return this.getRoads().pipe(
      switchMap((response: RoadsResponse) => {
        const validRoads = response.roads.filter((road) => !road.includes('/'));
        const requests = validRoads.map((roadId: string) =>
          this.http.get(`${this.baseUrl}/${roadId}/services/parking_lorry`)
        );
        return forkJoin(requests);
      })
    );
  }

  // Fetch all electric charging stations dynamically.
  getAllElectricChargingStations(): Observable<any[]> {
    return this.getRoads().pipe(
      switchMap((response: RoadsResponse) => {
        const validRoads = response.roads.filter((road) => !road.includes('/'));
        const requests = validRoads.map((roadId: string) =>
          this.http.get(
            `${this.baseUrl}/${roadId}/services/electric_charging_station`
          )
        );
        return forkJoin(requests);
      })
    );
  }

  // Method to search for a location using Nominatim
  searchLocation(query: string): Observable<any[]> {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&countrycodes=de&viewbox=5.866342,47.270111,15.041896,55.058338&bounded=1`;
    return this.http.get<any[]>(nominatimUrl);
  }

  getRoute(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ): Observable<any> {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf624841fd925c6afc4d15b588bbe1158fbd15&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;
    return this.http.get(url);
  }
}
