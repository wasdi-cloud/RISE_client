import { Component } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";

@Component({
  selector: 'app-lat-lon-dialog',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseTextInputComponent
  ],
  templateUrl: './manual-bounding-box.component.html',
  styleUrl: './manual-bounding-box.component.css'
})
export class ManualBoundingBoxComponent {
  //todo create rise number input component
  m_oBBox = {
    north: "",
    south: "",
    east: "",
    west: ""
  }

  constructor(private m_oDialogRef: MatDialogRef<ManualBoundingBoxComponent>) {
  }
  submit() {
    this.m_oDialogRef.close(this.m_oBBox);
  }
  onDismiss() {
    this.m_oDialogRef.close(null);
  }
}