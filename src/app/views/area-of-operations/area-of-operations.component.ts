import {Component, OnInit} from '@angular/core';
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {TranslateModule} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {RiseCrudTableComponent} from "../../components/rise-crud-table/rise-crud-table.component";
import {AreaViewModel} from "../../models/AreaViewModel";
import {AreaService} from "../../services/api/area.service";
import {RiseCheckBoxComponent} from "../../components/rise-check-box/rise-check-box.component";
import {RiseSelectAreaComponent} from "../../components/rise-select-area/rise-select-area.component";
import {RiseTextAreaInputComponent} from "../../components/rise-textarea-input/rise-text-area-input.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {RiseMapComponent} from "../../components/rise-map/rise-map.component";
import {NgIf} from "@angular/common";
import {PluginService} from "../../services/api/plugin.service";

import {
  ConfirmDialogComponent
} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-area-of-operations',
  standalone: true,
  imports: [
    RiseButtonComponent,
    TranslateModule,
    RiseToolbarComponent,
    RiseCrudTableComponent,
    RiseCheckBoxComponent,
    RiseSelectAreaComponent,
    RiseTextAreaInputComponent,
    RiseTextInputComponent,
    RiseMapComponent,
    NgIf
  ],
  templateUrl: './area-of-operations.component.html',
  styleUrl: './area-of-operations.component.css'
})
export class AreaOfOperationsComponent implements OnInit {
  m_aoAreasOfOperations: AreaViewModel[] = [];
  m_bIsAreaSelected: boolean=false;
  m_sAreaOfOperationName: string = "name";
  m_sAreaOfOperationDescription: string = "description";
  m_asPlugins: { label: string; value: string }[] = [];
  m_asUsersColumns: string[] = ["Mail", "User_ID"];
  m_aoUserData = [
    {Mail: 'John Doe', User_ID: 'john@example.com'},
    {Mail: 'Jane Smith', User_ID: 'jane@example.com'}
  ];
  m_oSelectedArea: AreaViewModel={};

  constructor(
    private m_oRouter: Router,
    private m_oAreaService: AreaService,
    private m_oPluginService: PluginService,
    private m_oDialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.m_oAreaService.getAreaList().subscribe({
      next: (aoResponse) => {
        console.log(aoResponse.creationDate)
        this.m_aoAreasOfOperations = aoResponse;
      }
    })
    this.m_oPluginService.getPluginsList().subscribe({
      next: (aoResponse) => {
        console.log(aoResponse)
        for (const aoResponseElement of aoResponse) {
          if (aoResponseElement != '' && aoResponseElement.name && aoResponseElement.id) {
            this.m_asPlugins.push({label: aoResponseElement.name, value: aoResponseElement.id});

          }
        }

      }
    })
  }

  public navigateRoute(sLocation: string) {
    //todo Admin registered the organization
    //todo The organization has a valid subscription or a valid credit card
    //todo HQ Operator has been added to the organization
    //todo HQ Operator selected New Area of Operations
    this.m_oRouter.navigateByUrl(`/${sLocation}`);
  }

  onSelectionChange($event: any[]) {

  }

  onAreaDelete(area: any) {
    const oDialogRef = this.m_oDialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: 'Are you Sure you want to delete this Area'+area.name+'?'
    });

    oDialogRef.afterClosed().subscribe(result => {

      if (result) {
       //todo call api service here to delete user
        console.log(result)
      }
    });
  }

  onFiledUserAdd() {

  }

  handleTableData(area: any[]) {
    console.log(area)
  }

  cancelCreatingAreaOfOperation() {

  }

  SaveAreaOfOperation() {
    console.log(this.m_oSelectedArea)
    if(this.m_oSelectedArea){
      this.m_oAreaService.updateArea(this.m_oSelectedArea).subscribe({
        next:(oResponse)=>{
          console.log(oResponse);

        }
      })
    }

  }

  onAreaSelection(area: any) {
    this.m_bIsAreaSelected=true;
    console.log(area.id)
    if (area.id) {
      this.m_oAreaService.getAreaById(area.id).subscribe({
        next: (oResponse) => {
          if(oResponse){
            this.m_oSelectedArea=oResponse;
          }
        }
      })
    }

  }

  onFieldUserDelete($event: any) {

  }
}
