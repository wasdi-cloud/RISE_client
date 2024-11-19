import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import {UserViewModel} from "../../models/UserViewModel";
import {OTPVerifyViewModel} from "../../models/OTPVerifyViewModel";

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {
  APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}

  getOrg(sOrgId: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/org?id=' + sOrgId);
  }

  getByUser() {
    return this.m_oHttp.get<any>(this.APIURL + '/org/by_usr');
  }

  inviteUser(oInviteViewModel) {
    return this.m_oHttp.post<any>(
      this.APIURL + '/org/invite',
      oInviteViewModel,
      { observe: 'response' }
    );
  }
  deleteOrganization() {
    return this.m_oHttp.delete<any>(
      this.APIURL + '/org/delete-org',
    );
  }
  getOrganizationUsers() {
    return this.m_oHttp.get<any>(
      this.APIURL + '/org/list-users',
    );

  }
  deleteUsersFromOrganization(aoUsersToDelete:UserViewModel[]) {
    const options = {
      body: aoUsersToDelete, // Add the payload to the body
      headers: {
        // Include headers if needed (like session tokens)
        'Content-Type': 'application/json'
      }
    };
    return this.m_oHttp.delete<any>(
      this.APIURL + '/org/remove-user',
      options
    );
  }
  verifyDeleteOrganization(oOtpVerifyViewModel:OTPVerifyViewModel) {
    const options = {
      body: oOtpVerifyViewModel, // Add the payload to the body
      headers: {
        // Include headers if needed (like session tokens)
        'Content-Type': 'application/json'
      }
    };
    return this.m_oHttp.delete<any>(
      this.APIURL + '/org/verify-delete-org',
      options
    );
  }
}
