import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

import {RiseAffectedWidgetComponent} from './rise-affected-widget/rise-affected-widget.component';
import {RiseAlertsWidgetComponent} from './rise-alerts-widget/rise-alerts-widget.component';
import {RiseBannerComponent} from '../../components/rise-banner/rise-banner.component';
import {RiseMapComponent} from '../../components/rise-map/rise-map.component';
import {RiseOngoingWidgetComponent} from './rise-ongoing-widget/rise-ongoing-widget.component';
import {RiseTextInputComponent} from '../../components/rise-text-input/rise-text-input.component';
import {RiseUserMenuComponent} from '../../components/rise-user-menu/rise-user-menu.component';

import {EventViewModel} from '../../models/EventViewModel';
import {AreaViewModel} from '../../models/AreaViewModel';

import {AreaService} from '../../services/api/area.service';
import {MapService} from '../../services/map.service';

import FadeoutUtils from '../../shared/utilities/FadeoutUtils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RiseAffectedWidgetComponent,
    RiseAlertsWidgetComponent,
    RiseBannerComponent,
    RiseMapComponent,
    RiseOngoingWidgetComponent,
    RiseTextInputComponent,
    RiseUserMenuComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  public m_aoOngoingEvents: Array<EventViewModel> = [];

  /**
   * TODO: add appropriate typing
   */
  public m_iAffectedPpl: number = 0;

  /**
   * TODO: add appropriate typing
   */
  public m_aoAlerts: Array<any> = [];

  public m_aoAreas: Array<AreaViewModel> = [];

  private m_oActiveAOI: Subscription = null;

  constructor(
    private m_oAreaService: AreaService,
    private m_oMapService: MapService,
    private m_oRouter: Router,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.getUsersAOI();
    this.m_oActiveAOI = this.m_oMapService.m_oMarkerSubject$.subscribe(
      (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.openMonitor(oResponse);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.m_oActiveAOI?.unsubscribe();
  }

  /**
   * Navigates to the selected Routes (Account, Monitor, etc.)
   * @param sRoute
   */
  public navigateRoute(sRoute: string): void {
    this.m_oRouter.navigateByUrl(sRoute);
  }

  /*
   * Settings Button
   * My Account
   * My Organization
   * Areas of Operations Button
   * Subscriptions Button
   */

  /**
   * A map/globe with a Marker/Footprint in all the active Area of Operations the user can access
   */

  /**
   * TODO fetch the user's areas of interest
   */
  getUsersAOI() {
    this.m_oAreaService.getAreaList().subscribe({
      next: (oResponse) => {
        if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          this.m_aoAreas = oResponse;
          if (this.m_aoAreas.length > 0) {
            this.m_aoAlerts.forEach((oArea) => {
              this.addAOIToMap(oArea);
            });
          }
        }
      },
    });
  }

  /**
   * TODO: Add the Areas of interest to the map
   */
  addAOIToMap(oArea) {}

  /**
   * TODO: Open the Monitor view with selected area of interest
   */
  openMonitor(oArea) {
    this.ngZone.run(() => this.m_oRouter.navigateByUrl(`monitor/${oArea.id}`));
  }

  /**
   * TODO: A widget showing the estimation of people affected in the different area of operations if there is any event ongoing
   */
  getAffectedPeople() {}

  /**
   * TODO: A widget showing the list of “on-going events”
   */
  getOngoingEvents() {}

  /**
   * TODO: A widget showing the alerts received from the configured CAP sources
   */
  getAlerts() {}

  /**
   * TODO: User can click on an Area of Operation to access it
   */
  handleAreaSelected() {}
}
