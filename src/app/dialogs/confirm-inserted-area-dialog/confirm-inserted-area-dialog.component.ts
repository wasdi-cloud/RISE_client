import { Component } from '@angular/core';
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-confirm-inserted-area-dialog',
  standalone: true,
  imports: [
    RiseButtonComponent,
    RiseTextInputComponent
  ],
  templateUrl: './confirm-inserted-area-dialog.component.html',
  styleUrl: './confirm-inserted-area-dialog.component.css'
})
export class ConfirmInsertedAreaDialogComponent {
  constructor(private m_oDialogRef: MatDialogRef<ConfirmInsertedAreaDialogComponent>) {
  }
  submit() {
    this.m_oDialogRef.close(true);
  }
  onDismiss() {
    this.m_oDialogRef.close(false);
  }
}
