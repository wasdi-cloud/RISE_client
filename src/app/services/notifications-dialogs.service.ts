import {Injectable, ViewContainerRef} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from '../dialogs/notification-dialog/notification-dialog.component';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationSnackbarComponent } from '../dialogs/notification-snackbar/notification-snackbar.component';
@Injectable({
  providedIn: 'root',
})
export class NotificationsDialogsService {
  constructor(private m_oMatDialog: MatDialog, private m_oMatSnackbar: MatSnackBar) {}

  /**
   * Handle open of confirmation dialog
   * @param sMessage
   * @param sClassName
   * @returns result of confirmation dialog (boolean)
   */
  openConfirmationDialog(
    sMessage: string,
    sClassName?: string
  ): Observable<boolean> {
    let oDialogRef = this.m_oMatDialog.open(ConfirmationDialogComponent, {
      maxWidth: '500px',
      panelClass: sClassName ? sClassName : 'generic',
      data: {
        message: sMessage,
        className: sClassName ? sClassName : 'generic',
        isConfirmation: true,
      },
    });

    return oDialogRef.afterClosed();
  }

  /**
   * Handler to open the alert/information dialog component
   * @param sMessage
   * @param sClassName
   * @param sTitle
   */
  openInfoDialog(sMessage: string, sClassName: string, sTitle?: string): void {
    //Set default 4 second timeout to close alert dialog
    let iTimeout = 4000;

    let oDialogRef = this.m_oMatDialog.open(NotificationDialogComponent, {
      maxWidth: '500px',
      panelClass: sClassName ? sClassName : 'generic',
      data: {
        message: sMessage,
        title: sTitle ? sTitle : '',
        isConfirmation: false,
        className: sClassName ? sClassName : 'generic',
      },
    });
  }

  /**
   * Handler to open the snackbar in the bottom right corner
   * @param sMessage
   * @param sTitle
   * @param className
   * @param enableCopy
   * @param viewContainerRef
   */
  openSnackBar(sMessage: string, sTitle?: string, className?: string, enableCopy?: boolean,  viewContainerRef?: ViewContainerRef) {
    this.onFullScreenMode(viewContainerRef);
    this.m_oMatSnackbar.openFromComponent(NotificationSnackbarComponent, {
      duration: 10000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: [className ? className : 'info-snackbar'],
      data: {
        message: sMessage,
        title: sTitle ? sTitle : 'Update',
        class: className ? className : 'info-snackbar',
        enableCopy:enableCopy?enableCopy:false
      },
      viewContainerRef: viewContainerRef
    });
  }

  private onFullScreenMode(viewContainerRef: ViewContainerRef) {
    if (viewContainerRef) {
      // Ensure overlay exists before opening actual snackbar
      const overlayContainer = document.querySelector('.cdk-overlay-container');
      if (!overlayContainer) {
        // Preload invisible snackbar to force creation of overlay container
        this.m_oMatSnackbar.open('', '', {duration: 0,panelClass: ['invisible-snackbar']});
      }

      this.moveOverlayIntoFullscreen();
    }
  }

  moveOverlayIntoFullscreen() {
    const fullscreenElement = document.fullscreenElement;
    const overlayContainer = document.querySelector('.cdk-overlay-container');
    if (fullscreenElement && overlayContainer && !fullscreenElement.contains(overlayContainer)) {
      fullscreenElement.appendChild(overlayContainer);
    }
  }

}
