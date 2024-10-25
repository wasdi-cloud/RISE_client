import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';

import { RiseCrudTableComponent } from '../../components/rise-crud-table/rise-crud-table.component';
import { RiseMapComponent } from '../../components/rise-map/rise-map.component';
import { RiseCheckboxComponent } from '../../components/rise-checkbox/rise-checkbox.component';
import { RiseTextareaInputComponent } from '../../components/rise-textarea-input/rise-textarea-input.component';
import { AddRowDialogComponent } from '../../dialogs/add-row-dialog/add-row-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { AreaViewModel } from '../../models/AreaViewModel';
import { AreaService } from '../../services/api/area.service';
import { geojsonToWKT } from '@terraformer/wkt';
import { BuyNewSubscriptionDialogComponent } from '../../dialogs/buy-new-subscription-dialog/buy-new-subscription-dialog.component';
import { Router } from '@angular/router';

import { PluginService } from '../../services/api/plugin.service';
import { UserOfAreaViewModel } from '../../models/UserOfAreaViewModel';
import { NotificationsDialogsService } from '../../services/notifications-dialogs.service';
import { RiseUtils } from '../../shared/RiseUtils';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-area-of-operation',
  standalone: true,
  providers: [],
  imports: [
    RiseToolbarComponent,
    RiseTextInputComponent,

    RiseCrudTableComponent,
    RiseMapComponent,
    RiseCheckboxComponent,
    RiseTextareaInputComponent,
    RiseButtonComponent,
  ],
  templateUrl: './create-area-of-operation.component.html',
  styleUrl: './create-area-of-operation.component.css',
})
export class CreateAreaOfOperationComponent implements OnInit {
  @Output() m_oEmitCancel: EventEmitter<boolean> = new EventEmitter<boolean>(
    null
  );

  m_asPlugins: { label: string; value: string }[] = [];

  //todo get users from org
  m_aoUserData = [
    { Mail: 'John Doe', User_ID: 'john@example.com' },
    { Mail: 'Jane Smith', User_ID: 'jane@example.com' },
  ];
  m_asUsersColumns: string[] = ['Mail', 'User_ID'];

  m_oAreaOfOperation: AreaViewModel;
  m_asFieldUsers: UserOfAreaViewModel[] = [];
  m_sAreaOfOperationDescription: string;
  m_sAreaOfOperationName: string;
  m_oAreaInfo = {};
  m_asPluginsSelected: string[] = [];
  m_aoFieldUsers = [];
  m_sAreaOfOperationBBox: string = '';
  m_sMarkerCoordinates: string = '';
  m_aoAreasOfOperations: AreaViewModel[];

  constructor(
    private m_oAreaOfOperationService: AreaService,
    private m_oDialog: MatDialog,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oPluginService: PluginService,
    private m_oRiseUtils: RiseUtils,
    private m_oRouter: Router,
    private m_oTranslate: TranslateService
  ) {}

  ngOnInit() {
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

  onRowAdd() {
    const oDialogRef = this.m_oDialog.open(AddRowDialogComponent, {
      width: '300px',
      data: { fields: this.m_asUsersColumns },
    });

    oDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.m_aoUserData = [...this.m_aoUserData, result];
      }
    });
  }

  onSelectionChange(selectedValues: any[]) {
    this.m_asPluginsSelected = selectedValues;
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
        this.m_sMarkerCoordinates =
          'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
        // Convert circle to WKT (approximated as a polygon with 64 points)
        this.m_sAreaOfOperationBBox = this.convertCircleToWKT(
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

        this.m_sAreaOfOperationBBox = geojsonToWKT(shapeInfo.geoJson);
        this.m_sMarkerCoordinates =
          'POINT(' + shapeInfo.center.lng + ' ' + shapeInfo.center.lat + ')';
      }
    }
  }

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
    //todo rise utils
    if (
      this.m_oRiseUtils.isStrNullOrEmpty(this.m_sAreaOfOperationDescription) ||
      this.m_oRiseUtils.isStrNullOrEmpty(this.m_sAreaOfOperationName)
    ) {
      //todo alert user or make input in red
      return;
    }
    //todo rise utils

    if (this.m_oAreaInfo === null) {
      //todo alert user
      return;
    }
    //todo rise utils

    if (
      this.m_asPluginsSelected === null ||
      this.m_asPluginsSelected.length == 0
    ) {
      //todo alert user
      return;
    }
    //todo rise utils

    if (this.m_aoFieldUsers === null || this.m_aoFieldUsers.length == 0) {
      //todo alert user
      return;
    }
    //todo rise utils

    if (this.m_asPluginsSelected.length < 1) {
      //todo alert user
      return;
    }
    this.m_oAreaOfOperation = {
      name: this.m_sAreaOfOperationName,
      description: this.m_sAreaOfOperationDescription,
      bbox: this.m_sAreaOfOperationBBox,
      markerCoordinates: this.m_sMarkerCoordinates,
      // plugins:this.m_asPluginsSelected
    };

    //check if the selected area overlaps or have the same name of an existing one
    // this.checkOverlappingAreasAndSameName(this.m_oAreaOfOperation);
    this.m_oAreaOfOperationService.addArea(this.m_oAreaOfOperation).subscribe({
      next: (oResponse) => {
        //todo send confirmation to HQ operator
        this.m_oNotificationService.openInfoDialog(
          'New Area have been added successfully',
          'success',
          'Success'
        );
        this.m_oRouter.navigateByUrl('/account');
        // this.m_oAreaOfOperationService.addUserToArea(oResponse.id,)
      },
      error: (e) => {
        // Here handle no valid subscription
        if (e.error.errorStringCodes[0] === 'ERROR_API_NO_VALID_SUBSCRIPTION') {
          //open dialog to invite user to buy new subscription
          this.inviteUserToBuyNewSubscription();
        }
      },
    });
  }

  cancelCreatingAreaOfOperation() {
    //todo go back to managing area of operations
    // this.m_oRouter.navigateByUrl('/account');
    this.m_oEmitCancel.emit(false);
  }

  handleTableData(tableData: any[]) {
    this.m_aoFieldUsers = tableData;
  }

  private inviteUserToBuyNewSubscription() {
    let oDialog = this.m_oDialog.open(BuyNewSubscriptionDialogComponent, {
      height: '420px',
      width: '600px',
    });
    // Once is closed...
    oDialog.afterClosed().subscribe((oResult) => {
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
    this.m_sAreaOfOperationName = '';
    this.m_sAreaOfOperationDescription = '';

    // Reset the map area
    this.m_oAreaInfo = {};
    this.m_sAreaOfOperationBBox = '';
    this.m_sMarkerCoordinates = '';

    // Reset the selected events (checkboxes)
    this.m_asPluginsSelected = [];

    // Reset the users in the table
    this.m_aoFieldUsers = [];

    // this.m_oRiseSelectAreaComponent.clearPreviousDrawings();
  }
}
