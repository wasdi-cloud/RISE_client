import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {inject} from '@angular/core';
import {NotificationsDialogsService} from "../notifications-dialogs.service";
import {TranslateService} from '@ngx-translate/core';

export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {

  const m_oNotificationService = inject(NotificationsDialogsService);
  // const m_oTranslate = inject(TranslateService);

  return next(req).pipe(
    tap((httpEvent) => {
      //process successful responses if needed
    }),
    catchError((error: HttpErrorResponse) => {
      let sErrorMessage = 'An unexpected error occurred.';
      //TODO: Client-side or network error
      //TODO: Check if it's a server-side error


      if (error.error.errorStringCodes[0]) {
        // let translatedMessage = m_oTranslate.instant(error.error.errorStringCodes[0]);
        sErrorMessage = `Error: ${error.error.errorStringCodes[0]}`;
      }
      m_oNotificationService.openInfoDialog(
        sErrorMessage, 'danger', "Error"
      );


      // Re-throw the error so that other interceptors or components can handle it
      return throwError(() => error);
    })
  );
};
