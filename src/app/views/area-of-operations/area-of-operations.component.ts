import {Component, OnInit} from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

import {RiseButtonComponent} from '../../components/rise-button/rise-button.component';

import {AreaViewModel} from '../../models/AreaViewModel';
import {AreaService} from '../../services/api/area.service';

import {RiseMapComponent} from '../../components/rise-map/rise-map.component';
import {NgFor, NgIf} from '@angular/common';

import {MatDialog} from '@angular/material/dialog';
import {CreateAreaOfOperationComponent} from '../create-area-of-operation/create-area-of-operation.component';

import {MapService} from '../../services/map.service';

import {NotificationsDialogsService} from '../../services/notifications-dialogs.service';
import {
  RiseCollaboratorsDialogComponent
} from '../../components/rise-collaborators-dialog/rise-collaborators-dialog.component';
import {AreaInfoComponent} from './area-info/area-info.component';

@Component({
  selector: 'app-area-of-operations',
  standalone: true,
  imports: [
    CreateAreaOfOperationComponent,
    TranslateModule,
    RiseButtonComponent,
    RiseMapComponent,
    NgIf,
    NgFor,
  ],
  templateUrl: './area-of-operations.component.html',
  styleUrl: './area-of-operations.component.css',
})
export class AreaOfOperationsComponent implements OnInit {
  m_aoAreasOfOperations: AreaViewModel[] = [];
  m_bShowNewArea: boolean = false;

  constructor(
    private m_oAreaService: AreaService,
    private m_oDialog: MatDialog,
    private m_oMapService: MapService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oTranslate: TranslateService
  ) {
  }

  ngOnInit() {
    this.getAreas();
  }

  getAreas() {
    this.m_oAreaService.getAreaList().subscribe({
      next: (aoResponse) => {
        this.m_aoAreasOfOperations = [...aoResponse]; // Creates a new array reference


      },
    });
  }

  toggleShowNew(bShowNew: boolean) {
    this.m_bShowNewArea = bShowNew;
    if (!this.m_bShowNewArea) {
      this.getAreas()
    }
  }

  flyToArea(oArea: AreaViewModel) {
    this.m_oMapService.flyToMonitorBounds(oArea.bbox);
  }

  openManageUsers(oArea) {
    console.log('managing users');
    this.m_oAreaService.getUsersFromArea(oArea.id).subscribe({
      next: (oResponse) => {
        console.log(oResponse);
      },
      error: (oError) => {
        // this.m_oNotificationService.openInfoDialog(
        //   'Could not get Area Users',
        //   'danger',
        //   'Error'
        // );
      },
    });
    this.m_oDialog.open(RiseCollaboratorsDialogComponent, {
      maxHeight: '500px',
      maxWidth: '700px',
      data: {
        users: [],
        isDialog: true,
      },
    });
  }

  openEditArea(oArea) {
    this.m_oDialog.open(AreaInfoComponent, {
      data: {
        area: oArea
      }
    }).afterClosed()
      .subscribe((oResponse) => {
        this.getAreas();
      })
  }

  deleteArea(oArea) {
    //ask user if he really wants ot delete it or update it
    let sCheckWithUser: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.DELETE_OR_UPDATE'
    );
    sCheckWithUser += `<ul><li>${oArea.name}</li></ul>`;
    this.m_oNotificationService.openConfirmationDialog(sCheckWithUser, 'danger').subscribe(
      (bResult) => {
        if (bResult) {
          //user wants to delete , we ask for confirmation
          this.confirmAreaDelete(oArea);
        } else {
          this.openEditArea(oArea);
        }
      }
    )

  }

  private confirmAreaDelete(oArea) {
    let sConfirm: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.CONFIRM_DELETE'
    );
    sConfirm += `<ul><li>${oArea.name}</li></ul>`;
    this.m_oNotificationService
      .openConfirmationDialog(sConfirm, 'danger')
      .subscribe((bResult) => {
        if (bResult) {
          this.m_oAreaService.deleteAreaOfOperation(oArea.id).subscribe(
            {
              next: (oResponse) => {
                this.getAreas();

              }, error: (oError) => {
                console.error(oError)
              }
            }
          )

        } else {
          //do nothing (here for readability)
        }
      });
  }
}
