import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpClient } from '@angular/common/http';
import { UserViewModel } from '../../models/UserViewModel';
import { OTPVerifyViewModel } from '../../models/OTPVerifyViewModel';
import {ChangePasswordRequestViewModel} from "../../models/ChangePasswordRequestViewModel";
import {ConfirmEmailChangeViewModel} from "../../models/ConfirmEmailChangeViewModel";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}

  getUser() {
    return this.m_oHttp.get<UserViewModel>(this.APIURL + '/usr');
  }

  updateUser(oBody) {
    return this.m_oHttp.post<UserViewModel>(this.APIURL + '/usr', oBody);
  }

  updateNotifications(oBody) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/usr/notification-update',
      oBody
    );
  }

  updateEmail(oUpdateEmailVM) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/usr/change-email',
      oUpdateEmailVM
    );
  }

  confirmNewEmail(oConfirmEmailChangeVM:ConfirmEmailChangeViewModel) {
    return this.m_oHttp.post<ConfirmEmailChangeViewModel>(
      this.APIURL + '/usr/confirm-new-email',
      oConfirmEmailChangeVM
    );
  }

  updatePassword(oChangePasswordRequestViewModel:ChangePasswordRequestViewModel) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/usr/change_password',
      oChangePasswordRequestViewModel
    );
  }

  confirmNewPassword(oBody) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/usr/change_password_verify',
      oBody
    );
  }

  deleteAccount() {
    return this.m_oHttp.post<any>(this.APIURL + '/usr/delete-user', {});
  }

  verifyDeleteAccount(oOTPVerifyViewModel: OTPVerifyViewModel) {
    const oOptions = {
      body: oOTPVerifyViewModel, // Add the payload to the body
      headers: {
        // Include headers if needed (like session tokens)
        'Content-Type': 'application/json',
      },
    };
    return this.m_oHttp.delete<any>(
      this.APIURL + '/usr/verify_delete_user',
      oOptions
    );
  }

  changeUserRole(oUserViewModel: UserViewModel) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/usr/change-role',
      oUserViewModel
    );
  }

  changeUserLanguageSetting(oUserViewModel: UserViewModel) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/usr/change-language',
      oUserViewModel
    );
  }
}
