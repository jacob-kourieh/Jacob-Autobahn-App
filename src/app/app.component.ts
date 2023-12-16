import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Autobahn App';
  isHandset: boolean = false;
  currentUrl: string = '';

  @ViewChild('sidenav') sidenav!: MatSidenav;

  // Navigation links for the side navigation
  links = [
    { path: '/', label: 'Home', icon: 'assets/home.png' },
    {
      path: '/roadworks',
      label: 'Roadworks',
      icon: 'assets/roadwork.png',
    },
    { path: '/map', label: 'Map', icon: 'assets/map.png' },
    { path: '/about', label: 'About', icon: 'assets/about.png' },
    { path: '/contact', label: 'Contact', icon: 'assets/contact.png' },
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    // Observe changes in screen size to toggle handset mode
    this.breakpointObserver
      .observe(['(max-width: 600px)'])
      .subscribe((result) => {
        this.isHandset = result.matches;
      });
    // Subscribe to router events to detect navigation changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.urlAfterRedirects;
        }
      });
  }
  //Navigate to the home
  goHome() {
    this.router.navigate(['/']);
  }
  //Check if a route is active
  isActive(url: string): boolean {
    return this.currentUrl === url;
  }
}
