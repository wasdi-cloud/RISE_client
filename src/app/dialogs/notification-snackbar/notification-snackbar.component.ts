import { Component, Inject } from '@angular/core';
import {
  MatSnackBar,
  MAT_SNACK_BAR_DATA,
  MatSnackBarDismiss,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
@Component({
  selector: 'notification-snackbar',
  standalone: true,
  imports: [],
  templateUrl: './notification-snackbar.component.html',
  styleUrl: './notification-snackbar.component.css',
})
export class NotificationSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public m_oData: any,
    private m_oSnackbarRef: MatSnackBarRef<NotificationSnackbarComponent>
  ) {}

  onDismiss() {
    this.m_oSnackbarRef.dismiss();
  }
}
