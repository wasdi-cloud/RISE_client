import {Component, Inject, Input} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";

@Component({
  selector: 'app-confirm-overlapping-and-same-name-area-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogTitle,
    RiseButtonComponent
  ],
  templateUrl: './confirm-overlapping-and-same-name-area-dialog.component.html',
  styleUrl: './confirm-overlapping-and-same-name-area-dialog.component.css'
})
export class ConfirmOverlappingAndSameNameAreaDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmOverlappingAndSameNameAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Data passed to the dialog
  ) {}

  // Close the dialog when user clicks "No"
  onNoClick(): void {
    this.dialogRef.close(false);
  }

  // Close the dialog and confirm action when user clicks "Yes"
  onYesClick(): void {
    this.dialogRef.close(true);
  }

}
