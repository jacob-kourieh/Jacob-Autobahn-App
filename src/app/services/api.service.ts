import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Base URL for the Autobahn API.
  private baseUrl = 'https://verkehr.autobahn.de/o/autobahn';

  constructor(private http: HttpClient) {}

  // Fetches a list of roads from the API.
  getRoads(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
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
}
