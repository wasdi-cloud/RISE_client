import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subject, Subscription, takeUntil} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {geojsonToWKT} from '@terraformer/wkt';
import {CommonModule} from '@angular/common';

import {RiseAffectedWidgetComponent} from './rise-affected-widget/rise-affected-widget.component';
import {RiseAlertsWidgetComponent} from './rise-alerts-widget/rise-alerts-widget.component';
import {RiseBannerComponent} from '../../components/rise-banner/rise-banner.component';
import {RiseMapComponent} from '../../components/rise-map/rise-map.component';
import {RiseOngoingWidgetComponent} from './rise-ongoing-widget/rise-ongoing-widget.component';
import {RiseUserMenuComponent} from '../../components/rise-user-menu/rise-user-menu.component';
import {RiseButtonComponent} from '../../components/rise-button/rise-button.component';

import {EventViewModel} from '../../models/EventViewModel';
import {AreaViewModel} from '../../models/AreaViewModel';

import {AreaService} from '../../services/api/area.service';
import {MapService} from '../../services/map.service';
import {AreaInfoComponent} from '../area-of-operations/area-info/area-info.component';
import {NotificationsDialogsService} from '../../services/notifications-dialogs.service';

import FadeoutUtils from '../../shared/utilities/FadeoutUtils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RiseAffectedWidgetComponent,
    RiseAlertsWidgetComponent,
    RiseBannerComponent,
    RiseMapComponent,
    RiseOngoingWidgetComponent,
    RiseUserMenuComponent,
    RiseButtonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  public m_aoOngoingEvents: Array<EventViewModel> = [];

  private m_oDestroy$ = new Subject<void>();

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

  /**
   * Flag to enable drawing mode on dashboard map
   */
  public m_bEnableAreaDrawing: boolean = false;

  /**
   * Temporary shape data drawn on map
   */
  private m_oDrawnShapeInfo: any = null;

  constructor(
    private m_oAreaService: AreaService,
    private m_oMapService: MapService,
    private m_oRouter: Router,
    private m_oNgZone: NgZone,
    private m_oDialog: MatDialog,
    private m_oNotificationService: NotificationsDialogsService,
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
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
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
    this.m_oAreaService.getAreaListByUser().pipe(takeUntil(this.m_oDestroy$)).subscribe({
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
    this.m_oNgZone.run(() => this.m_oRouter.navigateByUrl(`monitor/${oArea.id}`));
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

  /**
   * Enables drawing mode on the dashboard map to create a new area
   */
  public startAreaCreation(): void {
    if (this.m_bEnableAreaDrawing) {
      this.cancelAreaCreation();
      return;
    }

    this.m_bEnableAreaDrawing = true;
  }

  /**
   * Handles shape data emitted from the map when user completes drawing
   * Opens the area info dialog for the user to fill in details
   * @param shapeInfo - The drawn shape information (coordinates, type, etc.)
   */
  public onAreaShapeDrawn(shapeInfo: any): void {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(shapeInfo)) {
      return;
    }

    this.m_oNgZone.run(() => {
      this.m_bEnableAreaDrawing = false;
      this.m_oDrawnShapeInfo = shapeInfo;

      // Convert shape to WKT format for API
      let sBbox = '';
      let sMarkerCoordinates = '';

      if (shapeInfo.type === 'circle') {
        sBbox = this.m_oMapService.convertCircleToWKT(shapeInfo.center, shapeInfo.radius);
        sMarkerCoordinates = 'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
      } else if (shapeInfo.type === 'polygon') {
        sBbox = geojsonToWKT(shapeInfo.geoJson);
        sMarkerCoordinates = 'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
      }

      // Open the area info dialog with the drawn shape data
      this.m_oDialog
        .open(AreaInfoComponent, {
          data: {
            isNew: true,
            bbox: sBbox,
            markerCoordinates: sMarkerCoordinates,
            shapeInfo: shapeInfo,
          },
          height: '68%',
        })
        .afterClosed()
        .subscribe((oResponse) => {
          // Refresh areas list after save
          if (oResponse) {
            this.getUsersAOI();
            return;
          }

          // If dialog is canceled, remove temporary drawn overlays/markers.
          this.m_oMapService.clearPreviousDrawings(null);
          this.m_oDrawnShapeInfo = null;
        });
    });
  }

  /**
   * Cancels the area drawing mode
   */
  public cancelAreaCreation(): void {
    this.m_bEnableAreaDrawing = false;
    this.m_oDrawnShapeInfo = null;
  }
}
