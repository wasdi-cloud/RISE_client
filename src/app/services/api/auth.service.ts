import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UserCredentials } from '../../shared/models/user-credentials';
import { UserRegistration } from '../../shared/models/user-registration';
import { ConstantsService } from '../constants.service';

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

  /**
   * Log a user into RISE
   * @param oCredentials
   * @returns
   */
  loginUser(oCredentials: UserCredentials) {
    return this.m_oHttp.post<any>(this.APIURL + '/auth/login', oCredentials);
  }

  /**
   * Verify the user's one time password execution
   * @param oOTPViewModel
   * @returns
   */
  verifyOTP(oOTPViewModel) {
    return this.m_oHttp.post<any>(this.APIURL + '/auth/otp', oOTPViewModel);
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
  registerUser(oUser: UserRegistration) {
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
  confirmUser(oConfirmationVM: any) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/auth/confirm_usr',
      oConfirmationVM
    );
  }
}
