import { Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from '../dialogs/notification-dialog/notification-dialog.component';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class NotificationsDialogsService {
  constructor(private m_oMatDialog: MatDialog) {}

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
      minHeight: '200px',
      width: '500px',
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
      minWidth: '500px',
      panelClass: sClassName ? sClassName : 'generic',
      data: {
        message: sMessage,
        title: sTitle ? sTitle : '',
        isConfirmation: false,
        className: sClassName ? sClassName : 'generic',
      },
    });

    //Set Automatic timeout for dialog
    oDialogRef.afterOpened().subscribe((oResponse) => {
      setTimeout(() => {
        oDialogRef.close();
      }, iTimeout);
    });
  }
}
