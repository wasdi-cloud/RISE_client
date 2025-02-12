import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef,} from '@angular/material/snack-bar';
import {NgIf} from "@angular/common";

@Component({
  selector: 'notification-snackbar',
  standalone: true,
  imports: [
    NgIf
  ],
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
  copyMessage() {
    navigator.clipboard.writeText(this.m_oData.message).then(() => {

    });
  }
}
