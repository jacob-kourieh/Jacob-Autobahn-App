import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Jacob-Autobahn-App';
  isHandset: boolean = false;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private breakpointObserver: BreakpointObserver) {
    // Observe custom breakpoint at 600px
    this.breakpointObserver
      .observe(['(max-width: 600px)'])
      .subscribe((result) => {
        this.isHandset = result.matches;
      });
  }
}
