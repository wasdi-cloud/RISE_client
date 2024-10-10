import {Component} from '@angular/core';
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {RiseSelectAreaComponent} from "../../components/rise-select-area/rise-select-area.component";
import {RiseCrudTableComponent} from "../../components/rise-crud-table/rise-crud-table.component";
import {RiseMapComponent} from "../../components/rise-map/rise-map.component";
import {RiseCheckBoxComponent} from "../../components/rise-check-box/rise-check-box.component";
import {RiseTextAreaInputComponent} from "../../components/rise-textarea-input/rise-text-area-input.component";
import {AddRowDialogComponent} from "../../dialogs/add-row-dialog/add-row-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {AreaViewModel} from "../../models/AreaViewModel";
import {AreaService} from "../../services/api/area.service";
import { geojsonToWKT } from '@terraformer/wkt';
import {ErrorViewModel} from "../../models/ErrorViewModel";

@Component({
  selector: 'app-create-area-of-operation',
  standalone: true,
  imports: [
    RiseToolbarComponent,
    RiseTextInputComponent,
    RiseSelectAreaComponent,
    RiseCrudTableComponent,
    RiseMapComponent,
    RiseCheckBoxComponent,
    RiseTextAreaInputComponent,
    RiseButtonComponent
  ],
  templateUrl: './create-area-of-operation.component.html',
  styleUrl: './create-area-of-operation.component.css'
})
export class CreateAreaOfOperationComponent {

  m_oEvents = [
    {label: 'Floods', value: 1},
    {label: 'Droughts', value: 2},
    {label: 'Buildings', value: 3},
    {label: 'Impacts', value: 4}
  ];

  //todo get users from org
  m_aoUserData = [
    {Mail: 'John Doe', User_ID: 'john@example.com'},
    {Mail: 'Jane Smith', User_ID: 'jane@example.com'}
  ];
  m_asUsersColumns: string[] = ["Mail", "User_ID"];


  m_oAreaOfOperation: AreaViewModel;
  m_sAreaOfOperationDescription: string;
  m_sAreaOfOperationName: string;
  m_oAreaInfo = {}
  m_asEventsSelected = []
  m_aoFieldUsers = []
  m_sAreaOfOperationBBox: string="";
  private m_sMarkerCoordinates: string="";

  constructor(
    private oDialog: MatDialog,
    private m_oAreaOfOperationService: AreaService) {
  }

  onRowDelete(row: any) {
    this.m_aoUserData = this.m_aoUserData.filter(item => item !== row); // Remove the deleted row
  }

  onRowAdd() {
    const oDialogRef = this.oDialog.open(AddRowDialogComponent, {
      width: '300px',
      data: {fields: this.m_asUsersColumns}
    });

    oDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.m_aoUserData = [...this.m_aoUserData, result];
      }
    });
  }

  onSelectionChange(selectedValues: any[]) {
    console.log('Selected values:', selectedValues);
    this.m_asEventsSelected = selectedValues;
  }

  onMapInputChange(shapeInfo: any) {
    console.log(shapeInfo)
    if (shapeInfo) {
      if (shapeInfo.type === 'circle') {
        // Store circle information as before
        this.m_oAreaInfo = {
          type: 'circle',
          center: {
            lat: shapeInfo.center.lat,
            lng: shapeInfo.center.lng
          },
          radius: shapeInfo.radius,
          area: shapeInfo.area
        };
        this.m_sMarkerCoordinates='POINT('+shapeInfo.center.lng+' '+shapeInfo.center.lat+')'
        // Convert circle to WKT (approximated as a polygon with 64 points)
        const wktCircle = this.convertCircleToWKT(shapeInfo.center, shapeInfo.radius);
        console.log("WKT for Circle: ", wktCircle);
        this.m_sAreaOfOperationBBox=wktCircle;

      }
      else if (shapeInfo.type === 'polygon') {
        // Store polygon information as before
        this.m_oAreaInfo = {
          type: 'polygon',
          points: shapeInfo.points,
          area: shapeInfo.area,
          geoJson:shapeInfo.geoJson,
          center:shapeInfo.center
        };

        // Convert polygon to WKT
        console.log(geojsonToWKT(shapeInfo.geoJson))
        this.m_sAreaOfOperationBBox=geojsonToWKT(shapeInfo.geoJson);
        this.m_sMarkerCoordinates='POINT('+shapeInfo.center.lng+' '+shapeInfo.center.lat+')'

      }
    }
  }

// Convert circle to WKT (approximated as a polygon)
  convertCircleToWKT(center: { lat: number, lng: number }, radius: number): string {
    const numPoints = 64; // Number of points to approximate the circle
    const points = [];
    const earthRadius = 6371000; // Radius of the Earth in meters

    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 360 / numPoints) * Math.PI / 180; // Convert to radians
      const latOffset = radius * Math.cos(angle) / earthRadius * (180 / Math.PI);
      const lngOffset = radius * Math.sin(angle) / (earthRadius * Math.cos(center.lat * Math.PI / 180)) * (180 / Math.PI);
      const lat = center.lat + latOffset;
      const lng = center.lng + lngOffset;
      points.push([lng, lat]);
    }
    // Close the polygon by repeating the first point at the end
    points.push([points[0][0], points[0][1]]);
    return `POLYGON((${points.map(p => `${p[0]} ${p[1]}`).join(', ')}))`;
  }




  SaveAreaOfOperation() {

    //todo rise utils
    if (this.m_sAreaOfOperationDescription === null || this.m_sAreaOfOperationName === null) {
      //todo alert user or make input in red
      return;
    }
    if (this.m_oAreaInfo === null) {
      //todo alert user
      return;
    }
    if (this.m_asEventsSelected === null || this.m_asEventsSelected.length == 0) {
      //todo alert user
      return;
    }
    if (this.m_aoFieldUsers === null || this.m_aoFieldUsers.length == 0) {
      //todo alert user
      return;
    }
    this.m_oAreaOfOperation = {
      name: this.m_sAreaOfOperationName,
      description: this.m_sAreaOfOperationDescription,
      bbox:this.m_sAreaOfOperationBBox,
      markerCoordinates:this.m_sMarkerCoordinates
    }
    this.m_oAreaOfOperationService.addArea(this.m_oAreaOfOperation).subscribe(
      {
        next: () => {
          console.log('Success');
        },
        error: (e:ErrorViewModel) => {
          // here handle no valid subscription
          console.log(e.errorStringCodes[0])
        }
      }
    )

    /*todo add verification before adding the area:
  ****
  **do that before make him click on the save button
  **Admin registered the organization
  **The organization has a valid subscription or a valid credit card
  **HQ Operator has been added to the organization
  **HQ Operator selected New Area of Operations
  ***
  todo 4.HQ Operator confirms the inserted area
  todo 5. RISE adjust the area to fit the requirements of the system (area not too big and
    not too small)
  todo 6. If the selected area overlaps or have the same name of an existing one:
    a. RISE communicates to the HQ Operator that there is already an
      overlapping area that is up and running
    b. RISE ask confirmation to the HQ Operator if we really wants to proceed;
    c. If the user cancels the operation, RISE clears the form and comes back
    to Step 1, otherwise proceed to step 7.

  todo 9.RISE verifies the subscription status of the organization
  todo 10. If the Organization does not have a valid subscription:
      a. RISE invites the user to buy a New Subscription (UC_095)
  todo 11. RISE communicates to the HQ Operator the success of adding the new Area of
      Operations.
  todo 12. RISE communicates to the HQ Operator that the processing started, and she/he
      will be notified by e-mail when it is done.
  todo 13. RISE automatically start the processing of the last week of data
      a. When the processing is done, RISE sends an e-mail to the HQ Operator
      to notify that it is possible to start the near real time monitoring.
  todo 14. If it is a long term Area of Operations:
      a. RISE start to process the satellite archive to reconstruct the past event
      over the area of interest
      b. When the processing is done , RISE sends an e-mail to the HQ Operator
      to notify that the full archive is available.*/
  }


  cancelCreatingAreaOfOperation() {

  }

  handleTableData(tableData: any[]) {
    this.m_aoFieldUsers = tableData;
    // Process the data as needed in your component
    // For example, you can store it in a local variable or pass it to another service
  }
}
