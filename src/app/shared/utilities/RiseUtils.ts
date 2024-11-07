import { TranslateService } from '@ngx-translate/core';
import { NotificationsDialogsService } from '../../services/notifications-dialogs.service';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class RiseUtils {
  constructor(
    private m_oTranslationService: TranslateService,
    private m_oNotificationService: NotificationsDialogsService
  ) {}

  // handleError(oError) {
  //   //TODO: check client, server, network error
  //   let sErrorMessage = 'An unexpected error occurred.';

  //   // Use the TranslationServiceWithoutInterception to get translations
  //   if (oError.error.errorStringCodes && oError.error.errorStringCodes[0]) {
  //     let sTranslatedText = this.m_oTranslationService.instant(
  //       'ERROR_MSG.' + oError.error.errorStringCodes[0]
  //     );
  //     sErrorMessage = `Error: ${sTranslatedText}`;
  //   }
  //   // Show the translated error message in a dialog
  //   this.m_oNotificationService.openInfoDialog(
  //     sErrorMessage,
  //     'danger',
  //     'Error'
  //   );
  // }

  /**
   * Format Error Array to pass to either a notification dialog or a snackbar
   */
  handleServerError(aoError: Array<string>): string {
    let sErrorMsg = `<ul>${aoError.map((sError) => {
      let sErrorTranslated = this.m_oTranslationService.instant(
        'ERROR_MSG.' + sError
      );
      return `<li>${sErrorTranslated}</li>`;
    })}</ul>`;

    return sErrorMsg;
  }

  handleNotificationError(aoError: Array<string>) {
    let sErrorMsg = this.handleServerError(aoError);
    this.m_oNotificationService.openInfoDialog(sErrorMsg, 'alert', 'Error');
  }

  handleSnackbarError() {}

  isStrNullOrEmpty(sString: string) {
    if (sString && typeof sString != 'string') {
      throw '[Utils.isStrNullOrEmpty] The value is NOT a string';
    }
    return !(sString && sString.length > 0); // string is empty or null
  }
}
