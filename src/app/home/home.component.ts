import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  features = [
    {
      path: '/roadworks',
      label: 'Roadworks',
      icon: 'assets/roadworks_img.jpg',
    },
    { path: '/map', label: 'Map', icon: 'assets/map_img.jpg' },
    { path: '/about', label: 'About', icon: 'assets/about_img.jpg' },
    { path: '/contact', label: 'Contact', icon: 'assets/contact_img.jpg' },
  ];
}
