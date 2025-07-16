import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {TranslateModule} from "@ngx-translate/core";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-print-map-dialog',
  standalone: true,
  imports: [
    RiseButtonComponent,
    TranslateModule,
    NgIf
  ],
  templateUrl: './print-map-dialog.component.html',
  styleUrl: './print-map-dialog.component.css'
})
export class PrintMapDialogComponent implements OnInit {

  m_bIsLoading:boolean = false;


  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<PrintMapDialogComponent>
  ) {
  }

  m_sSelectedFormat: 'pdf' | 'png' = 'pdf'; // Default to PDF


  ngOnInit(): void {

  }

  onDismiss(): void {

    this.m_oDialogRef.close(); // Close dialog without returning data
  }

  selectFormat(format: 'pdf' | 'png'): void {
    this.m_sSelectedFormat = format;
    console.log('Selected print format:', this.m_sSelectedFormat);
  }

  confirmPrinting(): void {
    // When the user clicks "Print", close the dialog and pass the selected format
    this.m_bIsLoading=true;
    // this.m_oDialogRef.close({
    //   printOptions: {
    //     format: this.m_sSelectedFormat,
    //   }
    // });
  }


}
