import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { AreaViewModel } from '../models/AreaViewModel';
import { OrganizationViewModel } from '../models/OrganizationViewModel';

@Injectable({
  providedIn: 'root',
})
export class ConstantsService {
  URL: string = environment.riseUrl;

  APIURL: string = this.URL + '/rise-api/api';

  m_oActiveAOI: AreaViewModel = null;

  m_oOrganization: OrganizationViewModel = null;

  constructor() {}

  getSessionId() {
    return '';
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
}
