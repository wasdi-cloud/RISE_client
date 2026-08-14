import { Component, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { ConstantsService } from '../../services/constants.service';
import { AttachmentService } from '../../services/api/attachment.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogContent],
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.css']
})
export class ImageDialogComponent implements OnDestroy {

  /** Safe, sanitized URL for iframe / video / image playback */
  m_oPreviewUrl: SafeResourceUrl | null = null;

  /** Indicates whether the file content is still loading */
  m_bIsLoading: boolean = true;

  private m_oDestroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: { oPayload: any },
    private m_oConstantsService: ConstantsService,
    private m_oAttachmentService: AttachmentService,
    private m_oSanitizer: DomSanitizer,
    public m_oDialogRef: MatDialogRef<ImageDialogComponent>
  ) {
    this.loadFileForPreview();
  }

  /**
   * Loads the file binary via AttachmentService and generates a safe Blob URL.
   */
  private loadFileForPreview(): void {
    const sFileName = this.m_oData.oPayload.fileName;
    const sEventId = this.m_oData.oPayload.eventId;
    const sToken = this.m_oConstantsService.getSessionId();

    // Determine whether this file lives in 'event_images' or 'event_docs'
    const bIsImageOrVideo = this.m_oData.oPayload.type === 'image' || this.isFileNameVideo(sFileName);
    const sEndpoint = bIsImageOrVideo ? 'event_images' : 'event_docs';

    this.m_oAttachmentService.get(sEndpoint, sEventId, sFileName, sToken)
      .pipe(takeUntil(this.m_oDestroy$))
      .subscribe({
        next: (oResponse: Blob) => {
          const sMimeType = this.getMimeTypeFromFileName(sFileName);

          // Force proper MIME type on the Blob
          const oBlob = new Blob([oResponse], { type: sMimeType });
          const sBlobUrl = URL.createObjectURL(oBlob);

          // Tell Angular's security engine that this local Blob URL is safe
          this.m_oPreviewUrl = this.m_oSanitizer.bypassSecurityTrustResourceUrl(sBlobUrl);
          this.m_bIsLoading = false;
        },
        error: (oError) => {
          console.error("Error loading preview file:", oError);
          this.m_bIsLoading = false;
        }
      });
  }

  /** Check if the filename ends with a video extension */
  public isVideo(): boolean {
    return this.isFileNameVideo(this.m_oData.oPayload.fileName);
  }

  private isFileNameVideo(sFileName: string): boolean {
    if (!sFileName) return false;
    const sExt = sFileName.split('.').pop()?.toLowerCase();
    return sExt === 'mp4' || sExt === 'mov' || sExt === 'avi' || sExt === 'webm';
  }

  /** Download Handler */
  onDonwloadAttachment(): void {
    const sFileName = this.m_oData.oPayload.fileName;
    const bIsImageOrVideo = this.m_oData.oPayload.type === 'image' || this.isVideo();

    if (bIsImageOrVideo) {
      this.onDonwloadImage(sFileName);
    } else {
      this.onDonwloadDoc(sFileName);
    }
  }

  onDonwloadImage(sFileName: string): void {
    if (!sFileName) return;
    const sToken = this.m_oConstantsService.getSessionId();

    this.m_oAttachmentService.get("event_images", this.m_oData.oPayload.eventId, sFileName, sToken)
      .pipe(takeUntil(this.m_oDestroy$))
      .subscribe({
        next: (oResponse) => {
          this.triggerBrowserDownload(oResponse, sFileName);
        },
        error: (oError) => console.error("Error downloading image", oError)
      });
  }

  onDonwloadDoc(sFileName: string): void {
    if (!sFileName) return;
    const sToken = this.m_oConstantsService.getSessionId();

    this.m_oAttachmentService.get("event_docs", this.m_oData.oPayload.eventId, sFileName, sToken)
      .pipe(takeUntil(this.m_oDestroy$))
      .subscribe({
        next: (oResponse) => {
          this.triggerBrowserDownload(oResponse, sFileName);
        },
        error: (oError) => console.error("Error downloading document", oError)
      });
  }

  private triggerBrowserDownload(oResponse: any, sFileName: string): void {
    const sMimeType = this.getMimeTypeFromFileName(sFileName);
    const oBlob = new Blob([oResponse], { type: sMimeType });
    const sUrl = window.URL.createObjectURL(oBlob);
    const oAnchorElement = document.createElement('a');
    oAnchorElement.href = sUrl;
    oAnchorElement.download = sFileName;
    oAnchorElement.click();
    window.URL.revokeObjectURL(sUrl);
  }

  /** Map File Extensions to MIME Types */
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
      case 'mov':
        return 'video/quicktime';
      case 'webm':
        return 'video/webm';
      case 'pdf':
        return 'application/pdf';
      case 'txt':
      case 'log':
      case 'csv':
        return 'text/plain;charset=utf-8';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }

  onDeleteAttachment(): void {
    const sType = (this.m_oData.oPayload.type === "image" || this.isVideo()) ? "event_images" : "event_docs";
    this.m_oAttachmentService.delete(sType, this.m_oData.oPayload.eventId, this.m_oData.oPayload.fileName)
      .pipe(takeUntil(this.m_oDestroy$))
      .subscribe({
        next: (oResponse) => {
          console.log("Attachment deleted successfully", oResponse);
          this.m_oDialogRef.close();
        },
        error: (oError) => console.error("Error deleting attachment", oError)
      });
  }

  ngOnDestroy(): void {
    this.m_oDestroy$.next();
    this.m_oDestroy$.complete();
  }
}
