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

  constructor(private dialog: MatDialog) {
  }

  /*todo add verification before adding the area:
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
  m_oEvents = [
    {label: 'Floods', value: 1},
    {label: 'Droughts', value: 2},
    {label: 'Buildings', value: 3},
    {label: 'Impacts', value: 4}
  ];
  userData = [
    { Mail: 'John Doe', User_ID: 'john@example.com' },
    { Mail: 'Jane Smith', User_ID: 'jane@example.com' }
  ];
  m_asUsersColumns: string[]=["Mail","User_ID"];

  onRowDelete(row: any) {
    this.userData = this.userData.filter(item => item !== row); // Remove the deleted row
  }

  onRowAdd() {
    const dialogRef = this.dialog.open(AddRowDialogComponent, {
      width: '300px',
      data: { fields: this.m_asUsersColumns }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userData = [...this.userData, result];
      }
    });
  }

  onSelectionChange(selectedValues: any[]) {
    console.log('Selected values:', selectedValues);
  }


}
