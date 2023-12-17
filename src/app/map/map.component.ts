import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ApiService } from '../services/api.service';
import { isPlatformBrowser } from '@angular/common';
import { FormControl } from '@angular/forms';

interface ParkingLorry {
  title: string;
  description: string[];
  coordinate: { lat: string; long: string };
}

interface ElectricChargingStation {
  title: string;
  description: string[];
  coordinate: { lat: string; long: string };
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  private map: any;
  markers: any[] = [];
  private L: any;
  roads: string[] = [];
  selectedRoad = new FormControl('');
  isDataLoaded = false;
  activeButton: string | null = null;

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Initializes the map when the component is loaded.
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then((L) => {
        this.L = L.default;
        this.initializeMap();
        this.loadRoads();
        this.setupRoadSelectionListener();
      });
    }
  }

  // Sets up the map with default settings and tiles.
  private initializeMap(): void {
    const defaultIcon = this.L.icon({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    this.L.Marker.prototype.options.icon = defaultIcon;

    // Set the initial view of the map to a location in Germany (coordinates for central Germany) with a zoom level of 5.
    this.map = this.L.map('map').setView([51.1657, 10.4515], 5);
    this.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  // Fetches the list of roads from the API.
  private loadRoads(): void {
    this.apiService.getRoads().subscribe({
      next: (data) => (this.roads = data.roads),
      error: (error) => console.error('Error fetching roads:', error),
    });
  }

  // Removes all markers from the map.
  private clearMarkers(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  // Zooms into the map and sets markers based on provided data.
  private zoomAndSetMarkers(data: any[], coordinateKey: string): void {
    if (data.length > 0 && this.map) {
      const firstLocation = data[0][coordinateKey];
      this.map.setView(
        [parseFloat(firstLocation.lat), parseFloat(firstLocation.long)],
        7
      );
      this.markers = data.map((item) => {
        const marker = this.L.marker([
          parseFloat(item[coordinateKey].lat),
          parseFloat(item[coordinateKey].long),
        ])
          .bindPopup(this.createPopupContent(item))
          .addTo(this.map);
        return marker;
      });
    }
    this.isDataLoaded = true;
  }

  //Sets up a listener for changes in the selected road.
  private setupRoadSelectionListener(): void {
    this.selectedRoad.valueChanges.subscribe((value) => {
      if (value) {
        this.activeButton = null;
        this.clearMarkers();
        this.isDataLoaded = false;
      }
    });
  }

  // Loads parking lorries on the map for the selected road.
  loadParkingLorries(): void {
    this.activeButton = 'parkingLorries';
    if (this.selectedRoad.value) {
      this.isDataLoaded = false;
      this.clearMarkers();
      this.apiService.getParkingLorry(this.selectedRoad.value).subscribe({
        next: (data) =>
          this.zoomAndSetMarkers(data.parking_lorry, 'coordinate'),
        error: (error) => {
          console.error('Error loading parking lorries:', error);
          this.isDataLoaded = true;
        },
      });
    }
  }

  // Loads electric charging stations on the map for the selected road.
  loadElectricChargingStations(): void {
    this.activeButton = 'chargingStations';
    if (this.selectedRoad.value) {
      this.isDataLoaded = false;
      this.clearMarkers();
      this.apiService
        .getElectricChargingStations(this.selectedRoad.value)
        .subscribe({
          next: (data) =>
            this.zoomAndSetMarkers(
              data.electric_charging_station,
              'coordinate'
            ),
          error: (error) => {
            console.error('Error loading electric charging stations:', error);
            this.isDataLoaded = true;
          },
        });
    }
  }

  // Creates HTML content for a popup on the map markers.
  private createPopupContent(
    item: ParkingLorry | ElectricChargingStation
  ): string {
    const descriptionContent = item.description.join('<br>');
    return `<div><h3>${item.title}</h3><p>${descriptionContent}</p></div>`;
  }
}
