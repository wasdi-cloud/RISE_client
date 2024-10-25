import { Component, OnInit } from '@angular/core';
import { RiseButtonComponent } from '../../components/rise-button/rise-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RiseToolbarComponent } from '../../components/rise-toolbar/rise-toolbar.component';
import { RiseCrudTableComponent } from '../../components/rise-crud-table/rise-crud-table.component';
import { AreaViewModel } from '../../models/AreaViewModel';
import { AreaService } from '../../services/api/area.service';
import { RiseCheckboxComponent } from '../../components/rise-checkbox/rise-checkbox.component';
import { RiseSelectAreaComponent } from '../../components/rise-select-area/rise-select-area.component';
import { RiseTextareaInputComponent } from '../../components/rise-textarea-input/rise-textarea-input.component';
import { RiseTextInputComponent } from '../../components/rise-text-input/rise-text-input.component';
import { RiseMapComponent } from '../../components/rise-map/rise-map.component';
import { NgIf } from '@angular/common';
import { PluginService } from '../../services/api/plugin.service';

import { MatDialog } from '@angular/material/dialog';
import { CreateAreaOfOperationComponent } from '../create-area-of-operation/create-area-of-operation.component';

@Component({
  selector: 'app-area-of-operations',
  standalone: true,
  imports: [
    CreateAreaOfOperationComponent,
    RiseButtonComponent,
    TranslateModule,
    RiseToolbarComponent,
    RiseCrudTableComponent,
    RiseCheckboxComponent,
    RiseSelectAreaComponent,
    RiseTextareaInputComponent,
    RiseTextInputComponent,
    RiseMapComponent,
    NgIf,
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
  m_asUsersColumns: string[] = ['Mail', 'User_ID'];
  m_aoUserData = [
    { Mail: 'John Doe', User_ID: 'john@example.com' },
    { Mail: 'Jane Smith', User_ID: 'jane@example.com' },
  ];
  m_oSelectedArea: AreaViewModel = {};

  m_bShowNewArea: boolean = false;

  constructor(
    private m_oAreaService: AreaService,
    private m_oDialog: MatDialog,
    private m_oPluginService: PluginService,
    private m_oRouter: Router
  ) {}

  ngOnInit() {
    this.m_oAreaService.getAreaList().subscribe({
      next: (aoResponse) => {
        this.m_aoAreasOfOperations = aoResponse;
      },
    });
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
  }

  public toggleShowNew(bShowNew: boolean) {
    //todo Admin registered the organization
    //todo The organization has a valid subscription or a valid credit card
    //todo HQ Operator has been added to the organization
    //todo HQ Operator selected New Area of Operations
    // this.m_oRouter.navigateByUrl(`/${sLocation}`);
    this.m_bShowNewArea = bShowNew;
  }

  onSelectionChange($event: any[]) {}

  onAreaDelete(area: any) {
    // const oDialogRef = this.m_oDialog.open(ConfirmDialogComponent, {
    //   width: '300px',
    //   data: 'Are you Sure you want to delete this Area' + area.name + '?',
    // });

    // oDialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     //todo call api service here to delete user
    //     console.log(result);
    //   }
    // });
  }

  onFiledUserAdd() {}

  handleTableData(area: any[]) {
    console.log(area);
  }

  cancelCreatingAreaOfOperation() {}

  SaveAreaOfOperation() {
    console.log(this.m_oSelectedArea);
    if (this.m_oSelectedArea) {
      this.m_oAreaService.updateArea(this.m_oSelectedArea).subscribe({
        next: (oResponse) => {
          console.log(oResponse);
        },
      });
    }
  }

  onAreaSelection(area: any) {
    this.m_bIsAreaSelected = true;
    console.log(area.id);
    if (area.id) {
      this.m_oAreaService.getAreaById(area.id).subscribe({
        next: (oResponse) => {
          if (oResponse) {
            this.m_oSelectedArea = oResponse;
          }
        },
      });
    }
  }

  onFieldUserDelete($event: any) {}
}
