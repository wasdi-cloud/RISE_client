// import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
// import { catchError, tap } from 'rxjs/operators';
// import { throwError } from 'rxjs';
// import { inject } from '@angular/core';
// import { NotificationsDialogsService } from '../notifications-dialogs.service';
//
//
//
// export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {
//   // const notificationService = inject(NotificationsDialogsService);
//   //
//   // return next(req).pipe(
//   //   tap((httpEvent) => {
//   //     // Process successful responses if needed
//   //   }),
//   //   catchError((error: HttpErrorResponse) => {
//   //     let sErrorMessage = 'An unexpected error occurred.';
//   //
//   //     // Use the TranslationServiceWithoutInterception to get translations
//   //     if (error.error.errorStringCodes && error.error.errorStringCodes[0]) {
//   //       sErrorMessage = `Error: ${translationService.getTranslation(error.error.errorStringCodes[0])}`;
//   //     }
//   //
//   //     // Show the translated error message in a dialog
//   //     notificationService.openInfoDialog(
//   //       sErrorMessage, 'danger', 'Error'
//   //     );
//   //
//   //     // Re-throw the error to propagate it further
//   //     return throwError(() => error);
//   //   })
//   // );
// };
