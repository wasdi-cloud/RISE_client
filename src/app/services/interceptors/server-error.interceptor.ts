import { HttpInterceptorFn } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {NotificationsDialogsService} from "../notifications-dialogs.service";

export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbar = inject(MatSnackBar);
  const m_oNotificationService=inject(NotificationsDialogsService)

  return next(req).pipe(
    tap((httpEvent) => {
      // You can process successful responses if needed
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred.';

      // Check if it's a server-side error
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }


      m_oNotificationService.openInfoDialog(
        errorMessage,'danger',"Error"
      );
      // // Show the error message using MatSnackBar
      // snackbar.open(errorMessage, 'Close', {
      //   duration: 5000, // Duration in milliseconds
      // });

      // Re-throw the error so that other interceptors or components can handle it
      return throwError(() => error);
    })
  );
};
