import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { HomeComponent } from './home/home.component';
import { RoadConditionsComponent } from './road-conditions/road-conditions.component';
import { MapComponent } from './map/map.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { LayoutModule } from '@angular/cdk/layout';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoadConditionsComponent,
    MapComponent,
    AboutComponent,
    ContactComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    LayoutModule,
  ],
  providers: [provideClientHydration()],
  bootstrap: [AppComponent],
})
export class AppModule {}
