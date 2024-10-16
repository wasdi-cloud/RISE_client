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
export class AreaOfOperationsComponent implements OnInit{
  m_aoAreasOfOperations: AreaViewModel[]=[];
  selectedArea: true;

  constructor(
    private m_oRouter: Router,
    private m_oAreaService:AreaService
  ) {
  }

  ngOnInit(){
        this.m_oAreaService.getAreaList().subscribe({
          next:(aoResponse)=>{
            console.log(aoResponse.creationDate)
            this.m_aoAreasOfOperations=aoResponse;
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
}
