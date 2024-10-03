import {Component, OnInit} from '@angular/core';
import {RiseDragAndDropComponent} from "../../components/rise-drag-and-drop/rise-drag-and-drop.component";
import {RiseButtonComponent} from "../../components/rise-button/rise-button.component";
import {ConstantsService} from "../../services/constants.service";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-import-station-dialog',
  standalone: true,
  imports: [
    RiseDragAndDropComponent,
    RiseButtonComponent
  ],
  templateUrl: './import-station-dialog.component.html',
  styleUrl: './import-station-dialog.component.css'
})
export class ImportStationDialogComponent implements OnInit {
  m_oFile: any;
  m_sFileName: string = "";


  m_oSelectedStyle: any = null;


  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<ImportStationDialogComponent>,
    ) {
  }

  ngOnInit(): void {

  }


  /*************** UPLOAD ***************/
  getSelectedFile(oEvent) {
    this.m_sFileName = oEvent.name;
    this.m_oFile = oEvent.file
  }

  getSelectedStyle(oEvent) {
    this.m_oSelectedStyle = oEvent.value;
  }

  onUploadFile() {
    let sStyle = "";

    //Add paywalling in this area on subscriptions


    //Check for uploaded file:
    if (this.m_oFile) {
      console.log("Please upload a file");
      return false;
    }

    //If the Style Input is filled apply the style:
    if (this.m_oSelectedStyle === false) {
      sStyle = this.m_oSelectedStyle.name;
    }

    let sErrorMsg: string = "DIALOG_IMPORT_UPLOAD_ERROR"
    // this.m_oProductService.uploadFile(this.m_sWorkspaceId, this.m_oFile, this.m_sFileName, sStyle).subscribe(
    //   {
    //     next: (oResponse) => {
    //
    //       let sHeader: string = this.m_oTranslate.instant("KEY_PHRASES.GURU_MEDITATION")
    //       if (oResponse.status !== 200) {
    //         console.log(this.m_sFileName + "here is !=200")
    //         this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg, sHeader, 'danger');
    //       } else {
    //         console.log(this.m_sFileName + "here is ==200")
    //         let sMessage: string = this.m_oTranslate.instant("KEY_PHRASES.SUCCESS");
    //         this.m_oNotificationDisplayService.openSnackBar(sMessage, '', 'success-snackbar');
    //         this.onDismiss();
    //       }
    //       this.m_fileUploadService.finishUpload();
    //
    //     },
    //     error: (oError) => {
    //       this.m_fileUploadService.finishUpload();
    //       this.m_oNotificationDisplayService.openSnackBar(sErrorMsg, '', 'danger');
    //     }
    //   });
    return true
  }


  onDismiss() {
    this.m_oDialogRef.close();
  }
}
