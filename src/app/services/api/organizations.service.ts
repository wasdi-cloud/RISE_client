import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {
  APIURL: string = '';

  constructor(
    private m_oHttp: HttpClient
  ) { }

  inviteUser(oInviteViewModel) {
    return this.m_oHttp.post<any>(this.APIURL + '/org/invite', oInviteViewModel);
  }
}
