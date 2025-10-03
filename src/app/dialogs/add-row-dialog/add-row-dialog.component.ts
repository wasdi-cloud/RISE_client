import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {NgForOf} from "@angular/common";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";

@Component({
  selector: 'app-add-row-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatFormField,
    FormsModule,
    MatDialogActions,
    MatButton,
    MatDialogContent,
    MatInput,
    NgForOf,
    RiseButtonComponent
  ],
  templateUrl: './add-row-dialog.component.html',
  styleUrl: './add-row-dialog.component.css'
})
export class AddRowDialogComponent {
  m_aoRowData: any = {};

  constructor(
    public m_oDialog: MatDialogRef<AddRowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onSave(): void {
    this.m_oDialog.close(this.m_aoRowData);
  }

  onCancel(): void {
    this.m_oDialog.close();
  }
}
