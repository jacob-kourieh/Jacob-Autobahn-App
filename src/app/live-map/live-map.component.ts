import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ApiService } from '../services/api.service';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
} from 'rxjs/operators';

interface AllParkingLorry {
  title: string;
  description: string[];
  coordinate: Coordinate;
}

interface AllElectricChargingStation {
  title: string;
  description: string[];
  coordinate: Coordinate;
}

interface Coordinate {
  lat: string;
  long: string;
}

declare global {
  interface Window {
    triggerParkingLoad: () => void;
    triggerChargingLoad: () => void;
    triggerLocationWatch: () => void;
  }
}

@Component({
  selector: 'app-live-map',
  templateUrl: './live-map.component.html',
  styleUrls: ['./live-map.component.css'],
})
export class LiveMapComponent implements OnInit {
  private map!: L.Map;
  markers: L.Marker[] = [];
  userLocationMarker: L.Marker | undefined;
  private L: any;
  activeButton: string | null = null;

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then((L) => {
        this.L = L.default;
        this.initializeMap();
        this.addCustomControls();
        this.triggerUserLocationWatch();
        this.addSearchControl();
      });
    }
  }

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

  private addCustomControls(): void {
    const customControl = this.L.Control.extend({
      onAdd: () => {
        const container = this.L.DomUtil.create('div', 'map-icon-group');
        container.innerHTML = `
          <button class="map-icon" onclick="javascript:window.triggerParkingLoad()">
            <img src="/assets/parking-icon.svg" alt="Parking">
          </button>
          <button class="map-icon" onclick="javascript:window.triggerChargingLoad()">
            <img src="/assets/charging-icon.svg" alt="Charging">
          </button>
          <button class="map-icon" onclick="javascript:window.triggerLocationWatch()">
            <img src="/assets/locate-icon.svg" alt="Locate">
          </button>`;
        return container;
      },
    });

    this.map.addControl(new customControl({ position: 'topright' }));

    // Bind component methods to window object
    window['triggerParkingLoad'] = this.loadAllParkingLorries.bind(this);
    window['triggerChargingLoad'] = this.loadAllChargingStations.bind(this);
    window['triggerLocationWatch'] = this.triggerUserLocationWatch.bind(this);
  }

  private addMarkersToMap(
    data: (AllParkingLorry | AllElectricChargingStation)[]
  ): void {
    this.clearMarkers();
    this.markers = data
      .map((item) => {
        const lat = parseFloat(item.coordinate.lat);
        const long = parseFloat(item.coordinate.long);

        const marker = this.L.marker([lat, long])
          .bindPopup(this.createPopupContent(item, this.currentUserLocation))
          .addTo(this.map);
        return marker;
      })
      .filter((marker) => marker);
  }

  loadAllParkingLorries(): void {
    this.activeButton = 'AllParking';
    this.resetMapView();
    this.apiService.getAllParkingLorries().subscribe({
      next: (allData) => {
        const allParkingLorries = allData
          .flatMap((data) => data.parking_lorry)
          .filter(
            (item) =>
              item.coordinate &&
              item.coordinate.lat &&
              item.coordinate.long &&
              (!this.currentPolyline ||
                this.isLocationNearRoute(
                  item.coordinate.lat,
                  item.coordinate.long
                ))
          );
        this.addMarkersToMap(allParkingLorries);
      },
      error: (error) =>
        console.error('Error loading all parking lorries:', error),
    });
  }

  loadAllChargingStations(): void {
    this.activeButton = 'AllCharging';
    this.resetMapView();
    this.apiService.getAllElectricChargingStations().subscribe({
      next: (allData) => {
        const allChargingStations = allData
          .flatMap((data) => data.electric_charging_station)
          .filter(
            (item) =>
              item.coordinate &&
              item.coordinate.lat &&
              item.coordinate.long &&
              (!this.currentPolyline ||
                this.isLocationNearRoute(
                  item.coordinate.lat,
                  item.coordinate.long
                ))
          );
        this.addMarkersToMap(allChargingStations);
      },
      error: (error) =>
        console.error('Error loading all electric charging stations:', error),
    });
  }

  private resetMapView(): void {
    // Reset to the default location and zoom level
    this.map.setView([51.1657, 10.4515], 5);
  }

  private isLocationNearRoute(lat: number, lng: number): boolean {
    if (!this.currentPolyline) return false;
    const location = this.L.latLng(lat, lng);
    return this.currentPolyline
      .getLatLngs()
      .some((routePoint) => location.distanceTo(routePoint) < 5000);
  }

  //method to trigger user location watch on a user action
  triggerUserLocationWatch(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updateUserLocation(position);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  // Method to update user location
  // Define a property to store the current user location
  currentUserLocation: { lat: number; lng: number } | undefined;

  private updateUserLocation(position: GeolocationPosition): void {
    const { latitude, longitude } = position.coords;
    const customIcon = this.L.icon({
      iconUrl: '/assets/location-circle.svg',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Update the currentUserLocation
    this.currentUserLocation = { lat: latitude, lng: longitude };

    if (this.userLocationMarker) {
      this.userLocationMarker.setLatLng([latitude, longitude]);
      this.userLocationMarker.setIcon(customIcon);
    } else {
      this.userLocationMarker = this.L.marker([latitude, longitude], {
        title: 'Your Location',
        icon: customIcon,
      }).addTo(this.map);
    }
    this.map.setView([latitude, longitude], 13);
  }

  private createPopupContent(
    item: AllParkingLorry | AllElectricChargingStation,
    userLocation: { lat: number; lng: number } | undefined
  ): string {
    const descriptionContent = item.description.join('<br>');
    let googleMapsLink = '#';
    if (userLocation) {
      googleMapsLink = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${item.coordinate.lat},${item.coordinate.long}&travelmode=driving`;
    }
    return `<div>
              <h3>${item.title}</h3>
              <p>${descriptionContent}</p>
              <a href="${googleMapsLink}" target="_blank">Navigate Here</a>
            </div>`;
  }

  private clearMarkers(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  private clearMapData(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    if (this.currentPolyline) {
      this.map.removeLayer(this.currentPolyline);
      this.currentPolyline = null;
    }
    if (this.endLocationMarker) {
      this.map.removeLayer(this.endLocationMarker);
      this.endLocationMarker = null;
    }
  }

  private addSearchControl(): void {
    const searchControl = this.L.Control.extend({
      onAdd: () => {
        const container = this.L.DomUtil.create('div', 'search-control');
        container.innerHTML = `
        <input type="text" id="searchInput" placeholder="Search location..." class="search-input">
        <button id="clearButton" class="clear-button">X</button>
        <div id="searchResults" class="search-results"></div>`;

        const searchInput = container.querySelector(
          '#searchInput'
        ) as HTMLInputElement;
        const clearButton = container.querySelector(
          '#clearButton'
        ) as HTMLButtonElement;
        const searchResultsDiv = container.querySelector(
          '#searchResults'
        ) as HTMLDivElement;
        fromEvent(searchInput, 'input')
          .pipe(
            debounceTime(500),
            map((event: Event) => (event.target as HTMLInputElement).value),
            filter((value) => value.length > 2 || value.length === 0),
            distinctUntilChanged(),
            switchMap((query) =>
              query ? this.apiService.searchLocation(query) : []
            )
          )
          .subscribe((results) => {
            this.displaySearchResults(results, searchResultsDiv);
          });

        clearButton.addEventListener('click', () => {
          searchInput.value = '';
          searchResultsDiv.innerHTML = '';
          this.clearMapData();
        });

        return container;
      },
    });

    this.map.addControl(new searchControl());
  }

  private displaySearchResults(
    results: any[],
    container: HTMLDivElement
  ): void {
    container.innerHTML = '';
    results.forEach((result) => {
      const resultElement = document.createElement('div');
      resultElement.className = 'search-result-item';
      resultElement.textContent = result.display_name;
      resultElement.onclick = () => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        this.drawLine({ lat, lng });
        container.innerHTML = '';
      };
      container.appendChild(resultElement);
    });
  }

  private currentPolyline: L.Polyline | null = null;
  private endLocationMarker: L.Marker | null = null;

  private drawLine(destination: { lat: number; lng: number }): void {
    if (!this.currentUserLocation) {
      console.error('Current user location is not available.');
      return;
    }

    // Clear the existing end location marker if it exists
    if (this.endLocationMarker) {
      this.map.removeLayer(this.endLocationMarker);
      this.endLocationMarker = null;
    }

    // Clear existing markers for parking and charging stations
    this.clearMarkers();

    this.apiService.getRoute(this.currentUserLocation, destination).subscribe(
      (route) => {
        if (route.features) {
          const coordinates = route.features[0].geometry.coordinates;
          const latLngs = coordinates.map((coord: [number, number]) => [
            coord[1],
            coord[0],
          ]);
          if (this.currentPolyline) {
            this.map.removeLayer(this.currentPolyline);
          }
          this.currentPolyline = this.L.polyline(latLngs, {
            color: 'red',
          }).addTo(this.map);

          if (this.currentPolyline) {
            this.map.fitBounds(this.currentPolyline.getBounds());
          }

          // Create a default icon for the end location marker
          const defaultIcon = this.L.icon({
            iconRetinaUrl:
              'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl:
              'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl:
              'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41],
          });

          // Add a marker at the end location using the destination coordinates
          this.endLocationMarker = this.L.marker(
            [destination.lat, destination.lng],
            { icon: defaultIcon }
          ).addTo(this.map);
        }
      },
      (error) => {
        console.error('Error fetching route:', error);
      }
    );
  }
}
