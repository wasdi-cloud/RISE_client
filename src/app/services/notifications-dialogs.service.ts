import { Injectable } from '@angular/core';

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
  openInfoDialog(sMessage: string, sClassName: string, sTitle: string): void {
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
   */
  openSnackBar(sMessage: string, sTitle?: string, className?: string) {
    this.m_oMatSnackbar.openFromComponent(NotificationSnackbarComponent, {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: [className ? className : 'info-snackbar'],
      data: {
        message: sMessage,
        title: sTitle ? sTitle : 'Update',
        class: className ? className : 'info-snackbar',
      },
    });
  }
}
