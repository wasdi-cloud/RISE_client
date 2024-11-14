import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';

import { AreaViewModel } from '../../models/AreaViewModel';
import { AreaService } from '../../services/api/area.service';

import { RiseMapComponent } from '../../components/rise-map/rise-map.component';
import { NgFor, NgIf } from '@angular/common';
import { PluginService } from '../../services/api/plugin.service';

import { MatDialog } from '@angular/material/dialog';
import { CreateAreaOfOperationComponent } from '../create-area-of-operation/create-area-of-operation.component';

import { MapService } from '../../services/map.service';

import { NotificationsDialogsService } from '../../services/notifications-dialogs.service';
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import { RiseCollaboratorsComponent } from '../../components/rise-collaborators/rise-collaborators.component';
import { RiseCollaboratorsDialogComponent } from '../../components/rise-collaborators-dialog/rise-collaborators-dialog.component';

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
  m_bIsAreaSelected: boolean = false;
  m_sAreaOfOperationName: string = 'name';
  m_sAreaOfOperationDescription: string = 'description';
  m_asPlugins: { label: string; value: string }[] = [];
  m_oSelectedArea: AreaViewModel = {};

  m_bShowNewArea: boolean = false;

  constructor(
    private m_oAreaService: AreaService,
    private m_oDialog: MatDialog,
    private m_oMapService: MapService,
    private m_oNotificationService: NotificationsDialogsService,
    private m_oTranslate: TranslateService
  ) {}

  ngOnInit() {
    this.getAreas();
  }

  getAreas() {
    this.m_oAreaService.getAreaList().subscribe({
      next: (aoResponse) => {
        this.m_aoAreasOfOperations = aoResponse;
        console.log(this.m_aoAreasOfOperations);
      },
    });
  }

  toggleShowNew(bShowNew: boolean) {
    this.m_bShowNewArea = bShowNew;
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
    console.log('editing');
  }

  deleteArea(oArea) {
    let sConfirm: string = this.m_oTranslate.instant(
      'AREA_OF_OPERATIONS.CONFIRM_DELETE'
    );
    sConfirm += `<ul><li>${oArea.name}</li></ul>`;
    this.m_oNotificationService
      .openConfirmationDialog(sConfirm, 'danger')
      .subscribe((bResult) => {
        if (bResult) {
          console.log(bResult);
        }
      });
  }
}
