import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { geojsonToWKT } from '@terraformer/wkt';

import { MatDialog } from '@angular/material/dialog';

import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { RiseCheckboxComponent } from '../../components/rise-checkbox/rise-checkbox.component';
// import { RiseCrudTableComponent } from '../../components/rise-crud-table/rise-crud-table.component';
import { RiseMapComponent } from '../../components/rise-map/rise-map.component';
import { RiseTextareaInputComponent } from '../../components/rise-textarea-input/rise-textarea-input.component';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';
// import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';

import { AreaService } from '../../services/api/area.service';
import { MapService } from '../../services/map.service';
import { NotificationsDialogsService } from '../../services/notifications-dialogs.service';
import { PluginService } from '../../services/api/plugin.service';

import { AreaViewModel } from '../../models/AreaViewModel';
import { UserOfAreaViewModel } from '../../models/UserOfAreaViewModel';

import FadeoutUtils from '../../shared/utilities/FadeoutUtils';

@Component({
  selector: 'app-create-area-of-operation',
  standalone: true,
  providers: [],
  imports: [
    RiseButtonComponent,
    RiseCheckboxComponent,
    RiseMapComponent,
    RiseTextareaInputComponent,
    RiseTextInputComponent,
    TranslateModule,
    NgIf,
  ],
  templateUrl: './create-area-of-operation.component.html',
  styleUrl: './create-area-of-operation.component.css',
})
export class CreateAreaOfOperationComponent implements OnInit, AfterViewInit {
  @Output() m_oExitPage: EventEmitter<boolean> = new EventEmitter<boolean>(
    null
  );

  m_asPlugins: { label: string; value: string }[] = [];

  //todo get users from org
  m_aoUserData = [];

  /**
   * Input model for form + validations
   */
  m_oAreaOfOperation: AreaViewModel = {} as AreaViewModel;

  /**
   * User's existing Areas of Operations
   */
  m_aoAreasOfOperations: AreaViewModel[];

  /**
   * Field users to track
   */
  m_aoFieldUsers: UserOfAreaViewModel[] = [];

  /**
   * Selected Plugins
   */
  m_asPluginsSelected: string[] = [];

  /**
   * ?
   */
  m_oAreaInfo = {};

  /**
   * Error strings for validator output
   */
  m_sAreaOfOperationNameError: string = '';
  m_sAreaOfOperationDescriptionError: string = '';
  m_sPluginError: string = '';

  m_bValidationActive = false;
  m_bDescriptionIsValid: boolean = true;
  m_bNameIsValid: boolean = true;
  m_bPluginsAreValid: boolean = true;

  constructor(
    private m_oAreaOfOperationService: AreaService,
    private m_oDialog: MatDialog,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oPluginService: PluginService,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService,
    private m_oMapService: MapService
  ) {}

  ngAfterViewInit() {}

  ngOnInit() {
    // Optional: Ensure the component reference is available

    //todo get users that belong to current user org eithr by direct call or get all users and match with current user org id
    this.m_oPluginService.getPluginsList().subscribe({
      next: (aoResponse) => {
        for (const aoResponseElement of aoResponse) {
          if (
            aoResponseElement != '' &&
            aoResponseElement.name &&
            aoResponseElement.id
          ) {
            this.m_asPlugins.push({
              label: aoResponseElement.name,
              value: aoResponseElement.id,
            });
          }
        }
      },
    });
    this.m_oAreaOfOperationService.getAreaList().subscribe({
      next: (aoResponse) => {
        this.m_aoAreasOfOperations = aoResponse;
      },
    });
  }

  onRowDelete(row: any) {
    this.m_aoUserData = this.m_aoUserData.filter((item) => item !== row); // Remove the deleted row
  }

  onSelectionChange(selectedValues: any[]) {
    this.m_asPluginsSelected = selectedValues;
    this.m_oAreaOfOperation.plugins = this.m_asPluginsSelected;
  }

  onMapInputChange(shapeInfo: any) {
    if (shapeInfo) {
      if (shapeInfo.type === 'circle') {
        // Store circle information as before
        this.m_oAreaInfo = {
          type: 'circle',
          center: {
            lat: shapeInfo.center.lat,
            lng: shapeInfo.center.lng,
          },
          radius: shapeInfo.radius,
          area: shapeInfo.area,
        };
        this.m_oAreaOfOperation.markerCoordinates =
          'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
        // Convert circle to WKT (approximated as a polygon with 64 points)
        this.m_oAreaOfOperation.bbox = this.convertCircleToWKT(
          shapeInfo.center,
          shapeInfo.radius
        );
      } else if (shapeInfo.type === 'polygon') {
        // Store polygon information as before
        this.m_oAreaInfo = {
          type: 'polygon',
          points: shapeInfo.points,
          area: shapeInfo.area,
          geoJson: shapeInfo.geoJson,
          center: shapeInfo.center,
        };

        // Convert polygon to WKT

        this.m_oAreaOfOperation.bbox = geojsonToWKT(shapeInfo.geoJson);
        this.m_oAreaOfOperation.markerCoordinates =
          'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
      }
    }
  }

  //todo moving this to map service
  // Convert circle to WKT (approximated as a polygon)

  convertCircleToWKT(
    center: { lat: number; lng: number },
    radius: number
  ): string {
    const numPoints = 64; // Number of points to approximate the circle
    const points = [];
    const earthRadius = 6371000; // Radius of the Earth in meters

    for (let i = 0; i < numPoints; i++) {
      const angle = (((i * 360) / numPoints) * Math.PI) / 180; // Convert to radians
      const latOffset =
        ((radius * Math.cos(angle)) / earthRadius) * (180 / Math.PI);
      const lngOffset =
        ((radius * Math.sin(angle)) /
          (earthRadius * Math.cos((center.lat * Math.PI) / 180))) *
        (180 / Math.PI);
      const lat = center.lat + latOffset;
      const lng = center.lng + lngOffset;
      points.push([lng, lat]);
    }
    // Close the polygon by repeating the first point at the end
    points.push([points[0][0], points[0][1]]);
    return `POLYGON((${points.map((p) => `${p[0]} ${p[1]}`).join(', ')}))`;
  }

  SaveAreaOfOperation() {
    this.m_bValidationActive = true;
    if (this.validateAOI()) {
      this.m_oAreaOfOperationService
        .addArea(this.m_oAreaOfOperation)
        .subscribe({
          next: (oResponse) => {
            //todo send confirmation to HQ operator
            this.m_oNotificationService.openInfoDialog(
              'New Area have been added successfully',
              'success',
              'Success'
            );
            this.exitCreatingAreaOfOperation();
          },
          error: (e) => {
            // Here handle no valid subscription
            if (
              e.error.errorStringCodes[0] === 'ERROR_API_NO_VALID_SUBSCRIPTION'
            ) {
              //open dialog to invite user to buy new subscription
              this.inviteUserToBuyNewSubscription();
            }
          },
        });
    }
  }

  exitCreatingAreaOfOperation() {
    this.resetAreaOfOperationForm();
    this.m_oExitPage.emit(false);
  }

  handleTableData(tableData: any[]) {
    this.m_aoFieldUsers = tableData;
  }

  private inviteUserToBuyNewSubscription() {
    let sMessage =
      'Your subscription is invalid.<br> Would you like to purchase a new one?';
    this.m_oNotificationService
      .openConfirmationDialog(sMessage, 'alert')
      .subscribe((oResult) => {
        if (oResult) {
          //todo go to subscription page
          this.m_oRouter.navigateByUrl('/buy-new-subscription');
        }
      });
  }

  private checkOverlappingAreas(m_oAreaOfOperation: AreaViewModel) {
    //TODO the service is not implemented yet in the backend
    return false;
  }

  private checkSameNameAreas(m_oAreaOfOperation: AreaViewModel) {
    for (const area of this.m_aoAreasOfOperations) {
      if (area.name === m_oAreaOfOperation.name) {
        return true;
      }
    }
    return false;
  }

  private checkOverlappingAreasAndSameName(m_oAreaOfOperation: AreaViewModel) {
    // TODO: Switch out Confirm dialog for Confirmation Dialog Service + add localization
    if (
      this.checkOverlappingAreas(m_oAreaOfOperation) &&
      this.checkSameNameAreas(m_oAreaOfOperation)
    ) {
      let sConfirmMsg = `<ul>
      <li>${this.m_oTranslate.instant(
        'AREA_OF_OPERATIONS.CONFIRM_SAME_AREA'
      )}</li>
      <li>${this.m_oTranslate.instant(
        'AREA_OF_OPERATIONS.CONFIRM_SAME_NAME'
      )}</li>
      </ul>${this.m_oTranslate.instant('AREA_OF_OPERATIONS.CONFIRM')}`;

      //ask user to confirm
      this.m_oNotificationService
        .openConfirmationDialog(sConfirmMsg, 'alert')
        .subscribe((bResult) => {
          return bResult;
        });
    } else if (this.checkSameNameAreas(m_oAreaOfOperation)) {
      //ask user to confirm
      let sConfirmMsg = `<ul>
      <li>${this.m_oTranslate.instant(
        'AREA_OF_OPERATIONS.CONFIRM_SAME_NAME'
      )}</li>
      </ul>${this.m_oTranslate.instant('AREA_OF_OPERATIONS.CONFIRM')}`;

      //ask user to confirm
      this.m_oNotificationService
        .openConfirmationDialog(sConfirmMsg, 'alert')
        .subscribe((bResult) => {
          if (bResult) {
            this.m_oAreaOfOperationService
              .addArea(this.m_oAreaOfOperation)
              .subscribe({
                next: () => {
                  console.log('Success');
                },
                error: (e) => {
                  // here handle no valid subscription
                  if (
                    e.error.errorStringCodes[0] ===
                    'ERROR_API_NO_VALID_SUBSCRIPTION'
                  ) {
                    //open dialog to invite user to buy new subscription
                    this.inviteUserToBuyNewSubscription();
                  }
                },
              });
          } else {
            //todo clear everything
            this.resetAreaOfOperationForm();
          }
        });
    } else if (this.checkOverlappingAreas(m_oAreaOfOperation)) {
      let sConfirmMsg = `<ul>
      <li>${this.m_oTranslate.instant(
        'AREA_OF_OPERATIONS.CONFIRM_SAME_AREA'
      )}</li>
      </ul>${this.m_oTranslate.instant('AREA_OF_OPERATIONS.CONFIRM')}`;

      //ask user to confirm
      this.m_oNotificationService
        .openConfirmationDialog(sConfirmMsg, 'alert')
        .subscribe((bResult) => {
          return bResult;
        });
    }
    return false;
  }

  private resetAreaOfOperationForm() {
    // Reset the name and description
    this.m_oAreaOfOperation = {
      bbox: '',
      description: '',
      name: '',
      plugins: [],
      markerCoordinates: '',
    };

    // Reset the map area
    this.m_oAreaInfo = {};

    // Reset the selected events (checkboxes)
    this.m_asPluginsSelected = [];

    // Reset the users in the table
    this.m_aoFieldUsers = [];
    this.m_aoUserData = [];
    this.m_oMapService.clearPreviousDrawings(null);
    // this.m_oRiseSelectAreaComponent.clearPreviousDrawings();
  }

  /**
   * enable the area of interest submission button
   */
  enableAOISubmit(): boolean {
    if (!this.m_oAreaOfOperation.name) {
      return false;
    }
    if (this.m_asPluginsSelected.length < 1) {
      return false;
    }
    if (!this.m_oAreaOfOperation.bbox) {
      return false;
    }
    return true;
  }

  private validateAOI(): boolean {
    let bIsValid = true;
    // this.checkOverlappingAreasAndSameName(this.m_oAreaOfOperation);

    if (
      !this.validateAOIName() ||
      !this.validateAOIDescription() ||
      !this.validateAOIPlugins() ||
      !this.validateAreaInfo()
    ) {
      bIsValid = false;
    }
    return bIsValid;
  }

  validateAOIName() {
    if (!this.m_bValidationActive) return true;

    if (
      FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oAreaOfOperation.name) ||
      this.m_oAreaOfOperation.name.length < 6
    ) {
      this.m_sAreaOfOperationNameError =
        'Please enter a valid name of at least 6 characters.';
      this.m_bNameIsValid = false;
      return false;
    }

    this.m_sAreaOfOperationNameError = ''; // Clear error when valid
    this.m_bNameIsValid = true;
    return true;
  }

  validateAOIDescription() {
    if (
      FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oAreaOfOperation.description)
    ) {
      this.m_sAreaOfOperationDescriptionError =
        'Please provide a description for your area of operations';
      this.m_bDescriptionIsValid = false;
      return false;
    }
    this.m_sAreaOfOperationDescriptionError = ''; // Clear error when valid
    this.m_bDescriptionIsValid = true;
    return true;
  }

  private validateAOIPlugins(): boolean {
    if (
      !this.m_oAreaOfOperation.plugins ||
      this.m_oAreaOfOperation.plugins.length < 1
    ) {
      this.m_sPluginError = 'Please select at least one plugin from the list.';
      return false;
    }
    return true;
  }

  private validateAreaInfo() {
    return this.m_oAreaInfo !== null;
  }
}
