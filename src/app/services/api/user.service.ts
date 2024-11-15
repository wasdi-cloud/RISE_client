import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpClient } from '@angular/common/http';
import { UserViewModel } from '../../models/UserViewModel';

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
    return this.m_oHttp.post<any>(this.APIURL + '/usr/change-email', oUpdateEmailVM);
  }

  confirmNewEmail(oBody) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/usr/confirm-new-email',
      oBody
    );
  }
  updatePassword(oUpdatePasswordVM) {
    return this.m_oHttp.post<any>(this.APIURL + '/usr/change_password', oUpdatePasswordVM);
  }

  confirmNewPassword(oBody) {
    return this.m_oHttp.post<any>(this.APIURL + '/usr/change_password_verify', oBody);
  }

  deleteAccount() {}
}
