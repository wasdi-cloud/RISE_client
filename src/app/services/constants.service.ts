import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { AreaViewModel } from '../models/AreaViewModel';

@Injectable({
  providedIn: 'root',
})
export class ConstantsService {
  URL: string = environment.riseUrl;

  APIURL: string = this.URL + '/rise-api/api';

  m_oActiveAOI: AreaViewModel = null;

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
}
