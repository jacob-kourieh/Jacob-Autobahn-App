import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-road-conditions',
  templateUrl: './road-conditions.component.html',
  styleUrls: ['./road-conditions.component.css'],
})
export class RoadConditionsComponent implements OnInit {
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

  ngOnInit(): void {
    this.apiService.getRoads().subscribe({
      next: (data) => {
        this.roads = data.roads;
      },
      error: (error) => console.error('Error fetching roads:', error),
    });
  }

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

  onRoadNameSelect(selectedName: string): void {
    if (selectedName === 'No matches found') {
      this.filteredWorks = [];
    } else {
      this.filteredWorks = this.roadWorks.filter(
        (condition) => condition.title === selectedName
      );
    }
  }
}
