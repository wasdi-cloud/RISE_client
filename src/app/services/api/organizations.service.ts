import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';

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
      oInviteViewModel
    );
  }
}
