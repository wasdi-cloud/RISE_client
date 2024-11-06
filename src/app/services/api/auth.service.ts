import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { RegisterViewModel } from '../../models/RegisterViewModel';
import { UserCredentialsViewModel } from '../../models/UserCredentialsViewModel';
import { ConstantsService } from '../constants.service';
import {ConfirmInviteViewModel} from "../../models/ConfirmInviteViewModel";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();

  // private AUTHURL: string = '';

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}

  saveToken(sToken: string) {
    localStorage.setItem('access_token', sToken);
    localStorage.setItem('refresh_token', sToken);
  }

  getTokenObject() {
    if (
      localStorage.getItem('access_token') &&
      localStorage.getItem('refresh_token')
    ) {
      return {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token'),
      };
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }

  /**
   * Log a user into RISE
   * @param oCredentials
   * @returns
   */
  loginUser(oCredentials: UserCredentialsViewModel) {
    return this.m_oHttp.post<any>(this.APIURL + '/auth/login', oCredentials);
  }

  /**
   * Verify the user's one time password execution
   * @param oOTPViewModel
   * @returns
   */
  verifyOTP(oOTPViewModel) {
    return this.m_oHttp.post<any>(this.APIURL + '/auth/otp', oOTPViewModel, {
      observe: 'response',
    });
  }

  /**
   * Verify the user upon login
   * @param oOTPVerifyVM
   * @returns
   */
  loginVerify(oOTPVerifyVM) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/auth/login_verify',
      oOTPVerifyVM
    );
  }

  /**
   * Register a user in an organization
   * @param oUser
   * @returns
   */
  registerUser(oUser: RegisterViewModel) {
    return this.m_oHttp.post<any>(this.APIURL + '/auth/register', oUser, {
      observe: 'response',
    });
  }

  /**
   * Confirm an admin user
   * @param iConfirmationCode
   * @param sUser
   * @returns
   */
  confirmAdm(iConfirmationCode: number, sUser: any) {
    return this.m_oHttp.get<any>(
      this.APIURL +
        `/auth/confirm_adm?code="${iConfirmationCode}"&usr="${sUser}"`
    );
  }

  /**
   * Confirm an invited user's account
   * @param oConfirmationVM
   * @returns
   */
  confirmUser(oConfirmationVM: ConfirmInviteViewModel) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/auth/confirm_usr',
      oConfirmationVM
    );
  }
}
