import { Component } from '@angular/core';
import {RiseToolbarComponent} from "../../components/rise-toolbar/rise-toolbar.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {RiseSelectAreaComponent} from "../../components/rise-select-area/rise-select-area.component";
import {RiseCrudTableComponent} from "../../components/rise-crud-table/rise-crud-table.component";
import {RiseMapComponent} from "../../components/rise-map/rise-map.component";
import {RiseCheckBoxComponent} from "../../components/rise-check-box/rise-check-box.component";

@Component({
  selector: 'app-create-area-of-operation',
  standalone: true,
  imports: [
    RiseToolbarComponent,
    RiseTextInputComponent,
    RiseSelectAreaComponent,
    RiseCrudTableComponent,
    RiseMapComponent,
    RiseCheckBoxComponent
  ],
  templateUrl: './create-area-of-operation.component.html',
  styleUrl: './create-area-of-operation.component.css'
})
export class CreateAreaOfOperationComponent {
//todo add verification before adding the area
}
