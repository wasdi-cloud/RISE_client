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
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import {environment} from "../../../environments/environments";
import {SubscriptionService} from "../../services/api/subscription.service";
import {Router} from "@angular/router";

@Component({
  selector: 'area-of-operations',
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
  m_bShouldBuySub: boolean = false;
  m_bDeleting: boolean = false;

  constructor(
    private m_oAreaService: AreaService,
    private m_oDialog: MatDialog,
    private m_oMapService: MapService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oTranslate: TranslateService,
    private m_oSubService: SubscriptionService,
    private m_oRouter: Router
  ) {
  }

  ngOnInit() {
    this.getAreas();
    this.hasValidSubscription()
  }

  getAreas() {
    this.m_oAreaService.getAreaList().subscribe({
      next: (aoResponse) => {
        this.m_aoAreasOfOperations = [...aoResponse];
      },
    });
  }

  toggleShowNew(bShowNew: boolean) {
    if(this.canCreateArea()){
      this.m_bShowNewArea = bShowNew;
      if (!this.m_bShowNewArea) {
        this.getAreas();
      }
    }
  }

  flyToArea(oArea: AreaViewModel) {
    this.m_oMapService.flyToMonitorBounds(oArea.bbox);
  }

  openManageUsers(oArea: AreaViewModel): void {
    let sErrorMsg: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.ERROR_GET_USERS'
    );
    this.m_oAreaService.getUsersFromArea(oArea.id).subscribe({
      next: (oResponse) => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse)) {
          return;
        }
        //PS: users include yourself here
        this.m_oDialog.open(RiseCollaboratorsDialogComponent, {
          data: {
            users: oResponse,
            resourceType: 'area',
            id: oArea.id,
            isDialog: true,
            entity: oArea
          },
        });
      },
      error: (oError) => {
        this.m_oNotificationService.openSnackBar(sErrorMsg, 'Error','danger');
      },
    });
  }

  openEditArea(oArea) {
    this.m_oDialog
      .open(AreaInfoComponent, {
        data: {
          area: oArea,
        },
        height: "80%"
      })
      .afterClosed()
      .subscribe((oResponse) => {
        this.getAreas();
      });
  }


  deleteArea(oArea) {
    let sConfirm: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.CONFIRM_DELETE'
    );
    let sErrorMsg: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.ERROR_DELETE'
    );
    sConfirm += `<ul><li>${oArea.name}</li></ul>`;
    this.m_oNotificationService
      .openConfirmationDialog(sConfirm, 'danger')
      .subscribe((bResult) => {
        if (!bResult) {
          return;
        }
        this.m_bDeleting = true;

        this.m_oAreaService.deleteAreaOfOperation(oArea.id).subscribe({
          next: (oResponse) => {
            this.m_bDeleting = false;
            this.getAreas();
          },
          error: (oError) => {
            this.m_bDeleting = false;
            this.m_oNotificationService.openInfoDialog(sErrorMsg, 'danger');
          },
        });
      });
  }

  canCreateArea() {
    //this is to limit user for creating more than one area for a limited edition of rise
    //if it is test env and area is 0 , return true
    if (environment.isTestEnvironment) {
      if(this.m_aoAreasOfOperations.length < 1){
        return true;
      }else{
        this.m_oNotificationService.openSnackBar("For RISE Limited edition , you can only create one area",'Create Area of Operation','danger');
        return false;
      }
    } else {
      return true;
    }

  }
  hasValidSubscription(){
    this.m_oSubService.getSubscriptionsList(true).subscribe(
      {
        next:(oResponse)=>{
          if(oResponse==null || oResponse.length==0){
            //no sub is found,tell user to buy one
            this.m_bShouldBuySub=true;
          }else{
            this.m_bShouldBuySub=false;
          }
        },
        error:(oError)=>{
          console.error(oError)
        }
      }
    )
  }

  goToMonitorArea(oArea: AreaViewModel) {
    this.m_oRouter.navigateByUrl(`monitor/${oArea.id}`)
  }
}
