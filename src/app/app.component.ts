import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Autobahn App';
  isHandset: boolean = false;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  links = [
    { path: '/', label: 'Home', icon: 'assets/home.png' },
    {
      path: '/road-conditions',
      label: 'Roadworks',
      icon: 'assets/roadwork.png',
    },
    { path: '/map', label: 'Map', icon: 'assets/map.png' },
    { path: '/about', label: 'About', icon: 'assets/about.png' },
    { path: '/contact', label: 'Contact', icon: 'assets/contact.png' },
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    // Observe custom breakpoint at 600px
    this.breakpointObserver
      .observe(['(max-width: 600px)'])
      .subscribe((result) => {
        this.isHandset = result.matches;
      });
  }
}
