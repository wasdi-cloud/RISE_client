import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {TranslateModule} from "@ngx-translate/core";
import {NgIf} from "@angular/common";
import {catchError, finalize, switchMap, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {PrinterService} from "../../services/api/printer.service";
import FadeoutUtils from "../../shared/utilities/FadeoutUtils";
import {log} from "node:util";
import {RiseTextInputComponent} from "../../components/rise-text-input/rise-text-input.component";

@Component({
  selector: 'app-print-map-dialog',
  standalone: true,
  imports: [
    RiseButtonComponent,
    TranslateModule,
    NgIf,
    RiseTextInputComponent
  ],
  templateUrl: './print-map-dialog.component.html',
  styleUrl: './print-map-dialog.component.css'
})
export class PrintMapDialogComponent implements OnInit {

  m_bIsLoading:boolean = false;
  m_oPrintPayload:any


  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<PrintMapDialogComponent>,
    private m_oHttp:HttpClient,
    private m_oPrinterService:PrinterService
  ) {
  }

  m_sSelectedFormat: 'pdf' | 'png' = 'pdf'; // Default to PDF


  ngOnInit(): void {
      if(this.m_oData.payload){
        console.log(this.m_oData.payload);
        this.m_oPrintPayload=this.m_oData.payload;
        this.m_oPrintPayload.format=this.m_sSelectedFormat;
      }
  }

  onDismiss(): void {

    this.m_oDialogRef.close(); // Close dialog without returning data
  }

  selectFormat(format: 'pdf' | 'png'): void {
    this.m_sSelectedFormat = format;
    this.m_oPrintPayload.format = format;
    console.log('Selected print format:', this.m_sSelectedFormat);
  }

  confirmPrinting(): void {
    // When the user clicks "Print", close the dialog and pass the selected format
    this.m_bIsLoading=true;

    this.m_oPrinterService.storeMap(this.m_oPrintPayload).subscribe(
      {
        next: (sUUID: any) => {
          console.log(sUUID)
          if(!FadeoutUtils.utilsIsStrNullOrEmpty(sUUID)) {
            console.log(sUUID)
            this.m_oPrinterService.printMap(sUUID).subscribe({
              next: (blob: Blob) => {
                // Determine file type and extension
                const sContentType = blob.type; // 'application/pdf' or 'image/png'
                const sFileExtension = sContentType === 'application/pdf' ? 'pdf' : 'png';

                // Create a blob URL and open in new tab
                const blobUrl = URL.createObjectURL(blob);
                // window.open(blobUrl, '_blank');

                // OR: force download instead

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `map.${sFileExtension}`;
                link.click();
                this.m_bIsLoading=false;
                this.m_oDialogRef.close();

              },
              error: (err) => {
                console.error('Error fetching map file:', err);
                this.m_bIsLoading=false;
                this.m_oDialogRef.close();

              }
            });
          }
        },
        error: (err) => {
          console.error('Error fetching map file:', err);
          this.m_bIsLoading=false;
          this.m_oDialogRef.close();

        }
      }
    );

  }


}
