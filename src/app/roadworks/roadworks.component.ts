import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-roadworks',
  templateUrl: './roadworks.component.html',
  styleUrls: ['./roadworks.component.css'],
})
export class RoadWorksComponent implements OnInit {
  roads: string[] = [];
  selectedRoad!: string;
  roadWorks: any[] = [];
  filteredWorks: any[] = [];

  roadNameControl = new FormControl();
  filteredRoadNames: Observable<string[]>;

  constructor(private apiService: ApiService) {
    this.filteredRoadNames = this.roadNameControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterRoadNames(value))
    );
  }

  // Fetches the list of roads from the API.
  ngOnInit(): void {
    this.apiService.getRoads().subscribe({
      next: (data) => {
        this.roads = data.roads;
      },
      error: (error) => console.error('Error fetching roads:', error),
    });
  }

  // Called when a road is selected.
  //Fetches road works for the selected road.
  onSelectRoad(): void {
    if (this.selectedRoad) {
      this.apiService.getRoadWorks(this.selectedRoad).subscribe({
        next: (data) => {
          this.roadWorks = data.roadworks;
          this.filteredWorks = [...this.roadWorks];
          this.roadNameControl.setValue('');
        },
        error: (error) =>
          console.error('Error fetching road conditions:', error),
      });
    }
  }

  // Filters the road location/names based on the input value.
  private _filterRoadNames(value: string): string[] {
    const filterValue = value.toLowerCase();
    let filtered = this.roadWorks
      .map((condition) => condition.title)
      .filter((title) => title.toLowerCase().includes(filterValue));
    if (filtered.length === 0) {
      filtered = ['No matches found'];
    }
    return filtered;
  }

  // Sets the filtered roadworks when a specific location/road name is selected.
  onRoadNameSelect(selectedName: string): void {
    if (selectedName === 'No matches found') {
      this.filteredWorks = [];
    } else {
      this.filteredWorks = this.roadWorks.filter(
        (condition) => condition.title === selectedName
      );
    }
  }

  // Clears the filter input and resets the filtered roadworks.
  clearFilter(event: MouseEvent): void {
    event.stopPropagation();
    this.roadNameControl.setValue('');
    this.filteredWorks = [...this.roadWorks];
  }
}
