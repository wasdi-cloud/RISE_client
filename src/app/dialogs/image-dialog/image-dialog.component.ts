import { Component, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogContent} from '@angular/material/dialog';
import { ConstantsService } from '../../services/constants.service';
import { AttachmentService } from '../../services/api/attachment.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material/dialog';
import {Subject, Subscription, takeUntil} from 'rxjs';

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogContent],
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.css']
})
export class ImageDialogComponent implements OnDestroy {

  m_oPdfUrl!: SafeResourceUrl;

  /**
   * Subject to handle unsubscription on component destroy
   */
  private m_oDestroy$ = new Subject<void>();

  constructor(@Inject(MAT_DIALOG_DATA) public m_oData: { oPayload: any },
      private m_oConstantsService: ConstantsService,
      private m_oAttachmentService: AttachmentService,
      private m_oSanitizer: DomSanitizer,
      public m_oDialogRef: MatDialogRef<ImageDialogComponent>) {

        if (this.m_oData.oPayload.type==="pdf") {

          let sToken = this.m_oConstantsService.getSessionId();

          this.m_oAttachmentService.get("event_docs", this.m_oData.oPayload.eventId,
            this.m_oData.oPayload.fileName, sToken).pipe(takeUntil(this.m_oDestroy$)).subscribe({
            next: (oResponse) => {
              const sMimeType = 'application/pdf';
              const oBlob = new Blob([oResponse], { type: sMimeType });
              const unsafeUrl = URL.createObjectURL(oBlob); // Generate object URL

              this.m_oPdfUrl = this.m_oSanitizer.bypassSecurityTrustResourceUrl(unsafeUrl); // Sanitize
            },
            error: (oError) => {
              console.error("Error loading PDF", oError);
            }
          });
        }
  }

  onDonwloadAttachment(){
    if (this.m_oData.oPayload.type==="image") {
      this.onDonwloadImage(this.m_oData.oPayload.fileName);
    } else {
      this.onDonwloadDoc(this.m_oData.oPayload.fileName);
    }
  }

  onDonwloadImage(sFileName: string) {
    if (sFileName) {

      let sToken = this.m_oConstantsService.getSessionId();

      this.m_oAttachmentService.get("event_images", this.m_oData.oPayload.eventId, sFileName, sToken).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next: (oResponse) => {
          const sMimeType = this.getMimeTypeFromFileName(sFileName);
          const oBlob = new Blob([oResponse], { type: sMimeType });
          const sUrl = window.URL.createObjectURL(oBlob);
          const oAnchorElement = document.createElement('a');
          oAnchorElement.href = sUrl;
          oAnchorElement.download = sFileName;
          oAnchorElement.click();
          window.URL.revokeObjectURL(sUrl);
        },
        error: (oError) => {
          console.error("Error downloading image", oError);
        }
      });
    }
  }

  onDonwloadDoc(sFileName: string) {
    if (sFileName) {
      let sToken = this.m_oConstantsService.getSessionId();

      this.m_oAttachmentService.get("event_docs", this.m_oData.oPayload.eventId, sFileName, sToken).pipe(takeUntil(this.m_oDestroy$)).subscribe({
        next: (oResponse) => {
          const sMimeType = this.getMimeTypeFromFileName(sFileName);
          const oBlob = new Blob([oResponse], { type: sMimeType });
          const sUrl = window.URL.createObjectURL(oBlob);
          const oAnchorElement = document.createElement('a');
          oAnchorElement.href = sUrl;
          oAnchorElement.download = sFileName;
          oAnchorElement.click();
          window.URL.revokeObjectURL(sUrl);
        },
        error: (oError) => {
          console.error("Error downloading document", oError);
        }
      });
    }
  }
  private getMimeTypeFromFileName(sFileName: string): string {
    const sExtension = sFileName.split('.').pop()?.toLowerCase();
    switch (sExtension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'mp4':
        return 'video/mp4';
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream'; // Fallback for unknown types
    }
  }

  onDeleteAttachment() {

    let sType = this.m_oData.oPayload.type==="image" ? "event_images" : "event_docs";
    this.m_oAttachmentService.delete(sType, this.m_oData.oPayload.eventId, this.m_oData.oPayload.fileName).pipe(takeUntil(this.m_oDestroy$)).subscribe({
      next: (oResponse) => {
        console.log("Attachment deleted successfully", oResponse);
        this.m_oDialogRef.close();
      },
      error: (oError) => {
        console.error("Error deleting attachment", oError);
      }
    });
  }

  ngOnDestroy(): void {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
  }

}
