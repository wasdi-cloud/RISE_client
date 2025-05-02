import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { AreaViewModel } from '../models/AreaViewModel';
import { OrganizationViewModel } from '../models/OrganizationViewModel';
import { UserViewModel } from '../models/UserViewModel';
import {UserRole} from "../models/UserRole";
import FadeoutUtils from '../shared/utilities/FadeoutUtils';

@Injectable({
  providedIn: 'root',
})
export class ConstantsService {
  URL: string = environment.riseUrl;

  APIURL: string = this.URL;

  m_oActiveAOI: AreaViewModel = null;

  m_oOrganization: OrganizationViewModel = null;

  m_oUser: UserViewModel = null;

  WMSURL: string = environment.wmsUrl;

  constructor() {}

  getSessionId() {
    return '';
  }

  getUser(): UserViewModel {
    return this.m_oUser;
  }
  getUserRole(): UserRole {
    if(this.m_oUser){
      return this.m_oUser.role;
    }
    return null;

  }

  setUser(oUser: UserViewModel) {
    this.m_oUser = oUser;
  }

  /**
   * Get the API url
   * @returns string
   */
  getAPIURL(): string {
    return this.APIURL;
  }

  setActiveArea(oArea): void {
    this.m_oActiveAOI = oArea;
  }

  getActiveAOI(): AreaViewModel {
    return this.m_oActiveAOI;
  }

  setOrganization(oOrganization: OrganizationViewModel) {
    this.m_oOrganization = oOrganization;
  }

  getOrganization() {
    return this.m_oOrganization;
  }

  resetUser() {
    this.m_oUser = null;
  }

  getWmsUrlGeoserver() {
    return this.WMSURL;
  }
}
