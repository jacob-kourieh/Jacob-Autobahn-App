import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://verkehr.autobahn.de/o/autobahn';

  constructor(private http: HttpClient) {}

  getRoads(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getRoadWorks(roadId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${roadId}/services/roadworks`);
  }

  getWebcams(roadId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${roadId}/services/webcam`);
  }

  getParkingLorry(roadId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${roadId}/services/parking_lorry`);
  }

  getElectricChargingStations(roadId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/${roadId}/services/electric_charging_station`
    );
  }
}
